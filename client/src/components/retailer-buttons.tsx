import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Retailer = {
  id: string;
  name: string;
  url: string;
  originalPrice?: number;
  salePrice?: number;
  currency?: string;
};

type RetailerButtonsProps = {
  item: {
    name?: string;
    brand?: string;
    category?: string;
    price?: number | string | null;
    imageUrl?: string | null;
    sourceUrl?: string | null;
    currency?: string | null;
  };
  maxButtons?: number;
  size?: "xs" | "sm";
};

export default function RetailerButtons({ item, maxButtons = 2, size = "xs" }: RetailerButtonsProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retailers, setRetailers] = useState<Retailer[]>([]);

  useEffect(() => {
    if (!open || retailers.length > 0 || isLoading) return;
    const fetchRetailers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/products/search-retailers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            item: {
              name: item.name,
              brand: item.brand,
              category: item.category,
              price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price,
              imageUrl: item.imageUrl || undefined,
              sourceUrl: item.sourceUrl || undefined,
            },
            region: 'USA'
          })
        });
        const data = await res.json();
        const list: Retailer[] = Array.isArray(data?.retailers) ? data.retailers.map((r: any) => ({
          id: r.id,
          name: r.name,
          url: r.url,
          originalPrice: r.originalPrice,
          salePrice: r.salePrice,
          currency: r.currency
        })) : [];
        setRetailers(list);
      } catch {
        setRetailers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRetailers();
  }, [open, isLoading, item, retailers.length]);

  const buttonClasses = size === 'xs'
    ? 'px-2 py-1 h-6 text-xs'
    : 'px-3 py-1 h-7 text-xs';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`glass-button-lulo border border-[#FADADD]/50 text-lulo-pink-accent ${buttonClasses}`}
        >
          {isLoading ? 'Loading…' : 'Retailers'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 liquid-glass-strong border border-lulo-pink-accent">
        {retailers.length === 0 && !isLoading && (
          <div className="text-xs text-gray-600">No retailers found</div>
        )}
        <div className="flex flex-col gap-2">
          {retailers.slice(0, maxButtons).map((r) => (
            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between glass-button-lulo border border-[#FADADD]/50 text-lulo-pink-accent hover:bg-lulo-pink/70 hover:text-white"
              >
                <span>{r.name}</span>
                <span className="text-[10px] text-gray-500">
                  {r.salePrice ?? r.originalPrice ? `${r.currency || 'USD'} ${r.salePrice ?? r.originalPrice}` : ''}
                </span>
              </Button>
            </a>
          ))}
          {retailers.length > maxButtons && (
            <div className="text-[11px] text-gray-500">+{retailers.length - maxButtons} more</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

