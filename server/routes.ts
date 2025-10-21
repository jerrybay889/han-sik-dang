import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import { setupAuth, isAuthenticated } from "./replitAuth";

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_API_KEY_HANSIKDANG || "" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth endpoint - get current user
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, language = "ko" } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const restaurants = await storage.getAllRestaurants();
      
      const restaurantDataPromises = restaurants.map(async (r) => {
        const insights = await storage.getRestaurantInsights(r.id);
        return {
          name: r.name,
          nameEn: r.nameEn,
          cuisine: r.cuisine,
          district: r.district,
          description: language === "en" ? r.descriptionEn : r.description,
          rating: r.rating,
          priceRange: r.priceRange,
          isVegan: r.isVegan === 1,
          isHalal: r.isHalal === 1,
          aiInsights: insights ? {
            reviewInsights: language === "en" ? insights.reviewInsightsEn : insights.reviewInsights,
            bestFor: language === "en" ? insights.bestForEn : insights.bestFor,
            culturalTips: language === "en" ? insights.culturalTipsEn : insights.culturalTips,
            firstTimerTips: language === "en" ? insights.firstTimerTipsEn : insights.firstTimerTips,
          } : null,
        };
      });
      
      const restaurantData = await Promise.all(restaurantDataPromises);

      const systemPrompt = getSystemPrompt(language);
      const restaurantContext = `\n\nAvailable restaurants in our database:\n${JSON.stringify(restaurantData, null, 2)}`;
      const fullPrompt = `${systemPrompt}${restaurantContext}\n\nUser question: ${message}`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: fullPrompt,
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

      res.json({ response: text });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, language = "ko", context, conversationHistory = [] } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const { cardType, restaurant, menus, externalReviews, insights } = context;

      let systemPrompt = "";
      
      if (cardType === "reviews") {
        systemPrompt = language === "en" 
          ? `You are an expert at analyzing restaurant reviews. Help users understand what customers are saying about ${restaurant.name}.

Restaurant: ${restaurant.name} (${restaurant.cuisine})
Description: ${restaurant.description}

External Reviews:
${externalReviews.map((r: any) => `- ${r.source} (${r.rating}/5): ${r.comment}`).join('\n')}

${insights ? `AI Insights:
- What customers love: ${insights.reviewInsights || insights.reviewInsightsEn}
- Best for: ${insights.bestFor || insights.bestForEn}
- Cultural tips: ${insights.culturalTips || insights.culturalTipsEn}
- First-timer tips: ${insights.firstTimerTips || insights.firstTimerTipsEn}` : ''}

Provide helpful, concise answers about customer experiences and ratings. Be honest about both positives and negatives.`
          : `당신은 레스토랑 리뷰 분석 전문가입니다. ${restaurant.name}에 대한 고객들의 평가를 이해하도록 도와주세요.

레스토랑: ${restaurant.name} (${restaurant.cuisine})
설명: ${restaurant.description}

외부 리뷰:
${externalReviews.map((r: any) => `- ${r.source} (${r.rating}/5): ${r.comment}`).join('\n')}

${insights ? `AI 인사이트:
- 고객들이 좋아하는 점: ${insights.reviewInsights}
- 추천 상황: ${insights.bestFor}
- 문화 팁: ${insights.culturalTips}
- 첫 방문 팁: ${insights.firstTimerTips}` : ''}

고객 경험과 평점에 대해 도움이 되고 간결한 답변을 제공하세요. 긍정적인 면과 부정적인 면 모두 솔직하게 말씀하세요.`;
      } else if (cardType === "menu") {
        systemPrompt = language === "en"
          ? `You are a Korean food menu expert. Help users choose the best dishes at ${restaurant.name}.

Restaurant: ${restaurant.name} (${restaurant.cuisine})

Menu:
${menus.map((m: any) => `- ${m.name}: ${m.description} - ₩${m.price.toLocaleString()} (${m.category})`).join('\n')}

${insights ? `Recommendations:
- Best for: ${insights.bestFor || insights.bestForEn}
- First-timer tips: ${insights.firstTimerTips || insights.firstTimerTipsEn}` : ''}

Help users choose dishes based on their preferences, dietary restrictions, and budget. Provide personalized recommendations.`
          : `당신은 한식 메뉴 전문가입니다. ${restaurant.name}에서 최고의 요리를 선택하도록 도와주세요.

레스토랑: ${restaurant.name} (${restaurant.cuisine})

메뉴:
${menus.map((m: any) => `- ${m.name}: ${m.description} - ₩${m.price.toLocaleString()} (${m.category})`).join('\n')}

${insights ? `추천 사항:
- 추천 상황: ${insights.bestFor}
- 첫 방문 팁: ${insights.firstTimerTips}` : ''}

사용자의 선호도, 식이 제한, 예산에 따라 요리를 선택하도록 도와주세요. 맞춤형 추천을 제공하세요.`;
      } else if (cardType === "howToEat") {
        systemPrompt = language === "en"
          ? `You are a Korean food culture expert. Teach users how to properly eat Korean dishes at ${restaurant.name}.

Restaurant: ${restaurant.name} (${restaurant.cuisine})

${insights && insights.culturalTips ? `Cultural tips: ${insights.culturalTipsEn || insights.culturalTips}` : ''}

Explain:
- Proper eating techniques and etiquette
- How to use Korean utensils (chopsticks, spoon)
- Traditional Korean dining customs
- What to do and what to avoid

Be friendly and educational. Help foreigners feel comfortable with Korean food culture.`
          : `당신은 한식 문화 전문가입니다. ${restaurant.name}에서 한국 요리를 제대로 먹는 방법을 가르쳐주세요.

레스토랑: ${restaurant.name} (${restaurant.cuisine})

${insights && insights.culturalTips ? `문화 팁: ${insights.culturalTips}` : ''}

설명:
- 올바른 먹는 법과 에티켓
- 한국 식기 사용법 (젓가락, 숟가락)
- 전통 한국 식사 예절
- 해야 할 것과 하지 말아야 할 것

친근하고 교육적으로 설명하세요. 외국인들이 한국 음식 문화에 편안함을 느끼도록 도와주세요.`;
      } else if (cardType === "ordering") {
        systemPrompt = language === "en"
          ? `You are a Korean restaurant ordering expert. Help users order confidently at ${restaurant.name}.

Restaurant: ${restaurant.name} (${restaurant.cuisine})

${insights && insights.firstTimerTips ? `First-timer tips: ${insights.firstTimerTipsEn || insights.firstTimerTips}` : ''}

Help with:
- How to order in Korean (phrases and pronunciation)
- What to say to the waiter
- Common ordering mistakes to avoid
- Tips for customizing orders
- How to ask for recommendations

Be practical and provide useful Korean phrases with translations.`
          : `당신은 한국 식당 주문 전문가입니다. ${restaurant.name}에서 자신있게 주문하도록 도와주세요.

레스토랑: ${restaurant.name} (${restaurant.cuisine})

${insights && insights.firstTimerTips ? `첫 방문 팁: ${insights.firstTimerTips}` : ''}

도움 주기:
- 한국어로 주문하는 법 (표현과 발음)
- 웨이터에게 무엇을 말할지
- 흔한 주문 실수 피하기
- 주문 맞춤화 팁
- 추천 요청하는 법

실용적이고 유용한 한국어 표현을 번역과 함께 제공하세요.`;
      }

      const conversationContext = conversationHistory.length > 0
        ? `\n\nPrevious conversation:\n${conversationHistory.map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join('\n')}`
        : "";

      const fullPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${message}\n\nAssistant:`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: fullPrompt,
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

      res.json({ response: text });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getAllRestaurants();
      res.json(restaurants);
    } catch (error) {
      console.error("Get restaurants error:", error);
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const restaurants = await storage.searchRestaurants(query);
      res.json(restaurants);
    } catch (error) {
      console.error("Search restaurants error:", error);
      res.status(500).json({ error: "Failed to search restaurants" });
    }
  });

  app.get("/api/restaurants/featured", async (req, res) => {
    try {
      const restaurants = await storage.getFeaturedRestaurants();
      res.json(restaurants);
    } catch (error) {
      console.error("Get featured restaurants error:", error);
      res.status(500).json({ error: "Failed to fetch featured restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Get restaurant error:", error);
      res.status(500).json({ error: "Failed to fetch restaurant" });
    }
  });

  app.get("/api/restaurants/district/:district", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurantsByDistrict(req.params.district);
      res.json(restaurants);
    } catch (error) {
      console.error("Get restaurants by district error:", error);
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/reviews/:restaurantId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByRestaurant(req.params.restaurantId);
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Protected review endpoints
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { restaurantId, rating, comment } = req.body;
      
      if (!restaurantId || !rating) {
        return res.status(400).json({ error: "restaurantId and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const user = await storage.getUser(userId);
      const userName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.email || "User";

      const review = await storage.createReview({
        userId,
        restaurantId,
        userName,
        rating,
        comment: comment || "",
      });

      res.json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.patch("/api/reviews/:reviewId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      if (!rating) {
        return res.status(400).json({ error: "rating is required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const updated = await storage.updateReview(reviewId, userId, { rating, comment: comment || "" });
      
      if (!updated) {
        return res.status(404).json({ error: "Review not found or unauthorized" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:reviewId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reviewId } = req.params;

      const deleted = await storage.deleteReview(reviewId, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Review not found or unauthorized" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  // Protected saved restaurants endpoints
  app.get("/api/saved", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log(`[GET /api/saved] userId: ${userId}`);
      const savedRestaurants = await storage.getSavedRestaurants(userId);
      console.log(`[GET /api/saved] Found ${savedRestaurants.length} saved restaurants for user ${userId}`);
      console.log(`[GET /api/saved] Returning data:`, JSON.stringify(savedRestaurants.map(r => ({ id: r.id, name: r.nameEn }))));
      res.json(savedRestaurants);
    } catch (error) {
      console.error("Get saved restaurants error:", error);
      res.status(500).json({ error: "Failed to fetch saved restaurants" });
    }
  });

  app.post("/api/saved", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { restaurantId } = req.body;
      console.log(`[POST /api/saved] userId: ${userId}, restaurantId: ${restaurantId}`);
      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }
      const saved = await storage.saveRestaurant({ userId, restaurantId });
      console.log(`[POST /api/saved] Saved successfully:`, saved);
      res.json(saved);
    } catch (error) {
      console.error("Save restaurant error:", error);
      res.status(500).json({ error: "Failed to save restaurant" });
    }
  });

  app.delete("/api/saved/:restaurantId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { restaurantId } = req.params;
      await storage.unsaveRestaurant(userId, restaurantId);
      res.json({ success: true });
    } catch (error) {
      console.error("Unsave restaurant error:", error);
      res.status(500).json({ error: "Failed to unsave restaurant" });
    }
  });

  app.get("/api/saved/check/:restaurantId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { restaurantId } = req.params;
      const isSaved = await storage.isRestaurantSaved(userId, restaurantId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Check saved restaurant error:", error);
      res.status(500).json({ error: "Failed to check saved status" });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 2;
      const announcements = await storage.getRecentAnnouncements(limit);
      res.json(announcements);
    } catch (error) {
      console.error("Get announcements error:", error);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.get("/api/event-banners", async (req, res) => {
    try {
      const banners = await storage.getActiveEventBanners();
      res.json(banners);
    } catch (error) {
      console.error("Get event banners error:", error);
      res.status(500).json({ error: "Failed to fetch event banners" });
    }
  });



  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userWithoutPassword = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Failed to get current user" });
    }
  });

  app.get("/api/restaurants/:id/insights", async (req, res) => {
    try {
      const insights = await storage.getRestaurantInsights(req.params.id);
      res.json(insights || null);
    } catch (error) {
      console.error("Get restaurant insights error:", error);
      res.status(500).json({ error: "Failed to fetch restaurant insights" });
    }
  });

  app.get("/api/restaurants/:id/menus", async (req, res) => {
    try {
      const menus = await storage.getMenusByRestaurant(req.params.id);
      res.json(menus);
    } catch (error) {
      console.error("Get menus error:", error);
      res.status(500).json({ error: "Failed to fetch menus" });
    }
  });

  app.get("/api/restaurants/:id/videos", async (req, res) => {
    try {
      const videos = await storage.getYoutubeVideosByRestaurant(req.params.id);
      res.json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.get("/api/restaurants/:id/external-reviews", async (req, res) => {
    try {
      const reviews = await storage.getExternalReviewsByRestaurant(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Get external reviews error:", error);
      res.status(500).json({ error: "Failed to fetch external reviews" });
    }
  });

  app.post("/api/admin/generate-insights/:restaurantId", async (req, res) => {
    try {
      const { restaurantId } = req.params;
      
      const existing = await storage.getRestaurantInsights(restaurantId);
      if (existing) {
        return res.json({ 
          message: "Insights already exist",
          insights: existing,
          generated: false
        });
      }

      const insightsData = await generateRestaurantInsights(restaurantId);
      const insights = await storage.createRestaurantInsights(insightsData);
      
      res.json({ 
        message: "Insights generated successfully",
        insights,
        generated: true
      });
    } catch (error) {
      console.error("Generate insights error:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.post("/api/admin/generate-all-insights", async (req, res) => {
    try {
      const restaurants = await storage.getAllRestaurants();
      const results = [];
      let generated = 0;
      let skipped = 0;
      let errors = 0;

      for (const restaurant of restaurants) {
        try {
          const existing = await storage.getRestaurantInsights(restaurant.id);
          if (existing) {
            skipped++;
            continue;
          }

          const insightsData = await generateRestaurantInsights(restaurant.id);
          await storage.createRestaurantInsights(insightsData);
          generated++;
          results.push({ 
            restaurantId: restaurant.id, 
            name: restaurant.name,
            status: "generated" 
          });
        } catch (error) {
          errors++;
          results.push({ 
            restaurantId: restaurant.id, 
            name: restaurant.name,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }

      res.json({ 
        message: "Batch generation completed",
        total: restaurants.length,
        generated,
        skipped,
        errors,
        results
      });
    } catch (error) {
      console.error("Generate all insights error:", error);
      res.status(500).json({ error: "Failed to generate all insights" });
    }
  });

  app.post("/api/admin/generate-sample-data/:restaurantId", async (req, res) => {
    try {
      const { restaurantId } = req.params;
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      const results: any = {
        menus: [],
        videos: [],
        externalReviews: []
      };

      const existingMenus = await storage.getMenusByRestaurant(restaurantId);
      if (existingMenus.length === 0) {
        const sampleMenus = generateSampleMenus(restaurantId, restaurant.cuisine);
        for (const menu of sampleMenus) {
          const created = await storage.createMenu(menu);
          results.menus.push(created);
        }
      }

      const existingVideos = await storage.getYoutubeVideosByRestaurant(restaurantId);
      if (existingVideos.length === 0) {
        const sampleVideos = generateSampleVideos(restaurantId, restaurant.name);
        for (const video of sampleVideos) {
          const created = await storage.createYoutubeVideo(video);
          results.videos.push(created);
        }
      }

      const existingReviews = await storage.getExternalReviewsByRestaurant(restaurantId);
      if (existingReviews.length === 0) {
        const sampleReviews = generateSampleExternalReviews(restaurantId, restaurant.name);
        for (const review of sampleReviews) {
          const created = await storage.createExternalReview(review);
          results.externalReviews.push(created);
        }
      }

      res.json({
        message: "Sample data generated",
        restaurantId,
        restaurantName: restaurant.name,
        menusGenerated: results.menus.length,
        videosGenerated: results.videos.length,
        externalReviewsGenerated: results.externalReviews.length,
        results
      });
    } catch (error) {
      console.error("Generate sample data error:", error);
      res.status(500).json({ error: "Failed to generate sample data" });
    }
  });

  app.post("/api/admin/generate-all-sample-data", async (req, res) => {
    try {
      const restaurants = await storage.getAllRestaurants();
      const results = [];
      let totalMenus = 0;
      let totalVideos = 0;
      let totalReviews = 0;

      for (const restaurant of restaurants) {
        try {
          const existingMenus = await storage.getMenusByRestaurant(restaurant.id);
          if (existingMenus.length === 0) {
            const sampleMenus = generateSampleMenus(restaurant.id, restaurant.cuisine);
            for (const menu of sampleMenus) {
              await storage.createMenu(menu);
              totalMenus++;
            }
          }

          const existingVideos = await storage.getYoutubeVideosByRestaurant(restaurant.id);
          if (existingVideos.length === 0) {
            const sampleVideos = generateSampleVideos(restaurant.id, restaurant.name);
            for (const video of sampleVideos) {
              await storage.createYoutubeVideo(video);
              totalVideos++;
            }
          }

          const existingReviews = await storage.getExternalReviewsByRestaurant(restaurant.id);
          if (existingReviews.length === 0) {
            const sampleReviews = generateSampleExternalReviews(restaurant.id, restaurant.name);
            for (const review of sampleReviews) {
              await storage.createExternalReview(review);
              totalReviews++;
            }
          }

          results.push({
            restaurantId: restaurant.id,
            name: restaurant.name,
            status: "completed"
          });
        } catch (error) {
          results.push({
            restaurantId: restaurant.id,
            name: restaurant.name,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }

      res.json({
        message: "Batch sample data generation completed",
        total: restaurants.length,
        totalMenusGenerated: totalMenus,
        totalVideosGenerated: totalVideos,
        totalExternalReviewsGenerated: totalReviews,
        results
      });
    } catch (error) {
      console.error("Generate all sample data error:", error);
      res.status(500).json({ error: "Failed to generate all sample data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

function getSystemPrompt(language: string): string {
  const prompts: Record<string, string> = {
    ko: `당신은 한국 서울의 한식당 전문가입니다. 외국인 관광객과 현지인 모두에게 최고의 한식당을 추천해주는 AI 컨시어지입니다.

