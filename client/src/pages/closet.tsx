import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/bottom-navigation";
import ItemCard from "@/components/item-card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Closet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: closetItems = [], isLoading } = useQuery({
    queryKey: ["/api/closet"],
  });

  const removeFromClosetMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest("DELETE", `/api/closet/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Item removed from closet",
        description: "The item has been removed from your closet.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/closet"] });
    },
    onError: (error) => {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredItems = closetItems.filter((closetItem: any) => {
    const matchesSearch = closetItem.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         closetItem.item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || closetItem.item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(closetItems.map((item: any) => item.item.category).filter(Boolean)));

  return (
    <div className="mobile-app-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">My Closet</h1>
            <Button
              size="sm"
              className="bg-lulo-sage hover:bg-lulo-sage/90 text-white"
              onClick={() => {
                // In a real app, this would open the add item modal
                toast({
                  title: "Add item to closet",
                  description: "Navigate to Add Item to add new items to your closet.",
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
              placeholder="Search your closet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-0 rounded-xl"
            />
          </div>

          {/* Category filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full whitespace-nowrap"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full whitespace-nowrap"
              >
                {category}
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
              <div className="text-2xl font-bold text-lulo-sage">{closetItems.length}</div>
              <div className="text-xs text-gray-600">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-lulo-coral">
                {closetItems.filter((item: any) => item.borrowable).length}
              </div>
              <div className="text-xs text-gray-600">Borrowable</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-lulo-pink">{categories.length}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
          </div>
        </section>

        {/* Closet Items */}
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
              {filteredItems.map((closetItem: any) => (
                <div key={closetItem.id} className="relative">
                  <ItemCard 
                    item={closetItem.item} 
                    onRemove={() => removeFromClosetMutation.mutate(closetItem.item.id)}
                  />
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {closetItem.borrowable && (
                      <Badge variant="secondary" className="text-xs bg-lulo-sage text-white">
                        Borrowable
                      </Badge>
                    )}
                    {closetItem.size && (
                      <Badge variant="outline" className="text-xs">
                        {closetItem.size}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">
                {searchQuery || selectedCategory ? "No items match your search" : "Your closet is empty"}
              </p>
              <p className="text-sm text-gray-400">
                {searchQuery || selectedCategory ? "Try adjusting your filters" : "Start adding items to organize your wardrobe"}
              </p>
            </div>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
