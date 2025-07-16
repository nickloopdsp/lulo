import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, DollarSign, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface PriceTrackerProps {
  itemId: number;
  currentPrice?: number;
  currency?: string;
  children?: React.ReactNode;
}

export default function PriceTracker({ itemId, currentPrice, currency = "USD", children }: PriceTrackerProps) {
  const [showModal, setShowModal] = useState(false);

  const { data: priceHistory = [], isLoading } = useQuery({
    queryKey: [`/api/items/${itemId}/price-history`],
    enabled: showModal,
  });

  const { data: lowestPrice } = useQuery({
    queryKey: [`/api/items/${itemId}/lowest-price`],
    enabled: showModal,
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriceTrend = () => {
    if (!priceHistory || !Array.isArray(priceHistory) || priceHistory.length < 2) return null;
    
    const latest = parseFloat((priceHistory as any[])[0].price);
    const previous = parseFloat((priceHistory as any[])[1].price);
    
    if (latest < previous) {
      return { direction: 'down', percentage: ((previous - latest) / previous * 100).toFixed(1) };
    } else if (latest > previous) {
      return { direction: 'up', percentage: ((latest - previous) / previous * 100).toFixed(1) };
    }
    return null;
  };

  const trend = getPriceTrend();

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        {children ? (
          <>{children}</>
        ) : (
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>Price History</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg mx-4 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center">Price Tracking</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Current Price & Trend */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPrice ? formatPrice(currentPrice) : 'N/A'}
              </p>
            </div>
            {trend && (
              <div className="flex items-center space-x-1">
                {trend.direction === 'down' ? (
                  <TrendingDown className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  trend.direction === 'down' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trend.percentage}%
                </span>
              </div>
            )}
          </div>

          {/* Lowest Price */}
          {lowestPrice && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Lowest Price Seen</p>
                    <p className="text-lg font-bold text-green-800">
                      {formatPrice((lowestPrice as any).price)}
                    </p>
                    <p className="text-xs text-green-600">
                      {formatDate((lowestPrice as any).recordedAt)}
                    </p>
                  </div>
                  {(lowestPrice as any).source && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {(lowestPrice as any).source}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price History */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Price History</h3>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            ) : (priceHistory as any[]).length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(priceHistory as any[]).map((record: any, index: number) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {formatPrice(record.price)}
                        </p>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">Latest</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(record.recordedAt)}</span>
                        {record.source && (
                          <>
                            <span>•</span>
                            <span>{record.source}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {record.sourceUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(record.sourceUrl, '_blank')}
                        className="p-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No price history available</p>
                <p className="text-sm">Price tracking will begin once data is available</p>
              </div>
            )}
          </div>

          {/* Price Alert Setup - Placeholder */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Price Alerts</p>
                <p className="text-sm text-gray-600">Get notified when price drops</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 