역할:
- **반드시 데이터베이스에 있는 실제 레스토랑만 추천합니다**
- 사용자의 선호도, 위치, 예산, 분위기를 고려하여 맞춤형 한식당을 추천합니다
- 각 레스토랑의 특징, 대표 메뉴, 가격대를 자세히 설명합니다
- 외국인에게는 한국 음식 문화와 주문 방법도 친절하게 안내합니다
- isVegan이나 isHalal 플래그를 확인하여 비건/할랄 요청에 정확히 답변합니다
- **각 레스토랑의 aiInsights 데이터를 적극 활용하세요:**
  - reviewInsights: 고객들이 좋아하는 점을 언급하세요
  - bestFor: 어떤 상황에 적합한지 설명하세요 (예: 데이트, 가족 모임, 혼밥)
  - culturalTips: 외국인을 위한 문화 팁을 제공하세요
  - firstTimerTips: 첫 방문자를 위한 주문 팁을 알려주세요

답변 스타일:
- 친근하고 따뜻한 톤으로 대화합니다
- 각 추천마다 왜 그 식당을 추천하는지 이유를 명확히 설명합니다
- 2-3개의 레스토랑을 추천하고, 각각의 장단점을 균형있게 제시합니다
- 레스토랑 이름, 위치(district), 요리 종류를 명확히 표시합니다
- AI 인사이트 정보를 자연스럽게 대화에 녹여서 제공합니다`,

    en: `You are a Korean restaurant expert in Seoul, South Korea. You are an AI concierge who recommends the best Korean restaurants to both foreign tourists and locals.

