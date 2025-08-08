import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, Plus, Search, Filter, MoreHorizontal, Grid, List, Star, ExternalLink, Edit, Trash2, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ItemImage } from "@/components/ui/item-image";
import MasonryLayout from "@/components/masonry-layout";
import AddItemModal from "@/components/add-item-modal";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// TypeScript type for flattened wishlist items
type WishlistItem = {
  id: number;
  userId: string;
  itemId: number;
  folder: string | null;
  notes: string | null;
  priority: number | null;
  visibility: string | null;
  giftMe: boolean | null;
  createdAt: number | null;
  // Flattened item properties
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  category?: string | null;
  isPublic?: boolean | null;
};

export default function Wishlist() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("all");
  const [viewMode, setViewMode] = useState<"boards" | "items">("boards");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle URL parameters for folder selection from chat
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const folderParam = urlParams.get('folder');
    if (folderParam) {
      setSelectedBoard(folderParam);
      setViewMode("items"); // Switch to items view to show the specific folder
    }
  }, []);

  const { data: wishlistItems = [] as WishlistItem[], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      return await apiRequest('DELETE', `/api/wishlist/folders/${encodeURIComponent(folderName)}`);
    },
    onSuccess: () => {
      // Invalidate multiple related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/folders"] });
      
      // Force a hard refresh by removing all cached data and refetching
      queryClient.removeQueries({ queryKey: ["/api/wishlist"] });
      queryClient.refetchQueries({ queryKey: ["/api/wishlist"] });
      
      toast({
        title: "Folder deleted",
        description: "The folder and all its items have been removed from your wishlist.",
      });
      setDeleteDialogOpen(false);
      setFolderToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete folder. Please try again.",
        variant: "destructive",
      });
         },
   });

  const handleDeleteFolder = (folderName: string) => {
    setFolderToDelete(folderName);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFolder = () => {
    if (folderToDelete) {
      deleteFolderMutation.mutate(folderToDelete);
    }
  };

  // Generate boards data from real wishlist items
  const generateBoardsFromWishlist = (items: WishlistItem[]) => {
    const folderCounts: { [key: string]: number } = {};
    const folderItems: { [key: string]: WishlistItem[] } = {};
    
    // Count items per folder and group items
    items.forEach(item => {
      const folder = item.folder || "Uncategorized";
      folderCounts[folder] = (folderCounts[folder] || 0) + 1;
      if (!folderItems[folder]) {
        folderItems[folder] = [];
      }
      folderItems[folder].push(item);
    });

    // Create board objects with image collages
    const boards = Object.keys(folderCounts).map((folderName, index) => {
      const itemsInFolder = folderItems[folderName];
      const imageCollage = itemsInFolder
        .filter(item => item.imageUrl)
        .slice(0, 4)
        .map(item => item.imageUrl!);

      // Fill remaining slots with placeholder if needed
      while (imageCollage.length < 4) {
        imageCollage.push("/api/placeholder/200/250");
      }

      return {
        id: folderName,
        name: folderName,
        itemCount: folderCounts[folderName],
        coverImage: itemsInFolder.find(item => item.imageUrl)?.imageUrl || "/api/placeholder/200/250",
        imageCollage: imageCollage,
        isPrivate: folderName.toLowerCase().includes('secret') || folderName.toLowerCase().includes('private'),
        isCollaborative: false,
        isArchived: false,
        items: itemsInFolder
      };
    });

    return boards;
  };

  const boardsData = generateBoardsFromWishlist(wishlistItems);

  const filteredItems = selectedBoard === "all" 
    ? wishlistItems
    : wishlistItems.filter((item: WishlistItem) => item.folder === selectedBoard);

  const filteredBoards = boardsData.filter((board) => {
    const matchesSearch = board.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedBoard === "all") return matchesSearch;
    if (selectedBoard === "collaborative") return matchesSearch && board.isCollaborative;
    if (selectedBoard === "secret") return matchesSearch && board.isPrivate;
    if (selectedBoard === "archived") return matchesSearch && board.isArchived;
    
    return matchesSearch;
  });

  const WishlistItemCard = ({ item }: { item: WishlistItem }) => {
    const handleItemClick = () => {
      navigate(`/item/${item.id}`);
    };

    return (
      <div className="masonry-item group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]" onClick={handleItemClick}>
        <div className="relative">
          <ItemImage 
            imageUrl={item.imageUrl}
            alt={item.name || "Fashion item"}
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
          />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Site
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black bg-opacity-70 text-white p-2 rounded">
            <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
            {item.brand && (
              <p className="text-xs text-gray-200">{item.brand}</p>
            )}
            {item.price && (
              <p className="text-xs font-medium">${item.price}</p>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  };

  const BoardCard = ({ board }: { board: any }) => (
    <div 
      className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
      onClick={() => {
        setSelectedBoard(board.id);
        setViewMode("items");
      }}
    >
      <div className="liquid-glass rounded-lg overflow-hidden group-hover:liquid-glass-hover transition-all duration-300">
        <div className="relative">
          {/* Image Collage */}
          <div className="grid grid-cols-2 gap-1 p-2">
            <img
              src={board.imageCollage[0]}
              alt=""
              className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
            />
            <img
              src={board.imageCollage[1]}
              alt=""
              className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
            />
            <img
              src={board.imageCollage[2]}
              alt=""
              className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
            />
            <img
              src={board.imageCollage[3]}
              alt=""
              className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Lock Icon for Private Boards */}
          {board.isPrivate && (
            <div className="absolute top-2 left-2">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
              </svg>
            </div>
          )}
          
          {/* More Options Menu */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Board
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(board.name);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Board
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-lulo-dark group-hover:text-gray-900 transition-colors">{board.name}</h3>
            {board.isPrivate && (
              <Badge variant="secondary" className="text-xs">
                Secret
              </Badge>
            )}
          </div>
          <p className="text-xs text-lulo-gray mt-1 group-hover:text-gray-700 transition-colors">{board.itemCount} Pins</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-main bg-white">
      {/* Search Header */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === "boards" ? "items" : "boards")}
            className="p-2 lulo-hover rounded-lg"
          >
            {viewMode === "boards" ? <Grid3X3 className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lulo-gray" />
            <Input
              placeholder="Search your saved ideas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-lulo-border rounded-full bg-gray-50"
            />
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="p-2 lulo-hover rounded-lg"
            >
              <Plus className="w-5 h-5" />
            </Button>
            
            {showAddModal && (
              <div className="absolute top-12 right-0 z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                <AddItemModal onSuccess={() => setShowAddModal(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex justify-center">
          <button 
            key="all"
            onClick={() => setSelectedBoard("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedBoard === "all" ? "bg-lulo-pink text-lulo-pink-accent" : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
            }`}
          >
            All
          </button>
          <button 
            key="collaborative"
            onClick={() => setSelectedBoard("collaborative")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedBoard === "collaborative" ? "bg-lulo-pink text-lulo-pink-accent" : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
            }`}
          >
            Collaborative
          </button>
          <button 
            key="secret"
            onClick={() => setSelectedBoard("secret")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedBoard === "secret" ? "bg-lulo-pink text-lulo-pink-accent" : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
            }`}
          >
            Secret
          </button>
          <button 
            key="archived"
            onClick={() => setSelectedBoard("archived")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedBoard === "archived" ? "bg-lulo-pink text-lulo-pink-accent" : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white">
        {viewMode === "boards" ? (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {filteredBoards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Board Header */}
            <div className="bg-white px-4 py-3 border-b border-lulo-border">
              <div className="flex justify-center">
                <h2 className="text-sm text-lulo-dark">
                  {(() => {
                    const getFilterName = () => {
                      switch (selectedBoard) {
                        case "collaborative": return "Collaborative";
                        case "secret": return "Secret";
                        case "archived": return "Archived";
                        case "all": return "All";
                        default: return selectedBoard; // Return the folder name for custom folders
                      }
                    };
                    const contentType = "Items";
                    return `${getFilterName()} ${contentType}`;
                  })()}
                </h2>
              </div>
            </div>

            {/* Items Grid */}
            <MasonryLayout>
              {filteredItems.map((item: WishlistItem) => (
                <WishlistItemCard key={item.id} item={item} />
              ))}
            </MasonryLayout>
          </>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{folderToDelete}" board? This will remove all items in this board from your wishlist. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFolder}
              disabled={deleteFolderMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteFolderMutation.isPending ? "Deleting..." : "Delete Board"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
