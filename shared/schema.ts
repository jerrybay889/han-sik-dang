import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, jsonb, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  category: text("category").notNull(),
  cuisine: text("cuisine").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  descriptionEn: text("description_en").notNull(),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  priceRange: integer("price_range").notNull(),
  imageUrl: text("image_url").notNull(),
  openHours: text("open_hours").notNull(),
  phone: text("phone"),
  isVegan: integer("is_vegan").notNull().default(0),
  isHalal: integer("is_halal").notNull().default(0),
  isFeatured: integer("is_featured").notNull().default(0),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  rating: true,
  reviewCount: true,
});

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  userId: varchar("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  imageUrls: text("image_urls").array(),
  videoUrls: text("video_urls").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export const savedRestaurants = pgTable("saved_restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserRestaurant: unique().on(table.userId, table.restaurantId),
}));

export const insertSavedRestaurantSchema = createInsertSchema(savedRestaurants).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedRestaurant = z.infer<typeof insertSavedRestaurantSchema>;
export type SavedRestaurant = typeof savedRestaurants.$inferSelect;

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEn: text("title_en").notNull(),
  content: text("content").notNull(),
  contentEn: text("content_en").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isPinned: integer("is_pinned").notNull().default(0),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export const eventBanners = pgTable("event_banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEn: text("title_en").notNull(),
  description: text("description").notNull(),
  descriptionEn: text("description_en").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: integer("is_active").notNull().default(1),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertEventBannerSchema = createInsertSchema(eventBanners).omit({
  id: true,
});

export type InsertEventBanner = z.infer<typeof insertEventBannerSchema>;
export type EventBanner = typeof eventBanners.$inferSelect;

export const menus = pgTable("menus", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  description: text("description"),
  descriptionEn: text("description_en"),
  price: integer("price").notNull(),
  category: text("category"),
  imageUrl: text("image_url"),
  isPopular: integer("is_popular").notNull().default(0),
  isRecommended: integer("is_recommended").notNull().default(0),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertMenuSchema = createInsertSchema(menus).omit({
  id: true,
});

export type InsertMenu = z.infer<typeof insertMenuSchema>;
export type Menu = typeof menus.$inferSelect;

export const menuAnalysis = pgTable("menu_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menuId: varchar("menu_id").notNull().references(() => menus.id),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  howToEat: text("how_to_eat").notNull(),
  howToEatEn: text("how_to_eat_en").notNull(),
  orderingTips: text("ordering_tips").notNull(),
  orderingTipsEn: text("ordering_tips_en").notNull(),
  pairingRecommendations: text("pairing_recommendations"),
  pairingRecommendationsEn: text("pairing_recommendations_en"),
  culturalNotes: text("cultural_notes"),
  culturalNotesEn: text("cultural_notes_en"),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});

export const insertMenuAnalysisSchema = createInsertSchema(menuAnalysis).omit({
  id: true,
  analyzedAt: true,
});

export type InsertMenuAnalysis = z.infer<typeof insertMenuAnalysisSchema>;
export type MenuAnalysis = typeof menuAnalysis.$inferSelect;

export const youtubeVideos = pgTable("youtube_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  videoId: text("video_id").notNull(),
  title: text("title").notNull(),
  channelName: text("channel_name").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  viewCount: integer("view_count"),
  publishedAt: timestamp("published_at"),
  relevanceScore: real("relevance_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertYoutubeVideoSchema = createInsertSchema(youtubeVideos).omit({
  id: true,
  createdAt: true,
});

export type InsertYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;
export type YoutubeVideo = typeof youtubeVideos.$inferSelect;

export const externalReviews = pgTable("external_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  source: text("source").notNull(),
  rating: real("rating"),
  comment: text("comment").notNull(),
  commentEn: text("comment_en"),
  author: text("author"),
  publishedAt: timestamp("published_at"),
  imageUrls: text("image_urls").array(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const insertExternalReviewSchema = createInsertSchema(externalReviews).omit({
  id: true,
  fetchedAt: true,
});

export type InsertExternalReview = z.infer<typeof insertExternalReviewSchema>;
export type ExternalReview = typeof externalReviews.$inferSelect;

export const restaurantInsights = pgTable("restaurant_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id).unique(),
  reviewInsights: text("review_insights").notNull(),
  reviewInsightsEn: text("review_insights_en").notNull(),
  bestFor: text("best_for").notNull(),
  bestForEn: text("best_for_en").notNull(),
  culturalTips: text("cultural_tips"),
  culturalTipsEn: text("cultural_tips_en"),
  firstTimerTips: text("first_timer_tips").notNull(),
  firstTimerTipsEn: text("first_timer_tips_en").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertRestaurantInsightsSchema = createInsertSchema(restaurantInsights).omit({
  id: true,
  generatedAt: true,
  lastUpdated: true,
});

export type InsertRestaurantInsights = z.infer<typeof insertRestaurantInsightsSchema>;
export type RestaurantInsights = typeof restaurantInsights.$inferSelect;
