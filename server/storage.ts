import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { eq, desc, sql, and, or, ilike, lte, gte } from "drizzle-orm";
import {
  type User,
  type UpsertUser,
  type Restaurant,
  type InsertRestaurant,
  type Review,
  type InsertReview,
  type SavedRestaurant,
  type InsertSavedRestaurant,
  type Announcement,
  type InsertAnnouncement,
  type EventBanner,
  type InsertEventBanner,
  type RestaurantInsights,
  type InsertRestaurantInsights,
  type Menu,
  type InsertMenu,
  type YoutubeVideo,
  type InsertYoutubeVideo,
  type ExternalReview,
  type InsertExternalReview,
  type RestaurantOwner,
  type InsertRestaurantOwner,
  type ReviewResponse,
  type InsertReviewResponse,
  type Promotion,
  type InsertPromotion,
  type RestaurantImage,
  type InsertRestaurantImage,
  type RestaurantApplication,
  type InsertRestaurantApplication,
  type OwnerInquiry,
  type InsertOwnerInquiry,
  type CustomerInquiry,
  type InsertCustomerInquiry,
  type PartnershipInquiry,
  type InsertPartnershipInquiry,
  type OwnerNotice,
  type InsertOwnerNotice,
  type Payment,
  type InsertPayment,
  type BlogPost,
  type InsertBlogPost,
  users,
  restaurants,
  reviews,
  savedRestaurants,
  announcements,
  eventBanners,
  restaurantInsights,
  menus,
  youtubeVideos,
  externalReviews,
  restaurantOwners,
  reviewResponses,
  promotions,
  restaurantImages,
  restaurantApplications,
  ownerInquiries,
  customerInquiries,
  partnershipInquiries,
  ownerNotices,
  payments,
  blogPosts,
} from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL!;
const USE_SUPABASE = process.env.USE_SUPABASE === "true";

