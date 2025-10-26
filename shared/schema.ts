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
  isAdmin: integer("is_admin").notNull().default(0),
  tier: varchar("tier").notNull().default("bronze"), // bronze, silver, gold, platinum
  language: varchar("language").default("ko"), // ko, en, ja, zh-CN, zh-TW, es, fr, de, ru
  country: varchar("country"),
  region: varchar("region"),
  visitors1d: integer("visitors_1d").notNull().default(0),
  visitors7d: integer("visitors_7d").notNull().default(0),
  visitors10d: integer("visitors_10d").notNull().default(0),
  visitors30d: integer("visitors_30d").notNull().default(0),
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
  latitude: real("latitude"),
  longitude: real("longitude"),
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
  visitors1d: integer("visitors_1d").notNull().default(0),
  visitors7d: integer("visitors_7d").notNull().default(0),
  visitors10d: integer("visitors_10d").notNull().default(0),
  visitors1m: integer("visitors_1m").notNull().default(0),
  city: text("city"),
  districtDetail: text("district_detail"),
}, (table) => [
  index("idx_restaurants_name").on(table.name),
  index("idx_restaurants_name_en").on(table.nameEn),
  index("idx_restaurants_district").on(table.district),
  index("idx_restaurants_cuisine").on(table.cuisine),
  index("idx_restaurants_category").on(table.category),
  index("idx_restaurants_rating").on(table.rating),
  index("idx_restaurants_is_featured").on(table.isFeatured),
  index("idx_restaurants_visitors_1m").on(table.visitors1m),
]);

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
  isPinned: integer("is_pinned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_reviews_restaurant_id").on(table.restaurantId),
  index("idx_reviews_user_id").on(table.userId),
  index("idx_reviews_created_at").on(table.createdAt),
  index("idx_reviews_is_pinned").on(table.isPinned),
]);

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

// Restaurant Owners - Links users to restaurants they manage
export const restaurantOwners = pgTable("restaurant_owners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  role: text("role").notNull().default("owner"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_restaurant_owners_user_id").on(table.userId),
  index("idx_restaurant_owners_restaurant_id").on(table.restaurantId),
  unique().on(table.userId, table.restaurantId),
]);

export const insertRestaurantOwnerSchema = createInsertSchema(restaurantOwners).omit({
  id: true,
  createdAt: true,
});

export type InsertRestaurantOwner = z.infer<typeof insertRestaurantOwnerSchema>;
export type RestaurantOwner = typeof restaurantOwners.$inferSelect;

// Review Responses - Restaurant owner responses to reviews
export const reviewResponses = pgTable("review_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull().references(() => reviews.id),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_review_responses_review_id").on(table.reviewId),
  index("idx_review_responses_restaurant_id").on(table.restaurantId),
  unique().on(table.reviewId),
]);

export const insertReviewResponseSchema = createInsertSchema(reviewResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReviewResponse = z.infer<typeof insertReviewResponseSchema>;
export type ReviewResponse = typeof reviewResponses.$inferSelect;

// Promotions - Restaurant promotional offers
export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  title: text("title").notNull(),
  titleEn: text("title_en").notNull(),
  description: text("description").notNull(),
  descriptionEn: text("description_en").notNull(),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_promotions_restaurant_id").on(table.restaurantId),
  index("idx_promotions_is_active").on(table.isActive),
  index("idx_promotions_dates").on(table.startDate, table.endDate),
]);

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
});

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

// Restaurant Images - Multiple images per restaurant
export const restaurantImages = pgTable("restaurant_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  imageUrl: text("image_url").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_restaurant_images_restaurant_id").on(table.restaurantId),
  index("idx_restaurant_images_display_order").on(table.displayOrder),
]);

export const insertRestaurantImageSchema = createInsertSchema(restaurantImages).omit({
  id: true,
  createdAt: true,
});

export type InsertRestaurantImage = z.infer<typeof insertRestaurantImageSchema>;
export type RestaurantImage = typeof restaurantImages.$inferSelect;

// Restaurant Applications - 점주 신규 신청
export const restaurantApplications = pgTable("restaurant_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  restaurantName: text("restaurant_name").notNull(),
  restaurantNameEn: text("restaurant_name_en").notNull(),
  businessNumber: text("business_number").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
}, (table) => [
  index("idx_applications_user_id").on(table.userId),
  index("idx_applications_status").on(table.status),
  index("idx_applications_created_at").on(table.createdAt),
]);

export const insertRestaurantApplicationSchema = createInsertSchema(restaurantApplications).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export type InsertRestaurantApplication = z.infer<typeof insertRestaurantApplicationSchema>;
export type RestaurantApplication = typeof restaurantApplications.$inferSelect;

