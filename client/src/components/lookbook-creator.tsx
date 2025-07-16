import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, X, Save, Share2, Palette, Layout, Grid, 
  ShoppingBag, Heart, Camera, Download, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LookbookCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLookbook?: any;
}

interface LookbookItem {
  id: string;
  itemId: number;
  item: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  source: 'wishlist' | 'closet';
}

export default function LookbookCreator({ open, onOpenChange, editingLookbook }: LookbookCreatorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [lookbookData, setLookbookData] = useState({
    title: editingLookbook?.title || "",
    description: editingLookbook?.description || "",
    visibility: editingLookbook?.visibility || "public",
    category: editingLookbook?.category || "general",
  });
  
  const [canvasItems, setCanvasItems] = useState<LookbookItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 600 });
  const [backgroundStyle, setBackgroundStyle] = useState("white");
  const [draggedItem, setDraggedItem] = useState<any>(null);

  // Fetch user's wishlist and closet items
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: open,
  });

  const { data: closetItems = [] } = useQuery({
    queryKey: ["/api/closet"],
    enabled: open,
  });

  const createLookbookMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/lookbooks", data);
    },
    onSuccess: () => {
      toast({
        title: "Lookbook created!",
        description: "Your lookbook has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lookbooks"] });
      onOpenChange(false);
      resetCanvas();
    },
    onError: (error) => {
      toast({
        title: "Error creating lookbook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = useCallback(() => {
    if (!lookbookData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title for your lookbook.",
        variant: "destructive",
      });
      return;
    }

    if (canvasItems.length === 0) {
      toast({
        title: "Add items",
        description: "Please add at least one item to your lookbook.",
        variant: "destructive",
      });
      return;
    }

    // Generate canvas screenshot
    const canvas = canvasRef.current;
    if (!canvas) return;

    // In a real implementation, you'd use html2canvas or similar
    // For now, we'll save the layout data
    const lookbookPayload = {
      ...lookbookData,
      items: canvasItems,
      canvasSize,
      backgroundStyle,
      imageUrl: `/api/lookbooks/preview/${Date.now()}`, // Mock preview URL
    };

    createLookbookMutation.mutate(lookbookPayload);
  }, [lookbookData, canvasItems, canvasSize, backgroundStyle, createLookbookMutation, toast]);

  const resetCanvas = useCallback(() => {
    setCanvasItems([]);
    setSelectedItem(null);
    setLookbookData({
      title: "",
      description: "",
      visibility: "public",
      category: "general",
    });
  }, []);

  const handleDragStart = useCallback((item: any, source: 'wishlist' | 'closet') => {
    setDraggedItem({ ...item, source });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newItem: LookbookItem = {
      id: `${draggedItem.source}-${draggedItem.id || draggedItem.itemId}-${Date.now()}`,
      itemId: draggedItem.id || draggedItem.itemId,
      item: draggedItem.item || draggedItem,
      position: { x: Math.max(0, x - 50), y: Math.max(0, y - 50) },
      size: { width: 100, height: 120 },
      rotation: 0,
      zIndex: canvasItems.length + 1,
      source: draggedItem.source,
    };

    setCanvasItems(prev => [...prev, newItem]);
    setDraggedItem(null);
  }, [draggedItem, canvasItems.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeCanvasItem = useCallback((itemId: string) => {
    setCanvasItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItem(null);
  }, []);

  const updateCanvasItem = useCallback((itemId: string, updates: Partial<LookbookItem>) => {
    setCanvasItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);

  const generateAILayout = useCallback(() => {
    if (canvasItems.length === 0) {
      toast({
        title: "Add items first",
        description: "Please add some items before generating an AI layout.",
        variant: "destructive",
      });
      return;
    }

    // Mock AI layout generation
    const updatedItems = canvasItems.map((item, index) => {
      const cols = Math.ceil(Math.sqrt(canvasItems.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      return {
        ...item,
        position: {
          x: (col * 120) + 20,
          y: (row * 140) + 20,
        },
        size: { width: 100, height: 120 },
        rotation: Math.random() * 10 - 5, // Slight random rotation
      };
    });

    setCanvasItems(updatedItems);
    toast({
      title: "AI layout applied!",
      description: "Items have been automatically arranged.",
    });
  }, [canvasItems, toast]);

  const categories = [
    { value: "general", label: "General Style" },
    { value: "event", label: "Event Planning" },
    { value: "travel", label: "Travel/Packing" },
    { value: "season", label: "Seasonal" },
    { value: "occasion", label: "Special Occasion" },
    { value: "color", label: "Color Coordination" },
  ];

  const backgrounds = [
    { value: "white", label: "White", style: "bg-white" },
    { value: "cream", label: "Cream", style: "bg-lulo-cream" },
    { value: "sage", label: "Sage", style: "bg-lulo-sage" },
    { value: "pink", label: "Pink", style: "bg-lulo-pink" },
    { value: "gradient", label: "Gradient", style: "bg-gradient-to-br from-lulo-pink to-lulo-coral" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl mx-4 rounded-xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center">Create Lookbook</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Left Panel - Items */}
          <div className="w-80 border-r border-gray-200 p-4 overflow-y-auto">
            <Tabs defaultValue="wishlist" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wishlist">
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </TabsTrigger>
                <TabsTrigger value="closet">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Closet
                </TabsTrigger>
              </TabsList>
              
                             <TabsContent value="wishlist" className="space-y-2">
                 <p className="text-sm text-gray-600 mb-4">Drag items to your canvas</p>
                 {(wishlistItems as any[]).map((wishlistItem: any) => (
                  <div
                    key={wishlistItem.id}
                    draggable
                    onDragStart={() => handleDragStart(wishlistItem, 'wishlist')}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {wishlistItem.item.imageUrl ? (
                        <img 
                          src={wishlistItem.item.imageUrl} 
                          alt={wishlistItem.item.name} 
                          className="w-full h-full object-cover rounded-lg" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-lg" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{wishlistItem.item.name}</p>
                      <p className="text-xs text-gray-500">
                        {wishlistItem.item.brand && `${wishlistItem.item.brand}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">Want</Badge>
                  </div>
                ))}
              </TabsContent>
              
                             <TabsContent value="closet" className="space-y-2">
                 <p className="text-sm text-gray-600 mb-4">Drag items to your canvas</p>
                 {(closetItems as any[]).map((closetItem: any) => (
                  <div
                    key={closetItem.id}
                    draggable
                    onDragStart={() => handleDragStart(closetItem, 'closet')}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                  >
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
                    <Badge variant="outline" className="text-xs">Own</Badge>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Canvas Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={generateAILayout}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Layout</span>
                  </Button>
                  <Select value={backgroundStyle} onValueChange={setBackgroundStyle}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Background" />
                    </SelectTrigger>
                    <SelectContent>
                      {backgrounds.map((bg) => (
                        <SelectItem key={bg.value} value={bg.value}>
                          {bg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={resetCanvas} size="sm" variant="outline">
                    Clear
                  </Button>
                  <Button onClick={handleSave} size="sm" className="bg-lulo-pink hover:bg-lulo-coral text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  ref={canvasRef}
                  className={`relative border-2 border-dashed border-gray-300 rounded-lg ${
                    backgrounds.find(bg => bg.value === backgroundStyle)?.style || "bg-white"
                  }`}
                  style={{ width: canvasSize.width, height: canvasSize.height }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {canvasItems.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Layout className="w-12 h-12 mx-auto mb-2" />
                        <p>Drag items here to create your lookbook</p>
                      </div>
                    </div>
                  )}
                  
                  {canvasItems.map((item) => (
                    <div
                      key={item.id}
                      className={`absolute cursor-move border-2 rounded-lg overflow-hidden ${
                        selectedItem === item.id ? "border-lulo-pink" : "border-transparent"
                      }`}
                      style={{
                        left: item.position.x,
                        top: item.position.y,
                        width: item.size.width,
                        height: item.size.height,
                        transform: `rotate(${item.rotation}deg)`,
                        zIndex: item.zIndex,
                      }}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      {item.item.imageUrl ? (
                        <img 
                          src={item.item.imageUrl} 
                          alt={item.item.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className={`w-full h-full ${
                          item.source === 'wishlist' 
                            ? 'bg-gradient-to-br from-lulo-pink to-lulo-coral' 
                            : 'bg-gradient-to-br from-lulo-sage to-lulo-coral'
                        }`} />
                      )}
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCanvasItem(item.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 p-1 h-6 w-6 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      
                      <Badge 
                        variant="secondary" 
                        className={`absolute bottom-1 left-1 text-xs ${
                          item.source === 'wishlist' ? 'bg-lulo-pink text-white' : 'bg-lulo-sage text-white'
                        }`}
                      >
                        {item.source === 'wishlist' ? 'Want' : 'Own'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Settings */}
          <div className="w-80 border-l border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="My Summer Vacation Outfits"
                  value={lookbookData.title}
                  onChange={(e) => setLookbookData({...lookbookData, title: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your lookbook..."
                  value={lookbookData.description}
                  onChange={(e) => setLookbookData({...lookbookData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={lookbookData.category} 
                  onValueChange={(value) => setLookbookData({...lookbookData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select 
                  value={lookbookData.visibility} 
                  onValueChange={(value) => setLookbookData({...lookbookData, visibility: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedItem && (
                <Card className="border-lulo-pink">
                  <CardHeader>
                    <CardTitle className="text-sm">Selected Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs">Size:</Label>
                      <Input
                        type="number"
                        value={canvasItems.find(item => item.id === selectedItem)?.size.width || 100}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value);
                          updateCanvasItem(selectedItem, {
                            size: { width: newSize, height: newSize * 1.2 }
                          });
                        }}
                        className="w-16 h-6 text-xs"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs">Rotation:</Label>
                      <Input
                        type="number"
                        value={canvasItems.find(item => item.id === selectedItem)?.rotation || 0}
                        onChange={(e) => {
                          updateCanvasItem(selectedItem, {
                            rotation: parseInt(e.target.value)
                          });
                        }}
                        className="w-16 h-6 text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Tips:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Drag items from your wishlist or closet</li>
                  <li>• Click items to select and customize</li>
                  <li>• Use AI Layout for automatic arrangement</li>
                  <li>• Mix wishlist and closet items for styling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 