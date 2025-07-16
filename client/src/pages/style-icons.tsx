import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Crown, Star, Users, TrendingUp, Sparkles, 
  Filter, Search, Heart, ShoppingBag, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNavigation from "@/components/bottom-navigation";
import StyleIcons from "@/components/style-icons";

export default function StyleIconsPage() {
  const [showStyleIcons, setShowStyleIcons] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: featuredIcons = [], isLoading } = useQuery({
    queryKey: ["/api/style-icons/featured"],
  });

  const { data: trendingLooks = [] } = useQuery({
    queryKey: ["/api/trending-looks"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/style-icons/stats"],
  });

  // Mock data for the page
  const mockFeaturedIcons = [
    {
      id: "emma_style",
      name: "Emma Richardson",
      handle: "@emmastyle",
      bio: "Sustainable fashion advocate & minimalist style curator",
      profileImageUrl: "",
      followers: 2400000,
      luloPoints: 15000,
      verified: true,
      tier: "icon",
      specialties: ["Sustainable Fashion", "Minimalism", "Workwear"],
      engagement_rate: 8.5
    },
    {
      id: "sofia_trends",
      name: "Sofia Martinez",
      handle: "@sofiatrends",
      bio: "Gen Z fashion trendsetter. Thrifting queen & vintage lover",
      profileImageUrl: "",
      followers: 1800000,
      luloPoints: 12500,
      verified: true,
      tier: "established",
      specialties: ["Vintage", "Thrifting", "Gen Z Fashion"],
      engagement_rate: 12.3
    },
    {
      id: "maya_chic",
      name: "Maya Chen",
      handle: "@mayachic",
      bio: "Luxury fashion enthusiast & style consultant",
      profileImageUrl: "",
      followers: 950000,
      luloPoints: 8500,
      verified: true,
      tier: "established",
      specialties: ["Luxury Fashion", "Designer Pieces", "Red Carpet"],
      engagement_rate: 7.8
    }
  ];

  const mockTrendingLooks = [
    {
      id: "minimalist_work",
      title: "Effortless Office Chic",
      description: "A timeless capsule wardrobe look perfect for the modern professional woman.",
      imageUrl: "",
      creator: "Emma Richardson",
      price_range: "$200-500",
      likes: 15420,
      saves: 8930,
      recreated: 2340
    },
    {
      id: "vintage_casual",
      title: "90s Vintage Vibes",
      description: "Thrifted pieces styled for the modern vintage lover.",
      imageUrl: "",
      creator: "Sofia Martinez",
      price_range: "$50-150",
      likes: 28750,
      saves: 16400,
      recreated: 5670
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'rising': return 'bg-green-100 text-green-800';
      case 'established': return 'bg-blue-100 text-blue-800';
      case 'icon': return 'bg-purple-100 text-purple-800';
      case 'legend': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mobile-app-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-lulo-coral" />
              <h1 className="text-xl font-semibold text-gray-900">Style Icons</h1>
            </div>
            <Button
              size="sm"
              className="bg-lulo-pink hover:bg-lulo-coral text-white"
              onClick={() => setShowStyleIcons(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Explore All
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Discover fashion influencers and get inspired by their signature looks
          </p>

          {/* Search and Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search style icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="rising">Rising</SelectItem>
                <SelectItem value="established">Established</SelectItem>
                <SelectItem value="icon">Icon</SelectItem>
                <SelectItem value="legend">Legend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        {/* Stats */}
        <section className="px-4 py-4 bg-gradient-to-r from-lulo-pink to-lulo-coral rounded-lg mx-4 mb-4 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">247</div>
              <div className="text-xs opacity-90">Style Icons</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1.2K</div>
              <div className="text-xs opacity-90">Signature Looks</div>
            </div>
            <div>
              <div className="text-2xl font-bold">8.9M</div>
              <div className="text-xs opacity-90">Total Followers</div>
            </div>
          </div>
        </section>

        {/* Featured Icons */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Featured Icons</h2>
            <Badge variant="secondary" className="bg-lulo-coral text-white">
              <Crown className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 card-shadow animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {mockFeaturedIcons.map((icon) => (
                <Card key={icon.id} className="card-shadow hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={icon.profileImageUrl} alt={icon.name} />
                        <AvatarFallback className="bg-lulo-sage text-white text-lg">
                          {icon.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{icon.name}</h3>
                          {icon.verified && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              Verified
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getTierColor(icon.tier)}`}>
                            {icon.tier}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{icon.bio}</p>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {icon.followers > 1000000 
                                ? `${(icon.followers / 1000000).toFixed(1)}M` 
                                : `${Math.floor(icon.followers / 1000)}K`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-lulo-coral" />
                            <span className="text-sm text-gray-600">{icon.luloPoints.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">{icon.engagement_rate}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        className="bg-lulo-pink hover:bg-lulo-coral text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Follow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Trending Looks */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trending Looks</h2>
            <Badge variant="secondary" className="bg-lulo-pink text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {mockTrendingLooks.map((look) => (
              <Card key={look.id} className="card-shadow hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-lulo-sage to-lulo-coral rounded-lg flex items-center justify-center">
                      {look.imageUrl ? (
                        <img 
                          src={look.imageUrl} 
                          alt={look.title} 
                          className="w-full h-full object-cover rounded-lg" 
                        />
                      ) : (
                        <Sparkles className="w-8 h-8 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{look.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{look.description}</p>
                      <p className="text-xs text-lulo-pink mb-2">by {look.creator}</p>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4 text-lulo-pink" />
                          <span className="text-sm text-gray-600">{look.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ShoppingBag className="w-4 h-4 text-lulo-sage" />
                          <span className="text-sm text-gray-600">{look.saves.toLocaleString()}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {look.price_range}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      className="bg-lulo-coral hover:bg-lulo-coral/90 text-white"
                      onClick={() => setShowStyleIcons(true)}
                    >
                      Get Look
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-4 py-6">
          <Card className="card-shadow bg-gradient-to-br from-lulo-pink to-lulo-coral text-white">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 mx-auto mb-4 text-white" />
              <h3 className="text-lg font-semibold mb-2">Become a Style Icon</h3>
              <p className="text-sm opacity-90 mb-4">
                Share your signature looks and inspire the Lulo community
              </p>
              <Button
                size="sm"
                className="bg-white text-lulo-pink hover:bg-gray-100"
              >
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Style Icons Modal */}
      <StyleIcons 
        open={showStyleIcons} 
        onOpenChange={setShowStyleIcons}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
} 