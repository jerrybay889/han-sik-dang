import { storage } from "./storage";

async function seedExternalReviews() {
  console.log("⭐ Starting external reviews seeding...");

  try {
    const restaurants = await storage.getAllRestaurants();
    console.log(`📊 Found ${restaurants.length} restaurants`);

    const reviewPlatforms = ["Google", "Naver", "Kakao", "Tripadvisor"];
    
    for (const restaurant of restaurants) {
      console.log(`\n🏪 Adding reviews for: ${restaurant.name}`);

      let reviews: Array<{
        source: string;
        rating: number;
        comment: string;
        author: string;
        publishedAt: string;
      }> = [];

      switch (restaurant.name) {
        case "명동교자":
          reviews = [
            {
              source: "Google",
              rating: 4.5,
              comment: "칼국수와 만두 모두 최고예요! 줄 서서 먹을 가치가 있습니다. 양도 푸짐하고 가격도 합리적입니다.",
              author: "김민준",
              publishedAt: "2024-12-15",
            },
            {
              source: "Naver",
              rating: 4.8,
              comment: "명동 맛집의 대명사! 만두가 정말 맛있고 칼국수 국물이 깔끔해요. 다만 대기 시간이 좀 길어요.",
              author: "이서연",
              publishedAt: "2024-12-20",
            },
            {
              source: "Kakao",
              rating: 4.3,
              comment: "The dumplings are handmade and delicious. The kalguksu noodle soup is also very tasty. Worth the wait!",
              author: "Sarah Kim",
              publishedAt: "2025-01-05",
            },
          ];
          break;

        case "광장시장":
          reviews = [
            {
              source: "Tripadvisor",
              rating: 4.7,
              comment: "Amazing street food market! The yukhoe (beef tartare) was incredibly fresh. Bindaetteok was crispy and delicious.",
              author: "John Smith",
              publishedAt: "2024-11-28",
            },
            {
              source: "Google",
              rating: 4.9,
              comment: "서울에서 가장 좋아하는 시장이에요. 마약김밥은 정말 중독적이고, 빈대떡은 바삭바삭합니다!",
              author: "박지우",
              publishedAt: "2024-12-30",
            },
            {
              source: "Naver",
              rating: 4.6,
              comment: "전통시장의 활기와 다양한 음식을 경험할 수 있어요. 육회가 신선하고 맛있습니다.",
              author: "최수민",
              publishedAt: "2025-01-10",
            },
          ];
          break;

        case "토속촌삼계탕":
          reviews = [
            {
              source: "Google",
              rating: 4.6,
              comment: "삼계탕 맛집 중 최고! 인삼향이 진하고 닭이 부드러워요. 오바마도 먹었다는 그 맛!",
              author: "정민재",
              publishedAt: "2024-12-18",
            },
            {
              source: "Tripadvisor",
              rating: 4.5,
              comment: "Best samgyetang in Seoul! The ginseng chicken soup is rich and nourishing. Great location near Gyeongbokgung Palace.",
              author: "Emma Wilson",
              publishedAt: "2024-12-22",
            },
            {
              source: "Naver",
              rating: 4.7,
              comment: "30년 전통의 맛이 느껴집니다. 국물이 진하고 영양가 높아요. 보양식으로 최고!",
              author: "강서윤",
              publishedAt: "2025-01-02",
            },
          ];
          break;

        case "우래옥":
          reviews = [
            {
              source: "Naver",
              rating: 4.4,
              comment: "평양냉면 원조 맛집답게 육수가 깊고 시원해요. 면발도 쫄깃하고 좋습니다.",
              author: "윤도현",
              publishedAt: "2024-12-25",
            },
            {
              source: "Google",
              rating: 4.6,
              comment: "1946년부터 이어온 전통의 맛! 냉면도 맛있지만 불고기도 일품입니다.",
              author: "송하은",
              publishedAt: "2025-01-08",
            },
            {
              source: "Kakao",
              rating: 4.3,
              comment: "Authentic Pyongyang-style naengmyeon. The cold noodles are refreshing and the broth is clean.",
              author: "David Lee",
              publishedAt: "2024-12-12",
            },
          ];
          break;

        case "이문설농탕":
          reviews = [
            {
              source: "Google",
              rating: 4.7,
              comment: "100년 전통 그대로의 깊은 맛! 사골 국물이 진하고 고기도 부드러워요.",
              author: "홍준서",
              publishedAt: "2024-12-28",
            },
            {
              source: "Naver",
              rating: 4.8,
              comment: "해장하러 자주 가는 곳이에요. 24시간 운영해서 언제든 갈 수 있어 좋아요.",
              author: "김시우",
              publishedAt: "2025-01-12",
            },
          ];
          break;

        case "한일관":
          reviews = [
            {
              source: "Google",
              rating: 4.5,
              comment: "85년 전통의 고급 한식당. 불고기 석쇠가 독특하고 맛도 훌륭합니다.",
              author: "이준혁",
              publishedAt: "2024-12-20",
            },
            {
              source: "Naver",
              rating: 4.6,
              comment: "가족 모임으로 방문했는데 모든 음식이 정갈하고 맛있었어요. 특히 갈비구이 추천!",
              author: "박서준",
              publishedAt: "2025-01-05",
            },
            {
              source: "Tripadvisor",
              rating: 4.4,
              comment: "Traditional Korean restaurant with excellent bulgogi. The round grill is unique and the food is delicious.",
              author: "Michael Park",
              publishedAt: "2024-12-15",
            },
          ];
          break;

        case "미진":
          reviews = [
            {
              source: "Naver",
              rating: 4.7,
              comment: "육회비빔밥 정말 맛있어요! 육회가 신선하고 비빔밥과 완벽한 조화입니다.",
              author: "최예린",
              publishedAt: "2024-12-22",
            },
            {
              source: "Google",
              rating: 4.5,
              comment: "3대째 이어온 전통의 맛. 육회가 부드럽고 신선해요. 압구정 맛집!",
              author: "강민석",
              publishedAt: "2025-01-07",
            },
          ];
          break;

        case "하동관":
          reviews = [
            {
              source: "Google",
              rating: 4.6,
              comment: "곰탕 국물이 진하고 깊은 맛이 나요. 85년 전통이 느껴집니다.",
              author: "정수아",
              publishedAt: "2024-12-30",
            },
            {
              source: "Naver",
              rating: 4.7,
              comment: "명동에서 곰탕 먹을 땐 여기! 고기도 많이 들어있고 국물 맛이 일품입니다.",
              author: "임재현",
              publishedAt: "2025-01-10",
            },
          ];
          break;

        case "진미평양냉면":
          reviews = [
            {
              source: "Naver",
              rating: 4.5,
              comment: "평양냉면 육수가 담백하고 깔끔해요. 만두도 맛있습니다!",
              author: "조은지",
              publishedAt: "2024-12-28",
            },
            {
              source: "Google",
              rating: 4.4,
              comment: "1953년부터 이어온 전통 냉면집. 면발이 쫄깃하고 맛있어요.",
              author: "백현우",
              publishedAt: "2025-01-03",
            },
          ];
          break;

        case "발우공양":
          reviews = [
            {
              source: "Tripadvisor",
              rating: 4.8,
              comment: "Michelin 1-star temple food restaurant. Every dish is beautifully presented and delicious. Vegan-friendly!",
              author: "Lisa Chen",
              publishedAt: "2024-12-18",
            },
            {
              source: "Google",
              rating: 4.9,
              comment: "미슐랭 스타 맛집답게 모든 요리가 정갈하고 품격 있어요. 비건 한정식 최고!",
              author: "한지민",
              publishedAt: "2025-01-06",
            },
            {
              source: "Naver",
              rating: 4.7,
              comment: "사찰음식의 깊은 맛을 경험할 수 있어요. 건강하고 맛있습니다.",
              author: "오세훈",
              publishedAt: "2024-12-25",
            },
          ];
          break;

        case "삼원가든":
          reviews = [
            {
              source: "Google",
              rating: 4.7,
              comment: "최고급 한우를 즐길 수 있는 곳! 정원도 아름답고 고기 맛이 환상적이에요.",
              author: "서민호",
              publishedAt: "2024-12-20",
            },
            {
              source: "Naver",
              rating: 4.8,
              comment: "특별한 날 가기 좋은 고급 한우 레스토랑. 가격은 있지만 그만한 가치가 있어요.",
              author: "김나연",
              publishedAt: "2025-01-04",
            },
          ];
          break;

        case "북촌손만두":
          reviews = [
            {
              source: "Google",
              rating: 4.6,
              comment: "북촌 한옥마을 구경하고 만두 먹기 완벽! 손만두가 정말 맛있어요.",
              author: "남궁현",
              publishedAt: "2024-12-27",
            },
            {
              source: "Naver",
              rating: 4.5,
              comment: "매일 아침 빚는다는 만두가 정말 신선하고 맛있습니다.",
              author: "황지우",
              publishedAt: "2025-01-09",
            },
          ];
          break;

        case "전주중앙회관":
          reviews = [
            {
              source: "Google",
              rating: 4.6,
              comment: "전주 비빔밥 원조집! 참기름 향이 좋고 나물이 신선해요.",
              author: "문채원",
              publishedAt: "2024-12-23",
            },
            {
              source: "Naver",
              rating: 4.7,
              comment: "1954년부터 이어온 비빔밥 맛집. 역시 원조는 다르네요!",
              author: "류승완",
              publishedAt: "2025-01-11",
            },
          ];
          break;

        case "진진":
          reviews = [
            {
              source: "Tripadvisor",
              rating: 4.8,
              comment: "Michelin Guide selected modern Korean restaurant. Creative dishes with traditional flavors. Highly recommended!",
              author: "James Anderson",
              publishedAt: "2024-12-19",
            },
            {
              source: "Google",
              rating: 4.7,
              comment: "모던 한식의 정수! 전통 한식을 현대적으로 재해석한 요리들이 인상적이에요.",
              author: "안소희",
              publishedAt: "2025-01-02",
            },
          ];
          break;

        case "오장동흥남집":
          reviews = [
            {
              source: "Naver",
              rating: 4.5,
              comment: "함흥냉면이 매콤달콤해서 정말 맛있어요. 족발도 부드럽고 좋아요!",
              author: "신동엽",
              publishedAt: "2024-12-26",
            },
            {
              source: "Google",
              rating: 4.4,
              comment: "마포에서 냉면과 족발 먹을 땐 여기! 함흥냉면 양념이 일품입니다.",
              author: "곽민정",
              publishedAt: "2025-01-08",
            },
          ];
          break;

        default:
          console.log(`⚠️ No review data for: ${restaurant.name}`);
          continue;
      }

      for (const review of reviews) {
        try {
          await storage.createExternalReview({
            restaurantId: restaurant.id,
            source: review.source,
            rating: review.rating,
            comment: review.comment,
            author: review.author,
            publishedAt: new Date(review.publishedAt),
          });
          console.log(`  ✅ Added ${review.source} review by ${review.author}`);
        } catch (error) {
          console.error(`  ❌ Failed to add review:`, error);
        }
      }
    }

    console.log("\n🎉 External reviews seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during review seeding:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedExternalReviews()
    .then(() => {
      console.log("✅ Review seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Review seed failed:", error);
      process.exit(1);
    });
}

export { seedExternalReviews };
