import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import MasonryLayout from "@/components/masonry-layout";
import { ItemImage } from "@/components/ui/item-image";

type SimilarProduct = {
  name: string;
  brand?: string;
  price?: number | string;
  category?: string;
  imageUrl?: string;
  description?: string;
};

export default function SimilarProductsPage() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SimilarProduct[]>([]);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const itemParam = params.get('item');

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!itemParam) {
        setIsLoading(false);
        return;
      }
      try {
        const item = JSON.parse(decodeURIComponent(itemParam));
        const res = await fetch('/api/products/similar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ item, limit: 12 })
        });
        const data = await res.json();
        setResults(data || []);
      } catch (e) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSimilar();
  }, [itemParam]);

  return (
    <div className="mobile-main bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="p-2">
            ←
          </Button>
          <h1 className="text-sm font-semibold text-lulo-dark">Similar products</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lulo-dark" />
          </div>
        ) : (
          <MasonryLayout>
            {results.map((p, idx) => (
              <div
                key={`${p.name}-${idx}`}
                className="masonry-item group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                onClick={() => {
                  const tempId = (2000000 + idx).toString();
                  const data = {
                    name: p.name,
                    brand: p.brand || '',
                    price: typeof p.price === 'number' ? `$${p.price}` : (p.price || ''),
                    imageUrl: p.imageUrl || '',
                    sourceUrl: '',
                  };
                  navigate(`/item/${tempId}?data=${encodeURIComponent(JSON.stringify(data))}`);
                }}
              >
                <ItemImage imageUrl={p.imageUrl} alt={p.name} className="w-full h-auto object-cover" />
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-lulo-dark mb-1">{p.brand || '—'}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{p.name}</p>
                </div>
              </div>
            ))}
          </MasonryLayout>
        )}
      </div>
    </div>
  );
}

