import { Search, MapPin, Star, Clock, TrendingUp, Play, Bot } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MainScreen() {
  const sampleRestaurants = [
    {
      id: 1,
      name: "홍대 전통 한식당",
      nameEn: "Traditional Korean Restaurant",
      cuisine: "전통한식",
      rating: 4.8,
      reviews: 234,
      distance: "0.3km",
      image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400",
    },
    {
      id: 2,
      name: "김밥천국 홍대점",
      nameEn: "Kimbap Heaven Hongdae",
      cuisine: "분식",
      rating: 4.5,
      reviews: 156,
      distance: "0.5km",
      image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400",
    },
    {
      id: 3,
      name: "매운 떡볶이 전문점",
      nameEn: "Spicy Tteokbokki Specialist",
      cuisine: "떡볶이",
      rating: 4.7,
      reviews: 189,
      distance: "0.7km",
      image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
    },
  ];

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
    <div className="min-h-screen bg-background pb-[72px]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">
              한식당 <span className="text-sm font-normal text-muted-foreground">hansikdang</span>
            </h1>
            <Button size="icon" variant="ghost" data-testid="button-search">
              <Search className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <input
              type="search"
              placeholder="레스토랑, 음식 검색..."
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
              background: "linear-gradient(135deg, hsl(203 89% 32%) 0%, hsl(203 89% 45%) 100%)",
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">AI 컨시어지</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                당신만을 위한 맞춤 추천
              </h2>
              <p className="text-sm text-white/80 mb-4">
                What Korean food suits you today?
              </p>
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                data-testid="button-ai-recommend"
              >
                AI 추천 받기
              </Button>
            </div>
          </div>
        </div>

        {/* Trending Section */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">인기 맛집</h2>
              <span className="text-sm text-muted-foreground">Trending</span>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-trending">
              더보기
            </Button>
          </div>

          <div className="space-y-4">
            {sampleRestaurants.map((restaurant, index) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`card-restaurant-${restaurant.id}`}
              >
                <div className="flex gap-3 p-3">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-24 h-24 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {restaurant.nameEn}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {restaurant.cuisine}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                        <span className="font-medium">{restaurant.rating}</span>
                        <span className="text-muted-foreground">
                          ({restaurant.reviews})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{restaurant.distance}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

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
              <h2 className="text-lg font-semibold">인기 영상</h2>
              <span className="text-sm text-muted-foreground">Videos</span>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-videos">
              더보기
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
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-1">
                  {video.titleEn}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{video.views} views</span>
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
              <h2 className="text-lg font-semibold">최신 글</h2>
              <span className="text-sm text-muted-foreground">Blog</span>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-see-all-blogs">
              더보기
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
                <span>5 min read</span>
                <span>•</span>
                <span>1 day ago</span>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
