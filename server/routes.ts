import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertItemSchema, insertWishlistSchema, insertClosetSchema } from "@shared/schema";
import { z } from "zod";
import { aiImageAnalysisService } from "./services/aiImageAnalysis";
import { productSearchService } from "./services/productSearchService";
import { FashionNewsService } from "./services/fashionNewsService";

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

  // Stats route
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
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
      
      // Prevent caching to ensure fresh data after modifications
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // Get wishlist folders
  app.get('/api/wishlist/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folders = await storage.getUserWishlistFolders(userId);
      
      // Prevent caching to ensure fresh data after modifications
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.json(folders);
    } catch (error) {
      console.error("Error fetching wishlist folders:", error);
      res.status(500).json({ message: "Failed to fetch wishlist folders" });
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

  // Update wishlist item
  app.put('/api/wishlist/:wishlistId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistId = parseInt(req.params.wishlistId);
      const { visibility, priority, giftMe, notes } = req.body;
      
      const updatedWishlist = await storage.updateWishlistItem(userId, wishlistId, {
        visibility,
        priority,
        giftMe,
        notes,
      });
      
      res.json(updatedWishlist);
    } catch (error) {
      console.error("Error updating wishlist item:", error);
      res.status(500).json({ message: "Failed to update wishlist item" });
    }
  });

  // Delete wishlist folder
  app.delete('/api/wishlist/folders/:folderName', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folderName = decodeURIComponent(req.params.folderName);
      await storage.deleteWishlistFolder(userId, folderName);
      res.json({ message: "Folder deleted successfully" });
    } catch (error) {
      console.error("Error deleting wishlist folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
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

  // Update closet item
  app.put('/api/closet/:closetId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const closetId = parseInt(req.params.closetId);
      const { notes, size, condition, borrowable, frequency, color, tags, purchasePrice, purchaseDate } = req.body;
      
      const updatedCloset = await storage.updateClosetItem(userId, closetId, {
        notes,
        size,
        condition,
        borrowable,
        frequency,
        color,
        tags,
        purchasePrice: purchasePrice ? purchasePrice.toString() : null,
        purchaseDate,
      });
      
      res.json(updatedCloset);
    } catch (error) {
      console.error("Error updating closet item:", error);
      res.status(500).json({ message: "Failed to update closet item" });
    }
  });

  // Social routes
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

  // Price tracking routes
  app.get('/api/items/:itemId/price-history', async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const limit = parseInt(req.query.limit as string) || 10;
      const priceHistory = await storage.getItemPriceHistory(itemId, limit);
      res.json(priceHistory);
    } catch (error) {
      console.error("Error fetching price history:", error);
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });

  app.get('/api/items/:itemId/lowest-price', async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const lowestPrice = await storage.getLowestPrice(itemId);
      res.json(lowestPrice);
    } catch (error) {
      console.error("Error fetching lowest price:", error);
      res.status(500).json({ message: "Failed to fetch lowest price" });
    }
  });

  app.post('/api/items/:itemId/price-history', isAuthenticated, async (req: any, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const { price, currency, source, sourceUrl } = req.body;
      
      const priceData = {
        itemId,
        price: price.toString(),
        currency: currency || 'USD',
        source,
        sourceUrl,
      };
      
      const newPriceHistory = await storage.addPriceHistory(priceData);
      res.json(newPriceHistory);
    } catch (error) {
      console.error("Error adding price history:", error);
      res.status(500).json({ message: "Failed to add price history" });
    }
  });

  app.get('/api/price-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alerts = await storage.getPriceAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Failed to fetch price alerts" });
    }
  });

  // Image recognition routes
  app.post('/api/image-recognition', isAuthenticated, async (req: any, res) => {
    try {
      const { imageData } = req.body;
      
      // In a real implementation, this would:
      // 1. Upload image to cloud storage
      // 2. Call Google Vision API or similar service
      // 3. Process results and find matching items
      // 4. Return structured data
      
      // For now, return mock data
      const mockResult = {
        confidence: 0.87,
        category: "clothing",
        suggestedName: "Floral Summer Dress",
        suggestedBrand: "Zara",
        suggestedPrice: 89.99,
        similarItems: [
          { id: 1, name: "Similar Floral Dress", brand: "H&M", price: 79.99 },
          { id: 2, name: "Summer Midi Dress", brand: "Mango", price: 95.00 },
        ]
      };
      
      // Simulate processing time
      setTimeout(() => {
        res.json(mockResult);
      }, 1500);
      
    } catch (error) {
      console.error("Error processing image recognition:", error);
      res.status(500).json({ message: "Failed to process image" });
    }
  });

  app.get('/api/similar-items/:itemId', async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      // In a real implementation, this would use ML to find similar items
      const similarItems = await storage.getTrendingItems(5);
      res.json(similarItems);
    } catch (error) {
      console.error("Error fetching similar items:", error);
      res.status(500).json({ message: "Failed to fetch similar items" });
    }
  });

  // Lookbook routes
  app.get('/api/lookbooks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lookbooks = await storage.getUserLookboards(userId);
      res.json(lookbooks);
    } catch (error) {
      console.error("Error fetching lookbooks:", error);
      res.status(500).json({ message: "Failed to fetch lookbooks" });
    }
  });

  app.post('/api/lookbooks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, visibility, category, items, canvasSize, backgroundStyle, imageUrl } = req.body;
      
      const lookbookData = {
        userId,
        title,
        description,
        visibility,
        imageUrl,
      };
      
      const lookbook = await storage.createLookboard(lookbookData);
      
      // Save lookbook items
      if (items && items.length > 0) {
        for (const item of items) {
          await storage.addLookboardItem({
            lookboardId: lookbook.id,
            itemId: item.itemId,
          });
        }
      }
      
      res.json(lookbook);
    } catch (error) {
      console.error("Error creating lookbook:", error);
      res.status(500).json({ message: "Failed to create lookbook" });
    }
  });

  app.get('/api/lookbooks/:lookbookId', async (req, res) => {
    try {
      const lookbookId = parseInt(req.params.lookbookId);
      const lookbook = await storage.getLookboard(lookbookId);
      res.json(lookbook);
    } catch (error) {
      console.error("Error fetching lookbook:", error);
      res.status(500).json({ message: "Failed to fetch lookbook" });
    }
  });

  app.delete('/api/lookbooks/:lookbookId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lookbookId = parseInt(req.params.lookbookId);
      await storage.deleteLookboard(userId, lookbookId);
      res.json({ message: "Lookbook deleted" });
    } catch (error) {
      console.error("Error deleting lookbook:", error);
      res.status(500).json({ message: "Failed to delete lookbook" });
    }
  });

  // Social Network routes
  app.get('/api/social/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserSocialStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching social stats:", error);
      res.status(500).json({ message: "Failed to fetch social stats" });
    }
  });

  app.get('/api/social/followers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const followers = await storage.getUserFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.get('/api/social/following', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const following = await storage.getUserFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  app.get('/api/social/suggested', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suggested = await storage.getSuggestedUsers(userId);
      res.json(suggested);
    } catch (error) {
      console.error("Error fetching suggested users:", error);
      res.status(500).json({ message: "Failed to fetch suggested users" });
    }
  });

  app.get('/api/social/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const results = await storage.searchUsers(userId, query);
      res.json(results);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  app.post('/api/social/follow/:targetUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const targetUserId = req.params.targetUserId;
      
      if (userId === targetUserId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      await storage.followUser(userId, targetUserId);
      res.json({ message: "User followed successfully" });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/social/follow/:targetUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const targetUserId = req.params.targetUserId;
      
      await storage.unfollowUser(userId, targetUserId);
      res.json({ message: "User unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get('/api/social/user/:targetUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const targetUserId = req.params.targetUserId;
      
      const userProfile = await storage.getUserProfile(userId, targetUserId);
      res.json(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Style Icons routes
  app.get('/api/style-icons', async (req, res) => {
    try {
      const styleIcons = await storage.getStyleIcons();
      res.json(styleIcons);
    } catch (error) {
      console.error("Error fetching style icons:", error);
      res.status(500).json({ message: "Failed to fetch style icons" });
    }
  });

  app.get('/api/style-icons/featured', async (req, res) => {
    try {
      const featuredIcons = await storage.getFeaturedStyleIcons();
      res.json(featuredIcons);
    } catch (error) {
      console.error("Error fetching featured style icons:", error);
      res.status(500).json({ message: "Failed to fetch featured style icons" });
    }
  });

  app.get('/api/trending-looks', async (req, res) => {
    try {
      const trendingLooks = await storage.getTrendingLooks();
      res.json(trendingLooks);
    } catch (error) {
      console.error("Error fetching trending looks:", error);
      res.status(500).json({ message: "Failed to fetch trending looks" });
    }
  });

  app.get('/api/style-icons/stats', async (req, res) => {
    try {
      const stats = await storage.getStyleIconsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching style icons stats:", error);
      res.status(500).json({ message: "Failed to fetch style icons stats" });
    }
  });

  app.post('/api/style-icons/:iconId/follow', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const iconId = req.params.iconId;
      
      await storage.followStyleIcon(userId, iconId);
      res.json({ message: "Style icon followed successfully" });
    } catch (error) {
      console.error("Error following style icon:", error);
      res.status(500).json({ message: "Failed to follow style icon" });
    }
  });

  app.post('/api/looks/:lookId/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lookId = req.params.lookId;
      
      await storage.saveLook(userId, lookId);
      res.json({ message: "Look saved successfully" });
    } catch (error) {
      console.error("Error saving look:", error);
      res.status(500).json({ message: "Failed to save look" });
    }
  });

  app.get('/api/personalized-icons', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personalizedIcons = await storage.getPersonalizedStyleIcons(userId);
      res.json(personalizedIcons);
    } catch (error) {
      console.error("Error fetching personalized icons:", error);
      res.status(500).json({ message: "Failed to fetch personalized icons" });
    }
  });

  // Fashion News routes
  app.get('/api/fashion-news', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const region = req.query.region as string || 'global';
      
      console.log("Fetching fashion news for user:", userId, "region:", region);
      const fashionNews = await FashionNewsService.getFashionNews(userId, region);
      console.log("Fashion news result count:", fashionNews.length);
      res.json(fashionNews);
    } catch (error) {
      console.error("Error fetching fashion news:", error);
      res.status(500).json({ message: "Failed to fetch fashion news" });
    }
  });

  app.get('/api/fashion-news/trending-topics', async (req, res) => {
    try {
      const trendingTopics = await FashionNewsService.getTrendingTopics();
      res.json(trendingTopics);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // AI Image Analysis routes
  app.post('/api/ai/analyze-image', isAuthenticated, async (req: any, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const analysis = await aiImageAnalysisService.analyzeImage(base64Data);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  app.post('/api/ai/similar-items', isAuthenticated, async (req: any, res) => {
    try {
      const analysis = req.body;
      
      if (!analysis) {
        return res.status(400).json({ message: "Analysis data is required" });
      }
      
      const similarItems = await aiImageAnalysisService.generateSimilarItems(analysis);
      res.json(similarItems);
    } catch (error) {
      console.error("Error generating similar items:", error);
      res.status(500).json({ message: "Failed to generate similar items" });
    }
  });

  // Product search routes
  app.post('/api/products/search-retailers', isAuthenticated, async (req: any, res) => {
    try {
      const { item, region = 'USA' } = req.body;
      
      if (!item) {
        return res.status(400).json({ message: "Product item data is required" });
      }
      
      console.log(`Searching retailers for: ${item.name} by ${item.brand}`);
      const searchResult = await productSearchService.searchProduct(item, region);
      res.json(searchResult);
    } catch (error) {
      console.error("Error searching retailers:", error);
      res.status(500).json({ message: "Failed to search retailers" });
    }
  });

  // Link scraping endpoint
  app.post('/api/products/scrape-url', isAuthenticated, async (req: any, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      
      // Basic URL validation
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }
      
      console.log(`Scraping product from URL: ${url}`);
      
      // Use the productSearchService to handle URL scraping
      const scrapedData = await productSearchService.scrapeProductFromUrl(url);
      
      // Ensure consistent data format
      const formattedData = {
        id: scrapedData.id || Date.now().toString(),
        name: scrapedData.name || '',
        brand: scrapedData.brand || '',
        price: scrapedData.price || '',
        originalPrice: scrapedData.originalPrice,
        description: scrapedData.description || '',
        category: scrapedData.category || 'clothing',
        imageUrl: scrapedData.imageUrl || '',
        sourceUrl: scrapedData.sourceUrl || url,
        color: scrapedData.color,
        sizes: scrapedData.sizes || [],
        material: scrapedData.material,
      };
      
      res.json(formattedData);
    } catch (error) {
      console.error("Error scraping URL:", error);
      
      // Send more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          res.status(504).json({ message: "Request timeout - the page took too long to load" });
        } else if (error.message.includes('not found')) {
          res.status(404).json({ message: "Product page not found" });
        } else {
          res.status(500).json({ message: error.message || "Failed to scrape product information from URL" });
        }
      } else {
        res.status(500).json({ message: "Failed to scrape product information from URL" });
      }
    }
  });

  app.post('/api/products/similar', isAuthenticated, async (req: any, res) => {
    try {
      const { item, limit = 8 } = req.body;
      
      if (!item) {
        return res.status(400).json({ message: "Product item data is required" });
      }
      
      console.log(`Finding similar products for: ${item.name}`);
      const similarProducts = await productSearchService.searchSimilarProducts(item, limit);
      res.json({ products: similarProducts });
    } catch (error) {
      console.error("Error finding similar products:", error);
      res.status(500).json({ message: "Failed to find similar products" });
    }
  });

  // Image upload routes
  app.post('/api/upload/image', isAuthenticated, async (req: any, res) => {
    try {
      const { imageBase64, filename } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // For now, return a placeholder URL
      // In production, you would save the image to cloud storage (S3, Cloudinary, etc.)
      // and return the permanent URL
      const mockImageUrl = `/api/placeholder/400/500?id=${Date.now()}`;
      
      res.json({ 
        imageUrl: mockImageUrl,
        message: "Image uploaded successfully" 
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Placeholder image routes
  app.get('/api/placeholder/:width/:height', (req, res) => {
    const width = parseInt(req.params.width) || 200;
    const height = parseInt(req.params.height) || 200;
    
    // Limit dimensions for security
    const maxWidth = Math.min(width, 1000);
    const maxHeight = Math.min(height, 1000);
    
    // Generate a simple hash from dimensions to ensure consistent colors for same sizes
    const hash = (maxWidth + maxHeight) % 6;
    
    // Fashion-inspired color gradients
    const gradients = [
      { from: '#ff6b9d', to: '#ffa726' }, // Pink to orange (lulo-pink to lulo-coral)
      { from: '#81c784', to: '#4db6ac' }, // Green to teal (lulo-sage inspired)
      { from: '#64b5f6', to: '#42a5f5' }, // Light blue gradient
      { from: '#ba68c8', to: '#9c27b0' }, // Purple gradient
      { from: '#f06292', to: '#e91e63' }, // Pink gradient
      { from: '#a1887f', to: '#8d6e63' }, // Brown/tan gradient
    ];
    
    const gradient = gradients[hash];
    
    const svgContent = `
      <svg width="${maxWidth}" height="${maxHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad${hash})"/>
        <g transform="translate(${maxWidth/2}, ${maxHeight/2})">
          <!-- Fashion-inspired icon -->
          <circle cx="0" cy="-10" r="15" fill="rgba(255,255,255,0.3)" />
          <rect x="-12" y="5" width="24" height="20" rx="2" fill="rgba(255,255,255,0.3)" />
          <text x="0" y="${maxHeight/4}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.8)">
            ${maxWidth} × ${maxHeight}
          </text>
        </g>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(svgContent);
  });

  const httpServer = createServer(app);
  return httpServer;
}
