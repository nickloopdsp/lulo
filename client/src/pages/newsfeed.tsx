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
    navigate(`/item/${itemId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex space-x-8">
                              <button
                  onClick={() => setActiveTab("global")}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeTab === "global"
                      ? "text-gray-900 border-black"
                      : "text-gray-400 border-transparent hover:text-gray-600"
                  }`}
                >
                  Global News
                </button>
                <button
                  onClick={() => setActiveTab("trends")}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    activeTab === "trends"
                      ? "text-lulo-pink border-lulo-pink"
                      : "text-gray-400 border-transparent hover:text-gray-600"
                  }`}
                >
                  Lulo Trends
                </button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
              <Search className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Region selector - only show on trends tab */}
          {activeTab === "trends" && (
            <div className="flex justify-end mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-600">
                    go global
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Global</DropdownMenuItem>
                  <DropdownMenuItem>United States</DropdownMenuItem>
                  <DropdownMenuItem>Europe</DropdownMenuItem>
                  <DropdownMenuItem>Asia</DropdownMenuItem>
                  <DropdownMenuItem>My Location</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Ad Banner Space */}
        <div className="relative bg-lulo-pink/5 rounded-lg p-8 text-center overflow-hidden">
          {/* Lulo pattern background */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-16 h-16 rounded-full border-2 border-lulo-pink/10"
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
            <div className="w-2 h-2 bg-black rounded-full"></div>
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
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                      <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              articles.map((article) => (
                <Card 
                  key={article.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        {/* Source Badge */}
                        <Badge variant="secondary" className="mb-2 text-xs font-medium">
                          {article.source}
                        </Badge>
                        
                        {/* Article Title */}
                        <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        {/* Article Preview */}
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                          {truncateDescription(article.description)}
                        </p>
                      </div>
                      
                      {/* Article Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          /* Lulo Trends Content */
          <div className="space-y-6">
            {/* Most Wishlisted Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Most Wishlisted Items This Week</h2>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex-shrink-0 w-36 animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))
                ) : (
                  trendingItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex-shrink-0 w-36"
                    >
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleItemClick(item.id)}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                          <p className="text-sm font-medium truncate mb-1">{item.name}</p>
                          {item.price && <p className="text-sm font-semibold">{item.price}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Most Trending Wishlists */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Most Trending Wishlists This Week</h2>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))
                ) : (
                  trendingWishlists.map((wishlist) => (
                    <div key={wishlist.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-base mb-1">{wishlist.name}</h3>
                      <p className="text-sm text-gray-600">{wishlist.count} Wishlists</p>
                      <p className="text-xs text-gray-500 italic">Trending in {wishlist.location}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
}