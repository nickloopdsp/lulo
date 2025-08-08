import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, Shirt, MessageCircle, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LuloIcon } from "@/components/lulo-icon";
import { useToast } from "@/hooks/use-toast";

interface EmbeddedProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  sourceUrl: string;
  shopAtText: string;
}

interface EmbeddedProductCardProps {
  product: EmbeddedProduct;
}

export default function EmbeddedProductCard({ product }: EmbeddedProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState<"menu" | "wishlist" | "friend">("menu");
  const [selectedWishlist, setSelectedWishlist] = useState("");
  const [newWishlistName, setNewWishlistName] = useState("");
  const [friendQuery, setFriendQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const luloButtonRef = useRef<HTMLDivElement>(null);

  // Fetch existing wishlists
  const { data: wishlistFolders = [] } = useQuery({
    queryKey: ["/api/wishlist/folders"],
    enabled: showPopup && popupStep === "wishlist"
  });

  // Mock friends data - in real app would come from API
  const mockFriends = [
    { id: "1", name: "Isa", username: "@isa" },
    { id: "2", name: "Rhena OJ", username: "@rhenaoj" },
    { id: "3", name: "Sarah", username: "@sarah_style" },
    { id: "4", name: "Emma", username: "@emma_fashion" }
  ];

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (luloButtonRef.current && !luloButtonRef.current.contains(event.target as Node)) {
        setShowPopup(false);
        setPopupStep("menu");
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPopup]);

  const handleLuloClick = () => {
    setShowPopup(!showPopup);
    setPopupStep("menu");
  };

  const handleAddToWishlist = async (folder?: string) => {
    try {
      setIsLoading(true);
      
      // First create the item in our database
      const itemResponse = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          brand: product.brand,
          price: parseFloat(product.price.replace(/[^0-9.]/g, '')), // Convert price to number
          sourceUrl: product.sourceUrl,
          imageUrl: product.imageUrl,
          category: 'clothing'
        }),
        credentials: 'include',
      });

      if (!itemResponse.ok) {
        throw new Error('Failed to create item');
      }

      const item = await itemResponse.json();

      // Then add it to the wishlist
      const wishlistResponse = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          folder: folder === "uncategorized" ? null : folder,
          priority: 'medium',
          visibility: 'private',
        }),
        credentials: 'include',
      });

      if (!wishlistResponse.ok) {
        throw new Error('Failed to add to wishlist');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist/folders'] });

      setShowPopup(false);
      setPopupStep("menu");
      
      toast({
        title: "Added Successfully!",
        description: `${product.name} has been saved to your ${folder || 'wishlist'}.`,
      });

    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCloset = async () => {
    try {
      setIsLoading(true);
      
      // First create the item in our database
      const itemResponse = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          brand: product.brand,
          price: parseFloat(product.price.replace(/[^0-9.]/g, '')), // Convert price to number
          sourceUrl: product.sourceUrl,
          imageUrl: product.imageUrl,
          category: 'clothing'
        }),
        credentials: 'include',
      });

      if (!itemResponse.ok) {
        throw new Error('Failed to create item');
      }

      const item = await itemResponse.json();

      // Then add it to the closet
      const closetResponse = await fetch('/api/closet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
        }),
        credentials: 'include',
      });

      if (!closetResponse.ok) {
        throw new Error('Failed to add to closet');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/closet'] });

      setShowPopup(false);
      setPopupStep("menu");
      
      toast({
        title: "Added Successfully!",
        description: `${product.name} has been added to your closet.`,
      });

    } catch (error) {
      console.error('Error adding to closet:', error);
      toast({
        title: "Error",
        description: "Failed to add item to closet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToBoardroom = (friendId: string) => {
    // Navigate to boardroom with item data for sharing
    const itemData = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      sourceUrl: product.sourceUrl
    };
    
    navigate(`/boardroom?shareItem=${encodeURIComponent(JSON.stringify(itemData))}&friendId=${friendId}`);
    setShowPopup(false);
    setPopupStep("menu");
  };

  const handleCreateNewWishlist = async () => {
    if (!newWishlistName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wishlist name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create new wishlist first (this would be a real API call)
      // For now, just add to the new wishlist name directly
      await handleAddToWishlist(newWishlistName);
      setNewWishlistName("");
      
    } catch (error) {
      console.error('Error creating wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to create wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopAt = () => {
    window.open(product.sourceUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-lg p-3 max-w-[120px]">
      {/* Product Image */}
      <div className="w-full mb-3">
        <img
          src={`/api/image-proxy?url=${encodeURIComponent(product.imageUrl)}`}
          alt={product.name}
          className="w-full h-32 object-cover rounded"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('/api/image-proxy')) {
              target.src = product.imageUrl;
            }
          }}
        />
      </div>
      
      {/* Product Info */}
      <div className="text-center mb-3 flex-1">
        <p className="text-xs font-medium text-gray-900 leading-tight mb-1">
          {product.name}
        </p>
        <p className="text-xs text-gray-600 mb-1">{product.brand}</p>
        <p className="text-xs font-semibold text-gray-900">{product.price}</p>
      </div>
      
      {/* Action Buttons */}
      <div className="w-full space-y-2">
        <Button
          onClick={handleShopAt}
          variant="outline"
          size="sm"
          className="w-full h-6 text-[10px] font-medium border-black text-black hover:bg-gray-50"
        >
          {product.shopAtText}
        </Button>
        
        <div ref={luloButtonRef} className="relative">
          <Button
            onClick={handleLuloClick}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="w-full h-8 p-0 glass-button-lulo touch-feedback border border-[#FADADD]/40"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#FADADD]/80 border border-[#FADADD]/70 shadow-sm">
              <LuloIcon size={12} color="white" />
            </div>
          </Button>

          {/* Popup Menu */}
          {showPopup && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
              <div className="liquid-glass-strong rounded-xl shadow-lg p-3 min-w-[220px] animate-fade-in border border-[#FADADD]/30">
                {popupStep === "menu" && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-center mb-3">Add to...</h4>
                    <Button
                      onClick={() => setPopupStep("wishlist")}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Wishlist
                    </Button>
                    <Button
                      onClick={handleAddToCloset}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      disabled={isLoading}
                    >
                      <Shirt className="w-4 h-4 mr-2" />
                      Add to Closet
                    </Button>
                    <Button
                      onClick={() => setPopupStep("friend")}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send to Boardroom
                    </Button>
                  </div>
                )}

                {popupStep === "wishlist" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Select Wishlist</h4>
                      <Button
                        onClick={() => setPopupStep("menu")}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleAddToWishlist("uncategorized")}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start"
                        disabled={isLoading}
                      >
                        Uncategorized
                      </Button>
                      
                      {wishlistFolders.map((folder: string) => (
                        <Button
                          key={folder}
                          onClick={() => handleAddToWishlist(folder)}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start"
                          disabled={isLoading}
                        >
                          {folder}
                        </Button>
                      ))}
                      
                      <div className="border-t pt-2">
                        <Input
                          placeholder="New wishlist name..."
                          value={newWishlistName}
                          onChange={(e) => setNewWishlistName(e.target.value)}
                          className="mb-2"
                        />
                        <Button
                          onClick={handleCreateNewWishlist}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isLoading || !newWishlistName.trim()}
                        >
                          Create New Wishlist
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {popupStep === "friend" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Send to Friend</h4>
                      <Button
                        onClick={() => setPopupStep("menu")}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Input
                      placeholder="Search friends..."
                      value={friendQuery}
                      onChange={(e) => setFriendQuery(e.target.value)}
                      className="mb-2"
                    />
                    
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {mockFriends
                        .filter(friend => 
                          friend.name.toLowerCase().includes(friendQuery.toLowerCase()) ||
                          friend.username.toLowerCase().includes(friendQuery.toLowerCase())
                        )
                        .map((friend) => (
                          <Button
                            key={friend.id}
                            onClick={() => handleSendToBoardroom(friend.id)}
                            variant="ghost"
                            size="sm"
                            className="w-full text-left justify-start p-2"
                          >
                            <div>
                              <div className="font-medium">{friend.name}</div>
                              <div className="text-xs text-gray-500">{friend.username}</div>
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}