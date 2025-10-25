import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Star as StarIcon, Eye } from "lucide-react";
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

export default function AdminRestaurants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null);
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

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: number }) => {
      return apiRequest("PATCH", `/api/admin/restaurants/${id}`, { isFeatured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
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

  const filteredRestaurants = restaurants?.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">Manage all restaurants</p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-restaurant">
          <Plus className="w-4 h-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      <div>
        <input
          type="search"
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 px-4 rounded-lg border bg-background"
          data-testid="input-search-restaurants"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="p-4">
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{restaurant.nameEn}</p>
              <div className="flex gap-2 mb-3 flex-wrap">
                <Badge variant="outline">{restaurant.cuisine}</Badge>
                <Badge variant="outline">{restaurant.district}</Badge>
                {restaurant.isFeatured === 1 && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <StarIcon className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({restaurant.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(restaurant.priceRange)].map((_, i) => (
                    <span key={i} className="text-xs">₩</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingRestaurant(restaurant)}
                  className="flex-1"
                  data-testid={`button-view-${restaurant.id}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(restaurant)}
                  data-testid={`button-edit-${restaurant.id}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant={restaurant.isFeatured === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    toggleFeaturedMutation.mutate({
                      id: restaurant.id,
                      isFeatured: restaurant.isFeatured === 1 ? 0 : 1,
                    })
                  }
                  disabled={toggleFeaturedMutation.isPending}
                  data-testid={`button-toggle-featured-${restaurant.id}`}
                >
                  <StarIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteRestaurantId(restaurant.id)}
                  data-testid={`button-delete-${restaurant.id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}

          {filteredRestaurants.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No restaurants found
            </div>
          )}
        </div>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRestaurant ? "Edit Restaurant" : "Add Restaurant"}</DialogTitle>
            <DialogDescription>
              {editingRestaurant ? "Update restaurant information" : "Create a new restaurant"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (Korean)</FormLabel>
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
                      <FormLabel>Name (English)</FormLabel>
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
                      <FormLabel>Category</FormLabel>
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
                      <FormLabel>Cuisine</FormLabel>
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
                      <FormLabel>District</FormLabel>
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
                      <FormLabel>Price Range (1-4)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={4} {...field} data-testid="input-price-range" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-address" />
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
                      <FormLabel>Latitude</FormLabel>
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
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} data-testid="input-longitude" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Korean)</FormLabel>
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
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="input-description-en" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-image-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="openHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Hours</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-open-hours" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="isVegan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vegan Options</FormLabel>
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
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
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
                      <FormLabel>Halal Options</FormLabel>
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
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
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
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingRestaurant ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewingRestaurant} onOpenChange={(open) => !open && setViewingRestaurant(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
          </DialogHeader>

          {viewingRestaurant && (
            <div className="space-y-4">
              <img
                src={viewingRestaurant.imageUrl}
                alt={viewingRestaurant.name}
                className="w-full h-64 object-cover rounded-lg"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name (Korean)</p>
                  <p className="font-medium">{viewingRestaurant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name (English)</p>
                  <p className="font-medium">{viewingRestaurant.nameEn}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline">{viewingRestaurant.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cuisine</p>
                  <Badge variant="outline">{viewingRestaurant.cuisine}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <Badge variant="outline">{viewingRestaurant.district}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price Range</p>
                  <p className="font-medium">
                    {[...Array(viewingRestaurant.priceRange)].map((_, i) => "₩").join("")}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{viewingRestaurant.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewingRestaurant.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Hours</p>
                  <p className="font-medium">{viewingRestaurant.openHours}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">
                    {viewingRestaurant.rating.toFixed(1)} ({viewingRestaurant.reviewCount} reviews)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Options</p>
                  <div className="flex gap-2">
                    {viewingRestaurant.isVegan === 1 && <Badge variant="outline">Vegan</Badge>}
                    {viewingRestaurant.isHalal === 1 && <Badge variant="outline">Halal</Badge>}
                    {viewingRestaurant.isFeatured === 1 && <Badge>Featured</Badge>}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Description (Korean)</p>
                  <p className="text-sm">{viewingRestaurant.description}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Description (English)</p>
                  <p className="text-sm">{viewingRestaurant.descriptionEn}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRestaurantId} onOpenChange={(open) => !open && setDeleteRestaurantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this restaurant? This will permanently remove the restaurant and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRestaurantId && deleteMutation.mutate(deleteRestaurantId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
