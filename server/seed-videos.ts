import { storage } from "./storage";

async function seedYoutubeVideos() {
  console.log("📹 Starting YouTube videos seeding...");

  try {
    const restaurants = await storage.getAllRestaurants();
    console.log(`📊 Found ${restaurants.length} restaurants`);

    for (const restaurant of restaurants) {
      console.log(`\n🏪 Adding videos for: ${restaurant.name}`);

      let videos: Array<{
        videoId: string;
        title: string;
        channelName: string;
        thumbnailUrl: string;
        viewCount?: number;
        publishedAt?: string;
        relevanceScore?: number;
      }> = [];

      switch (restaurant.name) {
        case "명동교자":
          videos = [
            {
              videoId: "dQw4w9WgXcQ",
              title: "명동교자 칼국수 먹방! 50년 전통의 맛 | Seoul Food Tour",
              channelName: "Seoul Eats",
              thumbnailUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
              viewCount: 125000,
              publishedAt: "2024-11-15",
              relevanceScore: 0.95,
            },
            {
              videoId: "K8LFU5N0u9M",
              title: "명동 맛집 명동교자 리뷰 - 칼국수와 만두 맛집",
              channelName: "한국 맛집 탐방",
              thumbnailUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
              viewCount: 89000,
              publishedAt: "2024-12-01",
              relevanceScore: 0.92,
            },
          ];
          break;

        case "광장시장":
          videos = [
            {
              videoId: "P5yf7jqBq3A",
              title: "광장시장 먹방 투어! 마약김밥부터 육회까지 | Gwangjang Market Food Tour",
              channelName: "Korean Food Adventure",
              thumbnailUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
              viewCount: 450000,
              publishedAt: "2024-10-20",
              relevanceScore: 0.98,
            },
            {
              videoId: "hK9vL7qLm2w",
              title: "서울 전통시장 광장시장 완벽 가이드",
              channelName: "서울 여행",
              thumbnailUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
              viewCount: 280000,
              publishedAt: "2024-11-05",
              relevanceScore: 0.94,
            },
          ];
          break;

        case "토속촌삼계탕":
          videos = [
            {
              videoId: "L7zMq9wF5jE",
              title: "토속촌 삼계탕 리뷰 - 오바마도 먹은 그 맛! | Tosokchon Samgyetang",
              channelName: "Seoul Food Guide",
              thumbnailUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
              viewCount: 320000,
              publishedAt: "2024-09-10",
              relevanceScore: 0.96,
            },
            {
              videoId: "N9qJ3mKLq8w",
              title: "경복궁 근처 삼계탕 맛집 토속촌",
              channelName: "맛집 헌터",
              thumbnailUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
              viewCount: 175000,
              publishedAt: "2024-11-20",
              relevanceScore: 0.91,
            },
          ];
          break;

        case "우래옥":
          videos = [
            {
              videoId: "dYw4WgXcQ9Q",
              title: "우래옥 평양냉면 - 70년 전통의 깊은 맛 | Wooraeok Naengmyeon",
              channelName: "냉면 덕후",
              thumbnailUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
              viewCount: 210000,
              publishedAt: "2024-08-15",
              relevanceScore: 0.93,
            },
          ];
          break;

        case "이문설농탕":
          videos = [
            {
              videoId: "M9qJ3mKLq8w",
              title: "100년 전통 이문설농탕 - 진한 사골 국물의 비밀",
              channelName: "전통 맛집",
              thumbnailUrl: "https://images.unsplash.com/photo-1618329482768-8e3ea6ce8b60?w=400",
              viewCount: 145000,
              publishedAt: "2024-10-05",
              relevanceScore: 0.89,
            },
          ];
          break;

        case "한일관":
          videos = [
            {
              videoId: "Q5yf7jqBq3A",
              title: "한일관 불고기 맛집 - 85년 전통의 특제 갈비구이",
              channelName: "고급 맛집",
              thumbnailUrl: "https://images.unsplash.com/photo-1588207036722-0a86fe9f2b03?w=400",
              viewCount: 195000,
              publishedAt: "2024-09-25",
              relevanceScore: 0.90,
            },
          ];
          break;

        case "미진":
          videos = [
            {
              videoId: "R6zMq9wF5jE",
              title: "미진 육회비빔밥 - 압구정 숨은 맛집",
              channelName: "서울 맛집 탐방",
              thumbnailUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400",
              viewCount: 118000,
              publishedAt: "2024-11-10",
              relevanceScore: 0.87,
            },
          ];
          break;

        case "하동관":
          videos = [
            {
              videoId: "S7zMq9wF5jE",
              title: "하동관 곰탕 먹방 - 명동 곰탕 맛집",
              channelName: "곰탕 좋아",
              thumbnailUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
              viewCount: 92000,
              publishedAt: "2024-12-05",
              relevanceScore: 0.85,
            },
          ];
          break;

        case "진미평양냉면":
          videos = [
            {
              videoId: "T8AMq9wF5jE",
              title: "진미평양냉면 리뷰 - 종로 냉면 맛집",
              channelName: "냉면 마니아",
              thumbnailUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
              viewCount: 78000,
              publishedAt: "2024-10-28",
              relevanceScore: 0.84,
            },
          ];
          break;

        case "발우공양":
          videos = [
            {
              videoId: "U9BNq9wF5jE",
              title: "발우공양 미슐랭 1스타 사찰음식 - 비건 한정식의 정석",
              channelName: "Michelin Guide Korea",
              thumbnailUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
              viewCount: 385000,
              publishedAt: "2024-08-20",
              relevanceScore: 0.97,
            },
            {
              videoId: "V0CPq9wF5jE",
              title: "사찰음식의 아름다움 - 발우공양 체험기",
              channelName: "비건 라이프",
              thumbnailUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
              viewCount: 165000,
              publishedAt: "2024-11-15",
              relevanceScore: 0.88,
            },
          ];
          break;

        case "삼원가든":
          videos = [
            {
              videoId: "W1DQq9wF5jE",
              title: "삼원가든 한우 맛집 - 최고급 한우 등심 먹방",
              channelName: "한우 사랑",
              thumbnailUrl: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400",
              viewCount: 275000,
              publishedAt: "2024-09-30",
              relevanceScore: 0.92,
            },
          ];
          break;

        case "북촌손만두":
          videos = [
            {
              videoId: "X2ERq9wF5jE",
              title: "북촌 한옥마을 맛집 - 북촌손만두 리뷰",
              channelName: "서울 여행",
              thumbnailUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400",
              viewCount: 132000,
              publishedAt: "2024-10-18",
              relevanceScore: 0.86,
            },
          ];
          break;

        case "전주중앙회관":
          videos = [
            {
              videoId: "Y3FSq9wF5jE",
              title: "전주중앙회관 비빔밥 - 1954년 원조 전주비빔밥",
              channelName: "전통 한식",
              thumbnailUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400",
              viewCount: 198000,
              publishedAt: "2024-11-08",
              relevanceScore: 0.90,
            },
          ];
          break;

        case "진진":
          videos = [
            {
              videoId: "Z4GTq9wF5jE",
              title: "진진 - 미슐랭 가이드 선정 모던 한식 레스토랑",
              channelName: "Fine Dining Korea",
              thumbnailUrl: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400",
              viewCount: 325000,
              publishedAt: "2024-09-12",
              relevanceScore: 0.95,
            },
          ];
          break;

        case "오장동흥남집":
          videos = [
            {
              videoId: "A5HUq9wF5jE",
              title: "오장동흥남집 함흥냉면 & 족발 - 마포 맛집",
              channelName: "냉면과 족발",
              thumbnailUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
              viewCount: 105000,
              publishedAt: "2024-12-10",
              relevanceScore: 0.83,
            },
          ];
          break;

        default:
          console.log(`⚠️ No video data for: ${restaurant.name}`);
          continue;
      }

      for (const video of videos) {
        try {
          await storage.createYoutubeVideo({
            restaurantId: restaurant.id,
            videoId: video.videoId,
            title: video.title,
            channelName: video.channelName,
            thumbnailUrl: video.thumbnailUrl,
            viewCount: video.viewCount,
            publishedAt: video.publishedAt ? new Date(video.publishedAt) : undefined,
            relevanceScore: video.relevanceScore,
          });
          console.log(`  ✅ Added video: ${video.title}`);
        } catch (error) {
          console.error(`  ❌ Failed to add video:`, error);
        }
      }
    }

    console.log("\n🎉 YouTube videos seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during video seeding:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedYoutubeVideos()
    .then(() => {
      console.log("✅ Video seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Video seed failed:", error);
      process.exit(1);
    });
}

export { seedYoutubeVideos };
