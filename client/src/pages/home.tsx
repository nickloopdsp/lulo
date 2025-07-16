import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingBag, Users, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/bottom-navigation";
import ItemCard from "@/components/item-card";
import SocialNetwork from "@/components/social-network";

export default function Home() {
  const [showSocialNetwork, setShowSocialNetwork] = useState(false);

  const { data: trendingItems = [], isLoading } = useQuery({
    queryKey: ["/api/items/trending"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="mobile-app-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to <span className="text-lulo-pink">Lulo</span>
          </h1>
          <p className="text-gray-600">
            Discover, collect, and share fashion finds with your community
          </p>
        </div>
      </header>

      <main className="mobile-main">
        {/* Quick Stats */}
        <section className="px-4 py-4 bg-gradient-to-r from-lulo-pink to-lulo-coral rounded-lg mx-4 mb-4 text-white">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{(stats as any)?.wishlistCount || 0}</div>
              <div className="text-xs opacity-90">Wishlist Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(stats as any)?.closetCount || 0}</div>
              <div className="text-xs opacity-90">Closet Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(stats as any)?.followersCount || 0}</div>
              <div className="text-xs opacity-90">Followers</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 mb-6">
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex-col h-20 space-y-2"
              onClick={() => setShowSocialNetwork(true)}
            >
              <Users className="w-6 h-6 text-lulo-pink" />
              <span className="text-xs">Social</span>
            </Button>
            <Button variant="outline" className="flex-col h-20 space-y-2">
              <Heart className="w-6 h-6 text-lulo-coral" />
              <span className="text-xs">Wishlist</span>
            </Button>
            <Button variant="outline" className="flex-col h-20 space-y-2">
              <ShoppingBag className="w-6 h-6 text-lulo-sage" />
              <span className="text-xs">Closet</span>
            </Button>
            <Button variant="outline" className="flex-col h-20 space-y-2">
              <TrendingUp className="w-6 h-6 text-gray-600" />
              <span className="text-xs">Trending</span>
            </Button>
          </div>
        </section>

        {/* Trending Items */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trending Now</h2>
            <Badge variant="secondary" className="bg-lulo-pink text-white">
              Hot
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 card-shadow animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {(trendingItems as any[]).slice(0, 4).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Social Activity Preview */}
        <section className="px-4 py-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-lulo-pink" />
                <span>Social Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Connect with friends and discover new fashion finds together
                </p>
                <Button 
                  onClick={() => setShowSocialNetwork(true)}
                  className="bg-lulo-pink hover:bg-lulo-coral text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Explore Social Network
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Social Network Modal */}
      <SocialNetwork 
        open={showSocialNetwork} 
        onOpenChange={setShowSocialNetwork}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
