import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Star, Trophy, Target, Gift, Crown, Zap, 
  Heart, Users, ShoppingBag, Camera, Share2, 
  Award, Medal, Sparkles, TrendingUp, Calendar
} from "lucide-react";
import { LuloIcon } from "@/components/lulo-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LuloPointsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  earned: boolean;
  earnedDate?: string;
}

export default function LuloPoints({ open, onOpenChange }: LuloPointsProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: pointsData } = useQuery({
    queryKey: ["/api/points"],
    enabled: open,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: open,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["/api/badges"],
    enabled: open,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
    enabled: open,
  });

  const mockAchievements: Achievement[] = [
    {
      id: "first_wishlist",
      title: "First Wish",
      description: "Add your first item to wishlist",
      icon: Heart,
      points: 50,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      category: "wishlist",
      rarity: "common"
    },
    {
      id: "social_butterfly",
      title: "Social Butterfly",
      description: "Follow 10 friends",
      icon: Users,
      points: 200,
      unlocked: false,
      progress: 3,
      maxProgress: 10,
      category: "social",
      rarity: "rare"
    },
    {
      id: "style_curator",
      title: "Style Curator",
      description: "Create 5 lookbooks",
      icon: Camera,
      points: 300,
      unlocked: false,
      progress: 2,
      maxProgress: 5,
      category: "lookbooks",
      rarity: "epic"
    },
    {
      id: "trendsetter",
      title: "Trendsetter",
      description: "Get 100 likes on your items",
      icon: TrendingUp,
      points: 500,
      unlocked: false,
      progress: 23,
      maxProgress: 100,
      category: "social",
      rarity: "legendary"
    }
  ];

  const mockBadges: Badge[] = [
    {
      id: "early_adopter",
      name: "Early Adopter",
      description: "Joined Lulo in the first month",
      icon: Star,
      color: "bg-yellow-500",
      earned: true,
      earnedDate: "2024-01-15"
    },
    {
      id: "fashion_maven",
      name: "Fashion Maven",
      description: "Added 50+ items to wishlist",
      icon: Crown,
      color: "bg-purple-500",
      earned: false
    },
    {
      id: "community_builder",
      name: "Community Builder",
      description: "Helped 5 friends discover new items",
      icon: Users,
      color: "bg-blue-500",
      earned: false
    }
  ];

  const currentPoints = (pointsData as any)?.totalPoints || 0;
  const currentLevel = Math.floor(currentPoints / 1000) + 1;
  const pointsToNextLevel = 1000 - (currentPoints % 1000);
  const levelProgress = (currentPoints % 1000) / 1000 * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl mx-4 rounded-xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center space-x-2">
            <LuloIcon size={20} color="hsl(0, 45%, 65%)" />
            <span>Lulo Points & Achievements</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="h-full flex flex-col">
          {/* Points Overview */}
          <div className="bg-gradient-to-r from-lulo-pink to-lulo-coral rounded-lg p-6 mb-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{currentPoints.toLocaleString()} Points</h2>
                <p className="text-sm opacity-90">Level {currentLevel} Fashion Enthusiast</p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                  <Crown className="w-8 h-8" />
                </div>
                <p className="text-xs opacity-90">Next Level</p>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress to Level {currentLevel + 1}</span>
                <span>{pointsToNextLevel} points to go</span>
              </div>
              <Progress value={levelProgress} className="h-2 bg-white bg-opacity-20" />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="h-full overflow-y-auto">
              <div className="space-y-4">
                {/* Point Earning Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-lulo-coral" />
                      <span>Earn Points</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Heart className="w-6 h-6 text-lulo-pink" />
                        <div>
                          <p className="font-medium text-sm">Add to Wishlist</p>
                          <p className="text-xs text-gray-600">+10 points</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Camera className="w-6 h-6 text-lulo-coral" />
                        <div>
                          <p className="font-medium text-sm">Create Lookbook</p>
                          <p className="text-xs text-gray-600">+50 points</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="w-6 h-6 text-lulo-sage" />
                        <div>
                          <p className="font-medium text-sm">Follow Friend</p>
                          <p className="text-xs text-gray-600">+25 points</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Share2 className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">Share Item</p>
                          <p className="text-xs text-gray-600">+15 points</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-lulo-pink" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: "Added item to wishlist", points: 10, time: "2 hours ago" },
                        { action: "Created lookbook", points: 50, time: "1 day ago" },
                        { action: "Followed new friend", points: 25, time: "2 days ago" },
                        { action: "Shared item", points: 15, time: "3 days ago" }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{activity.action}</p>
                            <p className="text-xs text-gray-600">{activity.time}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-lulo-coral" />
                            <span className="font-medium text-sm">+{activity.points}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="h-full overflow-y-auto">
              <div className="space-y-4">
                {mockAchievements.map((achievement) => (
                  <Card key={achievement.id} className={`${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                            <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          
                          {!achievement.unlocked && (
                            <div className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                              </div>
                              <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-lulo-coral" />
                            <span className="font-medium">{achievement.points}</span>
                          </div>
                          {achievement.unlocked && (
                            <Badge className="bg-green-500 text-white text-xs mt-1">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="badges" className="h-full overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {mockBadges.map((badge) => (
                  <Card key={badge.id} className={`${badge.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}>
                    <CardContent className="p-4 text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        badge.earned ? badge.color : 'bg-gray-300'
                      }`}>
                        <badge.icon className={`w-8 h-8 ${badge.earned ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                      
                      {badge.earned ? (
                        <div>
                          <Badge className="bg-yellow-500 text-white text-xs mb-1">
                            Earned
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {badge.earnedDate && new Date(badge.earnedDate).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Not Earned
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="leaderboard" className="h-full overflow-y-auto">
              <div className="space-y-3">
                {[
                  { rank: 1, name: "Emma Style", points: 12450, avatar: "E" },
                  { rank: 2, name: "Sofia Fashion", points: 11200, avatar: "S" },
                  { rank: 3, name: "Maya Trends", points: 10800, avatar: "M" },
                  { rank: 4, name: "You", points: currentPoints, avatar: "Y", isCurrentUser: true },
                  { rank: 5, name: "Zoe Chic", points: 8900, avatar: "Z" }
                ].map((user) => (
                  <Card key={user.rank} className={`${user.isCurrentUser ? 'bg-lulo-pink bg-opacity-10 border-lulo-pink' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            user.rank === 1 ? 'bg-yellow-500' :
                            user.rank === 2 ? 'bg-gray-400' :
                            user.rank === 3 ? 'bg-orange-500' :
                            'bg-lulo-coral'
                          }`}>
                            {user.rank <= 3 ? (
                              <Trophy className="w-4 h-4" />
                            ) : (
                              user.rank
                            )}
                          </div>
                          <div className="w-10 h-10 bg-lulo-sage rounded-full flex items-center justify-center text-white font-bold">
                            {user.avatar}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-lulo-coral" />
                            <span className="text-sm text-gray-600">{user.points.toLocaleString()} points</span>
                          </div>
                        </div>
                        
                        {user.rank <= 3 && (
                          <Medal className={`w-6 h-6 ${
                            user.rank === 1 ? 'text-yellow-500' :
                            user.rank === 2 ? 'text-gray-400' :
                            'text-orange-500'
                          }`} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 