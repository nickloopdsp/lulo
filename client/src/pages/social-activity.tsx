import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search, ChevronDown, MoreHorizontal, MapPin, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LuloWordmark } from "@/components/lulo-icon";

interface User {
  id: string;
  username: string;
  displayName: string;
  location: string;
  avatar: string;
  isVerified: boolean;
  isFollowing: boolean;
}

export default function SocialActivity() {
  const [location, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("friends");
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [friendsSubTab, setFriendsSubTab] = useState("following");

  // Mock style icons/influencers data
  const mockIcons: User[] = [
    {
      id: "1",
      username: "rhode",
      displayName: "rhode skin",
      location: "Los Angeles, CA, USA",
      avatar: "/api/placeholder/50/50",
      isVerified: true,
      isFollowing: true
    },
    {
      id: "2", 
      username: "owen.han",
      displayName: "Owen Han",
      location: "San Francisco, CA, USA",
      avatar: "/api/placeholder/50/50",
      isVerified: true,
      isFollowing: true
    },
    {
      id: "3",
      username: "atfrenchies", 
      displayName: "AT Frenchies",
      location: "Marseille, France",
      avatar: "/api/placeholder/50/50",
      isVerified: true,
      isFollowing: true
    },
    {
      id: "4",
      username: "nicksent",
      displayName: "Nick", 
      location: "Paris, France",
      avatar: "/api/placeholder/50/50",
      isVerified: true,
      isFollowing: true
    }
  ];

  // Mock friends data (followers and following)
  const mockFollowers: User[] = [
    {
      id: "f1",
      username: "styleenthusiast22",
      displayName: "Emma Style",
      location: "New York, NY, USA",
      avatar: "/api/placeholder/50/50",
      isVerified: false,
      isFollowing: false
    },
    {
      id: "f2",
      username: "fashionista_jo",
      displayName: "Jordan Kim",
      location: "Seoul, South Korea",
      avatar: "/api/placeholder/50/50",
      isVerified: false,
      isFollowing: true
    },
    {
      id: "f3",
      username: "trendsettermax",
      displayName: "Max Chen",
      location: "Toronto, Canada",
      avatar: "/api/placeholder/50/50",
      isVerified: false,
      isFollowing: false
    }
  ];

  const mockFollowing: User[] = [
    {
      id: "5",
      username: "isabelherrera___",
      displayName: "Isa",
      location: "Palm Beach, FL, USA", 
      avatar: "/api/placeholder/50/50",
      isVerified: false,
      isFollowing: true
    },
    {
      id: "6",
      username: "marilunazz",
      displayName: "Mariana Luna 🌙",
      location: "New York, NY, USA",
      avatar: "/api/placeholder/50/50", 
      isVerified: false,
      isFollowing: true
    },
    {
      id: "7",
      username: "julixperez",
      displayName: "Juli",
      location: "Mexico City, Mexico",
      avatar: "/api/placeholder/50/50",
      isVerified: false,
      isFollowing: true
    },
    {
      id: "8", 
      username: "rhenaoj",
      displayName: "Roxana",
      location: "Bogota, Colombia",
      avatar: "/api/placeholder/50/50",
      isVerified: false,
      isFollowing: true
    }
  ];

  // All users for search
  const allUsers = [...mockIcons, ...mockFollowers, ...mockFollowing];

  const filteredUsers = allUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserRow = ({ user }: { user: User }) => {
    const handleProfileClick = () => {
      navigate(`/user/${user.id}`);
    };

    return (
      <div className="flex items-center justify-between py-3 px-4">
        <div 
          className="flex items-center space-x-3 flex-1 cursor-pointer" 
          onClick={handleProfileClick}
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback className="bg-lulo-light-gray text-lulo-gray">
              {user.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-lulo-dark text-sm">
                {user.username}
              </span>
              {user.isVerified && (
                <div className="w-4 h-4 bg-lulo-coral rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <p className="text-lulo-dark text-sm">{user.displayName}</p>
            <div className="flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3 h-3 text-lulo-gray" />
              <span className="text-lulo-gray text-xs">{user.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={user.isFollowing ? "outline" : "default"}
            size="sm" 
            className={`text-xs px-3 py-1 h-7 ${
              user.isFollowing 
                ? "border-lulo-border" 
                : "bg-lulo-dark text-white hover:bg-lulo-dark/90"
            }`}
          >
            {user.isFollowing ? "Following" : "Follow"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4 text-lulo-gray" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Unfollow</DropdownMenuItem>
              <DropdownMenuItem>Block</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="mobile-main bg-white">
      {/* Logo Header */}
      <div className="bg-white border-b border-lulo-border sticky top-0 z-50">
        <div className="flex items-center justify-start px-4 py-3">
          <LuloWordmark 
            iconSize={20} 
            textSize="text-lg" 
            color="hsl(240, 12%, 11%)"
            className="text-lulo-dark"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white h-12 rounded-none border-b border-lulo-border">
            <TabsTrigger 
              value="friends" 
              className="text-lulo-gray data-[state=active]:text-lulo-dark data-[state=active]:border-b-2 data-[state=active]:border-lulo-dark rounded-none bg-transparent"
            >
              Friends
            </TabsTrigger>
            <TabsTrigger 
              value="icons"
              className="text-lulo-gray data-[state=active]:text-lulo-dark data-[state=active]:border-b-2 data-[state=active]:border-lulo-dark rounded-none bg-transparent"
            >
              Icons
            </TabsTrigger>
            <TabsTrigger 
              value="search"
              className="text-lulo-gray data-[state=active]:text-lulo-dark data-[state=active]:border-b-2 data-[state=active]:border-lulo-dark rounded-none bg-transparent"
            >
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-0">
            {/* Friends Stats Section */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-lulo-border">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-lg font-semibold text-lulo-dark">{mockFollowers.length}</div>
                  <div className="text-sm text-lulo-gray">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-lulo-dark">{mockFollowing.length}</div>
                  <div className="text-sm text-lulo-gray">Following</div>
                </div>
              </div>
            </div>

            {/* Friends Sub-tabs */}
            <div className="bg-white">
              <Tabs value={friendsSubTab} onValueChange={setFriendsSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white h-12 rounded-none border-b border-lulo-border">
                  <TabsTrigger 
                    value="followers" 
                    className="text-lulo-gray data-[state=active]:text-lulo-dark data-[state=active]:border-b-2 data-[state=active]:border-lulo-dark rounded-none bg-transparent"
                  >
                    Followers
                  </TabsTrigger>
                  <TabsTrigger 
                    value="following"
                    className="text-lulo-gray data-[state=active]:text-lulo-dark data-[state=active]:border-b-2 data-[state=active]:border-lulo-dark rounded-none bg-transparent"
                  >
                    Following
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="followers" className="mt-0">
                  <div className="divide-y divide-lulo-border">
                    {mockFollowers.map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="following" className="mt-0">
                  <div className="divide-y divide-lulo-border">
                    {mockFollowing.map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="icons" className="mt-0">
            {/* Stats Section */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-lulo-border">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-lg font-semibold text-lulo-dark">1,395</div>
                  <div className="text-sm text-lulo-gray">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-lulo-dark">{mockIcons.length}</div>
                  <div className="text-sm text-lulo-gray">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-lulo-gray">Subscriptions</div>
                </div>
              </div>
            </div>

            {/* Sort Section */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-lulo-border">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-lulo-gray">Sort by</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-sm text-lulo-dark p-0 h-auto">
                      Default
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy("default")}>
                      Default
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                      Alphabetical
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("recent")}>
                      Most Recent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-lulo-medium-gray rounded-full"></div>
                <div className="w-1 h-1 bg-lulo-medium-gray rounded-full"></div>
                <div className="w-1 h-1 bg-lulo-medium-gray rounded-full"></div>
                <div className="w-1 h-1 bg-lulo-medium-gray rounded-full"></div>
              </div>
            </div>

            {/* Icons List */}
            <div className="divide-y divide-lulo-border">
              {mockIcons.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="search" className="mt-0">
            {/* Search Input */}
            <div className="p-4 border-b border-lulo-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lulo-gray w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-lulo-border"
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="divide-y divide-lulo-border">
              {searchQuery.length > 0 ? (
                filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))
                ) : (
                  <div className="p-4 text-center text-lulo-gray">
                    No users found for "{searchQuery}"
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-lulo-gray">
                  Start typing to search for users
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}