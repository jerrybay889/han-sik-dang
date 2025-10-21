import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, sql } from "drizzle-orm";
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
} from "@shared/schema";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantsByDistrict(district: string): Promise<Restaurant[]>;
  getRestaurantsByCategory(category: string): Promise<Restaurant[]>;
  getFeaturedRestaurants(): Promise<Restaurant[]>;
  searchRestaurants(query: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurantRating(id: string): Promise<void>;
  
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
  
  getYoutubeVideosByRestaurant(restaurantId: string): Promise<YoutubeVideo[]>;
  createYoutubeVideo(video: InsertYoutubeVideo): Promise<YoutubeVideo>;
  
  getExternalReviewsByRestaurant(restaurantId: string): Promise<ExternalReview[]>;
  createExternalReview(review: InsertExternalReview): Promise<ExternalReview>;
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
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).orderBy(desc(restaurants.rating));
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
    const searchPattern = `%${query}%`;
    return await db.select().from(restaurants).where(
      sql`${restaurants.name} ILIKE ${searchPattern} OR ${restaurants.nameEn} ILIKE ${searchPattern} OR ${restaurants.cuisine} ILIKE ${searchPattern}`
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
    const review = await db.select().from(reviews)
      .where(sql`${reviews.id} = ${reviewId} AND ${reviews.userId} = ${userId}`);
    
    if (review.length === 0) {
      return false;
    }

    await db.delete(reviews)
      .where(sql`${reviews.id} = ${reviewId} AND ${reviews.userId} = ${userId}`);
    
    await this.updateRestaurantRating(review[0].restaurantId);
    return true;
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
    await db.delete(savedRestaurants)
      .where(
        sql`${savedRestaurants.userId} = ${userId} AND ${savedRestaurants.restaurantId} = ${restaurantId}`
      );
  }

  async isRestaurantSaved(userId: string, restaurantId: string): Promise<boolean> {
    const result = await db.select().from(savedRestaurants)
      .where(
        sql`${savedRestaurants.userId} = ${userId} AND ${savedRestaurants.restaurantId} = ${restaurantId}`
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
        sql`${eventBanners.isActive} = 1 AND ${eventBanners.startDate} <= ${now} AND ${eventBanners.endDate} >= ${now}`
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
}

export const storage = new DbStorage();
