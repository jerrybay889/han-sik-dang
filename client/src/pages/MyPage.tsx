import { User, Heart, Star, MapPin, Settings, ChevronRight, FileText, Users, Bell, LogIn } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AdSlot } from "@/components/AdSlot";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Restaurant, Announcement, EventBanner } from "@shared/schema";
import { useEffect } from "react";

export default function MyPage() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [location] = useLocation();

  const { data: savedRestaurants = [], isLoading: loadingSaved, error, isError, status, dataUpdatedAt, refetch } = useQuery<Restaurant[]>({
    queryKey: ["/api/saved", isAuthenticated],
    queryFn: async () => {
      console.log('[MyPage queryFn] Starting fetch, isAuthenticated:', isAuthenticated);
      if (!isAuthenticated) {
        console.log('[MyPage queryFn] Not authenticated, returning empty array');
        return [];
      }
      const res = await fetch("/api/saved", {
        credentials: "include",
      });
      console.log('[MyPage queryFn] Response status:', res.status, 'ok:', res.ok);
      if (res.status === 401) {
        console.log('[MyPage queryFn] Got 401, returning empty array');
        return [];
      }
      if (!res.ok) {
        console.error('[MyPage queryFn] Response not ok:', res.status, await res.text());
        return [];
      }
      const data = await res.json();
      console.log('[MyPage queryFn] Fetched saved restaurants:', data.length, 'items', data);
      return data;
    },
    refetchOnMount: 'always',
    staleTime: 0,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('[MyPage useEffect] Refetching saved restaurants, location:', location);
      refetch();
    }
  }, [isAuthenticated, authLoading, location, refetch]);

  console.log('[MyPage] Query Status:', { 
    isAuthenticated, 
    user: user?.email, 
    status, 
    isLoading: loadingSaved,
    isError,
    error: error?.message,
    dataUpdatedAt: new Date(dataUpdatedAt).toISOString(),
    savedCount: savedRestaurants.length 
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const { data: eventBanners = [] } = useQuery<EventBanner[]>({
    queryKey: ["/api/event-banners"],
  });

  const stats = [
    { label: t("my.saved"), value: savedRestaurants.length, icon: Heart },
    { label: t("my.reviews"), value: 12, icon: Star },
    { label: t("my.visited"), value: 38, icon: MapPin },
  ];

  const menuItems = [
    {
      icon: Heart,
      title: t("my.saved"),
      badge: String(savedRestaurants.length),
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


  return (
    <>
      <SEO
        title={t("my.profile")}
        description="Manage your saved restaurants, reviews, and preferences. Track your Korean food journey."
        keywords={["saved restaurants", "reviews", "user profile", "restaurant bookmarks"]}
        url="/my"
      />
      <div className="min-h-screen bg-background pb-[72px]">
        {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 xl:px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <img
              src="/attached_assets/배경제거 -Gemini_Generated_Image_1ac1sb1ac1sb1ac1_ALTools_AIRemoveBG_1760940109625.png"
              alt="한식당"
              className="h-8 brightness-0 invert"
            />
            <LanguageSelector />
          </div>
          <div className="flex items-center gap-4">
            {authLoading ? (
              <>
                <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-white/20 rounded animate-pulse w-32" />
                  <div className="h-8 bg-white/20 rounded animate-pulse w-24" />
                </div>
              </>
            ) : !isAuthenticated ? (
              <>
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                  <User className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold mb-1">
                    {language === "en" ? "Welcome to" : "한식당에 오신 것을"}
                  </h1>
                  <p className="text-sm text-primary-foreground/80 mb-2">
                    {language === "en" ? "han sik dang" : "환영합니다"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-primary-foreground hover:bg-white/10"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="button-login"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {language === "en" ? "Log In" : "로그인"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Avatar className="w-20 h-20 border-2 border-white/30">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-white/20 text-primary-foreground text-2xl">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-xl font-bold mb-1">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || "User"}
                  </h1>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-white/30 text-primary-foreground hover:bg-white/10"
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="button-logout"
                  >
                    {language === "en" ? "Log Out" : "로그아웃"}
                  </Button>
                </div>
              </>
            )}
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

      <div className="max-w-7xl mx-auto">
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

        {/* Saved Restaurants */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t("my.saved")}</h2>
            <Button variant="ghost" size="sm" data-testid="button-see-all-saved">
              {t("my.seeAll")}
            </Button>
          </div>

          {!isAuthenticated ? (
            <Card className="p-8 text-center">
              <LogIn className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">
                {language === "en" ? "Log in to save restaurants" : "로그인하여 레스토랑 저장"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {language === "en" 
                  ? "Save your favorite Korean restaurants and access them anytime" 
                  : "좋아하는 한식당을 저장하고 언제든지 확인하세요"}
              </p>
              <Button
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login-saved"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {language === "en" ? "Log In" : "로그인"}
              </Button>
            </Card>
          ) : loadingSaved ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex gap-3">
                    <div className="w-24 h-24 rounded-md bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : savedRestaurants.length === 0 ? (
            <Card className="p-8 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">
                {language === "en" ? "No saved restaurants yet" : "저장된 레스토랑이 없습니다"}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "en"
                  ? "Start saving your favorite restaurants to see them here"
                  : "좋아하는 레스토랑을 저장하면 여기에 표시됩니다"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {savedRestaurants.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                  <Card
                    className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                    data-testid={`saved-restaurant-${restaurant.id}`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-24 h-24 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 truncate">
                          {language === "en" ? restaurant.nameEn : restaurant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 truncate">
                          {language === "en" ? restaurant.name : restaurant.nameEn}
                        </p>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {restaurant.cuisine}
                          </Badge>
                          {restaurant.rating > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                              <span className="font-medium">{restaurant.rating}</span>
                              <span className="text-muted-foreground">
                                ({restaurant.reviewCount})
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{restaurant.district}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Event Banners */}
        {eventBanners.length > 0 && (
          <section className="py-4">
            <div className="px-4 mb-3">
              <h2 className="text-lg font-semibold">{t("events.title")}</h2>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 px-4 pb-2">
                {eventBanners.map((banner) => (
                  <a
                    key={banner.id}
                    href={banner.linkUrl || "#"}
                    target={banner.linkUrl ? "_blank" : undefined}
                    rel={banner.linkUrl ? "noopener noreferrer" : undefined}
                    className="flex-shrink-0"
                    data-testid={`banner-event-${banner.id}`}
                  >
                    <Card className="w-[320px] overflow-hidden hover-elevate active-elevate-2 cursor-pointer">
                      <div className="relative aspect-[2/1]">
                        <img
                          src={banner.imageUrl}
                          alt={language === "en" ? banner.titleEn : banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-base mb-1">
                          {language === "en" ? banner.titleEn : banner.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {language === "en" ? banner.descriptionEn : banner.description}
                        </p>
                      </div>
                    </Card>
                  </a>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* Announcements Section */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{t("announcements.title")}</h2>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-announcements">
              {t("announcements.viewAll")}
            </Button>
          </div>

          {announcements.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">{t("announcements.noItems")}</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {announcements.slice(0, 2).map((announcement) => (
                <Card
                  key={announcement.id}
                  className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                  data-testid={`card-announcement-${announcement.id}`}
                >
                  <div className="flex items-start gap-3">
                    {announcement.isPinned === 1 && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        📌
                      </Badge>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {language === "en" ? announcement.titleEn : announcement.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(announcement.createdAt).toLocaleDateString(language === "en" ? "en-US" : "ko-KR")}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          )}
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
    </>
  );
}
