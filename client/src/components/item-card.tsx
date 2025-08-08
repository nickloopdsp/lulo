import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ExternalLink, Plus, Gift, Lock, Users, Globe, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PriceTracker from "./price-tracker";
import { ItemImage } from "@/components/ui/item-image";
import RetailerButtons from "@/components/retailer-buttons";

interface ItemCardProps {
  item: any;
  compact?: boolean;
  onRemove?: () => void;
}

export default function ItemCard({ item, compact = false, onRemove }: ItemCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [wishlistForm, setWishlistForm] = useState({
    visibility: "public",
    priority: 3,
    giftMe: false,
    notes: "",
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (formData: typeof wishlistForm) => {
      return await apiRequest("POST", "/api/wishlist", {
        itemId: item.id,
        ...formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to wishlist!",
        description: `${item.name} has been added to your wishlist.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      setShowWishlistModal(false);
      setWishlistForm({ visibility: "public", priority: 3, giftMe: false, notes: "" });
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

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "private": return <Lock className="w-4 h-4" />;
      case "friends": return <Users className="w-4 h-4" />;
      case "public": return <Globe className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <ItemImage
            imageUrl={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
            width={48}
            height={48}
            showLoading={false}
          />
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
    <Card className="w-full bg-white rounded-xl card-shadow overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
            <ItemImage
              imageUrl={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              width={300}
              height={128}
            />
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 h-6 w-6 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
            >
              ×
            </Button>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">
              {item.price && `$${item.price}`} {item.brand && `• ${item.brand}`}
            </p>
          </div>
          
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
              
              {item.price && (
                <PriceTracker 
                  itemId={item.id} 
                  currentPrice={parseFloat(item.price)}
                  currency={item.currency}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 text-lulo-sage hover:text-lulo-dark"
                  >
                    <TrendingDown className="w-4 h-4" />
                  </Button>
                </PriceTracker>
              )}
              
              <RetailerButtons item={item} size="xs" />
            </div>
            
            <Dialog open={showWishlistModal} onOpenChange={setShowWishlistModal}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-lulo-pink hover:bg-lulo-coral text-white px-3 py-1 h-6 text-xs font-medium rounded-full"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4 rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-center">Add to Wishlist</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Visibility */}
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select 
                      value={wishlistForm.visibility} 
                      onValueChange={(value) => setWishlistForm({...wishlistForm, visibility: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>Public</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="friends">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Friends Only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center space-x-2">
                            <Lock className="w-4 h-4" />
                            <span>Private</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={wishlistForm.priority.toString()} 
                      onValueChange={(value) => setWishlistForm({...wishlistForm, priority: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Must Have</SelectItem>
                        <SelectItem value="4">High</SelectItem>
                        <SelectItem value="3">Medium</SelectItem>
                        <SelectItem value="2">Low</SelectItem>
                        <SelectItem value="1">Maybe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gift Me Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="giftMe" className="flex items-center space-x-2">
                      <Gift className="w-4 h-4" />
                      <span>Gift Me</span>
                    </Label>
                    <Switch
                      id="giftMe"
                      checked={wishlistForm.giftMe}
                      onCheckedChange={(checked) => setWishlistForm({...wishlistForm, giftMe: checked})}
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add sizing info, urgency, occasion, etc."
                      value={wishlistForm.notes}
                      onChange={(e) => setWishlistForm({...wishlistForm, notes: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full bg-lulo-pink hover:bg-lulo-coral text-white"
                    onClick={() => addToWishlistMutation.mutate(wishlistForm)}
                    disabled={addToWishlistMutation.isPending}
                  >
                    {addToWishlistMutation.isPending ? "Adding..." : "Add to Wishlist"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {item.category && (
            <Badge variant="outline" className="mt-2 text-xs">
              {item.category}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
