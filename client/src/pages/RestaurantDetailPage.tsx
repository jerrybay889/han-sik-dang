import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone, Clock, Star, DollarSign, Users, Heart, Sparkles, Lightbulb, UtensilsCrossed, Play, Eye, Calendar, MessageSquare, MessageCircle, Send, X, Navigation, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OptimizedImage } from "@/components/OptimizedImage";
import { SEO } from "@/components/SEO";
import { AdSense } from "@/components/AdSense";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant, Review, RestaurantInsights, Menu, YoutubeVideo, ExternalReview, ReviewResponse } from "@shared/schema";

type AICardType = "reviews" | "menu" | "howToEat" | "ordering";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function RestaurantDetailPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/restaurant/:id");
  const restaurantId = params?.id;
  
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [editingResponseReviewId, setEditingResponseReviewId] = useState<string | null>(null);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentAICard, setCurrentAICard] = useState<AICardType | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const { data: restaurant, isLoading: loadingRestaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: reviews = [], isLoading: loadingReviews, refetch: refetchReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews", restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${restaurantId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!restaurantId,
  });

  const { data: savedStatus } = useQuery<{ isSaved: boolean }>({
    queryKey: ["/api/saved/check", restaurantId],
    enabled: !!restaurantId && isAuthenticated,
    retry: false,
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

  const { data: externalReviews = [] } = useQuery<ExternalReview[]>({
    queryKey: ["/api/restaurants", restaurantId, "external-reviews"],
    enabled: !!restaurantId,
  });

  // Check if current user is owner of this restaurant
  const { data: ownershipStatus } = useQuery<{ isOwner: boolean }>({
    queryKey: ["/api/restaurants", restaurantId, "is-owner"],
    enabled: !!restaurantId && isAuthenticated,
    retry: false,
  });

  // Fetch review responses - map of reviewId -> response
  const { data: reviewResponses = {} } = useQuery<Record<string, ReviewResponse>>({
    queryKey: ["/api/review-responses", restaurantId],
    queryFn: async () => {
      if (!reviews || reviews.length === 0) return {};
      
      const responses: Record<string, ReviewResponse> = {};
      await Promise.all(
        reviews.map(async (review) => {
          const res = await fetch(`/api/reviews/${review.id}/response`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            if (data) {
              responses[review.id] = data;
            }
          }
        })
      );
      return responses;
    },
    enabled: !!restaurantId && reviews.length > 0,
  });

  const isSaved = savedStatus?.isSaved || false;
  const isOwner = ownershipStatus?.isOwner || false;

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const getInitialPrompt = (cardType: AICardType): string => {
    if (cardType === "reviews") {
      return language === "en" 
        ? "Please analyze the reviews for this restaurant and tell me what customers love most about it."
        : "이 레스토랑의 리뷰를 분석해서 고객들이 가장 좋아하는 점을 알려주세요.";
    } else if (cardType === "menu") {
      return language === "en"
        ? "What are the most popular and recommended menu items here? Please provide recommendations."
        : "이 곳에서 가장 인기 있고 추천하는 메뉴는 무엇인가요? 추천해주세요.";
    } else if (cardType === "howToEat") {
      return language === "en"
        ? "How should I eat Korean food at this restaurant? Please teach me the proper way and etiquette."
        : "이 레스토랑에서 한국 음식을 어떻게 먹어야 하나요? 올바른 방법과 에티켓을 알려주세요.";
    } else if (cardType === "ordering") {
      return language === "en"
        ? "What Korean phrases should I know for ordering at this restaurant? Please teach me useful expressions."
        : "이 레스토랑에서 주문할 때 알아야 할 한국어 표현을 알려주세요. 유용한 표현을 가르쳐주세요.";
    }
    return "";
  };

  const sendInitialMessage = async (cardType: AICardType) => {
    if (!restaurant) return;

    const initialPrompt = getInitialPrompt(cardType);
    if (!initialPrompt) return;

    setIsSendingMessage(true);

    try {
      const context = {
        cardType,
        restaurant: {
          id: restaurant.id,
          name: language === "en" ? restaurant.nameEn : restaurant.name,
          cuisine: restaurant.cuisine,
          description: language === "en" ? restaurant.descriptionEn : restaurant.description,
        },
        menus: menus.map(m => ({
          name: language === "en" ? m.nameEn : m.name,
          description: language === "en" ? m.descriptionEn : m.description,
          price: m.price,
          category: m.category,
        })),
        externalReviews: externalReviews.map(r => ({
          source: r.source,
          rating: r.rating,
          comment: language === "en" ? (r.commentEn || r.comment) : r.comment,
        })),
        insights,
      };

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: initialPrompt,
          language,
          context,
          conversationHistory: [],
        }),
      });

      if (!response.ok) throw new Error("Failed to send initial message");

      const data = await response.json();
      setChatMessages([{ role: "assistant", content: data.response }]);
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "오류",
        description: language === "en" ? "Failed to load AI analysis" : "AI 분석을 불러오는데 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const openAIChat = (cardType: AICardType) => {
    setCurrentAICard(cardType);
    setIsAIChatOpen(true);
    setChatMessages([]);
    setChatInput("");
    sendInitialMessage(cardType);
  };

  const closeAIChat = () => {
    setIsAIChatOpen(false);
    setCurrentAICard(null);
    setChatMessages([]);
    setChatInput("");
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isSendingMessage || !restaurant || !currentAICard) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsSendingMessage(true);

    try {
      const context = {
        cardType: currentAICard,
        restaurant: {
          id: restaurant.id,
          name: language === "en" ? restaurant.nameEn : restaurant.name,
          cuisine: restaurant.cuisine,
          description: language === "en" ? restaurant.descriptionEn : restaurant.description,
        },
        menus: menus.map(m => ({
          name: language === "en" ? m.nameEn : m.name,
          description: language === "en" ? m.descriptionEn : m.description,
          price: m.price,
          category: m.category,
        })),
        externalReviews: externalReviews.map(r => ({
          source: r.source,
          rating: r.rating,
          comment: language === "en" ? (r.commentEn || r.comment) : r.comment,
        })),
        insights,
      };

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          language,
          context,
          conversationHistory: chatMessages,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "오류",
        description: language === "en" ? "Failed to send message" : "메시지 전송에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Please log in to save restaurants");
      }
      
      if (isSaved) {
        await apiRequest("DELETE", `/api/saved/${restaurantId}`);
      } else {
        await apiRequest("POST", "/api/saved", { restaurantId });
      }
    },
    onSuccess: async () => {
      console.log('[Save mutation] Invalidating queries after save/unsave');
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/saved/check", restaurantId],
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/saved"],
        refetchType: 'all'
      });
      console.log('[Save mutation] Queries invalidated, cache should update');
      toast({
        title: isSaved ? (language === "en" ? "Removed from saved" : "저장 취소됨") : (language === "en" ? "Saved successfully" : "저장 완료"),
        description: isSaved 
          ? (language === "en" ? "Restaurant removed from your saved list" : "레스토랑이 저장 목록에서 제거되었습니다")
          : (language === "en" ? "Restaurant saved to your list" : "레스토랑이 저장되었습니다"),
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error) || error.message === "Please log in to save restaurants") {
        toast({
          title: language === "en" ? "Login Required" : "로그인 필요",
          description: language === "en" ? "Please log in to save restaurants" : "레스토랑을 저장하려면 로그인하세요",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
      } else {
        toast({
          title: language === "en" ? "Error" : "오류",
          description: language === "en" ? "Failed to save restaurant" : "레스토랑 저장에 실패했습니다",
          variant: "destructive",
        });
      }
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Please log in to write reviews");
      }
      
      if (editingReviewId) {
        await apiRequest("PATCH", `/api/reviews/${editingReviewId}`, {
          rating: reviewRating,
          comment: reviewComment,
        });
      } else {
        await apiRequest("POST", "/api/reviews", {
          restaurantId,
          rating: reviewRating,
          comment: reviewComment,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      setIsReviewDialogOpen(false);
      setReviewRating(0);
      setReviewComment("");
      setEditingReviewId(null);
      toast({
        title: editingReviewId ? (language === "en" ? "Review updated" : "리뷰 수정됨") : t("review.success"),
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error) || error.message === "Please log in to write reviews") {
        toast({
          title: language === "en" ? "Login Required" : "로그인 필요",
          description: language === "en" ? "Please log in to write reviews" : "리뷰를 작성하려면 로그인하세요",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
      } else {
        toast({
          title: t("review.error"),
          variant: "destructive",
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!isAuthenticated) {
        throw new Error("Please log in to delete reviews");
      }
      await apiRequest("DELETE", `/api/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      toast({
        title: language === "en" ? "Review deleted" : "리뷰 삭제됨",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to delete review" : "리뷰 삭제 실패",
        variant: "destructive",
      });
    },
  });

  // Review Response Mutations
  const responseCreateMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      if (!isAuthenticated || !isOwner) {
        throw new Error("Unauthorized");
      }
      await apiRequest("POST", "/api/review-responses", {
        reviewId,
        restaurantId,
        response,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-responses", restaurantId] });
      setIsResponseDialogOpen(false);
      setResponseText("");
      setEditingResponseReviewId(null);
      setEditingResponseId(null);
      toast({
        title: language === "en" ? "Response posted" : "답변이 등록되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to post response" : "답변 등록 실패",
        variant: "destructive",
      });
    },
  });

  const responseUpdateMutation = useMutation({
    mutationFn: async ({ responseId, response }: { responseId: string; response: string }) => {
      if (!isAuthenticated || !isOwner) {
        throw new Error("Unauthorized");
      }
      await apiRequest("PATCH", `/api/review-responses/${responseId}`, {
        restaurantId,
        response,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-responses", restaurantId] });
      setIsResponseDialogOpen(false);
      setResponseText("");
      setEditingResponseReviewId(null);
      setEditingResponseId(null);
      toast({
        title: language === "en" ? "Response updated" : "답변이 수정되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to update response" : "답변 수정 실패",
        variant: "destructive",
      });
    },
  });

  const responseDeleteMutation = useMutation({
    mutationFn: async (responseId: string) => {
      if (!isAuthenticated || !isOwner) {
        throw new Error("Unauthorized");
      }
      await apiRequest("DELETE", `/api/review-responses/${responseId}`, {
        restaurantId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-responses", restaurantId] });
      toast({
        title: language === "en" ? "Response deleted" : "답변이 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to delete response" : "답변 삭제 실패",
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

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm(language === "en" ? "Are you sure you want to delete this review?" : "이 리뷰를 삭제하시겠습니까?")) {
      deleteMutation.mutate(reviewId);
    }
  };

  const handleOpenResponseDialog = (reviewId: string, existingResponse?: ReviewResponse) => {
    setEditingResponseReviewId(reviewId);
    if (existingResponse) {
      setEditingResponseId(existingResponse.id);
      setResponseText(existingResponse.response);
    } else {
      setEditingResponseId(null);
      setResponseText("");
    }
    setIsResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      toast({
        title: language === "en" ? "Please enter a response" : "답변을 입력하세요",
        variant: "destructive",
      });
      return;
    }

    if (editingResponseId) {
      responseUpdateMutation.mutate({
        responseId: editingResponseId,
        response: responseText,
      });
    } else if (editingResponseReviewId) {
      responseCreateMutation.mutate({
        reviewId: editingResponseReviewId,
        response: responseText,
      });
    }
  };

  const handleDeleteResponse = (responseId: string) => {
    if (window.confirm(language === "en" ? "Are you sure you want to delete this response?" : "이 답변을 삭제하시겠습니까?")) {
      responseDeleteMutation.mutate(responseId);
    }
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
            <OptimizedImage
              src={restaurant.imageUrl}
              alt={restaurantName}
              className="w-full h-64"
              height={256}
              priority={true}
              objectFit="cover"
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">{t("restaurant.address")}</p>
                    <p className="text-sm text-muted-foreground mb-2" data-testid="text-address">
                      {restaurant.address}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="button-google-maps"
                      >
                        <Badge variant="outline" className="hover-elevate active-elevate-2 cursor-pointer text-xs gap-1">
                          <Navigation className="w-3 h-3" />
                          {language === "en" ? "Google Maps" : "구글 지도"}
                        </Badge>
                      </a>
                      <a
                        href={`https://map.naver.com/v5/search/${encodeURIComponent(restaurant.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="button-naver-maps"
                      >
                        <Badge variant="outline" className="hover-elevate active-elevate-2 cursor-pointer text-xs gap-1">
                          <Navigation className="w-3 h-3" />
                          {language === "en" ? "Naver Map" : "네이버 지도"}
                        </Badge>
                      </a>
                    </div>
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

            {/* Ad Slot 1 - Before Menu */}
            <AdSense slot="menu-top" format="auto" className="mb-6" />

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
                              <OptimizedImage
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full"
                                width={128}
                                height={80}
                                objectFit="cover"
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

            {/* AI Assistant Cards */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">{language === "en" ? "AI Assistant" : "AI 도우미"}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Review Analysis Card */}
                <Card 
                  className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => openAIChat("reviews")}
                  data-testid="card-ai-reviews"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">
                      {language === "en" ? "Review Analysis" : "리뷰 분석"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {language === "en" ? "Ask about reviews" : "리뷰 궁금한 점"}
                    </p>
                  </div>
                </Card>

                {/* Menu Recommendations Card */}
                <Card 
                  className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => openAIChat("menu")}
                  data-testid="card-ai-menu"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UtensilsCrossed className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">
                      {language === "en" ? "Menu Guide" : "메뉴 추천"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {language === "en" ? "Get menu tips" : "메뉴 추천받기"}
                    </p>
                  </div>
                </Card>

                {/* How to Eat Card */}
                <Card 
                  className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => openAIChat("howToEat")}
                  data-testid="card-ai-how-to-eat"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">
                      {language === "en" ? "How to Eat" : "먹는 방법"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {language === "en" ? "Learn eating tips" : "먹는 법 배우기"}
                    </p>
                  </div>
                </Card>

                {/* Ordering Tips Card */}
                <Card 
                  className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => openAIChat("ordering")}
                  data-testid="card-ai-ordering"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">
                      {language === "en" ? "Ordering Tips" : "주문 요령"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {language === "en" ? "Order like a local" : "현지인처럼 주문"}
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Ad Slot 2 - After AI Cards */}
            <AdSense slot="ai-cards-bottom" format="auto" className="mb-6" />

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
                  {reviews.map((review) => {
                    const isOwnReview = user && review.userId === user.id;
                    return (
                      <div key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0" data-testid={`review-${review.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{review.userName}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                              <span className="font-medium">{review.rating}</span>
                            </div>
                            {isOwnReview && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingReviewId(review.id);
                                    setReviewRating(review.rating);
                                    setReviewComment(review.comment);
                                    setIsReviewDialogOpen(true);
                                  }}
                                  data-testid={`button-edit-review-${review.id}`}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteReview(review.id)}
                                  data-testid={`button-delete-review-${review.id}`}
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(language)}
                        </p>

                        {/* Owner Response Section */}
                        {reviewResponses[review.id] ? (
                          <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/30 bg-muted/30 p-3 rounded-r" data-testid={`response-${review.id}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-primary" />
                                <p className="text-sm font-medium text-primary">
                                  {language === "en" ? "Owner's Response" : "사장님 답변"}
                                </p>
                              </div>
                              {isOwner && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleOpenResponseDialog(review.id, reviewResponses[review.id])}
                                    data-testid={`button-edit-response-${review.id}`}
                                  >
                                    {language === "en" ? "Edit" : "수정"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteResponse(reviewResponses[review.id].id)}
                                    data-testid={`button-delete-response-${review.id}`}
                                  >
                                    {language === "en" ? "Delete" : "삭제"}
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{reviewResponses[review.id].response}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(reviewResponses[review.id].createdAt).toLocaleDateString(language)}
                            </p>
                          </div>
                        ) : isOwner && (
                          <div className="mt-3 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenResponseDialog(review.id)}
                              data-testid={`button-add-response-${review.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {language === "en" ? "Respond" : "답변하기"}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Ad Slot 3 - After Reviews */}
            <AdSense slot="reviews-bottom" format="auto" className="mb-6" />
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={(open) => {
        setIsReviewDialogOpen(open);
        if (!open) {
          setEditingReviewId(null);
          setReviewRating(0);
          setReviewComment("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReviewId ? (language === "en" ? "Edit Review" : "리뷰 수정") : t("review.write")}</DialogTitle>
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

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={(open) => {
        setIsResponseDialogOpen(open);
        if (!open) {
          setEditingResponseReviewId(null);
          setEditingResponseId(null);
          setResponseText("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingResponseId 
                ? (language === "en" ? "Edit Response" : "답변 수정") 
                : (language === "en" ? "Respond to Review" : "리뷰에 답변하기")}
            </DialogTitle>
            <DialogDescription>
              {language === "en" 
                ? "Share your appreciation or address customer feedback" 
                : "고객의 리뷰에 감사를 표하거나 피드백에 응답하세요"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder={language === "en" 
                ? "Thank you for your feedback! We appreciate..." 
                : "소중한 리뷰 감사합니다. 저희는..."}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              data-testid="textarea-response"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResponseDialogOpen(false);
                setResponseText("");
                setEditingResponseReviewId(null);
                setEditingResponseId(null);
              }}
              data-testid="button-cancel-response"
            >
              {language === "en" ? "Cancel" : "취소"}
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={responseCreateMutation.isPending || responseUpdateMutation.isPending || !responseText.trim()}
              data-testid="button-submit-response"
            >
              {(responseCreateMutation.isPending || responseUpdateMutation.isPending) 
                ? "..." 
                : (language === "en" ? "Post" : "등록")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Chat Dialog */}
      <Dialog open={isAIChatOpen} onOpenChange={closeAIChat}>
        <DialogContent className="max-w-md h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentAICard === "reviews" && <MessageSquare className="w-5 h-5 text-primary" />}
                {currentAICard === "menu" && <UtensilsCrossed className="w-5 h-5 text-primary" />}
                {currentAICard === "howToEat" && <Lightbulb className="w-5 h-5 text-primary" />}
                {currentAICard === "ordering" && <MessageCircle className="w-5 h-5 text-primary" />}
                <DialogTitle>
                  {currentAICard === "reviews" && (language === "en" ? "Review Analysis" : "리뷰 분석")}
                  {currentAICard === "menu" && (language === "en" ? "Menu Guide" : "메뉴 추천")}
                  {currentAICard === "howToEat" && (language === "en" ? "How to Eat" : "먹는 방법")}
                  {currentAICard === "ordering" && (language === "en" ? "Ordering Tips" : "주문 요령")}
                </DialogTitle>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={closeAIChat}
                data-testid="button-close-ai-chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DialogDescription className="text-xs">
              {language === "en" 
                ? "Chat with AI assistant about " + restaurantName
                : restaurantName + " 에 대해 AI와 대화하기"}
            </DialogDescription>
          </DialogHeader>

          {/* Chat Messages */}
          <div 
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            data-testid="chat-messages-container"
          >
            {chatMessages.length === 0 && !isSendingMessage ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {language === "en" 
                    ? "Start a conversation with AI" 
                    : "AI와 대화를 시작하세요"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentAICard === "reviews" && (language === "en" 
                    ? "Ask about customer reviews and ratings" 
                    : "고객 리뷰와 평점에 대해 물어보세요")}
                  {currentAICard === "menu" && (language === "en" 
                    ? "Get personalized menu recommendations" 
                    : "맞춤형 메뉴 추천을 받아보세요")}
                  {currentAICard === "howToEat" && (language === "en" 
                    ? "Learn how to eat Korean food properly" 
                    : "한국 음식 먹는 법을 배워보세요")}
                  {currentAICard === "ordering" && (language === "en" 
                    ? "Learn ordering tips and phrases" 
                    : "주문 팁과 표현을 배워보세요")}
                </p>
              </div>
            ) : chatMessages.length === 0 && isSendingMessage ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {language === "en" 
                    ? "AI is analyzing..." 
                    : "AI가 분석 중입니다..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentAICard === "reviews" && (language === "en" 
                    ? "Analyzing customer reviews" 
                    : "고객 리뷰를 분석하고 있습니다")}
                  {currentAICard === "menu" && (language === "en" 
                    ? "Preparing menu recommendations" 
                    : "메뉴 추천을 준비하고 있습니다")}
                  {currentAICard === "howToEat" && (language === "en" 
                    ? "Gathering cultural insights" 
                    : "문화 정보를 모으고 있습니다")}
                  {currentAICard === "ordering" && (language === "en" 
                    ? "Preparing ordering tips" 
                    : "주문 팁을 준비하고 있습니다")}
                </p>
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`chat-message-${index}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isSendingMessage && chatMessages.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="px-4 pb-4 pt-3 border-t">
            <div className="flex gap-2">
              <Input
                placeholder={language === "en" ? "Type your message..." : "메시지를 입력하세요..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                disabled={isSendingMessage}
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || isSendingMessage}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
