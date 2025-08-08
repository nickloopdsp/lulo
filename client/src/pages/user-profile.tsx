import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Share, MoreHorizontal, MapPin, Search, Grid3X3, List, MoreVertical, Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface UserProfileData {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  avatar: string;
  isVerified: boolean;
  isFollowing: boolean;
  luloCount: number;
  followingCount: number;
  wishlistCount: number;
  coverImages: string[];
}

export default function UserProfile() {
  const [, params] = useRoute("/user/:userId");
  const [selectedTab, setSelectedTab] = useState("wishlists");
  const userId = params?.userId;
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock user database matching the network page users
  const mockUserDatabase: { [key: string]: UserProfileData } = {
    // Icons
    "1": {
      id: "1",
      username: "rhode",
      displayName: "RHODE SKIN",
      bio: "Clean beauty for everyone",
      location: "Los Angeles, CA, USA",
      avatar: "/api/placeholder/120/120",
      isVerified: true,
      isFollowing: false,
      luloCount: 2840,
      followingCount: 892,
      wishlistCount: 23,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    "2": {
      id: "2",
      username: "owen.han",
      displayName: "OWEN HAN",
      bio: "Food & lifestyle content creator",
      location: "San Francisco, CA, USA",
      avatar: "/api/placeholder/120/120",
      isVerified: true,
      isFollowing: false,
      luloCount: 1560,
      followingCount: 445,
      wishlistCount: 18,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    "3": {
      id: "3",
      username: "atfrenchies",
      displayName: "AT FRENCHIES",
      bio: "French lifestyle & fashion",
      location: "Marseille, France",
      avatar: "/api/placeholder/120/120",
      isVerified: true,
      isFollowing: false,
      luloCount: 987,
      followingCount: 234,
      wishlistCount: 31,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    "4": {
      id: "4",
      username: "nicksent",
      displayName: "NICK",
      bio: "Travel photographer",
      location: "Paris, France",
      avatar: "/api/placeholder/120/120",
      isVerified: true,
      isFollowing: false,
      luloCount: 1240,
      followingCount: 567,
      wishlistCount: 12,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    // Followers
    "f1": {
      id: "f1",
      username: "styleenthusiast22",
      displayName: "EMMA STYLE",
      bio: "Fashion & lifestyle blogger",
      location: "New York, NY, USA",
      avatar: "/api/placeholder/120/120",
      isVerified: false,
      isFollowing: false,
      luloCount: 156,
      followingCount: 234,
      wishlistCount: 8,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    "f2": {
      id: "f2",
      username: "fashionista_jo",
      displayName: "JORDAN KIM",
      bio: "K-fashion enthusiast",
      location: "Seoul, South Korea",
      avatar: "/api/placeholder/120/120",
      isVerified: false,
      isFollowing: true,
      luloCount: 289,
      followingCount: 178,
      wishlistCount: 15,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    "f3": {
      id: "f3",
      username: "trendsettermax",
      displayName: "MAX CHEN",
      bio: "Minimalist style curator",
      location: "Toronto, Canada",
      avatar: "/api/placeholder/120/120",
      isVerified: false,
      isFollowing: false,
      luloCount: 98,
      followingCount: 145,
      wishlistCount: 6,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    // Following
    "5": {
      id: "5",
      username: "isabelherrera___",
      displayName: "ISA",
      bio: "Beachy vibes only",
      location: "Palm Beach, FL, USA",
      avatar: "/api/placeholder/120/120",
      isVerified: false,
      isFollowing: true,
      luloCount: 345,
      followingCount: 198,
      wishlistCount: 22,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    "6": {
      id: "6",
      username: "marilunazz",
      displayName: "MARIANA LUNA 🌙",
      bio: "NYC fashion student",
      location: "New York, NY, USA",
      avatar: "/api/placeholder/120/120",
      isVerified: false,
      isFollowing: true,
      luloCount: 456,
      followingCount: 321,
      wishlistCount: 19,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    "7": {
      id: "7",
      username: "julixperez",
      displayName: "JULI",
      bio: "Mexican street style",
      location: "Mexico City, Mexico",
      avatar: "/api/placeholder/120/120",
      isVerified: false,
      isFollowing: true,
      luloCount: 234,
      followingCount: 156,
      wishlistCount: 11,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    },
    "8": {
      id: "8",
      username: "rhenaoj",
      displayName: "ROXANA",
      bio: "Colombian fashion lover",
      location: "Bogota, Colombia",
      avatar: "/api/placeholder/120/120",
      isVerified: false,
      isFollowing: true,
      luloCount: 167,
      followingCount: 89,
      wishlistCount: 7,
      coverImages: [
        "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
        "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
        "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
        "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
        "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
      ]
    }
  };

  // Get user data based on ID, fallback to default user
  const mockUserData: UserProfileData = mockUserDatabase[userId || "1"] || {
    id: userId || "1",
    username: "juanitamorenoh",
    displayName: "JUANITA MORENO",
    bio: "Default user profile",
    location: "Miami, FL, USA",
    avatar: "/api/placeholder/120/120",
    isVerified: false,
    isFollowing: false,
    luloCount: 200,
    followingCount: 321,
    wishlistCount: 16,
    coverImages: [
      "/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280",
      "/api/placeholder/200/320", "/api/placeholder/200/260", "/api/placeholder/200/290",
      "/api/placeholder/200/310", "/api/placeholder/200/270", "/api/placeholder/200/330",
      "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295",
      "/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265",
    ]
  };

  // Initialize following state based on user data
  useEffect(() => {
    setIsFollowing(mockUserData.isFollowing);
  }, [mockUserData.isFollowing]);

  // Mock wishlist data matching main wishlist page format
  const mockWishlistBoards = [
    {
      id: "paris-trip",
      name: "Paris Girls Trip",
      itemCount: 21,
      imageCollage: [
        "/api/placeholder/200/250",
        "/api/placeholder/200/300", 
        "/api/placeholder/200/280",
        "/api/placeholder/200/320"
      ],
      isPrivate: true
    },
    {
      id: "wedding",
      name: "Sarah's Wedding",
      itemCount: 9,
      imageCollage: [
        "/api/placeholder/200/260",
        "/api/placeholder/200/290",
        "/api/placeholder/200/310",
        "/api/placeholder/200/270"
      ],
      isPrivate: true
    },
    {
      id: "summer-vibes",
      name: "Summer Vibes",
      itemCount: 15,
      imageCollage: [
        "/api/placeholder/200/330",
        "/api/placeholder/200/240",
        "/api/placeholder/200/285",
        "/api/placeholder/200/295"
      ],
      isPrivate: false
    },
    {
      id: "work-outfits",
      name: "Work Outfits",
      itemCount: 12,
      imageCollage: [
        "/api/placeholder/200/275",
        "/api/placeholder/200/305",
        "/api/placeholder/200/265",
        "/api/placeholder/200/250"
      ],
      isPrivate: false
    }
  ];

  // Mock closet data matching main closet page format
  const mockClosetOOTD = [
    {
      id: 1,
      imageUrl: "/api/placeholder/200/260",
      caption: "Monday Office Look",
      date: "2024-01-15",
      likes: 24,
      tags: ["work", "professional", "blazer"]
    },
    {
      id: 2,
      imageUrl: "/api/placeholder/200/290",
      caption: "Weekend Casual",
      date: "2024-01-14",
      likes: 18,
      tags: ["casual", "weekend", "denim"]
    },
    {
      id: 3,
      imageUrl: "/api/placeholder/200/310",
      caption: "Date Night Outfit",
      date: "2024-01-13",
      likes: 45,
      tags: ["date", "evening", "dress"]
    },
    {
      id: 4,
      imageUrl: "/api/placeholder/200/270",
      caption: "Gym Session",
      date: "2024-01-12",
      likes: 12,
      tags: ["workout", "athletic", "leggings"]
    },
    {
      id: 5,
      imageUrl: "/api/placeholder/200/330",
      caption: "Brunch with Friends",
      date: "2024-01-11",
      likes: 31,
      tags: ["brunch", "friends", "casual"]
    },
    {
      id: 6,
      imageUrl: "/api/placeholder/200/240",
      caption: "Concert Night",
      date: "2024-01-10",
      likes: 28,
      tags: ["concert", "evening", "party"]
    }
  ];

  const mockClosetCategories = [
    { name: "Dresses", count: 12, image: "/api/placeholder/200/250" },
    { name: "Tops", count: 18, image: "/api/placeholder/200/300" },
    { name: "Pants", count: 15, image: "/api/placeholder/200/280" },
    { name: "Shoes", count: 8, image: "/api/placeholder/200/320" },
    { name: "Accessories", count: 22, image: "/api/placeholder/200/260" },
    { name: "Outerwear", count: 6, image: "/api/placeholder/200/290" }
  ];

  const mockClosetCollections = [
    {
      id: 1,
      name: "Summer Collection",
      itemCount: 8,
      imageCollage: [
        "/api/placeholder/200/250",
        "/api/placeholder/200/300",
        "/api/placeholder/200/280",
        "/api/placeholder/200/320"
      ],
      isPrivate: false
    },
    {
      id: 2,
      name: "Work Essentials",
      itemCount: 12,
      imageCollage: [
        "/api/placeholder/200/260",
        "/api/placeholder/200/290",
        "/api/placeholder/200/310",
        "/api/placeholder/200/270"
      ],
      isPrivate: false
    }
  ];

  // Mock lookboards data matching main lookboards page format
  const mockIndividualLookboards = [
    {
      id: 1,
      name: "Honeymoon Collection",
      itemCount: 4,
      imageCollage: [
        "/api/placeholder/200/250",
        "/api/placeholder/200/300",
        "/api/placeholder/200/280",
        "/api/placeholder/200/320"
      ],
      isPrivate: false,
      isArchived: false
    },
    {
      id: 2,
      name: "Paris Girls Trip",
      itemCount: 4,
      imageCollage: [
        "/api/placeholder/200/260",
        "/api/placeholder/200/290",
        "/api/placeholder/200/310",
        "/api/placeholder/200/270"
      ],
      isPrivate: false,
      isArchived: false
    },
    {
      id: 3,
      name: "Beach Looks",
      itemCount: 4,
      imageCollage: [
        "/api/placeholder/200/330",
        "/api/placeholder/200/240",
        "/api/placeholder/200/285",
        "/api/placeholder/200/295"
      ],
      isPrivate: false,
      isArchived: false
    },
    {
      id: 4,
      name: "Casual Weekend",
      itemCount: 4,
      imageCollage: [
        "/api/placeholder/200/275",
        "/api/placeholder/200/305",
        "/api/placeholder/200/265",
        "/api/placeholder/200/250"
      ],
      isPrivate: true,
      isArchived: false
    }
  ];

  const mockLookboardCollections = [
    {
      id: 1,
      name: "Travel Collections",
      lookboardCount: 3,
      isPrivate: false,
      miniatureLookboards: [
        {
          id: 1,
          name: "Honeymoon",
          imageCollage: ["/api/placeholder/200/250", "/api/placeholder/200/300", "/api/placeholder/200/280", "/api/placeholder/200/320"]
        },
        {
          id: 2,
          name: "Paris Trip",
          imageCollage: ["/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/310", "/api/placeholder/200/270"]
        },
        {
          id: 3,
          name: "Beach Vibes",
          imageCollage: ["/api/placeholder/200/330", "/api/placeholder/200/240", "/api/placeholder/200/285", "/api/placeholder/200/295"]
        }
      ]
    },
    {
      id: 2,
      name: "Seasonal Looks",
      lookboardCount: 2,
      isPrivate: false,
      miniatureLookboards: [
        {
          id: 4,
          name: "Summer",
          imageCollage: ["/api/placeholder/200/275", "/api/placeholder/200/305", "/api/placeholder/200/265", "/api/placeholder/200/250"]
        },
        {
          id: 5,
          name: "Winter",
          imageCollage: ["/api/placeholder/200/260", "/api/placeholder/200/290", "/api/placeholder/200/310", "/api/placeholder/200/270"]
        }
      ]
    }
  ];

  // State for sub-navigation
  const [selectedSubTab, setSelectedSubTab] = useState("ootd");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"boards" | "items">("boards");

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="mobile-main bg-white">
      {/* Header with Back Button */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goBack}
            className="bg-white/80 backdrop-blur-sm rounded-full p-2 h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4 text-lulo-dark" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 h-8 w-8"
            >
              <Share className="w-4 h-4 text-lulo-dark" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm rounded-full p-2 h-8 w-8"
                >
                  <MoreHorizontal className="w-4 h-4 text-lulo-dark" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Share Profile</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Masonry Background */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 masonry-grid gap-1" style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gridAutoRows: '60px'
        }}>
          {mockUserData.coverImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt=""
              className="w-full h-full object-cover"
              style={{
                gridRowEnd: `span ${Math.floor(Math.random() * 3) + 2}`
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative -mt-16 px-6">
        <div className="flex flex-col items-center">
          {/* Profile Picture */}
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={mockUserData.avatar} alt={mockUserData.displayName} />
            <AvatarFallback className="bg-lulo-light-gray text-lulo-dark text-xl font-semibold">
              {mockUserData.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Name and Bio */}
          <div className="text-center mt-4 mb-2">
            <h1 className="text-xl font-bold text-lulo-dark tracking-wide">
              {mockUserData.displayName}
            </h1>
            <p className="text-lulo-gray mt-1">{mockUserData.bio}</p>
            <p className="text-lulo-dark font-medium mt-2">@{mockUserData.username}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-2 text-sm text-lulo-dark font-medium mb-6">
            <span className="text-[#FADADD] font-bold">{mockUserData.luloCount} Lulos</span>
            <span className="text-lulo-gray">|</span>
            <span>{mockUserData.followingCount} following</span>
            <span className="text-lulo-gray">|</span>
            <span>{mockUserData.wishlistCount} Wishlists</span>
          </div>

          {/* Follow Button */}
          <Button
            onClick={handleFollowToggle}
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className={`px-6 py-2 rounded-full transition-all duration-200 ${
              isFollowing 
                ? "border-gray-300 text-gray-700 hover:bg-[#FADADD] hover:text-white hover:border-[#FADADD]" 
                : "bg-[#FADADD] text-white hover:bg-[#FADADD]/90"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center justify-center space-x-8">
          {["wishlists", "closet", "lookboards"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedTab === tab
                  ? "text-[#FADADD] border-b-2 border-[#FADADD]"
                  : "text-gray-500 hover:text-[#FADADD] hover:border-b-2 hover:border-[#FADADD]/50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Navigation/Filter Bar */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center justify-between">
          {selectedTab === "wishlists" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === "boards" ? "items" : "boards")}
                className="p-2 lulo-hover rounded-lg"
              >
                {viewMode === "boards" ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </Button>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedFilter === "all" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setSelectedFilter("collaborative")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedFilter === "collaborative" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Collaborative
                </button>
                <button 
                  onClick={() => setSelectedFilter("secret")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedFilter === "secret" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Secret
                </button>
                <button 
                  onClick={() => setSelectedFilter("archived")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedFilter === "archived" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Archived
                </button>
              </div>
            </>
          )}
          {selectedTab === "closet" && (
            <>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedSubTab("ootd")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedSubTab === "ootd" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  OOTD
                </button>
                <button 
                  onClick={() => setSelectedSubTab("my-items")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedSubTab === "my-items" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  My Items
                </button>
                <button 
                  onClick={() => setSelectedSubTab("collections")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedSubTab === "collections" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Collections
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 lulo-hover rounded-lg"
              >
                {selectedSubTab === "ootd" ? <Camera className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </Button>
            </>
          )}
          {selectedTab === "lookboards" && (
            <>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedFilter === "all" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  ALL
                </button>
                <button 
                  onClick={() => setSelectedFilter("collections")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedFilter === "collections" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Collections
                </button>
                <button 
                  onClick={() => setSelectedFilter("archived")}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedFilter === "archived" 
                      ? "bg-[#FADADD] text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Archived
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 lulo-hover rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lulo-gray" />
          <Input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:ring-2 focus:ring-[#FADADD] focus:bg-white"
          />
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex-1 bg-white">
        {selectedTab === "wishlists" && (
          <div className="p-4">
            {viewMode === "boards" ? (
              <div className="grid grid-cols-2 gap-4">
                {mockWishlistBoards.map((board) => (
                  <div 
                    key={board.id} 
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="liquid-glass rounded-lg overflow-hidden group-hover:liquid-glass-hover transition-all duration-300">
                      <div className="relative">
                        {/* Image Collage */}
                        <div className="grid grid-cols-2 gap-1 p-2">
                          <img
                            src={board.imageCollage[0]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={board.imageCollage[1]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={board.imageCollage[2]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={board.imageCollage[3]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Lock Icon for Private Boards */}
                        {board.isPrivate && (
                          <div className="absolute top-2 left-2">
                            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm text-lulo-dark group-hover:text-gray-900 transition-colors">{board.name}</h3>
                          {board.isPrivate && (
                            <Badge variant="secondary" className="text-xs">
                              Secret
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-lulo-gray mt-1 group-hover:text-gray-700 transition-colors">{board.itemCount} Pins</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mockWishlistBoards.flatMap(board => 
                  board.imageCollage.map((image, index) => (
                    <div key={`${board.id}-${index}`} className="relative">
                      <img
                        src={image}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {selectedTab === "closet" && (
          <div className="p-4">
            {selectedSubTab === "ootd" && (
              <div className="grid grid-cols-3 gap-2">
                {mockClosetOOTD.map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.caption}
                      className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg" />
                  </div>
                ))}
              </div>
            )}
            
            {selectedSubTab === "my-items" && (
              <div className="grid grid-cols-2 gap-4">
                {mockClosetCategories.map((category, index) => (
                  <div key={index} className="liquid-glass rounded-lg overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-lulo-dark group-hover:text-gray-900 transition-colors">{category.name}</h3>
                      <p className="text-xs text-lulo-gray mt-1 group-hover:text-gray-700 transition-colors">{category.count} items</p>
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
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="liquid-glass rounded-lg overflow-hidden group-hover:liquid-glass-hover transition-all duration-300">
                      <div className="relative">
                        {/* Image Collage */}
                        <div className="grid grid-cols-2 gap-1 p-2">
                          <img
                            src={collection.imageCollage[0]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={collection.imageCollage[1]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={collection.imageCollage[2]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={collection.imageCollage[3]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-lulo-dark group-hover:text-gray-900 transition-colors">{collection.name}</h3>
                        <p className="text-xs text-lulo-gray mt-1 group-hover:text-gray-700 transition-colors">{collection.itemCount} items</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === "lookboards" && (
          <div className="p-4">
            {selectedFilter === "all" && (
              <div className="grid grid-cols-2 gap-4">
                {mockIndividualLookboards.filter(lookboard => !lookboard.isArchived).map((lookboard) => (
                  <div 
                    key={lookboard.id} 
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="liquid-glass rounded-lg overflow-hidden group-hover:liquid-glass-hover transition-all duration-300">
                      <div className="relative">
                        {/* Image Collage */}
                        <div className="grid grid-cols-2 gap-1 p-2">
                          <img
                            src={lookboard.imageCollage[0]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={lookboard.imageCollage[1]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={lookboard.imageCollage[2]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={lookboard.imageCollage[3]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Lock Icon for Private Lookboards */}
                        {lookboard.isPrivate && (
                          <div className="absolute top-2 left-2">
                            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm text-lulo-dark group-hover:text-gray-900 transition-colors">{lookboard.name}</h3>
                          {lookboard.isPrivate && (
                            <Badge variant="secondary" className="text-xs">
                              Secret
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-lulo-gray mt-1 group-hover:text-gray-700 transition-colors">{lookboard.itemCount} items</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedFilter === "collections" && (
              <div className="grid grid-cols-2 gap-4">
                {mockLookboardCollections.map((collection) => (
                  <div 
                    key={collection.id} 
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="liquid-glass rounded-lg overflow-hidden group-hover:liquid-glass-hover transition-all duration-300">
                      <div className="relative">
                        {/* Miniature Lookboards */}
                        <div className="grid grid-cols-2 gap-1 p-2">
                          {collection.miniatureLookboards.slice(0, 4).map((lookboard, index) => (
                            <div key={lookboard.id} className="relative">
                              <div className="grid grid-cols-2 gap-0.5">
                                <img
                                  src={lookboard.imageCollage[0]}
                                  alt=""
                                  className="w-full h-8 object-cover rounded-sm group-hover:scale-105 transition-transform duration-300"
                                />
                                <img
                                  src={lookboard.imageCollage[1]}
                                  alt=""
                                  className="w-full h-8 object-cover rounded-sm group-hover:scale-105 transition-transform duration-300"
                                />
                                <img
                                  src={lookboard.imageCollage[2]}
                                  alt=""
                                  className="w-full h-8 object-cover rounded-sm group-hover:scale-105 transition-transform duration-300"
                                />
                                <img
                                  src={lookboard.imageCollage[3]}
                                  alt=""
                                  className="w-full h-8 object-cover rounded-sm group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-lulo-dark group-hover:text-gray-900 transition-colors">{collection.name}</h3>
                        <p className="text-xs text-lulo-gray mt-1 group-hover:text-gray-700 transition-colors">{collection.lookboardCount} lookboards</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedFilter === "archived" && (
              <div className="grid grid-cols-2 gap-4">
                {mockIndividualLookboards.filter(lookboard => lookboard.isArchived).map((lookboard) => (
                  <div 
                    key={lookboard.id} 
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="liquid-glass rounded-lg overflow-hidden group-hover:liquid-glass-hover transition-all duration-300">
                      <div className="relative">
                        {/* Image Collage */}
                        <div className="grid grid-cols-2 gap-1 p-2">
                          <img
                            src={lookboard.imageCollage[0]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={lookboard.imageCollage[1]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={lookboard.imageCollage[2]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <img
                            src={lookboard.imageCollage[3]}
                            alt=""
                            className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-lulo-dark group-hover:text-gray-900 transition-colors">{lookboard.name}</h3>
                        <p className="text-xs text-lulo-gray mt-1 group-hover:text-gray-700 transition-colors">{lookboard.itemCount} items</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 