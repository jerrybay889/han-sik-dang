import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Search, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, Star, Pin } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant } from "@shared/schema";

type SortField = "id" | "restaurantName" | "userName" | "rating" | "createdAt" | "isPinned";
type SortDirection = "asc" | "desc";

interface ReviewWithRestaurant {
  id: string;
  restaurantId: string;
  userId: string | null;
  userName: string;
  rating: number;
  comment: string;
  imageUrls: string[] | null;
  videoUrls: string[] | null;
  isPinned: number;
  createdAt: string;
  restaurantName: string;
  restaurantNameEn: string;
}

export default function AdminReviews() {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all");
  const [selectedPinnedFilter, setSelectedPinnedFilter] = useState<string>("all");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("all");
  
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  const [selectedReview, setSelectedReview] = useState<ReviewWithRestaurant | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery<ReviewWithRestaurant[]>({
    queryKey: ["/api/admin/reviews"],
  });

  const { data: restaurants = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const filterByDate = (review: ReviewWithRestaurant) => {
    if (selectedDateFilter === "all") return true;
    
    const reviewDate = new Date(review.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - reviewDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (selectedDateFilter === "today") return diffDays < 1;
    if (selectedDateFilter === "7days") return diffDays < 7;
    if (selectedDateFilter === "30days") return diffDays < 30;
    
    return true;
  };

  const filteredAndSortedReviews = reviews
    .filter(r => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesRestaurant = r.restaurantName?.toLowerCase().includes(query) || 
                                 r.restaurantNameEn?.toLowerCase().includes(query);
        const matchesAuthor = r.userName?.toLowerCase().includes(query);
        const matchesComment = r.comment?.toLowerCase().includes(query);
        if (!matchesRestaurant && !matchesAuthor && !matchesComment) return false;
      }

      if (selectedRating !== "all" && r.rating !== parseInt(selectedRating)) return false;

      if (!filterByDate(r)) return false;

      if (selectedPinnedFilter === "pinned" && r.isPinned !== 1) return false;
      if (selectedPinnedFilter === "normal" && r.isPinned !== 0) return false;

      if (selectedRestaurantId !== "all" && r.restaurantId !== selectedRestaurantId) return false;

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "restaurantName":
          comparison = (a.restaurantName || "").localeCompare(b.restaurantName || "");
          break;
        case "userName":
          comparison = a.userName.localeCompare(b.userName);
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "createdAt":
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          comparison = aDate - bDate;
          break;
        case "isPinned":
          comparison = a.isPinned - b.isPinned;
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("DELETE", `/api/admin/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      setIsDetailsDialogOpen(false);
      toast({
        title: "삭제 완료",
        description: "리뷰가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "리뷰 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const pinMutation = useMutation({
    mutationFn: async ({ reviewId, isPinned }: { reviewId: string; isPinned: number }) => {
      return apiRequest("PATCH", `/api/admin/reviews/${reviewId}/pin`, { isPinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({
        title: "업데이트 완료",
        description: "리뷰 고정 상태가 변경되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "리뷰 고정 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4" />;
    }
    return sortDirection === "asc" 
      ? <ChevronUp className="w-4 h-4" /> 
      : <ChevronDown className="w-4 h-4" />;
  };

  const handleRowClick = (review: ReviewWithRestaurant) => {
    setSelectedReview(review);
    setIsDetailsDialogOpen(true);
  };

  const handleTogglePin = (review: ReviewWithRestaurant) => {
    const newPinned = review.isPinned === 1 ? 0 : 1;
    pinMutation.mutate({ reviewId: review.id, isPinned: newPinned });
    
    if (selectedReview?.id === review.id) {
      setSelectedReview({ ...review, isPinned: newPinned });
    }
  };

  const renderStars = (rating: number, size: "small" | "large" = "small") => {
    const starClass = size === "large" ? "w-6 h-6" : "w-4 h-4";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starClass} ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted"}`}
          />
        ))}
      </div>
    );
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">리뷰 관리</h1>
        <p className="text-muted-foreground">모든 리뷰를 모니터링하고 관리합니다</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="레스토랑명, 작성자, 내용 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-reviews"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">별점 필터</label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger data-testid="select-rating-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5점)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4점)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3점)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2점)</SelectItem>
                  <SelectItem value="1">⭐ (1점)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">날짜 필터</label>
              <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                <SelectTrigger data-testid="select-date-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="today">오늘</SelectItem>
                  <SelectItem value="7days">최근 7일</SelectItem>
                  <SelectItem value="30days">최근 30일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">상단고정 필터</label>
              <Select value={selectedPinnedFilter} onValueChange={setSelectedPinnedFilter}>
                <SelectTrigger data-testid="select-pinned-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pinned">고정된 리뷰만</SelectItem>
                  <SelectItem value="normal">일반 리뷰만</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">레스토랑 필터</label>
              <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
                <SelectTrigger data-testid="select-restaurant-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 레스토랑</SelectItem>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("id")}
                    className="hover-elevate gap-1"
                    data-testid="button-sort-id"
                  >
                    ID {getSortIcon("id")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("restaurantName")}
                    className="hover-elevate gap-1"
                    data-testid="button-sort-restaurant"
                  >
                    레스토랑 {getSortIcon("restaurantName")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("userName")}
                    className="hover-elevate gap-1"
                    data-testid="button-sort-author"
                  >
                    작성자 {getSortIcon("userName")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("rating")}
                    className="hover-elevate gap-1"
                    data-testid="button-sort-rating"
                  >
                    별점 {getSortIcon("rating")}
                  </Button>
                </TableHead>
                <TableHead className="max-w-md">내용 미리보기</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("createdAt")}
                    className="hover-elevate gap-1"
                    data-testid="button-sort-date"
                  >
                    작성일 {getSortIcon("createdAt")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("isPinned")}
                    className="hover-elevate gap-1"
                    data-testid="button-sort-pinned"
                  >
                    고정 {getSortIcon("isPinned")}
                  </Button>
                </TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    리뷰가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedReviews.map((review) => (
                  <TableRow
                    key={review.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => handleRowClick(review)}
                    data-testid={`row-review-${review.id}`}
                  >
                    <TableCell className="font-mono text-sm">
                      {review.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">
                      {review.restaurantName || review.restaurantNameEn || "Unknown"}
                    </TableCell>
                    <TableCell>{review.userName}</TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-muted-foreground truncate">
                        {truncateText(review.comment, 60)}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      {review.isPinned === 1 ? (
                        <Badge variant="default" className="gap-1">
                          <Pin className="w-3 h-3" />
                          고정됨
                        </Badge>
                      ) : (
                        <Badge variant="outline">일반</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(review.id);
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-review-${review.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">리뷰 상세 정보</DialogTitle>
                <DialogDescription>
                  리뷰 ID: {selectedReview.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {selectedReview.restaurantName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedReview.restaurantNameEn}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedReview.rating, "large")}
                      <span className="text-2xl font-bold">{selectedReview.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>작성자:</span>
                    <span className="font-medium">{selectedReview.userName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">리뷰 내용</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedReview.comment}
                  </p>
                </div>

                {selectedReview.imageUrls && selectedReview.imageUrls.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">이미지 URL</h4>
                    <div className="space-y-1">
                      {selectedReview.imageUrls.map((url, index) => (
                        <div key={index} className="text-sm text-muted-foreground break-all">
                          {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReview.videoUrls && selectedReview.videoUrls.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">비디오 URL</h4>
                    <div className="space-y-1">
                      {selectedReview.videoUrls.map((url, index) => (
                        <div key={index} className="text-sm text-muted-foreground break-all">
                          {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold">메타 정보</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">작성일:</span>
                      <span className="ml-2">
                        {new Date(selectedReview.createdAt).toLocaleString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold">관리 작업</h4>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">상단 고정</div>
                      <div className="text-sm text-muted-foreground">
                        이 리뷰를 레스토랑 페이지 상단에 고정합니다
                      </div>
                    </div>
                    <Switch
                      checked={selectedReview.isPinned === 1}
                      onCheckedChange={() => handleTogglePin(selectedReview)}
                      disabled={pinMutation.isPending}
                      data-testid="switch-pin-review"
                    />
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => deleteMutation.mutate(selectedReview.id)}
                    disabled={deleteMutation.isPending}
                    data-testid="button-delete-review-dialog"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    리뷰 삭제
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
