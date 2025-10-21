import { storage } from "./storage";

async function seedMenus() {
  console.log("🍜 Starting menu seeding...");

  try {
    const restaurants = await storage.getAllRestaurants();
    console.log(`📊 Found ${restaurants.length} restaurants`);

    for (const restaurant of restaurants) {
      console.log(`\n🏪 Adding menus for: ${restaurant.name}`);
      
      let menus: Array<{
        name: string;
        nameEn: string;
        price: number;
        description?: string;
        descriptionEn?: string;
        imageUrl?: string;
        isVegan?: number;
        isHalal?: number;
        spicyLevel?: number;
      }> = [];

      switch (restaurant.name) {
        case "명동교자":
          menus = [
            {
              name: "칼국수",
              nameEn: "Kalguksu (Knife-cut Noodles)",
              price: 10000,
              description: "얼큰하고 시원한 칼국수",
              descriptionEn: "Spicy and refreshing knife-cut noodle soup",
              spicyLevel: 2,
            },
            {
              name: "비빔국수",
              nameEn: "Bibim Guksu (Spicy Cold Noodles)",
              price: 10000,
              description: "매콤달콤한 비빔국수",
              descriptionEn: "Sweet and spicy cold noodles",
              spicyLevel: 3,
            },
            {
              name: "만두",
              nameEn: "Mandu (Dumplings)",
              price: 12000,
              description: "손으로 빚은 고기 만두",
              descriptionEn: "Handmade meat dumplings",
            },
            {
              name: "만두전골",
              nameEn: "Mandu Jeongol (Dumpling Hot Pot)",
              price: 30000,
              description: "만두와 야채가 가득한 전골",
              descriptionEn: "Hot pot filled with dumplings and vegetables",
            },
          ];
          break;

        case "광장시장":
          menus = [
            {
              name: "빈대떡",
              nameEn: "Bindaetteok (Mung Bean Pancake)",
              price: 6000,
              description: "고소한 녹두전",
              descriptionEn: "Savory mung bean pancake",
              isVegan: 0,
            },
            {
              name: "마약김밥",
              nameEn: "Mayak Kimbap (Addictive Kimbap)",
              price: 3000,
              description: "작고 중독성 있는 김밥",
              descriptionEn: "Small and addictive kimbap rolls",
              isVegan: 0,
            },
            {
              name: "육회",
              nameEn: "Yukhoe (Korean Beef Tartare)",
              price: 15000,
              description: "신선한 생고기 육회",
              descriptionEn: "Fresh raw beef tartare",
            },
            {
              name: "순대",
              nameEn: "Sundae (Blood Sausage)",
              price: 5000,
              description: "전통 순대",
              descriptionEn: "Traditional Korean blood sausage",
            },
          ];
          break;

        case "토속촌삼계탕":
          menus = [
            {
              name: "삼계탕",
              nameEn: "Samgyetang (Ginseng Chicken Soup)",
              price: 25000,
              description: "인삼, 대추, 밤이 들어간 영계 요리",
              descriptionEn: "Young chicken soup with ginseng, jujube, and chestnuts",
            },
            {
              name: "오골계삼계탕",
              nameEn: "Black Chicken Samgyetang",
              price: 30000,
              description: "오골계로 만든 프리미엄 삼계탕",
              descriptionEn: "Premium ginseng soup with black chicken",
            },
            {
              name: "능이백숙",
              nameEn: "Neungi Baeksuk (Chicken Soup with Mushrooms)",
              price: 35000,
              description: "능이버섯을 넣은 백숙",
              descriptionEn: "Chicken soup with neungi mushrooms",
            },
          ];
          break;

        case "우래옥":
          menus = [
            {
              name: "평양냉면",
              nameEn: "Pyongyang Naengmyeon (Cold Noodles)",
              price: 18000,
              description: "시원한 육수의 냉면",
              descriptionEn: "Cold buckwheat noodles in beef broth",
            },
            {
              name: "비빔냉면",
              nameEn: "Bibim Naengmyeon (Spicy Cold Noodles)",
              price: 18000,
              description: "매콤한 비빔냉면",
              descriptionEn: "Spicy cold buckwheat noodles",
              spicyLevel: 2,
            },
            {
              name: "불고기",
              nameEn: "Bulgogi (Marinated Beef)",
              price: 45000,
              description: "전통 방식의 불고기",
              descriptionEn: "Traditional marinated beef",
            },
            {
              name: "갈비찜",
              nameEn: "Galbijjim (Braised Short Ribs)",
              price: 55000,
              description: "부드러운 갈비찜",
              descriptionEn: "Tender braised beef short ribs",
            },
          ];
          break;

        case "이문설농탕":
          menus = [
            {
              name: "설렁탕",
              nameEn: "Seolleongtang (Ox Bone Soup)",
              price: 14000,
              description: "24시간 끓인 진한 사골 국물",
              descriptionEn: "Rich bone broth cooked for 24 hours",
            },
            {
              name: "도가니탕",
              nameEn: "Doganitang (Ox Knee Soup)",
              price: 16000,
              description: "도가니가 들어간 보양탕",
              descriptionEn: "Nourishing soup with ox knee bone",
            },
            {
              name: "곰탕",
              nameEn: "Gomtang (Beef Bone Soup)",
              price: 15000,
              description: "진한 소고기 국물",
              descriptionEn: "Rich beef bone soup",
            },
          ];
          break;

        case "한일관":
          menus = [
            {
              name: "특제 갈비구이",
              nameEn: "Special Galbi (Grilled Ribs)",
              price: 65000,
              description: "특제 양념의 한우 갈비",
              descriptionEn: "Korean beef ribs with special marinade",
            },
            {
              name: "불고기정식",
              nameEn: "Bulgogi Set Menu",
              price: 50000,
              description: "불고기와 다양한 반찬",
              descriptionEn: "Bulgogi with various side dishes",
            },
            {
              name: "한정식",
              nameEn: "Hanjeongsik (Korean Table d'hote)",
              price: 80000,
              description: "고급 한정식 코스",
              descriptionEn: "Premium Korean course meal",
            },
          ];
          break;

        case "미진":
          menus = [
            {
              name: "육회비빔밥",
              nameEn: "Yukhoe Bibimbap",
              price: 18000,
              description: "신선한 육회가 올라간 비빔밥",
              descriptionEn: "Bibimbap topped with fresh beef tartare",
            },
            {
              name: "육회",
              nameEn: "Yukhoe (Beef Tartare)",
              price: 35000,
              description: "신선한 생고기 육회",
              descriptionEn: "Fresh raw beef tartare",
            },
            {
              name: "비빔밥",
              nameEn: "Bibimbap",
              price: 12000,
              description: "전통 비빔밥",
              descriptionEn: "Traditional mixed rice with vegetables",
            },
          ];
          break;

        case "하동관":
          menus = [
            {
              name: "곰탕",
              nameEn: "Gomtang (Beef Soup)",
              price: 14000,
              description: "깊은 맛의 곰탕",
              descriptionEn: "Deep flavored beef soup",
            },
            {
              name: "특곰탕",
              nameEn: "Special Gomtang",
              price: 16000,
              description: "고기가 더 많이 들어간 곰탕",
              descriptionEn: "Beef soup with extra meat",
            },
          ];
          break;

        case "진미평양냉면":
          menus = [
            {
              name: "물냉면",
              nameEn: "Mul Naengmyeon (Cold Noodle Soup)",
              price: 14000,
              description: "담백한 평양식 물냉면",
              descriptionEn: "Light Pyongyang-style cold noodle soup",
            },
            {
              name: "비빔냉면",
              nameEn: "Bibim Naengmyeon",
              price: 14000,
              description: "매콤한 비빔냉면",
              descriptionEn: "Spicy cold noodles",
              spicyLevel: 2,
            },
            {
              name: "만두",
              nameEn: "Mandu (Dumplings)",
              price: 10000,
              description: "전통 만두",
              descriptionEn: "Traditional dumplings",
            },
          ];
          break;

        case "발우공양":
          menus = [
            {
              name: "발우공양 정식",
              nameEn: "Balwoo Gongyang Set",
              price: 65000,
              description: "사찰음식 정식 코스",
              descriptionEn: "Temple food set course",
              isVegan: 1,
              isHalal: 1,
            },
            {
              name: "점심 특선",
              nameEn: "Lunch Special",
              price: 38000,
              description: "점심 사찰음식 세트",
              descriptionEn: "Lunch temple food set",
              isVegan: 1,
              isHalal: 1,
            },
          ];
          break;

        case "삼원가든":
          menus = [
            {
              name: "한우 등심",
              nameEn: "Hanwoo Sirloin",
              price: 75000,
              description: "최고급 한우 등심",
              descriptionEn: "Premium Korean beef sirloin",
            },
            {
              name: "한우 안심",
              nameEn: "Hanwoo Tenderloin",
              price: 85000,
              description: "부드러운 한우 안심",
              descriptionEn: "Tender Korean beef tenderloin",
            },
            {
              name: "갈비",
              nameEn: "Galbi (Short Ribs)",
              price: 65000,
              description: "한우 갈비",
              descriptionEn: "Korean beef short ribs",
            },
          ];
          break;

        case "북촌손만두":
          menus = [
            {
              name: "고기만두",
              nameEn: "Meat Mandu",
              price: 8000,
              description: "손으로 빚은 고기만두",
              descriptionEn: "Handmade meat dumplings",
            },
            {
              name: "김치만두",
              nameEn: "Kimchi Mandu",
              price: 8000,
              description: "김치가 들어간 만두",
              descriptionEn: "Dumplings filled with kimchi",
              spicyLevel: 1,
            },
            {
              name: "만둣국",
              nameEn: "Mandutguk (Dumpling Soup)",
              price: 10000,
              description: "만두가 들어간 국",
              descriptionEn: "Soup with dumplings",
            },
          ];
          break;

        case "전주중앙회관":
          menus = [
            {
              name: "전주비빔밥",
              nameEn: "Jeonju Bibimbap",
              price: 15000,
              description: "전통 전주식 비빔밥",
              descriptionEn: "Traditional Jeonju-style bibimbap",
            },
            {
              name: "콩나물국밥",
              nameEn: "Kongnamul Gukbap (Bean Sprout Soup)",
              price: 10000,
              description: "시원한 콩나물국밥",
              descriptionEn: "Refreshing bean sprout soup with rice",
            },
          ];
          break;

        case "진진":
          menus = [
            {
              name: "런치 코스",
              nameEn: "Lunch Course",
              price: 55000,
              description: "점심 모던 한식 코스",
              descriptionEn: "Modern Korean lunch course",
            },
            {
              name: "디너 코스",
              nameEn: "Dinner Course",
              price: 95000,
              description: "저녁 모던 한식 코스",
              descriptionEn: "Modern Korean dinner course",
            },
          ];
          break;

        case "오장동흥남집":
          menus = [
            {
              name: "함흥냉면",
              nameEn: "Hamheung Naengmyeon",
              price: 13000,
              description: "매콤달콤한 함흥냉면",
              descriptionEn: "Sweet and spicy Hamheung-style cold noodles",
              spicyLevel: 3,
            },
            {
              name: "족발",
              nameEn: "Jokbal (Pig's Trotters)",
              price: 35000,
              description: "부드러운 족발",
              descriptionEn: "Tender braised pig's trotters",
            },
            {
              name: "물냉면",
              nameEn: "Mul Naengmyeon",
              price: 12000,
              description: "시원한 물냉면",
              descriptionEn: "Cold noodle soup",
            },
          ];
          break;

        default:
          console.log(`⚠️ No menu data for: ${restaurant.name}`);
          continue;
      }

      for (const menu of menus) {
        try {
          await storage.createMenu({
            restaurantId: restaurant.id,
            ...menu,
          });
          console.log(`  ✅ Added menu: ${menu.name}`);
        } catch (error) {
          console.error(`  ❌ Failed to add menu ${menu.name}:`, error);
        }
      }
    }

    console.log("\n🎉 Menu seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during menu seeding:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedMenus()
    .then(() => {
      console.log("✅ Menu seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Menu seed failed:", error);
      process.exit(1);
    });
}

export { seedMenus };
