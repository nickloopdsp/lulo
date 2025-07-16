import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Star, Heart, Users, ShoppingBag, Camera, Crown, 
  Sparkles, TrendingUp, Share2, Plus, Eye, Filter,
  MapPin, Calendar, Award, Verified, Instagram, 
  Twitter, Globe, ArrowRight, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StyleIconsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StyleIcon {
  id: string;
  name: string;
  handle: string;
  bio: string;
  profileImageUrl: string;
  coverImageUrl: string;
  followers: number;
  luloPoints: number;
  verified: boolean;
  tier: 'rising' | 'established' | 'icon' | 'legend';
  specialties: string[];
  location: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  signature_looks: SignatureLook[];
  collaboration_rate: number;
  engagement_rate: number;
}

interface SignatureLook {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  items: LookItem[];
  occasion: string;
  season: string;
  price_range: string;
  likes: number;
  saves: number;
  recreated: number;
}

interface LookItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string;
  sourceUrl: string;
  available: boolean;
  similar_items?: LookItem[];
}

export default function StyleIcons({ open, onOpenChange }: StyleIconsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedIcon, setSelectedIcon] = useState<StyleIcon | null>(null);
  const [selectedLook, setSelectedLook] = useState<SignatureLook | null>(null);
  const [showIconProfile, setShowIconProfile] = useState(false);
  const [showGetTheLook, setShowGetTheLook] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  // Fetch style icons data
  const { data: styleIcons = [], isLoading } = useQuery({
    queryKey: ["/api/style-icons"],
    enabled: open,
  });

  const { data: trendingLooks = [] } = useQuery({
    queryKey: ["/api/trending-looks"],
    enabled: open,
  });

  const { data: personalizedIcons = [] } = useQuery({
    queryKey: ["/api/personalized-icons"],
    enabled: open,
  });

  // Mock data for style icons
  const mockStyleIcons: StyleIcon[] = [
    {
      id: "emma_style",
      name: "Emma Richardson",
      handle: "@emmastyle",
      bio: "Sustainable fashion advocate & minimalist style curator. Helping you build a conscious wardrobe.",
      profileImageUrl: "",
      coverImageUrl: "",
      followers: 2400000,
      luloPoints: 15000,
      verified: true,
      tier: "icon",
      specialties: ["Sustainable Fashion", "Minimalism", "Workwear"],
      location: "New York, NY",
      socialLinks: {
        instagram: "emmastyle",
        website: "emmastyle.com"
      },
      signature_looks: [],
      collaboration_rate: 95,
      engagement_rate: 8.5
    },
    {
      id: "sofia_trends",
      name: "Sofia Martinez",
      handle: "@sofiatrends",
      bio: "Gen Z fashion trendsetter. Thrifting queen & vintage lover. Making high fashion accessible.",
      profileImageUrl: "",
      coverImageUrl: "",
      followers: 1800000,
      luloPoints: 12500,
      verified: true,
      tier: "established",
      specialties: ["Vintage", "Thrifting", "Gen Z Fashion"],
      location: "Los Angeles, CA",
      socialLinks: {
        instagram: "sofiatrends",
        twitter: "sofiatrends"
      },
      signature_looks: [],
      collaboration_rate: 88,
      engagement_rate: 12.3
    },
    {
      id: "maya_chic",
      name: "Maya Chen",
      handle: "@mayachic",
      bio: "Luxury fashion enthusiast & style consultant. Bringing you the latest in high-end fashion.",
      profileImageUrl: "",
      coverImageUrl: "",
      followers: 950000,
      luloPoints: 8500,
      verified: true,
      tier: "established",
      specialties: ["Luxury Fashion", "Designer Pieces", "Red Carpet"],
      location: "Paris, France",
      socialLinks: {
        instagram: "mayachic",
        website: "mayachen.fashion"
      },
      signature_looks: [],
      collaboration_rate: 92,
      engagement_rate: 7.8
    }
  ];

  const mockSignatureLooks: SignatureLook[] = [
    {
      id: "minimalist_work",
      title: "Effortless Office Chic",
      description: "A timeless capsule wardrobe look perfect for the modern professional woman.",
      imageUrl: "",
      occasion: "Work",
      season: "All Season",
      price_range: "$200-500",
      likes: 15420,
      saves: 8930,
      recreated: 2340,
      items: [
        {
          id: "blazer_1",
          name: "Structured Blazer",
          brand: "Everlane",
          price: 168,
          currency: "USD",
          category: "Blazers",
          imageUrl: "",
          sourceUrl: "https://everlane.com/blazer",
          available: true
        },
        {
          id: "trousers_1",
          name: "Wide Leg Trousers",
          brand: "COS",
          price: 89,
          currency: "USD",
          category: "Trousers",
          imageUrl: "",
          sourceUrl: "https://cos.com/trousers",
          available: true
        }
      ]
    },
    {
      id: "vintage_casual",
      title: "90s Vintage Vibes",
      description: "Thrifted pieces styled for the modern vintage lover.",
      imageUrl: "",
      occasion: "Casual",
      season: "Spring/Summer",
      price_range: "$50-150",
      likes: 28750,
      saves: 16400,
      recreated: 5670,
      items: [
        {
          id: "jacket_1",
          name: "Vintage Denim Jacket",
          brand: "Levi's",
          price: 45,
          currency: "USD",
          category: "Jackets",
          imageUrl: "",
          sourceUrl: "https://depop.com/vintage-levis",
          available: true
        }
      ]
    }
  ];

  const handleFollowIcon = async (iconId: string) => {
    try {
      await apiRequest("POST", `/api/style-icons/${iconId}/follow`);
      toast({
        title: "Following style icon!",
        description: "You'll now see their latest looks in your feed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/style-icons"] });
    } catch (error) {
      toast({
        title: "Error following icon",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSaveLook = async (lookId: string) => {
    try {
      await apiRequest("POST", `/api/looks/${lookId}/save`);
      toast({
        title: "Look saved!",
        description: "Added to your saved looks collection.",
      });
    } catch (error) {
      toast({
        title: "Error saving look",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleCopyToWishlist = async (item: LookItem) => {
    try {
      await apiRequest("POST", "/api/wishlist", {
        name: item.name,
        brand: item.brand,
        price: item.price,
        currency: item.currency,
        imageUrl: item.imageUrl,
        sourceUrl: item.sourceUrl,
        category: item.category,
        notes: `From ${selectedIcon?.name}'s "${selectedLook?.title}" look`
      });
      
      setCopiedItems(prev => new Set([...prev, item.id]));
      toast({
        title: "Added to wishlist!",
        description: `${item.name} has been added to your wishlist.`,
      });
      
      // Remove from copied items after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error adding to wishlist",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'rising': return 'bg-green-100 text-green-800';
      case 'established': return 'bg-blue-100 text-blue-800';
      case 'icon': return 'bg-purple-100 text-purple-800';
      case 'legend': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StyleIconCard = ({ icon }: { icon: StyleIcon }) => (
    <Card className="card-shadow hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          <div className="w-full h-32 bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-t-lg flex items-center justify-center">
            {icon.coverImageUrl ? (
              <img 
                src={icon.coverImageUrl} 
                alt={icon.name} 
                className="w-full h-full object-cover rounded-t-lg" 
              />
            ) : (
              <Sparkles className="w-8 h-8 text-white" />
            )}
          </div>
          
          <Avatar className="absolute -bottom-6 left-4 w-12 h-12 border-4 border-white">
            <AvatarImage src={icon.profileImageUrl} alt={icon.name} />
            <AvatarFallback className="bg-lulo-sage text-white">
              {icon.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="absolute top-2 right-2 flex space-x-1">
            {icon.verified && (
              <Badge className="bg-blue-500 text-white text-xs">
                <Verified className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge className={`text-xs ${getTierColor(icon.tier)}`}>
              {icon.tier}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 pt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{icon.name}</h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-lulo-coral" />
              <span className="text-sm text-gray-600">{icon.luloPoints.toLocaleString()}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{icon.bio}</p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {icon.followers > 1000000 
                  ? `${(icon.followers / 1000000).toFixed(1)}M` 
                  : `${Math.floor(icon.followers / 1000)}K`}
              </span>
            </div>
            <div className="flex space-x-1">
              {icon.specialties.slice(0, 2).map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIcon(icon);
                setShowIconProfile(true);
              }}
              size="sm"
              className="flex-1 bg-lulo-pink hover:bg-lulo-coral text-white"
            >
              View Profile
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleFollowIcon(icon.id);
              }}
              size="sm"
              variant="outline"
              className="px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SignatureLookCard = ({ look }: { look: SignatureLook }) => (
    <Card className="card-shadow hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-lulo-sage to-lulo-coral rounded-t-lg flex items-center justify-center">
            {look.imageUrl ? (
              <img 
                src={look.imageUrl} 
                alt={look.title} 
                className="w-full h-full object-cover rounded-t-lg" 
              />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </div>
          
          <div className="absolute top-2 right-2">
            <Badge className="bg-black bg-opacity-50 text-white text-xs">
              {look.price_range}
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{look.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{look.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-3">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-lulo-pink" />
                <span className="text-sm text-gray-600">{look.likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ShoppingBag className="w-4 h-4 text-lulo-sage" />
                <span className="text-sm text-gray-600">{look.saves.toLocaleString()}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {look.occasion}
            </Badge>
          </div>
          
          <Button
            onClick={() => {
              setSelectedLook(look);
              setShowGetTheLook(true);
            }}
            size="sm"
            className="w-full bg-lulo-coral hover:bg-lulo-coral/90 text-white"
          >
            Get This Look
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl mx-4 rounded-xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center space-x-2">
            <Crown className="w-5 h-5 text-lulo-coral" />
            <span>Style Icons</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="h-full flex flex-col">
          {/* Search and Filter */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search style icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Icons</SelectItem>
                <SelectItem value="rising">Rising</SelectItem>
                <SelectItem value="established">Established</SelectItem>
                <SelectItem value="icon">Icon</SelectItem>
                <SelectItem value="legend">Legend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="featured" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="trending">Trending Looks</TabsTrigger>
                <TabsTrigger value="personalized">For You</TabsTrigger>
              </TabsList>
              
              <TabsContent value="featured" className="h-full overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Top Style Icons</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockStyleIcons.map((icon) => (
                        <StyleIconCard key={icon.id} icon={icon} />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="trending" className="h-full overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Trending Signature Looks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockSignatureLooks.map((look) => (
                        <SignatureLookCard key={look.id} look={look} />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="personalized" className="h-full overflow-y-auto">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Recommendations</h3>
                  <p className="text-gray-600 mb-4">
                    Follow style icons and interact with looks to get personalized recommendations
                  </p>
                  <Button className="bg-lulo-coral hover:bg-lulo-coral/90 text-white">
                    Explore Featured Icons
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>

      {/* Style Icon Profile Modal */}
      {selectedIcon && (
        <Dialog open={showIconProfile} onOpenChange={setShowIconProfile}>
          <DialogContent className="max-w-2xl mx-4 rounded-xl h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-center">Style Icon Profile</DialogTitle>
            </DialogHeader>
            
            <div className="h-full overflow-y-auto">
              {/* Profile Header */}
              <div className="relative mb-6">
                <div className="w-full h-32 bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-lg flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <div className="absolute -bottom-8 left-4">
                  <Avatar className="w-16 h-16 border-4 border-white">
                    <AvatarImage src={selectedIcon.profileImageUrl} alt={selectedIcon.name} />
                    <AvatarFallback className="bg-lulo-sage text-white text-xl">
                      {selectedIcon.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <div className="pt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedIcon.name}</h2>
                    <p className="text-gray-600">{selectedIcon.handle}</p>
                  </div>
                  <Button
                    onClick={() => handleFollowIcon(selectedIcon.id)}
                    className="bg-lulo-pink hover:bg-lulo-coral text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                </div>
                
                <p className="text-gray-700">{selectedIcon.bio}</p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-lulo-coral">
                      {selectedIcon.followers > 1000000 
                        ? `${(selectedIcon.followers / 1000000).toFixed(1)}M` 
                        : `${Math.floor(selectedIcon.followers / 1000)}K`}
                    </div>
                    <div className="text-xs text-gray-600">Followers</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-lulo-pink">{selectedIcon.luloPoints.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Lulo Points</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-lulo-sage">{selectedIcon.engagement_rate}%</div>
                    <div className="text-xs text-gray-600">Engagement</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedIcon.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedIcon.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Get The Look Modal */}
      {selectedLook && (
        <Dialog open={showGetTheLook} onOpenChange={setShowGetTheLook}>
          <DialogContent className="max-w-4xl mx-4 rounded-xl h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-center">Get The Look</DialogTitle>
            </DialogHeader>
            
            <div className="h-full overflow-y-auto">
              <div className="space-y-6">
                {/* Look Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedLook.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedLook.description}</p>
                  
                  <div className="flex items-center justify-center space-x-6">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-5 h-5 text-lulo-pink" />
                      <span className="font-medium">{selectedLook.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ShoppingBag className="w-5 h-5 text-lulo-sage" />
                      <span className="font-medium">{selectedLook.saves.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-5 h-5 text-lulo-coral" />
                      <span className="font-medium">{selectedLook.recreated.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Look Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Shop The Look</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLook.items.map((item) => (
                      <Card key={item.id} className="card-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              {item.imageUrl ? (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover rounded-lg" 
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-lg" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.brand}</p>
                              <p className="text-sm font-medium text-lulo-coral">
                                {item.currency} {item.price}
                              </p>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <Button
                                onClick={() => handleCopyToWishlist(item)}
                                size="sm"
                                variant={copiedItems.has(item.id) ? "default" : "outline"}
                                className={copiedItems.has(item.id) ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                              >
                                {copiedItems.has(item.id) ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => window.open(item.sourceUrl, '_blank')}
                                size="sm"
                                className="bg-lulo-pink hover:bg-lulo-coral text-white"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => handleSaveLook(selectedLook.id)}
                    className="flex-1 bg-lulo-sage hover:bg-lulo-sage/90 text-white"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save Look
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Look
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
} 