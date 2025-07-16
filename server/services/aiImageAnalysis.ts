import OpenAI from 'openai';

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

// Google Vision API endpoint
const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export interface ImageAnalysisResult {
  category: string;
  name: string;
  description: string;
  brand?: string;
  estimatedPrice?: number;
  currency?: string;
  colors: string[];
  tags: string[];
  confidence: number;
  similarItems?: {
    name: string;
    brand?: string;
    price?: number;
    imageUrl?: string;
    sourceUrl?: string;
  }[];
}

export interface GoogleVisionLabel {
  description: string;
  score: number;
  topicality: number;
}

export interface GoogleVisionResponse {
  responses: [{
    labelAnnotations: GoogleVisionLabel[];
    textAnnotations?: Array<{
      description: string;
      locale?: string;
    }>;
  }];
}

export class AIImageAnalysisService {
  /**
   * Analyze an image using Google Vision API for object detection and OpenAI for fashion analysis
   */
  async analyzeImage(imageBase64: string): Promise<ImageAnalysisResult> {
    try {
      // Step 1: Use Google Vision API for basic object detection
      const visionLabels = await this.analyzeWithGoogleVision(imageBase64);
      
      // Step 2: Use OpenAI for detailed fashion analysis
      const fashionAnalysis = await this.analyzeWithOpenAI(imageBase64, visionLabels);
      
      return fashionAnalysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image');
    }
  }

  /**
   * Use Google Vision API for object detection and labeling
   */
  private async analyzeWithGoogleVision(imageBase64: string): Promise<GoogleVisionLabel[]> {
    if (!process.env.GOOGLE_VISION_API_KEY) {
      throw new Error('Google Vision API key not configured');
    }

    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 20,
            },
            {
              type: 'TEXT_DETECTION',
              maxResults: 10,
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GOOGLE_VISION_API_URL}?key=${process.env.GOOGLE_VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const data: GoogleVisionResponse = await response.json();
    return data.responses[0]?.labelAnnotations || [];
  }

  /**
   * Use OpenAI for detailed fashion analysis
   */
  private async analyzeWithOpenAI(imageBase64: string, visionLabels: GoogleVisionLabel[]): Promise<ImageAnalysisResult> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const labelsText = visionLabels.map(label => `${label.description} (${Math.round(label.score * 100)}%)`).join(', ');

    const prompt = `You are a fashion expert analyzing a clothing or accessory item. Based on the image and these detected labels: ${labelsText}

Please provide a detailed analysis in the following JSON format:
{
  "category": "clothing category (e.g., 'tops', 'bottoms', 'dresses', 'shoes', 'accessories')",
  "name": "specific item name (e.g., 'Black Leather Ankle Boots', 'Floral Midi Dress')",
  "description": "detailed description of the item including style, fit, and notable features",
  "brand": "estimated brand if recognizable, otherwise null",
  "estimatedPrice": "estimated price in USD, or null if unclear",
  "currency": "USD",
  "colors": ["primary color", "secondary color"],
  "tags": ["style keywords like 'casual', 'formal', 'vintage', 'minimalist', etc."],
  "confidence": "confidence score from 0.0 to 1.0 for the analysis",
  "similarItems": [
    {
      "name": "similar item name",
      "brand": "brand if known",
      "price": "estimated price",
      "description": "brief description"
    }
  ]
}

Focus on accuracy and be specific about fashion terminology. If you can't determine something with confidence, use null or indicate uncertainty.`;

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in OpenAI response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure required fields
      return {
        category: analysis.category || 'unknown',
        name: analysis.name || 'Unknown Item',
        description: analysis.description || 'Fashion item detected in image',
        brand: analysis.brand || undefined,
        estimatedPrice: analysis.estimatedPrice || undefined,
        currency: analysis.currency || 'USD',
        colors: Array.isArray(analysis.colors) ? analysis.colors : [],
        tags: Array.isArray(analysis.tags) ? analysis.tags : [],
        confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.7,
        similarItems: Array.isArray(analysis.similarItems) ? analysis.similarItems : [],
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response:', content);
      
      // Fallback analysis based on vision labels
      return this.createFallbackAnalysis(visionLabels);
    }
  }

  /**
   * Create a fallback analysis when OpenAI parsing fails
   */
  private createFallbackAnalysis(visionLabels: GoogleVisionLabel[]): ImageAnalysisResult {
    const topLabels = visionLabels.slice(0, 5);
    const fashionKeywords = ['clothing', 'fashion', 'dress', 'shirt', 'pants', 'shoes', 'accessory', 'bag', 'jewelry'];
    
    const fashionLabels = topLabels.filter(label => 
      fashionKeywords.some(keyword => label.description.toLowerCase().includes(keyword))
    );

    const primaryLabel = fashionLabels[0] || topLabels[0];
    
    return {
      category: this.categorizeFromLabels(topLabels),
      name: primaryLabel ? `${primaryLabel.description} Item` : 'Fashion Item',
      description: `Fashion item detected with labels: ${topLabels.map(l => l.description).join(', ')}`,
      colors: this.extractColorsFromLabels(topLabels),
      tags: topLabels.map(l => l.description.toLowerCase()),
      confidence: primaryLabel ? primaryLabel.score : 0.5,
      currency: 'USD',
      similarItems: [],
    };
  }

  /**
   * Categorize item based on detected labels
   */
  private categorizeFromLabels(labels: GoogleVisionLabel[]): string {
    const labelTexts = labels.map(l => l.description.toLowerCase());
    
    if (labelTexts.some(text => ['dress', 'gown', 'frock'].includes(text))) return 'dresses';
    if (labelTexts.some(text => ['shirt', 'blouse', 'top', 'sweater', 'hoodie'].includes(text))) return 'tops';
    if (labelTexts.some(text => ['pants', 'jeans', 'trousers', 'shorts', 'skirt'].includes(text))) return 'bottoms';
    if (labelTexts.some(text => ['shoes', 'boots', 'sneakers', 'sandals'].includes(text))) return 'shoes';
    if (labelTexts.some(text => ['bag', 'purse', 'backpack', 'handbag'].includes(text))) return 'accessories';
    if (labelTexts.some(text => ['jewelry', 'necklace', 'earrings', 'bracelet', 'ring'].includes(text))) return 'accessories';
    
    return 'unknown';
  }

  /**
   * Extract color information from labels
   */
  private extractColorsFromLabels(labels: GoogleVisionLabel[]): string[] {
    const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'gray', 'orange'];
    const detectedColors: string[] = [];
    
    labels.forEach(label => {
      const text = label.description.toLowerCase();
      colors.forEach(color => {
        if (text.includes(color) && !detectedColors.includes(color)) {
          detectedColors.push(color);
        }
      });
    });
    
    return detectedColors;
  }

  /**
   * Generate similar items based on analysis
   */
  async generateSimilarItems(analysis: ImageAnalysisResult): Promise<ImageAnalysisResult['similarItems']> {
    try {
      const prompt = `Based on this fashion item analysis:
Category: ${analysis.category}
Name: ${analysis.name}
Description: ${analysis.description}
Colors: ${analysis.colors.join(', ')}
Tags: ${analysis.tags.join(', ')}

Generate 3-5 similar fashion items that a user might be interested in. Return as JSON array:
[
  {
    "name": "item name",
    "brand": "brand name or null",
    "price": "estimated price in USD or null",
    "description": "brief description"
  }
]

Focus on items that are similar in style, category, or aesthetic.`;

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating similar items:', error);
      return [];
    }
  }
}

export const aiImageAnalysisService = new AIImageAnalysisService(); 