import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, MoreVertical, ShoppingBag, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface SearchResult {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  retailer: string;
  isLuloItem?: boolean;
  confidence?: number;
}

interface AnalysisResult {
  detectedCategory: string;
  detectedColors: string[];
  detectedStyle: string;
}

export default function VisualSearchResultsPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/visual-search/results");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get image from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const uploadedImage = urlParams.get('image');

  useEffect(() => {
    const performVisualSearch = async () => {
      if (!uploadedImage) {
        setError("No image provided");
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest("POST", "/api/visual-search", {
          image: uploadedImage
        });
        
        const data = await response.json();
        
        if (data.success) {
          setAnalysis(data.analysis);
          setResults(data.results);
        } else {
          setError("Failed to analyze image");
        }
      } catch (err) {
        console.error("Visual search error:", err);
        setError("Failed to perform visual search");
      } finally {
        setLoading(false);
      }
    };

    performVisualSearch();
  }, [uploadedImage]);

  const handleItemClick = (item: SearchResult) => {
    // Navigate to product detail page with item data
    const itemData = encodeURIComponent(JSON.stringify(item));
    navigate(`/item/${item.id}?from=visual-search&data=${itemData}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
          
          <h1 className="text-lg font-medium">Lulo Results</h1>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Uploaded Image Preview - matches screenshot */}
      {uploadedImage && (
        <div className="bg-white px-4 py-4">
          <div className="max-w-md mx-auto">
            <div className="relative aspect-[9/16] max-h-48 w-32 mx-auto overflow-hidden rounded-lg">
              <img 
                src={uploadedImage} 
                alt="Search image" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <Save className="w-3 h-3" />
                <span>Save</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="bg-white px-4 py-3 border-b border-gray-200">
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-[#FADADD]" />
              <span className="text-sm text-gray-600">AI Analysis Complete</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="bg-[#FADADD]/20 text-[#FADADD] border-[#FADADD]/30">
                {analysis.detectedCategory}
              </Badge>
              {analysis.detectedColors.map((color, idx) => (
                <Badge key={idx} variant="secondary" className="bg-[#FADADD]/20 text-[#FADADD] border-[#FADADD]/30">
                  {color}
                </Badge>
              ))}
              <Badge variant="secondary" className="bg-[#FADADD]/20 text-[#FADADD] border-[#FADADD]/30">
                {analysis.detectedStyle}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="max-w-md mx-auto">
          <h2 className="text-center font-medium">
            {loading ? "Analyzing Image..." : `Found ${results.length} Similar Items`}
          </h2>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-md mx-auto px-4 py-4">
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => navigate("/visual-search")}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="aspect-[3/4]" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </Card>
              ))
            ) : (
              results.map((item, index) => (
                <Card 
                  key={item.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative aspect-[3/4]">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.isLuloItem && (
                      <div className="absolute top-2 left-2 bg-white rounded-full p-1">
                        <ShoppingBag className="w-4 h-4 text-gray-700" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded">
                      {item.price}
                    </div>
                    {item.confidence && item.confidence > 0.8 && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        {Math.round(item.confidence * 100)}% Match
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500">{item.retailer}</p>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          Best Match
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{item.brand}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}