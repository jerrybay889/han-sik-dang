import { storage } from '../storage';
import { calculatePopularityScore } from '../utils/popularityCalculator';

async function recalculateAllScores() {
  console.log('🔄 인기지수 재계산 시작 (5점 척도)...\n');

  const restaurants = await storage.getAllRestaurants();
  
  let updated = 0;
  let skipped = 0;
  const changes: Array<{
    name: string;
    oldScore: number;
    newScore: number;
  }> = [];

  for (const restaurant of restaurants) {
    try {
      const oldScore = restaurant.popularityScore || 0;
      
      const newScore = calculatePopularityScore({
        naverRating: restaurant.naverRating,
        naverReviewCount: restaurant.naverReviewCount,
        googleRating: restaurant.googleRating,
        googleReviewCount: restaurant.googleReviewCount,
      });

      await storage.updateRestaurantRatings(restaurant.id, {
        popularityScore: newScore,
      });

      changes.push({
        name: restaurant.name,
        oldScore,
        newScore,
      });

      const arrow = newScore > oldScore ? '↑' : newScore < oldScore ? '↓' : '→';
      console.log(`${arrow} ${restaurant.name}: ${oldScore.toFixed(2)} → ${newScore.toFixed(2)}`);
      updated++;
    } catch (error) {
      console.error(`❌ ${restaurant.name} 업데이트 실패:`, error);
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 재계산 완료\n');
  console.log(`  총 레스토랑: ${restaurants.length}개`);
  console.log(`  ✅ 성공: ${updated}개`);
  console.log(`  ❌ 실패: ${skipped}개`);
  
  // 통계 계산
  const updatedRestaurants = await storage.getAllRestaurants();
  const scores = updatedRestaurants
    .map(r => r.popularityScore)
    .filter(s => s !== null && s > 0) as number[];
  
  if (scores.length > 0) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    
    console.log('\n📈 새로운 통계 (5점 척도):');
    console.log(`  평균: ${avg.toFixed(2)}점`);
    console.log(`  최고: ${max.toFixed(2)}점`);
    console.log(`  최저: ${min.toFixed(2)}점`);
    
    // 등급별 분포
    const distribution = {
      legendary: scores.filter(s => s >= 4.5).length,
      highly_popular: scores.filter(s => s >= 4.0 && s < 4.5).length,
      popular: scores.filter(s => s >= 3.5 && s < 4.0).length,
      moderate: scores.filter(s => s >= 3.0 && s < 3.5).length,
      average: scores.filter(s => s >= 2.0 && s < 3.0).length,
      low: scores.filter(s => s < 2.0).length,
    };
    
    console.log('\n🏆 등급별 분포:');
    console.log(`  전설의 맛집 (4.5+): ${distribution.legendary}개`);
    console.log(`  대박 맛집 (4.0-4.4): ${distribution.highly_popular}개`);
    console.log(`  인기 맛집 (3.5-3.9): ${distribution.popular}개`);
    console.log(`  괜찮은 곳 (3.0-3.4): ${distribution.moderate}개`);
    console.log(`  평범한 곳 (2.0-2.9): ${distribution.average}개`);
    console.log(`  신규/데이터 부족 (<2.0): ${distribution.low}개`);
  }

  // Top 10 출력
  const top10 = updatedRestaurants
    .filter(r => r.popularityScore && r.popularityScore > 0)
    .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
    .slice(0, 10);
  
  if (top10.length > 0) {
    console.log('\n🌟 Top 10 인기 맛집:');
    top10.forEach((r, idx) => {
      const stars = '★'.repeat(Math.floor(r.popularityScore || 0));
      const halfStar = (r.popularityScore || 0) % 1 >= 0.5 ? '☆' : '';
      console.log(`  ${idx + 1}. ${r.name}: ${(r.popularityScore || 0).toFixed(2)} ${stars}${halfStar}`);
    });
  }

  console.log('\n✅ 재계산 완료!\n');
}

recalculateAllScores()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 치명적 오류:', error);
    process.exit(1);
  });
