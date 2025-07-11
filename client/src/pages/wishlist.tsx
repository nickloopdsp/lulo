import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Plus, Search, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/bottom-navigation";
import ItemCard from "@/components/item-card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Wishlist() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["/api/wishlist"],
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest("DELETE", `/api/wishlist/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Item removed from wishlist",
        description: "The item has been removed from your wishlist.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error) => {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredItems = wishlistItems.filter((wishlistItem: any) => {
    const matchesSearch = wishlistItem.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wishlistItem.item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === null || wishlistItem.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return "Must Have";
      case 4: return "High";
      case 3: return "Medium";
      case 2: return "Low";
      case 1: return "Maybe";
      default: return "Medium";
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return "bg-red-500";
      case 4: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 2: return "bg-blue-500";
      case 1: return "bg-gray-500";
      default: return "bg-yellow-500";
    }
  };

  const totalValue = wishlistItems.reduce((sum: number, item: any) => {
    return sum + (item.item.price ? parseFloat(item.item.price) : 0);
  }, 0);

  return (
    <div className="mobile-app-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">My Wishlist</h1>
            <Button
              size="sm"
              className="bg-lulo-pink hover:bg-lulo-coral text-white"
              onClick={() => {
                // In a real app, this would open the add item modal
                toast({
                  title: "Add item to wishlist",
                  description: "Navigate to Add Item to add new items to your wishlist.",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-0 rounded-xl"
            />
          </div>

          {/* Priority filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant={selectedPriority === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPriority(null)}
              className="rounded-full whitespace-nowrap"
            >
              All
            </Button>
            {[5, 4, 3, 2, 1].map((priority) => (
              <Button
                key={priority}
                variant={selectedPriority === priority ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPriority(priority)}
                className="rounded-full whitespace-nowrap"
              >
                {getPriorityLabel(priority)}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="mobile-main">
        {/* Stats */}
        <section className="px-4 py-4 bg-white border-b border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-lulo-pink">{wishlistItems.length}</div>
              <div className="text-xs text-gray-600">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-lulo-coral">
                {wishlistItems.filter((item: any) => item.giftMe).length}
              </div>
              <div className="text-xs text-gray-600">Gift Me</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-lulo-sage">
                ${totalValue.toFixed(0)}
              </div>
              <div className="text-xs text-gray-600">Total Value</div>
            </div>
          </div>
        </section>

        {/* Wishlist Items */}
        <section className="px-4 py-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3 card-shadow animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((wishlistItem: any) => (
                <div key={wishlistItem.id} className="relative">
                  <ItemCard 
                    item={wishlistItem.item} 
                    onRemove={() => removeFromWishlistMutation.mutate(wishlistItem.item.id)}
                  />
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    <Badge 
                      className={`text-xs text-white ${getPriorityColor(wishlistItem.priority)}`}
                    >
                      {getPriorityLabel(wishlistItem.priority)}
                    </Badge>
                    {wishlistItem.giftMe && (
                      <Badge variant="secondary" className="text-xs bg-lulo-pink text-white">
                        <Gift className="w-3 h-3 mr-1" />
                        Gift Me
                      </Badge>
                    )}
                  </div>
                  {wishlistItem.notes && (
                    <div className="absolute bottom-12 left-2 right-2">
                      <div className="bg-black bg-opacity-70 text-white text-xs p-2 rounded">
                        {wishlistItem.notes}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {searchQuery || selectedPriority ? "No items match your search" : "Your wishlist is empty"}
              </p>
              <p className="text-sm text-gray-400">
                {searchQuery || selectedPriority ? "Try adjusting your filters" : "Start adding items you want to buy"}
              </p>
            </div>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
