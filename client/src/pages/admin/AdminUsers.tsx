import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Trash2, Star, MapPin, MessageSquare } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Review, Restaurant } from "@shared/schema";

interface UserDetails {
  user: User;
  reviews: Review[];
  savedRestaurants: Restaurant[];
  stats: {
    totalReviews: number;
    averageRating: number;
    totalSaved: number;
  };
}

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: userDetails, isLoading: isLoadingDetails } = useQuery<UserDetails>({
    queryKey: ["/api/admin/users", selectedUserId, "details"],
    enabled: !!selectedUserId,
  });

  const updateTierMutation = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: string }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/tier`, { tier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteUserId(null);
    },
  });

  const filteredUsers = users?.filter((u) =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "platinum": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "gold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "silver": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "bronze": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage all users and their activity</p>
      </div>

      <div>
        <input
          type="search"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 px-4 rounded-lg border bg-background"
          data-testid="input-search-users"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                    {user.firstName?.[0] || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  {user.isAdmin === 1 && (
                    <Badge variant="default">Admin</Badge>
                  )}
                  
                  <Badge className={getTierColor(user.tier || "bronze")}>
                    {user.tier || "Bronze"}
                  </Badge>

                  <Select
                    value={user.tier || "bronze"}
                    onValueChange={(value) => updateTierMutation.mutate({ userId: user.id, tier: value })}
                    disabled={updateTierMutation.isPending}
                  >
                    <SelectTrigger className="w-32" data-testid={`select-tier-${user.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUserId(user.id)}
                    data-testid={`button-view-details-${user.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteUserId(user.id)}
                    data-testid={`button-delete-${user.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </Card>
      )}

      {/* User Details Modal */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user activity and information</DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* User Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{userDetails.user.firstName} {userDetails.user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{userDetails.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tier</p>
                    <Badge className={getTierColor(userDetails.user.tier || "bronze")}>
                      {userDetails.user.tier || "Bronze"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admin Status</p>
                    <Badge variant={userDetails.user.isAdmin === 1 ? "default" : "outline"}>
                      {userDetails.user.isAdmin === 1 ? "Admin" : "User"}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{userDetails.stats.totalReviews}</p>
                      <p className="text-sm text-muted-foreground">Reviews</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{userDetails.stats.averageRating.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{userDetails.stats.totalSaved}</p>
                      <p className="text-sm text-muted-foreground">Saved</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Reviews */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Reviews ({userDetails.reviews.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {userDetails.reviews.length > 0 ? (
                    userDetails.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-3 last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Restaurant ID: {review.restaurantId}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{review.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
                  )}
                </div>
              </Card>

              {/* Saved Restaurants */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Saved Restaurants ({userDetails.savedRestaurants.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {userDetails.savedRestaurants.length > 0 ? (
                    userDetails.savedRestaurants.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{restaurant.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{restaurant.address}</p>
                        </div>
                        <Badge variant="outline">{restaurant.cuisine}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No saved restaurants</p>
                  )}
                </div>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This will permanently remove the user and all their reviews and saved restaurants. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
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
