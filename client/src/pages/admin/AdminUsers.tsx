import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, Star, MessageSquare, Bookmark, HelpCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User, Review, SavedRestaurant, Restaurant, CustomerInquiry } from "@shared/schema";

type SortField = "id" | "tier" | "language" | "ssoProvider" | "savedCount" | "visitors" | "createdAt";
type SortDirection = "asc" | "desc";

interface UserWithStats extends User {
  savedCount: number;
}

interface UserDetails {
  user: User;
  reviews: Review[];
  savedRestaurants: Array<SavedRestaurant & { restaurant: Restaurant }>;
  customerInquiries: CustomerInquiry[];
  stats: {
    totalReviews: number;
    averageRating: number;
    totalSaved: number;
  };
}

const updateUserSchema = z.object({
  tier: z.string(),
  language: z.string().optional(),
  ssoProvider: z.string().optional(),
  region: z.string().optional(),
});

type UpdateUserForm = z.infer<typeof updateUserSchema>;

const LANGUAGES = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "zh-CN", label: "简体中文" },
  { value: "zh-TW", label: "繁體中文" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ru", label: "Русский" },
];

export default function AdminUsers() {
  const { toast } = useToast();
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedSsoProvider, setSelectedSsoProvider] = useState<string>("all");
  const [visitorPeriod, setVisitorPeriod] = useState<"1d" | "7d" | "10d" | "30d">("30d");
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Dialog State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: users = [], isLoading } = useQuery<UserWithStats[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch user details when dialog is opened
  const { data: userDetails, isLoading: isLoadingDetails } = useQuery<UserDetails>({
    queryKey: ["/api/admin/users", selectedUserId, "details"],
    enabled: !!selectedUserId && isDetailsDialogOpen,
  });

  // Filter & Sort
  const filteredAndSortedUsers = users
    .filter(u => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesEmail = u.email?.toLowerCase().includes(query);
        const matchesName = u.firstName?.toLowerCase().includes(query) || 
                          u.lastName?.toLowerCase().includes(query);
        const matchesId = u.id.toLowerCase().includes(query);
        if (!matchesEmail && !matchesName && !matchesId) return false;
      }

      // Tier filter
      if (selectedTier !== "all" && u.tier !== selectedTier) return false;

      // Language filter
      if (selectedLanguage !== "all" && u.language !== selectedLanguage) return false;

      // SSO Provider filter
      if (selectedSsoProvider !== "all" && u.ssoProvider !== selectedSsoProvider) return false;

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "tier":
          const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
          comparison = (tierOrder[a.tier as keyof typeof tierOrder] || 0) - 
                      (tierOrder[b.tier as keyof typeof tierOrder] || 0);
          break;
        case "language":
          comparison = (a.language || "").localeCompare(b.language || "");
          break;
        case "ssoProvider":
          comparison = (a.ssoProvider || "").localeCompare(b.ssoProvider || "");
          break;
        case "savedCount":
          comparison = a.savedCount - b.savedCount;
          break;
        case "visitors":
          const aVisitors = visitorPeriod === "1d" ? a.visitors1d :
                          visitorPeriod === "7d" ? a.visitors7d :
                          visitorPeriod === "10d" ? a.visitors10d : a.visitors30d;
          const bVisitors = visitorPeriod === "1d" ? b.visitors1d :
                          visitorPeriod === "7d" ? b.visitors7d :
                          visitorPeriod === "10d" ? b.visitors10d : b.visitors30d;
          comparison = aVisitors - bVisitors;
          break;
        case "createdAt":
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = aDate - bDate;
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "삭제 완료",
        description: "사용자가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "사용자 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: UpdateUserForm }) => {
      return apiRequest("PATCH", `/api/admin/users/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", selectedUserId, "details"] });
      toast({
        title: "수정 완료",
        description: "사용자 정보가 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "사용자 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });


  const form = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      tier: "bronze",
      language: "ko",
      ssoProvider: "",
      region: "",
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
      return <ChevronsUpDown className="w-4 h-4 ml-1 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const handleViewDetails = (user: UserWithStats) => {
    setSelectedUserId(user.id);
    setActiveTab("overview");
    form.reset({
      tier: user.tier,
      language: user.language || "ko",
      ssoProvider: user.ssoProvider || "",
      region: user.region || "",
    });
    setIsDetailsDialogOpen(true);
  };

  const handleSubmit = (data: UpdateUserForm) => {
    if (selectedUserId) {
      updateMutation.mutate({ id: selectedUserId, updates: data });
    }
  };

  const handleDelete = (id: string, email: string) => {
    if (confirm(`"${email}" 사용자를 삭제하시겠습니까?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getVisitorCount = (user: UserWithStats) => {
    switch (visitorPeriod) {
      case "1d": return user.visitors1d;
      case "7d": return user.visitors7d;
      case "10d": return user.visitors10d;
      case "30d": return user.visitors30d;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "platinum": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "gold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "silver": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "bronze": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getLanguageName = (lang: string) => {
    const language = LANGUAGES.find(l => l.value === lang);
    return language?.label || lang;
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  // All possible filter values
  const allTiers = ["bronze", "silver", "gold", "platinum"];
  const allSsoProviders = ["Google", "Apple", "GitHub", "Replit"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">이용자 관리</h1>
      </div>

      {/* Search & Filter Section */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder="이름, 이메일, ID 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
              className="flex-1"
            />
            <Button onClick={() => {}} data-testid="button-search">
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">등급</label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger data-testid="select-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {allTiers.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">언어</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">SSO 제공자</label>
              <Select value={selectedSsoProvider} onValueChange={setSelectedSsoProvider}>
                <SelectTrigger data-testid="select-sso-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {allSsoProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              총 {filteredAndSortedUsers.length}명
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm">방문횟수 기준:</label>
              <Select value={visitorPeriod} onValueChange={(v) => setVisitorPeriod(v as any)}>
                <SelectTrigger className="w-32" data-testid="select-visitor-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1일</SelectItem>
                  <SelectItem value="7d">7일</SelectItem>
                  <SelectItem value="10d">10일</SelectItem>
                  <SelectItem value="30d">30일</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("id")}
                      className="hover-elevate"
                      data-testid="sort-id"
                    >
                      ID
                      {getSortIcon("id")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("tier")}
                      className="hover-elevate"
                      data-testid="sort-tier"
                    >
                      등급
                      {getSortIcon("tier")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("language")}
                      className="hover-elevate"
                      data-testid="sort-language"
                    >
                      언어
                      {getSortIcon("language")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("ssoProvider")}
                      className="hover-elevate"
                      data-testid="sort-sso-provider"
                    >
                      SSO
                      {getSortIcon("ssoProvider")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("savedCount")}
                      className="hover-elevate"
                      data-testid="sort-saved"
                    >
                      저장수
                      {getSortIcon("savedCount")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("visitors")}
                      className="hover-elevate"
                      data-testid="sort-visitors"
                    >
                      방문횟수
                      {getSortIcon("visitors")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("createdAt")}
                      className="hover-elevate"
                      data-testid="sort-created-at"
                    >
                      가입일
                      {getSortIcon("createdAt")}
                    </Button>
                  </TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="text-left hover:underline font-medium text-sm"
                        data-testid={`link-view-details-${user.id}`}
                      >
                        {user.id.substring(0, 8)}...
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor(user.tier)}>
                        {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" data-testid={`text-language-${user.id}`}>
                        {getLanguageName(user.language || "ko")}
                      </span>
                    </TableCell>
                    <TableCell>{user.ssoProvider || "-"}</TableCell>
                    <TableCell>{user.savedCount}</TableCell>
                    <TableCell>{getVisitorCount(user).toLocaleString()}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id, user.email || user.id)}
                        data-testid={`button-delete-${user.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredAndSortedUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        )}
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>사용자 상세 정보</DialogTitle>
            <DialogDescription>
              사용자의 활동 내역 및 정보를 확인하고 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* User Header */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">이메일:</span>
                    <span className="ml-2 font-medium" data-testid="text-user-email">
                      {userDetails.user.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">이름:</span>
                    <span className="ml-2 font-medium" data-testid="text-user-name">
                      {userDetails.user.firstName} {userDetails.user.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">등급:</span>
                    <Badge className={`ml-2 ${getTierColor(userDetails.user.tier)}`} data-testid="badge-user-tier">
                      {userDetails.user.tier.charAt(0).toUpperCase() + userDetails.user.tier.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">언어:</span>
                    <span className="ml-2 font-medium" data-testid="text-user-language">
                      {getLanguageName(userDetails.user.language || "ko")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SSO:</span>
                    <span className="ml-2 font-medium" data-testid="text-user-sso">
                      {userDetails.user.ssoProvider || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">가입일:</span>
                    <span className="ml-2 font-medium" data-testid="text-user-created">
                      {formatDate(userDetails.user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview" data-testid="tab-overview">
                    <Star className="w-4 h-4 mr-2" />
                    개요
                  </TabsTrigger>
                  <TabsTrigger value="reviews" data-testid="tab-reviews">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    리뷰
                  </TabsTrigger>
                  <TabsTrigger value="saved" data-testid="tab-saved">
                    <Bookmark className="w-4 h-4 mr-2" />
                    저장
                  </TabsTrigger>
                  <TabsTrigger value="inquiries" data-testid="tab-inquiries">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    문의
                  </TabsTrigger>
                  <TabsTrigger value="settings" data-testid="tab-settings">
                    설정
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">총 리뷰 수</div>
                      <div className="text-2xl font-bold" data-testid="stat-total-reviews">
                        {userDetails.stats.totalReviews}
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">평균 별점</div>
                      <div className="text-2xl font-bold" data-testid="stat-average-rating">
                        ⭐ {userDetails.stats.averageRating.toFixed(1)}
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">저장한 레스토랑</div>
                      <div className="text-2xl font-bold" data-testid="stat-total-saved">
                        {userDetails.stats.totalSaved}
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews">
                  <Card>
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">작성한 리뷰 ({userDetails.reviews.length})</h3>
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                      {userDetails.reviews.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          작성한 리뷰가 없습니다
                        </div>
                      ) : (
                        userDetails.reviews.map((review) => (
                          <div key={review.id} className="p-4" data-testid={`review-${review.id}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium" data-testid={`review-restaurant-${review.id}`}>
                                레스토랑 ID: {review.restaurantId.substring(0, 8)}...
                              </div>
                              <Badge variant="outline" data-testid={`review-rating-${review.id}`}>
                                ⭐ {review.rating}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`review-comment-${review.id}`}>
                              {review.comment}
                            </p>
                            <div className="text-xs text-muted-foreground" data-testid={`review-date-${review.id}`}>
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Saved Restaurants Tab */}
                <TabsContent value="saved">
                  <Card>
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">저장한 레스토랑 ({userDetails.savedRestaurants.length})</h3>
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                      {userDetails.savedRestaurants.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          저장한 레스토랑이 없습니다
                        </div>
                      ) : (
                        userDetails.savedRestaurants.map((saved) => (
                          <div key={saved.id} className="p-4" data-testid={`saved-${saved.id}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium" data-testid={`saved-name-${saved.id}`}>
                                {saved.restaurant.name}
                              </div>
                              <Badge variant="secondary" data-testid={`saved-category-${saved.id}`}>
                                {saved.restaurant.category}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1" data-testid={`saved-cuisine-${saved.id}`}>
                              {saved.restaurant.cuisine}
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span data-testid={`saved-location-${saved.id}`}>
                                {saved.restaurant.city}{' > '}{saved.restaurant.districtDetail}
                              </span>
                              <span data-testid={`saved-date-${saved.id}`}>
                                저장일: {formatDate(saved.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Customer Inquiries Tab */}
                <TabsContent value="inquiries">
                  <Card>
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">고객 문의 ({userDetails.customerInquiries.length})</h3>
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                      {userDetails.customerInquiries.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          문의 내역이 없습니다
                        </div>
                      ) : (
                        userDetails.customerInquiries.map((inquiry) => (
                          <div key={inquiry.id} className="p-4" data-testid={`inquiry-${inquiry.id}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium" data-testid={`inquiry-title-${inquiry.id}`}>
                                {inquiry.title}
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline" data-testid={`inquiry-category-${inquiry.id}`}>
                                  {inquiry.category}
                                </Badge>
                                <Badge 
                                  variant={inquiry.status === 'answered' ? 'default' : inquiry.status === 'closed' ? 'secondary' : 'outline'}
                                  data-testid={`inquiry-status-${inquiry.id}`}
                                >
                                  {inquiry.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`inquiry-content-${inquiry.id}`}>
                              {inquiry.content}
                            </p>
                            {inquiry.adminResponse && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm" data-testid={`inquiry-response-${inquiry.id}`}>
                                <div className="font-medium mb-1">관리자 답변:</div>
                                {inquiry.adminResponse}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-2" data-testid={`inquiry-date-${inquiry.id}`}>
                              작성일: {formatDate(inquiry.createdAt)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card className="p-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="tier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>등급</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="input-tier">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="bronze">Bronze</SelectItem>
                                  <SelectItem value="silver">Silver</SelectItem>
                                  <SelectItem value="gold">Gold</SelectItem>
                                  <SelectItem value="platinum">Platinum</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>언어</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="input-language">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {LANGUAGES.map((lang) => (
                                    <SelectItem key={lang.value} value={lang.value}>
                                      {lang.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ssoProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SSO 제공자</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="예: Google, Apple, GitHub" data-testid="input-sso-provider" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>지역</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="예: 서울" data-testid="input-region" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDetailsDialogOpen(false)}
                            data-testid="button-cancel"
                          >
                            취소
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            data-testid="button-save"
                          >
                            {updateMutation.isPending ? "저장 중..." : "저장"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