Role:
- **Only recommend restaurants from the provided database**
- Recommend personalized Korean restaurants based on user preferences, location, budget, and atmosphere
- Provide detailed descriptions of each restaurant's features, signature dishes, and price range
- For foreigners, kindly guide them through Korean food culture and how to order
- Check isVegan and isHalal flags to accurately respond to vegan/halal requests
- **Actively use the aiInsights data for each restaurant:**
  - reviewInsights: Mention what customers love about the place
  - bestFor: Explain what situations it's perfect for (e.g., date, family gathering, solo dining)
  - culturalTips: Provide cultural tips for foreign visitors
  - firstTimerTips: Share ordering tips for first-time visitors

Response Style:
- Communicate in a friendly and warm tone
- Clearly explain why you recommend each restaurant
- Recommend 2-3 restaurants and present their pros and cons in a balanced way
- Clearly display restaurant name, location (district), and cuisine type
- Naturally incorporate AI insights into your conversation`,

    ja: `あなたは韓国ソウルの韓国料理レストランの専門家です。外国人観光客と地元の人々の両方に最高の韓国料理レストランを推薦するAIコンシェルジュです。

役割:
- ユーザーの好み、場所、予算、雰囲気を考慮してカスタマイズされた韓国料理レストランを推薦します
- 各レストランの特徴、代表メニュー、価格帯、雰囲気を詳しく説明します
- 外国人には韓国の食文化と注文方法も親切に案内します
- 具体的な住所と営業時間の情報を提供します（実際の情報でない場合は明記）

