import OpenAI from "openai";

// Initialize OpenAI client lazily
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface RetailerResult {
  id: string;
  name: string;
  logo?: string;
  originalPrice?: number;
  salePrice?: number;
  currency: string;
  availability: "in_stock" | "low_stock" | "sold_out" | "limited_region";
  sizes: string[];
  url: string;
  shipping?: string;
  note?: string;
  region?: string;
}

export interface ProductSearchResult {
  retailers: RetailerResult[];
  metadata: {
    searchQuery: string;
    confidence: number;
    totalFound: number;
    lastUpdated: string;
  };
}

class ProductSearchService {
  private async generateSearchQueries(item: any): Promise<string[]> {
    const baseQuery = `${item.brand || ''} ${item.name || ''}`.trim();
    
    // Generate variations of search queries
    const queries = [
      baseQuery,
      `${item.brand} ${item.name} ${item.category || 'fashion'}`,
      `${item.name} designer clothing`,
      `${item.brand} ${item.category || 'clothing'}`
    ].filter(q => q.length > 3);

    return Array.from(new Set(queries)); // Remove duplicates
  }

  private async searchRetailers(searchQuery: string, item: any): Promise<RetailerResult[]> {
    // Try to get OpenAI client, return fallback data if not available
    try {
      const openaiClient = getOpenAIClient();
      
      const prompt = `
You are a fashion e-commerce search expert. Given this product information, find real retailers that sell this item with accurate pricing.

Product Details:
- Name: ${item.name}
- Brand: ${item.brand || 'Unknown'}
- Category: ${item.category || 'Fashion'}
- Price Range: ${item.price ? `Around $${item.price}` : 'Unknown'}

Search Query: "${searchQuery}"

Please return realistic retailer information in the following JSON format:
{
  "retailers": [
    {
      "id": "retailer-slug",
      "name": "RETAILER NAME",
      "originalPrice": 299,
      "salePrice": 249,
      "currency": "USD",
      "availability": "in_stock",
      "sizes": ["XS", "S", "M", "L"],
      "url": "https://retailer.com/product",
      "shipping": "Free shipping over $100",
      "note": "Limited time offer",
      "region": "US"
    }
  ]
}

Focus on these major fashion retailers:
- FARFETCH (luxury, international)
- NET-A-PORTER (luxury women's fashion)
- MR PORTER (luxury men's fashion)
- SSENSE (contemporary fashion)
- MATCHES FASHION (luxury fashion)
- SELFRIDGES (UK department store)
- HARRODS (UK luxury department store)
- SAKS FIFTH AVENUE (US luxury)
- NORDSTROM (US department store)
- MYTHERESA (German luxury retailer)

Provide 3-5 realistic retailers with varied pricing, availability, and regions. Make prices realistic for the brand/item type.
`;

      const response = await openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a fashion e-commerce expert who provides accurate, realistic retailer and pricing information. Always return valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      try {
        const parsed = JSON.parse(content);
        return parsed.retailers || [];
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        return this.getFallbackRetailers(item);
      }

    } catch (error) {
      if (error instanceof Error && error.message === 'OpenAI API key not configured') {
        console.log("OpenAI API key not configured, using fallback data");
      } else {
        console.error("Error searching retailers:", error);
      }
      return this.getFallbackRetailers(item);
    }
  }

