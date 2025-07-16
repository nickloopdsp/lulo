import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, UserPlus, UserCheck, Heart, MessageCircle, Share2, 
  Search, Filter, Star, Crown, Gift, MapPin, Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SocialNetworkProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  itemsCount: number;
  luloPoints: number;
  isFollowing: boolean;
  mutualFollowers: number;
  location?: string;
  joinedDate: string;
}

export default function SocialNetwork({ open, onOpenChange }: SocialNetworkProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Fetch social data
  const { data: followers = [], isLoading: followersLoading } = useQuery({
    queryKey: ["/api/social/followers"],
    enabled: open,
  });

  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: ["/api/social/following"],
    enabled: open,
  });

  const { data: suggested = [], isLoading: suggestedLoading } = useQuery({
    queryKey: ["/api/social/suggested"],
    enabled: open,
  });

  const { data: socialStats = {} } = useQuery({
    queryKey: ["/api/social/stats"],
    enabled: open,
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ["/api/social/search", searchQuery],
    enabled: open && searchQuery.length > 2,
  });

  // Follow/Unfollow mutations
  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/social/follow/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Following user!",
        description: "You're now following this user.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social"] });
    },
    onError: (error) => {
      toast({
        title: "Error following user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/social/follow/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Unfollowed user",
        description: "You're no longer following this user.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social"] });
    },
    onError: (error) => {
      toast({
        title: "Error unfollowing user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFollowToggle = (user: User) => {
    if (user.isFollowing) {
      unfollowMutation.mutate(user.id);
    } else {
      followMutation.mutate(user.id);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const UserCard = ({ user, showFollowButton = true }: { user: User; showFollowButton?: boolean }) => (
    <Card className="card-shadow hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="bg-lulo-pink text-white">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 
                className="font-semibold text-sm text-gray-900 truncate cursor-pointer hover:text-lulo-pink"
                onClick={() => handleUserClick(user)}
              >
                {user.firstName} {user.lastName}
              </h3>
              {user.luloPoints > 500 && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            
            <p className="text-xs text-gray-500 truncate">{user.bio || "Fashion enthusiast"}</p>
            
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{user.followersCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{user.itemsCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-lulo-coral" />
                <span className="text-xs text-gray-600">{user.luloPoints}</span>
              </div>
            </div>
            
            {user.mutualFollowers > 0 && (
              <p className="text-xs text-lulo-pink mt-1">
                {user.mutualFollowers} mutual followers
              </p>
            )}
          </div>
          
          {showFollowButton && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleFollowToggle(user);
              }}
              size="sm"
              variant={user.isFollowing ? "outline" : "default"}
              className={user.isFollowing ? "" : "bg-lulo-pink hover:bg-lulo-coral text-white"}
              disabled={followMutation.isPending || unfollowMutation.isPending}
            >
              {user.isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl mx-4 rounded-xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center">Social Network</DialogTitle>
        </DialogHeader>
        
        <div className="h-full flex flex-col">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                         <div className="text-center">
               <div className="text-2xl font-bold text-lulo-coral">
                 {(socialStats as any)?.followersCount || 0}
               </div>
               <div className="text-xs text-gray-600">Followers</div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-lulo-pink">
                 {(socialStats as any)?.followingCount || 0}
               </div>
               <div className="text-xs text-gray-600">Following</div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-lulo-sage">
                 {(socialStats as any)?.luloPoints || 0}
               </div>
               <div className="text-xs text-gray-600">Lulo Points</div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-gray-700">
                 {(socialStats as any)?.friendCircles || 0}
               </div>
               <div className="text-xs text-gray-600">Friend Circles</div>
             </div>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="following">Following</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="suggested">Suggested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="discover" className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="followers">Followers</TabsTrigger>
                <TabsTrigger value="circles">Circles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="discover" className="h-full overflow-y-auto">
                <div className="space-y-4">
                  {searchQuery.length > 2 ? (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Search Results</h3>
                      {searchLoading ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(searchResults as User[]).map((user) => (
                            <UserCard key={user.id} user={user} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Suggested for You</h3>
                      {suggestedLoading ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(suggested as User[]).map((user) => (
                            <UserCard key={user.id} user={user} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="following" className="h-full overflow-y-auto">
                <div className="space-y-3">
                  {followingLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    (following as User[]).map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="followers" className="h-full overflow-y-auto">
                <div className="space-y-3">
                  {followersLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    (followers as User[]).map((user) => (
                      <UserCard key={user.id} user={user} showFollowButton={false} />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="circles" className="h-full overflow-y-auto">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Friend Circles</h3>
                  <p className="text-gray-600 mb-4">
                    Create custom groups of friends for sharing specific items and recommendations
                  </p>
                  <Button className="bg-lulo-coral hover:bg-lulo-coral/90 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Your First Circle
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>

      {/* User Profile Modal */}
      {selectedUser && (
        <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
          <DialogContent className="max-w-md mx-4 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-center">User Profile</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={selectedUser.profileImageUrl} alt={`${selectedUser.firstName} ${selectedUser.lastName}`} />
                  <AvatarFallback className="bg-lulo-pink text-white text-xl">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  {selectedUser.luloPoints > 500 && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">{selectedUser.bio || "Fashion enthusiast"}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-lulo-coral">{selectedUser.followersCount}</div>
                    <div className="text-xs text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-lulo-pink">{selectedUser.followingCount}</div>
                    <div className="text-xs text-gray-600">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-lulo-sage">{selectedUser.luloPoints}</div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                  {selectedUser.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {selectedUser.joinedDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleFollowToggle(selectedUser)}
                  className={`flex-1 ${
                    selectedUser.isFollowing 
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                      : "bg-lulo-pink hover:bg-lulo-coral text-white"
                  }`}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                  {selectedUser.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" className="px-3">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="px-3">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
} 