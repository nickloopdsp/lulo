import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Share, MoreHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Mock wishlist items
  const mockWishlistItems = [
    {
      id: 1,
      title: "DISTRC",
      image: "/api/placeholder/200/250",
      type: "wishlist"
    },
    {
      id: 2,
      title: "Summer Collection",
      image: "/api/placeholder/200/300",
      type: "wishlist"
    },
    {
      id: 3,
      title: "Beach Vibes",
      image: "/api/placeholder/200/280",
      type: "wishlist"
    },
    {
      id: 4,
      title: "Nature Escape",
      image: "/api/placeholder/200/320",
      type: "wishlist"
    }
  ];

  // Mock closet items
  const mockClosetItems = [
    {
      id: 1,
      title: "Vintage Denim",
      image: "/api/placeholder/200/260",
      brand: "Levi's",
      price: "$89"
    },
    {
      id: 2,
      title: "White Tee",
      image: "/api/placeholder/200/290",
      brand: "Everlane",
      price: "$35"
    },
    {
      id: 3,
      title: "Summer Dress",
      image: "/api/placeholder/200/310",
      brand: "Zara",
      price: "$59"
    },
    {
      id: 4,
      title: "Sneakers",
      image: "/api/placeholder/200/270",
      brand: "Nike",
      price: "$120"
    }
  ];

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
            <span>{mockUserData.luloCount} Lulos</span>
            <span className="text-lulo-gray">|</span>
            <span>{mockUserData.followingCount} following</span>
            <span className="text-lulo-gray">|</span>
            <span>{mockUserData.wishlistCount} Wishlists</span>
          </div>

          {/* Follow Button */}
          <Button
            onClick={handleFollowToggle}
            className={`px-8 py-2 rounded-full font-medium transition-colors ${
              isFollowing
                ? "bg-lulo-light-gray text-lulo-dark hover:bg-lulo-medium-gray"
                : "bg-lulo-coral text-white hover:bg-lulo-coral/90"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mt-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border-b border-lulo-border rounded-none">
            <TabsTrigger 
              value="wishlists"
              className="text-lulo-gray data-[state=active]:text-lulo-dark data-[state=active]:border-b-2 data-[state=active]:border-lulo-dark rounded-none bg-transparent"
            >
              Wishlists
            </TabsTrigger>
            <TabsTrigger 
              value="closet"
              className="text-lulo-gray data-[state=active]:text-lulo-dark data-[state=active]:border-b-2 data-[state=active]:border-lulo-dark rounded-none bg-transparent"
            >
              Closet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlists" className="mt-0">
            <div className="grid grid-cols-2 gap-3 p-4">
              {mockWishlistItems.map((item) => (
                <div key={item.id} className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg p-3">
                    <h3 className="text-white font-medium text-sm">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="closet" className="mt-0">
            <div className="grid grid-cols-2 gap-3 p-4">
              {mockClosetItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-lulo-border">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-medium text-lulo-dark text-sm mb-1">{item.title}</h3>
                    <p className="text-lulo-gray text-xs mb-1">{item.brand}</p>
                    <p className="text-lulo-dark font-medium text-sm">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 