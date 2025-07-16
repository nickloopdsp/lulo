import { ReactNode } from "react";

interface MasonryLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function MasonryLayout({ children, className = "" }: MasonryLayoutProps) {
  return (
    <div className={`masonry-grid ${className}`}>
      {children}
    </div>
  );
} 