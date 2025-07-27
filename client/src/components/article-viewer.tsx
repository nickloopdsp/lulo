import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { X, Share, Heart, Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArticleViewerProps {
  articleUrl: string;
  title: string;
  source: string;
  onClose: () => void;
}

export default function ArticleViewer({ articleUrl, title, source, onClose }: ArticleViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when article changes
    setLoading(true);
    setError(false);
  }, [articleUrl]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: articleUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(articleUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-lulo-border z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-0 h-8 w-8"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h3 className="font-medium text-sm text-lulo-dark truncate">
                {title}
              </h3>
              <p className="text-xs text-lulo-gray">{source}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-8 w-8"
            >
              <Heart className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-8 w-8"
            >
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-0 h-8 w-8"
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="h-[calc(100vh-60px)] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lulo-dark mx-auto mb-4"></div>
              <p className="text-sm text-lulo-gray">Loading article...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center px-8">
              <p className="text-sm text-lulo-dark mb-4">
                Unable to load this article directly.
              </p>
              <Button
                onClick={() => window.open(articleUrl, '_blank')}
                className="bg-lulo-dark text-white"
              >
                Open in Browser
              </Button>
            </div>
          </div>
        )}

        <iframe
          src={articleUrl}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          title={title}
        />
      </div>
    </div>
  );
} 