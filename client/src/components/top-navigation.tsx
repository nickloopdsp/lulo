import { useLocation } from "wouter";
import { LuloWordmark } from "@/components/lulo-icon";

export default function TopNavigation() {
  const [location, navigate] = useLocation();
  
  const navTabs = [
    { label: "Wishlists", path: "/wishlist" },
    { label: "Closet", path: "/closet" },
    { label: "Lookboards", path: "/lookboards" },
  ];

  const getTabStyle = (isActive: boolean) => {
    if (isActive) {
      return "text-[#FADADD] border-b-2 border-[#FADADD] font-medium text-sm";
    }
    return "text-gray-500 hover:text-[#FADADD] hover:border-b-2 hover:border-[#FADADD]/50 transition-all duration-200 text-sm";
  };

  return (
    <div className="bg-white border-b border-lulo-border sticky top-0 z-50">
      {/* Navigation tabs only */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-2">
        <nav className="flex items-center justify-center space-x-8">
          {navTabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={getTabStyle(location === tab.path)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
} 