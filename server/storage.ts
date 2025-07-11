import {
  users,
  items,
  wishlists,
  closets,
  follows,
  likes,
  lookboards,
  lookboardItems,
  type User,
  type UpsertUser,
  type Item,
  type InsertItem,
  type Wishlist,
  type InsertWishlist,
  type Closet,
  type InsertCloset,
  type Follow,
  type Like,
  type Lookboard,
  type InsertLookboard,
  type LookboardItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Item operations
  getItems(limit?: number): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  getTrendingItems(limit?: number): Promise<Item[]>;
  
  // Wishlist operations
  getUserWishlist(userId: string): Promise<(Wishlist & { item: Item })[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, itemId: number): Promise<void>;
  
  // Closet operations
  getUserCloset(userId: string): Promise<(Closet & { item: Item })[]>;
  addToCloset(closet: InsertCloset): Promise<Closet>;
  removeFromCloset(userId: string, itemId: number): Promise<void>;
  
  // Social operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getUserFollowing(userId: string): Promise<User[]>;
  getUserFollowers(userId: string): Promise<User[]>;
  
  // Like operations
  likeItem(userId: string, itemId: number): Promise<Like>;
  unlikeItem(userId: string, itemId: number): Promise<void>;
  getItemLikes(itemId: number): Promise<number>;
  
  // Lookboard operations
  getUserLookboards(userId: string): Promise<Lookboard[]>;
  createLookboard(lookboard: InsertLookboard): Promise<Lookboard>;
  
  // Feed operations
  getFriendActivity(userId: string, limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
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
    return user;
  }

  // Item operations
  async getItems(limit = 20): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(eq(items.isPublic, true))
      .orderBy(desc(items.createdAt))
      .limit(limit);
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async getTrendingItems(limit = 20): Promise<Item[]> {
    return await db
      .select({
        id: items.id,
        name: items.name,
        description: items.description,
        price: items.price,
        currency: items.currency,
        brand: items.brand,
        imageUrl: items.imageUrl,
        sourceUrl: items.sourceUrl,
        category: items.category,
        addedBy: items.addedBy,
        isPublic: items.isPublic,
        createdAt: items.createdAt,
        updatedAt: items.updatedAt,
      })
      .from(items)
      .leftJoin(likes, eq(items.id, likes.itemId))
      .where(eq(items.isPublic, true))
      .groupBy(items.id)
      .orderBy(desc(sql`count(${likes.id})`))
      .limit(limit);
  }

  // Wishlist operations
  async getUserWishlist(userId: string): Promise<(Wishlist & { item: Item })[]> {
    return await db
      .select({
        id: wishlists.id,
        userId: wishlists.userId,
        itemId: wishlists.itemId,
        notes: wishlists.notes,
        priority: wishlists.priority,
        visibility: wishlists.visibility,
        giftMe: wishlists.giftMe,
        createdAt: wishlists.createdAt,
        item: items,
      })
      .from(wishlists)
      .innerJoin(items, eq(wishlists.itemId, items.id))
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));
  }

  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const [newWishlist] = await db.insert(wishlists).values(wishlist).returning();
    return newWishlist;
  }

  async removeFromWishlist(userId: string, itemId: number): Promise<void> {
    await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.itemId, itemId)));
  }

  // Closet operations
  async getUserCloset(userId: string): Promise<(Closet & { item: Item })[]> {
    return await db
      .select({
        id: closets.id,
        userId: closets.userId,
        itemId: closets.itemId,
        notes: closets.notes,
        size: closets.size,
        condition: closets.condition,
        borrowable: closets.borrowable,
        frequency: closets.frequency,
        createdAt: closets.createdAt,
        item: items,
      })
      .from(closets)
      .innerJoin(items, eq(closets.itemId, items.id))
      .where(eq(closets.userId, userId))
      .orderBy(desc(closets.createdAt));
  }

  async addToCloset(closet: InsertCloset): Promise<Closet> {
    const [newCloset] = await db.insert(closets).values(closet).returning();
    return newCloset;
  }

  async removeFromCloset(userId: string, itemId: number): Promise<void> {
    await db
      .delete(closets)
      .where(and(eq(closets.userId, userId), eq(closets.itemId, itemId)));
  }

  // Social operations
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
      );
  }

  async getUserFollowing(userId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
  }

  async getUserFollowers(userId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
  }

  // Like operations
  async likeItem(userId: string, itemId: number): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values({ userId, itemId })
      .returning();
    return like;
  }

  async unlikeItem(userId: string, itemId: number): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.itemId, itemId)));
  }

  async getItemLikes(itemId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(likes)
      .where(eq(likes.itemId, itemId));
    return result.count;
  }

  // Lookboard operations
  async getUserLookboards(userId: string): Promise<Lookboard[]> {
    return await db
      .select()
      .from(lookboards)
      .where(eq(lookboards.userId, userId))
      .orderBy(desc(lookboards.createdAt));
  }

  async createLookboard(lookboard: InsertLookboard): Promise<Lookboard> {
    const [newLookboard] = await db.insert(lookboards).values(lookboard).returning();
    return newLookboard;
  }

  // Feed operations
  async getFriendActivity(userId: string, limit = 20): Promise<any[]> {
    // Get recent wishlist additions from followed users
    const wishlistActivity = await db
      .select({
        type: sql<string>`'wishlist_add'`,
        userId: wishlists.userId,
        user: users,
        item: items,
        createdAt: wishlists.createdAt,
      })
      .from(wishlists)
      .innerJoin(users, eq(wishlists.userId, users.id))
      .innerJoin(items, eq(wishlists.itemId, items.id))
      .innerJoin(follows, eq(follows.followingId, wishlists.userId))
      .where(eq(follows.followerId, userId))
      .orderBy(desc(wishlists.createdAt))
      .limit(limit);

    return wishlistActivity;
  }
}

export const storage = new DatabaseStorage();
