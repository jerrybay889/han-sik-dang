import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function generateAIInsights(restaurantData: {
  name: string;
  description: string;
  cuisine: string;
  priceRange: number;
  menus: Array<{ name: string; description: string; price: number }>;
  reviews: Array<{ source: string; rating: number; comment: string; author: string }>;
}) {

  const priceRangeText = '₩'.repeat(restaurantData.priceRange);
  const prompt = `You are a Korean food expert and travel guide. Based on the following restaurant information, generate comprehensive insights in both Korean and English.

Restaurant Name: ${restaurantData.name}
Description: ${restaurantData.description}
Cuisine: ${restaurantData.cuisine}
Price Range: ${priceRangeText} (${restaurantData.priceRange} out of 4)

Menu Items:
${restaurantData.menus.map(m => `- ${m.name} (${m.price.toLocaleString()}원): ${m.description}`).join('\n')}

Customer Reviews:
${restaurantData.reviews.map(r => `- [${r.source}] ${r.rating}⭐ by ${r.author}: "${r.comment}"`).join('\n')}

Please provide the following insights in JSON format:

{
  "reviewInsights": "A 2-3 sentence summary of customer reviews highlighting common themes, praise, and any concerns (in Korean)",
  "reviewInsightsEn": "A 2-3 sentence summary of customer reviews highlighting common themes, praise, and any concerns (in English)",
  "bestFor": "Comma-separated list of 3-4 most relevant dining situations/contexts (in Korean)",
  "bestForEn": "Comma-separated list of 3-4 most relevant dining situations/contexts (in English)",
  "culturalTips": "Cultural etiquette and dining tips specific to this restaurant (in Korean, 2-3 sentences)",
  "culturalTipsEn": "Cultural etiquette and dining tips specific to this restaurant (in English, 2-3 sentences)",
  "firstTimerTips": "Essential tips for first-time visitors - what to order, when to visit, how to navigate (in Korean, 2-3 sentences)",
  "firstTimerTipsEn": "Essential tips for first-time visitors - what to order, when to visit, how to navigate (in English, 2-3 sentences)"
}

For "bestFor", choose from these categories (select 3-4 most relevant):
- "First-time Korean food experience"
- "Traditional Korean dining"
- "Business lunch/dinner"
- "Family gathering"
- "Date night"
- "Solo dining"
- "Tourist must-visit"
- "Local favorite"
- "Special occasion"
- "Quick meal"
- "Late night dining"
- "Vegetarian/vegan options"
- "Budget-friendly"
- "Luxury dining"

Return ONLY the JSON object, no additional text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    // Clean up the response - remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const insights = JSON.parse(cleanText);
    return insights;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    throw error;
  }
}

async function seedAIInsights() {
  console.log("🤖 Starting AI insights generation...");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GOOGLE_API_KEY_HANSIKDANG environment variable is not set");
    process.exit(1);
  }

  try {
    const restaurants = await storage.getAllRestaurants();
    console.log(`📊 Found ${restaurants.length} restaurants`);

    let processed = 0;
    let skipped = 0;
    let created = 0;

    for (const restaurant of restaurants) {
      // Check if insights already exist - skip if they do
      const existingInsights = await storage.getRestaurantInsights(restaurant.id);
      
      if (existingInsights) {
        console.log(`⏭️  Skipping ${restaurant.name} (insights already exist)`);
        skipped++;
        continue;
      }

      console.log(`\n🏪 Generating AI insights for: ${restaurant.name}`);

      // Gather restaurant data
      const menus = await storage.getMenusByRestaurant(restaurant.id);
      const reviews = await storage.getExternalReviewsByRestaurant(restaurant.id);

      console.log(`  📋 Found ${menus.length} menu items`);
      console.log(`  💬 Found ${reviews.length} reviews`);

      try {
        const insights = await generateAIInsights({
          name: restaurant.name,
          description: restaurant.description,
          cuisine: restaurant.cuisine,
          priceRange: restaurant.priceRange,
          menus: menus.map((m: any) => ({
            name: m.name,
            description: m.description || "",
            price: m.price,
          })),
          reviews: reviews.map((r: any) => ({
            source: r.source,
            rating: r.rating || 0,
            comment: r.comment,
            author: r.author || "Anonymous",
          })),
        });

        console.log(`  🤖 AI insights generated successfully`);
        console.log(`     - Review insights (KO): ${insights.reviewInsights.substring(0, 50)}...`);
        console.log(`     - Best for: ${insights.bestFor}`);

        // Create new insights (we already checked it doesn't exist)
        await storage.createRestaurantInsights({
          restaurantId: restaurant.id,
          reviewInsights: insights.reviewInsights,
          reviewInsightsEn: insights.reviewInsightsEn,
          bestFor: insights.bestFor,
          bestForEn: insights.bestForEn,
          culturalTips: insights.culturalTips,
          culturalTipsEn: insights.culturalTipsEn,
          firstTimerTips: insights.firstTimerTips,
          firstTimerTipsEn: insights.firstTimerTipsEn,
        });
        console.log(`  ✅ Created new restaurant insights`);
        created++;
        processed++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Failed to generate/save AI insights:`, error);
      }
    }

    console.log("\n🎉 AI insights generation completed successfully!");
    console.log(`📊 Summary: ${created} created, ${skipped} skipped, ${restaurants.length} total`);
  } catch (error) {
    console.error("❌ Error during AI insights seeding:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAIInsights()
    .then(() => {
      console.log("✅ AI insights seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ AI insights seed failed:", error);
      process.exit(1);
    });
}

export { seedAIInsights };
