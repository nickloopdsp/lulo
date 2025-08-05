import { db } from "../db";
import { items, wishlists, closets } from "../../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface FashionProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  sourceUrl: string;
  shopAtText: string;
}

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
  content?: string;
  heroImage?: string;
  embeddedProducts?: FashionProduct[];
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
    readTime: "10 min read",
    content: `<p>Spring 2025 runways have spoken, and the message is clear: fashion is embracing both maximalism and minimalism in equal measure. From bold florals to clean lines, here are the top trends that will define the upcoming season.</p>

<h3>1. Maximalist Florals</h3>
<p>Oversized blooms and intricate botanical prints dominated the runways at Valentino, Dolce & Gabbana, and Erdem. These aren't your grandmother's flower prints – think bold, graphic interpretations of nature.</p>

<h3>2. New Minimalism</h3>
<p>Clean lines and neutral palettes made a strong statement at Jil Sander and The Row. This isn't stark minimalism, but rather a softer, more approachable take on simplicity.</p>

<h3>3. Sustainable Luxury</h3>
<p>Eco-conscious materials and transparent production processes are becoming the norm rather than the exception, with brands like Stella McCartney leading the charge.</p>`
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
    readTime: "5 min read",
    content: `<p>High street fashion has never looked more luxurious. This week's picks prove that you don't need to spend a fortune to look like you did. From elevated basics to statement pieces, these finds rival designer quality without the hefty price tag.</p>

<h3>1. The Perfect White Shirt</h3>
<p>COS delivers with their crisp cotton shirt that could easily pass for a designer piece. The attention to detail and quality of construction is exceptional for the price point.</p>

<h3>2. Investment Blazer</h3>
<p>& Other Stories' tailored blazer offers the same sharp silhouette you'd find at luxury fashion houses, but at a fraction of the cost.</p>

<h3>3. Timeless Trench</h3>
<p>Mango's trench coat delivers classic style with modern touches. The fit and finish rival pieces costing three times as much.</p>`
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
    title: "6 Top Color Trends We're Investing in This Summer",
    description: "Summer is the best season to play with color. The warmer months have a tendency to bring brighter fashion choices, even for those who generally gravitate towards neutrals in their wardrobe.",
    imageUrl: "/api/placeholder/400/500",
    articleUrl: "https://www.whowhatwear.com/fashion/trends",
    source: "WHO WHAT WEAR",
    category: "Trends",
    publishedDate: new Date().toISOString(),
    readTime: "8 min read",
    heroImage: "/api/placeholder/800/400",
    content: `<p>Summer is the best season to play with color. The warmer months have a tendency to bring brighter fashion choices, even for those who generally gravitate towards neutrals in their wardrobe. The top global color trends play with many themes we have seen across the spring/summer 2025 runways.</p>

<p>Pastels continue to rule. We saw a continuation of the <a href="#" class="text-blue-600 underline">butter yellow</a> trend at Proenza Schouler, Prada, and Loewe, while <a href="#" class="text-blue-600 underline">ballet pink</a> won us over at Chanel, Khaite, and Victoria Beckham, by way of dreamy light-as-air dresses and separates that are ideal for battling a summer heatwave, to wear to <a href="#" class="text-blue-600 underline">work</a> or on an upcoming <a href="#" class="text-blue-600 underline">vacation</a>.</p>

<div class="product-showcase">PRODUCTS_SHOWCASE_1</div>

<p><a href="#" class="text-blue-600 underline">Butter yellow</a> continues to make us melt. Take this softer shade for a spin at the office, with a cream vest and full skirt, or a slinky slip dress for a night out. <a href="#" class="text-blue-600 underline">Woven ballet flats</a> and a structured bag are easy ways to test drive the trend with a subtle pop, should you prefer not to go head-to-toe monochrome.</p>

<h2>1. Butter Yellow</h2>
<p>This soft, creamy shade of yellow has been everywhere this season. From flowing dresses to tailored blazers, butter yellow brings warmth and sophistication to any wardrobe. We've seen it styled beautifully at luxury brands and it's now trickling down to accessible fashion.</p>

<p>The key to wearing butter yellow is to treat it as you would a neutral. It pairs beautifully with white, cream, and even bold colors like navy or forest green for a more adventurous look.</p>

<h2>2. Ballet Pink</h2>
<p>Soft, romantic ballet pink continues to dominate the fashion landscape. This delicate shade works beautifully in flowing fabrics like chiffon and silk, creating an ethereal, feminine aesthetic that's perfect for both day and evening wear.</p>

<p>Style ballet pink with crisp whites for a fresh, modern look, or layer different shades of pink together for a tonal approach that feels sophisticated and current.</p>`,
    embeddedProducts: [
      {
        id: "victoria-vest-1",
        name: "Victoria Beckham Vest",
        brand: "Victoria Beckham",
        price: "£450",
        imageUrl: "/api/placeholder/200/250",
        sourceUrl: "https://www.victoriabeckham.com",
        shopAtText: "SHOP AT VICTORIA BECKHAM"
      },
      {
        id: "rae-sophie-skirt-1", 
        name: "Rae Sophie Adam Skirt",
        brand: "Rae Sophie",
        price: "£245",
        imageUrl: "/api/placeholder/200/250",
        sourceUrl: "https://www.raesophie.com",
        shopAtText: "SHOP AT RAE SOPHIE"
      },
      {
        id: "black-suede-flats-1",
        name: "Black Suede Walla-Wee Flats",
        brand: "Black Suede Studio",
        price: "£185",
        imageUrl: "/api/placeholder/200/250", 
        sourceUrl: "https://www.blacksudestudio.com",
        shopAtText: "SHOP AT BLACK SUEDE"
      }
    ]
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

  static async getArticleById(articleId: string): Promise<FashionArticle | null> {
    try {
      console.log("FashionNewsService: Getting article by ID", articleId);
      
      // Find article in curated articles
      const article = curatedArticles.find(article => article.id === articleId);
      
      if (!article) {
        console.log("FashionNewsService: Article not found", articleId);
        return null;
      }

      console.log("FashionNewsService: Found article", article.title);
      return article;
    } catch (error) {
      console.error("Error fetching article by ID:", error);
      return null;
    }
  }
} 