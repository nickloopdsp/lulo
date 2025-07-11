import { Heart, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ItemCardProps {
  item: any;
  compact?: boolean;
  onRemove?: () => void;
}

export default function ItemCard({ item, compact = false, onRemove }: ItemCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/wishlist", {
        itemId: item.id,
        visibility: "public",
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to wishlist!",
        description: `${item.name} has been added to your wishlist.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error) => {
      toast({
        title: "Error adding to wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/like/${item.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item liked!",
        description: "You liked this item.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error liking item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-lg" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
          <p className="text-xs text-gray-500">
            {item.price && `$${item.price}`} {item.brand && `• ${item.brand}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="item-card card-shadow animate-fade-in overflow-hidden">
      <div className="relative">
        <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-lulo-pink to-lulo-coral" />
          )}
        </div>
        
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 w-6 h-6 bg-white bg-opacity-80 hover:bg-opacity-100"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-lulo-gray text-xs mb-2">
          {item.price && `$${item.price}`} {item.brand && `• ${item.brand}`}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className="p-0 h-6 text-lulo-pink hover:text-lulo-coral"
            >
              <Heart className="w-4 h-4" />
            </Button>
            
            {item.sourceUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(item.sourceUrl, '_blank')}
                className="p-0 h-6 text-lulo-gray hover:text-lulo-dark"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={() => addToWishlistMutation.mutate()}
            disabled={addToWishlistMutation.isPending}
            className="bg-lulo-pink hover:bg-lulo-coral text-white px-3 py-1 h-6 text-xs font-medium rounded-full"
          >
            {addToWishlistMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </div>
        
        {item.category && (
          <Badge variant="outline" className="mt-2 text-xs">
            {item.category}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