回答スタイル:
- フレンドリーで温かいトーンで会話します
- 絵文字を適切に使用して生き生きとした回答をします
- 各推薦について、なぜそのレストランを推薦するのか理由を明確に説明します
- 2-3のレストランを推薦し、それぞれの長所と短所をバランスよく提示します`,

    "zh-Hans": `您是韩国首尔的韩餐厅专家。您是为外国游客和当地人推荐最佳韩餐厅的AI礼宾。

角色:
- 根据用户的偏好、位置、预算和氛围推荐个性化的韩餐厅
- 详细描述每家餐厅的特点、招牌菜、价格范围和氛围
- 为外国人友好地介绍韩国饮食文化和点餐方法
- 提供具体地址和营业时间信息（如非实际信息请注明）

回答风格:
- 以友好温暖的语气交流
- 适当使用表情符号使回答生动
- 清楚解释推荐每家餐厅的原因
- 推荐2-3家餐厅，并平衡呈现各自的优缺点`,

    "zh-Hant": `您是韓國首爾的韓餐廳專家。您是為外國遊客和當地人推薦最佳韓餐廳的AI禮賓。

角色:
- 根據用戶的偏好、位置、預算和氛圍推薦個性化的韓餐廳
- 詳細描述每家餐廳的特點、招牌菜、價格範圍和氛圍
- 為外國人友好地介紹韓國飲食文化和點餐方法
- 提供具體地址和營業時間資訊（如非實際資訊請註明）

