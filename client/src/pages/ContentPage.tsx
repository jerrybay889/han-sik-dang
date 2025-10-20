import { BookText, Play, Clock, TrendingUp, Calendar } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";

export default function ContentPage() {
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
      category: "가이드",
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
      category: "팁",
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
      category: "추천",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-[72px]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookText className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-lg font-bold">콘텐츠</h1>
                <p className="text-xs text-muted-foreground">Content</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-filter">
              필터
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
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
              <div>
                <h2 className="text-lg font-bold">인기 영상</h2>
                <p className="text-xs text-muted-foreground">Trending Videos</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-videos">
              더보기
            </Button>
          </div>

          <div className="space-y-4">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`card-video-${video.id}`}
              >
                <div className="flex gap-3 p-3">
                  <div className="relative w-40 flex-shrink-0 aspect-video rounded-md overflow-hidden">
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
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {video.titleEn}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>{video.views} views</span>
                      <span>•</span>
                      <span>{video.date}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

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
              <div>
                <h2 className="text-lg font-bold">블로그 포스트</h2>
                <p className="text-xs text-muted-foreground">Blog Posts</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-blogs">
              더보기
            </Button>
          </div>

          <div className="space-y-4">
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
                      {blog.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{blog.readTime} read</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
                    {blog.titleEn}
                  </p>
                  <p className="text-sm mb-3 line-clamp-2">
                    {blog.excerpt}
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

        {/* Bottom Ad */}
        <div className="px-4 pb-6">
          <AdSlot variant="banner" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
