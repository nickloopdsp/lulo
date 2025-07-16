import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Filter, Search, Grid, List, MoreHorizontal, Heart, Share2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ItemImage } from "@/components/ui/item-image";
import MasonryLayout from "@/components/masonry-layout";

export default function Closet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: closetItems = [], isLoading } = useQuery({
    queryKey: ["/api/closet"],
  });

  // Mock outfit photos data - in real app this would come from API
  const mockOutfitPhotos = [
    {
      id: 1,
      imageUrl: "/api/placeholder/200/250",
      caption: "Office look for Monday",
      date: "2024-01-15",
      likes: 24,
      tags: ["work", "professional", "blazer"],
      location: "Office",
      weather: "Sunny, 72°F"
    },
    {
      id: 2,
      imageUrl: "/api/placeholder/200/300",
      caption: "Weekend casual vibes",
      date: "2024-01-14",
      likes: 18,
      tags: ["casual", "weekend", "denim"],
      location: "Coffee shop",
      weather: "Cloudy, 65°F"
    },
    {
      id: 3,
      imageUrl: "/api/placeholder/200/280",
      caption: "Date night outfit",
      date: "2024-01-13",
      likes: 45,
      tags: ["date", "evening", "dress"],
      location: "Restaurant",
      weather: "Clear, 68°F"
    },
    {
      id: 4,
      imageUrl: "/api/placeholder/200/320",
      caption: "Gym session ready",
      date: "2024-01-12",
      likes: 12,
      tags: ["workout", "athletic", "leggings"],
      location: "Gym",
      weather: "Indoor"
    },
    {
      id: 5,
      imageUrl: "/api/placeholder/200/260",
      caption: "Brunch with friends",
      date: "2024-01-11",
      likes: 31,
      tags: ["brunch", "friends", "casual"],
      location: "Cafe",
      weather: "Sunny, 75°F"
    },
    {
      id: 6,
      imageUrl: "/api/placeholder/200/290",
      caption: "Concert outfit",
      date: "2024-01-10",
      likes: 52,
      tags: ["concert", "music", "edgy"],
      location: "Music venue",
      weather: "Evening, 62°F"
    },
    {
      id: 7,
      imageUrl: "/api/placeholder/200/310",
      caption: "Travel day comfort",
      date: "2024-01-09",
      likes: 19,
      tags: ["travel", "comfort", "layers"],
      location: "Airport",
      weather: "Variable"
    },
    {
      id: 8,
      imageUrl: "/api/placeholder/200/270",
      caption: "Business meeting",
      date: "2024-01-08",
      likes: 28,
      tags: ["business", "formal", "suit"],
      location: "Office",
      weather: "Rainy, 58°F"
    },
    {
      id: 9,
      imageUrl: "/api/placeholder/200/285",
      caption: "Art gallery opening",
      date: "2024-01-07",
      likes: 39,
      tags: ["art", "gallery", "chic"],
      location: "Gallery",
      weather: "Cool, 60°F"
    },
    {
      id: 10,
      imageUrl: "/api/placeholder/200/295",
      caption: "Sunday shopping",
      date: "2024-01-06",
      likes: 22,
      tags: ["shopping", "casual", "comfortable"],
      location: "Mall",
      weather: "Partly cloudy, 70°F"
    },
    {
      id: 11,
      imageUrl: "/api/placeholder/200/305",
      caption: "Dinner with family",
      date: "2024-01-05",
      likes: 35,
      tags: ["family", "dinner", "elegant"],
      location: "Restaurant",
      weather: "Clear, 65°F"
    },
    {
      id: 12,
      imageUrl: "/api/placeholder/200/275",
      caption: "Yoga class morning",
      date: "2024-01-04",
      likes: 16,
      tags: ["yoga", "morning", "activewear"],
      location: "Studio",
      weather: "Morning, 55°F"
    }
  ];

  const filteredPhotos = mockOutfitPhotos.filter((photo) => {
    const matchesSearch = photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = !selectedFilter || photo.tags.includes(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const OutfitPhotoCard = ({ photo }: { photo: any }) => (
    <div 
      className="aspect-square bg-white rounded-lg overflow-hidden group cursor-pointer relative"
      onClick={() => setSelectedPhoto(photo)}
    >
      <ItemImage
        imageUrl={photo.imageUrl}
        alt={photo.caption}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        width={300}
        height={300}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-4 text-white pointer-events-auto">
          <div className="flex items-center space-x-1">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">{photo.likes}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:bg-opacity-20"
            onClick={(e) => {
              e.stopPropagation();
              // Add share functionality here
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-main">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-lulo-dark">My Closet</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-lulo-gray"
            >
              <Camera className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-lulo-gray"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lulo-gray" />
          <Input
            placeholder="Search your outfits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-lulo-border rounded-full bg-lulo-light-gray"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-lulo-dark">{mockOutfitPhotos.length}</div>
            <div className="text-xs text-lulo-gray">Outfits</div>
          </div>
          <div>
            <div className="text-xl font-bold text-lulo-coral">
              {mockOutfitPhotos.reduce((sum, photo) => sum + photo.likes, 0)}
            </div>
            <div className="text-xs text-lulo-gray">Total Likes</div>
          </div>
          <div>
            <div className="text-xl font-bold text-lulo-sage">
              {Array.from(new Set(mockOutfitPhotos.flatMap(photo => photo.tags))).length}
            </div>
            <div className="text-xs text-lulo-gray">Tags</div>
          </div>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={selectedFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(null)}
            className="rounded-full whitespace-nowrap text-xs"
          >
            All
          </Button>
          {Array.from(new Set(mockOutfitPhotos.flatMap(photo => photo.tags))).map((tag) => (
            <Button
              key={tag}
              variant={selectedFilter === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(tag)}
              className="rounded-full whitespace-nowrap text-xs"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="bg-lulo-light-gray p-2">
        <div className="grid grid-cols-3 gap-2">
          {filteredPhotos.map((photo) => (
            <OutfitPhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      </div>

      {/* Photo Detail Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-md mx-4 rounded-xl">
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="relative">
                <ItemImage
                  imageUrl={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption}
                  className="w-full h-auto rounded-lg"
                  width={400}
                  height={500}
                />
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Camera className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lulo-dark">{selectedPhoto.caption}</h3>
                <p className="text-sm text-lulo-gray">{selectedPhoto.date} • {selectedPhoto.location}</p>
                <p className="text-sm text-lulo-gray">{selectedPhoto.weather}</p>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Button variant="ghost" size="sm" className="text-lulo-gray">
                    <Heart className="w-4 h-4 mr-1" />
                    {selectedPhoto.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-lulo-gray">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {selectedPhoto.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
