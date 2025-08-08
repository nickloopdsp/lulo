import { useState, useEffect } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchFilter = "all" | "people" | "wishlists" | "lookboards" | "ootd" | "news";

interface SearchResult {
  id: string;
  type: SearchFilter;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  description?: string;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("all");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const searchFilters = [
    { id: "all" as SearchFilter, label: "All" },
    { id: "people" as SearchFilter, label: "People" },
    { id: "wishlists" as SearchFilter, label: "Wishlists" },
    { id: "lookboards" as SearchFilter, label: "Lookboards" },
    { id: "ootd" as SearchFilter, label: "OOTD" },
    { id: "news" as SearchFilter, label: "News Trends" },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const filterParam = activeFilter !== 'all' ? `&filter=${activeFilter}` : '';
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}${filterParam}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterClick = async (filter: SearchFilter) => {
    setActiveFilter(filter);
    
    // Re-run search with new filter if there's a query
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        const filterParam = filter !== 'all' ? `&filter=${filter}` : '';
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}${filterParam}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const results = await response.json();
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for auto-search
    if (value.trim()) {
      const timeout = setTimeout(() => {
        handleSearch();
      }, 300); // 300ms debounce
      setSearchTimeout(timeout);
    } else {
      // Clear results if query is empty
      setSearchResults([]);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Clear timeout on unmount
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [isOpen, onClose, searchTimeout]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40" 
        onClick={onClose}
      />
      
      {/* Search Overlay */}
      <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden" style={{ top: '80px' }}>
        {/* Floating Lulo icons for ambience */}
        <div className="pointer-events-none absolute inset-0">
          {/* Use multiple instances with different speeds and directions */}
          <div className="lulo-float" style={{ top: '10%', left: '5%', ['--dur' as any]: '16s', ['--dx' as any]: '60vw', ['--dy' as any]: '35vh' }}>
            <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M45 5 C45 5, 48 2, 52 8 C56 14, 54 18, 50 20" stroke="#FADADD" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="50" cy="60" r="35" stroke="#FADADD" strokeWidth="3" fill="none"/>
            </svg>
          </div>
          <div className="lulo-float" style={{ top: '60%', left: '10%', ['--dur' as any]: '18s', ['--dx' as any]: '50vw', ['--dy' as any]: '-30vh' }}>
            <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M45 5 C45 5, 48 2, 52 8 C56 14, 54 18, 50 20" stroke="#FADADD" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="50" cy="60" r="35" stroke="#FADADD" strokeWidth="2.5" fill="none"/>
            </svg>
          </div>
          <div className="lulo-float" style={{ top: '25%', left: '70%', ['--dur' as any]: '14s', ['--dx' as any]: '-55vw', ['--dy' as any]: '30vh' }}>
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M45 5 C45 5, 48 2, 52 8 C56 14, 54 18, 50 20" stroke="#FADADD" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="50" cy="60" r="35" stroke="#FADADD" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        </div>
        {/* Header with Back Button */}
        <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleQueryChange}
                  onKeyPress={handleKeyPress}
                  className="pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-full text-base focus:ring-2 focus:ring-lulo-pink focus:bg-white"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {searchFilters.map((filter) => {
                const isActive = activeFilter === filter.id;
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterClick(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-lulo-pink text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-md mx-auto px-4 py-4">
          {isSearching ? (
            // Loading state
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center space-x-3 p-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            // Results
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div 
                  key={result.id} 
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  {result.imageUrl && (
                    <img
                      src={result.imageUrl}
                      alt={result.title}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-base">{result.title}</h3>
                    {result.subtitle && (
                      <p className="text-sm text-gray-600">{result.subtitle}</p>
                    )}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-gray-100 text-gray-700 border-0"
                  >
                    {result.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching ? (
            // No results
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            // Initial state - empty for cleaner look
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                Search for people, wishlists, and more
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}