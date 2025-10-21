import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcryptjs";

const genAI = new GoogleGenAI({ 
  apiKey: process.env.gemini_hansikdang || "" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, language = "ko" } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const restaurants = await storage.getAllRestaurants();
      const restaurantData = restaurants.map(r => ({
        name: r.name,
        nameEn: r.nameEn,
        cuisine: r.cuisine,
        district: r.district,
        description: language === "en" ? r.descriptionEn : r.description,
        rating: r.rating,
        priceRange: r.priceRange,
        isVegan: r.isVegan === 1,
        isHalal: r.isHalal === 1,
      }));

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

  app.post("/api/reviews", async (req, res) => {
    try {
      const { userId, restaurantId, rating, comment } = req.body;
      
      if (!userId || !restaurantId || !rating) {
        return res.status(400).json({ error: "userId, restaurantId, and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const user = await storage.getUser(userId);
      const userName = user?.username || "Guest User";

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

  app.get("/api/saved/:userId", async (req, res) => {
    try {
      const savedRestaurants = await storage.getSavedRestaurants(req.params.userId);
      res.json(savedRestaurants);
    } catch (error) {
      console.error("Get saved restaurants error:", error);
      res.status(500).json({ error: "Failed to fetch saved restaurants" });
    }
  });

  app.post("/api/saved", async (req, res) => {
    try {
      const { userId, restaurantId } = req.body;
      if (!userId || !restaurantId) {
        return res.status(400).json({ error: "userId and restaurantId are required" });
      }
      const saved = await storage.saveRestaurant({ userId, restaurantId });
      res.json(saved);
    } catch (error) {
      console.error("Save restaurant error:", error);
      res.status(500).json({ error: "Failed to save restaurant" });
    }
  });

  app.delete("/api/saved/:userId/:restaurantId", async (req, res) => {
    try {
      const { userId, restaurantId } = req.params;
      await storage.unsaveRestaurant(userId, restaurantId);
      res.json({ success: true });
    } catch (error) {
      console.error("Unsave restaurant error:", error);
      res.status(500).json({ error: "Failed to unsave restaurant" });
    }
  });

  app.get("/api/saved/:userId/check/:restaurantId", async (req, res) => {
    try {
      const { userId, restaurantId } = req.params;
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

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });

      const userWithoutPassword = { id: user.id, username: user.username };
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const userWithoutPassword = { id: user.id, username: user.username };
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Failed to logout" });
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

      const userWithoutPassword = { id: user.id, username: user.username };
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

답변 스타일:
- 친근하고 따뜻한 톤으로 대화합니다
- 각 추천마다 왜 그 식당을 추천하는지 이유를 명확히 설명합니다
- 2-3개의 레스토랑을 추천하고, 각각의 장단점을 균형있게 제시합니다
- 레스토랑 이름, 위치(district), 요리 종류를 명확히 표시합니다`,

    en: `You are a Korean restaurant expert in Seoul, South Korea. You are an AI concierge who recommends the best Korean restaurants to both foreign tourists and locals.

Role:
- **Only recommend restaurants from the provided database**
- Recommend personalized Korean restaurants based on user preferences, location, budget, and atmosphere
- Provide detailed descriptions of each restaurant's features, signature dishes, and price range
- For foreigners, kindly guide them through Korean food culture and how to order
- Check isVegan and isHalal flags to accurately respond to vegan/halal requests

Response Style:
- Communicate in a friendly and warm tone
- Clearly explain why you recommend each restaurant
- Recommend 2-3 restaurants and present their pros and cons in a balanced way
- Clearly display restaurant name, location (district), and cuisine type`,

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
