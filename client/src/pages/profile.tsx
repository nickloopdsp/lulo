import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Eye, Settings, ChevronRight, Grid3X3, List, MoreVertical, Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNavigation from "@/components/bottom-navigation";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("daily-edit");
  const [isPublicView, setIsPublicView] = useState(false);
  
  // Public view states
  const [viewMode, setViewMode] = useState<"boards" | "items">("boards");
  const [selectedSubTab, setSelectedSubTab] = useState("ootd");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["/api/wishlist"],
  });

  const { data: closetItems = [] } = useQuery({
    queryKey: ["/api/closet"],
  });

  // Type guard to ensure arrays
  const wishlistArray = Array.isArray(wishlistItems) ? wishlistItems : [];
  const closetArray = Array.isArray(closetItems) ? closetItems : [];

  const mockUser = {
    name: "JUANITA MORENO",
    bio: "bio",
    username: "@juanitamorenoh",
    luloPoints: 200,
    following: 321,
    wishlists: 16,
    profileImageUrl: "/api/placeholder/120/120"
  };

  // Mock AI recommendation data
  const mockWishlistsForYou = [
    {
      id: "st-tropez-summer",
      name: "St Tropez Summer",
      wishlistCount: 12,
      imageUrl: "/api/placeholder/200/250"
    },
    {
      id: "nyc",
      name: "NYC",
      wishlistCount: 12,
      imageUrl: "/api/placeholder/200/300"
    },
    {
      id: "paris-trip",
      name: "Paris Trip",
      wishlistCount: 8,
      imageUrl: "/api/placeholder/200/280"
    },
    {
      id: "beach-vacation",
      name: "Beach Vacation",
      wishlistCount: 15,
      imageUrl: "/api/placeholder/200/320"
    },
    {
      id: "weekend-getaway",
      name: "Weekend Getaway",
      wishlistCount: 6,
      imageUrl: "/api/placeholder/200/260"
    }
  ];

  const mockBrandsForYou = [
    {
      id: "brand-1",
      name: "Brand 1",
      logoUrl: "/api/placeholder/50/50"
    },
    {
      id: "brand-2", 
      name: "Brand 2",
      logoUrl: "/api/placeholder/50/50"
    },
    {
      id: "brand-3",
      name: "Brand 3", 
      logoUrl: "/api/placeholder/50/50"
    },
    {
      id: "brand-4",
      name: "Brand 4",
      logoUrl: "/api/placeholder/50/50"
    },
    {
      id: "brand-5",
      name: "Brand 5",
      logoUrl: "/api/placeholder/50/50"
    },
    {
      id: "brand-6",
      name: "Brand 6",
      logoUrl: "/api/placeholder/50/50"
    }
  ];

  // Product links provided by user (order matters)
  const itemsForYouLinks: string[] = [
    "https://www.thereformation.fr/products/everett-linen-dress/1317269WHT.html?fbvar=nonbrandedgoogle&gad_source=1&gad_campaignid=21391152881&gbraid=0AAAAABnwCwe-z6rMRxi_B5lJbvDQDlD9-&gclid=Cj0KCQjwndHEBhDVARIsAGh0g3CVIm0L2NgyvO72YfRHZ3f7BmwkopOgXidz93E-9-8sl4k4NNr39SEaAhxZEALw_wcB",
    "https://www.driesvannoten.com/products/252-011510-852?variant=55404248007034",
    "https://www.gianvitorossi.com/fr_fr/femme/chaussures/chaussures-plates/shanti-thong-05/G15240.05CUO.XCNTECU_34.html?utm_source=rad&utm_medium=affiliate&utm_campaign=Redbrain&utm_keyword=pfxNKSnglIM-fo1ch974CpFrZ2ghQqRw4wranMID=52752&ranEAID=pfxNKSnglIM&ranSiteID=pfxNKSnglIM-fo1ch974CpFrZ2ghQqRw4w",
  ];

  type SimpleProduct = { id: string; name: string; brand: string; imageUrl: string; price?: string; sourceUrl: string };
  const [itemsForYou, setItemsForYou] = useState<SimpleProduct[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const results = await Promise.all(
          itemsForYouLinks.map(async (url) => {
            try {
              const res = await fetch('/api/products/scrape-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
                credentials: 'include',
              });
              if (!res.ok) throw new Error('scrape failed');
              const data = await res.json();
              return {
                id: (url.split('/').pop() || Date.now().toString()).replace(/[^a-zA-Z0-9]/g, ''),
                name: data.name || 'Product',
                brand: data.brand || 'Brand',
                imageUrl: data.imageUrl || '/api/placeholder/200/300',
                price: data.price,
                sourceUrl: url,
              } as SimpleProduct;
            } catch {
              // Fallback minimal info by domain
              const domain = new URL(url).hostname.replace('www.', '');
              const fallback: Record<string, SimpleProduct> = {
                'thereformation.fr': {
                  id: 'ref-everett',
                  name: 'Everett Linen Dress',
                  brand: 'Reformation',
                  imageUrl: '/api/placeholder/200/300',
                  sourceUrl: url,
                },
                'driesvannoten.com': {
                  id: 'dvn-dress',
                  name: 'Plaid Dress with Sequin Details',
                  brand: 'Dries Van Noten',
                  imageUrl: '/api/placeholder/200/300',
                  sourceUrl: url,
                },
                'gianvitorossi.com': {
                  id: 'gr-shanti',
                  name: 'Shanti Thong 05',
                  brand: 'Gianvito Rossi',
                  imageUrl: '/api/placeholder/200/300',
                  sourceUrl: url,
                },
              };
              return fallback[domain] || { id: domain, name: 'Product', brand: 'Brand', imageUrl: '/api/placeholder/200/300', sourceUrl: url };
            }
          })
        );
        if (isMounted) setItemsForYou(results);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const mockFriendsForYou = [
    {
      id: "friend-1",
      name: "Sarah Johnson",
      imageUrl: "/api/placeholder/50/50",
      mutualFriends: 3
    },
    {
      id: "friend-2",
      name: "Emma Davis", 
      imageUrl: "/api/placeholder/50/50",
      mutualFriends: 5
    },
    {
      id: "friend-3",
      name: "Maria Garcia",
      imageUrl: "/api/placeholder/50/50", 
      mutualFriends: 2
    },
    {
      id: "friend-4",
      name: "Lisa Chen",
      imageUrl: "/api/placeholder/50/50",
      mutualFriends: 4
    },
    {
      id: "friend-5",
      name: "Anna Wilson",
      imageUrl: "/api/placeholder/50/50",
      mutualFriends: 6
    },
    {
      id: "friend-6",
      name: "Rachel Brown",
      imageUrl: "/api/placeholder/50/50",
      mutualFriends: 1
    }
  ];

  // Mock data for public view (same as user-profile page)
  const mockWishlistBoards = [
    {
      id: "wl-1",
      name: "Summer Vacation",
      itemCount: 12,
      isPrivate: false,
      images: ["/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280", "/api/placeholder/200/320"]
    },
    {
      id: "wl-2", 
      name: "Date Night",
      itemCount: 8,
      isPrivate: true,
      images: ["/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270", "/api/placeholder/200/310"]
    },
    {
      id: "wl-3",
      name: "Work Wardrobe",
      itemCount: 15,
      isPrivate: false,
      images: ["/api/placeholder/200/240", "/api/placeholder/200/330", "/api/placeholder/200/280", "/api/placeholder/200/300"]
    },
    {
      id: "wl-4",
      name: "Weekend Casual",
      itemCount: 10,
      isPrivate: false,
      images: ["/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270"]
    }
  ];

  const mockClosetOOTD = [
    { id: "ootd-1", imageUrl: "/api/placeholder/200/250" },
    { id: "ootd-2", imageUrl: "/api/placeholder/200/300" },
    { id: "ootd-3", imageUrl: "/api/placeholder/200/280" },
    { id: "ootd-4", imageUrl: "/api/placeholder/200/320" },
    { id: "ootd-5", imageUrl: "/api/placeholder/200/260" },
    { id: "ootd-6", imageUrl: "/api/placeholder/200/290" }
  ];

  const mockClosetCategories = [
    { id: "tops", name: "Tops", imageUrl: "/api/placeholder/200/250", itemCount: 15 },
    { id: "bottoms", name: "Bottoms", imageUrl: "/api/placeholder/200/300", itemCount: 12 },
    { id: "dresses", name: "Dresses", imageUrl: "/api/placeholder/200/280", itemCount: 8 },
    { id: "shoes", name: "Shoes", imageUrl: "/api/placeholder/200/320", itemCount: 10 },
    { id: "accessories", name: "Accessories", imageUrl: "/api/placeholder/200/260", itemCount: 20 },
    { id: "outerwear", name: "Outerwear", imageUrl: "/api/placeholder/200/290", itemCount: 6 }
  ];

  const mockClosetCollections = [
    {
      id: "collection-1",
      name: "Summer Essentials",
      itemCount: 8,
      images: ["/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280", "/api/placeholder/200/320"]
    },
    {
      id: "collection-2",
      name: "Work Wear",
      itemCount: 12,
      images: ["/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270", "/api/placeholder/200/310"]
    },
    {
      id: "collection-3",
      name: "Evening Out",
      itemCount: 6,
      images: ["/api/placeholder/200/240", "/api/placeholder/200/330", "/api/placeholder/200/280", "/api/placeholder/200/300"]
    },
    {
      id: "collection-4",
      name: "Weekend Vibes",
      itemCount: 10,
      images: ["/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270"]
    }
  ];

  const mockIndividualLookboards = [
    {
      id: "lb-1",
      name: "Summer Beach Look",
      isPrivate: false,
      images: ["/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280", "/api/placeholder/200/320"]
    },
    {
      id: "lb-2",
      name: "City Break",
      isPrivate: false,
      images: ["/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270", "/api/placeholder/200/310"]
    },
    {
      id: "lb-3",
      name: "Date Night",
      isPrivate: true,
      images: ["/api/placeholder/200/240", "/api/placeholder/200/330", "/api/placeholder/200/280", "/api/placeholder/200/300"]
    },
    {
      id: "lb-4",
      name: "Work to Weekend",
      isPrivate: false,
      images: ["/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270"]
    }
  ];

  const mockCollections = [
    {
      id: "collection-1",
      name: "Honeymoon",
      isPrivate: false,
      miniatureLookboards: [
        { id: "mini-1", images: ["/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280", "/api/placeholder/200/320"] },
        { id: "mini-2", images: ["/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270", "/api/placeholder/200/310"] }
      ]
    },
    {
      id: "collection-2",
      name: "Paris Girls Trip",
      isPrivate: false,
      miniatureLookboards: [
        { id: "mini-3", images: ["/api/placeholder/200/240", "/api/placeholder/200/330", "/api/placeholder/200/280", "/api/placeholder/200/300"] },
        { id: "mini-4", images: ["/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270"] },
        { id: "mini-5", images: ["/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280", "/api/placeholder/200/320"] }
      ]
    },
    {
      id: "collection-3",
      name: "Beach Looks",
      isPrivate: false,
      miniatureLookboards: [
        { id: "mini-6", images: ["/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270", "/api/placeholder/200/310"] },
        { id: "mini-7", images: ["/api/placeholder/200/240", "/api/placeholder/200/330", "/api/placeholder/200/280", "/api/placeholder/200/300"] }
      ]
    },
    {
      id: "collection-4",
      name: "Weekend Getaways",
      isPrivate: true,
      miniatureLookboards: [
        { id: "mini-8", images: ["/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/270"] },
        { id: "mini-9", images: ["/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280", "/api/placeholder/200/320"] }
      ]
    }
  ];

  const handleBack = () => {
    setLocation("/newsfeed");
  };

  const handleEyeToggle = () => {
    setIsPublicView(!isPublicView);
  };

  const handleSectionClick = (section: string, itemId: string) => {
    switch (section) {
      case "wishlists":
        setLocation(`/wishlist/${itemId}`);
        break;
      case "brands":
        setLocation(`/brand/${itemId}`);
        break;
      case "items":
        setLocation(`/item/${itemId}`);
        break;
      case "friends":
        setLocation(`/user/${itemId}`);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleEyeToggle}
                      className={`p-2 rounded-lg transition-colors ${
                        isPublicView 
                          ? "bg-[#FADADD] text-white" 
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                      title={isPublicView ? "Exit Public View" : "View as Public"}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      className={`p-2 rounded-lg transition-colors ${
                        isPublicView 
                          ? "text-gray-400 cursor-not-allowed" 
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                      disabled={isPublicView}
                      title={isPublicView ? "Settings unavailable in public view" : "Settings"}
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white px-4 py-6">
        {isPublicView && (
          <div className="mb-4 bg-[#FADADD] text-white px-4 py-2 rounded-lg text-center text-sm font-medium">
            👁️ Public View - This is how others see your profile
          </div>
        )}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={mockUser.profileImageUrl} alt={mockUser.name} />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xl font-bold">
              JM
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h1 className="text-xl font-bold text-black">{mockUser.name}</h1>
            <p className="text-gray-600 text-sm mt-1">{mockUser.bio}</p>
          </div>
        </div>
      </div>

      {/* Menu Tabs */}
      <div className="bg-white px-4 pb-4">
        <div className="flex space-x-8 justify-center">
          {isPublicView ? (
            // Public view tabs - same as user-profile page
            [
              { id: "wishlists", label: "Wishlists" },
              { id: "closet", label: "Closet" },
              { id: "lookboards", label: "Lookboards" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-[#FADADD] border-b-2 border-[#FADADD]"
                    : "text-gray-500 hover:text-[#FADADD] hover:border-b-2 hover:border-[#FADADD]/50"
                }`}
              >
                {tab.label}
              </button>
            ))
          ) : (
            // Private view tabs - current Daily Edit layout
            [
              { id: "daily-edit", label: "Daily Edit" },
              { id: "friends", label: "Friends" },
              { id: "style-watch", label: "Style Watch" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-[#FADADD] border-b-2 border-[#FADADD]"
                    : "text-gray-500 hover:text-[#FADADD] hover:border-b-2 hover:border-[#FADADD]/50"
                }`}
              >
                {tab.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-1 bg-white px-4 pb-20">
        {!isPublicView ? (
          // Private view content
          <>
            {activeTab === "daily-edit" && (
              <div className="space-y-6">
                {/* Wishlists for You */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-black">Wishlists for You</h2>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {mockWishlistsForYou.map((wishlist) => (
                      <div
                        key={wishlist.id}
                        onClick={() => handleSectionClick("wishlists", wishlist.id)}
                        className="bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors flex-shrink-0 w-32"
                      >
                        <h3 className="font-bold text-sm text-black">{wishlist.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{wishlist.wishlistCount} Wishlists</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands for You */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-black">Brands for You</h2>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {mockBrandsForYou.map((brand) => (
                      <div
                        key={brand.id}
                        onClick={() => handleSectionClick("brands", brand.id)}
                        className="w-12 h-12 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center flex-shrink-0"
                      >
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items for You */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-black">Items for You</h2>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {itemsForYou.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          const data = {
                            name: item.name,
                            brand: item.brand,
                            price: item.price || '',
                            imageUrl: item.imageUrl,
                            sourceUrl: item.sourceUrl,
                          };
                          // Use visual-search style handoff so detail page renders even if not in wishlist
                          const tempId = (1000000 + index).toString();
                          setLocation(`/item/${tempId}?data=${encodeURIComponent(JSON.stringify(data))}&from=visual-search=1`);
                        }}
                        className="cursor-pointer group flex-shrink-0 w-32"
                      >
                        <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2">
                          <img
                            src={`/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}`}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).src = item.imageUrl; }}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-black">{item.brand}</p>
                          <p className="text-xs text-gray-600 truncate">{item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Friends for You */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-black">Friends for You</h2>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {mockFriendsForYou.map((friend) => (
                      <div
                        key={friend.id}
                        onClick={() => handleSectionClick("friends", friend.id)}
                        className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0 w-16"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center">
                          <img
                            src={friend.imageUrl}
                            alt={friend.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-gray-600 text-center truncate w-full">{friend.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "friends" && (
              <div className="text-center py-8">
                <p className="text-gray-500">Friends content coming soon...</p>
              </div>
            )}

            {activeTab === "style-watch" && (
              <div className="text-center py-8">
                <p className="text-gray-500">Style Watch content coming soon...</p>
              </div>
            )}
          </>
        ) : (
          // Public view content
          <>
            {activeTab === "wishlists" && (
              <div className="space-y-4">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode("boards")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "boards" ? "bg-[#FADADD] text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("items")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "items" ? "bg-[#FADADD] text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search wishlists..."
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FADADD]"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex justify-center space-x-2">
                  {["all", "collaborative", "secret", "archived"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 glass-button-lulo ${
                        selectedFilter === filter
                          ? "bg-[#FADADD] text-white"
                          : "text-gray-600 hover:text-[#FADADD]"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Wishlist Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {mockWishlistBoards.map((wishlist) => (
                    <div
                      key={wishlist.id}
                      className="liquid-glass rounded-lg p-3 cursor-pointer group transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="grid grid-cols-2 gap-1 mb-3">
                        {wishlist.images.map((image, index) => (
                          <div key={index} className="aspect-square rounded overflow-hidden">
                            <img
                              src={image}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-black group-hover:text-gray-900 transition-colors">
                            {wishlist.name}
                          </h3>
                          <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                            {wishlist.itemCount} items
                          </p>
                        </div>
                        {wishlist.isPrivate && (
                          <div className="text-gray-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "closet" && (
              <div className="space-y-4">
                {/* Sub-navigation */}
                <div className="flex justify-center space-x-2">
                  {["ootd", "my-items", "collections"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedSubTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 glass-button-lulo ${
                        selectedSubTab === tab
                          ? "bg-[#FADADD] text-white"
                          : "text-gray-600 hover:text-[#FADADD]"
                      }`}
                    >
                      {tab === "my-items" ? "My Items" : tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Content based on sub-tab */}
                {selectedSubTab === "ootd" && (
                  <div className="grid grid-cols-3 gap-3">
                    {mockClosetOOTD.map((ootd) => (
                      <div key={ootd.id} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={ootd.imageUrl}
                          alt=""
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {selectedSubTab === "my-items" && (
                  <div className="grid grid-cols-2 gap-4">
                    {mockClosetCategories.map((category) => (
                      <div
                        key={category.id}
                        className="liquid-glass rounded-lg p-3 cursor-pointer group transform transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="aspect-square rounded overflow-hidden mb-3">
                          <img
                            src={category.imageUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-black group-hover:text-gray-900 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                            {category.itemCount} items
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSubTab === "collections" && (
                  <div className="grid grid-cols-2 gap-4">
                    {mockClosetCollections.map((collection) => (
                      <div
                        key={collection.id}
                        className="liquid-glass rounded-lg p-3 cursor-pointer group transform transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {collection.images.map((image, index) => (
                            <div key={index} className="aspect-square rounded overflow-hidden">
                              <img
                                src={image}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-black group-hover:text-gray-900 transition-colors">
                            {collection.name}
                          </h3>
                          <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                            {collection.itemCount} items
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "lookboards" && (
              <div className="space-y-4">
                {/* Filter Buttons */}
                <div className="flex justify-center space-x-2">
                  {["all", "collections", "archived"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 glass-button-lulo ${
                        selectedFilter === filter
                          ? "bg-[#FADADD] text-white"
                          : "text-gray-600 hover:text-[#FADADD]"
                      }`}
                    >
                      {filter.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Lookboard Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedFilter === "all" && mockIndividualLookboards.map((lookboard) => (
                    <div
                      key={lookboard.id}
                      className="liquid-glass rounded-lg p-3 cursor-pointer group transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="grid grid-cols-2 gap-1 mb-3">
                        {lookboard.images.map((image, index) => (
                          <div key={index} className="aspect-square rounded overflow-hidden">
                            <img
                              src={image}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-black group-hover:text-gray-900 transition-colors">
                            {lookboard.name}
                          </h3>
                        </div>
                        {lookboard.isPrivate && (
                          <div className="text-gray-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedFilter === "collections" && mockCollections.map((collection) => (
                    <div
                      key={collection.id}
                      className="liquid-glass rounded-lg p-3 cursor-pointer group transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="grid grid-cols-2 gap-1 mb-3">
                        {collection.miniatureLookboards.slice(0, 4).map((mini, index) => (
                          <div key={index} className="aspect-square rounded overflow-hidden">
                            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                              {mini.images.slice(0, 4).map((image, imgIndex) => (
                                <div key={imgIndex} className="aspect-square">
                                  <img
                                    src={image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-black group-hover:text-gray-900 transition-colors">
                            {collection.name}
                          </h3>
                        </div>
                        {collection.isPrivate && (
                          <div className="text-gray-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
