import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Star, MapPin, Phone, Clock, Trash2, Edit } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertRestaurantSchema } from "@shared/schema";
import type { Restaurant, InsertRestaurant } from "@shared/schema";
import { z } from "zod";

const restaurantFormSchema = insertRestaurantSchema.extend({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  priceRange: z.coerce.number().min(1).max(4),
  isVegan: z.coerce.number().min(0).max(1),
  isHalal: z.coerce.number().min(0).max(1),
  isFeatured: z.coerce.number().min(0).max(1),
});

type RestaurantFormData = z.infer<typeof restaurantFormSchema>;
type SortField = "name" | "district" | "cuisine" | "rating" | "reviewCount" | "priceRange" | "isFeatured";
type SortOrder = "asc" | "desc";

export default function AdminRestaurants() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteRestaurantId, setDeleteRestaurantId] = useState<string | null>(null);

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      category: "Korean BBQ",
      cuisine: "Korean BBQ",
      district: "Gangnam",
      address: "",
      latitude: 37.5665,
      longitude: 126.9780,
      description: "",
      descriptionEn: "",
      priceRange: 2,
      imageUrl: "",
      openHours: "11:00 AM - 10:00 PM",
      phone: "",
      isVegan: 0,
      isHalal: 0,
      isFeatured: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RestaurantFormData) => {
      return apiRequest("POST", "/api/restaurants", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setIsAddDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertRestaurant> }) => {
      return apiRequest("PATCH", `/api/admin/restaurants/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setEditingRestaurant(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/restaurants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      setDeleteRestaurantId(null);
    },
  });

  // Filtering and Sorting
  const filteredAndSortedRestaurants = restaurants
    ?.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDistrict = districtFilter === "all" || r.district === districtFilter;
      const matchesCuisine = cuisineFilter === "all" || r.cuisine === cuisineFilter;
      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && r.isFeatured === 1) ||
        (featuredFilter === "not-featured" && r.isFeatured === 0);

      return matchesSearch && matchesDistrict && matchesCuisine && matchesFeatured;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }) || [];

  // Get unique values for filters
  const districts = Array.from(new Set(restaurants?.map((r) => r.district) || []));
  const cuisines = Array.from(new Set(restaurants?.map((r) => r.cuisine) || []));

  const handleAdd = () => {
    form.reset({
      name: "",
      nameEn: "",
      category: "Korean BBQ",
      cuisine: "Korean BBQ",
      district: "Gangnam",
      address: "",
      latitude: 37.5665,
      longitude: 126.9780,
      description: "",
      descriptionEn: "",
      priceRange: 2,
      imageUrl: "",
      openHours: "11:00 AM - 10:00 PM",
      phone: "",
      isVegan: 0,
      isHalal: 0,
      isFeatured: 0,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    form.reset({
      name: restaurant.name,
      nameEn: restaurant.nameEn,
      category: restaurant.category,
      cuisine: restaurant.cuisine,
      district: restaurant.district,
      address: restaurant.address,
      latitude: restaurant.latitude || 37.5665,
      longitude: restaurant.longitude || 126.9780,
      description: restaurant.description,
      descriptionEn: restaurant.descriptionEn,
      priceRange: restaurant.priceRange,
      imageUrl: restaurant.imageUrl,
      openHours: restaurant.openHours,
      phone: restaurant.phone || "",
      isVegan: restaurant.isVegan,
      isHalal: restaurant.isHalal,
      isFeatured: restaurant.isFeatured,
    });
    setEditingRestaurant(restaurant);
  };

  const onSubmit = (data: RestaurantFormData) => {
    if (editingRestaurant) {
      updateMutation.mutate({ id: editingRestaurant.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const cuisineOptions = [
    "Korean BBQ", "Traditional Korean", "Korean Fusion", "Korean Street Food",
    "Korean Seafood", "Korean Hot Pot", "Korean Noodles", "Korean Dessert"
  ];

  const districtOptions = [
    "Gangnam", "Hongdae", "Myeongdong", "Itaewon", "Insadong",
    "Jongno", "Yeouido", "Sinchon", "Apgujeong", "Garosugil"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">레스토랑 관리</h1>
          <p className="text-muted-foreground">모든 레스토랑을 관리합니다</p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-restaurant">
          <Plus className="w-4 h-4 mr-2" />
          레스토랑 추가
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              type="search"
              placeholder="이름, 주소, 전화번호로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-restaurants"
            />
          </div>

          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger data-testid="select-district-filter">
              <SelectValue placeholder="지역 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 지역</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
            <SelectTrigger data-testid="select-cuisine-filter">
              <SelectValue placeholder="메뉴 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 메뉴</SelectItem>
              {cuisines.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
            <SelectTrigger data-testid="select-featured-filter">
              <SelectValue placeholder="Featured 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="featured">Featured만</SelectItem>
              <SelectItem value="not-featured">일반만</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger data-testid="select-sort-field">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="district">지역순</SelectItem>
              <SelectItem value="cuisine">메뉴순</SelectItem>
              <SelectItem value="rating">평점순</SelectItem>
              <SelectItem value="reviewCount">리뷰수순</SelectItem>
              <SelectItem value="priceRange">가격대순</SelectItem>
              <SelectItem value="isFeatured">Featured순</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <SelectTrigger data-testid="select-sort-order">
              <SelectValue placeholder="정렬 순서" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">오름차순</SelectItem>
              <SelectItem value="desc">내림차순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        총 {filteredAndSortedRestaurants.length}개의 레스토랑
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-semibold text-sm">
              <div className="col-span-2">레스토랑명</div>
              <div className="col-span-2">지역/메뉴</div>
              <div className="col-span-3">주소</div>
              <div className="col-span-1">평점</div>
              <div className="col-span-1">리뷰수</div>
              <div className="col-span-1">가격대</div>
              <div className="col-span-1">상태</div>
              <div className="col-span-1 text-right">작업</div>
            </div>

            {/* Table Rows */}
            {filteredAndSortedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="grid grid-cols-12 gap-4 p-4 hover-elevate active-elevate-2 cursor-pointer"
                onClick={() => handleEdit(restaurant)}
                data-testid={`row-restaurant-${restaurant.id}`}
              >
                <div className="col-span-2">
                  <p className="font-medium">{restaurant.name}</p>
                  <p className="text-xs text-muted-foreground">{restaurant.nameEn}</p>
                </div>

                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit">{restaurant.district}</Badge>
                    <Badge variant="outline" className="w-fit text-xs">{restaurant.cuisine}</Badge>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{restaurant.address}</p>
                      {restaurant.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{restaurant.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="col-span-1">
                  <Badge variant="secondary">{restaurant.reviewCount}</Badge>
                </div>

                <div className="col-span-1">
                  <span className="font-medium">
                    {[...Array(restaurant.priceRange)].map((_, i) => "₩").join("")}
                  </span>
                </div>

                <div className="col-span-1">
                  <div className="flex flex-col gap-1">
                    {restaurant.isFeatured === 1 && (
                      <Badge className="w-fit bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {restaurant.isVegan === 1 && (
                      <Badge variant="outline" className="w-fit text-xs">Vegan</Badge>
                    )}
                    {restaurant.isHalal === 1 && (
                      <Badge variant="outline" className="w-fit text-xs">Halal</Badge>
                    )}
                  </div>
                </div>

                <div className="col-span-1 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(restaurant);
                    }}
                    data-testid={`button-edit-${restaurant.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteRestaurantId(restaurant.id);
                    }}
                    data-testid={`button-delete-${restaurant.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredAndSortedRestaurants.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || !!editingRestaurant}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingRestaurant(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRestaurant ? "레스토랑 수정" : "레스토랑 추가"}</DialogTitle>
            <DialogDescription>
              {editingRestaurant ? "레스토랑 정보를 수정합니다" : "새로운 레스토랑을 등록합니다"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <Input {...field} placeholder="예: 강남 삼겹살" data-testid="input-name" />
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
                          <Input {...field} placeholder="예: Gangnam Samgyeopsal" data-testid="input-name-en" />
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cuisineOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                    name="cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>메뉴 타입</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-cuisine">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cuisineOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>지역</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-district">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districtOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                    name="priceRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>가격대 (1-4)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={4} {...field} data-testid="input-price-range" />
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
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주소</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="서울시 강남구..." data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>위도</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.000001" {...field} data-testid="input-latitude" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>경도</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.000001" {...field} data-testid="input-longitude" />
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
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명 (한글)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="input-description" />
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
                        <Textarea {...field} rows={3} data-testid="input-description-en" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          <Input {...field} placeholder="11:00 AM - 10:00 PM" data-testid="input-open-hours" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>이미지 URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." data-testid="input-image-url" />
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
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="isVegan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>비건 옵션</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-is-vegan">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">없음</SelectItem>
                            <SelectItem value="1">있음</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isHalal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>할랄 옵션</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-is-halal">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">없음</SelectItem>
                            <SelectItem value="1">있음</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-is-featured">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">일반</SelectItem>
                            <SelectItem value="1">Featured</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingRestaurant(null);
                    form.reset();
                  }}
                  data-testid="button-cancel"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending ? "처리중..." : editingRestaurant ? "수정" : "등록"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRestaurantId} onOpenChange={(open) => !open && setDeleteRestaurantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>레스토랑 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 레스토랑을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRestaurantId && deleteMutation.mutate(deleteRestaurantId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
