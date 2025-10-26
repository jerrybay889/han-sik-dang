/**
 * API Response Types
 * Defines strongly-typed interfaces for API responses across the application
 */

import type { 
  User, 
  Restaurant, 
  Review, 
  SavedRestaurant,
  CustomerInquiry,
  Announcement,
  Menu,
  RestaurantImage,
  RestaurantInsights,
  ExternalReview,
  Promotion,
  ReviewResponse
} from "./schema";

// ==================== User Management ====================

export interface UserDetailsResponse {
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

// ==================== Dashboard Analytics ====================

export interface AdminDashboardStatsResponse {
  totalRestaurants: number;
  totalUsers: number;
  totalReviews: number;
  totalAnnouncements: number;
  recentUsers: User[];
  recentReviews: Review[];
  restaurantsByCuisine: Array<{ cuisine: string; count: number }>;
  reviewsPerDay: Array<{ date: string; count: number }>;
}

export interface AdminReviewWithRestaurant extends Review {
  restaurantName: string;
  restaurantNameEn: string;
}

export interface AdminUserAnalyticsResponse {
  totalUsers: number;
  usersByTier: Array<{ tier: string; count: number }>;
  usersByRegion: Array<{ region: string; count: number }>;
  usersBySsoProvider: Array<{ ssoProvider: string; count: number }>;
  recentUsers: User[];
}

// ==================== Restaurant Management ====================

export interface RestaurantAnalyticsResponse {
  totalRestaurants: number;
  restaurantsByCuisine: Array<{ cuisine: string; count: number }>;
  restaurantsByDistrict: Array<{ district: string; count: number }>;
  topRatedRestaurants: Restaurant[];
  recentRestaurants: Restaurant[];
}

// ==================== Review Management ====================

export interface ReviewAnalyticsResponse {
  totalReviews: number;
  averageRating: number;
  reviewsByRating: Array<{ rating: number; count: number }>;
  reviewsPerDay: Array<{ date: string; count: number }>;
  recentReviews: Array<AdminReviewWithRestaurant>;
}

// ==================== Common Patterns ====================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

export interface SuccessResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
}

// ==================== Filter Parameters ====================

export interface ReviewFilterParams {
  restaurantId?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: string;
  endDate?: string;
  isPinned?: number;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilterParams {
  tier?: string;
  region?: string;
  ssoProvider?: string;
  isAdmin?: number;
  searchQuery?: string;
}

export interface RestaurantFilterParams {
  cuisine?: string;
  district?: string;
  minRating?: number;
  maxRating?: number;
  isFeatured?: number;
  searchQuery?: string;
}

// ==================== Restaurant Detail Response ====================

export interface RestaurantDetailResponse extends Restaurant {
  menus: Menu[];
  images: RestaurantImage[];
  insights: RestaurantInsights | null;
  externalReviews: ExternalReview[];
  activePromotions: Promotion[];
}

export interface RestaurantWithReviewsResponse extends Restaurant {
  reviews: Array<Review & { user?: { name: string; tier: string } }>;
  userReview?: Review | null;
}

// ==================== Review with Response ====================

export interface ReviewWithResponse extends Review {
  response: ReviewResponse | null;
  user?: { name: string; tier: string };
}

// ==================== Restaurant Dashboard ====================

export interface RestaurantDashboardStatsResponse {
  totalReviews: number;
  averageRating: number;
  ratingTrend: number;
  reviewsThisMonth: number;
  promotionsActive: number;
  imagesCount: number;
}
