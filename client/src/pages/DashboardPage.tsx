import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Store, TrendingUp, Star, MessageSquare, Tag, Plus, Edit, Trash2, ChevronRight, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant, Promotion, RestaurantImage } from "@shared/schema";

interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  monthlyReviews: { month: string; count: number }[];
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

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

  // Image mutations
  const createImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      await apiRequest("POST", `/api/restaurants/${selectedRestaurant?.id}/images`, {
        imageUrl,
        displayOrder: images.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant?.id, "images"] });
      setIsImageDialogOpen(false);
      setNewImageUrl("");
      toast({
        title: language === "en" ? "Image added" : "이미지가 추가되었습니다",
      });
    },
    onError: () => {
      toast({
        title: language === "en" ? "Failed to add image" : "이미지 추가 실패",
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
                      {stats.monthlyReviews[0]?.count || 0}
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

              {/* Images Section */}
              <Card className="p-6">
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

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
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
                {language === "en" ? "Image URL" : "이미지 URL"}
              </label>
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                data-testid="input-image-url"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {language === "en" 
                  ? "Enter a direct link to an image hosted on Unsplash, Imgur, or another image hosting service" 
                  : "Unsplash, Imgur 또는 다른 이미지 호스팅 서비스에 호스팅된 이미지의 직접 링크를 입력하세요"}
              </p>
            </div>

            {newImageUrl && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "en" ? "Preview" : "미리보기"}
                </label>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={newImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.alt = language === "en" ? "Invalid image URL" : "잘못된 이미지 URL";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImageDialogOpen(false);
                setNewImageUrl("");
              }}
              data-testid="button-cancel-image"
            >
              {language === "en" ? "Cancel" : "취소"}
            </Button>
            <Button
              onClick={() => createImageMutation.mutate(newImageUrl)}
              disabled={!newImageUrl || createImageMutation.isPending}
              data-testid="button-submit-image"
            >
              {createImageMutation.isPending 
                ? "..." 
                : (language === "en" ? "Add Image" : "이미지 추가")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
