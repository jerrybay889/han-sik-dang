import { storage } from '../storage';
import { GooglePlacesApiService } from '../services/googlePlacesApi';

async function fillMissingGoogleRatings() {
  console.log('🔍 구글 평점 누락 레스토랑 검색 중...\n');

  const allRestaurants = await storage.getAllRestaurants();
  const missingRatings = allRestaurants.filter(
    r => !r.googleRating && !r.googlePlaceId
  );

  console.log(`📊 총 레스토랑: ${allRestaurants.length}개`);
  console.log(`❌ 구글 평점 없음: ${missingRatings.length}개\n`);

  if (missingRatings.length === 0) {
    console.log('✅ 모든 레스토랑에 구글 평점이 이미 있습니다!');
    return;
  }

  const googlePlaces = new GooglePlacesApiService();
  
  let success = 0;
  let failed = 0;

  for (const restaurant of missingRatings) {
    try {
      console.log(`🔎 검색 중: ${restaurant.name} (${restaurant.district})`);
      
      const result = await googlePlaces.searchPlace(
        restaurant.name,
        restaurant.address || `서울 ${restaurant.district}`
      );

      if (result.placeId && result.rating) {
        await storage.updateRestaurantRatings(restaurant.id, {
          googlePlaceId: result.placeId,
          googleRating: result.rating,
          googleReviewCount: result.reviewCount || 0,
        });

        console.log(`  ✅ ${restaurant.name}: ${result.rating}점 (리뷰 ${result.reviewCount || 0}개)`);
        success++;
      } else {
        console.log(`  ⚠️  ${restaurant.name}: 검색 결과 없음`);
        failed++;
      }

      // Rate limiting: 1 req/sec
      await googlePlaces.delay(1000);
    } catch (error) {
      console.error(`  ❌ ${restaurant.name} 처리 실패:`, error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 구글 평점 수집 완료\n');
  console.log(`  ✅ 성공: ${success}개`);
  console.log(`  ❌ 실패: ${failed}개`);
  console.log('\n✨ 다음 단계: 인기지수 재계산');
}

fillMissingGoogleRatings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 치명적 오류:', error);
    process.exit(1);
  });