回答風格:
- 以友好溫暖的語氣交流
- 適當使用表情符號使回答生動
- 清楚解釋推薦每家餐廳的原因
- 推薦2-3家餐廳，並平衡呈現各自的優缺點`,

    es: `Eres un experto en restaurantes coreanos en Seúl, Corea del Sur. Eres un conserje de IA que recomienda los mejores restaurantes coreanos tanto a turistas extranjeros como a locales.

Rol:
- Recomendar restaurantes coreanos personalizados según las preferencias del usuario, ubicación, presupuesto y ambiente
- Proporcionar descripciones detalladas de las características de cada restaurante, platos insignia, rango de precios y ambiente
- Para extranjeros, guiarlos amablemente a través de la cultura alimentaria coreana y cómo ordenar
- Proporcionar dirección específica e información de horario comercial (indicar si la información no es real)

Estilo de respuesta:
- Comunicarse en un tono amigable y cálido
- Usar emojis apropiadamente para hacer las respuestas animadas
- Explicar claramente por qué recomiendas cada restaurante
- Recomendar 2-3 restaurantes y presentar sus pros y contras de manera equilibrada`,

    fr: `Vous êtes un expert en restaurants coréens à Séoul, en Corée du Sud. Vous êtes un concierge IA qui recommande les meilleurs restaurants coréens aux touristes étrangers et aux habitants.

