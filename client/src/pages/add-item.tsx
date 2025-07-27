import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Link, Plus, ArrowLeft, Heart, ShoppingBag, Loader2 } from "lucide-react";
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
import { useLocation } from "wouter";

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
  folder: z.string().optional(), // For wishlist folder selection
});

type AddItemForm = z.infer<typeof addItemSchema>;

export default function AddItem() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addMethod, setAddMethod] = useState<"manual" | "camera" | "link" | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isScrapingLink, setIsScrapingLink] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);

  // Query for existing wishlist folders
  const { data: existingFolders = [] } = useQuery({
    queryKey: ['/api/wishlist/folders'],
    enabled: true,
  }) as { data: string[] };

  // Check for pre-filled data from image recognition
  const urlParams = new URLSearchParams(window.location.search);
  const prefillData = urlParams.get('prefill');
  let initialData = {
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
  };

  if (prefillData) {
    try {
      const parsedData = JSON.parse(decodeURIComponent(prefillData));
      initialData = {
        ...initialData,
        name: parsedData.name || "",
        brand: parsedData.brand || "",
        price: parsedData.price ? parsedData.price.toString() : "",
        category: parsedData.category || "",
        imageUrl: parsedData.imageUrl || "",
      };
      // Auto-set to manual mode if we have pre-filled data
      if (!addMethod) {
        setAddMethod("manual");
      }
    } catch (error) {
      console.error("Error parsing prefill data:", error);
    }
  }

  const form = useForm<AddItemForm>({
    resolver: zodResolver(addItemSchema),
    defaultValues: initialData,
  });

  // Two-step mutation: first create item, then add to wishlist/closet
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
      navigate("/");
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
    // If creating new folder, use the new folder name
    if (isCreatingNewFolder && newFolderName) {
      data.folder = newFolderName;
    } else if (data.folder === "none") {
      // Convert "none" back to empty string for no folder
      data.folder = "";
    }
    createItemMutation.mutate(data);
  };

  const handleCameraCapture = () => {
    // In a real app, this would open the camera
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
      
      // Update form with scraped data
      form.setValue('name', scrapedData.name || '');
      form.setValue('brand', scrapedData.brand || '');
      form.setValue('price', scrapedData.price?.replace(/[^0-9.]/g, '') || '');
      form.setValue('description', scrapedData.description || '');
      form.setValue('category', scrapedData.category || '');
      form.setValue('imageUrl', scrapedData.imageUrl || '');
      form.setValue('sourceUrl', scrapedData.sourceUrl || linkUrl);
      
      // Move to manual mode to show the form
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

  const currentDestination = form.watch('destination');

  return (
    <div className="mobile-app-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Add Item</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mobile-main p-4">
        {!addMethod ? (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How do you want to add this item?</h2>
              <p className="text-gray-600">Choose the method that works best for you</p>
            </div>

            <Card className="card-shadow">
              <CardContent className="p-6">
                <Button
                  className="w-full bg-lulo-pink hover:bg-lulo-coral text-white p-6 rounded-xl flex items-center justify-center space-x-3 h-auto"
                  onClick={() => setAddMethod("camera")}
                >
                  <Camera className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium">Take Photo</div>
                    <div className="text-sm opacity-90">Capture an item with your camera</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-6">
                <Button
                  className="w-full bg-lulo-sage hover:bg-lulo-sage/90 text-white p-6 rounded-xl flex items-center justify-center space-x-3 h-auto"
                  onClick={() => setAddMethod("link")}
                >
                  <Link className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium">Add from Link</div>
                    <div className="text-sm opacity-90">Paste a product URL</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-6">
                <Button
                  className="w-full bg-lulo-coral hover:bg-lulo-coral/90 text-white p-6 rounded-xl flex items-center justify-center space-x-3 h-auto"
                  onClick={() => setAddMethod("manual")}
                >
                  <Plus className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium">Add Manually</div>
                    <div className="text-sm opacity-90">Enter details yourself</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : addMethod === "camera" ? (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Camera Access</h3>
              <p className="text-gray-600 mb-4">
                Take a photo of the item you want to add to your collection
              </p>
              <Button
                onClick={handleCameraCapture}
                className="bg-lulo-pink hover:bg-lulo-coral text-white"
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
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Add from Link</h3>
              <p className="text-gray-600">
                Paste a product URL and we'll automatically extract the details
              </p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="https://example.com/product"
                className="text-center"
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
                    Extracting Product Info...
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
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Destination Selection */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Where to save?</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Folder Selection for Wishlist */}
              {currentDestination === "wishlist" && (
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Wishlist Folder</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="folder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Folder (Optional)</FormLabel>
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
                                <SelectValue placeholder="Choose folder or create new..." />
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
                  </CardContent>
                </Card>
              )}

              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview image if available */}
                  {form.watch('imageUrl') && (
                    <div className="mb-4">
                      <img 
                        src={form.watch('imageUrl')} 
                        alt={form.watch('name') || 'Product preview'}
                        className="w-full h-48 object-cover rounded-lg"
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
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                          <p className="text-sm text-gray-500">
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
                </CardContent>
              </Card>

              <div className="flex space-x-3">
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
      </main>
    </div>
  );
}
