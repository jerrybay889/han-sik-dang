/**
 * 기존 190개 레스토랑에 구글 평점/리뷰수 추가 스크립트
 */

import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import { restaurants } from '@shared/schema';
import { eq, isNull, or } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL!;
const USE_SUPABASE = process.env.USE_SUPABASE === "true";

const db = USE_SUPABASE
  ? drizzlePostgres(postgres(DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    }))
  : drizzleNeon(neon(DATABASE_URL));
import { GooglePlacesApiService } from '../services/googlePlacesApi';
import { calculatePopularityScore, getPopularityTier } from '../utils/popularityCalculator';

async function enrichGoogleRatings() {
  console.log('=== 구글 평점 보강 시작 ===\n');

  const googleApi = new GooglePlacesApiService();

  // 구글 데이터가 없는 레스토랑 조회
  const restaurantsToEnrich = await db
    .select()
    .from(restaurants)
    .where(
      or(
        isNull(restaurants.googlePlaceId),
        isNull(restaurants.googleRating)
      )
    );

  console.log(`대상 레스토랑: ${restaurantsToEnrich.length}개\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < restaurantsToEnrich.length; i++) {
    const restaurant = restaurantsToEnrich[i];
    
    console.log(`[${i + 1}/${restaurantsToEnrich.length}] ${restaurant.name} 처리 중...`);

    try {
      // Google Places API로 검색
      const googleData = await googleApi.searchPlace(restaurant.name, restaurant.address);

      if (googleData.placeId && googleData.rating) {
        // 인기지수 재계산
        const popularityScore = calculatePopularityScore({
          naverRating: restaurant.naverRating,
          naverReviewCount: restaurant.naverReviewCount,
          googleRating: googleData.rating,
          googleReviewCount: googleData.reviewCount,
        });

        const popularityTier = getPopularityTier(popularityScore);

        // 데이터베이스 업데이트
        await db
          .update(restaurants)
          .set({
            googlePlaceId: googleData.placeId,
            googleRating: googleData.rating,
            googleReviewCount: googleData.reviewCount || 0,
            popularityScore,
          })
          .where(eq(restaurants.id, restaurant.id));

        console.log(`  ✅ 성공: 구글 평점 ${googleData.rating}/5.0 (${googleData.reviewCount || 0}개 리뷰)`);
        console.log(`  📊 인기지수: ${popularityScore}점 (${popularityTier})\n`);
        
        successCount++;
      } else {
        console.log(`  ⚠️  구글 데이터 없음\n`);
        failCount++;
      }

      // Rate limiting: 5 requests/second
      if (i < restaurantsToEnrich.length - 1) {
        await googleApi.delay(200);
      }
    } catch (error) {
      console.error(`  ❌ 오류:`, error);
      failCount++;
    }
  }

  console.log('\n=== 완료 ===');
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${failCount}개`);
  console.log(`성공률: ${((successCount / restaurantsToEnrich.length) * 100).toFixed(1)}%`);

  process.exit(0);
}

enrichGoogleRatings().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