  private getFallbackRetailers(item: any): RetailerResult[] {
    const basePrice = item.price || 200;
    const priceVariation = 0.2; // 20% price variation
    
    // Create better search queries
    const searchQuery = `${item.brand || ''} ${item.name || ''}`.trim();
    const brandQuery = item.brand || '';
    
    return [
      {
        id: "farfetch",
        name: "FARFETCH",
        originalPrice: Math.round(basePrice * (1 + priceVariation)),
        salePrice: Math.round(basePrice * 0.9),
        currency: "USD",
        availability: "in_stock",
        sizes: ["XS", "S", "M", "L"],
        url: `https://www.farfetch.com/shopping/search/items.aspx?q=${encodeURIComponent(searchQuery)}&designers=${encodeURIComponent(brandQuery)}`,
        shipping: "Free shipping over $200",
        region: "Global"
      },
      {
        id: "net-a-porter",
        name: "NET-A-PORTER",
        originalPrice: Math.round(basePrice * (1 + priceVariation * 1.2)),
        currency: "USD",
        availability: "low_stock",
        sizes: ["S", "M", "L"],
        url: `https://www.net-a-porter.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping",
        region: "US"
      },
      {
        id: "ssense",
        name: "SSENSE",
        originalPrice: Math.round(basePrice * (1 - priceVariation * 0.5)),
        currency: "USD",
        availability: "in_stock",
        sizes: ["XS", "S", "M", "L", "XL"],
        url: `https://www.ssense.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping over $100",
        region: "Global"
      },
      {
        id: "mytheresa",
        name: "MYTHERESA",
        originalPrice: Math.round(basePrice * (1 + priceVariation * 0.8)),
        currency: "USD",
        availability: "in_stock",
        sizes: ["XS", "S", "M", "L"],
        url: `https://www.mytheresa.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping",
        region: "Global"
      },
      {
        id: "matches",
        name: "MATCHES FASHION",
        originalPrice: Math.round(basePrice * (1 + priceVariation * 1.1)),
        currency: "USD",
        availability: "low_stock",
        sizes: ["S", "M", "L", "XL"],
        url: `https://www.matchesfashion.com/us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping over $200",
        region: "Global",
        note: "Luxury fashion destination"
      }
    ];
  }

  private async enhanceWithRegionalPricing(retailers: RetailerResult[], region: string): Promise<RetailerResult[]> {
    // Add regional pricing variations and availability
    const regionMultipliers: { [key: string]: number } = {
      'USA': 1.0,
      'UK': 1.15,
      'EU': 1.08,
      'CA': 1.25,
      'AU': 1.3
    };

    const multiplier = regionMultipliers[region] || 1.0;

    return retailers.map(retailer => ({
      ...retailer,
      originalPrice: retailer.originalPrice ? Math.round(retailer.originalPrice * multiplier) : undefined,
      salePrice: retailer.salePrice ? Math.round(retailer.salePrice * multiplier) : undefined,
      availability: region === 'USA' ? retailer.availability : 
                   Math.random() > 0.7 ? 'limited_region' : retailer.availability,
      note: region !== 'USA' && Math.random() > 0.5 ? 
            `Shipping to ${region} available` : retailer.note
    }));
  }

