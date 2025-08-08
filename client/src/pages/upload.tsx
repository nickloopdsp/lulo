import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// Lulo Fruit Icon Component with different colors
const LuloIcon = ({ color = "#FADADD", style }: { color?: string, style?: React.CSSProperties }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    {/* Main fruit circle */}
    <circle cx="20" cy="20" r="18" stroke={color} strokeWidth="3" fill="none" />
    {/* Stem */}
    <path
      d="M20 2 Q22 0 24 2"
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    {/* Seeds - 6 oval shapes arranged radially */}
    <ellipse cx="20" cy="12" rx="3" ry="1.5" fill={color} />
    <ellipse cx="20" cy="28" rx="3" ry="1.5" fill={color} />
    <ellipse cx="12" cy="20" rx="1.5" ry="3" fill={color} />
    <ellipse cx="28" cy="20" rx="1.5" ry="3" fill={color} />
    <ellipse cx="14" cy="14" rx="2" ry="1" fill={color} transform="rotate(45 14 14)" />
    <ellipse cx="26" cy="26" rx="2" ry="1" fill={color} transform="rotate(45 26 26)" />
  </svg>
);

// Color palette from the attached images
const luloColors = [
  "#FADADD", // Pink
  "#E6E6FA", // Light purple/lavender
  "#FDFDFD", // Creamy yellow/off-white
  "#DDA0DD", // Plum
  "#F0E68C", // Khaki yellow
  "#D8BFD8"  // Thistle purple
];

// Floating Icon Component with continuous movement
const FloatingIcon = ({ delay = 0 }: { delay?: number }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState(luloColors[0]);

  useEffect(() => {
    // Check if window is available (for SSR)
    if (typeof window === 'undefined') return;

    // Start from a random position within the visible area
    const startX = Math.random() * (window.innerWidth - 100);
    const startY = Math.random() * (window.innerHeight - 100);
    
    // Set simple, slow velocity for peaceful movement (3-5 seconds to cross screen)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Simple calculation: take 3-5 seconds to cross screen
    const crossTimeSeconds = 3 + Math.random() * 2; // 3-5 seconds
    const pixelsPerSecond = screenWidth / crossTimeSeconds;
    
    // Random direction (positive or negative)
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    
    const startVX = directionX * (pixelsPerSecond / 60); // Convert to pixels per frame (60fps)
    const startVY = directionY * (pixelsPerSecond / 60);
    
    setPosition({ x: startX, y: startY });
    setVelocity({ x: startVX, y: startVY });
    setColor(luloColors[Math.floor(Math.random() * luloColors.length)]);

    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVX = velocity.x;
        let newVY = velocity.y;

        // Bounce off edges with gentle speed reduction
        if (newX <= 0 || newX >= window.innerWidth - 100) {
          newVX = -newVX * 0.8; // Reduce speed by 20% on bounce
          newX = newX <= 0 ? 0 : window.innerWidth - 100;
        }
        if (newY <= 0 || newY >= window.innerHeight - 100) {
          newVY = -newVY * 0.8; // Reduce speed by 20% on bounce
          newY = newY <= 0 ? 0 : window.innerHeight - 100;
        }

        setVelocity({ x: newVX, y: newVY });
        return { x: newX, y: newY };
      });
    }, 16); // 60fps for smooth movement

    return () => clearInterval(interval);
  }, [delay]);

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        opacity: 0.4,
        zIndex: 1,
        transform: `rotate(${Math.sin(Date.now() * 0.0001) * 5}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <LuloIcon color={color} />
    </div>
  );
};

export default function UploadPage() {
  const [, navigate] = useLocation();

  const uploadOptions = [
    {
      id: "visual",
      label: "Visual Search",
      onClick: () => {
        navigate("/visual-search");
      },
      gradient: true
    },
    {
      id: "link",
      label: "Link Upload",
      onClick: () => {
        navigate("/link-upload");
      }
    },
    {
      id: "manual",
      label: "Manual Upload",
      onClick: () => {
        // TODO: Implement manual upload
        console.log("Manual upload clicked");
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
      {/* Animated Background Icons */}
      <FloatingIcon delay={0} />
      <FloatingIcon delay={1000} />
      <FloatingIcon delay={2000} />
      <FloatingIcon delay={3000} />
      <FloatingIcon delay={4000} />
      <FloatingIcon delay={5000} />
      <FloatingIcon delay={6000} />
      <FloatingIcon delay={7000} />

      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 py-4 border-b border-gray-100 relative z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2 lulo-hover rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-900">Lulo Search</h1>
          
          <div className="w-9" /> {/* Spacer for balance */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 pt-12 relative z-10">
        {/* Upload Options - Centered and Smaller */}
        <div className="flex flex-col items-center space-y-4 mb-16">
          {uploadOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.onClick}
              className={`w-64 py-3 rounded-2xl text-center font-medium transition-all duration-300 ${
                option.gradient
                  ? "glass-button-lulo bg-gradient-to-r from-pink-200 via-orange-200 to-yellow-200 hover:from-pink-300 hover:via-orange-300 hover:to-yellow-300 text-gray-800 hover:text-gray-900"
                  : "glass-button-lulo bg-white/50 text-gray-700 hover:text-gray-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Quick Actions</span>
          </div>
        </div>

        {/* Bottom Actions - Smaller and Centered */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            className="w-32 py-3 rounded-2xl font-medium glass-button-lulo text-gray-700 hover:text-gray-900"
            onClick={() => {
              // TODO: Implement create wishlist
              console.log("Create wishlist clicked");
            }}
          >
            <div className="text-center">
              <div className="text-sm">Create</div>
              <div className="text-sm">Wishlist</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="w-32 py-3 rounded-2xl font-medium glass-button-lulo text-gray-700 hover:text-gray-900"
            onClick={() => {
              // TODO: Implement create lookboard
              console.log("Create lookboard clicked");
            }}
          >
            <div className="text-center">
              <div className="text-sm">Create</div>
              <div className="text-sm">Lookboard</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}