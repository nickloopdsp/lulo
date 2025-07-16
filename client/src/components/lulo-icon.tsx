import { cn } from "@/lib/utils";

interface LuloIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export function LuloIcon({ className, size = 24, color = "currentColor" }: LuloIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Fruit stem */}
      <path
        d="M45 5 C45 5, 48 2, 52 8 C56 14, 54 18, 50 20"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Main fruit circle */}
      <circle
        cx="50"
        cy="60"
        r="35"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}

interface LuloWordmarkProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  color?: string;
  orientation?: "horizontal" | "vertical";
}

export function LuloWordmark({ 
  className, 
  iconSize = 32, 
  textSize = "text-2xl", 
  color = "currentColor",
  orientation = "horizontal" 
}: LuloWordmarkProps) {
  if (orientation === "vertical") {
    return (
      <div className={cn("flex flex-col items-center space-y-2", className)}>
        <LuloIcon size={iconSize} color={color} />
        <span className={cn("font-bold tracking-wide", textSize)} style={{ color }}>
          LULO
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <LuloIcon size={iconSize} color={color} />
      <span className={cn("font-bold tracking-wide", textSize)} style={{ color }}>
        LULO
      </span>
    </div>
  );
} 