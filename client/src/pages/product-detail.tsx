import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Heart, Share, Star, ExternalLink, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ItemImage } from "@/components/ui/item-image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type ProductDetailParams = {
  id: string;
};

type WishlistItem = {
  id: number;
  userId: string;
  itemId: number;
  folder: string | null;
  notes: string | null;
  priority: number | null;
  visibility: string | null;
  giftMe: boolean | null;
  createdAt: number | null;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  category?: string | null;
  isPublic?: boolean | null;
};

type RetailerOption = {
  id: string;
  name: string;
  logo?: string;
  originalPrice?: number;
  salePrice?: number;
  currency: string;
  availability: "in_stock" | "low_stock" | "sold_out" | "limited_region";
  sizes: string[];
  url: string;
  shipping?: string;
  note?: string;
};

export default function ProductDetail() {
  const { id } = useParams<ProductDetailParams>();
  const [, navigate] = useLocation();
  const [selectedCountry, setSelectedCountry] = useState("USA");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [retailers, setRetailers] = useState<RetailerOption[]>([]);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isLoadingRetailers, setIsLoadingRetailers] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const { toast } = useToast();

  // Fetch the specific wishlist item
  const { data: wishlistItems = [] as WishlistItem[] } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
  });

  const item = wishlistItems.find(item => item.id.toString() === id);

  // Fetch retailers when item or country changes
  useEffect(() => {
    if (item) {
      fetchRetailers();
      fetchSimilarProducts();
    }
  }, [item, selectedCountry]);

  const fetchRetailers = async () => {
    if (!item) return;
    
    setIsLoadingRetailers(true);
    try {
      const regionMap: { [key: string]: string } = {
        'USA': 'USA',
        'FRANCE': 'EU', 
        'ENGLAND': 'UK'
      };

      const res = await apiRequest("POST", "/api/products/search-retailers", {
        item: {
          name: item.name,
          brand: item.brand,
          category: item.category,
          price: item.price,
          imageUrl: item.imageUrl,
          sourceUrl: item.sourceUrl
        },
        region: regionMap[selectedCountry] || 'USA'
      });

      const response = await res.json();
      let allRetailers = response.retailers || [];
      
      // If item has original sourceUrl, add it as the primary retailer
      if (item.sourceUrl && item.sourceUrl.trim()) {
        // Extract retailer name from URL
        const getRetailerName = (url: string): string => {
          try {
            const domain = new URL(url).hostname.replace('www.', '');
            const domainToName: { [key: string]: string } = {
              'zara.com': 'ZARA',
              'hm.com': 'H&M',
              'cos.com': 'COS',
              'arket.com': 'ARKET',
              'weekday.com': 'WEEKDAY',
              'monki.com': 'MONKI',
              'stories.com': '& OTHER STORIES',
              'ralphlauren.com': 'RALPH LAUREN',
              'ralphlauren.fr': 'RALPH LAUREN',
              'reformation.com': 'REFORMATION',
              'everlane.com': 'EVERLANE',
              'ganni.com': 'GANNI',
              'acnestudios.com': 'ACNE STUDIOS',
              'farfetch.com': 'FARFETCH',
              'net-a-porter.com': 'NET-A-PORTER',
              'mr-porter.com': 'MR PORTER',
              'ssense.com': 'SSENSE',
              'matchesfashion.com': 'MATCHES FASHION',
              'mytheresa.com': 'MYTHERESA',
              'brownsfashion.com': 'BROWNS',
              'selfridges.com': 'SELFRIDGES',
              'harrods.com': 'HARRODS',
              'saksfifthavenue.com': 'SAKS FIFTH AVENUE',
              'nordstrom.com': 'NORDSTROM',
              'bergdorfgoodman.com': 'BERGDORF GOODMAN',
              'anthropologie.com': 'ANTHROPOLOGIE',
              'urbanoutfitters.com': 'URBAN OUTFITTERS',
              'freepeople.com': 'FREE PEOPLE',
              'asos.com': 'ASOS',
              'revolve.com': 'REVOLVE',
              'shopbop.com': 'SHOPBOP',
              'gilt.com': 'GILT',
              'theoutnet.com': 'THE OUTNET',
              'luisaviaroma.com': 'LUISA VIA ROMA',
              'modaoperandi.com': 'MODA OPERANDI',
              'intermixonline.com': 'INTERMIX',
              'barneys.com': 'BARNEYS',
              'neimanmarcus.com': 'NEIMAN MARCUS',
              'sandro-paris.com': 'SANDRO',
              'maje.com': 'MAJE',
              'ba-sh.com': 'BA&SH',
              'iro.fr': 'IRO',
              'mango.com': 'MANGO',
              'reiss.com': 'REISS',
              'whistles.com': 'WHISTLES',
              'theory.com': 'THEORY',
              'vince.com': 'VINCE',
              'equipment.fr': 'EQUIPMENT',
              'frame-store.com': 'FRAME',
              'agolde.com': 'AGOLDE',
              'citizens.com': 'CITIZENS OF HUMANITY',
              're-done.com': 'RE/DONE',
              'motherdenim.com': 'MOTHER',
              'paige.com': 'PAIGE',
              'j-brand.com': 'J BRAND',
              'levi.com': "LEVI'S",
              'levis.com': "LEVI'S",
              'shopworn.com': 'WORN',
              'form.life': 'FORM',
              'aeyde.com': 'AEYDE',
              'kujten.com': 'KUJTEN'
            };
            
            return domainToName[domain] || domain.split('.')[0].toUpperCase();
          } catch {
            return 'ORIGINAL RETAILER';
          }
        };

        const retailerName = getRetailerName(item.sourceUrl);
        
        const originalRetailer = {
          id: "original-source",
          name: retailerName,
          originalPrice: item.price || undefined,
          currency: item.currency || "USD",
          availability: "in_stock" as const,
          sizes: ["One Size"],
          url: item.sourceUrl,
          shipping: "Check retailer site",
          region: "Original",
          note: "Original product page"
        };
        
        // Add original source as the first retailer
        allRetailers = [originalRetailer, ...allRetailers];
      }
      
      setRetailers(allRetailers);
      
      if (response.metadata && response.metadata.confidence < 0.5) {
        toast({
          title: "Limited Results",
          description: "AI found limited retailer information for this item.",
          variant: "destructive"
        });
      } else if (response.metadata && response.metadata.confidence < 0.9 && !item.sourceUrl) {
        toast({
          title: "Search Results",
          description: "Links will take you to retailer search pages for this item.",
        });
      }
    } catch (error) {
      console.error('Error fetching retailers:', error);
      toast({
        title: "Search Failed",
        description: "Could not find retailers for this item. Please try again.",
        variant: "destructive"
      });
      setRetailers([]);
    } finally {
      setIsLoadingRetailers(false);
    }
  };

  const fetchSimilarProducts = async () => {
    if (!item) return;
    
    setIsLoadingSimilar(true);
    try {
      const res = await apiRequest("POST", "/api/products/similar", {
        item: {
          name: item.name,
          brand: item.brand,
          category: item.category,
          price: item.price
        },
        limit: 6
      });

      const response = await res.json();
      setSimilarProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching similar products:', error);
      setSimilarProducts([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const countries = [
    { code: "USA", name: "USA", flag: "🇺🇸" },
    { code: "FRANCE", name: "FRANCE", flag: "🇫🇷" },
    { code: "ENGLAND", name: "ENGLAND", flag: "🇬🇧" }
  ];

  const handleSeeMoreLikeThis = () => {
    // Navigate to search with similar items
    navigate(`/search?similar=${encodeURIComponent(item?.name || "")}`);
  };

  const handleRetailerClick = (retailer: RetailerOption) => {
    if (retailer.availability === "sold_out") {
      toast({
        title: "Sold Out",
        description: "This item is currently sold out at this retailer.",
        variant: "destructive"
      });
      return;
    }
    
    // Open retailer URL
    window.open(retailer.url, '_blank');
  };

  if (!item) {
    return (
      <div className="mobile-main">
        <div className="flex items-center justify-center h-full">
          <p className="text-lulo-gray">Item not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-main bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-lulo-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSeeMoreLikeThis}
            className="text-sm font-medium"
          >
            See more like this
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Share className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative">
        <ItemImage
          imageUrl={item.imageUrl}
          alt={item.name}
          className="w-full h-96 object-cover"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-xl font-semibold text-lulo-dark mb-1">
              {item.brand?.toUpperCase()}
            </h1>
            <p className="text-lulo-gray text-sm">{item.name}</p>
          </div>
          <Heart className="w-6 h-6 text-lulo-gray" />
        </div>

        {/* Product Details Accordion */}
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="details" className="border-lulo-border">
            <AccordionTrigger className="text-left">
              <span className="text-lulo-dark font-medium">Product details</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm text-lulo-gray">
                <p>Category: {item.category || "Fashion"}</p>
                {item.description && <p>{item.description}</p>}
                <p>Material: Premium fabric blend</p>
                <p>Care: Dry clean only</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* International Shopping Preferences */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-lulo-dark mb-3">
            International Shopping Preferences
          </h3>
          <div className="flex space-x-2">
            {countries.map((country) => (
              <Button
                key={country.code}
                variant={selectedCountry === country.code ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCountry(country.code)}
                className={`px-4 py-2 text-xs font-medium rounded-full ${
                  selectedCountry === country.code
                    ? "bg-lulo-dark text-white"
                    : "bg-lulo-light-gray text-lulo-gray border-lulo-border"
                }`}
              >
                {country.flag} {country.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Retailer Options */}
        <div className="mt-8 space-y-4">
          {isLoadingRetailers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-lulo-gray" />
              <span className="ml-2 text-lulo-gray">Finding retailers...</span>
            </div>
          ) : retailers.length === 0 ? (
            <div className="text-center py-8 text-lulo-gray">
              <p>No retailers found for this item.</p>
              <Button 
                onClick={fetchRetailers}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : (
            retailers.map((retailer: RetailerOption) => (
              <Card
                key={retailer.id}
                className={`border-lulo-border cursor-pointer hover:shadow-sm transition-shadow ${
                  retailer.id === 'original-source' ? 'border-2 border-lulo-pink bg-gradient-to-r from-lulo-pink/5 to-lulo-coral/5' : ''
                }`}
                onClick={() => handleRetailerClick(retailer)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-semibold text-sm ${
                            retailer.id === 'original-source' ? 'text-lulo-pink' : 'text-lulo-dark'
                          }`}>
                            {retailer.name}
                          </h4>
                          {retailer.id === 'original-source' && (
                            <Badge className="bg-lulo-pink text-white text-xs">
                              ⭐ ORIGINAL
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          {retailer.salePrice && retailer.originalPrice && retailer.salePrice < retailer.originalPrice ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-lulo-gray line-through">
                                ${retailer.originalPrice}
                              </span>
                              <span className="text-lg font-bold text-red-600">
                                ${retailer.salePrice}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                ★ Lowest price
                              </Badge>
                            </div>
                          ) : retailer.originalPrice ? (
                            <span className="text-lg font-semibold text-lulo-dark">
                              ${retailer.originalPrice}
                            </span>
                          ) : (
                            <span className="text-sm text-lulo-gray">
                              Check price
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-lulo-gray mb-2">
                        {retailer.id === 'original-source' ? 'Original product page' : `From ${retailer.name}`}
                      </p>

                      {/* Size Options */}
                      <div className="flex space-x-2 mb-2">
                        {retailer.sizes.map((size: string) => (
                          <Button
                            key={size}
                            variant="outline"
                            size="sm"
                            className="px-3 py-1 text-xs rounded border-lulo-border"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSize(size);
                            }}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>

                      {/* Status */}
                      {retailer.availability === "sold_out" ? (
                        <Badge variant="secondary" className="text-xs">
                          SOLD OUT
                        </Badge>
                      ) : retailer.availability === "low_stock" ? (
                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className={`text-xs ${
                          retailer.id === 'original-source' ? 'border-lulo-pink text-lulo-pink' : 'border-green-500 text-green-600'
                        }`}>
                          {retailer.id === 'original-source' ? 'Available' : 'In Stock'}
                        </Badge>
                      )}

                      {/* Special Notes */}
                      {retailer.note && (
                        <div className={`flex items-center mt-2 text-xs ${
                          retailer.id === 'original-source' ? 'text-lulo-pink' : 'text-green-600'
                        }`}>
                          <span className="mr-1">
                            {retailer.id === 'original-source' ? '🔗' : '🌱'}
                          </span>
                          <span>{retailer.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Similar Products */}
        {(isLoadingSimilar || similarProducts.length > 0) && (
          <div className="mt-8 border-t border-lulo-border pt-6">
            <h3 className="text-lg font-semibold text-lulo-dark mb-4">You might also like</h3>
            
            {isLoadingSimilar ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lulo-gray" />
                <span className="ml-2 text-lulo-gray">Finding similar items...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {similarProducts.slice(0, 4).map((product: any, index: number) => (
                  <div 
                    key={index}
                    className="bg-lulo-light-gray rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => {
                      // In a real implementation, this would navigate to the product or add to wishlist
                      toast({
                        title: "Product Found",
                        description: `${product.name} by ${product.brand}`,
                      });
                    }}
                  >
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                      <ItemImage
                        imageUrl={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        width={150}
                        height={150}
                        showLoading={false}
                      />
                    </div>
                    <h4 className="font-medium text-sm text-lulo-dark line-clamp-2 mb-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-lulo-gray">{product.brand}</p>
                    {product.price && (
                      <p className="text-sm font-semibold text-lulo-dark">${product.price}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
} 