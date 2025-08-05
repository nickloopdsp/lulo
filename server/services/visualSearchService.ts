import { Request, Response } from 'express';

interface VisualSearchResult {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  retailer: string;
  confidence: number;
  category?: string;
}

// Mock database of products for demo purposes - expanded with more variety
const productDatabase = {
  dresses: [
    {
      id: "vs-1",
      name: "Metallic Pleated Maxi Dress",
      brand: "Reformation",
      price: "$298.00",
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop",
      retailer: "Reformation",
      category: "dress",
      tags: ['metallic', 'gold', 'evening', 'maxi']
    },
    {
      id: "vs-2",
      name: "Satin Slip Dress in Gold",
      brand: "Zara",
      price: "$89.90",
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=600&fit=crop",
      retailer: "Zara",
      category: "dress",
      tags: ['gold', 'satin', 'slip', 'evening']
    },
    {
      id: "vs-3",
      name: "Floral Midi Dress with Ruffles",
      brand: "DÔEN",
      price: "$248.00",
      imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop",
      retailer: "Net-a-Porter",
      category: "dress",
      tags: ['floral', 'summer', 'midi', 'vintage']
    },
    {
      id: "vs-4",
      name: "Black Cocktail Dress",
      brand: "Theory",
      price: "$385.00",
      imageUrl: "https://images.unsplash.com/photo-1566479179817-0ddb5fa87cd9?w=400&h=600&fit=crop",
      retailer: "Nordstrom",
      category: "dress",
      tags: ['black', 'formal', 'cocktail', 'evening']
    },
    {
      id: "vs-15",
      name: "Bohemian Maxi Dress",
      brand: "Free People",
      price: "$168.00",
      imageUrl: "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=400&h=600&fit=crop",
      retailer: "Free People",
      category: "dress",
      tags: ['bohemian', 'maxi', 'summer', 'casual']
    }
  ],
  tops: [
    {
      id: "vs-5",
      name: "White Cotton T-Shirt",
      brand: "Everlane",
      price: "$28.00",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop",
      retailer: "Everlane",
      category: "top",
      tags: ['white', 'casual', 'minimalist', 'cotton']
    },
    {
      id: "vs-6",
      name: "Silk Blouse in Ivory",
      brand: "Equipment",
      price: "$268.00",
      imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=600&fit=crop",
      retailer: "Nordstrom",
      category: "top",
      tags: ['silk', 'formal', 'ivory', 'blouse']
    },
    {
      id: "vs-11",
      name: "Striped Breton Shirt",
      brand: "Saint James",
      price: "$125.00",
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=600&fit=crop",
      retailer: "J.Crew",
      category: "top",
      tags: ['stripes', 'casual', 'nautical', 'blue']
    }
  ],
  bags: [
    {
      id: "vs-7",
      name: "Mini Leather Crossbody",
      brand: "Coach",
      price: "$195.00",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=600&fit=crop",
      retailer: "Coach",
      category: "bag",
      tags: ['leather', 'crossbody', 'mini', 'black']
    },
    {
      id: "vs-8",
      name: "Canvas Tote Bag",
      brand: "Celine",
      price: "$890.00",
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=600&fit=crop",
      retailer: "Celine",
      category: "bag",
      tags: ['tote', 'canvas', 'beige', 'casual']
    },
    {
      id: "vs-12",
      name: "Quilted Chain Bag",
      brand: "Chanel",
      price: "$5,800.00",
      imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=600&fit=crop",
      retailer: "Chanel",
      category: "bag",
      tags: ['quilted', 'chain', 'luxury', 'black']
    }
  ],
  shoes: [
    {
      id: "vs-9",
      name: "Strappy Heeled Sandals",
      brand: "Stuart Weitzman",
      price: "$425.00",
      imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop",
      retailer: "Saks Fifth Avenue",
      category: "shoes",
      tags: ['heels', 'sandals', 'evening', 'gold']
    },
    {
      id: "vs-10",
      name: "White Leather Sneakers",
      brand: "Common Projects",
      price: "$425.00",
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop",
      retailer: "SSENSE",
      category: "shoes",
      tags: ['sneakers', 'white', 'casual', 'minimalist']
    },
    {
      id: "vs-13",
      name: "Ankle Boots in Black",
      brand: "Acne Studios",
      price: "$520.00",
      imageUrl: "https://images.unsplash.com/photo-1591892110704-64aafeef0a78?w=400&h=600&fit=crop",
      retailer: "SSENSE",
      category: "shoes",
      tags: ['boots', 'ankle', 'black', 'leather']
    }
  ]
};

