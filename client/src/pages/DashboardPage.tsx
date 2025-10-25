import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Store, TrendingUp, Star, MessageSquare, Tag, Plus, Edit, Trash2, ChevronRight, Image, Reply, Utensils, Sparkles, Target, Users, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant, Promotion, RestaurantImage, Review, ReviewResponse, Menu } from "@shared/schema";

interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  monthlyReviews: { month: string; count: number }[];
}

interface ReviewWithResponse extends Review {
  response: ReviewResponse | null;
}

interface AIAnalysisResponse {
  restaurant: Restaurant;
  analysis: {
    businessAnalysis: { ko: string; en: string };
    competitorAnalysis: { ko: string; en: string };
    strategicRecommendations: { ko: string; en: string };
  };
  competitors: Restaurant[];
  generatedAt: string;
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewWithResponse | null>(null);
  const [responseText, setResponseText] = useState("");
  
  // Menu dialog state
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menuNameKo, setMenuNameKo] = useState("");
  const [menuNameEn, setMenuNameEn] = useState("");
  const [menuDescKo, setMenuDescKo] = useState("");
  const [menuDescEn, setMenuDescEn] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuCategory, setMenuCategory] = useState("");
  const [menuImageUrl, setMenuImageUrl] = useState("");
  const [menuIsPopular, setMenuIsPopular] = useState(false);
  const [menuIsRecommended, setMenuIsRecommended] = useState(false);

  // Promotion form state
  const [promotionTitle, setPromotionTitle] = useState("");
  const [promotionTitleEn, setPromotionTitleEn] = useState("");
  const [promotionDescription, setPromotionDescription] = useState("");
  const [promotionDescriptionEn, setPromotionDescriptionEn] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "amount" | "special">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch user's restaurants
  const { data: restaurants = [], isLoading: loadingRestaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/my-restaurants"],
    enabled: isAuthenticated,
  });

  // Fetch dashboard stats for selected restaurant
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/restaurants", selectedRestaurant?.id, "dashboard-stats"],
    enabled: !!selectedRestaurant,
  });

  // Fetch promotions for selected restaurant
  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["/api/restaurants", selectedRestaurant?.id, "all-promotions"],
    enabled: !!selectedRestaurant,
  });

  // Fetch images for selected restaurant
  const { data: images = [] } = useQuery<RestaurantImage[]>({
    queryKey: ["/api/restaurants", selectedRestaurant?.id, "images"],
    enabled: !!selectedRestaurant,
  });

  // Fetch reviews with responses for selected restaurant
  const { data: reviewsWithResponses = [] } = useQuery<ReviewWithResponse[]>({
    queryKey: ["/api/restaurants", selectedRestaurant?.id, "reviews-with-responses"],
    enabled: !!selectedRestaurant,
  });

  // Fetch menus for selected restaurant
  const { data: menus = [], isLoading: menusLoading } = useQuery<Menu[]>({
    queryKey: ["/api/restaurants", selectedRestaurant?.id, "menus"],
    enabled: !!selectedRestaurant,
  });

  // Debug logging
  useEffect(() => {
    console.log("[Dashboard] Menus state changed:", menus, "length:", menus?.length, "selected restaurant:", selectedRestaurant?.id);
  }, [menus, selectedRestaurant?.id]);

  // Fetch AI analysis for selected restaurant
  const { data: aiAnalysis, refetch: refetchAIAnalysis, isLoading: isLoadingAIAnalysis } = useQuery<AIAnalysisResponse>({
    queryKey: ["/api/restaurants", selectedRestaurant?.id, "ai-analysis"],
    enabled: false, // Only fetch when user clicks "Generate Analysis"
  });

  // Promotion mutations
  const createPromotionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/promotions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant?.id, "all-promotions"] });
      setIsPromotionDialogOpen(false);
      resetPromotionForm();
      toast({
        title: language === "en" ? "Promotion created" : "프로모션이 생성되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to create promotion" : "프로모션 생성 실패",
        variant: "destructive",
      });
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/promotions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant?.id, "all-promotions"] });
      setIsPromotionDialogOpen(false);
      resetPromotionForm();
      toast({
        title: language === "en" ? "Promotion updated" : "프로모션이 수정되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to update promotion" : "프로모션 수정 실패",
        variant: "destructive",
      });
    },
  });

  const deletePromotionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/promotions/${id}`, {
        restaurantId: selectedRestaurant?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant?.id, "all-promotions"] });
      toast({
        title: language === "en" ? "Promotion deleted" : "프로모션이 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to delete promotion" : "프로모션 삭제 실패",
        variant: "destructive",
      });
    },
  });

  // Image mutations (using file upload)
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`/api/restaurants/${selectedRestaurant?.id}/upload-image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant?.id, "images"] });
      setIsImageDialogOpen(false);
      setSelectedImageFile(null);
      toast({
        title: language === "en" ? "Image uploaded" : "이미지가 업로드되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to upload image" : "이미지 업로드 실패",
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/restaurant-images/${id}`, {
        restaurantId: selectedRestaurant?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant?.id, "images"] });
      toast({
        title: language === "en" ? "Image deleted" : "이미지가 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to delete image" : "이미지 삭제 실패",
        variant: "destructive",
      });
    },
  });

  // Review response mutations
  const createResponseMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      await apiRequest("POST", "/api/review-responses", {
        reviewId,
        restaurantId: selectedRestaurant?.id,
        response,
      });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/restaurants", selectedRestaurant?.id, "reviews-with-responses"] });
      setIsResponseDialogOpen(false);
      setResponseText("");
      setSelectedReview(null);
      toast({
        title: language === "en" ? "Response posted" : "응답이 게시되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to post response" : "응답 게시 실패",
        variant: "destructive",
      });
    },
  });

  const updateResponseMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      await apiRequest("PATCH", `/api/review-responses/${id}`, {
        restaurantId: selectedRestaurant?.id,
        response,
      });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/restaurants", selectedRestaurant?.id, "reviews-with-responses"] });
      setIsResponseDialogOpen(false);
      setResponseText("");
      setSelectedReview(null);
      toast({
        title: language === "en" ? "Response updated" : "응답이 수정되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to update response" : "응답 수정 실패",
        variant: "destructive",
      });
    },
  });

  const deleteResponseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/review-responses/${id}`, {
        restaurantId: selectedRestaurant?.id,
      });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/restaurants", selectedRestaurant?.id, "reviews-with-responses"] });
      toast({
        title: language === "en" ? "Response deleted" : "응답이 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to delete response" : "응답 삭제 실패",
        variant: "destructive",
      });
    },
  });

  // Menu mutations
  const createMenuMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/menus", data);
      return await response.json();
    },
    onSuccess: async (newMenu) => {
      console.log("[Dashboard] Menu created, response:", newMenu);
      
      // Invalidate and refetch menus
      const queryKey = ["/api/restaurants", selectedRestaurant?.id, "menus"];
      console.log("[Dashboard] Invalidating and refetching with key:", queryKey);
      
      await queryClient.invalidateQueries({ queryKey });
      console.log("[Dashboard] Invalidate and refetch complete");
      
      setIsMenuDialogOpen(false);
      resetMenuForm();
      toast({
        title: language === "en" ? "Menu item created" : "메뉴가 생성되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to create menu item" : "메뉴 생성 실패",
        variant: "destructive",
      });
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/menus/${id}`, data);
    },
    onSuccess: async () => {
      const queryKey = ["/api/restaurants", selectedRestaurant?.id, "menus"];
      await queryClient.invalidateQueries({ queryKey });
      setIsMenuDialogOpen(false);
      resetMenuForm();
      toast({
        title: language === "en" ? "Menu item updated" : "메뉴가 수정되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to update menu item" : "메뉴 수정 실패",
        variant: "destructive",
      });
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/menus/${id}`, {
        restaurantId: selectedRestaurant?.id,
      });
    },
    onSuccess: async () => {
      const queryKey = ["/api/restaurants", selectedRestaurant?.id, "menus"];
      await queryClient.invalidateQueries({ queryKey });
      toast({
        title: language === "en" ? "Menu item deleted" : "메뉴가 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to delete menu item" : "메뉴 삭제 실패",
        variant: "destructive",
      });
    },
  });

  const resetPromotionForm = () => {
    setPromotionTitle("");
    setPromotionTitleEn("");
    setPromotionDescription("");
    setPromotionDescriptionEn("");
    setDiscountType("percentage");
    setDiscountValue("");
    setStartDate("");
    setEndDate("");
    setEditingPromotion(null);
  };

  const resetMenuForm = () => {
    setMenuNameKo("");
    setMenuNameEn("");
    setMenuDescKo("");
    setMenuDescEn("");
    setMenuPrice("");
    setMenuCategory("");
    setMenuImageUrl("");
    setMenuIsPopular(false);
    setMenuIsRecommended(false);
    setEditingMenu(null);
  };

  const handleOpenPromotionDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setPromotionTitle(promotion.title);
      setPromotionTitleEn(promotion.titleEn);
      setPromotionDescription(promotion.description);
      setPromotionDescriptionEn(promotion.descriptionEn);
      setDiscountType(promotion.discountType as "percentage" | "amount" | "special");
      setDiscountValue(promotion.discountValue?.toString() || "");
      setStartDate(new Date(promotion.startDate).toISOString().split('T')[0]);
      setEndDate(new Date(promotion.endDate).toISOString().split('T')[0]);
    } else {
      resetPromotionForm();
    }
    setIsPromotionDialogOpen(true);
  };

  const handleSubmitPromotion = () => {
    if (!selectedRestaurant || !promotionTitle || !promotionTitleEn || !startDate || !endDate) {
      toast({
        title: language === "en" ? "Please fill all required fields" : "모든 필수 항목을 입력하세요",
        variant: "destructive",
      });
      return;
    }

    const data = {
      restaurantId: selectedRestaurant.id,
      title: promotionTitle,
      titleEn: promotionTitleEn,
      description: promotionDescription,
      descriptionEn: promotionDescriptionEn,
      discountType,
      discountValue: discountValue ? parseInt(discountValue) : null,
      startDate,
      endDate,
    };

    if (editingPromotion) {
      updatePromotionMutation.mutate({ id: editingPromotion.id, data });
    } else {
      createPromotionMutation.mutate(data);
    }
  };

  const handleDeletePromotion = (id: string) => {
    if (window.confirm(language === "en" ? "Are you sure you want to delete this promotion?" : "이 프로모션을 삭제하시겠습니까?")) {
      deletePromotionMutation.mutate(id);
    }
  };

  const handleOpenResponseDialog = (review: ReviewWithResponse) => {
    setSelectedReview(review);
    setResponseText(review.response?.response || "");
    setIsResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedReview || !responseText.trim()) {
      toast({
        title: language === "en" ? "Please enter a response" : "응답을 입력하세요",
        variant: "destructive",
      });
      return;
    }

    if (selectedReview.response) {
      // Update existing response
      updateResponseMutation.mutate({
        id: selectedReview.response.id,
        response: responseText,
      });
    } else {
      // Create new response
      createResponseMutation.mutate({
        reviewId: selectedReview.id,
        response: responseText,
      });
    }
  };

  const handleDeleteResponse = (id: string) => {
    if (window.confirm(language === "en" ? "Are you sure you want to delete this response?" : "이 응답을 삭제하시겠습니까?")) {
      deleteResponseMutation.mutate(id);
    }
  };

  const handleOpenMenuDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuNameKo(menu.name);
      setMenuNameEn(menu.nameEn);
      setMenuDescKo(menu.description || "");
      setMenuDescEn(menu.descriptionEn || "");
      setMenuPrice(menu.price.toString());
      setMenuCategory(menu.category || "");
      setMenuImageUrl(menu.imageUrl || "");
      setMenuIsPopular(menu.isPopular === 1);
      setMenuIsRecommended(menu.isRecommended === 1);
    } else {
      resetMenuForm();
    }
    setIsMenuDialogOpen(true);
  };

  const handleSubmitMenu = () => {
    if (!selectedRestaurant || !menuNameKo || !menuNameEn || !menuPrice) {
      toast({
        title: language === "en" ? "Please fill all required fields" : "모든 필수 항목을 입력하세요",
        variant: "destructive",
      });
      return;
    }

    const data = {
      restaurantId: selectedRestaurant.id,
      name: menuNameKo,
      nameEn: menuNameEn,
      description: menuDescKo || null,
      descriptionEn: menuDescEn || null,
      price: parseInt(menuPrice),
      category: menuCategory || null,
      imageUrl: menuImageUrl || null,
      isPopular: menuIsPopular ? 1 : 0,
      isRecommended: menuIsRecommended ? 1 : 0,
      displayOrder: menus?.length || 0,
    };

    if (editingMenu) {
      updateMenuMutation.mutate({ id: editingMenu.id, data });
    } else {
      createMenuMutation.mutate(data);
    }
  };

  const handleDeleteMenu = (id: string) => {
    if (window.confirm(language === "en" ? "Are you sure you want to delete this menu item?" : "이 메뉴를 삭제하시겠습니까?")) {
      deleteMenuMutation.mutate(id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md">
          <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">
            {language === "en" ? "Login Required" : "로그인이 필요합니다"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {language === "en" 
              ? "Please log in to access your restaurant dashboard" 
              : "레스토랑 대시보드에 접근하려면 로그인하세요"}
          </p>
          <Button onClick={() => window.location.href = "/api/login"} data-testid="button-login">
            {language === "en" ? "Log In" : "로그인"}
          </Button>
        </Card>
      </div>
    );
  }

  if (loadingRestaurants) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4">
          <div className="h-8 bg-muted rounded animate-pulse mb-6 w-1/3" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md">
          <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">
            {language === "en" ? "No Restaurants" : "레스토랑 없음"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {language === "en" 
              ? "You don't own any restaurants yet" 
              : "아직 소유한 레스토랑이 없습니다"}
          </p>
          <Link href="/">
            <Button variant="outline" data-testid="button-back-home">
              {language === "en" ? "Go Home" : "홈으로"}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const restaurantName = selectedRestaurant 
    ? (language === "en" ? selectedRestaurant.nameEn : selectedRestaurant.name)
    : "";

  return (
    <>
      <SEO
        title={language === "en" ? "Restaurant Dashboard" : "레스토랑 대시보드"}
        description={language === "en" ? "Manage your restaurant, view analytics, and respond to reviews" : "레스토랑 관리, 분석 보기, 리뷰 응답"}
      />
      
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-6xl mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {language === "en" ? "Restaurant Dashboard" : "레스토랑 대시보드"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Manage your restaurant and promotions" : "레스토랑과 프로모션을 관리하세요"}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-home">
                {language === "en" ? "Home" : "홈"}
              </Button>
            </Link>
          </div>

          {/* Restaurant Selection */}
          {!selectedRestaurant ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {language === "en" ? "Select a Restaurant" : "레스토랑 선택"}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="p-4 hover-elevate cursor-pointer"
                    onClick={() => setSelectedRestaurant(restaurant)}
                    data-testid={`restaurant-card-${restaurant.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">
                        {language === "en" ? restaurant.nameEn : restaurant.name}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{restaurant.district}</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                      <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Selected Restaurant Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{restaurantName}</h2>
                  <p className="text-sm text-muted-foreground">{selectedRestaurant.district}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRestaurant(null)}
                  data-testid="button-change-restaurant"
                >
                  {language === "en" ? "Change Restaurant" : "레스토랑 변경"}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <Link href={`/restaurant/${selectedRestaurant.id}`}>
                  <Card className="p-4 hover-elevate cursor-pointer" data-testid="card-view-page">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">
                          {language === "en" ? "View Restaurant Page" : "레스토랑 페이지 보기"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {language === "en" ? "See how customers see your restaurant" : "고객이 보는 페이지 확인"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>

                <Card
                  className="p-4 hover-elevate cursor-pointer"
                  onClick={() => handleOpenPromotionDialog()}
                  data-testid="card-create-promotion"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">
                        {language === "en" ? "Create Promotion" : "프로모션 생성"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === "en" ? "Add a special offer for customers" : "고객을 위한 특별 제안 추가"}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Statistics */}
              {stats && (
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {language === "en" ? "Total Reviews" : "전체 리뷰"}
                      </p>
                    </div>
                    <p className="text-2xl font-bold" data-testid="stat-total-reviews">{stats.totalReviews}</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-[hsl(var(--accent-success))]" />
                      <p className="text-sm text-muted-foreground">
                        {language === "en" ? "Average Rating" : "평균 평점"}
                      </p>
                    </div>
                    <p className="text-2xl font-bold" data-testid="stat-average-rating">{stats.averageRating.toFixed(1)}</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {language === "en" ? "This Month" : "이번 달"}
                      </p>
                    </div>
                    <p className="text-2xl font-bold" data-testid="stat-monthly-reviews">
                      {stats.monthlyReviews?.[0]?.count || 0}
                    </p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {language === "en" ? "Active Promotions" : "활성 프로모션"}
                      </p>
                    </div>
                    <p className="text-2xl font-bold" data-testid="stat-promotions">
                      {promotions.filter(p => p.isActive === 1).length}
                    </p>
                  </Card>
                </div>
              )}

              {/* Rating Distribution */}
              {stats && stats.ratingDistribution.length > 0 && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold mb-4">
                    {language === "en" ? "Rating Distribution" : "평점 분포"}
                  </h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const data = stats.ratingDistribution.find(r => r.rating === rating);
                      const count = data?.count || 0;
                      const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                      
                      return (
                        <div key={rating} className="flex items-center gap-3" data-testid={`rating-dist-${rating}`}>
                          <div className="flex items-center gap-1 w-16">
                            <span className="text-sm font-medium">{rating}</span>
                            <Star className="w-3 h-3 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                          </div>
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-[hsl(var(--accent-success))]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Promotions List */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {language === "en" ? "Promotions" : "프로모션"}
                  </h3>
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleOpenPromotionDialog()}
                    data-testid="button-add-promotion"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {language === "en" ? "Add" : "추가"}
                  </Button>
                </div>

                {promotions.length === 0 ? (
                  <div className="text-center py-8">
                    <Tag className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {language === "en" ? "No promotions yet" : "프로모션이 없습니다"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "en" ? "Create your first promotion to attract customers" : "첫 프로모션을 만들어 고객을 유치하세요"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {promotions.map((promotion) => (
                      <Card key={promotion.id} className="p-3" data-testid={`promotion-item-${promotion.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">
                                {language === "en" ? promotion.titleEn : promotion.title}
                              </h4>
                              {promotion.isActive === 1 ? (
                                <Badge variant="default" className="text-xs">
                                  {language === "en" ? "Active" : "활성"}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  {language === "en" ? "Inactive" : "비활성"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {language === "en" ? promotion.descriptionEn : promotion.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(promotion.startDate).toLocaleDateString(language)} - {new Date(promotion.endDate).toLocaleDateString(language)}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenPromotionDialog(promotion)}
                              data-testid={`button-edit-promotion-${promotion.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePromotion(promotion.id)}
                              data-testid={`button-delete-promotion-${promotion.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              {/* Menu Management Section */}
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">
                      {language === "en" ? "Menu Management" : "메뉴 관리"}
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenMenuDialog()}
                    data-testid="button-add-menu"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {language === "en" ? "Add" : "추가"}
                  </Button>
                </div>

                {menus.length === 0 ? (
                  <div className="text-center py-8">
                    <Utensils className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {language === "en" ? "No menu items yet" : "메뉴가 없습니다"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "en" ? "Add menu items to showcase your dishes" : "요리를 소개할 메뉴를 추가하세요"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {menus.map((menu) => (
                      <Card key={menu.id} className="p-3" data-testid={`menu-item-${menu.id}`}>
                        <div className="flex gap-3">
                          {menu.imageUrl && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={menu.imageUrl}
                                alt={language === "en" ? menu.nameEn : menu.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">
                                  {language === "en" ? menu.nameEn : menu.name}
                                </h4>
                                {menu.category && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {menu.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {menu.isPopular === 1 && (
                                  <Badge variant="default" className="text-xs">
                                    {language === "en" ? "Popular" : "인기"}
                                  </Badge>
                                )}
                                {menu.isRecommended === 1 && (
                                  <Badge variant="default" className="text-xs">
                                    {language === "en" ? "Recommended" : "추천"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {menu.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                                {language === "en" ? menu.descriptionEn : menu.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className="font-semibold text-primary">
                                ₩{menu.price?.toLocaleString() || '0'}
                              </p>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenMenuDialog(menu)}
                                  data-testid={`button-edit-menu-${menu.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteMenu(menu.id)}
                                  data-testid={`button-delete-menu-${menu.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              {/* Images Section */}
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">
                      {language === "en" ? "Restaurant Images" : "레스토랑 이미지"}
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsImageDialogOpen(true)}
                    data-testid="button-add-image"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {language === "en" ? "Add" : "추가"}
                  </Button>
                </div>

                {images.length === 0 ? (
                  <div className="text-center py-8">
                    <Image className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {language === "en" ? "No images yet" : "이미지가 없습니다"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "en" ? "Add images to showcase your restaurant" : "레스토랑을 소개할 이미지를 추가하세요"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img
                            src={image.imageUrl}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteImageMutation.mutate(image.id)}
                          data-testid={`button-delete-image-${image.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Reviews & Responses Section */}
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">
                      {language === "en" ? "Customer Reviews & Responses" : "고객 리뷰 및 응답"}
                    </h3>
                  </div>
                  <Badge variant="secondary">
                    {reviewsWithResponses.length} {language === "en" ? "reviews" : "리뷰"}
                  </Badge>
                </div>

                {reviewsWithResponses.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {language === "en" ? "No reviews yet" : "아직 리뷰가 없습니다"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "en" ? "Customer reviews will appear here" : "고객 리뷰가 여기에 표시됩니다"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewsWithResponses.map((review) => (
                      <Card key={review.id} className="p-4" data-testid={`review-item-${review.id}`}>
                        {/* Review */}
                        <div className="mb-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{review.userName}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]"
                                        : "fill-muted text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString(language)}
                            </p>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>

                        {/* Response */}
                        {review.response ? (
                          <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Reply className="w-4 h-4 text-primary" />
                                <p className="text-sm font-medium text-primary">
                                  {language === "en" ? "Your Response" : "귀하의 응답"}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenResponseDialog(review)}
                                  data-testid={`button-edit-response-${review.id}`}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteResponse(review.response!.id)}
                                  data-testid={`button-delete-response-${review.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm">{review.response.response}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(review.response.createdAt).toLocaleDateString(language)}
                            </p>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenResponseDialog(review)}
                            className="w-full"
                            data-testid={`button-respond-${review.id}`}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            {language === "en" ? "Respond to Review" : "리뷰에 응답하기"}
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              {/* AI Business Analysis Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">
                      {language === "en" ? "AI Business Insights" : "AI 비즈니스 분석"}
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => refetchAIAnalysis()}
                    disabled={isLoadingAIAnalysis}
                    data-testid="button-generate-ai-analysis"
                  >
                    {isLoadingAIAnalysis ? "..." : (language === "en" ? "Generate Analysis" : "분석 생성")}
                  </Button>
                </div>

                {!aiAnalysis && !isLoadingAIAnalysis && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {language === "en" ? "No AI analysis generated yet" : "아직 AI 분석이 생성되지 않았습니다"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "en" 
                        ? "Click 'Generate Analysis' to get AI-powered business insights" 
                        : "'분석 생성'을 클릭하여 AI 기반 비즈니스 인사이트를 받으세요"}
                    </p>
                  </div>
                )}

                {isLoadingAIAnalysis && (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === "en" ? "Generating AI analysis..." : "AI 분석 생성 중..."}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "en" ? "This may take a few moments" : "잠시만 기다려 주세요"}
                    </p>
                  </div>
                )}

                {aiAnalysis && (
                  <div className="space-y-4">
                    {/* Business Analysis Card */}
                    <Card className="p-4" data-testid="card-business-analysis">
                      <div className="flex items-start gap-3 mb-3">
                        <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-2">
                            {language === "en" ? "Business Analysis" : "AI 업체 분석"}
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {language === "en" 
                              ? aiAnalysis.analysis.businessAnalysis.en 
                              : aiAnalysis.analysis.businessAnalysis.ko}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Competitor Analysis Card */}
                    <Card className="p-4" data-testid="card-competitor-analysis">
                      <div className="flex items-start gap-3 mb-3">
                        <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">
                            {language === "en" ? "Competitor Analysis" : "경쟁업체 분석"}
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line mb-3">
                            {language === "en" 
                              ? aiAnalysis.analysis.competitorAnalysis.en 
                              : aiAnalysis.analysis.competitorAnalysis.ko}
                          </p>
                          {aiAnalysis.competitors && aiAnalysis.competitors.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                {language === "en" ? "Nearby Competitors:" : "인근 경쟁업체:"}
                              </p>
                              <div className="space-y-2">
                                {aiAnalysis.competitors.slice(0, 3).map((competitor) => (
                                  <div 
                                    key={competitor.id} 
                                    className="flex items-center justify-between text-xs"
                                    data-testid={`competitor-${competitor.id}`}
                                  >
                                    <span>{language === "en" ? competitor.nameEn : competitor.name}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {competitor.district}
                                      </Badge>
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                                        <span>{competitor.rating.toFixed(1)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Strategic Recommendations Card */}
                    <Card className="p-4" data-testid="card-strategic-recommendations">
                      <div className="flex items-start gap-3 mb-3">
                        <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-2">
                            {language === "en" ? "Strategic Recommendations" : "AI 전략 제안"}
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {language === "en" 
                              ? aiAnalysis.analysis.strategicRecommendations.en 
                              : aiAnalysis.analysis.strategicRecommendations.ko}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <p className="text-xs text-muted-foreground text-center">
                      {language === "en" ? "Analysis generated on" : "분석 생성 일시:"} {new Date(aiAnalysis.generatedAt).toLocaleString(language)}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Promotion Dialog */}
      <Dialog open={isPromotionDialogOpen} onOpenChange={(open) => {
        setIsPromotionDialogOpen(open);
        if (!open) resetPromotionForm();
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion 
                ? (language === "en" ? "Edit Promotion" : "프로모션 수정") 
                : (language === "en" ? "Create Promotion" : "프로모션 생성")}
            </DialogTitle>
            <DialogDescription>
              {restaurantName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Title (Korean)" : "제목 (한국어)"}
              </label>
              <Input
                value={promotionTitle}
                onChange={(e) => setPromotionTitle(e.target.value)}
                placeholder={language === "en" ? "e.g., 10% Discount" : "예: 10% 할인"}
                data-testid="input-promotion-title"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Title (English)" : "제목 (영어)"}
              </label>
              <Input
                value={promotionTitleEn}
                onChange={(e) => setPromotionTitleEn(e.target.value)}
                placeholder="e.g., 10% Discount"
                data-testid="input-promotion-title-en"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Description (Korean)" : "설명 (한국어)"}
              </label>
              <Textarea
                value={promotionDescription}
                onChange={(e) => setPromotionDescription(e.target.value)}
                placeholder={language === "en" ? "Promotion details..." : "프로모션 상세 내용..."}
                rows={3}
                data-testid="textarea-promotion-description"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Description (English)" : "설명 (영어)"}
              </label>
              <Textarea
                value={promotionDescriptionEn}
                onChange={(e) => setPromotionDescriptionEn(e.target.value)}
                placeholder="Promotion details..."
                rows={3}
                data-testid="textarea-promotion-description-en"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Discount Type" : "할인 유형"}
              </label>
              <Select value={discountType} onValueChange={(value) => setDiscountType(value as any)}>
                <SelectTrigger data-testid="select-discount-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    {language === "en" ? "Percentage (%)" : "퍼센트 (%)"}
                  </SelectItem>
                  <SelectItem value="amount">
                    {language === "en" ? "Fixed Amount (₩)" : "고정 금액 (₩)"}
                  </SelectItem>
                  <SelectItem value="special">
                    {language === "en" ? "Special Offer" : "특별 제안"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {discountType !== "special" && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Discount Value" : "할인 값"}
                </label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "10" : "5000"}
                  data-testid="input-discount-value"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Start Date" : "시작일"}
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="input-start-date"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "End Date" : "종료일"}
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPromotionDialogOpen(false);
                resetPromotionForm();
              }}
              data-testid="button-cancel-promotion"
            >
              {language === "en" ? "Cancel" : "취소"}
            </Button>
            <Button
              onClick={handleSubmitPromotion}
              disabled={createPromotionMutation.isPending || updatePromotionMutation.isPending}
              data-testid="button-submit-promotion"
            >
              {(createPromotionMutation.isPending || updatePromotionMutation.isPending) 
                ? "..." 
                : (language === "en" ? "Save" : "저장")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={(open) => {
        setIsImageDialogOpen(open);
        if (!open) setSelectedImageFile(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === "en" ? "Add Restaurant Image" : "레스토랑 이미지 추가"}
            </DialogTitle>
            <DialogDescription>
              {restaurantName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Select Image File" : "이미지 파일 선택"}
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: language === "en" ? "File too large" : "파일이 너무 큽니다",
                        description: language === "en" ? "Maximum file size is 5MB" : "최대 파일 크기는 5MB입니다",
                        variant: "destructive",
                      });
                      return;
                    }
                    setSelectedImageFile(file);
                  }
                }}
                data-testid="input-image-file"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {language === "en" 
                  ? "Upload an image file (JPG, PNG, GIF, WebP). Max 5MB" 
                  : "이미지 파일을 업로드하세요 (JPG, PNG, GIF, WebP). 최대 5MB"}
              </p>
            </div>

            {selectedImageFile && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Preview" : "미리보기"}
                </label>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={URL.createObjectURL(selectedImageFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedImageFile.name} ({(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImageDialogOpen(false);
                setSelectedImageFile(null);
              }}
              data-testid="button-cancel-image"
            >
              {language === "en" ? "Cancel" : "취소"}
            </Button>
            <Button
              onClick={() => selectedImageFile && uploadImageMutation.mutate(selectedImageFile)}
              disabled={!selectedImageFile || uploadImageMutation.isPending}
              data-testid="button-submit-image"
            >
              {uploadImageMutation.isPending 
                ? "..." 
                : (language === "en" ? "Upload Image" : "이미지 업로드")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={(open) => {
        setIsResponseDialogOpen(open);
        if (!open) {
          setSelectedReview(null);
          setResponseText("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedReview?.response 
                ? (language === "en" ? "Edit Response" : "응답 수정") 
                : (language === "en" ? "Respond to Review" : "리뷰에 응답하기")}
            </DialogTitle>
            <DialogDescription>
              {selectedReview && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-sm">{selectedReview.userName}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: selectedReview.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedReview.comment}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Your Response" : "귀하의 응답"}
              </label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={language === "en" 
                  ? "Thank you for your review! We're glad you enjoyed..." 
                  : "리뷰 감사합니다! 즐거운 시간 보내셨다니..."}
                rows={5}
                data-testid="textarea-response"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {language === "en"
                  ? "Be professional and courteous in your response"
                  : "전문적이고 정중하게 응답하세요"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResponseDialogOpen(false);
                setSelectedReview(null);
                setResponseText("");
              }}
              data-testid="button-cancel-response"
            >
              {language === "en" ? "Cancel" : "취소"}
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={!responseText.trim() || createResponseMutation.isPending || updateResponseMutation.isPending}
              data-testid="button-submit-response"
            >
              {(createResponseMutation.isPending || updateResponseMutation.isPending) 
                ? "..." 
                : (language === "en" ? "Submit Response" : "응답 제출")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={(open) => {
        setIsMenuDialogOpen(open);
        if (!open) resetMenuForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMenu 
                ? (language === "en" ? "Edit Menu Item" : "메뉴 수정") 
                : (language === "en" ? "Add Menu Item" : "메뉴 추가")}
            </DialogTitle>
            <DialogDescription>
              {restaurantName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Name (Korean)" : "이름 (한국어)"} <span className="text-destructive">*</span>
                </label>
                <Input
                  value={menuNameKo}
                  onChange={(e) => setMenuNameKo(e.target.value)}
                  placeholder={language === "en" ? "e.g., 김치찌개" : "예: 김치찌개"}
                  data-testid="input-menu-name-ko"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Name (English)" : "이름 (영어)"} <span className="text-destructive">*</span>
                </label>
                <Input
                  value={menuNameEn}
                  onChange={(e) => setMenuNameEn(e.target.value)}
                  placeholder="e.g., Kimchi Stew"
                  data-testid="input-menu-name-en"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Description (Korean)" : "설명 (한국어)"}
                </label>
                <Textarea
                  value={menuDescKo}
                  onChange={(e) => setMenuDescKo(e.target.value)}
                  placeholder={language === "en" ? "Menu description..." : "메뉴 설명..."}
                  rows={3}
                  data-testid="textarea-menu-desc-ko"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Description (English)" : "설명 (영어)"}
                </label>
                <Textarea
                  value={menuDescEn}
                  onChange={(e) => setMenuDescEn(e.target.value)}
                  placeholder="Menu description..."
                  rows={3}
                  data-testid="textarea-menu-desc-en"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Price (₩)" : "가격 (₩)"} <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  value={menuPrice}
                  onChange={(e) => setMenuPrice(e.target.value)}
                  placeholder="15000"
                  data-testid="input-menu-price"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Category" : "카테고리"}
                </label>
                <Input
                  value={menuCategory}
                  onChange={(e) => setMenuCategory(e.target.value)}
                  placeholder={language === "en" ? "e.g., Main Dish" : "예: 메인 요리"}
                  data-testid="input-menu-category"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "en" ? "Image URL" : "이미지 URL"}
              </label>
              <Input
                value={menuImageUrl}
                onChange={(e) => setMenuImageUrl(e.target.value)}
                placeholder="https://example.com/menu-image.jpg"
                data-testid="input-menu-image-url"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <label className="text-sm font-medium">
                  {language === "en" ? "Popular Item" : "인기 메뉴"}
                </label>
                <Switch
                  checked={menuIsPopular}
                  onCheckedChange={setMenuIsPopular}
                  data-testid="switch-menu-is-popular"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <label className="text-sm font-medium">
                  {language === "en" ? "Recommended" : "추천 메뉴"}
                </label>
                <Switch
                  checked={menuIsRecommended}
                  onCheckedChange={setMenuIsRecommended}
                  data-testid="switch-menu-is-recommended"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsMenuDialogOpen(false);
                resetMenuForm();
              }}
              data-testid="button-cancel-menu"
            >
              {language === "en" ? "Cancel" : "취소"}
            </Button>
            <Button
              onClick={handleSubmitMenu}
              disabled={createMenuMutation.isPending || updateMenuMutation.isPending}
              data-testid="button-submit-menu"
            >
              {(createMenuMutation.isPending || updateMenuMutation.isPending) 
                ? "..." 
                : (language === "en" ? "Save" : "저장")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
