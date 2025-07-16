import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Tag, Palette, Calendar, DollarSign, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ClosetItemEditModalProps {
  closetItem: any;
  children?: React.ReactNode;
}

export default function ClosetItemEditModal({ closetItem, children }: ClosetItemEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    notes: closetItem.notes || "",
    size: closetItem.size || "",
    condition: closetItem.condition || "good",
    borrowable: closetItem.borrowable || false,
    frequency: closetItem.frequency || "sometimes",
    color: closetItem.color || "",
    tags: closetItem.tags ? JSON.parse(closetItem.tags) : [],
    purchasePrice: closetItem.purchasePrice || "",
    purchaseDate: closetItem.purchaseDate || "",
  });
  const [newTag, setNewTag] = useState("");

  const updateClosetMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PUT", `/api/closet/${closetItem.id}`, {
        ...data,
        tags: JSON.stringify(data.tags),
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Closet item updated!",
        description: "Your closet item has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/closet"] });
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

  const handleSubmit = () => {
    updateClosetMutation.mutate(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: string) => tag !== tagToRemove)
    });
  };

  const colors = [
    "Black", "White", "Gray", "Brown", "Beige", "Red", "Pink", "Orange", 
    "Yellow", "Green", "Blue", "Purple", "Navy", "Burgundy", "Cream"
  ];

  const conditions = [
    { value: "new", label: "New with tags" },
    { value: "like_new", label: "Like new" },
    { value: "good", label: "Good condition" },
    { value: "fair", label: "Fair condition" },
    { value: "poor", label: "Poor condition" },
  ];

  const frequencies = [
    { value: "rarely", label: "Rarely (1-2 times/year)" },
    { value: "sometimes", label: "Sometimes (monthly)" },
    { value: "often", label: "Often (weekly)" },
  ];

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="p-1">
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Edit Closet Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Item Preview */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              {closetItem.item.imageUrl ? (
                <img 
                  src={closetItem.item.imageUrl} 
                  alt={closetItem.item.name} 
                  className="w-full h-full object-cover rounded-lg" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-lulo-sage to-lulo-coral rounded-lg" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{closetItem.item.name}</p>
              <p className="text-xs text-gray-500">
                {closetItem.item.brand && `${closetItem.item.brand}`}
              </p>
            </div>
          </div>

          {/* Size & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                placeholder="M, L, 8, 36, etc."
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select 
                value={formData.condition} 
                onValueChange={(value) => setFormData({...formData, condition: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Primary Color</Label>
            <Select 
              value={formData.color} 
              onValueChange={(value) => setFormData({...formData, color: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color} value={color.toLowerCase()}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      <span>{color}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add tag (e.g., casual, work, party)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm" variant="outline">
                <Tag className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">How often do you wear this?</Label>
            <Select 
              value={formData.frequency} 
              onValueChange={(value) => setFormData({...formData, frequency: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purchase Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="89.99"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
              />
            </div>
          </div>

          {/* Borrowable Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="borrowable" className="flex items-center space-x-2">
              <Shirt className="w-4 h-4" />
              <span>Available to borrow</span>
            </Label>
            <Switch
              id="borrowable"
              checked={formData.borrowable}
              onCheckedChange={(checked) => setFormData({...formData, borrowable: checked})}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Fit notes, styling tips, care instructions..."
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
              className="flex-1 bg-lulo-sage hover:bg-lulo-sage/90 text-white"
              onClick={handleSubmit}
              disabled={updateClosetMutation.isPending}
            >
              {updateClosetMutation.isPending ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 