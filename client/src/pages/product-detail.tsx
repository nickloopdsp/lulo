import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Heart, Share, Star, ExternalLink, ChevronDown, Loader2, Search, ChevronRight, Check } from "lucide-react";
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
  confidence?: "high" | "medium" | "low";
  lastChecked?: string;
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

  // Check if we have visual search data in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const visualSearchData = urlParams.get('data');
  
  let item = wishlistItems.find(item => item.id.toString() === id);
  
  // If from visual search, create a temporary item from the data
  if (visualSearchData && !item) {
    try {
      const parsed = JSON.parse(decodeURIComponent(visualSearchData));
      item = {
        id: parseInt(id),
        userId: 'visual-search',
        itemId: parseInt(id),
        folder: null,
        notes: null,
        priority: null,
        visibility: null,
        giftMe: null,
        createdAt: Date.now(),
        name: parsed.name,
        description: null,
        price: parseFloat(parsed.price.replace(/[^0-9.]/g, '')),
        currency: 'USD',
        brand: parsed.brand,
        imageUrl: parsed.imageUrl,
        sourceUrl: null,
        category: 'Fashion',
        isPublic: true
      };
    } catch (e) {
      console.error('Failed to parse visual search data:', e);
    }
  }

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
          title: "Search Results",
          description: "These are search links - click to find the exact product on each retailer's site.",
        });
      } else if (response.metadata && response.metadata.confidence >= 0.9) {
        toast({
          title: "Found Direct Listings",
          description: "Found retailers with this exact product in stock!",
          variant: "default"
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
    const payload = {
      name: item?.name,
      brand: item?.brand,
      category: item?.category,
      price: item?.price,
      imageUrl: item?.imageUrl,
    };
    navigate(`/similar?item=${encodeURIComponent(JSON.stringify(payload))}`);
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

  const hideHearts = new URLSearchParams(window.location.search).get('src') === 'trends';

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
          
          {/* Removed top bar CTA; moved below brand/name per design */}
          
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
      <div className={`relative ${hideHearts ? 'hide-hearts' : ''}`}>
        <ItemImage
          imageUrl={item.imageUrl}
          alt={item.name}
          className="w-full h-96 object-cover"
        />
        {!hideHearts && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
          >
            <Heart className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className={`flex items-start justify-between mb-2 ${hideHearts ? 'hide-hearts' : ''}`}>
          <div>
            <h1 className="text-xl font-semibold text-lulo-dark mb-1">
              {item.brand?.toUpperCase()}
            </h1>
            <p className="text-lulo-gray text-sm">{item.name}</p>
          </div>
          {!hideHearts && <Heart className="w-6 h-6 text-lulo-gray" />}
        </div>

        {/* See More Like This CTA (glass + pink accents) */}
        <div className="mt-3">
          <Button
            onClick={handleSeeMoreLikeThis}
            variant="outline"
            className="w-full glass-button-lulo border border-[#FADADD]/50 text-lulo-pink-accent font-medium py-3 rounded-xl"
          >
            See more like this
          </Button>
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

        {/* Action Buttons - Show for visual search results */}
        {window.location.search.includes('from=visual-search') && (
          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full py-3 rounded-lg font-medium border-gray-200"
              onClick={() => {
                toast({
                  title: "Added to Wishlist",
                  description: `${item.name} has been added to your wishlist.`,
                });
              }}
            >
              Add to Wishlist
            </Button>
            
            <Button
              variant="outline"
              className="w-full py-3 rounded-lg font-medium border-gray-200"
              onClick={() => {
                toast({
                  title: "Added to Closet",
                  description: `${item.name} has been added to your closet.`,
                });
              }}
            >
              Add to Closet
            </Button>
            
            <Button
              variant="outline"
              className="w-full py-3 rounded-lg font-medium border-gray-200"
              onClick={() => {
                toast({
                  title: "Sent to The Board",
                  description: `${item.name} has been sent to The Board.`,
                });
              }}
            >
              Send to The Board
            </Button>
          </div>
        )}

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
              <span className="ml-2 text-lulo-gray">Searching for retailers with this exact product...</span>
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
            <>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-lulo-dark mb-2">
                  Available at {retailers.length} retailer{retailers.length > 1 ? 's' : ''}
                </h3>
                {retailers.some((r: RetailerOption) => r.confidence === 'high' || r.note?.includes('direct')) && (
                  <p className="text-xs text-green-600">
                    ✓ Found direct product listings
                  </p>
                )}
              </div>
              
              {retailers.map((retailer: RetailerOption, index: number) => (
                <Card 
                  key={index}
                  className={`cursor-pointer hover:shadow-sm transition-shadow ${
                    retailer.confidence === 'high' || retailer.note?.includes('direct') 
                      ? 'border-green-500' 
                      : ''
                  }`}
                  onClick={() => handleRetailerClick(retailer)}
                >
                  <CardContent className="p-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {retailer.confidence === 'high' || retailer.note?.includes('direct') ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <Search className="w-5 h-5 text-lulo-gray" />
                          )}
                          <div>
                            <h3 className="font-semibold text-lulo-dark">{retailer.name}</h3>
                            <p className="text-xs text-lulo-gray">
                              {retailer.id === 'original-source' || retailer.id === 'original-retailer' 
                                ? 'Original product page' 
                                : retailer.note?.includes('direct') 
                                  ? 'Direct product link'
                                  : retailer.note || 'Click to view'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-lulo-gray" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          {retailer.salePrice && retailer.originalPrice && retailer.salePrice < retailer.originalPrice ? (
                            <div>
                              <span className="text-xs text-lulo-gray line-through mr-2">
                                ${retailer.originalPrice}
                              </span>
                              <span className="text-lg font-bold text-red-600">
                                ${retailer.salePrice}
                              </span>
                              <span className="text-xs text-red-600 ml-1">
                                (-{Math.round(((retailer.originalPrice - retailer.salePrice) / retailer.originalPrice) * 100)}%)
                              </span>
                            </div>
                          ) : retailer.originalPrice ? (
                            <span className="text-lg font-semibold text-lulo-dark">
                              ${retailer.originalPrice}
                            </span>
                          ) : (
                            <span className="text-sm text-lulo-gray">
                              Price varies
                            </span>
                          )}
                        </div>
                        
                        {retailer.availability === "sold_out" ? (
                          <Badge variant="secondary" className="text-xs">
                            Sold Out
                          </Badge>
                        ) : retailer.availability === "low_stock" ? (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                            Low Stock
                          </Badge>
                        ) : retailer.availability === "limited_region" ? (
                          <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                            Limited Region
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                            In Stock
                          </Badge>
                        )}
                      </div>
                      
                      {/* Sizes if available and it's a direct link */}
                      {retailer.sizes && retailer.sizes.length > 0 && (retailer.confidence === 'high' || retailer.note?.includes('direct')) && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs text-lulo-gray">Sizes:</span>
                          <div className="flex space-x-1">
                            {retailer.sizes.slice(0, 5).map((size, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-lulo-light-gray rounded">
                                {size}
                              </span>
                            ))}
                            {retailer.sizes.length > 5 && (
                              <span className="text-xs text-lulo-gray">+{retailer.sizes.length - 5}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {retailer.shipping && (
                        <p className="text-xs text-lulo-gray mt-2">
                          {retailer.shipping}
                        </p>
                      )}
                      
                      {retailer.lastChecked && (
                        <p className="text-xs text-lulo-gray mt-1">
                          Last checked: {new Date(retailer.lastChecked).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="mt-4 p-3 bg-lulo-light-gray rounded-lg">
                <p className="text-xs text-lulo-gray">
                  <span className="font-medium">Tip:</span> Prices and availability may vary. 
                  {retailers.some((r: RetailerOption) => r.confidence !== 'high' && !r.note?.includes('direct')) && 
                    " Some links may show search results where you'll need to find the exact product."}
                </p>
              </div>
            </>
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