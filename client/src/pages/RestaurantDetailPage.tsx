import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone, Clock, Star, DollarSign, Users, Heart, Sparkles, Lightbulb, UtensilsCrossed, Play, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant, Review, RestaurantInsights, Menu, YoutubeVideo } from "@shared/schema";

const TEMP_USER_ID = "guest-user";

export default function RestaurantDetailPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [, params] = useRoute("/restaurant/:id");
  const restaurantId = params?.id;
  
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const { data: restaurant, isLoading: loadingRestaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: savedStatus } = useQuery<{ isSaved: boolean }>({
    queryKey: ["/api/saved", TEMP_USER_ID, "check", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: insights } = useQuery<RestaurantInsights | null>({
    queryKey: ["/api/restaurants", restaurantId, "insights"],
    enabled: !!restaurantId,
  });

  const { data: menus = [], isLoading: loadingMenus } = useQuery<Menu[]>({
    queryKey: ["/api/restaurants", restaurantId, "menus"],
    enabled: !!restaurantId,
  });

  const { data: videos = [], isLoading: loadingVideos } = useQuery<YoutubeVideo[]>({
    queryKey: ["/api/restaurants", restaurantId, "videos"],
    enabled: !!restaurantId,
  });

  const isSaved = savedStatus?.isSaved || false;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/saved/${TEMP_USER_ID}/${restaurantId}`);
      } else {
        await apiRequest("POST", "/api/saved", { userId: TEMP_USER_ID, restaurantId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved", TEMP_USER_ID, "check", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved", TEMP_USER_ID] });
      toast({
        title: isSaved ? "Removed from saved" : "Saved successfully",
        description: isSaved ? "Restaurant removed from your saved list" : "Restaurant saved to your list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update saved status",
        variant: "destructive",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reviews", {
        userId: TEMP_USER_ID,
        restaurantId,
        rating: reviewRating,
        comment: reviewComment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      setIsReviewDialogOpen(false);
      setReviewRating(0);
      setReviewComment("");
      toast({
        title: t("review.success"),
      });
    },
    onError: () => {
      toast({
        title: t("review.error"),
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      toast({
        title: t("review.error"),
        description: t("review.yourRating"),
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate();
  };

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto">
          <div className="h-64 bg-muted animate-pulse" />
          <div className="p-4 space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t("error.notFound")}</h2>
          <Link href="/">
            <Button variant="default" data-testid="button-back-home">
              {t("nav.discover")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const restaurantName = language === "en" ? restaurant.nameEn : restaurant.name;
  const restaurantDescription = language === "en" ? restaurant.descriptionEn : restaurant.description;

  return (
    <>
      <SEO
        title={`${restaurantName} - ${t("nav.discover")}`}
        description={restaurantDescription}
        keywords={[restaurant.name, restaurant.nameEn, restaurant.cuisine, restaurant.district, "Korean restaurant"]}
        url={`/restaurant/${restaurant.id}`}
      />
      <div className="min-h-screen bg-background pb-8">
        <div className="max-w-md mx-auto">
          {/* Header Image */}
          <div className="relative">
            <img
              src={restaurant.imageUrl}
              alt={restaurantName}
              className="w-full h-64 object-cover"
              data-testid="img-restaurant-hero"
            />
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <Link href="/">
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-background/80 backdrop-blur-sm"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="icon"
                variant="secondary"
                className="bg-background/80 backdrop-blur-sm"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                data-testid="button-save"
              >
                <Heart className={`w-5 h-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="px-4 pt-4">
            {/* Title & Rating */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-1" data-testid="text-restaurant-name">
                {restaurantName}
              </h1>
              <p className="text-muted-foreground mb-3">
                {language === "en" ? restaurant.name : restaurant.nameEn}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" data-testid="badge-cuisine">
                  {restaurant.cuisine}
                </Badge>
                {restaurant.rating > 0 && (
                  <div className="flex items-center gap-1" data-testid="rating-display">
                    <Star className="w-5 h-5 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                    <span className="font-semibold text-lg">{restaurant.rating}</span>
                    <span className="text-muted-foreground">
                      ({restaurant.reviewCount} {t("reviews.title")})
                    </span>
                  </div>
                )}
                {restaurant.isVegan === 1 && (
                  <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
                    Vegan
                  </Badge>
                )}
                {restaurant.isHalal === 1 && (
                  <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">
                    Halal
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("restaurant.price")}</span>
                </div>
                <p className="font-semibold" data-testid="text-price-range">
                  {restaurant.priceRange}
                </p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("restaurant.location")}</span>
                </div>
                <p className="font-semibold truncate" data-testid="text-district">
                  {restaurant.district}
                </p>
              </Card>
            </div>

            {/* Description */}
            <Card className="p-4 mb-6">
              <h2 className="font-semibold mb-2">{t("restaurant.about")}</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                {restaurantDescription}
              </p>
            </Card>

            {/* Contact Info */}
            <Card className="p-4 mb-6">
              <h2 className="font-semibold mb-3">{t("restaurant.info")}</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">{t("restaurant.address")}</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-address">
                      {restaurant.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">{t("restaurant.phone")}</p>
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-sm text-primary hover:underline"
                      data-testid="link-phone"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">{t("restaurant.hours")}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-hours">
                      {restaurant.openHours}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Menu Section */}
            {menus.length > 0 && (
              <Card className="p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <UtensilsCrossed className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">{language === "en" ? "Menu" : "메뉴"}</h2>
                </div>
                
                {loadingMenus ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {menus.map((menu) => (
                      <Card key={menu.id} className="p-3 hover-elevate" data-testid={`menu-item-${menu.id}`}>
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold" data-testid="text-menu-name">
                                {language === "en" ? menu.nameEn : menu.name}
                              </h3>
                              {menu.isPopular === 1 && (
                                <Badge variant="secondary" className="text-xs">
                                  {language === "en" ? "Popular" : "인기"}
                                </Badge>
                              )}
                              {menu.isRecommended === 1 && (
                                <Badge variant="outline" className="text-xs border-primary text-primary">
                                  {language === "en" ? "Recommended" : "추천"}
                                </Badge>
                              )}
                            </div>
                            {menu.description && (
                              <p className="text-sm text-muted-foreground mb-1" data-testid="text-menu-description">
                                {language === "en" ? menu.descriptionEn : menu.description}
                              </p>
                            )}
                            {menu.category && (
                              <p className="text-xs text-muted-foreground">
                                {menu.category}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <p className="font-semibold text-primary" data-testid="text-menu-price">
                              ₩{menu.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* YouTube Videos Section */}
            {videos.length > 0 && (
              <Card className="p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-5 h-5 text-red-500" />
                  <h2 className="font-semibold">{language === "en" ? "Videos" : "영상 리뷰"}</h2>
                </div>
                
                {loadingVideos ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {videos.map((video) => (
                      <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        data-testid={`video-${video.id}`}
                      >
                        <Card className="p-3 hover-elevate active-elevate-2">
                          <div className="flex gap-3">
                            <div className="relative flex-shrink-0 w-32 h-20 bg-muted rounded overflow-hidden">
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover"
                                data-testid="img-video-thumbnail"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-8 h-8 text-white fill-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm line-clamp-2 mb-1" data-testid="text-video-title">
                                {video.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mb-1" data-testid="text-channel-name">
                                {video.channelName}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {video.viewCount && (
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {video.viewCount.toLocaleString()}
                                  </span>
                                )}
                                {video.publishedAt && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(video.publishedAt).toLocaleDateString(language === "en" ? "en-US" : "ko-KR", { year: 'numeric', month: 'short' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* AI Insights Section */}
            {insights && (
              <Card className="p-4 mb-6 border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">{language === "en" ? "AI Insights" : "AI 추천 정보"}</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Review Insights */}
                  {(language === "en" ? insights.reviewInsightsEn : insights.reviewInsights) && (
                    <div className="pb-4 border-b">
                      <div className="flex items-start gap-2 mb-2">
                        <Star className="w-4 h-4 text-[hsl(var(--accent-success))] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {language === "en" ? "What customers love" : "고객들이 좋아하는 점"}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid="text-review-insights">
                            {language === "en" ? insights.reviewInsightsEn : insights.reviewInsights}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Best For */}
                  {(language === "en" ? insights.bestForEn : insights.bestFor) && (
                    <div className="pb-4 border-b">
                      <div className="flex items-start gap-2 mb-2">
                        <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {language === "en" ? "Best for" : "추천 상황"}
                          </p>
                          <div className="flex flex-wrap gap-2" data-testid="badges-best-for">
                            {(language === "en" ? insights.bestForEn : insights.bestFor)
                              .split(",")
                              .map((item: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {item.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cultural Tips */}
                  {(language === "en" ? insights.culturalTipsEn : insights.culturalTips) && (
                    <div className="pb-4 border-b">
                      <div className="flex items-start gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {language === "en" ? "Cultural tip" : "문화 팁"}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid="text-cultural-tips">
                            {language === "en" ? insights.culturalTipsEn : insights.culturalTips}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* First Timer Tips */}
                  {(language === "en" ? insights.firstTimerTipsEn : insights.firstTimerTips) && (
                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">
                            {language === "en" ? "First-timer tip" : "첫 방문 팁"}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid="text-first-timer-tips">
                            {language === "en" ? insights.firstTimerTipsEn : insights.firstTimerTips}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("reviews.title")} ({reviews.length})
                </h2>
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={() => setIsReviewDialogOpen(true)}
                  data-testid="button-write-review"
                >
                  {t("reviews.write")}
                </Button>
              </div>

              {loadingReviews ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="border-t pt-3">
                      <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-full mb-1" />
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground" data-testid="text-no-reviews">
                    {t("reviews.empty")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("reviews.beFirst")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0" data-testid={`review-${review.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{review.userName}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString(language)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("review.write")}</DialogTitle>
            <DialogDescription>{restaurantName}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Star Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("review.yourRating")}</label>
              <div className="flex gap-2" data-testid="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    data-testid={`button-star-${star}`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? "fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("review.yourReview")}</label>
              <Textarea
                placeholder={t("review.placeholder")}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                data-testid="textarea-review-comment"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReviewDialogOpen(false);
                setReviewRating(0);
                setReviewComment("");
              }}
              data-testid="button-cancel-review"
            >
              {t("review.cancel")}
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={reviewMutation.isPending || reviewRating === 0}
              data-testid="button-submit-review"
            >
              {reviewMutation.isPending ? "..." : t("review.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
