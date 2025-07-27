import OpenAI from "openai";
import axios from "axios";
import * as cheerio from "cheerio";
import { realTimeSearchService } from "./realTimeSearchService";

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
  lastChecked?: string;
  confidence?: string;
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
    try {
      console.log(`Searching for retailers with real-time web search...`);
      
      // Use real-time search service to find real retailers
      const realListings = await realTimeSearchService.findRealRetailers(
        item.name,
        item.brand || '',
        item.category,
        item.sourceUrl
      );
      
      // Convert real-time listings to our RetailerResult format
      const retailers: RetailerResult[] = realListings.map((listing: any) => ({
        id: listing.retailerName.toLowerCase().replace(/\s+/g, '-'),
        name: listing.retailerName,
        originalPrice: listing.price,
        currency: listing.currency || "USD",
        availability: listing.inStock ? "in_stock" : "sold_out",
        sizes: listing.sizes || [],
        url: listing.url,
        shipping: listing.shipping || "Check retailer for details",
        note: listing.isDirectListing 
          ? "Direct product link" 
          : "Search result - find exact product",
        lastChecked: listing.lastChecked,
        confidence: listing.isDirectListing ? "high" : "medium"
      }));
      
      // If we have the original source URL, add it as the first retailer
      if (item.sourceUrl && item.sourceUrl.trim()) {
        const sourceRetailer = this.createSourceRetailer(item);
        return [sourceRetailer, ...retailers];
      }
      
      return retailers.length > 0 ? retailers : this.getEnhancedFallbackRetailers(item);
      
    } catch (error) {
      console.error("Error in searchRetailers:", error);
      return this.getEnhancedFallbackRetailers(item);
    }
  }

  private createSourceRetailer(item: any): RetailerResult {
    try {
      const url = new URL(item.sourceUrl);
      const domain = url.hostname.replace('www.', '');
      const domainToName: { [key: string]: string } = {
        'zara.com': 'ZARA',
        'hm.com': 'H&M',
        'cos.com': 'COS',
        'arket.com': 'ARKET',
        'net-a-porter.com': 'NET-A-PORTER',
        'mr-porter.com': 'MR PORTER',
        'ssense.com': 'SSENSE',
        'farfetch.com': 'FARFETCH',
        'matchesfashion.com': 'MATCHES FASHION',
        'mytheresa.com': 'MYTHERESA',
        'nordstrom.com': 'NORDSTROM',
        'saksfifthavenue.com': 'SAKS FIFTH AVENUE',
        'selfridges.com': 'SELFRIDGES',
        'revolve.com': 'REVOLVE',
        'shopbop.com': 'SHOPBOP',
        'endclothing.com': 'END. CLOTHING',
        '24s.com': '24S',
        'luisaviaroma.com': 'LUISAVIAROMA',
        'brownsfashion.com': 'BROWNS',
        'vestiairecollective.com': 'VESTIAIRE COLLECTIVE',
        'theoutnet.com': 'THE OUTNET',
        'maison-alaia.com': 'ALAÏA',
        'therow.com': 'THE ROW',
        'ganni.com': 'GANNI',
        'acnestudios.com': 'ACNE STUDIOS'
      };
      
      return {
        id: "original-retailer",
        name: domainToName[domain] || domain.split('.')[0].toUpperCase(),
        originalPrice: item.price,
        currency: item.currency || "USD",
        availability: "in_stock" as const,
        sizes: ["XS", "S", "M", "L"],
        url: item.sourceUrl,
        shipping: "Check retailer for details",
        note: "Original retailer - direct link",
        region: "Global",
        confidence: "high" as any
      };
    } catch (e) {
      return this.getEnhancedFallbackRetailers(item)[0];
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
        availability: "in_stock" as const,
        sizes: ["XS", "S", "M", "L"],
        url: `https://www.farfetch.com/shopping/search/items.aspx?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping over $200",
        note: "Search results page - find exact product",
        region: "Global"
      },
      {
        id: "net-a-porter",
        name: "NET-A-PORTER",
        originalPrice: Math.round(basePrice * (1 + priceVariation * 1.2)),
        currency: "USD",
        availability: "low_stock" as const,
        sizes: ["S", "M", "L"],
        url: `https://www.net-a-porter.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping",
        note: "Search results page - find exact product",
        region: "US"
      },
      {
        id: "ssense",
        name: "SSENSE",
        originalPrice: Math.round(basePrice * (1 - priceVariation * 0.5)),
        currency: "USD",
        availability: "in_stock" as const,
        sizes: ["XS", "S", "M", "L", "XL"],
        url: `https://www.ssense.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping over $100",
        note: "Search results page - find exact product",
        region: "Global"
      },
      {
        id: "mytheresa",
        name: "MYTHERESA",
        originalPrice: Math.round(basePrice * (1 + priceVariation * 0.8)),
        currency: "USD",
        availability: "in_stock" as const,
        sizes: ["XS", "S", "M", "L"],
        url: `https://www.mytheresa.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping",
        note: "Search results page - find exact product",
        region: "Global"
      },
      {
        id: "matches",
        name: "MATCHES FASHION",
        originalPrice: Math.round(basePrice * (1 + priceVariation * 1.1)),
        currency: "USD",
        availability: "low_stock" as const,
        sizes: ["S", "M", "L", "XL"],
        url: `https://www.matchesfashion.com/us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping over $200",
        note: "Search results page - find exact product",
        region: "Global",
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
      
      // Search for retailers using enhanced AI search
      let retailers = await this.searchRetailers(primaryQuery, item);
      
      // Enhance with regional pricing
      retailers = await this.enhanceWithRegionalPricing(retailers, region);
      
      // Sort by confidence and availability
      retailers.sort((a: any, b: any) => {
        // Prioritize high confidence results
        if (a.confidence !== b.confidence) {
          return a.confidence === 'high' ? -1 : 1;
        }
        
        const availabilityOrder: Record<string, number> = { 'in_stock': 0, 'low_stock': 1, 'sold_out': 2, 'limited_region': 3 };
        const aOrder = availabilityOrder[a.availability] || 4;
        const bOrder = availabilityOrder[b.availability] || 4;
        
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        const aPrice = a.salePrice || a.originalPrice || 999999;
        const bPrice = b.salePrice || b.originalPrice || 999999;
        return aPrice - bPrice;
      });

      // Determine overall confidence based on results
      const hasDirectLinks = retailers.some((r: any) => r.confidence === 'high' || r.note?.includes('direct'));
      const confidence = hasDirectLinks ? 0.9 : 0.5;

      return {
        retailers: retailers.slice(0, 6), // Return top 6 results
        metadata: {
          searchQuery: primaryQuery,
          confidence: confidence,
          totalFound: retailers.length,
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error("Error in product search:", error);
      
      // Return enhanced fallback data
      const fallbackRetailers = this.getEnhancedFallbackRetailers(item);
      return {
        retailers: await this.enhanceWithRegionalPricing(fallbackRetailers, region),
        metadata: {
          searchQuery: `${item.brand} ${item.name}`,
          confidence: 0.3,
          totalFound: fallbackRetailers.length,
          lastUpdated: new Date().toISOString()
        }
      };
    }
  }

  private getEnhancedFallbackRetailers(item: any): RetailerResult[] {
    const basePrice = item.price || 200;
    const priceVariation = 0.15; // Smaller variation when we have original source
    
    // Create search query
    const searchQuery = `${item.brand || ''} ${item.name || ''}`.trim();
    
    // If we have a source URL, extract the retailer info
    let sourceRetailer = null;
    if (item.sourceUrl) {
      try {
        const url = new URL(item.sourceUrl);
        const domain = url.hostname.replace('www.', '');
        const domainToName: { [key: string]: string } = {
          'zara.com': 'ZARA',
          'hm.com': 'H&M',
          'cos.com': 'COS',
          'arket.com': 'ARKET',
          'net-a-porter.com': 'NET-A-PORTER',
          'mr-porter.com': 'MR PORTER',
          'ssense.com': 'SSENSE',
          'farfetch.com': 'FARFETCH',
          'matchesfashion.com': 'MATCHES FASHION',
          'mytheresa.com': 'MYTHERESA',
          'nordstrom.com': 'NORDSTROM',
          'saksfifthavenue.com': 'SAKS FIFTH AVENUE',
          'selfridges.com': 'SELFRIDGES',
          'revolve.com': 'REVOLVE',
          'shopbop.com': 'SHOPBOP',
          'endclothing.com': 'END. CLOTHING',
          '24s.com': '24S',
          'luisaviaroma.com': 'LUISAVIAROMA',
          'brownsfashion.com': 'BROWNS',
          'vestiairecollective.com': 'VESTIAIRE COLLECTIVE',
          'theoutnet.com': 'THE OUTNET'
        };
        
        sourceRetailer = {
          id: "original-retailer",
          name: domainToName[domain] || domain.split('.')[0].toUpperCase(),
          originalPrice: basePrice,
          currency: item.currency || "USD",
          availability: "in_stock" as const,
          sizes: ["XS", "S", "M", "L"],
          url: item.sourceUrl,
          shipping: "Check retailer for details",
          note: "Original retailer - direct link",
          region: "Global",
          confidence: "high" as any
        };
      } catch (e) {
        // Invalid URL, ignore
      }
    }
    
    const retailers = [
      {
        id: "farfetch-search",
        name: "FARFETCH",
        originalPrice: Math.round(basePrice * (1 + priceVariation * 0.8)),
        currency: "USD",
        availability: "in_stock" as const,
        sizes: ["XS", "S", "M", "L"],
        url: `https://www.farfetch.com/shopping/search/items.aspx?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping over $200",
        note: "Search results - click to find exact product",
        region: "Global"
      },
      {
        id: "net-a-porter-search",
        name: "NET-A-PORTER",
        originalPrice: Math.round(basePrice * (1 + priceVariation)),
        currency: "USD",
        availability: "in_stock" as const,
        sizes: ["S", "M", "L"],
        url: `https://www.net-a-porter.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping",
        note: "Search results - click to find exact product",
        region: "US"
      },
      {
        id: "ssense-search",
        name: "SSENSE",
        originalPrice: Math.round(basePrice * (1 - priceVariation * 0.3)),
        currency: "USD",
        availability: "in_stock" as const,
        sizes: ["XS", "S", "M", "L", "XL"],
        url: `https://www.ssense.com/en-us/search?q=${encodeURIComponent(searchQuery)}`,
        shipping: "Free shipping over $100",
        note: "Search results - click to find exact product",
        region: "Global"
      }
    ];
    
    // Add source retailer first if available
    if (sourceRetailer) {
      return [sourceRetailer, ...retailers];
    }
    
    return retailers;
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

  async scrapeProductFromUrl(url: string): Promise<any> {
    try {
      console.log(`Fetching content from URL: ${url}`);
      
      // Fetch the webpage content
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
      });
      
      const html = response.data;
      const $ = cheerio.load(html);
      
      // Extract metadata and structured data
      const pageTitle = $('title').text() || '';
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const ogTitle = $('meta[property="og:title"]').attr('content') || '';
      const ogDescription = $('meta[property="og:description"]').attr('content') || '';
      const ogImage = $('meta[property="og:image"]').attr('content') || '';
      const ogPrice = $('meta[property="product:price:amount"]').attr('content') || '';
      const ogCurrency = $('meta[property="product:price:currency"]').attr('content') || 'USD';
      const ogBrand = $('meta[property="product:brand"]').attr('content') || '';
      
      // Try to find price in common locations
      let priceText = ogPrice;
      if (!priceText) {
        const priceSelectors = [
          '.price', '.product-price', '.current-price', '.sale-price',
          '[itemprop="price"]', '[data-price]', '.price-now', '.product-price-value',
          '.price-sales', '.product-price-sale', '.price--highlight',
          '.ProductMeta__Price', '.price__current', '.price_color',
          '.product-single__price', '.product__price', '.money',
          'span[data-product-price]', '.product-form__price'
        ];
        for (const selector of priceSelectors) {
          const element = $(selector).first();
          if (element.length) {
            priceText = element.text().trim();
            break;
          }
        }
      }
      
      // Try to find product name
      let productName = ogTitle || pageTitle;
      const nameSelectors = [
        'h1', '.product-name', '.product-title', '[itemprop="name"]',
        '.product-detail-info__product-name', '.product-heading',
        '.product__title', '.product-single__title', 'h1.product-title',
        '.pdp-name', '.product-info__title', '.product-details__title'
      ];
      for (const selector of nameSelectors) {
        const element = $(selector).first();
        if (element.length) {
          const text = element.text().trim();
          if (text && text.length < 200) {
            productName = text;
            break;
          }
        }
      }
      
      // Try to find brand
      let brandText = ogBrand;
      if (!brandText) {
        const brandSelectors = [
          '.brand', '.product-brand', '[itemprop="brand"]',
          '.designer-name', '.product__vendor', '.brand-name',
          'a[href*="/brand/"]', 'a[href*="/designer/"]'
        ];
        for (const selector of brandSelectors) {
          const element = $(selector).first();
          if (element.length) {
            brandText = element.text().trim();
            break;
          }
        }
      }
      
      // Try to find product images
      let imageUrl = ogImage;
      if (!imageUrl) {
        const imageSelectors = [
          'img.product-image', 'img.product-photo', '[itemprop="image"]',
          '.product__media img', '.product-single__photo img',
          '.product-image-main img', '.pdp-image img', '.product-gallery img'
        ];
        for (const selector of imageSelectors) {
          const element = $(selector).first();
          if (element.length) {
            imageUrl = element.attr('src') || element.attr('data-src') || '';
            if (imageUrl) break;
          }
        }
      }
      
      // Extract text content for AI analysis
      const textContent = $('body').text()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 4000); // Limit text for token efficiency
      
      // Helper function to ensure absolute URL
      const makeAbsoluteUrl = (relativeUrl: string): string => {
        if (!relativeUrl || relativeUrl.startsWith('http')) {
          return relativeUrl;
        }
        try {
          const urlObj = new URL(url);
          return new URL(relativeUrl, urlObj.origin).href;
        } catch {
          return relativeUrl;
        }
      };
      
      // Ensure image URL is absolute
      if (imageUrl) {
        imageUrl = makeAbsoluteUrl(imageUrl);
      }
      
      // If we have an OpenAI API key, use it to extract structured data
      try {
        const client = getOpenAIClient();
        
        const prompt = `Extract product information from this webpage content. 
        
        Page Title: ${pageTitle}
        Meta Description: ${metaDescription}
        OG Title: ${ogTitle}
        OG Description: ${ogDescription}
        Found Price: ${priceText}
        Found Brand: ${brandText}
        Found Image: ${imageUrl}
        
        Body Text Sample: ${textContent}
        
        URL: ${url}
        
        Extract and return JSON with these fields:
        {
          "name": "exact product name",
          "brand": "brand name",
          "price": "current price as string (e.g. '$99.99')",
          "originalPrice": "original price if on sale",
          "description": "brief product description",
          "category": "clothing/shoes/accessories/jewelry/bags",
          "imageUrl": "main product image URL",
          "color": "product color",
          "sizes": ["available sizes if found"],
          "material": "material/fabric if mentioned"
        }`;
        
        const aiResponse = await client.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are a product data extractor. Extract accurate product information from webpage content. Return valid JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 800,
        });
        
        const content = aiResponse.choices[0]?.message?.content;
        if (content) {
          const productData = JSON.parse(content);
          
          // Ensure we have absolute image URLs
          if (productData.imageUrl && !productData.imageUrl.startsWith('http')) {
            const urlObj = new URL(url);
            productData.imageUrl = new URL(productData.imageUrl, urlObj.origin).href;
          }
          
          // Add source URL and ID
          productData.sourceUrl = url;
          productData.id = url.split('/').pop()?.split('?')[0] || Date.now().toString();
          
          console.log('Successfully extracted product data:', productData.name);
          return productData;
        }
      } catch (aiError) {
        console.log('AI extraction failed, using fallback method:', aiError);
      }
      
      // Fallback extraction without AI
      const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
      
      const fallbackData = {
        id: url.split('/').pop()?.split('?')[0] || Date.now().toString(),
        name: productName || `Product from ${domain}`,
        brand: brandText || domain.charAt(0).toUpperCase() + domain.slice(1),
        price: priceText || "$0.00",
        description: ogDescription || metaDescription || "Product details",
        category: "clothing",
        imageUrl: imageUrl || "/api/placeholder/400/600",
        sourceUrl: url,
        sizes: [],
      };
      
      console.log('Using fallback extraction for:', fallbackData.name);
      return fallbackData;
      
    } catch (error) {
      console.error("Error scraping product from URL:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Product page not found");
        } else if (error.code === 'ECONNABORTED') {
          throw new Error("Request timeout - page took too long to load");
        }
      }
      
      throw new Error("Failed to fetch product information from URL");
    }
  }
}

export const productSearchService = new ProductSearchService(); 