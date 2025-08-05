import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LuloIcon } from "@/components/lulo-icon";
import { useToast } from "@/hooks/use-toast";

interface EmbeddedProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  sourceUrl: string;
  shopAtText: string;
}

interface EmbeddedProductCardProps {
  product: EmbeddedProduct;
}

export default function EmbeddedProductCard({ product }: EmbeddedProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddToWishlist = async () => {
    try {
      setIsLoading(true);
      
      // First create the item in our database
      const itemResponse = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          brand: product.brand,
          price: product.price,
          sourceUrl: product.sourceUrl,
          imageUrl: product.imageUrl,
          category: 'clothing'
        }),
        credentials: 'include',
      });

      if (!itemResponse.ok) {
        throw new Error('Failed to create item');
      }

      const item = await itemResponse.json();

      // Then add it to the wishlist
      const wishlistResponse = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          priority: 'medium',
          visibility: 'private',
        }),
        credentials: 'include',
      });

      if (!wishlistResponse.ok) {
        throw new Error('Failed to add to wishlist');
      }

      toast({
        title: "Added to wishlist!",
        description: `${product.name} has been saved to your wishlist.`,
      });

    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopAt = () => {
    window.open(product.sourceUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-lg p-3 max-w-[120px]">
      {/* Product Image */}
      <div className="w-full mb-3">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-32 object-cover rounded"
        />
      </div>
      
      {/* Product Info */}
      <div className="text-center mb-3 flex-1">
        <p className="text-xs font-medium text-gray-900 leading-tight mb-1">
          {product.name}
        </p>
        <p className="text-xs text-gray-600 mb-1">{product.brand}</p>
        <p className="text-xs font-semibold text-gray-900">{product.price}</p>
      </div>
      
      {/* Action Buttons */}
      <div className="w-full space-y-2">
        <Button
          onClick={handleShopAt}
          variant="outline"
          size="sm"
          className="w-full h-6 text-[10px] font-medium border-black text-black hover:bg-gray-50"
        >
          {product.shopAtText}
        </Button>
        
        <Button
          onClick={handleAddToWishlist}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="w-full h-8 p-0 hover:bg-lulo-light-gray"
        >
          <div className="w-6 h-6 rounded-full bg-lulo-coral flex items-center justify-center">
            <LuloIcon size={12} color="white" />
          </div>
        </Button>
      </div>
    </div>
  );
}