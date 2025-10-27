import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { logger, ErrorMessages } from "./logger";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploaded_files");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Config endpoint - Get public configuration
  app.get('/api/config', (req, res) => {
    res.json({
      naverMapsClientId: process.env.NAVER_MAPS_CLIENT_ID || ''
    });
  });

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
      logger.error("Error fetching user", { userId: req.user?.claims?.sub, error });
      res.status(500).json({ message: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Debug endpoint - Make current user a restaurant owner
  app.post('/api/debug/make-me-owner', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get a random restaurant (or the first one)
      const restaurants = await storage.getAllRestaurants();
      if (restaurants.length === 0) {
        return res.status(404).json({ message: "No restaurants found" });
      }

      // Use the first restaurant for testing
      const restaurant = restaurants[0];

      // Check if already an owner
      const existingOwnership = await storage.getRestaurantsByOwner(userId);
      if (existingOwnership.length > 0) {
        return res.json({ 
          message: "You are already an owner!", 
          restaurants: existingOwnership.map((r: any) => ({ id: r.id, name: r.name, nameEn: r.nameEn }))
        });
      }

      // Add as owner
      await storage.createRestaurantOwner({
        userId,
        restaurantId: restaurant.id,
        role: "owner",
      });

      res.json({ 
        message: "Successfully made you an owner!",
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          nameEn: restaurant.nameEn
        }
      });
    } catch (error) {
      logger.error("Error making user an owner", { userId: req.user?.claims?.sub, error });
      res.status(500).json({ message: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Debug endpoint - Make current user an admin
  app.post('/api/debug/make-me-admin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if already admin
      if (user.isAdmin === 1) {
        return res.json({ 
          message: "You are already an admin!",
          user: {
            email: user.email,
            isAdmin: true
          }
        });
      }

      // Update user to admin
      await storage.updateUserAdminStatus(userId, 1);

      res.json({ 
        message: "Successfully made you an admin!",
        user: {
          email: user.email,
          isAdmin: true
        }
      });
    } catch (error) {
      logger.error("Error making user an admin", { userId: req.user?.claims?.sub, error });
      res.status(500).json({ message: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, language = "ko", location = null, area = null } = req.body;

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

      // Build context based on selected location and area
      let locationContext = "";
      if (location === "nearby") {
        locationContext = language === "en" 
          ? "\n\nIMPORTANT: The user is looking for restaurants NEARBY their current location. Focus on proximity and accessibility."
          : "\n\n중요: 사용자는 현재 위치 근처의 레스토랑을 찾고 있습니다. 접근성과 근접성에 초점을 맞춰주세요.";
      } else if (location === "other" && area) {
        locationContext = language === "en"
          ? `\n\nIMPORTANT: The user wants to explore restaurants specifically in the ${area} area. Only recommend restaurants in ${area}. Filter by district matching "${area}".`
          : `\n\n중요: 사용자는 ${area} 지역의 레스토랑을 탐색하고 싶어합니다. ${area}에 있는 레스토랑만 추천해주세요. "${area}"에 해당하는 구역의 레스토랑으로 필터링하세요.`;
      }

      const systemPrompt = getSystemPrompt(language);
      const restaurantContext = `\n\nAvailable restaurants in our database:\n${JSON.stringify(restaurantData, null, 2)}`;
      const fullPrompt = `${systemPrompt}${restaurantContext}${locationContext}\n\nUser question: ${message}`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: fullPrompt,
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

      res.json({ response: text });
    } catch (error) {
      logger.error("AI chat error", { error, path: "/api/ai/chat" });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("AI chat error", { error, path: "/api/ai-chat" });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getAllRestaurants();
      res.json(restaurants);
    } catch (error) {
      logger.error("Get restaurants error", { error, path: "/api/restaurants" });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Search restaurants error", { error, path: "/api/restaurants/search", query: req.params.query });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/restaurants/featured", async (req, res) => {
    try {
      const restaurants = await storage.getFeaturedRestaurants();
      res.json(restaurants);
    } catch (error) {
      logger.error("Get featured restaurants error", { error, path: "/api/restaurants/featured" });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Get restaurant error", { error, path: "/api/restaurants/:id", restaurantId: req.params.id });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/restaurants/district/:district", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurantsByDistrict(req.params.district);
      res.json(restaurants);
    } catch (error) {
      logger.error("Get restaurants by district error", { error, path: "/api/restaurants/district", district: req.params.district });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/reviews/:restaurantId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByRestaurant(req.params.restaurantId);
      res.json(reviews);
    } catch (error) {
      logger.error("Get reviews error", { error, path: "/api/reviews/:restaurantId", restaurantId: req.params.restaurantId });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Create review error", { error, path: "/api/reviews", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Update review error", { error, path: "/api/reviews/:reviewId", reviewId: req.params.reviewId, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Delete review error", { error, path: "/api/reviews/:reviewId", reviewId: req.params.reviewId, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Get saved restaurants error", { error, path: "/api/saved", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Save restaurant error", { error, path: "/api/saved", userId: req.user?.claims?.sub, restaurantId: req.body.restaurantId });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.delete("/api/saved/:restaurantId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { restaurantId } = req.params;
      await storage.unsaveRestaurant(userId, restaurantId);
      res.json({ success: true });
    } catch (error) {
      logger.error("Unsave restaurant error", { error, path: "/api/saved/:restaurantId", userId: req.user?.claims?.sub, restaurantId: req.params.restaurantId });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/saved/check/:restaurantId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { restaurantId } = req.params;
      const isSaved = await storage.isRestaurantSaved(userId, restaurantId);
      res.json({ isSaved });
    } catch (error) {
      logger.error("Check saved restaurant error", { error, path: "/api/saved/check/:restaurantId", userId: req.user?.claims?.sub, restaurantId: req.params.restaurantId });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 2;
      const announcements = await storage.getRecentAnnouncements(limit);
      res.json(announcements);
    } catch (error) {
      logger.error("Get announcements error", { error, path: "/api/announcements" });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/event-banners", async (req, res) => {
    try {
      const banners = await storage.getActiveEventBanners();
      res.json(banners);
    } catch (error) {
      logger.error("Get event banners error", { error, path: "/api/event-banners" });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });



  app.get("/api/auth/me", async (req, res) => {
    const userId = req.query.userId as string | undefined;
    try {
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
      logger.error("Get current user error", { error, path: "/api/auth/me", userId });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/restaurants/:id/insights", async (req, res) => {
    try {
      const insights = await storage.getRestaurantInsights(req.params.id);
      res.json(insights || null);
    } catch (error) {
      logger.error("Get restaurant insights error", { error, path: "/api/restaurants/:id/insights", restaurantId: req.params.id });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/restaurants/:id/menus", async (req, res) => {
    try {
      const menus = await storage.getMenusByRestaurant(req.params.id);
      res.json(menus);
    } catch (error) {
      logger.error("Get menus error", { error, path: "/api/restaurants/:id/menus", restaurantId: req.params.id });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/restaurants/:id/videos", async (req, res) => {
    try {
      const videos = await storage.getYoutubeVideosByRestaurant(req.params.id);
      res.json(videos);
    } catch (error) {
      logger.error("Get videos error", { error, path: "/api/restaurants/:id/videos", restaurantId: req.params.id });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/restaurants/:id/external-reviews", async (req, res) => {
    try {
      const reviews = await storage.getExternalReviewsByRestaurant(req.params.id);
      res.json(reviews);
    } catch (error) {
      logger.error("Get external reviews error", { error, path: "/api/restaurants/:id/external-reviews", restaurantId: req.params.id });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Generate insights error", { error, path: "/api/admin/generate-insights/:restaurantId", restaurantId: req.params.restaurantId });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Generate all insights error", { error, path: "/api/admin/generate-all-insights" });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Generate sample data error", { error, path: "/api/admin/generate-sample-data/:restaurantId", restaurantId: req.params.restaurantId });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
      logger.error("Generate all sample data error", { error, path: "/api/admin/generate-all-sample-data" });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Restaurant Dashboard API Routes

  // Get restaurants owned by current user
  app.get("/api/my-restaurants", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const restaurants = await storage.getRestaurantsByOwner(userId);
      res.json(restaurants);
    } catch (error) {
      logger.error("Get my restaurants error", { error, path: "/api/my-restaurants", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Check if user is owner of specific restaurant
  app.get("/api/restaurants/:id/is-owner", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const isOwner = await storage.isRestaurantOwner(userId, id);
      res.json({ isOwner });
    } catch (error) {
      logger.error("Check ownership error", { error, path: "/api/restaurants/:id/is-owner", userId: req.user?.claims?.sub, restaurantId: req.params.id });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Get dashboard statistics for restaurant
  app.get("/api/restaurants/:id/dashboard-stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const isOwner = await storage.isRestaurantOwner(userId, id);
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
      }

      const stats = await storage.getRestaurantDashboardStats(id);
      res.json(stats);
    } catch (error) {
      logger.error("Get dashboard stats error", { error, path: "/api/restaurants/:id/dashboard-stats", userId: req.user?.claims?.sub, restaurantId: req.params.id });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Review Response Routes

  // Get response for a specific review
  app.get("/api/reviews/:reviewId/response", async (req, res) => {
    try {
      const { reviewId } = req.params;
      const response = await storage.getResponseByReviewId(reviewId);
      res.json(response || null);
    } catch (error) {
      logger.error("Get review response error", { error, path: "/api/reviews/:reviewId/response", reviewId: req.params.reviewId });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Create review response
  app.post("/api/review-responses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { reviewId, restaurantId, response } = req.body;
      
      if (!reviewId || !restaurantId || !response) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify ownership
      const isOwner = await storage.isRestaurantOwner(userId, restaurantId);
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
      }

      // Check if response already exists
      const existingResponse = await storage.getResponseByReviewId(reviewId);
      if (existingResponse) {
        return res.status(409).json({ error: "Response already exists for this review" });
      }

      const newResponse = await storage.createReviewResponse({
        reviewId,
        restaurantId,
        userId,
        response,
      });
      
      res.status(201).json(newResponse);
    } catch (error) {
      logger.error("Create review response error", { error, path: "/api/review-responses", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update review response
  app.patch("/api/review-responses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { restaurantId, response } = req.body;

      if (!restaurantId || !response) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify ownership
      const isOwner = await storage.isRestaurantOwner(userId, restaurantId);
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
      }

      const updatedResponse = await storage.updateReviewResponse(id, userId, restaurantId, response);
      if (!updatedResponse) {
        return res.status(404).json({ error: "Review response not found or unauthorized" });
      }

      res.json(updatedResponse);
    } catch (error) {
      logger.error("Update review response error", { error, path: "/api/review-responses/:id", responseId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Delete review response
  app.delete("/api/review-responses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { restaurantId } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Missing restaurantId" });
      }

      // Verify ownership
      const isOwner = await storage.isRestaurantOwner(userId, restaurantId);
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
      }

      const deleted = await storage.deleteReviewResponse(id, userId, restaurantId);
      if (!deleted) {
        return res.status(404).json({ error: "Review response not found or unauthorized" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Delete review response error", { error, path: "/api/review-responses/:id", responseId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Get reviews with responses for restaurant owner
  app.get("/api/restaurants/:id/reviews-with-responses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      
      // Verify ownership
      const isOwner = await storage.isRestaurantOwner(userId, id);
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
      }

      // Get reviews and responses
      const reviews = await storage.getReviewsByRestaurant(id);
      const responses = await storage.getResponsesByRestaurant(id);

      // Combine reviews with their responses
      const reviewsWithResponses = reviews.map(review => {
        const response = responses.find(r => r.reviewId === review.id);
        return {
          ...review,
          response: response || null,
        };
      });

      res.json(reviewsWithResponses);
    } catch (error) {
      logger.error("Get reviews with responses error", { error, path: "/api/restaurants/:id/reviews-with-responses", restaurantId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Promotion Routes

  // Get all promotions for a restaurant (public)
  app.get("/api/restaurants/:id/promotions", async (req, res) => {
    try {
      const { id } = req.params;
      const promotions = await storage.getActivePromotionsByRestaurant(id);
      res.json(promotions);
    } catch (error) {
      logger.error("Get promotions error", { error, path: "/api/restaurants/:id/promotions", restaurantId: req.params.id });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Get all promotions for management (owner only)
  app.get("/api/restaurants/:id/all-promotions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const isOwner = await storage.isRestaurantOwner(userId, id);
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
      }

      const promotions = await storage.getPromotionsByRestaurant(id);
      res.json(promotions);
    } catch (error) {
      logger.error("Get all promotions error", { error, path: "/api/restaurants/:id/all-promotions", restaurantId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Create promotion
  app.post("/api/promotions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { restaurantId, title, titleEn, description, descriptionEn, discountType, discountValue, startDate, endDate } = req.body;

      if (!restaurantId || !title || !titleEn || !description || !descriptionEn || !discountType || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify ownership
      const isOwner = await storage.isRestaurantOwner(userId, restaurantId);
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
      }

      const promotion = await storage.createPromotion({
        restaurantId,
        title,
        titleEn,
        description,
        descriptionEn,
        discountType,
        discountValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: 1,
      });

      res.status(201).json(promotion);
    } catch (error) {
      logger.error("Create promotion error", { error, path: "/api/promotions", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update promotion
  app.patch("/api/promotions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { restaurantId, ...updateData } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Missing restaurantId" });
      }

      // Convert dates if present
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate);
      }

      const updatedPromotion = await storage.updatePromotion(id, userId, restaurantId, updateData);
      if (!updatedPromotion) {
        return res.status(404).json({ error: "Promotion not found or unauthorized" });
      }

      res.json(updatedPromotion);
    } catch (error) {
      logger.error("Update promotion error", { error, path: "/api/promotions/:id", promotionId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Delete promotion
  app.delete("/api/promotions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { restaurantId } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Missing restaurantId" });
      }

      const deleted = await storage.deletePromotion(id, userId, restaurantId);
      if (!deleted) {
        return res.status(404).json({ error: "Promotion not found or unauthorized" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Delete promotion error", { error, path: "/api/promotions/:id", promotionId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // ===== Restaurant Images Routes =====
  
  // Get all images for a restaurant (public)
  app.get("/api/restaurants/:id/images", async (req, res) => {
    try {
      const { id } = req.params;
      const images = await storage.getRestaurantImages(id);
      res.json(images);
    } catch (error) {
      logger.error("Get restaurant images error", { error, path: "/api/restaurants/:id/images", restaurantId: req.params.id });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Add image to restaurant (owner only)
  app.post("/api/restaurants/:id/images", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { imageUrl, displayOrder } = req.body;

      // Verify ownership
      const isOwner = await storage.isRestaurantOwner(userId, id);
      if (!isOwner) {
        return res.status(403).json({ error: "You don't have permission to manage this restaurant" });
      }

      if (!imageUrl) {
        return res.status(400).json({ error: "Missing imageUrl" });
      }

      const image = await storage.createRestaurantImage({
        restaurantId: id,
        imageUrl,
        displayOrder: displayOrder || 0,
      });

      res.status(201).json(image);
    } catch (error) {
      logger.error("Create restaurant image error", { error, path: "/api/restaurants/:id/images", restaurantId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Delete restaurant image (owner only)
  app.delete("/api/restaurant-images/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { restaurantId } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Missing restaurantId" });
      }

      const deleted = await storage.deleteRestaurantImage(id, userId, restaurantId);
      if (!deleted) {
        return res.status(404).json({ error: "Image not found or unauthorized" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Delete restaurant image error", { error, path: "/api/restaurant-images/:id", imageId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Upload image file (owner only)
  app.post("/api/restaurants/:id/upload-image", isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      
      // Verify ownership
      const isOwner = await storage.isRestaurantOwner(userId, id);
      if (!isOwner) {
        return res.status(403).json({ error: "You don't have permission to manage this restaurant" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Create image URL - use relative path for uploaded file
      const imageUrl = `/uploaded_files/${req.file.filename}`;
      const displayOrder = parseInt(req.body.displayOrder) || 0;

      const image = await storage.createRestaurantImage({
        restaurantId: id,
        imageUrl,
        displayOrder,
      });

      res.status(201).json(image);
    } catch (error) {
      logger.error("Upload image error", { error, path: "/api/restaurants/:id/upload-image", restaurantId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // ===== Menu Routes =====
  
  // Create menu item (owner only)
  app.post("/api/menus", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { restaurantId, name, nameEn, description, descriptionEn, price, category, imageUrl, isPopular, isRecommended, displayOrder } = req.body;

      if (!restaurantId || !name || !nameEn || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify ownership
      const isOwner = await storage.isRestaurantOwner(userId, restaurantId);
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
      }

      const menu = await storage.createMenu({
        restaurantId,
        name,
        nameEn,
        description: description || null,
        descriptionEn: descriptionEn || null,
        price: parseInt(price),
        category: category || null,
        imageUrl: imageUrl || null,
        isPopular: isPopular || 0,
        isRecommended: isRecommended || 0,
        displayOrder: displayOrder || 0,
      });

      res.status(201).json(menu);
    } catch (error) {
      logger.error("Create menu error", { error, path: "/api/menus", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update menu item (owner only)
  app.patch("/api/menus/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { restaurantId, ...updateData } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Missing restaurantId" });
      }

      // Convert price to integer if present
      if (updateData.price) {
        updateData.price = parseInt(updateData.price);
      }

      const updatedMenu = await storage.updateMenu(id, userId, restaurantId, updateData);
      if (!updatedMenu) {
        return res.status(404).json({ error: "Menu not found or unauthorized" });
      }

      res.json(updatedMenu);
    } catch (error) {
      logger.error("Update menu error", { error, path: "/api/menus/:id", menuId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Delete menu item (owner only)
  app.delete("/api/menus/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { restaurantId } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Missing restaurantId" });
      }

      const deleted = await storage.deleteMenu(id, userId, restaurantId);
      if (!deleted) {
        return res.status(404).json({ error: "Menu not found or unauthorized" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Delete menu error", { error, path: "/api/menus/:id", menuId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // ===== AI Business Analysis Routes =====
  
  // Get AI business insights for restaurant (owner only)
  app.get("/api/restaurants/:id/ai-analysis", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      
      // Verify ownership
      const isOwner = await storage.isRestaurantOwner(userId, id);
      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
      }

      // Get restaurant data
      const restaurant = await storage.getRestaurant(id);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      // Get reviews
      const reviews = await storage.getReviewsByRestaurant(id);
      
      // Get nearby restaurants in same district for competitor analysis
      const competitors = await storage.getRestaurantsByDistrict(restaurant.district);
      const topCompetitors = competitors
        .filter(c => c.id !== id && c.cuisine === restaurant.cuisine)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);

      // Generate AI analysis using Gemini
      const analysisPrompt = `You are a restaurant business consultant AI. Analyze this Korean restaurant and provide detailed insights in both Korean and English.

Restaurant: ${restaurant.name} (${restaurant.nameEn})
Category: ${restaurant.category}
Cuisine: ${restaurant.cuisine}
District: ${restaurant.district}
Current Rating: ${restaurant.rating}/5 (${restaurant.reviewCount} reviews)
Price Range: ${restaurant.priceRange}

Customer Reviews (${reviews.length} total):
${reviews.slice(0, 10).map(r => `- Rating: ${r.rating}/5, Comment: ${r.comment}`).join('\n')}

Top Competitors in ${restaurant.district}:
${topCompetitors.map(c => `- ${c.name}: ${c.rating}/5 (${c.reviewCount} reviews, ${c.cuisine})`).join('\n')}

Provide a comprehensive analysis in the following JSON format:
{
  "businessAnalysis": {
    "ko": "현재 비즈니스 상태를 자세히 분석 (강점, 약점, 기회 요인 포함)",
    "en": "Detailed analysis of current business status (including strengths, weaknesses, opportunities)"
  },
  "competitorAnalysis": {
    "ko": "경쟁업체 분석 및 시장 포지셔닝",
    "en": "Competitor analysis and market positioning"
  },
  "strategicRecommendations": {
    "ko": "구체적인 전략 제안 (프로모션 아이디어, 메뉴 개선, 마케팅 전략 등)",
    "en": "Specific strategic recommendations (promotion ideas, menu improvements, marketing strategies)"
  }
}`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: analysisPrompt,
      });
      const response = result.text || "";
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      res.json({
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          nameEn: restaurant.nameEn,
          rating: restaurant.rating,
          reviewCount: restaurant.reviewCount,
        },
        analysis,
        competitors: topCompetitors.map(c => ({
          name: c.name,
          nameEn: c.nameEn,
          rating: c.rating,
          reviewCount: c.reviewCount,
        })),
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("AI analysis error", { error, path: "/api/restaurants/:id/ai-analysis", restaurantId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // ==================== ADMIN ROUTES ====================
  
  // Admin Dashboard Statistics
  app.get("/api/admin/dashboard/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      logger.error("Failed to fetch admin dashboard stats", { 
        userId: req.user?.id, 
        path: req.path 
      }, error as Error);
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Get all users
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      logger.error("Failed to fetch all users", { 
        userId: req.user?.id, 
        path: req.path 
      }, error as Error);
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update user admin status
  app.patch("/api/admin/users/:id/admin-status", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body;

      if (typeof isAdmin !== "number" || (isAdmin !== 0 && isAdmin !== 1)) {
        return res.status(400).json({ error: ErrorMessages.BAD_REQUEST });
      }

      const user = await storage.updateUserAdminStatus(id, isAdmin);
      if (!user) {
        return res.status(404).json({ error: ErrorMessages.NOT_FOUND });
      }

      res.json(user);
    } catch (error) {
      logger.error("Failed to update user admin status", { 
        userId: req.user?.id, 
        targetUserId: req.params.id,
        path: req.path 
      }, error as Error);
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Get user details (admin)
  app.get("/api/admin/users/:id/details", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const details = await storage.getUserDetails(id);
      
      if (!details) {
        return res.status(404).json({ error: ErrorMessages.NOT_FOUND });
      }

      res.json(details);
    } catch (error) {
      logger.error("Failed to fetch user details", { 
        userId: req.user?.id, 
        targetUserId: req.params.id,
        path: req.path 
      }, error as Error);
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update user tier (admin)
  app.patch("/api/admin/users/:id/tier", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { tier } = req.body;

      const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
      if (!tier || !validTiers.includes(tier.toLowerCase())) {
        return res.status(400).json({ error: "Invalid tier. Must be one of: bronze, silver, gold, platinum" });
      }

      const user = await storage.updateUserTier(id, tier.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      logger.error("Error updating user tier", { error, path: "/api/admin/users/:id/tier", targetUserId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update user (admin)
  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { tier, language, ssoProvider, region } = req.body;

      const updates: any = {};
      
      if (tier) {
        const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
        if (!validTiers.includes(tier.toLowerCase())) {
          return res.status(400).json({ error: "Invalid tier. Must be one of: bronze, silver, gold, platinum" });
        }
        updates.tier = tier.toLowerCase();
      }

      if (language !== undefined) updates.language = language;
      if (ssoProvider !== undefined) updates.ssoProvider = ssoProvider;
      if (region !== undefined) updates.region = region;

      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      logger.error("Error updating user", { error, path: "/api/admin/users/:id", targetUserId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Delete user (admin)
  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting user", { error, path: "/api/admin/users/:id", targetUserId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update restaurant (admin)
  app.patch("/api/admin/restaurants/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const restaurant = await storage.updateRestaurant(id, req.body);
      
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      res.json(restaurant);
    } catch (error) {
      logger.error("Error updating restaurant", { error, path: "/api/admin/restaurants/:id", restaurantId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Delete restaurant (admin)
  app.delete("/api/admin/restaurants/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRestaurant(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting restaurant", { error, path: "/api/admin/restaurants/:id", restaurantId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Get all reviews (admin)
  app.get("/api/admin/reviews", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const reviews = await storage.getAllReviews(limit);
      res.json(reviews);
    } catch (error) {
      logger.error("Error fetching all reviews", { error, path: "/api/admin/reviews", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Toggle review pin (admin)
  app.patch("/api/admin/reviews/:id/pin", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isPinned } = req.body;
      
      if (isPinned === undefined) {
        return res.status(400).json({ error: "isPinned is required" });
      }

      const updated = await storage.updateReviewPin(id, isPinned);
      
      if (!updated) {
        return res.status(404).json({ error: "Review not found" });
      }

      res.json(updated);
    } catch (error) {
      logger.error("Error updating review pin", { error, path: "/api/admin/reviews/:id/pin", reviewId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Delete review (admin)
  app.delete("/api/admin/reviews/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteReviewAsAdmin(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Review not found" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting review", { error, path: "/api/admin/reviews/:id", reviewId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Get all announcements (admin)
  app.get("/api/admin/announcements", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      logger.error("Error fetching all announcements", { error, path: "/api/admin/announcements", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Create announcement (admin)
  app.post("/api/admin/announcements", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const announcement = await storage.createAnnouncement(req.body);
      res.status(201).json(announcement);
    } catch (error) {
      logger.error("Error creating announcement", { error, path: "/api/admin/announcements", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update announcement (admin)
  app.patch("/api/admin/announcements/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const announcement = await storage.updateAnnouncement(id, req.body);
      
      if (!announcement) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      res.json(announcement);
    } catch (error) {
      logger.error("Error updating announcement", { error, path: "/api/admin/announcements/:id", announcementId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Delete announcement (admin)
  app.delete("/api/admin/announcements/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAnnouncement(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting announcement", { error, path: "/api/admin/announcements/:id", announcementId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Get all event banners (admin)
  app.get("/api/admin/event-banners", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const banners = await storage.getAllEventBanners();
      res.json(banners);
    } catch (error) {
      logger.error("Error fetching all event banners", { error, path: "/api/admin/event-banners", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Create event banner (admin)
  app.post("/api/admin/event-banners", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const banner = await storage.createEventBanner(req.body);
      res.status(201).json(banner);
    } catch (error) {
      logger.error("Error creating event banner", { error, path: "/api/admin/event-banners", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update event banner (admin)
  app.patch("/api/admin/event-banners/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const banner = await storage.updateEventBanner(id, req.body);
      
      if (!banner) {
        return res.status(404).json({ error: "Event banner not found" });
      }

      res.json(banner);
    } catch (error) {
      logger.error("Error updating event banner", { error, path: "/api/admin/event-banners/:id", bannerId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Delete event banner (admin)
  app.delete("/api/admin/event-banners/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEventBanner(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Event banner not found" });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting event banner", { error, path: "/api/admin/event-banners/:id", bannerId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // ========== New Admin Management Endpoints ==========
  
  // Priority Tasks
  app.get("/api/admin/dashboard/priority-tasks", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tasks = await storage.getAdminPriorityTasks();
      res.json(tasks);
    } catch (error) {
      logger.error("Error fetching priority tasks", { error, path: "/api/admin/dashboard/priority-tasks", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Restaurant Applications
  app.get("/api/admin/restaurant-applications", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const applications = await storage.getAllRestaurantApplications();
      res.json(applications);
    } catch (error) {
      logger.error("Error fetching restaurant applications", { error, path: "/api/admin/restaurant-applications", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.post("/api/admin/restaurant-applications/:id/process", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;
      const application = await storage.processRestaurantApplication(id, status, adminNote);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      logger.error("Error processing restaurant application", { error, path: "/api/admin/restaurant-applications/:id/process", applicationId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Owner Inquiries
  app.get("/api/admin/owner-inquiries", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const inquiries = await storage.getAllOwnerInquiries();
      res.json(inquiries);
    } catch (error) {
      logger.error("Error fetching owner inquiries", { error, path: "/api/admin/owner-inquiries", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.post("/api/admin/owner-inquiries/:id/respond", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { adminResponse, status } = req.body;
      const inquiry = await storage.respondToOwnerInquiry(id, adminResponse, status);
      
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      res.json(inquiry);
    } catch (error) {
      logger.error("Error responding to owner inquiry", { error, path: "/api/admin/owner-inquiries/:id/respond", inquiryId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Customer Inquiries
  app.get("/api/admin/customer-inquiries", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const inquiries = await storage.getAllCustomerInquiries();
      res.json(inquiries);
    } catch (error) {
      logger.error("Error fetching customer inquiries", { error, path: "/api/admin/customer-inquiries", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.post("/api/admin/customer-inquiries/:id/respond", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { adminResponse, status } = req.body;
      const inquiry = await storage.respondToCustomerInquiry(id, adminResponse, status);
      
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      res.json(inquiry);
    } catch (error) {
      logger.error("Error responding to customer inquiry", { error, path: "/api/admin/customer-inquiries/:id/respond", inquiryId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Partnership Inquiries
  app.get("/api/admin/partnership-inquiries", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const inquiries = await storage.getAllPartnershipInquiries();
      res.json(inquiries);
    } catch (error) {
      logger.error("Error fetching partnership inquiries", { error, path: "/api/admin/partnership-inquiries", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.post("/api/admin/partnership-inquiries/:id/process", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;
      const inquiry = await storage.processPartnershipInquiry(id, status, adminNote);
      
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      res.json(inquiry);
    } catch (error) {
      logger.error("Error processing partnership inquiry", { error, path: "/api/admin/partnership-inquiries/:id/process", inquiryId: req.params.id, userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Owner Notices
  app.get("/api/admin/owner-notices", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const notices = await storage.getAllOwnerNotices();
      res.json(notices);
    } catch (error) {
      logger.error("Error fetching owner notices", { error, path: "/api/admin/owner-notices", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.post("/api/admin/owner-notices", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const notice = await storage.createOwnerNotice(req.body);
      res.status(201).json(notice);
    } catch (error) {
      logger.error("Error creating owner notice", { error, path: "/api/admin/owner-notices", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Payments
  app.get("/api/admin/payments", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      logger.error("Error fetching payments", { error, path: "/api/admin/payments", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // User Analytics
  app.get("/api/admin/users/by-tier", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const tierData = await storage.getUsersByTier();
      res.json(tierData);
    } catch (error) {
      logger.error("Error fetching users by tier", { error, path: "/api/admin/users/by-tier", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  app.get("/api/admin/users/analytics", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const analytics = await storage.getUserAnalytics();
      res.json(analytics);
    } catch (error) {
      logger.error("Error fetching user analytics", { error, path: "/api/admin/users/analytics", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Blog Posts
  app.get("/api/admin/blog-posts", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      logger.error("Error fetching blog posts", { error, path: "/api/admin/blog-posts", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // ============================================
  // Object Storage Endpoints (For Scalable Image Storage)
  // ============================================

  // Get upload URL for object storage (Protected)
  app.post("/api/objects/upload", isAuthenticated, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      logger.error("Error getting upload URL", { error, path: "/api/objects/upload", userId: req.user?.claims?.sub });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Serve private objects with ACL check
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      logger.error("Error accessing object", { error, path: req.path, userId });
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Serve public objects
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      logger.error("Error serving public object", { error, filePath });
      return res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  });

  // Update restaurant image after upload (Protected, sets ACL policy)
  app.put("/api/restaurant-images", isAuthenticated, async (req: any, res) => {
    if (!req.body.imageURL || !req.body.restaurantId) {
      return res.status(400).json({ error: "imageURL and restaurantId are required" });
    }

    const userId = req.user?.claims?.sub;

    try {
      // Verify user owns the restaurant
      const isOwner = await storage.isRestaurantOwner(userId, req.body.restaurantId);
      if (!isOwner) {
        return res.status(403).json({ error: "You don't own this restaurant" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public", // Restaurant images are public
        },
      );

      // Save to database
      const image = await storage.createRestaurantImage({
        restaurantId: req.body.restaurantId,
        imageUrl: objectPath,
        displayOrder: req.body.displayOrder || 0,
      });

      res.status(200).json(image);
    } catch (error) {
      logger.error("Error setting restaurant image", { error, userId, restaurantId: req.body.restaurantId });
      res.status(500).json({ error: ErrorMessages.INTERNAL_ERROR });
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
