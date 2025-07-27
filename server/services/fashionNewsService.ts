import { db } from "../db";
import { items, wishlists, closets } from "../../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface FashionArticle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  articleUrl: string;
  source: string;
  category: string;
  publishedDate: string;
  readTime: string;
  relevanceScore?: number;
}

// Mock data for now - in production, this would fetch from actual APIs
const FASHION_SOURCES = {
  harpersBazaar: "Harper's Bazaar",
  whoWhatWear: "Who What Wear",
  vogue: "Vogue",
  elle: "Elle"
};

// Curated articles from each publication source - always displayed
const curatedArticles: FashionArticle[] = [
  // Harper's Bazaar
  {
    id: "harpers-1",
    title: "The Top 10 Fashion Trends From the Spring 2025 Runways",
    description: "From maximalist florals to new minimalism, here's everything you need to know about next season's biggest trends.",
    imageUrl: "/api/placeholder/400/500",
    articleUrl: "https://www.harpersbazaar.com/fashion/trends/",
    source: "HARPER'S BAZAAR",
    category: "Trends",
    publishedDate: new Date().toISOString(),
    readTime: "10 min read"
  },
  
  // Who What Wear - Shopping
  {
    id: "wwwshopping-1",
    title: "The 9 Most Expensive-Looking Pieces on the High Street This Week",
    description: "From elevated basics to statement pieces, these high street finds rival designer quality without the price tag.",
    imageUrl: "/api/placeholder/400/500",
    articleUrl: "https://www.whowhatwear.com/fashion/shopping",
    source: "WHO WHAT WEAR UK",
    category: "Shopping",
    publishedDate: new Date().toISOString(),
    readTime: "5 min read"
  },
  
  // Who What Wear - Outfit Ideas
  {
    id: "wwwoutfit-1",
    title: "5 Outfit Formulas Fashion People Rely On When They Have Nothing to Wear",
    description: "Save these fail-safe combinations for those mornings when inspiration is running low.",
    imageUrl: "/api/placeholder/400/500",
    articleUrl: "https://www.whowhatwear.com/fashion/outfit-ideas",
    source: "WHO WHAT WEAR UK",
    category: "Outfit Ideas",
    publishedDate: new Date().toISOString(),
    readTime: "6 min read"
  },
  
  // Who What Wear - Trends
  {
    id: "wwwtrends-1",
    title: "6 Autumn/Winter Trends Fashion People Are Already Wearing",
    description: "Get ahead of the curve with these editor-approved trends that are already making waves on the streets.",
    imageUrl: "/api/placeholder/400/500",
    articleUrl: "https://www.whowhatwear.com/fashion/trends",
    source: "WHO WHAT WEAR UK",
    category: "Trends",
    publishedDate: new Date().toISOString(),
    readTime: "8 min read"
  },
  
  // Vogue
  {
    id: "vogue-1",
    title: "Shop the 15 Best Investment Pieces for Your Wardrobe",
    description: "Vogue editors share their picks for timeless pieces worth the splurge, from the perfect trench to forever bags.",
    imageUrl: "/api/placeholder/400/500",
    articleUrl: "https://www.vogue.com/shopping",
    source: "VOGUE",
    category: "Shopping",
    publishedDate: new Date().toISOString(),
    readTime: "12 min read"
  },
  
  // Elle
  {
    id: "elle-1",
    title: "The Biggest Color Trends to Wear This Season",
    description: "From dopamine brights to earthy neutrals, these are the shades dominating runways and street style.",
    imageUrl: "/api/placeholder/400/500",
    articleUrl: "https://www.elle.com/fashion/trend-reports/",
    source: "ELLE",
    category: "Trend Reports",
    publishedDate: new Date().toISOString(),
    readTime: "7 min read"
  }
];

export class FashionNewsService {
  static async getFashionNews(userId: string, region: string = "global"): Promise<FashionArticle[]> {
    try {
      console.log("FashionNewsService: Getting fashion news for user", userId);
      
      // Get user's wishlist items
      const wishlistData = await db
        .select({
          category: items.category,
          brand: items.brand
        })
        .from(wishlists)
        .innerJoin(items, eq(wishlists.itemId, items.id))
        .where(eq(wishlists.userId, userId))
        .limit(25);
      
      console.log("FashionNewsService: Found", wishlistData.length, "wishlist items");

      // Get user's closet items with color and tags
      const closetData = await db
        .select({
          category: items.category,
          brand: items.brand,
          color: closets.color,
          tags: closets.tags
        })
        .from(closets)
        .innerJoin(items, eq(closets.itemId, items.id))
        .where(eq(closets.userId, userId))
        .limit(25);

      // Combine both datasets
      const userItems = [...wishlistData, ...closetData];

      // Always return curated articles to ensure content is displayed
      console.log("FashionNewsService: Returning", curatedArticles.length, "curated articles");
      return curatedArticles;
    } catch (error) {
      console.error("Error fetching fashion news:", error);
      // Return curated articles even if there's an error
      console.log("FashionNewsService: Returning curated articles due to error");
      return curatedArticles;
    }
  }

  private static analyzeUserPreferences(userItems: any[]): any {
    // Simple preference analysis - in production, use AI
    const categories = new Set<string>();
    const brands = new Set<string>();
    const styles = new Set<string>();

    userItems.forEach(item => {
      if (item.category) categories.add(item.category);
      if (item.brand) brands.add(item.brand);
      if (item.tags) {
        try {
          const parsedTags = JSON.parse(item.tags);
          if (Array.isArray(parsedTags)) {
            parsedTags.forEach((tag: string) => styles.add(tag));
          }
        } catch (e) {
          // If tags is not valid JSON, skip it
        }
      }
    });

    return {
      favoriteCategories: Array.from(categories),
      favoriteBrands: Array.from(brands),
      favoriteStyles: Array.from(styles)
    };
  }

  private static calculateRelevanceScore(article: FashionArticle, preferences: any): number {
    let score = 0.5; // Base score

    // Boost score based on matching categories
    if (preferences.favoriteCategories.some((cat: string) => 
      article.title.toLowerCase().includes(cat.toLowerCase()) ||
      article.description.toLowerCase().includes(cat.toLowerCase())
    )) {
      score += 0.2;
    }

    // Boost score based on matching brands
    if (preferences.favoriteBrands.some((brand: string) => 
      article.title.toLowerCase().includes(brand.toLowerCase()) ||
      article.description.toLowerCase().includes(brand.toLowerCase())
    )) {
      score += 0.3;
    }

    // Random factor for variety
    score += Math.random() * 0.2;

    return Math.min(score, 1);
  }

  static async getTrendingTopics(): Promise<string[]> {
    // Mock trending topics - in production, analyze real data
    return [
      "minimalist style",
      "sustainable fashion",
      "90s revival",
      "oversized blazers",
      "monochrome outfits",
      "vintage denim"
    ];
  }
} 