// Owner Inquiries - 점주가 본사에 하는 Q&A
export const ownerInquiries = pgTable("owner_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  restaurantId: varchar("restaurant_id").references(() => restaurants.id),
  category: varchar("category").notNull(), // general, technical, billing, other
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, answered, closed
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  answeredAt: timestamp("answered_at"),
}, (table) => [
  index("idx_owner_inquiries_user_id").on(table.userId),
  index("idx_owner_inquiries_restaurant_id").on(table.restaurantId),
  index("idx_owner_inquiries_status").on(table.status),
  index("idx_owner_inquiries_created_at").on(table.createdAt),
]);

export const insertOwnerInquirySchema = createInsertSchema(ownerInquiries).omit({
  id: true,
  createdAt: true,
  answeredAt: true,
});

export type InsertOwnerInquiry = z.infer<typeof insertOwnerInquirySchema>;
export type OwnerInquiry = typeof ownerInquiries.$inferSelect;

// Owner Notices - 본사가 점주들에게 보내는 공지사항
export const ownerNotices = pgTable("owner_notices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // announcement, update, maintenance, promotion
  isPinned: integer("is_pinned").notNull().default(0),
  targetRestaurants: text("target_restaurants").array(), // null means all
  createdAt: timestamp("created_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
}, (table) => [
  index("idx_owner_notices_is_pinned").on(table.isPinned),
  index("idx_owner_notices_created_at").on(table.createdAt),
]);

export const insertOwnerNoticeSchema = createInsertSchema(ownerNotices).omit({
  id: true,
  createdAt: true,
});

export type InsertOwnerNotice = z.infer<typeof insertOwnerNoticeSchema>;
export type OwnerNotice = typeof ownerNotices.$inferSelect;

// Payments - 점주 결제 관리
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull().references(() => restaurants.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  currency: varchar("currency").notNull().default("KRW"),
  paymentType: varchar("payment_type").notNull(), // subscription, promotion, ad
  status: varchar("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: varchar("payment_method"),
  transactionId: text("transaction_id"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
}, (table) => [
  index("idx_payments_restaurant_id").on(table.restaurantId),
  index("idx_payments_user_id").on(table.userId),
  index("idx_payments_status").on(table.status),
  index("idx_payments_created_at").on(table.createdAt),
]);

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Customer Inquiries - 고객 문의
export const customerInquiries = pgTable("customer_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: text("email").notNull(),
  name: text("name").notNull(),
  category: varchar("category").notNull(), // general, complaint, suggestion, other
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, answered, closed
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  answeredAt: timestamp("answered_at"),
}, (table) => [
  index("idx_customer_inquiries_user_id").on(table.userId),
  index("idx_customer_inquiries_status").on(table.status),
  index("idx_customer_inquiries_created_at").on(table.createdAt),
]);

export const insertCustomerInquirySchema = createInsertSchema(customerInquiries).omit({
  id: true,
  createdAt: true,
  answeredAt: true,
});

export type InsertCustomerInquiry = z.infer<typeof insertCustomerInquirySchema>;
export type CustomerInquiry = typeof customerInquiries.$inferSelect;

// Partnership Inquiries - 제휴 문의
export const partnershipInquiries = pgTable("partnership_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  partnershipType: varchar("partnership_type").notNull(), // advertisement, collaboration, sponsorship, other
  description: text("description").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, reviewing, accepted, rejected
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
}, (table) => [
  index("idx_partnership_inquiries_status").on(table.status),
  index("idx_partnership_inquiries_created_at").on(table.createdAt),
]);

export const insertPartnershipInquirySchema = createInsertSchema(partnershipInquiries).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export type InsertPartnershipInquiry = z.infer<typeof insertPartnershipInquirySchema>;
export type PartnershipInquiry = typeof partnershipInquiries.$inferSelect;

// Blog Posts - 블로그 포스트
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEn: text("title_en").notNull(),
  content: text("content").notNull(),
  contentEn: text("content_en").notNull(),
  excerpt: text("excerpt"),
  excerptEn: text("excerpt_en"),
  imageUrl: text("image_url"),
  author: text("author").notNull(),
  category: varchar("category").notNull(), // food, culture, travel, tips
  tags: text("tags").array(),
  isExternal: integer("is_external").notNull().default(0),
  externalUrl: text("external_url"),
  viewCount: integer("view_count").notNull().default(0),
  isPublished: integer("is_published").notNull().default(1),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_blog_posts_category").on(table.category),
  index("idx_blog_posts_is_published").on(table.isPublished),
  index("idx_blog_posts_published_at").on(table.publishedAt),
  index("idx_blog_posts_created_at").on(table.createdAt),
]);

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  viewCount: true,
  createdAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
