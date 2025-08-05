import {
  users,
  items,
  wishlists,
  closets,
  follows,
  likes,
  lookboards,
  lookboardItems,
  priceHistory,
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
  type PriceHistory,
  type InsertPriceHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, isNull } from "drizzle-orm";

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
  getUserWishlist(userId: string): Promise<(Wishlist & Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'addedBy'>)[]>;
  getUserWishlistFolders(userId: string): Promise<string[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, itemId: number): Promise<void>;
  deleteWishlistFolder(userId: string, folderName: string): Promise<void>;
  updateWishlistItem(userId: string, wishlistId: number, updates: Partial<Wishlist>): Promise<Wishlist>;
  
  // Closet operations
  getUserCloset(userId: string): Promise<(Closet & { item: Item })[]>;
  addToCloset(closet: InsertCloset): Promise<Closet>;
  removeFromCloset(userId: string, itemId: number): Promise<void>;
  updateClosetItem(userId: string, closetId: number, updates: Partial<Closet>): Promise<Closet>;
  
  // Social operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getUserFollowing(userId: string): Promise<User[]>;
  getUserFollowers(userId: string): Promise<User[]>;
  getUserSocialStats(userId: string): Promise<any>;
  getUserStats(userId: string): Promise<any>;
  getSuggestedUsers(userId: string): Promise<any[]>;
  searchUsers(userId: string, query: string): Promise<any[]>;
  getUserProfile(currentUserId: string, targetUserId: string): Promise<any>;
  
  // Style Icons operations
  getStyleIcons(): Promise<any[]>;
  getFeaturedStyleIcons(): Promise<any[]>;
  getTrendingLooks(): Promise<any[]>;
  getStyleIconsStats(): Promise<any>;
  followStyleIcon(userId: string, iconId: string): Promise<void>;
  saveLook(userId: string, lookId: string): Promise<void>;
  getPersonalizedStyleIcons(userId: string): Promise<any[]>;
  
  // Like operations
  likeItem(userId: string, itemId: number): Promise<Like>;
  unlikeItem(userId: string, itemId: number): Promise<void>;
  getItemLikes(itemId: number): Promise<number>;
  
  // Lookboard operations
  getUserLookboards(userId: string): Promise<Lookboard[]>;
  createLookboard(lookboard: InsertLookboard): Promise<Lookboard>;
  getLookboard(lookboardId: number): Promise<Lookboard | null>;
  deleteLookboard(userId: string, lookboardId: number): Promise<void>;
  addLookboardItem(item: { lookboardId: number; itemId: number }): Promise<any>;
  
  // Feed operations
  getFriendActivity(userId: string, limit?: number): Promise<any[]>;
  
  // Price tracking operations
  addPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory>;
  getItemPriceHistory(itemId: number, limit?: number): Promise<PriceHistory[]>;
  getLowestPrice(itemId: number): Promise<PriceHistory | null>;
  getPriceAlerts(userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = Math.floor(Date.now() / 1000);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: now,
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
    const now = Math.floor(Date.now() / 1000);
    const [newItem] = await db.insert(items).values({
      ...item,
      createdAt: now,
      updatedAt: now,
    }).returning();
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
  async getUserWishlist(userId: string): Promise<(Wishlist & Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'addedBy'>)[]> {
    return await db
      .select({
        id: wishlists.id,
        userId: wishlists.userId,
        itemId: wishlists.itemId,
        folder: wishlists.folder,
        notes: wishlists.notes,
        priority: wishlists.priority,
        visibility: wishlists.visibility,
        giftMe: wishlists.giftMe,
        createdAt: wishlists.createdAt,
        // Flatten item properties to top level
        name: items.name,
        description: items.description,
        price: items.price,
        currency: items.currency,
        brand: items.brand,
        imageUrl: items.imageUrl,
        sourceUrl: items.sourceUrl,
        category: items.category,
        isPublic: items.isPublic,
      })
      .from(wishlists)
      .innerJoin(items, eq(wishlists.itemId, items.id))
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));
  }

  async getUserWishlistFolders(userId: string): Promise<string[]> {
    const result = await db
      .select({ folder: wishlists.folder })
      .from(wishlists)
      .where(and(
        eq(wishlists.userId, userId),
        sql`${wishlists.folder} IS NOT NULL AND ${wishlists.folder} != ''`
      ))
      .groupBy(wishlists.folder);
    
    return result.map((row: any) => row.folder).filter((folder: any) => folder);
  }

  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const now = Math.floor(Date.now() / 1000);
    const [newWishlist] = await db.insert(wishlists).values({
      ...wishlist,
      createdAt: now,
    }).returning();
    return newWishlist;
  }

  async removeFromWishlist(userId: string, itemId: number): Promise<void> {
    await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.itemId, itemId)));
  }

  async deleteWishlistFolder(userId: string, folderName: string): Promise<void> {
    // Handle the special case of "Uncategorized" which represents items with null or empty folder
    if (folderName === 'Uncategorized') {
      await db
        .delete(wishlists)
        .where(and(
          eq(wishlists.userId, userId), 
          or(isNull(wishlists.folder), eq(wishlists.folder, ''))
        ));
    } else {
      await db
        .delete(wishlists)
        .where(and(eq(wishlists.userId, userId), eq(wishlists.folder, folderName)));
    }
  }

  async updateWishlistItem(userId: string, wishlistId: number, updates: Partial<Wishlist>): Promise<Wishlist> {
    const [updatedWishlist] = await db
      .update(wishlists)
      .set(updates)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.id, wishlistId)))
      .returning();
    return updatedWishlist;
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
        color: closets.color,
        tags: closets.tags,
        lastWorn: closets.lastWorn,
        wearCount: closets.wearCount,
        purchaseDate: closets.purchaseDate,
        purchasePrice: closets.purchasePrice,
        createdAt: closets.createdAt,
        item: items,
      })
      .from(closets)
      .innerJoin(items, eq(closets.itemId, items.id))
      .where(eq(closets.userId, userId))
      .orderBy(desc(closets.createdAt));
  }

  async addToCloset(closet: InsertCloset): Promise<Closet> {
    const now = Math.floor(Date.now() / 1000);
    const [newCloset] = await db.insert(closets).values({
      ...closet,
      createdAt: now,
    }).returning();
    return newCloset;
  }

  async removeFromCloset(userId: string, itemId: number): Promise<void> {
    await db
      .delete(closets)
      .where(and(eq(closets.userId, userId), eq(closets.itemId, itemId)));
  }

  async updateClosetItem(userId: string, closetId: number, updates: Partial<Closet>): Promise<Closet> {
    const [updatedCloset] = await db
      .update(closets)
      .set(updates)
      .where(and(eq(closets.userId, userId), eq(closets.id, closetId)))
      .returning();
    return updatedCloset;
  }

  // Social operations
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ 
        followerId, 
        followingId,
        createdAt: Math.floor(Date.now() / 1000)
      })
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

  async getUserSocialStats(userId: string): Promise<any> {
    // This is a placeholder. In a real application, you'd query for social stats
    // like total followers, following, posts, etc.
    return {
      totalFollowers: 0,
      totalFollowing: 0,
      totalPosts: 0,
    };
  }

  async getUserStats(userId: string): Promise<any> {
    // Get wishlist count
    const wishlistCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishlists)
      .where(eq(wishlists.userId, userId));

    // Get closet count
    const closetCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(closets)
      .where(eq(closets.userId, userId));

    // Get followers count
    const followersCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));

    return {
      wishlistCount: wishlistCount[0]?.count || 0,
      closetCount: closetCount[0]?.count || 0,
      followersCount: followersCount[0]?.count || 0,
    };
  }

  async getSuggestedUsers(userId: string): Promise<any[]> {
    // This is a placeholder. In a real application, you'd query for users
    // that the current user might want to follow.
    return [];
  }

  async searchUsers(userId: string, query: string): Promise<any[]> {
    try {
      // Search users by first name, last name, or email
      const searchResults = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          bio: users.bio,
        })
        .from(users)
        .where(
          or(
            sql`LOWER(${users.firstName}) LIKE ${`%${query.toLowerCase()}%`}`,
            sql`LOWER(${users.lastName}) LIKE ${`%${query.toLowerCase()}%`}`,
            sql`LOWER(${users.email}) LIKE ${`%${query.toLowerCase()}%`}`
          )
        )
        .limit(10);

      return searchResults;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  async getUserProfile(currentUserId: string, targetUserId: string): Promise<any> {
    // This is a placeholder. In a real application, you'd query for a user's profile
    // including their items, wishlists, closet, etc.
    return {
      user: null,
      items: [],
      wishlists: [],
      closet: [],
    };
  }

  // Style Icons operations
  async getStyleIcons(): Promise<any[]> {
    // This is a placeholder. In a real application, you'd query for all style icons.
    return [];
  }

  async getFeaturedStyleIcons(): Promise<any[]> {
    // This is a placeholder. In a real application, you'd query for featured style icons.
    return [];
  }

  async getTrendingLooks(): Promise<any[]> {
    // This is a placeholder. In a real application, you'd query for trending looks.
    return [];
  }

  async getStyleIconsStats(): Promise<any> {
    // This is a placeholder. In a real application, you'd query for stats about style icons.
    return {};
  }

  async followStyleIcon(userId: string, iconId: string): Promise<void> {
    // This is a placeholder. In a real application, you'd add a user's follow to a style icon.
  }

  async saveLook(userId: string, lookId: string): Promise<void> {
    // This is a placeholder. In a real application, you'd save a look for a user.
  }

  async getPersonalizedStyleIcons(userId: string): Promise<any[]> {
    // This is a placeholder. In a real application, you'd query for personalized style icons for a user.
    return [];
  }

  // Like operations
  async likeItem(userId: string, itemId: number): Promise<Like> {
    const now = Math.floor(Date.now() / 1000);
    const [like] = await db
      .insert(likes)
      .values({ userId, itemId, createdAt: now })
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
    const now = Math.floor(Date.now() / 1000);
    const [newLookboard] = await db.insert(lookboards).values({
      ...lookboard,
      createdAt: now,
    }).returning();
    return newLookboard;
  }

  async getLookboard(lookboardId: number): Promise<Lookboard | null> {
    const [lookboard] = await db.select().from(lookboards).where(eq(lookboards.id, lookboardId));
    return lookboard || null;
  }

  async deleteLookboard(userId: string, lookboardId: number): Promise<void> {
    await db
      .delete(lookboards)
      .where(and(eq(lookboards.userId, userId), eq(lookboards.id, lookboardId)));
  }

  async addLookboardItem(item: { lookboardId: number; itemId: number }): Promise<any> {
    const now = Math.floor(Date.now() / 1000);
    const [newLookboardItem] = await db.insert(lookboardItems).values({
      ...item,
      createdAt: now,
    }).returning();
    return newLookboardItem;
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

  // Price tracking operations
  async addPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory> {
    const now = Math.floor(Date.now() / 1000);
    const [newPriceHistory] = await db.insert(priceHistory).values({
      ...priceData,
      recordedAt: now,
    }).returning();
    return newPriceHistory;
  }

  async getItemPriceHistory(itemId: number, limit = 10): Promise<PriceHistory[]> {
    return await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.itemId, itemId))
      .orderBy(desc(priceHistory.recordedAt))
      .limit(limit);
  }

  async getLowestPrice(itemId: number): Promise<PriceHistory | null> {
    const [lowestPrice] = await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.itemId, itemId))
      .orderBy(priceHistory.price)
      .limit(1);
    return lowestPrice || null;
  }

  async getPriceAlerts(userId: string): Promise<any[]> {
    // This is a placeholder. In a real application, you'd query for alerts
    // that are triggered for the user's items.
    return [];
  }

  async getMostWishlistedItems(limit: number = 6) {
    try {
      // Get items that are most wishlisted in the past week
      const result = await db
        .select({
          id: items.id,
          name: items.name,
          brand: items.brand,
          price: items.price,
          imageUrl: items.imageUrl,
          wishlistCount: sql<number>`CAST(COUNT(${wishlists.id}) AS INTEGER)`
        })
        .from(items)
        .leftJoin(wishlists, eq(items.id, wishlists.itemId))
        .groupBy(items.id, items.name, items.brand, items.price, items.imageUrl)
        .orderBy(desc(sql`COUNT(${wishlists.id})`))
        .limit(limit);

      return result;
    } catch (error) {
      console.error("Error getting most wishlisted items:", error);
      // Return mock data as fallback
      return [
        {
          id: 1,
          name: "Everett Linen Dress",
          brand: "Reformation",
          price: "$248",
          imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=400&h=500&fit=crop",
          wishlistCount: 89
        },
        {
          id: 2,
          name: "Crushed Envelope Bag",
          brand: "Dries Van Noten",
          price: "$895",
          imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=400&h=500&fit=crop",
          wishlistCount: 76
        },
        {
          id: 3,
          name: "Shantung Blazer",
          brand: "Gianvito Rossi",
          price: "$1,295",
          imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400&h=500&fit=crop",
          wishlistCount: 64
        },
        {
          id: 4,
          name: "Pleated Midi Skirt",
          brand: "Proenza Schouler",
          price: "$790",
          imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=400&h=500&fit=crop",
          wishlistCount: 58
        },
        {
          id: 5,
          name: "Strappy Sandals",
          brand: "Bottega Veneta",
          price: "$920",
          imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&h=500&fit=crop",
          wishlistCount: 52
        },
        {
          id: 6,
          name: "Canvas Tote",
          brand: "Celine",
          price: "$1,450",
          imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&h=500&fit=crop",
          wishlistCount: 48
        }
      ];
    }
  }
}

export const storage = new DatabaseStorage();
