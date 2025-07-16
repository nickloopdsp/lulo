import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Crown, Eye, EyeOff, Users, Lock, Globe, Trash2, Gift, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemImage } from "@/components/ui/item-image";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// TypeScript type for flattened wishlist items (matching the main wishlist page)
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
  // Flattened item properties
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

interface WishlistItemEditModalProps {
  wishlistItem: WishlistItem;
  children?: React.ReactNode;
}

export default function WishlistItemEditModal({ wishlistItem, children }: WishlistItemEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    visibility: wishlistItem.visibility || "public",
    priority: wishlistItem.priority || 3,
    giftMe: wishlistItem.giftMe || false,
    notes: wishlistItem.notes || "",
  });

  const updateWishlistMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PUT", `/api/wishlist/${wishlistItem.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Wishlist item updated!",
        description: "Your wishlist item has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      setShowModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating item",
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

  const handleSubmit = () => {
    updateWishlistMutation.mutate(formData);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="p-1">
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center">Edit Wishlist Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Item Preview */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <ItemImage
                imageUrl={wishlistItem.imageUrl}
                alt={wishlistItem.name}
                className="w-full h-full object-cover rounded-lg"
                width={48}
                height={48}
                showLoading={false}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{wishlistItem.name}</p>
              <p className="text-xs text-gray-500">
                {wishlistItem.price && `$${wishlistItem.price}`} 
                {wishlistItem.brand && `• ${wishlistItem.brand}`}
              </p>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select 
              value={formData.visibility} 
              onValueChange={(value) => setFormData({...formData, visibility: value})}
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
              value={formData.priority.toString()} 
              onValueChange={(value) => setFormData({...formData, priority: parseInt(value)})}
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
              checked={formData.giftMe}
              onCheckedChange={(checked) => setFormData({...formData, giftMe: checked})}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add sizing info, urgency, occasion, etc."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-lulo-pink hover:bg-lulo-coral text-white"
              onClick={handleSubmit}
              disabled={updateWishlistMutation.isPending}
            >
              {updateWishlistMutation.isPending ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 