const db = USE_SUPABASE
  ? drizzlePostgres(postgres(DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    }))
  : drizzleNeon(neon(DATABASE_URL));

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getAllRestaurants(sortBy?: string): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantsByDistrict(district: string): Promise<Restaurant[]>;
  getRestaurantsByCategory(category: string): Promise<Restaurant[]>;
  getFeaturedRestaurants(): Promise<Restaurant[]>;
  searchRestaurants(query: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurantRating(id: string): Promise<void>;
  updateRestaurantRatings(id: string, data: {
    googlePlaceId?: string | null;
    googleRating?: number | null;
    googleReviewCount?: number | null;
    naverPlaceId?: string | null;
    naverRating?: number | null;
    naverReviewCount?: number | null;
    popularityScore?: number | null;
  }): Promise<void>;
  
  getReviewsByRestaurant(restaurantId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(reviewId: string, userId: string, data: { rating: number; comment: string }): Promise<Review | undefined>;
  deleteReview(reviewId: string, userId: string): Promise<boolean>;
  
  getSavedRestaurants(userId: string): Promise<Restaurant[]>;
  saveRestaurant(data: InsertSavedRestaurant): Promise<SavedRestaurant>;
  unsaveRestaurant(userId: string, restaurantId: string): Promise<void>;
  isRestaurantSaved(userId: string, restaurantId: string): Promise<boolean>;
  
  getRecentAnnouncements(limit: number): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  
  getActiveEventBanners(): Promise<EventBanner[]>;
  createEventBanner(banner: InsertEventBanner): Promise<EventBanner>;
  
  getRestaurantInsights(restaurantId: string): Promise<RestaurantInsights | undefined>;
  createRestaurantInsights(insights: InsertRestaurantInsights): Promise<RestaurantInsights>;
  updateRestaurantInsights(restaurantId: string, insights: Partial<InsertRestaurantInsights>): Promise<RestaurantInsights | undefined>;
  
  getMenusByRestaurant(restaurantId: string): Promise<Menu[]>;
  createMenu(menu: InsertMenu): Promise<Menu>;
  updateMenu(id: string, userId: string, restaurantId: string, data: Partial<InsertMenu>): Promise<Menu | undefined>;
  deleteMenu(id: string, userId: string, restaurantId: string): Promise<boolean>;
  
  getYoutubeVideosByRestaurant(restaurantId: string): Promise<YoutubeVideo[]>;
  createYoutubeVideo(video: InsertYoutubeVideo): Promise<YoutubeVideo>;
  
  getExternalReviewsByRestaurant(restaurantId: string): Promise<ExternalReview[]>;
  createExternalReview(review: InsertExternalReview): Promise<ExternalReview>;
  
  // Restaurant Owner operations
  getRestaurantsByOwner(userId: string): Promise<Restaurant[]>;
  isRestaurantOwner(userId: string, restaurantId: string): Promise<boolean>;
  createRestaurantOwner(owner: InsertRestaurantOwner): Promise<RestaurantOwner>;
  
  // Review Response operations
  getResponseByReviewId(reviewId: string): Promise<ReviewResponse | undefined>;
  getResponsesByRestaurant(restaurantId: string): Promise<ReviewResponse[]>;
  createReviewResponse(response: InsertReviewResponse): Promise<ReviewResponse>;
  updateReviewResponse(id: string, userId: string, restaurantId: string, responseText: string): Promise<ReviewResponse | undefined>;
  deleteReviewResponse(id: string, userId: string, restaurantId: string): Promise<boolean>;
  
  // Promotion operations
  getPromotionsByRestaurant(restaurantId: string): Promise<Promotion[]>;
  getActivePromotionsByRestaurant(restaurantId: string): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: string, userId: string, restaurantId: string, data: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  deletePromotion(id: string, userId: string, restaurantId: string): Promise<boolean>;
  
  // Dashboard statistics
  getRestaurantDashboardStats(restaurantId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
    recentReviews: Review[];
    monthlyReviewCounts: { month: string; count: number }[];
  }>;
  
  // Restaurant Image operations
  getRestaurantImages(restaurantId: string): Promise<RestaurantImage[]>;
  createRestaurantImage(image: InsertRestaurantImage): Promise<RestaurantImage>;
  deleteRestaurantImage(id: string, userId: string, restaurantId: string): Promise<boolean>;
  updateImageOrder(id: string, displayOrder: number): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<Array<User & { savedCount: number }>>;
  updateUserAdminStatus(userId: string, isAdmin: number): Promise<User | undefined>;
  updateUserTier(userId: string, tier: string): Promise<User | undefined>;
  updateUser(userId: string, data: Partial<{
    tier: string;
    language: string;
    ssoProvider: string;
    region: string;
  }>): Promise<User | undefined>;
  deleteUser(userId: string): Promise<boolean>;
  getAdminDashboardStats(): Promise<{
    totalRestaurants: number;
    totalUsers: number;
    totalReviews: number;
    totalAnnouncements: number;
    recentUsers: User[];
    recentReviews: Review[];
    restaurantsByCuisine: { cuisine: string; count: number }[];
    reviewsPerDay: { date: string; count: number }[];
  }>;
  updateRestaurant(id: string, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  deleteRestaurant(id: string): Promise<boolean>;
  getAllReviews(limit?: number): Promise<Review[]>;
  deleteReviewAsAdmin(reviewId: string): Promise<boolean>;
  getAllAnnouncements(): Promise<Announcement[]>;
  updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;
  getAllEventBanners(): Promise<EventBanner[]>;
  updateEventBanner(id: string, data: Partial<InsertEventBanner>): Promise<EventBanner | undefined>;
  deleteEventBanner(id: string): Promise<boolean>;
  
  // Restaurant Applications
  getAllRestaurantApplications(): Promise<RestaurantApplication[]>;
  processRestaurantApplication(id: string, status: string, adminNote: string): Promise<RestaurantApplication | undefined>;
  
  // Owner Inquiries
  getAllOwnerInquiries(): Promise<OwnerInquiry[]>;
  respondToOwnerInquiry(id: string, adminResponse: string, status: string): Promise<OwnerInquiry | undefined>;
  
  // Customer Inquiries
  getAllCustomerInquiries(): Promise<CustomerInquiry[]>;
  respondToCustomerInquiry(id: string, adminResponse: string, status: string): Promise<CustomerInquiry | undefined>;
  
  // Partnership Inquiries
  getAllPartnershipInquiries(): Promise<PartnershipInquiry[]>;
  processPartnershipInquiry(id: string, status: string, adminNote: string): Promise<PartnershipInquiry | undefined>;
  
  // Owner Notices
  getAllOwnerNotices(): Promise<OwnerNotice[]>;
  createOwnerNotice(notice: InsertOwnerNotice): Promise<OwnerNotice>;
  
  // Payments
  getAllPayments(): Promise<Payment[]>;
  
  // User Analytics
  getUsersByTier(): Promise<{ tier: string; count: number; users: User[] }[]>;
  getUserAnalytics(): Promise<{
    usersBySsoProvider: { ssoProvider: string | null; count: number }[];
    usersByRegion: { region: string | null; count: number }[];
    usersByTier: { tier: string; count: number }[];
  }>;
  getUserDetails(userId: string): Promise<{
    user: User;
    reviews: Review[];
    savedRestaurants: Array<SavedRestaurant & { restaurant: Restaurant }>;
    customerInquiries: CustomerInquiry[];
    stats: {
      totalReviews: number;
      averageRating: number;
      totalSaved: number;
    };
  } | undefined>;
  
  // Blog Posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  
  // Priority Tasks
  getAdminPriorityTasks(): Promise<{
    pendingApplications: RestaurantApplication[];
    pendingOwnerInquiries: OwnerInquiry[];
    pendingCustomerInquiries: CustomerInquiry[];
    pendingPartnershipInquiries: PartnershipInquiry[];
  }>;
  
  // External Data Collection Statistics
  getRestaurantCount(): Promise<number>;
  getReviewCount(): Promise<number>;
  getMenuCount(): Promise<number>;
}

export class DbStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async getAllRestaurants(sortBy?: string): Promise<Restaurant[]> {
    let orderByClause;
    
    switch (sortBy) {
      case 'popularity':
        orderByClause = desc(restaurants.popularityScore);
        break;
      case 'rating':
        orderByClause = desc(restaurants.rating);
        break;
      case 'reviews':
        orderByClause = desc(restaurants.reviewCount);
        break;
      case 'visitors':
        orderByClause = desc(restaurants.visitors1m);
        break;
      default:
        orderByClause = desc(restaurants.rating);
    }
    
    return await db.select().from(restaurants).orderBy(orderByClause);
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const result = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return result[0];
  }

  async getRestaurantsByDistrict(district: string): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.district, district));
  }

  async getRestaurantsByCategory(category: string): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.category, category));
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    // Use Drizzle's safe ilike function to prevent SQL injection
    const searchPattern = `%${query}%`;
    return await db.select().from(restaurants).where(
      or(
        ilike(restaurants.name, searchPattern),
        ilike(restaurants.nameEn, searchPattern),
        ilike(restaurants.cuisine, searchPattern)
      )
    );
  }

  async getFeaturedRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants)
      .where(eq(restaurants.isFeatured, 1))
      .orderBy(desc(restaurants.rating));
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const result = await db.insert(restaurants).values(insertRestaurant).returning();
    return result[0];
  }

  async updateRestaurantRating(id: string): Promise<void> {
    const restaurantReviews = await db.select().from(reviews).where(eq(reviews.restaurantId, id));
    
    if (restaurantReviews.length === 0) {
      await db.update(restaurants)
        .set({ rating: 0, reviewCount: 0 })
        .where(eq(restaurants.id, id));
      return;
    }

    const avgRating = restaurantReviews.reduce((sum, r) => sum + r.rating, 0) / restaurantReviews.length;
    
    await db.update(restaurants)
      .set({ 
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: restaurantReviews.length 
      })
      .where(eq(restaurants.id, id));
  }

  async updateRestaurantRatings(id: string, data: {
    googlePlaceId?: string | null;
    googleRating?: number | null;
    googleReviewCount?: number | null;
    naverPlaceId?: string | null;
    naverRating?: number | null;
    naverReviewCount?: number | null;
    popularityScore?: number | null;
  }): Promise<void> {
    await db.update(restaurants)
      .set({
        googlePlaceId: data.googlePlaceId,
        googleRating: data.googleRating,
        googleReviewCount: data.googleReviewCount,
        naverPlaceId: data.naverPlaceId,
        naverRating: data.naverRating,
        naverReviewCount: data.naverReviewCount,
        popularityScore: data.popularityScore,
      })
      .where(eq(restaurants.id, id));
  }

  async getReviewsByRestaurant(restaurantId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.restaurantId, restaurantId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(insertReview).returning();
    await this.updateRestaurantRating(insertReview.restaurantId);
    return result[0];
  }

  async updateReview(reviewId: string, userId: string, data: { rating: number; comment: string }): Promise<Review | undefined> {
    const result = await db.update(reviews)
      .set({ rating: data.rating, comment: data.comment })
      .where(sql`${reviews.id} = ${reviewId} AND ${reviews.userId} = ${userId}`)
      .returning();
    
    if (result.length > 0) {
      await this.updateRestaurantRating(result[0].restaurantId);
      return result[0];
    }
    return undefined;
  }

  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    // Use safe and() function instead of raw SQL
    const review = await db.select().from(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)));
    
    if (review.length === 0) {
      return false;
    }

    const restaurantId = review[0].restaurantId;

    // Use transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      await tx.delete(reviews)
        .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)));
      
      await this.updateRestaurantRating(restaurantId);
      return true;
    });
  }

  async getSavedRestaurants(userId: string): Promise<Restaurant[]> {
    const saved = await db.select({
      restaurant: restaurants,
    })
    .from(savedRestaurants)
    .innerJoin(restaurants, eq(savedRestaurants.restaurantId, restaurants.id))
    .where(eq(savedRestaurants.userId, userId))
    .orderBy(desc(savedRestaurants.createdAt));

    return saved.map(s => s.restaurant);
  }

  async saveRestaurant(data: InsertSavedRestaurant): Promise<SavedRestaurant> {
    const result = await db.insert(savedRestaurants).values(data).returning();
    return result[0];
  }

  async unsaveRestaurant(userId: string, restaurantId: string): Promise<void> {
    // Use safe and() function instead of raw SQL
    await db.delete(savedRestaurants)
      .where(
        and(
          eq(savedRestaurants.userId, userId),
          eq(savedRestaurants.restaurantId, restaurantId)
        )
      );
  }

  async isRestaurantSaved(userId: string, restaurantId: string): Promise<boolean> {
    // Use safe and() function instead of raw SQL
    const result = await db.select().from(savedRestaurants)
      .where(
        and(
          eq(savedRestaurants.userId, userId),
          eq(savedRestaurants.restaurantId, restaurantId)
        )
      );
    return result.length > 0;
  }

  async getRecentAnnouncements(limit: number): Promise<Announcement[]> {
    return await db.select().from(announcements)
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
      .limit(limit);
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const result = await db.insert(announcements).values(insertAnnouncement).returning();
    return result[0];
  }

  async getActiveEventBanners(): Promise<EventBanner[]> {
    const now = new Date();
    return await db.select().from(eventBanners)
      .where(
        and(
          eq(eventBanners.isActive, 1),
          lte(eventBanners.startDate, now),
          gte(eventBanners.endDate, now)
        )
      )
      .orderBy(eventBanners.displayOrder);
  }

  async createEventBanner(insertBanner: InsertEventBanner): Promise<EventBanner> {
    const result = await db.insert(eventBanners).values(insertBanner).returning();
    return result[0];
  }

  async getRestaurantInsights(restaurantId: string): Promise<RestaurantInsights | undefined> {
    const result = await db.select().from(restaurantInsights)
      .where(eq(restaurantInsights.restaurantId, restaurantId));
    return result[0];
  }

  async createRestaurantInsights(insertInsights: InsertRestaurantInsights): Promise<RestaurantInsights> {
    const result = await db.insert(restaurantInsights).values(insertInsights).returning();
    return result[0];
  }

  async updateRestaurantInsights(restaurantId: string, updates: Partial<InsertRestaurantInsights>): Promise<RestaurantInsights | undefined> {
    const result = await db.update(restaurantInsights)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(restaurantInsights.restaurantId, restaurantId))
      .returning();
    return result[0];
  }

  async getMenusByRestaurant(restaurantId: string): Promise<Menu[]> {
    return await db.select().from(menus)
      .where(eq(menus.restaurantId, restaurantId))
      .orderBy(menus.displayOrder, desc(menus.isPopular), desc(menus.isRecommended));
  }

  async createMenu(insertMenu: InsertMenu): Promise<Menu> {
    const result = await db.insert(menus).values(insertMenu).returning();
    return result[0];
  }

  async updateMenu(id: string, userId: string, restaurantId: string, data: Partial<InsertMenu>): Promise<Menu | undefined> {
    const isOwner = await this.isRestaurantOwner(userId, restaurantId);
    if (!isOwner) {
      return undefined;
    }

    const result = await db.update(menus)
      .set(data)
      .where(and(eq(menus.id, id), eq(menus.restaurantId, restaurantId)))
      .returning();
    return result[0];
  }

  async deleteMenu(id: string, userId: string, restaurantId: string): Promise<boolean> {
    const isOwner = await this.isRestaurantOwner(userId, restaurantId);
    if (!isOwner) {
      return false;
    }

    const result = await db.delete(menus)
      .where(and(eq(menus.id, id), eq(menus.restaurantId, restaurantId)))
      .returning();
    return result.length > 0;
  }

  async getYoutubeVideosByRestaurant(restaurantId: string): Promise<YoutubeVideo[]> {
    return await db.select().from(youtubeVideos)
      .where(eq(youtubeVideos.restaurantId, restaurantId))
      .orderBy(desc(youtubeVideos.relevanceScore), desc(youtubeVideos.viewCount));
  }

  async createYoutubeVideo(insertVideo: InsertYoutubeVideo): Promise<YoutubeVideo> {
    const result = await db.insert(youtubeVideos).values(insertVideo).returning();
    return result[0];
  }

  async getExternalReviewsByRestaurant(restaurantId: string): Promise<ExternalReview[]> {
    return await db.select().from(externalReviews)
      .where(eq(externalReviews.restaurantId, restaurantId))
      .orderBy(desc(externalReviews.publishedAt));
  }

  async createExternalReview(insertReview: InsertExternalReview): Promise<ExternalReview> {
    const result = await db.insert(externalReviews).values(insertReview).returning();
    return result[0];
  }

  // Restaurant Owner operations
  async getRestaurantsByOwner(userId: string): Promise<Restaurant[]> {
    const result = await db
      .select({ restaurant: restaurants })
      .from(restaurantOwners)
      .innerJoin(restaurants, eq(restaurantOwners.restaurantId, restaurants.id))
      .where(eq(restaurantOwners.userId, userId));
    return result.map(r => r.restaurant);
  }

  async isRestaurantOwner(userId: string, restaurantId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(restaurantOwners)
      .where(
        sql`${restaurantOwners.userId} = ${userId} AND ${restaurantOwners.restaurantId} = ${restaurantId}`
      );
    return result.length > 0;
  }

  async createRestaurantOwner(owner: InsertRestaurantOwner): Promise<RestaurantOwner> {
    const result = await db.insert(restaurantOwners).values(owner).returning();
    return result[0];
  }

  // Review Response operations
  async getResponseByReviewId(reviewId: string): Promise<ReviewResponse | undefined> {
    const result = await db
      .select()
      .from(reviewResponses)
      .where(eq(reviewResponses.reviewId, reviewId));
    return result[0];
  }

  async getResponsesByRestaurant(restaurantId: string): Promise<ReviewResponse[]> {
    return await db
      .select()
      .from(reviewResponses)
      .where(eq(reviewResponses.restaurantId, restaurantId))
      .orderBy(desc(reviewResponses.createdAt));
  }

  async createReviewResponse(response: InsertReviewResponse): Promise<ReviewResponse> {
    const result = await db.insert(reviewResponses).values(response).returning();
    return result[0];
  }

  async updateReviewResponse(
    id: string,
    userId: string,
    restaurantId: string,
    responseText: string
  ): Promise<ReviewResponse | undefined> {
    // First verify ownership
    const existing = await db
      .select()
      .from(reviewResponses)
      .where(eq(reviewResponses.id, id));
    
    if (existing.length === 0 || existing[0].userId !== userId || existing[0].restaurantId !== restaurantId) {
      return undefined;
    }

    const result = await db
      .update(reviewResponses)
      .set({ response: responseText, updatedAt: new Date() })
      .where(eq(reviewResponses.id, id))
      .returning();
    return result[0];
  }

  async deleteReviewResponse(id: string, userId: string, restaurantId: string): Promise<boolean> {
    // First verify ownership
    const existing = await db
      .select()
      .from(reviewResponses)
      .where(eq(reviewResponses.id, id));
    
    if (existing.length === 0 || existing[0].userId !== userId || existing[0].restaurantId !== restaurantId) {
      return false;
    }

    await db.delete(reviewResponses).where(eq(reviewResponses.id, id));
    return true;
  }

  // Promotion operations
  async getPromotionsByRestaurant(restaurantId: string): Promise<Promotion[]> {
    return await db
      .select()
      .from(promotions)
      .where(eq(promotions.restaurantId, restaurantId))
      .orderBy(desc(promotions.createdAt));
  }

  async getActivePromotionsByRestaurant(restaurantId: string): Promise<Promotion[]> {
    const now = new Date();
    return await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.restaurantId, restaurantId),
          eq(promotions.isActive, 1),
          lte(promotions.startDate, now),
          gte(promotions.endDate, now)
        )
      )
      .orderBy(desc(promotions.createdAt));
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const result = await db.insert(promotions).values(promotion).returning();
    return result[0];
  }

  async updatePromotion(
    id: string,
    userId: string,
    restaurantId: string,
    data: Partial<InsertPromotion>
  ): Promise<Promotion | undefined> {
    // Verify ownership first
    const isOwner = await this.isRestaurantOwner(userId, restaurantId);
    if (!isOwner) {
      return undefined;
    }

    const existing = await db
      .select()
      .from(promotions)
      .where(eq(promotions.id, id));
    
    if (existing.length === 0 || existing[0].restaurantId !== restaurantId) {
      return undefined;
    }

    const result = await db
      .update(promotions)
      .set(data)
      .where(eq(promotions.id, id))
      .returning();
    return result[0];
  }

  async deletePromotion(id: string, userId: string, restaurantId: string): Promise<boolean> {
    // Verify ownership first
    const isOwner = await this.isRestaurantOwner(userId, restaurantId);
    if (!isOwner) {
      return false;
    }

    const existing = await db
      .select()
      .from(promotions)
      .where(eq(promotions.id, id));
    
    if (existing.length === 0 || existing[0].restaurantId !== restaurantId) {
      return false;
    }

    await db.delete(promotions).where(eq(promotions.id, id));
    return true;
  }

  // Dashboard statistics
  async getRestaurantDashboardStats(restaurantId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
    recentReviews: Review[];
    monthlyReviewCounts: { month: string; count: number }[];
  }> {
    // Get total reviews and average rating
    const reviewStats = await db
      .select({
        totalReviews: sql<number>`cast(count(*) as int)`,
        averageRating: sql<number>`cast(avg(${reviews.rating}) as real)`,
      })
      .from(reviews)
      .where(eq(reviews.restaurantId, restaurantId));

    // Get rating distribution
    const ratingDist = await db
      .select({
        rating: reviews.rating,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(reviews)
      .where(eq(reviews.restaurantId, restaurantId))
      .groupBy(reviews.rating)
      .orderBy(desc(reviews.rating));

    // Get recent reviews (last 10)
    const recentReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.restaurantId, restaurantId))
      .orderBy(desc(reviews.createdAt))
      .limit(10);

    // Get monthly review counts (last 6 months)
    const monthlyStats = await db
      .select({
        month: sql<string>`to_char(${reviews.createdAt}, 'YYYY-MM')`,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(reviews)
      .where(
        sql`${reviews.restaurantId} = ${restaurantId} AND ${reviews.createdAt} >= NOW() - INTERVAL '6 months'`
      )
      .groupBy(sql`to_char(${reviews.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${reviews.createdAt}, 'YYYY-MM')`);

    return {
      totalReviews: reviewStats[0]?.totalReviews || 0,
      averageRating: reviewStats[0]?.averageRating || 0,
      ratingDistribution: ratingDist,
      recentReviews: recentReviews,
      monthlyReviewCounts: monthlyStats,
    };
  }

  // Restaurant Image operations
  async getRestaurantImages(restaurantId: string): Promise<RestaurantImage[]> {
    const result = await db
      .select()
      .from(restaurantImages)
      .where(eq(restaurantImages.restaurantId, restaurantId))
      .orderBy(restaurantImages.displayOrder);
    return result;
  }

  async createRestaurantImage(image: InsertRestaurantImage): Promise<RestaurantImage> {
    const result = await db.insert(restaurantImages).values(image).returning();
    return result[0];
  }

  async deleteRestaurantImage(id: string, userId: string, restaurantId: string): Promise<boolean> {
    // Verify ownership
    const isOwner = await this.isRestaurantOwner(userId, restaurantId);
    if (!isOwner) {
      return false;
    }

    const result = await db
      .delete(restaurantImages)
      .where(eq(restaurantImages.id, id))
      .returning();
    return result.length > 0;
  }

  async updateImageOrder(id: string, displayOrder: number): Promise<void> {
    await db
      .update(restaurantImages)
      .set({ displayOrder })
      .where(eq(restaurantImages.id, id));
  }

  // Admin operations
  async getAllUsers(): Promise<Array<User & { savedCount: number }>> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    
    // Get saved count for each user
    const usersWithCounts = await Promise.all(
      allUsers.map(async (user) => {
        const saved = await db
          .select()
          .from(savedRestaurants)
          .where(eq(savedRestaurants.userId, user.id));
        
        return {
          ...user,
          savedCount: saved.length,
        };
      })
    );
    
    return usersWithCounts;
  }

  async updateUserAdminStatus(userId: string, isAdmin: number): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async getUserDetails(userId: string): Promise<{
    user: User;
    reviews: Review[];
    savedRestaurants: Array<SavedRestaurant & { restaurant: Restaurant }>;
    customerInquiries: CustomerInquiry[];
    stats: {
      totalReviews: number;
      averageRating: number;
      totalSaved: number;
    };
  } | undefined> {
    const user = await this.getUser(userId);
    if (!user) {
      return undefined;
    }

    // Get user's reviews
    const userReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));

    // Get saved restaurants with join
    const savedRestaurantsData = await db
      .select({
        savedRestaurant: savedRestaurants,
        restaurant: restaurants,
      })
      .from(savedRestaurants)
      .leftJoin(restaurants, eq(savedRestaurants.restaurantId, restaurants.id))
      .where(eq(savedRestaurants.userId, userId))
      .orderBy(desc(savedRestaurants.createdAt));

    // Get customer inquiries
    const userInquiries = await db
      .select()
      .from(customerInquiries)
      .where(eq(customerInquiries.userId, userId))
      .orderBy(desc(customerInquiries.createdAt));

    // Calculate stats
    const totalReviews = userReviews.length;
    const averageRating = totalReviews > 0
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
    const totalSaved = savedRestaurantsData.length;

    return {
      user,
      reviews: userReviews,
      savedRestaurants: savedRestaurantsData
        .filter(item => item.restaurant !== null)
        .map(item => ({
          ...item.savedRestaurant,
          restaurant: item.restaurant as Restaurant,
        })) as Array<SavedRestaurant & { restaurant: Restaurant }>,
      customerInquiries: userInquiries,
      stats: {
        totalReviews,
        averageRating,
        totalSaved,
      },
    };
  }

  async updateUserTier(userId: string, tier: string): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ tier, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async updateUser(userId: string, data: Partial<{
    tier: string;
    language: string;
    ssoProvider: string;
    region: string;
  }>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async deleteUser(userId: string): Promise<boolean> {
    // Use transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      // Delete user's reviews first
      await tx.delete(reviews).where(eq(reviews.userId, userId));
      
      // Delete saved restaurants
      await tx.delete(savedRestaurants).where(eq(savedRestaurants.userId, userId));
      
      // Delete customer inquiries
      await tx.delete(customerInquiries).where(eq(customerInquiries.userId, userId));
      
      // Delete the user
      const result = await tx
        .delete(users)
        .where(eq(users.id, userId))
        .returning();
      
      return result.length > 0;
    });
  }

  async getAdminDashboardStats(): Promise<{
    totalRestaurants: number;
    totalUsers: number;
    totalReviews: number;
    totalAnnouncements: number;
    recentUsers: User[];
    recentReviews: Review[];
    restaurantsByCuisine: { cuisine: string; count: number }[];
    reviewsPerDay: { date: string; count: number }[];
  }> {
    // Get total counts
    const totalRestaurantsResult = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(restaurants);
    const totalUsersResult = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(users);
    const totalReviewsResult = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(reviews);
    const totalAnnouncementsResult = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(announcements);

    // Get recent users (last 10)
    const recentUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    // Get recent reviews (last 10)
    const recentReviews = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt))
      .limit(10);

    // Get restaurants by cuisine
    const cuisineStats = await db
      .select({
        cuisine: restaurants.cuisine,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(restaurants)
      .groupBy(restaurants.cuisine)
      .orderBy(desc(sql`count(*)`));

    // Get reviews per day (last 30 days)
    const reviewsPerDay = await db
      .select({
        date: sql<string>`to_char(${reviews.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(reviews)
      .where(sql`${reviews.createdAt} >= NOW() - INTERVAL '30 days'`)
      .groupBy(sql`to_char(${reviews.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${reviews.createdAt}, 'YYYY-MM-DD')`);

    return {
      totalRestaurants: totalRestaurantsResult[0]?.count || 0,
      totalUsers: totalUsersResult[0]?.count || 0,
      totalReviews: totalReviewsResult[0]?.count || 0,
      totalAnnouncements: totalAnnouncementsResult[0]?.count || 0,
      recentUsers,
      recentReviews,
      restaurantsByCuisine: cuisineStats,
      reviewsPerDay,
    };
  }

  async updateRestaurant(id: string, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const result = await db
      .update(restaurants)
      .set(data)
      .where(eq(restaurants.id, id))
      .returning();
    return result[0];
  }

  async deleteRestaurant(id: string): Promise<boolean> {
    const result = await db
      .delete(restaurants)
      .where(eq(restaurants.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllReviews(limit: number = 1000): Promise<any[]> {
    const result = await db
      .select({
        id: reviews.id,
        restaurantId: reviews.restaurantId,
        userId: reviews.userId,
        userName: reviews.userName,
        rating: reviews.rating,
        comment: reviews.comment,
        imageUrls: reviews.imageUrls,
        videoUrls: reviews.videoUrls,
        isPinned: reviews.isPinned,
        createdAt: reviews.createdAt,
        restaurantName: restaurants.name,
        restaurantNameEn: restaurants.nameEn,
      })
      .from(reviews)
      .leftJoin(restaurants, eq(reviews.restaurantId, restaurants.id))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
    
    return result;
  }

  async updateReviewPin(reviewId: string, isPinned: number): Promise<Review | undefined> {
    const result = await db
      .update(reviews)
      .set({ isPinned })
      .where(eq(reviews.id, reviewId))
      .returning();
    return result[0];
  }

  async deleteReviewAsAdmin(reviewId: string): Promise<boolean> {
    // Get restaurant ID before deleting
    const review = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId));
    
    if (review.length === 0) {
      return false;
    }

    const restaurantId = review[0].restaurantId;

    // Use transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      const result = await tx
        .delete(reviews)
        .where(eq(reviews.id, reviewId))
        .returning();
      
      if (result.length > 0) {
        // Update restaurant rating within the same transaction
        await this.updateRestaurantRating(restaurantId);
        return true;
      }
      
      return false;
    });
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  async updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const result = await db
      .update(announcements)
      .set(data)
      .where(eq(announcements.id, id))
      .returning();
    return result[0];
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const result = await db
      .delete(announcements)
      .where(eq(announcements.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllEventBanners(): Promise<EventBanner[]> {
    return await db
      .select()
      .from(eventBanners)
      .orderBy(eventBanners.displayOrder);
  }

  async updateEventBanner(id: string, data: Partial<InsertEventBanner>): Promise<EventBanner | undefined> {
    const result = await db
      .update(eventBanners)
      .set(data)
      .where(eq(eventBanners.id, id))
      .returning();
    return result[0];
  }

  async deleteEventBanner(id: string): Promise<boolean> {
    const result = await db
      .delete(eventBanners)
      .where(eq(eventBanners.id, id))
      .returning();
    return result.length > 0;
  }

  // Restaurant Applications
  async getAllRestaurantApplications(): Promise<RestaurantApplication[]> {
    return await db
      .select()
      .from(restaurantApplications)
      .orderBy(desc(restaurantApplications.createdAt));
  }

  async processRestaurantApplication(id: string, status: string, adminNote: string): Promise<RestaurantApplication | undefined> {
    const result = await db
      .update(restaurantApplications)
      .set({
        status,
        adminNote,
        processedAt: new Date(),
      })
      .where(eq(restaurantApplications.id, id))
      .returning();
    return result[0];
  }

  // Owner Inquiries
  async getAllOwnerInquiries(): Promise<OwnerInquiry[]> {
    return await db
      .select()
      .from(ownerInquiries)
      .orderBy(desc(ownerInquiries.createdAt));
  }

  async respondToOwnerInquiry(id: string, adminResponse: string, status: string): Promise<OwnerInquiry | undefined> {
    const result = await db
      .update(ownerInquiries)
      .set({
        adminResponse,
        status,
        answeredAt: new Date(),
      })
      .where(eq(ownerInquiries.id, id))
      .returning();
    return result[0];
  }

  // Customer Inquiries
  async getAllCustomerInquiries(): Promise<CustomerInquiry[]> {
    return await db
      .select()
      .from(customerInquiries)
      .orderBy(desc(customerInquiries.createdAt));
  }

  async respondToCustomerInquiry(id: string, adminResponse: string, status: string): Promise<CustomerInquiry | undefined> {
    const result = await db
      .update(customerInquiries)
      .set({
        adminResponse,
        status,
        answeredAt: new Date(),
      })
      .where(eq(customerInquiries.id, id))
      .returning();
    return result[0];
  }

  // Partnership Inquiries
  async getAllPartnershipInquiries(): Promise<PartnershipInquiry[]> {
    return await db
      .select()
      .from(partnershipInquiries)
      .orderBy(desc(partnershipInquiries.createdAt));
  }

  async processPartnershipInquiry(id: string, status: string, adminNote: string): Promise<PartnershipInquiry | undefined> {
    const result = await db
      .update(partnershipInquiries)
      .set({
        status,
        adminNote,
        processedAt: new Date(),
      })
      .where(eq(partnershipInquiries.id, id))
      .returning();
    return result[0];
  }

  // Owner Notices
  async getAllOwnerNotices(): Promise<OwnerNotice[]> {
    return await db
      .select()
      .from(ownerNotices)
      .orderBy(desc(ownerNotices.isPinned), desc(ownerNotices.createdAt));
  }

  async createOwnerNotice(notice: InsertOwnerNotice): Promise<OwnerNotice> {
    const result = await db
      .insert(ownerNotices)
      .values(notice)
      .returning();
    return result[0];
  }

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));
  }

  // User Analytics
  async getUsersByTier(): Promise<{ tier: string; count: number; users: User[] }[]> {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const result = [];

    for (const tier of tiers) {
      const tierUsers = await db
        .select()
        .from(users)
        .where(eq(users.tier, tier))
        .orderBy(desc(users.createdAt));

      result.push({
        tier,
        count: tierUsers.length,
        users: tierUsers,
      });
    }

    return result;
  }

  async getUserAnalytics(): Promise<{
    usersBySsoProvider: { ssoProvider: string | null; count: number }[];
    usersByRegion: { region: string | null; count: number }[];
    usersByTier: { tier: string; count: number }[];
  }> {
    const usersBySsoProvider = await db
      .select({
        ssoProvider: users.ssoProvider,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(users)
      .where(sql`${users.ssoProvider} IS NOT NULL`)
      .groupBy(users.ssoProvider)
      .orderBy(desc(sql`count(*)`));

    const usersByRegion = await db
      .select({
        region: users.region,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(users)
      .where(sql`${users.region} IS NOT NULL`)
      .groupBy(users.region)
      .orderBy(desc(sql`count(*)`));

    const usersByTier = await db
      .select({
        tier: users.tier,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(users)
      .where(sql`${users.tier} IS NOT NULL`)
      .groupBy(users.tier)
      .orderBy(desc(sql`count(*)`));

    return {
      usersBySsoProvider,
      usersByRegion,
      usersByTier,
    };
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
  }

  // Priority Tasks
  async getAdminPriorityTasks(): Promise<{
    pendingApplications: RestaurantApplication[];
    pendingOwnerInquiries: OwnerInquiry[];
    pendingCustomerInquiries: CustomerInquiry[];
    pendingPartnershipInquiries: PartnershipInquiry[];
  }> {
    const pendingApplications = await db
      .select()
      .from(restaurantApplications)
      .where(eq(restaurantApplications.status, 'pending'))
      .orderBy(desc(restaurantApplications.createdAt))
      .limit(5);

    const pendingOwnerInquiries = await db
      .select()
      .from(ownerInquiries)
      .where(eq(ownerInquiries.status, 'pending'))
      .orderBy(desc(ownerInquiries.createdAt))
      .limit(5);

    const pendingCustomerInquiries = await db
      .select()
      .from(customerInquiries)
      .where(eq(customerInquiries.status, 'pending'))
      .orderBy(desc(customerInquiries.createdAt))
      .limit(5);

    const pendingPartnershipInquiries = await db
      .select()
      .from(partnershipInquiries)
      .where(eq(partnershipInquiries.status, 'pending'))
      .orderBy(desc(partnershipInquiries.createdAt))
      .limit(5);

    return {
      pendingApplications,
      pendingOwnerInquiries,
      pendingCustomerInquiries,
      pendingPartnershipInquiries,
    };
  }
  
  // External Data Collection Statistics
  async getRestaurantCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(restaurants);
    return result[0]?.count || 0;
  }
  
  async getReviewCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(reviews);
    return result[0]?.count || 0;
  }
  
  async getMenuCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(menus);
    return result[0]?.count || 0;
  }
}

export const storage = new DbStorage();
