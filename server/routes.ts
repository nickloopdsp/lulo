import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertItemSchema, insertWishlistSchema, insertClosetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Item routes
  app.get('/api/items', async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get('/api/items/trending', async (req, res) => {
    try {
      const items = await storage.getTrendingItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching trending items:", error);
      res.status(500).json({ message: "Failed to fetch trending items" });
    }
  });

  app.post('/api/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertItemSchema.parse({ ...req.body, addedBy: userId });
      const item = await storage.createItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  // Wishlist routes
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlist = await storage.getUserWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistData = insertWishlistSchema.parse({ ...req.body, userId });
      const wishlist = await storage.addToWishlist(wishlistData);
      res.json(wishlist);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/wishlist/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.itemId);
      await storage.removeFromWishlist(userId, itemId);
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Closet routes
  app.get('/api/closet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const closet = await storage.getUserCloset(userId);
      res.json(closet);
    } catch (error) {
      console.error("Error fetching closet:", error);
      res.status(500).json({ message: "Failed to fetch closet" });
    }
  });

  app.post('/api/closet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const closetData = insertClosetSchema.parse({ ...req.body, userId });
      const closet = await storage.addToCloset(closetData);
      res.json(closet);
    } catch (error) {
      console.error("Error adding to closet:", error);
      res.status(500).json({ message: "Failed to add to closet" });
    }
  });

  app.delete('/api/closet/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.itemId);
      await storage.removeFromCloset(userId, itemId);
      res.json({ message: "Item removed from closet" });
    } catch (error) {
      console.error("Error removing from closet:", error);
      res.status(500).json({ message: "Failed to remove from closet" });
    }
  });

  // Social routes
  app.post('/api/follow/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.userId;
      const follow = await storage.followUser(followerId, followingId);
      res.json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/follow/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.userId;
      await storage.unfollowUser(followerId, followingId);
      res.json({ message: "User unfollowed" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // Like routes
  app.post('/api/like/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.itemId);
      const like = await storage.likeItem(userId, itemId);
      res.json(like);
    } catch (error) {
      console.error("Error liking item:", error);
      res.status(500).json({ message: "Failed to like item" });
    }
  });

  app.delete('/api/like/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.itemId);
      await storage.unlikeItem(userId, itemId);
      res.json({ message: "Item unliked" });
    } catch (error) {
      console.error("Error unliking item:", error);
      res.status(500).json({ message: "Failed to unlike item" });
    }
  });

  app.get('/api/like/:itemId/count', async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const count = await storage.getItemLikes(itemId);
      res.json({ count });
    } catch (error) {
      console.error("Error getting like count:", error);
      res.status(500).json({ message: "Failed to get like count" });
    }
  });

  // Feed routes
  app.get('/api/feed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activity = await storage.getFriendActivity(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