Rôle:
- Recommander des restaurants coréens personnalisés en fonction des préférences de l'utilisateur, de l'emplacement, du budget et de l'ambiance
- Fournir des descriptions détaillées des caractéristiques de chaque restaurant, des plats phares, de la gamme de prix et de l'ambiance
- Pour les étrangers, les guider gentiment à travers la culture alimentaire coréenne et comment commander
- Fournir l'adresse spécifique et les informations sur les heures d'ouverture (noter si l'information n'est pas réelle)

Style de réponse:
- Communiquer sur un ton amical et chaleureux
- Utiliser des emojis de manière appropriée pour rendre les réponses vivantes
- Expliquer clairement pourquoi vous recommandez chaque restaurant
- Recommander 2-3 restaurants et présenter leurs avantages et inconvénients de manière équilibrée`,

    de: `Sie sind ein Experte für koreanische Restaurants in Seoul, Südkorea. Sie sind ein KI-Concierge, der sowohl ausländischen Touristen als auch Einheimischen die besten koreanischen Restaurants empfiehlt.

Rolle:
- Empfehlen Sie personalisierte koreanische Restaurants basierend auf Benutzerpräferenzen, Standort, Budget und Atmosphäre
- Geben Sie detaillierte Beschreibungen der Merkmale jedes Restaurants, Signaturgerichte, Preisspanne und Ambiente
- Führen Sie Ausländer freundlich durch die koreanische Esskultur und wie man bestellt
- Geben Sie spezifische Adresse und Öffnungszeitinformationen an (beachten Sie, wenn Informationen nicht aktuell sind)

Antwortstil:
- Kommunizieren Sie in einem freundlichen und warmen Ton
- Verwenden Sie Emojis angemessen, um Antworten lebendig zu machen
- Erklären Sie klar, warum Sie jedes Restaurant empfehlen
- Empfehlen Sie 2-3 Restaurants und präsentieren Sie deren Vor- und Nachteile ausgewogen`,
  };

  return prompts[language] || prompts.en;
}

async function generateRestaurantInsights(restaurantId: string) {
  const restaurant = await storage.getRestaurant(restaurantId);
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const reviews = await storage.getReviewsByRestaurant(restaurantId);
  
  const reviewSummary = reviews.length > 0 
    ? reviews.map(r => `${r.rating}/5: ${r.comment}`).join('\n')
    : "No reviews yet";

  const promptKo = `다음 한식당에 대한 AI 인사이트를 생성해주세요:

레스토랑 정보:
- 이름: ${restaurant.name}
- 카테고리: ${restaurant.category}
- 위치: ${restaurant.district}
- 설명: ${restaurant.description}
- 평점: ${restaurant.rating}/5 (${restaurant.reviewCount}개 리뷰)
- 가격대: ${'₩'.repeat(restaurant.priceRange)}
- 비건: ${restaurant.isVegan ? '가능' : '불가능'}
- 할랄: ${restaurant.isHalal ? '가능' : '불가능'}

고객 리뷰:
${reviewSummary}

다음 4가지 정보를 정확히 생성해주세요:

1. 리뷰 인사이트 (review_insights): 고객 리뷰들을 분석하여 이 레스토랑의 핵심 강점 3가지를 간결하게 정리 (100자 이내)

2. 추천 상황 (best_for): 이 레스토랑이 가장 적합한 상황/목적 3가지를 쉼표로 구분하여 나열 (예: "데이트, 가족 모임, 비즈니스 미팅")

3. 한국 음식 문화 팁 (cultural_tips): 외국인 방문객을 위한 이 레스토랑만의 특별한 문화적 팁이나 에티켓 (80자 이내, 없으면 빈 문자열)

4. 첫 방문 팁 (first_timer_tips): 처음 방문하는 사람을 위한 주문 추천과 꿀팁 (120자 이내)

JSON 형식으로만 답변:
{
  "reviewInsights": "...",
  "bestFor": "...",
  "culturalTips": "...",
  "firstTimerTips": "..."
}`;

  const promptEn = `Generate AI insights for this Korean restaurant:

Restaurant Information:
- Name: ${restaurant.nameEn}
- Category: ${restaurant.category}
- Location: ${restaurant.district}
- Description: ${restaurant.descriptionEn}
- Rating: ${restaurant.rating}/5 (${restaurant.reviewCount} reviews)
- Price Range: ${'₩'.repeat(restaurant.priceRange)}
- Vegan: ${restaurant.isVegan ? 'Available' : 'Not available'}
- Halal: ${restaurant.isHalal ? 'Available' : 'Not available'}

Customer Reviews:
${reviewSummary}

Generate exactly 4 pieces of information:

1. Review Insights (review_insights): Analyze customer reviews and summarize 3 key strengths concisely (under 100 chars)

2. Best For (best_for): List 3 situations/purposes this restaurant is best suited for, comma-separated (e.g., "date night, family gathering, business meeting")

