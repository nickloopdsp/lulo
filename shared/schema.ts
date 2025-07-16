import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  bio: text("bio"),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price"),
  currency: text("currency").default("USD"),
  brand: text("brand"),
  imageUrl: text("image_url"),
  sourceUrl: text("source_url"),
  category: text("category"),
  addedBy: text("added_by").references(() => users.id),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});

export const wishlists = sqliteTable("wishlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  folder: text("folder"),
  notes: text("notes"),
  priority: integer("priority").default(1), // 1-5 scale
  visibility: text("visibility").default("public"), // public, private, friends
  giftMe: integer("gift_me", { mode: "boolean" }).default(false),
  createdAt: integer("created_at"),
});

export const closets = sqliteTable("closets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  notes: text("notes"),
  size: text("size"),
  condition: text("condition"), // new, like_new, good, fair, poor
  borrowable: integer("borrowable", { mode: "boolean" }).default(false),
  frequency: text("frequency"), // rarely, sometimes, often
  color: text("color"), // primary color
  tags: text("tags"), // JSON array of tags
  lastWorn: integer("last_worn"),
  wearCount: integer("wear_count").default(0),
  purchaseDate: integer("purchase_date"),
  purchasePrice: real("purchase_price"),
  createdAt: integer("created_at"),
});

export const follows = sqliteTable("follows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  followerId: text("follower_id").references(() => users.id).notNull(),
  followingId: text("following_id").references(() => users.id).notNull(),
  createdAt: integer("created_at"),
});

export const likes = sqliteTable("likes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  createdAt: integer("created_at"),
});

export const lookboards = sqliteTable("lookboards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  visibility: text("visibility").default("public"),
  createdAt: integer("created_at"),
});

export const lookboardItems = sqliteTable("lookboard_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lookboardId: integer("lookboard_id").references(() => lookboards.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  createdAt: integer("created_at"),
});

export const priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").references(() => items.id).notNull(),
  price: real("price").notNull(),
  currency: text("currency").default("USD"),
  source: text("source"), // e.g., "zara.com", "amazon.com"
  sourceUrl: text("source_url"),
  recordedAt: integer("recorded_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  items: many(items),
  wishlists: many(wishlists),
  closets: many(closets),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  likes: many(likes),
  lookboards: many(lookboards),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  addedBy: one(users, {
    fields: [items.addedBy],
    references: [users.id],
  }),
  wishlists: many(wishlists),
  closets: many(closets),
  likes: many(likes),
  lookboardItems: many(lookboardItems),
  priceHistory: many(priceHistory),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [wishlists.itemId],
    references: [items.id],
  }),
}));

export const closetsRelations = relations(closets, ({ one }) => ({
  user: one(users, {
    fields: [closets.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [closets.itemId],
    references: [items.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [likes.itemId],
    references: [items.id],
  }),
}));

export const lookboardsRelations = relations(lookboards, ({ one, many }) => ({
  user: one(users, {
    fields: [lookboards.userId],
    references: [users.id],
  }),
  items: many(lookboardItems),
}));

export const lookboardItemsRelations = relations(lookboardItems, ({ one }) => ({
  lookboard: one(lookboards, {
    fields: [lookboardItems.lookboardId],
    references: [lookboards.id],
  }),
  item: one(items, {
    fields: [lookboardItems.itemId],
    references: [items.id],
  }),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  item: one(items, {
    fields: [priceHistory.itemId],
    references: [items.id],
  }),
}));

// Insert schemas
export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
});

export const insertClosetSchema = createInsertSchema(closets).omit({
  id: true,
  createdAt: true,
});

export const insertLookboardSchema = createInsertSchema(lookboards).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Closet = typeof closets.$inferSelect;
export type InsertCloset = z.infer<typeof insertClosetSchema>;
export type Follow = typeof follows.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Lookboard = typeof lookboards.$inferSelect;
export type InsertLookboard = z.infer<typeof insertLookboardSchema>;
export type LookboardItem = typeof lookboardItems.$inferSelect;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;
