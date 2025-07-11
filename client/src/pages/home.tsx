import { useQuery } from "@tanstack/react-query";
import { Heart, Plus, Bell, Search, ShoppingBag, User, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNavigation from "@/components/bottom-navigation";
import ItemCard from "@/components/item-card";
import AddItemModal from "@/components/add-item-modal";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: trendingItems = [], isLoading: loadingTrending } = useQuery({
    queryKey: ["/api/items/trending"],
  });

  const { data: feedActivity = [], isLoading: loadingFeed } = useQuery({
    queryKey: ["/api/feed"],
  });

  if (!user) return null;

  return (
    <div className="mobile-app-container bg-lulo-cream">
      {/* Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-lulo-pink rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Lulo</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-lulo-coral rounded-full"></span>
            </button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
              <AvatarFallback>{user.firstName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        {/* Stories Section */}
        <section className="px-4 py-4 bg-white border-b border-gray-100">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-full flex items-center justify-center mb-2">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-600">Your Story</span>
            </div>
            {/* Mock friends stories */}
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 ring-2 ring-lulo-pink rounded-full overflow-hidden mb-2">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
              </div>
              <span className="text-xs text-gray-600">Emma</span>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 ring-2 ring-lulo-sage rounded-full overflow-hidden mb-2">
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-500"></div>
              </div>
              <span className="text-xs text-gray-600">Sofia</span>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 ring-2 ring-lulo-coral rounded-full overflow-hidden mb-2">
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500"></div>
              </div>
              <span className="text-xs text-gray-600">Maya</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 py-4 bg-white border-b border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-lulo-pink hover:bg-lulo-coral text-white p-4 rounded-xl card-shadow h-auto">
              <Heart className="w-5 h-5 mr-2" />
              My Wishlist
            </Button>
            <Button className="bg-lulo-sage hover:bg-lulo-sage/90 text-white p-4 rounded-xl card-shadow h-auto">
              <ShoppingBag className="w-5 h-5 mr-2" />
              My Closet
            </Button>
          </div>
        </section>

        {/* Trending Section */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trending Now</h2>
            <button className="text-lulo-pink font-medium">See All</button>
          </div>
          
          {loadingTrending ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3 card-shadow animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {trendingItems.slice(0, 4).map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Friend Activity Feed */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Friend Activity</h2>
            <button className="text-lulo-pink font-medium">See All</button>
          </div>
          
          {loadingFeed ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 card-shadow animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : feedActivity.length > 0 ? (
            <div className="space-y-4">
              {feedActivity.map((activity: any, index: number) => (
                <div key={index} className="bg-white rounded-xl p-4 card-shadow animate-slide-up">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.user?.profileImageUrl || ""} alt={activity.user?.firstName || "User"} />
                      <AvatarFallback>{activity.user?.firstName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user?.firstName || "Someone"} added to their wishlist
                      </p>
                      <p className="text-xs text-lulo-gray">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {activity.item && (
                    <div className="mb-3">
                      <ItemCard item={activity.item} compact />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-lulo-pink" />
                        <span className="text-xs text-lulo-gray">12</span>
                      </button>
                    </div>
                    <button className="text-lulo-pink text-xs font-medium">
                      View Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No friend activity yet</p>
              <p className="text-sm text-gray-400">Follow friends to see their latest additions</p>
            </div>
          )}
        </section>

        {/* Style Icons Section */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Style Icons</h2>
            <button className="text-lulo-pink font-medium">See All</button>
          </div>
          <div className="flex space-x-3 overflow-x-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-full mx-auto mb-2 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-900">@styleicon{i + 1}</p>
                <p className="text-xs text-lulo-gray">1.2M followers</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-full shadow-lg flex items-center justify-center z-40 touch-feedback"
        onClick={() => setShowAddModal(true)}
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Add Item Modal */}
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