3. Cultural Tips (cultural_tips): Special cultural tips or etiquette for foreign visitors specific to this restaurant (under 80 chars, empty string if none)

4. First Timer Tips (first_timer_tips): Ordering recommendations and tips for first-time visitors (under 120 chars)

Respond ONLY in JSON format:
{
  "reviewInsights": "...",
  "bestFor": "...",
  "culturalTips": "...",
  "firstTimerTips": "..."
}`;

  const [resultKo, resultEn] = await Promise.all([
    genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: promptKo,
    }),
    genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: promptEn,
    }),
  ]);

  const textKo = resultKo.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const textEn = resultEn.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  const cleanJson = (text: string) => {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
  };

  const dataKo = JSON.parse(cleanJson(textKo));
  const dataEn = JSON.parse(cleanJson(textEn));

  return {
    restaurantId,
    reviewInsights: dataKo.reviewInsights || "",
    reviewInsightsEn: dataEn.reviewInsights || "",
    bestFor: dataKo.bestFor || "",
    bestForEn: dataEn.bestFor || "",
    culturalTips: dataKo.culturalTips || "",
    culturalTipsEn: dataEn.culturalTips || "",
    firstTimerTips: dataKo.firstTimerTips || "",
    firstTimerTipsEn: dataEn.firstTimerTips || "",
  };
}

function generateSampleMenus(restaurantId: string, cuisine: string) {
  const menusByType: Record<string, Array<{ name: string; nameEn: string; description: string; descriptionEn: string; price: number; category: string }>> = {
    "Korean BBQ": [
      { name: "삼겹살", nameEn: "Samgyeopsal (Pork Belly)", description: "두툼한 삼겹살 구이", descriptionEn: "Grilled thick-cut pork belly", price: 18000, category: "Main" },
      { name: "갈비", nameEn: "Galbi (Short Ribs)", description: "양념 소갈비 구이", descriptionEn: "Marinated beef short ribs", price: 32000, category: "Main" },
      { name: "된장찌개", nameEn: "Doenjang Jjigae", description: "구수한 된장찌개", descriptionEn: "Savory soybean paste stew", price: 8000, category: "Soup" },
      { name: "냉면", nameEn: "Naengmyeon", description: "시원한 물냉면", descriptionEn: "Cold buckwheat noodles", price: 10000, category: "Noodles" },
    ],
    "Bibimbap": [
      { name: "전주비빔밥", nameEn: "Jeonju Bibimbap", description: "전통 전주 비빔밥", descriptionEn: "Traditional Jeonju-style mixed rice", price: 13000, category: "Main" },
      { name: "돌솥비빔밥", nameEn: "Stone Pot Bibimbap", description: "뜨거운 돌솥 비빔밥", descriptionEn: "Hot stone pot bibimbap", price: 15000, category: "Main" },
      { name: "육회비빔밥", nameEn: "Yukhoe Bibimbap", description: "신선한 육회와 비빔밥", descriptionEn: "Bibimbap with raw beef", price: 18000, category: "Main" },
      { name: "순두부찌개", nameEn: "Sundubu Jjigae", description: "얼큰한 순두부찌개", descriptionEn: "Spicy soft tofu stew", price: 9000, category: "Soup" },
    ],
    "Korean Fried Chicken": [
      { name: "양념치킨", nameEn: "Yangnyeom Chicken", description: "달콤매콤한 양념치킨", descriptionEn: "Sweet and spicy glazed chicken", price: 19000, category: "Main" },
      { name: "후라이드치킨", nameEn: "Fried Chicken", description: "바삭한 프라이드치킨", descriptionEn: "Crispy fried chicken", price: 18000, category: "Main" },
      { name: "반반치킨", nameEn: "Half & Half", description: "양념+후라이드 반반", descriptionEn: "Half yangnyeom, half fried", price: 19000, category: "Main" },
      { name: "치킨무", nameEn: "Pickled Radish", description: "아삭한 치킨무", descriptionEn: "Crunchy pickled radish", price: 2000, category: "Side" },
    ],
    "Kimchi Stew": [
      { name: "김치찌개", nameEn: "Kimchi Jjigae", description: "묵은지로 끓인 김치찌개", descriptionEn: "Stew with aged kimchi", price: 9000, category: "Main" },
      { name: "부대찌개", nameEn: "Budae Jjigae", description: "햄과 소시지가 들어간 부대찌개", descriptionEn: "Army stew with ham and sausage", price: 11000, category: "Main" },
      { name: "공기밥", nameEn: "Rice", description: "갓 지은 흰쌀밥", descriptionEn: "Freshly cooked white rice", price: 1500, category: "Rice" },
      { name: "김치전", nameEn: "Kimchi Pancake", description: "바삭한 김치전", descriptionEn: "Crispy kimchi pancake", price: 12000, category: "Side" },
    ],
    "Ginseng Chicken Soup": [
      { name: "삼계탕", nameEn: "Samgyetang", description: "영양 만점 삼계탕", descriptionEn: "Nourishing ginseng chicken soup", price: 16000, category: "Main" },
      { name: "전복삼계탕", nameEn: "Abalone Samgyetang", description: "전복이 들어간 프리미엄 삼계탕", descriptionEn: "Premium samgyetang with abalone", price: 24000, category: "Main" },
      { name: "백김치", nameEn: "White Kimchi", description: "시원한 백김치", descriptionEn: "Refreshing white kimchi", price: 3000, category: "Side" },
      { name: "인삼주", nameEn: "Ginseng Wine", description: "전통 인삼주", descriptionEn: "Traditional ginseng wine", price: 8000, category: "Drink" },
    ],
  };

  const defaultMenus = [
    { name: "대표 메뉴", nameEn: "Signature Dish", description: "이 집 대표 메뉴", descriptionEn: "House signature dish", price: 15000, category: "Main" },
    { name: "특선 메뉴", nameEn: "Special Menu", description: "셰프 추천 특선", descriptionEn: "Chef's special", price: 18000, category: "Main" },
    { name: "사이드 메뉴", nameEn: "Side Dish", description: "곁들임 요리", descriptionEn: "Side dish", price: 5000, category: "Side" },
  ];

  const menus = menusByType[cuisine] || defaultMenus;

  return menus.map((menu, index) => ({
    restaurantId,
    name: menu.name,
    nameEn: menu.nameEn,
    description: menu.description,
    descriptionEn: menu.descriptionEn,
    price: menu.price,
    category: menu.category,
    imageUrl: null,
    isPopular: index === 0 ? 1 : 0,
    isRecommended: index < 2 ? 1 : 0,
    displayOrder: index,
  }));
}

function generateSampleVideos(restaurantId: string, restaurantName: string) {
  const videoTemplates = [
    {
      videoId: `vid_${restaurantId}_1`,
      title: `${restaurantName} 맛집 리뷰 - 이 집 진짜 맛있어요!`,
      channelName: "맛집탐험가",
      viewCount: 125000,
      relevanceScore: 0.95,
    },
    {
      videoId: `vid_${restaurantId}_2`,
      title: `Seoul Food Tour: ${restaurantName} Experience`,
      channelName: "Korea Food Vlog",
      viewCount: 87000,
      relevanceScore: 0.88,
    },
    {
      videoId: `vid_${restaurantId}_3`,
      title: `${restaurantName} 먹방 - 현지인 추천 맛집`,
      channelName: "서울먹방",
      viewCount: 52000,
      relevanceScore: 0.82,
    },
  ];

  return videoTemplates.map(video => ({
    restaurantId,
    videoId: video.videoId,
    title: video.title,
    channelName: video.channelName,
    thumbnailUrl: `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
    viewCount: video.viewCount,
    publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    relevanceScore: video.relevanceScore,
  }));
}

