import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, sql } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Restaurant,
  type InsertRestaurant,
  type Review,
  type InsertReview,
  type SavedRestaurant,
  type InsertSavedRestaurant,
  users,
  restaurants,
  reviews,
  savedRestaurants,
} from "@shared/schema";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantsByDistrict(district: string): Promise<Restaurant[]>;
  getRestaurantsByCategory(category: string): Promise<Restaurant[]>;
  searchRestaurants(query: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurantRating(id: string): Promise<void>;
  
  getReviewsByRestaurant(restaurantId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  getSavedRestaurants(userId: string): Promise<Restaurant[]>;
  saveRestaurant(data: InsertSavedRestaurant): Promise<SavedRestaurant>;
  unsaveRestaurant(userId: string, restaurantId: string): Promise<void>;
  isRestaurantSaved(userId: string, restaurantId: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
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
}

export const storage = new DbStorage();
