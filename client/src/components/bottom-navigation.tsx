import { useLocation } from "wouter";
import { Rss, Users, ShoppingBag, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LuloIcon } from "@/components/lulo-icon";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { 
      icon: Rss, 
      label: "Newsfeed", 
      path: "/newsfeed",
      type: "icon"
    },
    { 
      icon: Users, 
      label: "Boardroom", 
      path: "/boardroom",
      type: "icon"
    },
    { 
      icon: null, 
      label: "Upload", 
      path: "/upload",
      type: "home-circle"
    },
    { 
      icon: ShoppingBag, 
      label: "Shopping Space", 
      path: "/shopping",
      type: "icon"
    },
    { 
      icon: null, 
      label: "Your Profile", 
      path: "/profile",
      type: "avatar"
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-lulo-border py-2 z-50">
      <div className="flex items-center justify-around px-4">
        {navItems.map((item, index) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          if (item.type === "home-circle") {
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center space-y-1 py-2 relative"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive 
                    ? "bg-lulo-dark" 
                    : "border-2 border-lulo-gray"
                }`}>
                  <LuloIcon 
                    size={20} 
                    color={isActive ? "white" : "hsl(240, 8%, 46%)"} 
                  />
                </div>
              </Button>
            );
          }
          
          if (item.type === "avatar") {
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center space-y-1 py-2"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback className="bg-lulo-light-gray text-lulo-dark text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            );
          }
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center space-y-1 py-2 relative"
            >
              <div className="relative">
                {Icon && (
                  <Icon className={`w-6 h-6 ${
                    isActive ? "text-lulo-dark" : "text-lulo-gray"
                  }`} />
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
