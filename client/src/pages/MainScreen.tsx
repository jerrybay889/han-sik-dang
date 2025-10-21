import { useState } from "react";
import { Search, MapPin, Star, Clock, TrendingUp, Play, Bot, ChevronRight, Bell } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { BottomNav } from "@/components/BottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { OptimizedImage } from "@/components/OptimizedImage";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { createWebsiteSchema, createOrganizationSchema } from "@/lib/structuredData";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Restaurant, Announcement, EventBanner } from "@shared/schema";

export default function MainScreen() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return [];
      }
      const response = await fetch(`/api/restaurants/search/${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error("Failed to search restaurants");
      }
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const { data: eventBanners = [] } = useQuery<EventBanner[]>({
    queryKey: ["/api/event-banners"],
  });

  const { data: featuredRestaurants = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/featured"],
  });
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createWebsiteSchema(baseUrl),
      createOrganizationSchema(baseUrl),
    ],
  };

  const displayRestaurants = searchQuery.trim().length > 0 
    ? searchResults 
    : (restaurants || []);

  const sampleVideos = [
    {
      id: 1,
      title: "홍대 한식당 BEST 5 - 외국인이 꼭 가야할 맛집",
      titleEn: "Top 5 Korean Restaurants in Hongdae",
      thumbnail: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
      duration: "12:34",
      views: "15K",
    },
    {
      id: 2,
      title: "한식 초보자 가이드 - 뭘 주문해야 할까?",
      titleEn: "Korean Food Guide for Beginners",
      thumbnail: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400",
      duration: "8:45",
      views: "23K",
    },
  ];

  return (
    <>
      <SEO
        title={t("discover.title")}
        description={t("app.tagline")}
        keywords={["Korean restaurant", "맛집", "한식당", "Seoul restaurants", "AI recommendations", "tourist guide", "Korean food"]}
        url="/"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background pb-[72px]">
        {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img
                src="/attached_assets/배경제거 -Gemini_Generated_Image_1ac1sb1ac1sb1ac1_ALTools_AIRemoveBG_1760940109625.png"
                alt="한식당"
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-1">
              <LanguageSelector />
              <Button size="icon" variant="ghost" data-testid="button-search">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <input
              type="search"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* Top Ad Banner */}
        <div className="px-4 pt-4">
          <AdSlot variant="banner" />
        </div>

        {/* AI Recommendation Section */}
        <div className="px-4 py-6">
          <div
            className="relative overflow-hidden rounded-xl p-6 text-white"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)",
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{t("ai.title")}</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {t("discover.aiRecommend")}
              </h2>
              <p className="text-sm text-white/80 mb-4">
                {t("app.tagline")}
              </p>
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                data-testid="button-ai-recommend"
              >
                {t("nav.ai")}
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Restaurants Section */}
        {featuredRestaurants.length > 0 && !searchQuery && (
          <section className="py-4">
            <div className="px-4 mb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {language === "en" ? "Featured Restaurants" : "추천 프리미엄 맛집"}
                </h2>
                <Badge variant="default" className="bg-[hsl(var(--accent-warning))] text-[hsl(var(--accent-warning-foreground))]">
                  {language === "en" ? "Sponsored" : "광고"}
                </Badge>
              </div>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 px-4 pb-2">
                {featuredRestaurants.map((restaurant) => (
                  <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                    <Card
                      className="w-[280px] overflow-hidden hover-elevate active-elevate-2 cursor-pointer flex-shrink-0"
                      data-testid={`card-featured-${restaurant.id}`}
                    >
                      <div className="relative aspect-[4/3]">
                        <OptimizedImage
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          className="w-full h-full"
                          objectFit="cover"
                          data-testid={`image-featured-${restaurant.id}`}
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-[hsl(var(--primary))] text-primary-foreground">
                            Featured
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-base mb-1 truncate">
                          {language === "en" ? restaurant.nameEn : restaurant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 truncate">
                          {language === "en" ? restaurant.name : restaurant.nameEn}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {restaurant.cuisine}
                          </Badge>
                          {restaurant.rating > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                              <span className="font-medium">{restaurant.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{restaurant.district}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* Trending Section / Search Results */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {searchQuery.trim().length > 0 
                  ? `${t("search.button")}: "${searchQuery}"` 
                  : t("discover.popular")}
              </h2>
            </div>
            {!searchQuery && (
              <Button variant="ghost" size="sm" data-testid="button-see-all-trending">
                {t("discover.viewAll")}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {(isLoading || isSearching) ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="w-24 h-24 rounded-md bg-muted animate-pulse" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                </Card>
              ))
            ) : displayRestaurants.length === 0 && searchQuery.trim().length > 0 ? (
              <Card className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">No restaurants found</p>
                <p className="text-sm text-muted-foreground">
                  Try searching with different keywords
                </p>
              </Card>
            ) : (
              displayRestaurants.map((restaurant, index) => (
                <>
                  <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                    <Card
                      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                      data-testid={`card-restaurant-${restaurant.id}`}
                    >
                      <div className="flex gap-3 p-3">
                        <OptimizedImage
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          className="w-24 h-24 rounded-md"
                          width={96}
                          height={96}
                          objectFit="cover"
                          data-testid={`image-restaurant-${restaurant.id}`}
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
                  {(index + 1) % 4 === 0 && index < displayRestaurants.length - 1 && (
                    <div key={`ad-${index}`}>
                      <AdSlot variant="feed" className="my-2" />
                    </div>
                  )}
                </>
              ))
            )}
          </div>
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

        {/* Mid Ad */}
        <div className="px-4 py-6">
          <AdSlot variant="rectangle" />
        </div>

        {/* Video Section */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[hsl(var(--video-indicator))] flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <h2 className="text-lg font-semibold">{t("content.videos")}</h2>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-videos">
              {t("content.seeAll")}
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {sampleVideos.map((video) => (
              <div
                key={video.id}
                className="flex-shrink-0 w-[280px] cursor-pointer hover-elevate active-elevate-2 rounded-xl"
                data-testid={`card-video-${video.id}`}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary fill-primary ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {language === "en" ? video.titleEn : video.title}
                </h3>
                {language !== "en" && language !== "ko" && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {video.titleEn}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{video.views} {t("content.views")}</span>
                  <span>•</span>
                  <span>2 days ago</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Ad */}
        <div className="px-4 py-6">
          <AdSlot variant="banner" />
        </div>

        {/* Blog Section Preview */}
        <section className="px-4 py-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[hsl(var(--blog-indicator))] flex items-center justify-center text-white text-xs font-bold">
                B
              </div>
              <h2 className="text-lg font-semibold">{t("content.blogs")}</h2>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-blogs">
              {t("content.seeAll")}
            </Button>
          </div>

          <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer" data-testid="card-blog-featured">
            <img
              src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800"
              alt="Blog post"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-base mb-2 line-clamp-2">
                홍대 한식당 완벽 가이드 - 외국인 관광객을 위한 추천
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                Complete guide to Korean restaurants in Hongdae area. 
                From traditional dishes to modern fusion cuisine...
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>5 {t("content.readTime")}</span>
                <span>•</span>
                <span>1 day ago</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Announcements Section */}
        <section className="px-4 py-4 mb-4">
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
      </div>

      <BottomNav />
    </div>
    </>
  );
}
