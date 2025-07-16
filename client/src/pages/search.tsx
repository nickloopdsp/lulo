import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Filter, X, TrendingUp, Clock, ExternalLink, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MasonryLayout from "@/components/masonry-layout";
import ItemCard from "@/components/item-card";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTab, setSelectedTab] = useState("online");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/items"],
  });

  // Mock magazine content data
  const mockMagazineContent = [
    {
      id: 1,
      type: "banner",
      title: "Banner title",
      description: "Featured content",
      image: "/api/placeholder/350/200",
      category: "Featured"
    },
    {
      id: 2,
      type: "article",
      title: "Young Mexican Americans Are Reclaiming Style as Resistance",
      description: "Exploring cultural identity through fashion choices",
      image: "/api/placeholder/200/250",
      category: "Culture",
      readTime: "5 min read",
      author: "Fashion Writer"
    },
    {
      id: 3,
      type: "article",
      title: "Where Vogue Editors Are Traveling This Summer— And What They're Packing",
      description: "Travel style inspiration from the editors",
      image: "/api/placeholder/200/280",
      category: "Travel",
      readTime: "8 min read",
      author: "Vogue Editors"
    },
    {
      id: 4,
      type: "article",
      title: "All the Best Celebrity Fashions at Wimbledon 2025",
      description: "Court-side style moments from the tennis tournament",
      image: "/api/placeholder/200/260",
      category: "Celebrity",
      readTime: "6 min read",
      author: "Style Reporter"
    },
    {
      id: 5,
      type: "article",
      title: "All the Stars On the Front Row of Couture Week",
      description: "Front row fashion at Paris Haute Couture",
      image: "/api/placeholder/200/300",
      category: "Fashion Week",
      readTime: "7 min read",
      author: "Fashion Insider"
    }
  ];

  // Mock product collections
  const mockProductCollections = [
    {
      id: 1,
      name: "Reformation",
      description: "Dress Name",
      image: "/api/placeholder/150/200",
      category: "Pieces"
    },
    {
      id: 2,
      name: "Dries Van Noten",
      description: "Clutch Name",
      image: "/api/placeholder/150/200",
      category: "Pieces"
    },
    {
      id: 3,
      name: "Sam Edelman",
      description: "Heels",
      image: "/api/placeholder/150/200",
      category: "Pieces"
    }
  ];

  // Mock wishlist collections
  const mockWishlistCollections = [
    {
      id: 1,
      name: "South of France",
      description: "Summer vacation vibes",
      image: "/api/placeholder/150/200",
      category: "Wishlists"
    },
    {
      id: 2,
      name: "4th of July",
      description: "Patriotic style",
      image: "/api/placeholder/150/200",
      category: "Wishlists"
    }
  ];

  const filteredItems = (items as any[]).filter((item: any) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const MagazineCard = ({ article }: { article: any }) => {
    if (article.type === "banner") {
      return (
        <div className="masonry-item">
          <div className="relative">
            <img 
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl flex items-center justify-center">
              <h2 className="text-white text-xl font-bold">{article.title}</h2>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="masonry-item group cursor-pointer">
        <div className="relative">
          <img 
            src={article.image}
            alt={article.title}
            className="w-full h-auto object-cover rounded-t-2xl"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <Badge variant="secondary" className="text-xs mb-2">
            {article.category}
          </Badge>
          <h3 className="font-semibold text-sm text-lulo-dark mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs text-lulo-gray mb-2 line-clamp-2">
            {article.description}
          </p>
          <div className="flex items-center justify-between text-xs text-lulo-gray">
            <span>{article.author}</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: any }) => (
    <div className="bg-white rounded-2xl overflow-hidden pinterest-shadow">
      <img 
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-3">
        <p className="text-xs text-lulo-gray mb-1">{product.name}</p>
        <h3 className="font-medium text-sm text-lulo-dark">{product.description}</h3>
      </div>
    </div>
  );

  return (
    <div className="mobile-main">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-lulo-dark">Discover</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-lulo-gray"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lulo-gray" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-lulo-border rounded-full bg-lulo-light-gray"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-lulo-border">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border-b border-lulo-border">
            <TabsTrigger value="online" className="text-sm">
              Online
            </TabsTrigger>
            <TabsTrigger value="lulo" className="text-sm">
              Lulo
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="bg-lulo-light-gray flex-1">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsContent value="online" className="m-0">
            {searchQuery ? (
              // Search Results
              <div className="p-4">
                <p className="text-sm text-lulo-gray mb-4">
                  {filteredItems.length} results for "{searchQuery}"
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {filteredItems.map((item: any) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              // Magazine Content
              <MasonryLayout>
                {mockMagazineContent.map((article) => (
                  <MagazineCard key={article.id} article={article} />
                ))}
              </MasonryLayout>
            )}
          </TabsContent>
          
          <TabsContent value="lulo" className="m-0">
            <div className="p-4">
              {/* Pieces Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lulo-dark">Pieces</h2>
                  <Button variant="ghost" size="sm" className="text-lulo-gray">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {mockProductCollections.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>

              {/* Wishlists Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lulo-dark">Wishlists</h2>
                  <Button variant="ghost" size="sm" className="text-lulo-gray">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {mockWishlistCollections.map((wishlist) => (
                    <ProductCard key={wishlist.id} product={wishlist} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
