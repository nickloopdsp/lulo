import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import MasonryLayout from "@/components/masonry-layout";
import ArticleViewer from "@/components/article-viewer";

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

export default function Search() {
  const [selectedTab, setSelectedTab] = useState("global");
  const [selectedRegion, setSelectedRegion] = useState("go global");
  const [selectedArticle, setSelectedArticle] = useState<FashionArticle | null>(null);

  const { data: fashionNews = [], isLoading } = useQuery<FashionArticle[]>({
    queryKey: ["api", "fashion-news", selectedRegion],
    queryFn: async () => {
      const response = await fetch(`/api/fashion-news?region=${selectedRegion}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch fashion news");
      return response.json();
    },
  });

  const { data: trendingTopics = [] } = useQuery<string[]>({
    queryKey: ["api", "fashion-news", "trending-topics"],
    queryFn: async () => {
      const response = await fetch("/api/fashion-news/trending-topics", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch trending topics");
      return response.json();
    },
  });

  // Mock banner ads for carousel
  const bannerAds = [
    { id: 1, image: "/api/placeholder/350/150", title: "AD SPACE/BANNER" },
    { id: 2, image: "/api/placeholder/350/150", title: "AD SPACE/BANNER" },
    { id: 3, image: "/api/placeholder/350/150", title: "AD SPACE/BANNER" },
    { id: 4, image: "/api/placeholder/350/150", title: "AD SPACE/BANNER" },
    { id: 5, image: "/api/placeholder/350/150", title: "AD SPACE/BANNER" },
  ];

  // Group articles by source for better display
  const groupedArticles = fashionNews.reduce((acc, article) => {
    if (!acc[article.source]) {
      acc[article.source] = [];
    }
    acc[article.source].push(article);
    return acc;
  }, {} as Record<string, FashionArticle[]>);

  const ArticleCard = ({ article }: { article: FashionArticle }) => {
    // Create a collage of images for the article card
    const imageUrls = [
      article.imageUrl,
      "/api/placeholder/150/150",
      "/api/placeholder/150/150",
      "/api/placeholder/150/150",
    ];

    return (
      <div 
        className="masonry-item bg-white rounded-2xl overflow-hidden pinterest-shadow cursor-pointer"
        onClick={() => setSelectedArticle(article)}
      >
        {/* Image Collage */}
        <div className="grid grid-cols-2 gap-0.5 p-2">
          <div className="col-span-2">
            <img 
              src={imageUrls[0]}
              alt={article.title}
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
          <img 
            src={imageUrls[1]}
            alt=""
            className="w-full h-20 object-cover rounded-lg"
          />
          <img 
            src={imageUrls[2]}
            alt=""
            className="w-full h-20 object-cover rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-bold text-xs text-lulo-dark mb-2">
            {article.source.toUpperCase()}
          </h3>
          <p className="text-xs text-lulo-dark line-clamp-3">
            {article.description || `Header of the article, or beginning xx characters of the piece for a short description of the trend.`}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="mobile-main bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="bg-transparent p-0 h-auto space-x-4">
                <TabsTrigger 
                  value="global" 
                  className="px-0 pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-[#FADADD] data-[state=active]:border-b-2 data-[state=active]:border-[#FADADD] rounded-none text-lulo-gray"
                >
                  Global News
                </TabsTrigger>
                <TabsTrigger 
                  value="trends" 
                  className="px-0 pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-[#FADADD] data-[state=active]:border-b-2 data-[state=active]:border-[#FADADD] rounded-none text-lulo-gray"
                >
                  Lulo Trends
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <button className="p-2">
            <SearchIcon className="w-5 h-5 text-lulo-dark" />
          </button>
        </div>

        {/* Region Selector */}
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-lulo-dark flex items-center space-x-1 px-0"
        >
          <span>{selectedRegion}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="pb-20">
        <Tabs value={selectedTab}>
          <TabsContent value="global" className="m-0">
            {/* Banner Carousel */}
            <div className="px-4 py-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {bannerAds.map((ad) => (
                    <CarouselItem key={ad.id}>
                      <div className="relative">
                        <img 
                          src={ad.image}
                          alt={ad.title}
                          className="w-full h-40 object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl flex items-center justify-center">
                          <h2 className="text-white text-lg font-semibold">{ad.title}</h2>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Fashion Articles */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lulo-dark"></div>
              </div>
            ) : (
              <MasonryLayout>
                {fashionNews.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </MasonryLayout>
            )}
          </TabsContent>

          <TabsContent value="trends" className="m-0">
            <div className="p-4">
              {/* Trending Topics */}
              <div className="mb-6">
                <h2 className="font-semibold text-lulo-dark mb-3">Trending Now</h2>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic) => (
                    <Badge 
                      key={topic} 
                      variant="secondary"
                      className="bg-lulo-light-gray text-lulo-dark border-lulo-border"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Curated Lulo Trends */}
              <div>
                <h2 className="font-semibold text-lulo-dark mb-3">Based on Your Style</h2>
                <MasonryLayout>
                  {fashionNews
                    .filter(article => article.relevanceScore && article.relevanceScore > 0.7)
                    .map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                </MasonryLayout>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Viewer */}
      {selectedArticle && (
        <ArticleViewer
          articleUrl={selectedArticle.articleUrl}
          title={selectedArticle.title}
          source={selectedArticle.source}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
