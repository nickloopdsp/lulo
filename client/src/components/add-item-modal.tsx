import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Link, Plus, Heart, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const addItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().default("USD"),
  brand: z.string().optional(),
  imageUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean().default(true),
  destination: z.enum(["wishlist", "closet"]).default("wishlist"),
  folder: z.string().optional(),
});

type AddItemForm = z.infer<typeof addItemSchema>;

interface AddItemModalProps {
  onSuccess?: () => void;
  prefillData?: Partial<AddItemForm>;
}

export default function AddItemModal({ onSuccess, prefillData = {} }: AddItemModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addMethod, setAddMethod] = useState<"manual" | "camera" | "link" | "createWishlist" | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isScrapingLink, setIsScrapingLink] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [wishlistName, setWishlistName] = useState("");
  const [wishlistPrivacy, setWishlistPrivacy] = useState("public");
  const [isCreatingWishlist, setIsCreatingWishlist] = useState(false);

  // Query for existing wishlist folders
  const { data: existingFolders = [] } = useQuery({
    queryKey: ['/api/wishlist/folders'],
    enabled: true,
  }) as { data: string[] };

  const initialData = {
    name: "",
    description: "",
    price: "",
    currency: "USD",
    brand: "",
    imageUrl: "",
    sourceUrl: "",
    category: "",
    isPublic: true,
    destination: "wishlist" as const,
    folder: "none",
    ...prefillData,
  };

  const form = useForm<AddItemForm>({
    resolver: zodResolver(addItemSchema),
    defaultValues: initialData,
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: AddItemForm) => {
      // Step 1: Create the item
      const itemPayload = {
        name: data.name,
        description: data.description || "",
        price: data.price ? parseFloat(data.price) : undefined,
        currency: data.currency,
        brand: data.brand || "",
        imageUrl: data.imageUrl || "",
        sourceUrl: data.sourceUrl || "",
        category: data.category || "",
        isPublic: data.isPublic,
      };
      
      const response = await apiRequest("POST", "/api/items", itemPayload);
      const createdItem = await response.json();
      
      // Step 2: Add to wishlist or closet
      const destination = data.destination;
      const endpoint = destination === "wishlist" ? "/api/wishlist" : "/api/closet";
      
      if (destination === "wishlist") {
        const wishlistPayload = {
          itemId: createdItem.id,
          folder: data.folder && data.folder !== "" ? data.folder : null,
        };
        await apiRequest("POST", endpoint, wishlistPayload);
      } else {
        const closetPayload = {
          itemId: createdItem.id,
        };
        await apiRequest("POST", endpoint, closetPayload);
      }
      
      return { item: createdItem, destination };
    },
    onSuccess: (result) => {
      toast({
        title: "Success!",
        description: `Item added to your ${result.destination}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/${result.destination}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/folders"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddItemForm) => {
    if (isCreatingNewFolder && newFolderName) {
      data.folder = newFolderName;
    } else if (data.folder === "none") {
      data.folder = "";
    }
    createItemMutation.mutate(data);
  };

  const handleCameraCapture = () => {
    toast({
      title: "Camera feature",
      description: "Camera integration would be implemented here",
    });
  };

  const handleLinkParse = async () => {
    if (!linkUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsScrapingLink(true);
    try {
      const response = await fetch('/api/products/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkUrl }),
      });

      if (!response.ok) throw new Error('Failed to scrape URL');

      const scrapedData = await response.json();
      
      form.setValue('name', scrapedData.name || '');
      form.setValue('brand', scrapedData.brand || '');
      form.setValue('price', scrapedData.price?.replace(/[^0-9.]/g, '') || '');
      form.setValue('description', scrapedData.description || '');
      form.setValue('category', scrapedData.category || '');
      form.setValue('imageUrl', scrapedData.imageUrl || '');
      form.setValue('sourceUrl', scrapedData.sourceUrl || linkUrl);
      
      setAddMethod("manual");
      
      toast({
        title: "Success",
        description: "Product information extracted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract product information. Please try manual entry.",
        variant: "destructive",
      });
    } finally {
      setIsScrapingLink(false);
    }
  };

  const handleCreateWishlist = async () => {
    if (!wishlistName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wishlist name",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingWishlist(true);
    try {
      // TODO: Replace with actual API call to create wishlist
      const response = await fetch('/api/wishlist/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: wishlistName,
          privacy: wishlistPrivacy 
        }),
      });

      if (!response.ok) throw new Error('Failed to create wishlist');

      toast({
        title: "Success",
        description: `Wishlist "${wishlistName}" created successfully!`,
      });

      // Reset form and close modal
      setWishlistName("");
      setWishlistPrivacy("public");
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist/folders'] });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingWishlist(false);
    }
  };

  const currentDestination = form.watch('destination');

  return (
    <div className="w-full max-w-md">
      {!addMethod ? (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Add Item</h3>
            <p className="text-sm text-gray-600">Choose how you want to add this item</p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-lulo-pink hover:bg-lulo-coral text-white p-4 rounded-xl flex items-center justify-center space-x-3"
              onClick={() => setAddMethod("camera")}
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo</span>
            </Button>

            <Button
              className="w-full bg-lulo-sage hover:bg-lulo-sage/90 text-white p-4 rounded-xl flex items-center justify-center space-x-3"
              onClick={() => setAddMethod("link")}
            >
              <Link className="w-5 h-5" />
              <span>Add from Link</span>
            </Button>

            <Button
              className="w-full bg-lulo-coral hover:bg-lulo-coral/90 text-white p-4 rounded-xl flex items-center justify-center space-x-3"
              onClick={() => setAddMethod("manual")}
            >
              <Plus className="w-5 h-5" />
              <span>Add Manually</span>
            </Button>

            <div className="border-t border-gray-200 my-4"></div>

            <Button
              className="w-full bg-[#FADADD] hover:bg-[#FADADD]/90 text-white p-4 rounded-xl flex items-center justify-center space-x-3"
              onClick={() => setAddMethod("createWishlist")}
            >
              <Heart className="w-5 h-5" />
              <span>Create New Wishlist</span>
            </Button>
          </div>
        </div>
      ) : addMethod === "camera" ? (
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Camera Access</h4>
            <p className="text-sm text-gray-600 mb-4">
              Take a photo of the item you want to add
            </p>
            <Button
              onClick={handleCameraCapture}
              className="bg-lulo-pink hover:bg-lulo-coral text-white mb-2"
            >
              Open Camera
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setAddMethod("manual")}
            className="w-full"
          >
            Add Details Manually Instead
          </Button>
        </div>
      ) : addMethod === "link" ? (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">Add from Link</h4>
            <p className="text-sm text-gray-600">
              Paste a product URL and we'll extract the details
            </p>
          </div>
          <div className="space-y-3">
            <Input
              placeholder="https://example.com/product"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLinkParse();
                }
              }}
            />
            <Button
              onClick={handleLinkParse}
              disabled={isScrapingLink}
              className="w-full bg-lulo-sage hover:bg-lulo-sage/90 text-white"
            >
              {isScrapingLink ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                'Parse Link'
              )}
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setAddMethod("manual")}
            className="w-full"
          >
            Add Details Manually Instead
          </Button>
        </div>
      ) : addMethod === "createWishlist" ? (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">Create New Wishlist</h4>
            <p className="text-sm text-gray-600">
              Create a new wishlist to organize your saved items
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wishlist Name
              </label>
              <Input
                placeholder="Enter wishlist name..."
                value={wishlistName}
                onChange={(e) => setWishlistName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Privacy Setting
              </label>
              <Select value={wishlistPrivacy} onValueChange={setWishlistPrivacy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can view</SelectItem>
                  <SelectItem value="private">Private - Only you can view</SelectItem>
                  <SelectItem value="collaborative">Collaborative - Shared with friends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setAddMethod(null)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleCreateWishlist}
              disabled={isCreatingWishlist}
              className="flex-1 bg-[#FADADD] hover:bg-[#FADADD]/90 text-white"
            >
              {isCreatingWishlist ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Wishlist'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Destination Selection */}
            <div className="space-y-3">
              <h4 className="font-semibold">Where to save?</h4>
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="wishlist" id="wishlist" />
                          <Label htmlFor="wishlist" className="flex items-center cursor-pointer">
                            <Heart className="w-4 h-4 mr-2 text-lulo-pink" />
                            Wishlist
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="closet" id="closet" />
                          <Label htmlFor="closet" className="flex items-center cursor-pointer">
                            <ShoppingBag className="w-4 h-4 mr-2 text-lulo-sage" />
                            Closet
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Folder Selection for Wishlist */}
            {currentDestination === "wishlist" && (
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="folder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Folder (Optional)</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={(value) => {
                            if (value === "new_folder") {
                              setIsCreatingNewFolder(true);
                              field.onChange("");
                            } else {
                              setIsCreatingNewFolder(false);
                              field.onChange(value);
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose folder..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Folder</SelectItem>
                            {existingFolders.map((folder: string) => (
                              <SelectItem key={folder} value={folder}>
                                {folder}
                              </SelectItem>
                            ))}
                            <SelectItem value="new_folder">+ Create New Folder</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {isCreatingNewFolder && (
                  <div className="space-y-2">
                    <Label htmlFor="newFolder">New Folder Name</Label>
                    <Input
                      id="newFolder"
                      placeholder="Enter folder name..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {/* Preview image if available */}
              {form.watch('imageUrl') && (
                <div>
                  <img 
                    src={form.watch('imageUrl')} 
                    alt={form.watch('name') || 'Product preview'}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                    }}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="White Summer Dress" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the item..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="89.99" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="USD" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Zara" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="jewelry">Jewelry</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://store.com/product" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div>
                      <FormLabel>Make this item public</FormLabel>
                      <p className="text-xs text-gray-500">
                        Allow others to discover this item
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddMethod(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={createItemMutation.isPending}
                className="flex-1 bg-lulo-pink hover:bg-lulo-coral text-white"
              >
                {createItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  `Add to ${currentDestination === 'wishlist' ? 'Wishlist' : 'Closet'}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
