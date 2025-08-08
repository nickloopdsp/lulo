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
  const FALLBACK_URLS = [
    "https://www.revolveclothing.fr/jaded-london-layered-button-mini-dress-in-orange/dp/JLON-WD92/?d=Womens&page=1&lc=26&itrownum=7&itcurrpage=1&itview=05&hsclk23486=3&hspos=1",
    "https://www.revolveclothing.fr/lioness-district-maxi-dress-in-onyx-polka/dp/LIOR-WD104/?d=Womens&sectionURL=https%3A%2F%2Fwww.revolveclothing.fr%2Flioness-dresses%2Fbr%2Fd32393%2F%3F%26keyword%3DLIONESS%2BDISTRICT%2BMAXI%2BDRESS",
    "https://www.net-a-porter.com/fr-fr/shop/product/doen/vetements/robes-midi/robe-dos-nu-en-satin-de-soie-melangee-a-pois-et-a-volants-mazarin/1647597357418202?utm_source=google&utm_medium=cpc&utm_campaign=GOO%3ANAP%3AEU%3AFR%3AOO%3AFRE%3ASEAU%3APLA%3ASLR%3AMXO%3ANEW%3AWN%3AEKA%3ALV0%3ALV1%3ALV2%3AXXX%3A64%3AEMPTY%3A&utm_id=22524586241&utm_term=3074457345628958876&vtp00=GOOGLE&vtp01=SEAU&vtp02=179945407860&vtp03=pla-311122297903&vtp04=g&vtp05=c&vtp06=750742923829&vtp07=pla&gad_source=1&gad_campaignid=22524586241&gbraid=0AAAAADRhZntnrs9XLwXOMGxN_zdELJ8ja&gclid=CjwKCAjwwNbEBhBpEiwAFYLtGFyhv01ul86jkCowrBbEQ9Nv4MYr2fH6FOBvgtniQIDD1ca-S2Up2xoC_TAQAvD_BwE"
  ];

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
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setResults(list);
          return;
        }
        // Fallback: scrape provided URLs
        const scraped: SimilarProduct[] = [];
        for (const url of FALLBACK_URLS) {
          try {
            const sres = await fetch('/api/products/scrape-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ url })
            });
            if (sres.ok) {
              const prod = await sres.json();
              scraped.push({
                name: prod.name,
                brand: prod.brand,
                price: prod.price,
                category: prod.category,
                imageUrl: prod.imageUrl,
                description: prod.description,
              });
            }
          } catch {}
        }
        setResults(scraped);
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
            {(Array.isArray(results) ? results : []).map((p, idx) => (
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

