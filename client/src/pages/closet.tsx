import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Filter, Search, MoreHorizontal, Heart, Camera, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddItemModal from "@/components/add-item-modal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Closet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubTab, setSelectedSubTab] = useState("ootd");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionPrivacy, setCollectionPrivacy] = useState("public");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

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
      weather: "Sunny, 72°F",
      event: "COCKTAIL PARTY",
      eventDate: "June 20th, 2025",
      brands: "SIR, Jeffrey Campbell",
      styleTags: ["Cocktail Dress", "Evening Look", "Fancy"]
    },
    {
      id: 2,
      imageUrl: "/api/placeholder/200/300",
      caption: "Weekend casual vibes",
      date: "2024-01-14",
      likes: 18,
      tags: ["casual", "weekend", "denim"],
      location: "Coffee shop",
      weather: "Cloudy, 65°F",
      event: "BRUNCH",
      eventDate: "June 15th, 2025",
      brands: "GANNI, Levi's",
      styleTags: ["Casual", "Weekend", "Denim"]
    },
    {
      id: 3,
      imageUrl: "/api/placeholder/200/280",
      caption: "Date night outfit",
      date: "2024-01-13",
      likes: 45,
      tags: ["date", "evening", "dress"],
      location: "Restaurant",
      weather: "Clear, 68°F",
      event: "DATE NIGHT",
      eventDate: "June 10th, 2025",
      brands: "Reformation, Zara",
      styleTags: ["Evening", "Dress", "Romantic"]
    },
    {
      id: 4,
      imageUrl: "/api/placeholder/200/320",
      caption: "Gym session ready",
      date: "2024-01-12",
      likes: 12,
      tags: ["workout", "athletic", "leggings"],
      location: "Gym",
      weather: "Indoor",
      event: "WORKOUT",
      eventDate: "June 8th, 2025",
      brands: "Lululemon, Nike",
      styleTags: ["Athletic", "Workout", "Comfort"]
    },
    {
      id: 5,
      imageUrl: "/api/placeholder/200/260",
      caption: "Brunch with friends",
      date: "2024-01-11",
      likes: 31,
      tags: ["brunch", "friends", "casual"],
      location: "Cafe",
      weather: "Sunny, 75°F",
      event: "BRUNCH",
      eventDate: "June 5th, 2025",
      brands: "Free People, Everlane",
      styleTags: ["Casual", "Brunch", "Friends"]
    },
    {
      id: 6,
      imageUrl: "/api/placeholder/200/290",
      caption: "Concert outfit",
      date: "2024-01-10",
      likes: 52,
      tags: ["concert", "music", "edgy"],
      location: "Music venue",
      weather: "Evening, 62°F",
      event: "CONCERT",
      eventDate: "June 1st, 2025",
      brands: "AllSaints, Dr. Martens",
      styleTags: ["Edgy", "Concert", "Music"]
    },
    {
      id: 7,
      imageUrl: "/api/placeholder/200/310",
      caption: "Travel day comfort",
      date: "2024-01-09",
      likes: 19,
      tags: ["travel", "comfort", "layers"],
      location: "Airport",
      weather: "Variable",
      event: "TRAVEL",
      eventDate: "May 28th, 2025",
      brands: "Uniqlo, Patagonia",
      styleTags: ["Travel", "Comfort", "Layers"]
    },
    {
      id: 8,
      imageUrl: "/api/placeholder/200/270",
      caption: "Beach day vibes",
      date: "2024-01-08",
      likes: 28,
      tags: ["beach", "summer", "swimsuit"],
      location: "Beach",
      weather: "Sunny, 85°F",
      event: "BEACH DAY",
      eventDate: "May 25th, 2025",
      brands: "Solid & Striped, Ray-Ban",
      styleTags: ["Beach", "Summer", "Swimsuit"]
    },
    {
      id: 9,
      imageUrl: "/api/placeholder/200/330",
      caption: "Weekend errands",
      date: "2024-01-07",
      likes: 15,
      tags: ["errands", "casual", "comfort"],
      location: "City",
      weather: "Partly cloudy, 70°F",
      event: "WEEKEND",
      eventDate: "May 22nd, 2025",
      brands: "Madewell, Converse",
      styleTags: ["Casual", "Weekend", "Comfort"]
    }
  ];

  // Mock category data for My Items
  const mockCategories = [
    {
      name: "Tops",
      imageUrl: "/api/placeholder/200/250",
      itemCount: 84,
      items: [
        { id: 1, name: "Striped Polo", brand: "Ralph Lauren", price: "$89", imageUrl: "/api/placeholder/200/250" },
        { id: 2, name: "GANNI Tee", brand: "GANNI", price: "$45", imageUrl: "/api/placeholder/200/300" },
        { id: 3, name: "Striped Top", brand: "Zara", price: "$29", imageUrl: "/api/placeholder/200/280" }
      ]
    },
    {
      name: "Dresses",
      imageUrl: "/api/placeholder/200/320",
      itemCount: 84,
      items: [
        { id: 4, name: "Summer Dress", brand: "Reformation", price: "$248", imageUrl: "/api/placeholder/200/320" },
        { id: 5, name: "Beige Dress", brand: "Free People", price: "$168", imageUrl: "/api/placeholder/200/260" },
        { id: 6, name: "Blue Dress", brand: "ASOS", price: "$85", imageUrl: "/api/placeholder/200/290" }
      ]
    },
    {
      name: "Jewelry",
      imageUrl: "/api/placeholder/200/310",
      itemCount: 84,
      items: [
        { id: 7, name: "Shell Earrings", brand: "Local Artisan", price: "$45", imageUrl: "/api/placeholder/200/310" },
        { id: 8, name: "Pearl Ring", brand: "Mejuri", price: "$120", imageUrl: "/api/placeholder/200/270" },
        { id: 9, name: "Leather Necklace", brand: "Handmade", price: "$35", imageUrl: "/api/placeholder/200/330" }
      ]
    },
    {
      name: "Bottoms",
      imageUrl: "/api/placeholder/200/240",
      itemCount: 84,
      items: [
        { id: 10, name: "Checkered Pants", brand: "HIGH SPORT", price: "$960", imageUrl: "/api/placeholder/200/240" },
        { id: 11, name: "Yellow Pants", brand: "TWP", price: "$445", imageUrl: "/api/placeholder/200/325" },
        { id: 12, name: "Parachute Trousers", brand: "RÓHE", price: "$685", imageUrl: "/api/placeholder/200/265" }
      ]
    }
  ];

  // Mock collections data
  const mockCollections = [
    {
      id: 1,
      name: "Sparkly Dresses",
      imageCollage: [
        "/api/placeholder/200/250",
        "/api/placeholder/200/300",
        "/api/placeholder/200/280",
        "/api/placeholder/200/320"
      ],
      items: [
        { id: 1, name: "Embellished Dress", brand: "OSCAR DE LA RENTA", price: "$2,890", imageUrl: "/api/placeholder/200/250" },
        { id: 2, name: "Le Sable Sequined Dress", brand: "STAUD", price: "$495", imageUrl: "/api/placeholder/200/300" },
        { id: 3, name: "Fringe Dress", brand: "Mytheresa", price: "$1,200", imageUrl: "/api/placeholder/200/280" },
        { id: 4, name: "Sequin Dress", brand: "Reformation", price: "$398", imageUrl: "/api/placeholder/200/320" }
      ]
    },
    {
      id: 2,
      name: "Ski Vibes",
      imageCollage: [
        "/api/placeholder/200/260",
        "/api/placeholder/200/290",
        "/api/placeholder/200/310",
        "/api/placeholder/200/270"
      ],
      items: [
        { id: 5, name: "Black Maxi Dress", brand: "Zara", price: "$89", imageUrl: "/api/placeholder/200/260" },
        { id: 6, name: "Beige Slip Dress", brand: "Free People", price: "$168", imageUrl: "/api/placeholder/200/290" },
        { id: 7, name: "Silver Bracelet", brand: "Mejuri", price: "$120", imageUrl: "/api/placeholder/200/310" },
        { id: 8, name: "Winter Coat", brand: "Patagonia", price: "$299", imageUrl: "/api/placeholder/200/270" }
      ]
    },
    {
      id: 3,
      name: "NYC Summer",
      imageCollage: [
        "/api/placeholder/200/270",
        "/api/placeholder/200/330",
        "/api/placeholder/200/240",
        "/api/placeholder/200/280"
      ],
      items: [
        { id: 9, name: "Denim Jacket", brand: "Levi's", price: "$98", imageUrl: "/api/placeholder/200/270" },
        { id: 10, name: "White T-Shirt", brand: "Everlane", price: "$25", imageUrl: "/api/placeholder/200/330" },
        { id: 11, name: "Sunglasses", brand: "Ray-Ban", price: "$165", imageUrl: "/api/placeholder/200/240" },
        { id: 12, name: "Summer Dress", brand: "Reformation", price: "$248", imageUrl: "/api/placeholder/200/280" }
      ]
    },
    {
      id: 4,
      name: "Honeymoon",
      imageCollage: [
        "/api/placeholder/200/280",
        "/api/placeholder/200/300",
        "/api/placeholder/200/320",
        "/api/placeholder/200/290"
      ],
      items: [
        { id: 13, name: "White Dress", brand: "Reformation", price: "$248", imageUrl: "/api/placeholder/200/280" },
        { id: 14, name: "Swimsuit", brand: "Solid & Striped", price: "$95", imageUrl: "/api/placeholder/200/300" },
        { id: 15, name: "Beach Cover-up", brand: "Free People", price: "$78", imageUrl: "/api/placeholder/200/320" },
        { id: 16, name: "Straw Hat", brand: "Eugenia Kim", price: "$125", imageUrl: "/api/placeholder/200/290" }
      ]
    },
    {
      id: 5,
      name: "Pilates",
      imageCollage: [
        "/api/placeholder/200/290",
        "/api/placeholder/200/310",
        "/api/placeholder/200/250",
        "/api/placeholder/200/300"
      ],
      items: [
        { id: 17, name: "Beige Sweatshirt", brand: "Lululemon", price: "$98", imageUrl: "/api/placeholder/200/290" },
        { id: 18, name: "Black Leggings", brand: "Nike", price: "$85", imageUrl: "/api/placeholder/200/310" },
        { id: 19, name: "Sports Bra", brand: "Athleta", price: "$65", imageUrl: "/api/placeholder/200/250" },
        { id: 20, name: "Yoga Mat", brand: "Manduka", price: "$120", imageUrl: "/api/placeholder/200/300" }
      ]
    },
    {
      id: 6,
      name: "Work Looks",
      imageCollage: [
        "/api/placeholder/200/300",
        "/api/placeholder/200/320",
        "/api/placeholder/200/260",
        "/api/placeholder/200/280"
      ],
      items: [
        { id: 21, name: "Blazer", brand: "Theory", price: "$395", imageUrl: "/api/placeholder/200/300" },
        { id: 22, name: "White Pants", brand: "Madewell", price: "$89", imageUrl: "/api/placeholder/200/320" },
        { id: 23, name: "Black Belt", brand: "Everlane", price: "$35", imageUrl: "/api/placeholder/200/260" },
        { id: 24, name: "Pumps", brand: "Sam Edelman", price: "$129", imageUrl: "/api/placeholder/200/280" }
      ]
    }
  ];

  const [selectedCollection, setSelectedCollection] = useState<any>(null);

  const filteredPhotos = mockOutfitPhotos.filter((photo) => {
    const matchesSearch = photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleCreateCollection = async () => {
    if (!collectionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a collection name",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingCollection(true);
    try {
      // TODO: Replace with actual API call to create collection
      const response = await fetch('/api/closet/collections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: collectionName,
          privacy: collectionPrivacy 
        }),
      });

      if (!response.ok) throw new Error('Failed to create collection');

      toast({
        title: "Success",
        description: `Collection "${collectionName}" created successfully!`,
      });

      // Reset form and close modal
      setCollectionName("");
      setCollectionPrivacy("public");
      queryClient.invalidateQueries({ queryKey: ['/api/closet'] });
      setShowAddModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCollection(false);
    }
  };

  // Shared sub-navigation for Closet tabs
  const SubNav = ({ active }: { active: "ootd" | "myItems" | "collections" }) => (
    <div className="bg-white px-4 py-3 border-b border-lulo-border">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedSubTab("ootd")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              active === "ootd" ? "bg-lulo-pink text-lulo-pink-accent" : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
            }`}
          >
            OOTD
          </button>
          <button 
            onClick={() => setSelectedSubTab("myItems")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              active === "myItems" ? "bg-lulo-pink text-lulo-pink-accent" : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
            }`}
          >
            My Items
          </button>
          <button 
            onClick={() => setSelectedSubTab("collections")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              active === "collections" ? "bg-lulo-pink text-lulo-pink-accent" : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
            }`}
          >
            Collections
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {active !== "ootd" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 lulo-hover rounded-lg"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-5 h-5 text-gray-400" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // If we're viewing a specific category, show category items
  if (selectedCategory) {
    const category = mockCategories.find(cat => cat.name === selectedCategory);
    if (!category) return null;

    return (
      <div className="mobile-main bg-white">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-lulo-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-lulo-dark">{selectedCategory}</h1>
            </div>
            <Button variant="ghost" size="sm" className="p-2 lulo-hover rounded-lg">
              <Filter className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Category Items Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {category.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
          <Button
            variant="ghost"
            size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  >
                    <Heart className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-lulo-dark mb-1">{item.brand}</h3>
                  <p className="text-xs text-gray-600 mb-1">{item.name}</p>
                  <p className="text-sm font-medium text-lulo-dark">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Detail Modal */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-md mx-4 rounded-xl">
            {selectedItem && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem>Add to Wishlist</DropdownMenuItem>
                        <DropdownMenuItem>Remove from Closet</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{selectedItem.brand}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedItem.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-pink-500">See More Like This</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Product Details</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Shopping Options (coming soon!)</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex space-x-4 pt-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Heart className="w-5 h-5 mr-2" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comment
                    </Button>
                  </div>
                </div>
      </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
  }

  // If we're viewing a specific collection, show collection items
  if (selectedCollection) {
  return (
      <div className="mobile-main bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
                onClick={() => setSelectedCollection(null)}
                className="p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-lulo-dark">{selectedCollection.name}</h1>
            </div>
            <Button variant="ghost" size="sm" className="p-2 lulo-hover rounded-lg">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Collection Items Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {selectedCollection.items.map((item: any) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
            <Button
              variant="ghost"
              size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  >
                    <Heart className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-lulo-dark mb-1">{item.brand}</h3>
                  <p className="text-xs text-gray-600 mb-1">{item.name}</p>
                  <p className="text-sm font-medium text-lulo-dark">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Detail Modal */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-md mx-4 rounded-xl">
            {selectedItem && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem>Add to Wishlist</DropdownMenuItem>
                        <DropdownMenuItem>Remove from Collection</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{selectedItem.brand}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedItem.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-pink-500">See More Like This</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Product Details</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Shopping Options (coming soon!)</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex space-x-4 pt-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Heart className="w-5 h-5 mr-2" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If we're viewing Collections overview
  if (selectedSubTab === "collections") {
    return (
      <div className="mobile-main bg-white">
        {/* Search Bar */}
        <div className="bg-white px-4 py-3 border-b border-lulo-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lulo-gray" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-lulo-border rounded-full bg-gray-50"
            />
          </div>
        </div>
        <SubNav active={"collections"} />

        {/* Collections Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {mockCollections.map((collection) => (
              <div 
                key={collection.id} 
                className="liquid-glass rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedCollection(collection)}
              >
                <div className="relative">
                  {/* Image Collage */}
                  <div className="grid grid-cols-2 gap-1 p-2">
                    <img
                      src={collection.imageCollage[0]}
                      alt=""
                      className="w-full h-16 object-cover rounded"
                    />
                    <img
                      src={collection.imageCollage[1]}
                      alt=""
                      className="w-full h-16 object-cover rounded"
                    />
                    <img
                      src={collection.imageCollage[2]}
                      alt=""
                      className="w-full h-16 object-cover rounded"
                    />
                    <img
                      src={collection.imageCollage[3]}
                      alt=""
                      className="w-full h-16 object-cover rounded"
                    />
                  </div>
                  {/* Lock Icon */}
                  <div className="absolute top-2 left-2">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-lulo-dark">{collection.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If we're viewing My Items categories
  if (selectedSubTab === "myItems") {
    return (
      <div className="mobile-main bg-white">
        {/* Search Bar */}
        <div className="bg-white px-4 py-3 border-b border-lulo-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lulo-gray" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-lulo-border rounded-full bg-gray-50"
            />
          </div>
        </div>
        <SubNav active={"myItems"} />

        
        {/* Categories Grid */}
        <div className="p-4">
          <div className="space-y-6">
            {mockCategories.map((category) => (
              <div 
                key={category.name} 
                className="liquid-glass space-y-3 cursor-pointer p-3 rounded-lg transition-colors"
                onClick={() => setSelectedCategory(category.name)}
              >
                <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                <div className="grid grid-cols-3 gap-3">
                  {category.items.slice(0, 3).map((item) => (
                    <img
                      key={item.id}
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">{category.itemCount} Items</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main OOTD view (default)
  return (
    <div className="mobile-main bg-white">
      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lulo-gray" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-lulo-border rounded-full bg-gray-50"
          />
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button 
              onClick={() => setSelectedSubTab("ootd")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedSubTab === "ootd" ? "text-lulo-pink-accent" : "text-gray-700 hover:text-lulo-pink-accent"
              }`}
            >
              OOTD
            </button>
            <button 
              onClick={() => setSelectedSubTab("myItems")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedSubTab === "myItems" ? "text-lulo-pink-accent" : "text-gray-700 hover:text-lulo-pink-accent"
              }`}
            >
              My Items
            </button>
            <button 
              onClick={() => setSelectedSubTab("collections")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedSubTab === "collections" ? "text-lulo-pink-accent" : "text-gray-700 hover:text-lulo-pink-accent"
              }`}
            >
              Collections
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {selectedSubTab === "ootd" && (
              <Button variant="ghost" size="sm" className="p-2 lulo-hover rounded-lg">
                <Camera className="w-5 h-5 text-gray-400" />
              </Button>
            )}
            {(selectedSubTab === "myItems" || selectedSubTab === "collections") && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 lulo-hover rounded-lg"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-5 h-5 text-gray-400" />
              </Button>
            )}
          </div>
        </div>
      </div>

      

      {/* OOTD Grid */}
      <div className="p-2">
        <div className="grid grid-cols-3 gap-2">
          {mockOutfitPhotos.map((photo) => (
            <div 
              key={photo.id} 
              className="relative cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.imageUrl}
                alt={photo.caption}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* OOTD Detail Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-md mx-4 rounded-xl">
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption}
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{selectedPhoto.event}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedPhoto.eventDate}</p>
                <p className="text-sm text-gray-600">Brands & Details (optional):</p>
                <p className="text-sm font-medium text-gray-700">{selectedPhoto.brands}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedPhoto.styleTags.map((tag: string, index: number) => (
                    <span key={index} className="text-xs text-gray-500">{tag}</span>
                  ))}
                </div>
                <div className="flex space-x-4 pt-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Heart className="w-5 h-5 mr-2" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
