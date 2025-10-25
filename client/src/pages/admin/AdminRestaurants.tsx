import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, DollarSign, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { Restaurant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRestaurantSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// 한국 도시 > 구 데이터
const KOREA_CITIES = {
  "서울": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  "부산": ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"],
  "대구": ["남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
  "인천": ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"],
  "광주": ["광산구", "남구", "동구", "북구", "서구"],
  "대전": ["대덕구", "동구", "서구", "유성구", "중구"],
  "울산": ["남구", "동구", "북구", "울주군", "중구"],
  "세종": ["세종시"],
  "경기": ["고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "여주시", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시"],
};

// 주요 지역 (빠른 검색용)
const POPULAR_REGIONS = [
  { city: "서울", district: "강남구", label: "강남" },
  { city: "서울", district: "홍대/마포구", label: "홍대" },
  { city: "서울", district: "중구", label: "명동" },
  { city: "서울", district: "종로구", label: "인사동" },
  { city: "서울", district: "송파구", label: "잠실" },
  { city: "서울", district: "용산구", label: "이태원" },
  { city: "부산", district: "해운대구", label: "해운대" },
  { city: "부산", district: "중구", label: "남포동" },
];

type SortField = "name" | "city" | "rating" | "reviewCount" | "visitors" | "popularity";
type SortDirection = "asc" | "desc";

interface RestaurantWithRanking extends Restaurant {
  popularityRank?: number;
}

export default function AdminRestaurants() {
  const { toast } = useToast();
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedPopularRegion, setSelectedPopularRegion] = useState<string>("all");
  const [visitorPeriod, setVisitorPeriod] = useState<"1d" | "7d" | "10d" | "1m">("1m");
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>("popularity");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Dialog State
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch restaurants
  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  // Calculate popularity rankings
  const restaurantsWithRanking: RestaurantWithRanking[] = restaurants
    .map((r: Restaurant) => ({ ...r }))
    .sort((a: Restaurant, b: Restaurant) => b.visitors1m - a.visitors1m)
    .map((r: Restaurant, index: number) => ({ ...r, popularityRank: index + 1 }));

  // Filter & Sort
  const filteredAndSortedRestaurants = restaurantsWithRanking
    .filter(r => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(query) || 
                          r.nameEn.toLowerCase().includes(query);
        const matchesAddress = r.address.toLowerCase().includes(query);
        const matchesPhone = r.phone?.toLowerCase().includes(query);
        if (!matchesName && !matchesAddress && !matchesPhone) return false;
      }

      // Popular region filter
      if (selectedPopularRegion !== "all") {
        const region = POPULAR_REGIONS.find(pr => pr.label === selectedPopularRegion);
        if (region) {
          if (r.city !== region.city || r.districtDetail !== region.district) {
            return false;
          }
        }
      } else {
        // City & District filter
        if (selectedCity !== "all" && r.city !== selectedCity) return false;
        if (selectedDistrict !== "all" && r.districtDetail !== selectedDistrict) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "city":
          comparison = (a.city || "").localeCompare(b.city || "");
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "reviewCount":
          comparison = a.reviewCount - b.reviewCount;
          break;
        case "visitors":
          const aVisitors = visitorPeriod === "1d" ? a.visitors1d :
                          visitorPeriod === "7d" ? a.visitors7d :
                          visitorPeriod === "10d" ? a.visitors10d : a.visitors1m;
          const bVisitors = visitorPeriod === "1d" ? b.visitors1d :
                          visitorPeriod === "7d" ? b.visitors7d :
                          visitorPeriod === "10d" ? b.visitors10d : b.visitors1m;
          comparison = aVisitors - bVisitors;
          break;
        case "popularity":
          comparison = (a.popularityRank || 0) - (b.popularityRank || 0);
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/restaurants/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "삭제 완료",
        description: "레스토랑이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "레스토랑 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Edit form
  const form = useForm<z.infer<typeof insertRestaurantSchema>>({
    resolver: zodResolver(insertRestaurantSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      category: "",
      cuisine: "",
      district: "",
      address: "",
      description: "",
      descriptionEn: "",
      priceRange: 2,
      imageUrl: "",
      openHours: "",
      phone: "",
      isVegan: 0,
      isHalal: 0,
      isFeatured: 0,
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: z.infer<typeof insertRestaurantSchema> }) => {
      const res = await fetch(`/api/admin/restaurants/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setIsEditDialogOpen(false);
      toast({
        title: "수정 완료",
        description: "레스토랑 정보가 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "레스토랑 수정 중 오류가 발생했습니다.",
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
      return <ChevronsUpDown className="w-4 h-4 ml-1 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    form.reset({
      name: restaurant.name,
      nameEn: restaurant.nameEn,
      category: restaurant.category,
      cuisine: restaurant.cuisine,
      district: restaurant.district,
      address: restaurant.address,
      description: restaurant.description,
      descriptionEn: restaurant.descriptionEn,
      priceRange: restaurant.priceRange,
      imageUrl: restaurant.imageUrl,
      openHours: restaurant.openHours,
      phone: restaurant.phone || "",
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      isVegan: restaurant.isVegan,
      isHalal: restaurant.isHalal,
      isFeatured: restaurant.isFeatured,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (data: z.infer<typeof insertRestaurantSchema>) => {
    if (editingRestaurant) {
      updateMutation.mutate({ id: editingRestaurant.id, updates: data });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" 레스토랑을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = () => {
    // Search is reactive, so this just triggers a re-render
    // In a real app, you might want to add analytics tracking here
  };

  const getVisitorCount = (restaurant: Restaurant) => {
    switch (visitorPeriod) {
      case "1d": return restaurant.visitors1d;
      case "7d": return restaurant.visitors7d;
      case "10d": return restaurant.visitors10d;
      case "1m": return restaurant.visitors1m;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">레스토랑 관리</h1>
      </div>

      {/* Search & Filter Section */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder="레스토랑명, 주소, 전화번호 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
              className="flex-1"
            />
            <Button onClick={handleSearch} data-testid="button-search">
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>

          {/* Popular Regions Quick Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">주요 지역</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPopularRegion === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPopularRegion("all");
                  setSelectedCity("all");
                  setSelectedDistrict("all");
                }}
                data-testid="button-region-all"
              >
                전체
              </Button>
              {POPULAR_REGIONS.map((region) => (
                <Button
                  key={region.label}
                  variant={selectedPopularRegion === region.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPopularRegion(region.label)}
                  data-testid={`button-region-${region.label}`}
                >
                  {region.label}
                </Button>
              ))}
            </div>
          </div>

          {/* City & District Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">도시</label>
              <Select
                value={selectedCity}
                onValueChange={(value) => {
                  setSelectedCity(value);
                  setSelectedDistrict("all");
                  setSelectedPopularRegion("all");
                }}
              >
                <SelectTrigger data-testid="select-city">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {Object.keys(KOREA_CITIES).map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">구/군</label>
              <Select
                value={selectedDistrict}
                onValueChange={(value) => {
                  setSelectedDistrict(value);
                  setSelectedPopularRegion("all");
                }}
                disabled={selectedCity === "all"}
              >
                <SelectTrigger data-testid="select-district">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {selectedCity !== "all" && KOREA_CITIES[selectedCity as keyof typeof KOREA_CITIES]?.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
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
              총 {filteredAndSortedRestaurants.length}개 레스토랑
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm">방문자수 기준:</label>
              <Select value={visitorPeriod} onValueChange={(v) => setVisitorPeriod(v as any)}>
                <SelectTrigger className="w-32" data-testid="select-visitor-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1일</SelectItem>
                  <SelectItem value="7d">7일</SelectItem>
                  <SelectItem value="10d">10일</SelectItem>
                  <SelectItem value="1m">1개월</SelectItem>
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
                      onClick={() => handleSort("name")}
                      className="hover-elevate"
                      data-testid="sort-name"
                    >
                      업체명
                      {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("city")}
                      className="hover-elevate"
                      data-testid="sort-city"
                    >
                      지역
                      {getSortIcon("city")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("rating")}
                      className="hover-elevate"
                      data-testid="sort-rating"
                    >
                      평점
                      {getSortIcon("rating")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("reviewCount")}
                      className="hover-elevate"
                      data-testid="sort-reviews"
                    >
                      리뷰수
                      {getSortIcon("reviewCount")}
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
                      방문자수
                      {getSortIcon("visitors")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("popularity")}
                      className="hover-elevate"
                      data-testid="sort-popularity"
                    >
                      인기순위
                      {getSortIcon("popularity")}
                    </Button>
                  </TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(restaurant)}
                          className="text-left hover:underline font-medium"
                          data-testid={`link-edit-${restaurant.id}`}
                        >
                          {restaurant.name}
                        </button>
                        {restaurant.isFeatured === 1 && (
                          <DollarSign className="w-4 h-4 text-primary" data-testid={`icon-featured-${restaurant.id}`} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {restaurant.city && restaurant.districtDetail ? 
                        `${restaurant.city} > ${restaurant.districtDetail}` : 
                        restaurant.district}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        ⭐ {restaurant.rating.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{restaurant.reviewCount}</TableCell>
                    <TableCell>{getVisitorCount(restaurant).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        #{restaurant.popularityRank}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(restaurant.id, restaurant.name)}
                        data-testid={`button-delete-${restaurant.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>레스토랑 수정</DialogTitle>
            <DialogDescription>
              레스토랑 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>레스토랑명 (한글)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>레스토랑명 (영문)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-name-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>카테고리</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>메뉴 타입</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-cuisine" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">위치 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>지역</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-district" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>상세 주소</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">설명</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>설명 (한글)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} data-testid="input-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>설명 (영문)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} data-testid="input-description-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact & Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">연락처 및 운영시간</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>전화번호</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="02-1234-5678" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="openHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>운영시간</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-open-hours" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">옵션</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priceRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>가격대 (1-4)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-price-range"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이미지 URL</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-image-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel>광고업체</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value === 1}
                            onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            data-testid="switch-featured"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isVegan"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel>비건</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value === 1}
                            onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            data-testid="switch-vegan"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isHalal"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel>할랄</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value === 1}
                            onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            data-testid="switch-halal"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