// Simulate image analysis with more sophisticated pattern matching
function analyzeImage(imageData: string): { category: string; colors: string[]; style: string } {
  // In a real implementation, this would use computer vision APIs like Google Vision, AWS Rekognition, etc.
  // For demo, we'll simulate intelligent analysis based on image data patterns
  
  // Analyze image data characteristics
  const dataLength = imageData.length;
  const base64Pattern = imageData.substring(0, 100); // Look at beginning of base64
  
  // Create a more sophisticated hash based on multiple factors
  let hash = 0;
  for (let i = 0; i < Math.min(imageData.length, 1000); i += 10) {
    hash = ((hash << 5) - hash) + imageData.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Simulate sophisticated image analysis
  // In reality, this would analyze actual pixel data, shapes, patterns, etc.
  const analysisScore = Math.abs(hash);
  
  // Detect category with weighted probabilities
  let category = 'dress'; // default
  const categoryScore = analysisScore % 100;
  
  if (categoryScore < 40) {
    category = 'dress'; // 40% chance
  } else if (categoryScore < 65) {
    category = 'top'; // 25% chance
  } else if (categoryScore < 85) {
    category = 'bag'; // 20% chance
  } else {
    category = 'shoes'; // 15% chance
  }
  
  // Detect colors based on "image analysis"
  const colorPatterns = {
    0: ['gold', 'metallic'],
    1: ['black', 'white'],
    2: ['floral', 'pink'],
    3: ['blue', 'denim'],
    4: ['beige', 'neutral'],
    5: ['red', 'burgundy'],
    6: ['green', 'emerald'],
    7: ['silver', 'grey']
  };
  
  const colorIndex = (analysisScore >> 8) % 8;
  const colors = colorPatterns[colorIndex as keyof typeof colorPatterns] || ['neutral', 'beige'];
  
  // Detect style based on "pattern recognition"
  const stylePatterns = {
    0: 'evening',
    1: 'casual',
    2: 'formal',
    3: 'summer',
    4: 'vintage',
    5: 'minimalist',
    6: 'bohemian',
    7: 'streetwear'
  };
  
  const styleIndex = (analysisScore >> 16) % 8;
  const style = stylePatterns[styleIndex as keyof typeof stylePatterns] || 'casual';
  
  console.log(`Image Analysis Results: Category=${category}, Colors=${colors.join(',')}, Style=${style}`);
  
  return { category, colors, style };
}

// Find similar products based on image analysis
function findSimilarProducts(analysis: { category: string; colors: string[]; style: string }): VisualSearchResult[] {
  let results: VisualSearchResult[] = [];
  
  // Get products from the detected category
  const categoryProducts = productDatabase[analysis.category as keyof typeof productDatabase] || productDatabase.dresses;
  
  // Score products based on tag matching
  const scoredProducts = categoryProducts.map((product: any) => {
    let score = 0.7; // Base score for matching category
    
    // Check color matches
    analysis.colors.forEach(color => {
      if (product.tags.some((tag: string) => tag.toLowerCase().includes(color.toLowerCase()))) {
        score += 0.1;
      }
    });
    
    // Check style matches
    if (product.tags.some((tag: string) => tag.toLowerCase() === analysis.style.toLowerCase())) {
      score += 0.15;
    }
    
    // Add some randomness for variety
    score += Math.random() * 0.05;
    
    return {
      ...product,
      confidence: Math.min(score, 0.99) // Cap at 99%
    };
  });
  
  // Sort by confidence and take best matches
  results = scoredProducts.sort((a, b) => b.confidence - a.confidence);
  
  // Add 1-2 products from other categories with lower confidence
  const otherCategories = Object.entries(productDatabase)
    .filter(([cat]) => cat !== analysis.category)
    .flatMap(([cat, products]) => products);
  
  // Find products from other categories that match colors or style
  const crossCategoryMatches = otherCategories
    .map((product: any) => {
      let score = 0.4; // Lower base score for different category
      
      // Bonus for matching colors
      analysis.colors.forEach(color => {
        if (product.tags.some((tag: string) => tag.toLowerCase().includes(color.toLowerCase()))) {
          score += 0.15;
        }
      });
      
      // Bonus for matching style
      if (product.tags.some((tag: string) => tag.toLowerCase() === analysis.style.toLowerCase())) {
        score += 0.1;
      }
      
      return {
        ...product,
        confidence: score
      };
    })
    .filter(p => p.confidence > 0.5)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 2);
  
  // Combine results
  results = [...results, ...crossCategoryMatches];
  
  // Sort by confidence and return top 6
  results.sort((a, b) => b.confidence - a.confidence);
  
  return results.slice(0, 6);
}

export const visualSearchService = {
  async searchByImage(req: Request, res: Response) {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Analyze the image
      const analysis = analyzeImage(image);
      
      console.log('Visual Search Analysis:', analysis);
      
      // Find similar products
      const results = findSimilarProducts(analysis);
      
      res.json({
        success: true,
        analysis: {
          detectedCategory: analysis.category,
          detectedColors: analysis.colors,
          detectedStyle: analysis.style
        },
        results: results.map(r => ({
          id: r.id,
          name: r.name,
          brand: r.brand,
          price: r.price,
          imageUrl: r.imageUrl,
          retailer: r.retailer,
          confidence: r.confidence,
          isLuloItem: r.confidence > 0.8 // High confidence items are marked as Lulo items
        }))
      });
      
    } catch (error) {
      console.error('Visual search error:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  }
};