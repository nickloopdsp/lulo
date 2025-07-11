import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Settings, LogOut, Users, Heart, ShoppingBag, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/bottom-navigation";

export default function Profile() {
  const { user } = useAuth();

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["/api/wishlist"],
  });

  const { data: closetItems = [] } = useQuery({
    queryKey: ["/api/closet"],
  });

  if (!user) return null;

  return (
    <div className="mobile-app-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Edit className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        {/* Profile Info */}
        <section className="px-4 py-6 bg-white border-b border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
              <AvatarFallback className="text-lg">
                {user.firstName?.[0] || user.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              {user.bio && (
                <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-lulo-pink">{wishlistItems.length}</div>
              <div className="text-xs text-gray-600">Wishlist</div>
            </div>
            <div>
              <div className="text-lg font-bold text-lulo-sage">{closetItems.length}</div>
              <div className="text-xs text-gray-600">Closet</div>
            </div>
            <div>
              <div className="text-lg font-bold text-lulo-coral">0</div>
              <div className="text-xs text-gray-600">Followers</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 py-4">
          <div className="space-y-3">
            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-lulo-pink rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">My Wishlist</p>
                      <p className="text-sm text-gray-500">{wishlistItems.length} items</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-lulo-sage rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">My Closet</p>
                      <p className="text-sm text-gray-500">{closetItems.length} items</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-lulo-coral rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Friends</p>
                      <p className="text-sm text-gray-500">Connect with friends</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Settings */}
        <section className="px-4 py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
          <div className="space-y-3">
            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Privacy Settings</p>
                    <p className="text-sm text-gray-500">Control who can see your profile</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-500">Manage your notification preferences</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    On
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-4">
                <button
                  onClick={() => {
                    window.location.href = "/api/logout";
                  }}
                  className="flex items-center space-x-3 w-full text-left"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-red-600">Sign Out</p>
                    <p className="text-sm text-gray-500">Sign out of your account</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
