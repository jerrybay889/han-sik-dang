import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PopularityCardProps {
  naverRating?: number | null;
  naverReviewCount?: number | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  popularityScore?: number | null;
}

export function PopularityCard({
  naverRating,
  naverReviewCount,
  googleRating,
  googleReviewCount,
  popularityScore,
}: PopularityCardProps) {
  const { language } = useLanguage();

  const hasData = naverRating || googleRating || popularityScore;

  if (!hasData) {
    return null;
  }

  const getTierInfo = (score: number) => {
    if (score >= 90) {
      return {
        tier: language === "en" ? "Top Rated" : "최고 인기",
        color: "bg-green-500",
        textColor: "text-green-500",
      };
    }
    if (score >= 70) {
      return {
        tier: language === "en" ? "Highly Popular" : "높은 인기",
        color: "bg-blue-500",
        textColor: "text-blue-500",
      };
    }
    if (score >= 50) {
      return {
        tier: language === "en" ? "Popular" : "인기",
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
      };
    }
    if (score >= 30) {
      return {
        tier: language === "en" ? "Average" : "보통",
        color: "bg-gray-500",
        textColor: "text-muted-foreground",
      };
    }
    return {
      tier: language === "en" ? "New/Limited Data" : "신규/정보 부족",
      color: "bg-gray-400",
      textColor: "text-muted-foreground",
    };
  };

  const tierInfo = popularityScore ? getTierInfo(popularityScore) : null;

  return (
    <Card className="p-4 mb-6" data-testid="popularity-card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">
          {language === "en" ? "Popularity Index" : "인기지수"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 종합 인기지수 */}
        {popularityScore !== null && popularityScore !== undefined && tierInfo && (
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg" data-testid="overall-score">
            <p className="text-xs text-muted-foreground mb-2">
              {language === "en" ? "Overall Score" : "종합 점수"}
            </p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${tierInfo.textColor}`}>
                {popularityScore.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <Badge variant="secondary" className="mt-2" data-testid="popularity-tier">
              {tierInfo.tier}
            </Badge>
          </div>
        )}

        {/* 네이버 평점 */}
        {naverRating !== null && naverRating !== undefined && (
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg" data-testid="naver-rating">
            <div className="flex items-center gap-1 mb-2">
              <img 
                src="https://ssl.pstatic.net/static/maps/m/spi_sm/sp_v5_211223.png" 
                alt="Naver"
                className="w-4 h-4"
              />
              <p className="text-xs text-muted-foreground">
                {language === "en" ? "Naver Rating" : "네이버 평점"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">{naverRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/5.0</span>
            </div>
            {naverReviewCount !== null && naverReviewCount !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {naverReviewCount.toLocaleString()} {language === "en" ? "reviews" : "리뷰"}
              </p>
            )}
          </div>
        )}

        {/* 구글 평점 */}
        {googleRating !== null && googleRating !== undefined && (
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg" data-testid="google-rating">
            <div className="flex items-center gap-1 mb-2">
              <img 
                src="https://www.google.com/images/branding/product/ico/maps15_bnuw3a_32dp.ico" 
                alt="Google"
                className="w-4 h-4"
              />
              <p className="text-xs text-muted-foreground">
                {language === "en" ? "Google Rating" : "구글 평점"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">{googleRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/5.0</span>
            </div>
            {googleReviewCount !== null && googleReviewCount !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {googleReviewCount.toLocaleString()} {language === "en" ? "reviews" : "리뷰"}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
