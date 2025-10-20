import { User, Heart, Star, MapPin, Settings, ChevronRight, FileText, Users, Bell } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MyPage() {
  const { t } = useLanguage();
  const stats = [
    { label: t("my.saved"), value: 24, icon: Heart },
    { label: t("my.reviews"), value: 12, icon: Star },
    { label: t("my.visited"), value: 38, icon: MapPin },
  ];

  const menuItems = [
    {
      icon: Heart,
      title: t("my.saved"),
      badge: "24",
      testId: "menu-saved",
    },
    {
      icon: Star,
      title: t("my.reviews"),
      badge: "12",
      testId: "menu-reviews",
    },
    {
      icon: MapPin,
      title: t("my.visited"),
      badge: "38",
      testId: "menu-visits",
    },
    {
      icon: Users,
      title: t("my.following"),
      badge: "15",
      testId: "menu-following",
    },
  ];

  const settingItems = [
    {
      icon: Bell,
      title: t("my.notifications"),
      testId: "settings-notifications",
    },
    {
      icon: Settings,
      title: t("my.settings"),
      testId: "settings-app",
    },
    {
      icon: FileText,
      title: t("my.terms"),
      testId: "settings-terms",
    },
  ];

  const recentReviews = [
    {
      id: 1,
      restaurant: "홍대 전통 한식당",
      restaurantEn: "Traditional Korean Restaurant",
      rating: 5,
      comment: "음식이 정말 맛있었어요! 외국인 친구들과 함께 갔는데 모두 좋아했습니다.",
      date: "2 days ago",
      image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400",
    },
    {
      id: 2,
      restaurant: "매운 떡볶이 전문점",
      restaurantEn: "Spicy Tteokbokki Specialist",
      rating: 4,
      comment: "떡볶이가 정말 맵지만 맛있어요. 치즈 토핑 추천!",
      date: "1 week ago",
      image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-[72px]">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <img
              src="/attached_assets/배경제거 -Gemini_Generated_Image_1ac1sb1ac1sb1ac1_ALTools_AIRemoveBG_1760940109625.png"
              alt="한식당"
              className="h-8 brightness-0 invert"
            />
            <LanguageSelector />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-1">Guest User</h1>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-white/30 text-primary-foreground hover:bg-white/10"
                data-testid="button-edit-profile"
              >
                {t("my.editProfile")}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center"
                  data-testid={`stat-${index}`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-primary-foreground/80 mt-1">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* Ad Banner */}
        <div className="px-4 pt-4">
          <AdSlot variant="banner" />
        </div>

        {/* Menu Items */}
        <section className="px-4 py-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
            My Activity
          </h2>
          <Card className="divide-y divide-border">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-4 hover-elevate active-elevate-2 transition-colors"
                  data-testid={item.testId}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.titleEn}</p>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="mr-2">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </Card>
        </section>

        {/* Recent Reviews */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">최근 리뷰</h2>
              <p className="text-xs text-muted-foreground">Recent Reviews</p>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-reviews">
              전체보기
            </Button>
          </div>

          <div className="space-y-3">
            {recentReviews.map((review) => (
              <Card
                key={review.id}
                className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`review-${review.id}`}
              >
                <div className="flex gap-3">
                  <img
                    src={review.image}
                    alt={review.restaurant}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">
                      {review.restaurant}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {review.restaurantEn}
                    </p>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{review.comment}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Settings */}
        <section className="px-4 py-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
            Settings
          </h2>
          <Card className="divide-y divide-border">
            {settingItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-4 hover-elevate active-elevate-2 transition-colors"
                  data-testid={item.testId}
                >
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.titleEn}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </Card>
        </section>

        {/* Bottom Ad */}
        <div className="px-4 pb-6">
          <AdSlot variant="banner" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
