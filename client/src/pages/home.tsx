import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Upload, Camera, Search, X, ExternalLink, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";
import ItemCard from "@/components/item-card";
import AddItemModal from "@/components/add-item-modal";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  retailer?: string;
  description?: string;
  category?: string;
  sourceUrl?: string;
}

export default function Home() {
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<"wishlist" | "closet" | "lookboards">("wishlist");
  const [linkUrl, setLinkUrl] = useState("");
  const [showAddPopover, setShowAddPopover] = useState(false);
  const [showHeaderAdd, setShowHeaderAdd] = useState(false);
  const { toast } = useToast();

  // Mutation for analyzing image
  const analyzeImageMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!response.ok) throw new Error('Failed to analyze image');
      return response.json();
    },
    onSuccess: (data) => {
      // After analysis, get similar items
      getSimilarItemsMutation.mutate(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for getting similar items
  const getSimilarItemsMutation = useMutation({
    mutationFn: async (analysis: any) => {
      const response = await fetch('/api/ai/similar-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysis),
      });
      if (!response.ok) throw new Error('Failed to get similar items');
      return response.json();
    },
    onSuccess: () => {
      setShowResults(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to find similar items. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Query for wishlist data
  const { data: wishlistItems } = useQuery({
    queryKey: ['/api/wishlist'],
    enabled: activeTab === "wishlist",
  });

  // Query for closet data
  const { data: closetItems } = useQuery({
    queryKey: ['/api/closet'],
    enabled: activeTab === "closet",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setUploadedImage(base64);
        setShowUploadSheet(false);
        // Analyze the image
        analyzeImageMutation.mutate(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLinkUpload = async () => {
    if (!linkUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    
    // For now, just close the sheet and show a message
    setShowUploadSheet(false);
    toast({
      title: "Link Upload",
      description: "Processing link: " + linkUrl,
    });
    setLinkUrl("");
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleAddToWishlist = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedProduct.id,
          name: selectedProduct.name,
          brand: selectedProduct.brand,
          price: selectedProduct.price,
          image: selectedProduct.image,
          category: selectedProduct.category,
          sourceUrl: selectedProduct.sourceUrl,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add to wishlist');
      
      toast({
        title: "Success",
        description: "Added to wishlist!",
      });
      setShowProductDetail(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      });
    }
  };

  const handleAddToCloset = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await fetch('/api/closet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedProduct.id,
          name: selectedProduct.name,
          brand: selectedProduct.brand,
          price: selectedProduct.price,
          image: selectedProduct.image,
          category: selectedProduct.category,
          sourceUrl: selectedProduct.sourceUrl,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add to closet');
      
      toast({
        title: "Success",
        description: "Added to closet!",
      });
      setShowProductDetail(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to closet",
        variant: "destructive",
      });
    }
  };

  const isLoading = analyzeImageMutation.isPending || getSimilarItemsMutation.isPending;
  const similarItems = getSimilarItemsMutation.data?.items || [];

  const renderMainView = () => {
    if (showResults && uploadedImage) {
      return (
        <div className="px-4 pb-4">
          {/* Lulo Results Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center mb-2">Lulo Results</h2>
            
            {/* Uploaded Image Preview */}
            <div className="relative mb-4">
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-white/80 backdrop-blur"
                onClick={() => {
                  setUploadedImage(null);
                  setShowResults(false);
                  analyzeImageMutation.reset();
                  getSimilarItemsMutation.reset();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {similarItems.map((product: any) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.retailer && (
                      <Badge className="absolute top-2 left-2 bg-white/90 text-black">
                        {product.retailer}
                      </Badge>
                    )}
                    {product.originalPrice && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        Sale
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-bold text-sm">{product.price}</p>
                      {product.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">{product.originalPrice}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Show tab content when not in upload/results mode
    if (activeTab === "wishlist" && wishlistItems) {
      return (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            {(wishlistItems as any[]).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "closet" && closetItems) {
      return (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            {(closetItems as any[]).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      );
    }

    // Default view when no image is uploaded
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Super Lulo</h1>
          <p className="text-gray-600">
            Upload an image to find similar fashion items
          </p>
        </div>

        <Popover open={showAddPopover} onOpenChange={setShowAddPopover}>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className="w-full max-w-xs bg-lulo-pink hover:bg-lulo-coral text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="center" side="top">
            <AddItemModal onSuccess={() => setShowAddPopover(false)} />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="mobile-app-container">
      {/* Header Tabs */}
      <header className="mobile-header border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex justify-center gap-8 flex-1">
            <button
              className={cn(
                "font-medium pb-2 border-b-2 transition-colors",
                activeTab === "wishlist" 
                  ? "text-black border-black" 
                  : "text-gray-400 border-transparent"
              )}
              onClick={() => setActiveTab("wishlist")}
            >
              Wishlist
            </button>
            <button
              className={cn(
                "font-medium pb-2 border-b-2 transition-colors",
                activeTab === "closet" 
                  ? "text-black border-black" 
                  : "text-gray-400 border-transparent"
              )}
              onClick={() => setActiveTab("closet")}
            >
              Closet
            </button>
            <button
              className={cn(
                "font-medium pb-2 border-b-2 transition-colors",
                activeTab === "lookboards" 
                  ? "text-black border-black" 
                  : "text-gray-400 border-transparent"
              )}
              onClick={() => setActiveTab("lookboards")}
            >
              Lookboards
            </button>
          </div>
          
          {/* Add Button in Header */}
          <div className="relative">
            <Button
              size="icon"
              variant="outline"
              className="text-lulo-pink hover:text-lulo-coral border-lulo-pink hover:border-lulo-coral"
              onClick={() => {
                console.log("Header plus button clicked, current state:", showHeaderAdd);
                alert("Header plus button clicked!"); // Simple test
                setShowHeaderAdd(!showHeaderAdd);
              }}
            >
              <Plus className="w-5 h-5" />
            </Button>
            
            {showHeaderAdd && (
              <div className="absolute top-12 right-0 z-[9999] w-80 p-4 bg-red-500 border border-gray-200 rounded-lg shadow-lg">
                <div className="text-white">TEST - Header Modal is showing!</div>
                <AddItemModal onSuccess={() => setShowHeaderAdd(false)} />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mobile-main">
        {renderMainView()}
      </main>

      {/* Upload Sheet */}
      <Sheet open={showUploadSheet} onOpenChange={setShowUploadSheet}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Manual Upload</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-6">
            <Button
              variant="outline"
              className="w-full h-16 justify-start"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Camera className="w-5 h-5 mr-3" />
              Choose from Gallery
            </Button>
            <Button
              variant="outline"
              className="w-full h-16 justify-start"
              onClick={() => {
                // Camera functionality would go here
                toast({
                  title: "Camera",
                  description: "Camera functionality coming soon!",
                });
              }}
            >
              <Upload className="w-5 h-5 mr-3" />
              Take Photo
            </Button>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-16 justify-start"
                onClick={() => {
                  // Toggle link input visibility
                  const linkInput = document.getElementById('link-input-section');
                  if (linkInput) {
                    linkInput.classList.toggle('hidden');
                  }
                }}
              >
                <Search className="w-5 h-5 mr-3" />
                Link Upload
              </Button>
              <div id="link-input-section" className="hidden space-y-2">
                <Input
                  placeholder="Paste product URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <Button 
                  size="sm"
                  onClick={handleLinkUpload}
                  className="w-full"
                >
                  Process Link
                </Button>
              </div>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Detail Dialog */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                <p className="text-gray-600">{selectedProduct.brand}</p>
                <p className="font-bold text-xl mt-2">{selectedProduct.price}</p>
                {selectedProduct.description && (
                  <p className="text-sm text-gray-600 mt-2">{selectedProduct.description}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-lulo-pink hover:bg-lulo-coral"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Wishlist
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleAddToCloset}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Closet
                </Button>
              </div>
              {selectedProduct.sourceUrl && (
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => window.open(selectedProduct.sourceUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Retailer Site
                </Button>
              )}
              <Button variant="secondary" className="w-full">
                Send to The Board
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}
