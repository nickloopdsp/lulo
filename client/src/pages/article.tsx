import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmbeddedProductCard from "@/components/embedded-product-card";

interface FashionProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  sourceUrl: string;
  shopAtText: string;
}

interface FashionArticle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  articleUrl: string;
  source: string;
  category: string;
  publishedDate: string;
  readTime: string;
  content?: string;
  heroImage?: string;
  embeddedProducts?: FashionProduct[];
}

export default function ArticlePage() {
  const [, params] = useRoute("/article/:articleId");
  const [, navigate] = useLocation();
  const [article, setArticle] = useState<FashionArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"global" | "trends">("global");

  useEffect(() => {
    if (params?.articleId) {
      fetchArticle(params.articleId);
    }
  }, [params?.articleId]);

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fashion-news/${articleId}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error("Error fetching article:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/newsfeed");
  };

  const renderArticleContent = (content: string, products: FashionProduct[]) => {
    // Split content by product showcase placeholders
    const parts = content.split(/(<div class="product-showcase">PRODUCTS_SHOWCASE_\d+<\/div>)/);
    
    return parts.map((part, index) => {
      if (part.includes('PRODUCTS_SHOWCASE')) {
        // This is a product showcase section
        return (
          <div key={index} className="my-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {products.map((product) => (
                <EmbeddedProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          </div>
        );
      } else {
        // Regular content
        return (
          <div 
            key={index}
            dangerouslySetInnerHTML={{ __html: part }}
          />
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lulo-dark mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-lg text-gray-700 mb-4">Article not found</p>
          <Button onClick={handleBack} className="bg-lulo-dark text-white">
            Back to Newsfeed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 flex-shrink-0">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-0 h-8 w-8"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("global")}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeTab === "global"
                      ? "text-black border-black"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  Global News
                </button>
                <button
                  onClick={() => setActiveTab("trends")}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeTab === "trends"
                      ? "text-black border-black"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  Lulo Trends
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <span className="text-sm">go global</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6">
        {/* Source */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-center tracking-wide">{article.source}</h2>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-black mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Hero Image */}
        {(article.heroImage || article.imageUrl) && (
          <div className="mb-6">
            <img
              src={article.heroImage || article.imageUrl}
              alt={article.title}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-sm max-w-none">
          {article.content ? (
            <div className="text-gray-800 leading-relaxed space-y-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-gray-900 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-gray-900 [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800">
              {renderArticleContent(article.content, article.embeddedProducts || [])}
            </div>
          ) : (
            <div className="text-gray-800 leading-relaxed space-y-4">
              <p>{article.description}</p>
              <p>
                This is where the full article content would appear. The article 
                would include rich formatting, images, and links as shown in the 
                original publication.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Full article content integration would require 
                  API access from fashion publications or web scraping capabilities.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Read More / Source Link */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={() => window.open(article.articleUrl, '_blank')}
            className="w-full bg-lulo-dark text-white"
          >
            Read Full Article on {article.source}
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
}