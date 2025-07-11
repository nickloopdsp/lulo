import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import ItemCard from "@/components/item-card";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/items"],
  });

  const filteredItems = items.filter((item: any) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mobile-app-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search items, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-0 rounded-xl"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="text-lulo-pink"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        {/* Filters */}
        {showFilters && (
          <section className="px-4 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-gray-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Clothing', 'Shoes', 'Accessories', 'Jewelry', 'Bags'].map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </section>
        )}

        {/* Popular Searches */}
        {!searchQuery && (
          <section className="px-4 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Searches</h2>
            <div className="flex flex-wrap gap-2">
              {['Summer dresses', 'White sneakers', 'Designer bags', 'Gold jewelry', 'Sunglasses'].map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-lulo-pink border-lulo-pink"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Button>
              ))}
            </div>
          </section>
        )}

        {/* Search Results */}
        <section className="px-4 py-4">
          {searchQuery && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {filteredItems.length} results for "{searchQuery}"
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3 card-shadow animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(searchQuery ? filteredItems : items).map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {searchQuery && filteredItems.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No results found</p>
              <p className="text-sm text-gray-400">Try different keywords or browse all items</p>
            </div>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
