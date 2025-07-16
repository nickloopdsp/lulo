import { useLocation } from "wouter";
import { LuloWordmark } from "@/components/lulo-icon";

export default function TopNavigation() {
  const [location, navigate] = useLocation();
  
  const navTabs = [
    { label: "Wishlists", path: "/wishlist" },
    { label: "Closet", path: "/closet" },
    { label: "Lookbooks", path: "/lookbooks" },
  ];

  const getTabStyle = (path: string) => {
    const isActive = location === path;
    return `px-4 py-2 text-sm font-medium transition-colors ${
      isActive 
        ? "text-lulo-dark border-b-2 border-lulo-dark" 
        : "text-lulo-gray hover:text-lulo-dark"
    }`;
  };

  return (
    <div className="bg-white border-b border-lulo-border sticky top-0 z-50">
      {/* Top bar with logo on left */}
      <div className="flex items-center justify-start px-4 py-3">
        <LuloWordmark 
          iconSize={20} 
          textSize="text-lg" 
          color="hsl(240, 12%, 11%)"
          className="text-lulo-dark"
        />
      </div>
      
      {/* Navigation tabs */}
      <nav className="flex items-center justify-center space-x-8">
        {navTabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={getTabStyle(tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
} 