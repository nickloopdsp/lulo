import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  brand: varchar("brand", { length: 100 }),
  imageUrl: varchar("image_url", { length: 500 }),
  sourceUrl: varchar("source_url", { length: 500 }),
  category: varchar("category", { length: 100 }),
  addedBy: varchar("added_by").references(() => users.id),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  notes: text("notes"),
  priority: integer("priority").default(1), // 1-5 scale
  visibility: varchar("visibility", { length: 20 }).default("public"), // public, private, friends
  giftMe: boolean("gift_me").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const closets = pgTable("closets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  notes: text("notes"),
  size: varchar("size", { length: 20 }),
  condition: varchar("condition", { length: 20 }),
  borrowable: boolean("borrowable").default(false),
  frequency: varchar("frequency", { length: 20 }), // rarely, sometimes, often
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: varchar("follower_id").references(() => users.id).notNull(),
  followingId: varchar("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lookboards = pgTable("lookboards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  visibility: varchar("visibility", { length: 20 }).default("public"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lookboardItems = pgTable("lookboard_items", {
  id: serial("id").primaryKey(),
  lookboardId: integer("lookboard_id").references(() => lookboards.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
