import { useMemo, useState } from "react";

interface ItemImageProps {
  imageUrl?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  showLoading?: boolean;
}

export const ItemImage = ({ 
  imageUrl, 
  alt, 
  className = "w-full h-auto object-cover",
  width = 200,
  height = 250,
  showLoading = true
}: ItemImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useOriginal, setUseOriginal] = useState(false);

  // Check if the imageUrl is a valid URL or base64 data
  const isValidImage = imageUrl && imageUrl.trim() !== '';
  const placeholderUrl = `/api/placeholder/${width}/${height}`;
  const proxiedUrl = useMemo(() => {
    if (!imageUrl) return undefined;
    if (imageUrl.startsWith('/api/')) return imageUrl; // already proxied or local
    try {
      new URL(imageUrl);
      return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    } catch {
      return imageUrl;
    }
  }, [imageUrl]);

  const handleImageError = () => {
    if (!useOriginal && proxiedUrl && imageUrl && proxiedUrl !== imageUrl) {
      setUseOriginal(true);
      setIsLoading(true);
      setImageError(false);
      return;
    }
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  if (!isValidImage || imageError) {
    return (
      <img 
        src={placeholderUrl}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    );
  }

  return (
    <div className="relative">
      {isLoading && showLoading && (
        <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
          <div className="w-8 h-8 border-2 border-lulo-pink border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={useOriginal ? (imageUrl || '') : (proxiedUrl || '')}
        alt={alt}
        className={`${className} ${isLoading && showLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={isLoading && showLoading ? { position: 'absolute' } : {}}
      />
    </div>
  );
}; 