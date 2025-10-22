import { BookText, Play, Clock, TrendingUp, Calendar, Bell, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AdSlot } from "@/components/AdSlot";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import type { Announcement, EventBanner } from "@shared/schema";

export default function ContentPage() {
  const { t, language } = useLanguage();

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const { data: eventBanners = [] } = useQuery<EventBanner[]>({
    queryKey: ["/api/event-banners"],
  });

  const videos = [
    {
      id: 1,
      title: "홍대 한식당 BEST 5 - 외국인이 꼭 가야할 맛집",
      titleEn: "Top 5 Korean Restaurants in Hongdae for Tourists",
      thumbnail: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
      duration: "12:34",
      views: "15.2K",
      date: "2 days ago",
    },
    {
      id: 2,
      title: "한식 초보자 가이드 - 뭘 주문해야 할까?",
      titleEn: "Korean Food Guide for Beginners",
      thumbnail: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400",
      duration: "8:45",
      views: "23.5K",
      date: "4 days ago",
    },
    {
      id: 3,
      title: "김치찌개 맛집 투어 - 서울 5곳",
      titleEn: "Best Kimchi Jjigae in Seoul - 5 Places",
      thumbnail: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400",
      duration: "15:20",
      views: "18.7K",
      date: "1 week ago",
    },
  ];

  const blogs = [
    {
      id: 1,
      title: "홍대 한식당 완벽 가이드 - 외국인 관광객을 위한 추천",
      titleEn: "Complete Guide to Korean Restaurants in Hongdae",
      excerpt: "홍대는 서울에서 가장 활기찬 지역 중 하나입니다. 전통 한식부터 퓨전 요리까지...",
      excerptEn: "Hongdae is one of Seoul's most vibrant areas...",
      image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800",
      readTime: "5 min",
      date: "1 day ago",
      categoryKey: "category.guide" as const,
    },
    {
      id: 2,
      title: "한식 메뉴 주문 가이드 - 이것만 알면 OK",
      titleEn: "How to Order Korean Food Like a Pro",
      excerpt: "한국 식당에서 처음 주문하는 것이 두렵나요? 걱정 마세요...",
      excerptEn: "Nervous about ordering at a Korean restaurant?...",
      image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800",
      readTime: "4 min",
      date: "3 days ago",
      categoryKey: "category.tips" as const,
    },
    {
      id: 3,
      title: "서울 전통 한정식 맛집 TOP 10",
      titleEn: "Top 10 Traditional Korean Set Menu Restaurants",
      excerpt: "격식있는 한정식을 경험하고 싶다면 이곳을 방문하세요...",
      excerptEn: "Experience authentic Korean set menu at these places...",
      image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800",
      readTime: "7 min",
      date: "5 days ago",
      categoryKey: "category.recommendation" as const,
    },
  ];

  return (
    <>
      <SEO
        title={t("content.title")}
        description="Discover Korean food culture through videos and blogs. Learn about authentic restaurants and Korean cuisine."
        keywords={["Korean food videos", "restaurant blogs", "Korean cuisine guide", "food content", "travel guides"]}
        url="/content"
      />
      <div className="min-h-screen bg-background pb-[72px]">
        {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 xl:px-6 py-4">
          <div className="flex items-center justify-between">
            <img
              src="/attached_assets/배경제거 -Gemini_Generated_Image_1ac1sb1ac1sb1ac1_ALTools_AIRemoveBG_1760940109625.png"
              alt="한식당"
              className="h-8"
            />
            <div className="flex items-center gap-1">
              <LanguageSelector />
              <Button variant="ghost" size="sm" data-testid="button-filter">
                {t("content.filter")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Top Ad */}
        <div className="px-4 pt-4">
          <AdSlot variant="banner" />
        </div>

        {/* Trending Videos Section */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--video-indicator))] flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <h2 className="text-lg font-bold">{t("content.videos")}</h2>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-videos">
              {t("content.seeAll")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`card-video-${video.id}`}
              >
                <div className="flex flex-col">
                  <div className="relative w-full aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary fill-primary ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {language === "en" ? video.titleEn : video.title}
                    </h3>
                    {language !== "en" && language !== "ko" && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {video.titleEn}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>{video.views} {t("content.views")}</span>
                      <span>•</span>
                      <span>{video.date}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
        <div className="px-4 py-4">
          <AdSlot variant="rectangle" />
        </div>

        {/* Blog Posts Section */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--blog-indicator))] flex items-center justify-center text-white text-sm font-bold">
                B
              </div>
              <h2 className="text-lg font-bold">{t("content.blogs")}</h2>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-blogs">
              {t("content.seeAll")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {blogs.map((blog) => (
              <Card
                key={blog.id}
                className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`card-blog-${blog.id}`}
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {t(blog.categoryKey)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{blog.readTime} read</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2 line-clamp-2">
                    {language === "en" ? blog.titleEn : blog.title}
                  </h3>
                  {language !== "en" && language !== "ko" && (
                    <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
                      {blog.titleEn}
                    </p>
                  )}
                  <p className="text-sm mb-3 line-clamp-2">
                    {language === "en" ? blog.excerptEn : blog.excerpt}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{blog.date}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

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
