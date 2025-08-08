import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
  const [isLoading, setIsLoading] = useState(false);
  const [retailers, setRetailers] = useState<Retailer[]>([]);

  useEffect(() => {
    if (retailers.length > 0 || isLoading) return;
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
        let list: Retailer[] = Array.isArray(data?.retailers) ? data.retailers.map((r: any) => ({
          id: r.id,
          name: r.name,
          url: r.url,
          originalPrice: r.originalPrice,
          salePrice: r.salePrice,
          currency: r.currency
        })) : [];
        // Ensure brand/original retailer first if available
        const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        const brandKey = normalize(item.brand || '');
        const withBrandFirst = () => {
          if (!brandKey) return list;
          const idx = list.findIndex(r => normalize(r.name).includes(brandKey));
          if (idx > 0) {
            const [brandR] = list.splice(idx, 1);
            list = [brandR, ...list];
          }
          return list;
        };
        withBrandFirst();
        setRetailers(list);
      } catch {
        setRetailers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRetailers();
  }, [isLoading, item, retailers.length]);

  const buttonClasses = size === 'xs'
    ? 'px-2 py-1 h-6 text-xs'
    : 'px-3 py-1 h-7 text-xs';

  // Build top 3: brand first (if present), then most trusted (by salePrice presence and name heuristics)
  const sorted = [...retailers];
  // Heuristic: prefer entries with salePrice, then with originalPrice, then by name length
  sorted.sort((a, b) => {
    const aScore = (a.salePrice ? 2 : 0) + (a.originalPrice ? 1 : 0);
    const bScore = (b.salePrice ? 2 : 0) + (b.originalPrice ? 1 : 0);
    return bScore - aScore || a.name.length - b.name.length;
  });
  // If brand exists and appears in list but not at index 0, move to front
  const brandIdx = sorted.findIndex(r => (item.brand || '').toLowerCase() && r.name.toLowerCase().includes((item.brand || '').toLowerCase()));
  if (brandIdx > 0) {
    const [brandR] = sorted.splice(brandIdx, 1);
    sorted.unshift(brandR);
  }
  const top = sorted.slice(0, Math.max(3, maxButtons));

  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
  };
  const getFavicon = (url: string) => `https://www.google.com/s2/favicons?sz=64&domain=${getDomain(url)}`;

  return (
    <div className="flex flex-col gap-1 w-full">
      {isLoading && (
        <div className={`text-[11px] text-gray-500 ${buttonClasses}`}>Loading retailers…</div>
      )}
      {!isLoading && top.map((r) => (
        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block">
          <div className="flex items-center justify-between rounded-xl border border-[#FADADD]/50 px-2 py-1 glass-button-lulo">
            <div className="flex items-center gap-2 min-w-0">
              <img src={getFavicon(r.url)} alt="" className="w-4 h-4 rounded" />
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-lulo-dark truncate">
                  {r.salePrice ?? r.originalPrice ? `${r.currency || 'USD'} ${r.salePrice ?? r.originalPrice}` : 'View'}
                </div>
                <div className="text-[10px] text-gray-500 truncate">From {r.name}</div>
              </div>
            </div>
            <div className="shrink-0 w-5 h-5 rounded-full border border-[#FADADD]/60 flex items-center justify-center text-[#FADADD]">▶</div>
          </div>
        </a>
      ))}
    </div>
  );
}

