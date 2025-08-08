import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchOverlay from "@/components/search-overlay";

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
  relevanceScore?: number;
}

interface TrendingItem {
  id: number;
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  wishlistCount: number;
}

interface TrendingWishlist {
  id: string;
  name: string;
  count: number;
  location: string;
}

export default function NewsfeedPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"global" | "trends">("global");
  const [articles, setArticles] = useState<FashionArticle[]>([]);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [trendingWishlists, setTrendingWishlists] = useState<TrendingWishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (activeTab === "global") {
      fetchArticles();
    } else {
      fetchTrendingData();
    }
  }, [activeTab]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fashion-news?region=${activeTab}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Truncate description to approximately 100 words
  const truncateDescription = (text: string, wordLimit: number = 100) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      
      // Fetch trending items
      const itemsResponse = await fetch('/api/trending/items', {
        credentials: 'include',
      });
      
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setTrendingItems(itemsData);
      }
      
      // Fetch trending wishlists
      const wishlistsResponse = await fetch('/api/trending/wishlists', {
        credentials: 'include',
      });
      
      if (wishlistsResponse.ok) {
        const wishlistsData = await wishlistsResponse.json();
        setTrendingWishlists(wishlistsData);
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (itemId: number) => {
    navigate(`/item/${itemId}?src=trends`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="bg-white border-b border-lulo-border sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 pt-4 pb-2">
          <div className="flex items-center justify-center relative">
            <div className="flex space-x-8">
              {["global", "trends"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "global" | "trends")}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "text-[#FADADD] border-b-2 border-[#FADADD]"
                      : "text-gray-500 hover:text-[#FADADD] hover:border-b-2 hover:border-[#FADADD]/50"
                  }`}
                >
                  {tab === "global" ? "Global News" : "Lulo Trends"}
                </button>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSearch(true)} 
              className="absolute right-0 glass-button-lulo rounded-full p-2"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Ad Banner Space */}
        <div className="relative liquid-glass rounded-2xl p-8 text-center overflow-hidden">
          {/* Lulo pattern background */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-16 h-16 rounded-full border-2 border-[#FADADD]/30"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
          
          <h3 className="relative text-lg font-bold text-gray-700 mb-2">AD SPACE/BANNER</h3>
          <div className="relative flex justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-[#FADADD] rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        </div>

        {activeTab === "global" ? (
          /* Articles Feed */
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="liquid-glass rounded-2xl">
                    <div className="p-4">
                      <div className="flex space-x-4">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200/50 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200/50 rounded w-1/2"></div>
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200/50 rounded"></div>
                            <div className="h-3 bg-gray-200/50 rounded"></div>
                            <div className="h-3 bg-gray-200/50 rounded w-3/4"></div>
                          </div>
                        </div>
                        <div className="w-20 h-20 bg-gray-200/50 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              articles.map((article) => (
                <div 
                  key={article.id} 
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => handleArticleClick(article.id)}
                >
                  {/* Liquid Glass Effect Card */}
                  <div className="liquid-glass rounded-2xl group-hover:liquid-glass-hover transition-all duration-300">
                    <div className="p-4">
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          {/* Source Badge with Glass Effect */}
                          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium glass-button text-gray-700 mb-2">
                            {article.source}
                          </div>
                          
                          {/* Article Title */}
                          <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2 text-gray-800 group-hover:text-gray-900 transition-colors">
                            {article.title}
                          </h3>
                          
                          {/* Article Description */}
                          <p className="text-xs text-gray-600 line-clamp-3 group-hover:text-gray-700 transition-colors">
                            {truncateDescription(article.description)}
                          </p>
                          
                          {/* Article Meta */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{article.readTime}</span>
                              <span>•</span>
                              <span>{article.publishedDate}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={`/api/image-proxy?url=${encodeURIComponent(article.imageUrl)}`}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src.includes('/api/image-proxy')) {
                                target.src = article.imageUrl;
                              } else {
                                target.src = `https://via.placeholder.com/200x200/f0f0f0/cccccc?text=${encodeURIComponent(article.source)}`;
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Trending Content */
          <div className="space-y-6 hide-hearts">
            {/* Trending Items */}
            <div>
              <h2 className="text-lg font-semibold">Most Wishlisted Items This Week</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {trendingItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="liquid-glass rounded-2xl group-hover:liquid-glass-hover transition-all duration-300">
                      <div className="p-3">
                        <div className="w-full h-32 rounded-xl overflow-hidden mb-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/200x200/f0f0f0/cccccc?text=${encodeURIComponent(item.brand)}`;
                            }}
                          />
                        </div>
                        <p className="text-sm font-medium truncate mb-1 group-hover:text-gray-900 transition-colors">{item.name}</p>
                        {item.price && <p className="text-sm font-semibold group-hover:text-gray-900 transition-colors">{item.price}</p>}
                        <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{item.brand}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Wishlists */}
            <div>
              <h2 className="text-lg font-semibold">Most Trending Wishlists This Week</h2>
              <div className="mt-4 space-y-3">
                {trendingWishlists.map((wishlist) => (
                  <div 
                    key={wishlist.id} 
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="liquid-glass rounded-2xl group-hover:liquid-glass-hover transition-all duration-300">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-base mb-1 group-hover:text-gray-900 transition-colors">{wishlist.name}</h3>
                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">{wishlist.count} Wishlists</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{wishlist.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </div>
  );
}