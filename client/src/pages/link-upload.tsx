import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Link, Loader2, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { ItemImage } from "@/components/ui/item-image";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional(),
  price: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  folder: z.string().optional(),
  destination: z.enum(["wishlist", "closet"]).default("wishlist"),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function LinkUploadPage() {
  const [, navigate] = useLocation();
  const [linkUrl, setLinkUrl] = useState("");
  const [isScrapingLink, setIsScrapingLink] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      brand: "",
      price: "",
      description: "",
      category: "",
      imageUrl: "",
      sourceUrl: "",
      folder: "",
      destination: "wishlist",
    },
  });

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
      const response = await apiRequest("POST", "/api/products/scrape-url", {
        url: linkUrl
      });

      const scrapedData = await response.json();
      
      form.setValue('name', scrapedData.name || '');
      form.setValue('brand', scrapedData.brand || '');
      form.setValue('price', scrapedData.price?.replace(/[^0-9.]/g, '') || '');
      form.setValue('description', scrapedData.description || '');
      form.setValue('category', scrapedData.category || '');
      form.setValue('imageUrl', scrapedData.imageUrl || '');
      form.setValue('sourceUrl', scrapedData.sourceUrl || linkUrl);
      
      setShowForm(true);
      
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
      // Show form anyway for manual entry
      form.setValue('sourceUrl', linkUrl);
      setShowForm(true);
    } finally {
      setIsScrapingLink(false);
    }
  };

  const onSubmit = async (data: ItemFormData) => {
    try {
      const endpoint = data.destination === "wishlist" ? "/api/wishlist" : "/api/closet";
      
      await apiRequest("POST", endpoint, {
        name: data.name,
        brand: data.brand || null,
        price: data.price ? parseFloat(data.price) : null,
        description: data.description || null,
        category: data.category || null,
        imageUrl: data.imageUrl || null,
        sourceUrl: data.sourceUrl || null,
        folder: data.folder || null,
      });

      toast({
        title: "Success",
        description: `Item added to your ${data.destination}!`,
      });

      // Navigate to the appropriate page
      navigate(data.destination === "wishlist" ? "/wishlist" : "/closet");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-lg font-medium">Add from Link</h1>
          
          <div className="w-9" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {!showForm ? (
          <div className="space-y-6">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                <Link className="w-12 h-12 text-purple-500" />
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Add from Link</h2>
              <p className="text-gray-600">
                Paste a product URL and we'll extract the details for you
              </p>
            </div>

            {/* URL Input */}
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
                className="h-12"
              />
              <Button
                onClick={handleLinkParse}
                disabled={isScrapingLink}
                className="w-full h-12 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white"
              >
                {isScrapingLink ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting Product Details...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Parse Link
                  </>
                )}
              </Button>
            </div>

            {/* Supported Sites */}
            <div className="mt-12">
              <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                Supported Sites
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {['ASOS', 'Zara', 'H&M', 'Nordstrom', 'Net-a-Porter', 'Revolve', 'SSENSE', 'Shopbop'].map((site) => (
                  <Badge key={site} variant="secondary" className="text-xs">
                    {site}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                And many more fashion retailers...
              </p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Preview Card */}
              {form.watch('imageUrl') && (
                <Card className="p-4 mb-6">
                  <div className="flex items-start space-x-4">
                    <ItemImage
                      imageUrl={form.watch('imageUrl')}
                      alt={form.watch('name')}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{form.watch('name') || 'Product Name'}</h3>
                      <p className="text-sm text-gray-600">{form.watch('brand') || 'Brand'}</p>
                      {form.watch('price') && (
                        <p className="text-lg font-semibold text-lulo-pink mt-1">
                          ${form.watch('price')}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Destination Selection */}
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Add to</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wishlist">
                          <div className="flex items-center">
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Wishlist
                          </div>
                        </SelectItem>
                        <SelectItem value="closet">
                          <div className="flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Closet
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Item Details */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Product name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Brand name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0.00" type="number" step="0.01" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

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
                          <SelectItem value="tops">Tops</SelectItem>
                          <SelectItem value="bottoms">Bottoms</SelectItem>
                          <SelectItem value="dresses">Dresses</SelectItem>
                          <SelectItem value="outerwear">Outerwear</SelectItem>
                          <SelectItem value="shoes">Shoes</SelectItem>
                          <SelectItem value="bags">Bags</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Textarea {...field} placeholder="Product description (optional)" rows={3} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white"
              >
                Add to {form.watch('destination') === 'wishlist' ? 'Wishlist' : 'Closet'}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}