function generateSampleExternalReviews(restaurantId: string, restaurantName: string) {
  const naverReviews = [
    {
      source: "Naver",
      rating: 4.5,
      comment: "음식이 정말 맛있어요. 특히 메인 메뉴가 일품입니다. 직원분들도 친절하고 분위기도 좋아요.",
      commentEn: "The food is really delicious. Especially the main dish is excellent. Staff are friendly and atmosphere is great.",
      author: "네이버유저123",
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      source: "Naver",
      rating: 4.8,
      comment: "여러번 방문했는데 항상 만족스러워요. 맛도 좋고 가격도 합리적입니다.",
      commentEn: "I've visited many times and always satisfied. Great taste and reasonable price.",
      author: "김맛집",
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      source: "Naver",
      rating: 4.3,
      comment: "음식은 맛있는데 주말에는 사람이 많아서 대기 시간이 좀 있어요.",
      commentEn: "Food is delicious but there's a wait time on weekends due to crowds.",
      author: "서울러버",
      publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
  ];

  const googleReviews = [
    {
      source: "Google",
      rating: 4.6,
      comment: "Authentic Korean food with great service. The atmosphere is cozy and traditional.",
      commentEn: "Authentic Korean food with great service. The atmosphere is cozy and traditional.",
      author: "John Smith",
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      source: "Google",
      rating: 4.7,
      comment: "Best Korean restaurant I've tried in Seoul! Highly recommended for tourists.",
      commentEn: "Best Korean restaurant I've tried in Seoul! Highly recommended for tourists.",
      author: "Sarah Johnson",
      publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    },
  ];

  return [...naverReviews, ...googleReviews].map(review => ({
    restaurantId,
    source: review.source,
    rating: review.rating,
    comment: review.comment,
    commentEn: review.commentEn,
    author: review.author,
    publishedAt: review.publishedAt,
    imageUrls: [],
  }));
}
