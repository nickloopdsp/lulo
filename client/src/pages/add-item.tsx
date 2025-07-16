import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Link, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
});

type AddItemForm = z.infer<typeof addItemSchema>;

export default function AddItem() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addMethod, setAddMethod] = useState<"manual" | "camera" | "link" | null>(null);

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

  const createItemMutation = useMutation({
    mutationFn: async (data: AddItemForm) => {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
      };
      return await apiRequest("POST", "/api/items", payload);
    },
    onSuccess: () => {
      toast({
        title: "Item added successfully!",
        description: "Your item has been added to the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
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
    createItemMutation.mutate(data);
  };

  const handleCameraCapture = () => {
    // In a real app, this would open the camera
    toast({
      title: "Camera feature",
      description: "Camera integration would be implemented here",
    });
  };

  const handleLinkParse = () => {
    // In a real app, this would parse the product link
    toast({
      title: "Link parsing",
      description: "Link parsing feature would be implemented here",
    });
  };

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
              />
              <Button
                onClick={handleLinkParse}
                className="w-full bg-lulo-sage hover:bg-lulo-sage/90 text-white"
              >
                Parse Link
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
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  {createItemMutation.isPending ? "Adding..." : "Add Item"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </main>
    </div>
  );
}