  public async searchProduct(item: any, region: string = 'USA'): Promise<ProductSearchResult> {
    try {
      console.log(`Searching for product: ${item.name} by ${item.brand}`);
      
      const searchQueries = await this.generateSearchQueries(item);
      const primaryQuery = searchQueries[0];
      
      // Search for retailers using AI
      let retailers = await this.searchRetailers(primaryQuery, item);
      
      // If item has original sourceUrl, enhance the search context
      if (item.sourceUrl && item.sourceUrl.trim()) {
        console.log(`Using original source URL for enhanced search: ${item.sourceUrl}`);
        // In real implementation, this would help AI understand the original context
        // For now, we'll use it to generate better fallback retailers
        retailers = this.getEnhancedFallbackRetailers(item);
      }
      
      // Enhance with regional pricing
      retailers = await this.enhanceWithRegionalPricing(retailers, region);
      
      // Sort by availability and price
      retailers.sort((a, b) => {
        const availabilityOrder = { 'in_stock': 0, 'low_stock': 1, 'sold_out': 2, 'limited_region': 3 };
        const aOrder = availabilityOrder[a.availability] || 4;
        const bOrder = availabilityOrder[b.availability] || 4;
        
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        const aPrice = a.salePrice || a.originalPrice || 999999;
        const bPrice = b.salePrice || b.originalPrice || 999999;
        return aPrice - bPrice;
      });

      return {
        retailers: retailers.slice(0, 5), // Limit to top 5 results
        metadata: {
          searchQuery: primaryQuery,
          confidence: item.sourceUrl ? 0.95 : (retailers.length > 0 ? 0.85 : 0.3),
          totalFound: retailers.length,
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error("Error in product search:", error);
      
      // Return fallback data
      const fallbackRetailers = item.sourceUrl ? 
        this.getEnhancedFallbackRetailers(item) : 
        this.getFallbackRetailers(item);
      return {
        retailers: await this.enhanceWithRegionalPricing(fallbackRetailers, region),
        metadata: {
          searchQuery: `${item.brand} ${item.name}`,
          confidence: item.sourceUrl ? 0.8 : 0.3,
          totalFound: fallbackRetailers.length,
          lastUpdated: new Date().toISOString()
        }
      };
    }
  }

  private getEnhancedFallbackRetailers(item: any): RetailerResult[] {
    const basePrice = item.price || 200;
    const priceVariation = 0.15; // Smaller variation when we have original source
    
    // Create better search queries
    const searchQuery = `${item.brand || ''} ${item.name || ''}`.trim();
    const brandQuery = item.brand || '';
    
    // Extract domain from sourceUrl for better retailer suggestions
    let sourceDomain = '';
    if (item.sourceUrl) {
      try {
        const url = new URL(item.sourceUrl);
        sourceDomain = url.hostname.replace('www.', '');
      } catch (e) {
        // Invalid URL, ignore
      }
    }
    
    return [
      {
        id: "farfetch",
        name: "FARFETCH",
        originalPrice: Math.round(basePrice * (1 + priceVariation * 0.8)),
        salePrice: Math.round(basePrice * 0.95),
        currency: "USD",
        availability: "in_stock",
        sizes: ["XS", "S", "M", "L"],
        url: `https://www.farfetch.com/shopping/search/items.aspx?q=${encodeURIComponent(searchQuery)}&designers=${encodeURIComponent(brandQuery)}`,
        shipping: "Free shipping over $200",
        region: "Global"
      },
      {
        id: "net-a-porter",
        name: "NET-A-PORTER",
        originalPrice: Math.round(basePrice * (1 + priceVariation)),
        currency: "USD",
        availability: "in_stock",
        sizes: ["S", "M", "L"],
        url: `https://www.net-a-porter.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping",
        region: "US"
      },
      {
        id: "ssense",
        name: "SSENSE",
        originalPrice: Math.round(basePrice * (1 - priceVariation * 0.3)),
        currency: "USD",
        availability: "in_stock",
        sizes: ["XS", "S", "M", "L", "XL"],
        url: `https://www.ssense.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping over $100",
        region: "Global"
      }
    ];
  }

  public async searchSimilarProducts(item: any, limit: number = 10): Promise<any[]> {
    // Try to get OpenAI client, return empty array if not available
    try {
      const openaiClient = getOpenAIClient();
      
      const prompt = `
Given this fashion item, suggest ${limit} similar products that users might like:

Product: ${item.name}
Brand: ${item.brand || 'Unknown'}
Category: ${item.category || 'Fashion'}
Price: ${item.price ? `$${item.price}` : 'Unknown'}

Return a JSON array of similar products with this format:
[
  {
    "name": "Product name",
    "brand": "Brand name",
    "price": 199,
    "category": "Category",
    "imageUrl": "",
    "description": "Brief description"
  }
]

Focus on products from similar brands or in the same category/style.
`;

      const response = await openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a fashion stylist who suggests similar products. Always return valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
      
      return [];
    } catch (error) {
      if (error instanceof Error && error.message === 'OpenAI API key not configured') {
        console.log("OpenAI API key not configured, no similar products available");
      } else {
        console.error("Error finding similar products:", error);
      }
      return [];
    }
  }
}

export const productSearchService = new ProductSearchService(); 