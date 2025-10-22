import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { Restaurant } from "@shared/schema";

export default function AdminRestaurants() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/restaurants/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete restaurant");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
    },
  });

  const filteredRestaurants = restaurants?.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">Manage all restaurants</p>
        </div>
        <Button data-testid="button-add-restaurant">
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
              <div className="flex gap-2 mb-3">
                <Badge variant="outline">{restaurant.cuisine}</Badge>
                <Badge variant="outline">{restaurant.district}</Badge>
                {restaurant.isFeatured === 1 && <Badge>Featured</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({restaurant.reviewCount})</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`button-edit-${restaurant.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(restaurant.id)}
                    data-testid={`button-delete-${restaurant.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
