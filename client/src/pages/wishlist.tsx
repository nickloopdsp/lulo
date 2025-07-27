import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, Plus, Search, Filter, MoreHorizontal, Grid, List, Star, ExternalLink, Edit, Trash2 } from "lucide-react";
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
import { useState } from "react";
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
    
    // Count items per folder and collect first item for cover image
    items.forEach((wishlistItem: WishlistItem) => {
      const folder = (wishlistItem.folder && wishlistItem.folder.trim()) || 'uncategorized';
      folderCounts[folder] = (folderCounts[folder] || 0) + 1;
      if (!folderItems[folder]) {
        folderItems[folder] = [];
      }
      folderItems[folder].push(wishlistItem);
    });

    // Create board objects with real data
    const realBoards = Object.keys(folderCounts).map(folderId => {
      const folderNames: { [key: string]: string } = {
        'paris-looks': 'Paris Looks',
        'bachelorette-sarah': 'Bachelorette Sarah',
        'upstate-weekend': 'Upstate Weekend',
        'mallorca': 'Mallorca',
        'workout-sets': 'Workout Sets',
        'date-night': 'Date Night',
        'south-of-france': 'South of France',
        'uncategorized': 'Uncategorized'
      };

      const folderDescriptions: { [key: string]: string } = {
        'paris-looks': 'Chic Parisian style inspiration',
        'bachelorette-sarah': 'Party outfits and celebration looks',
        'upstate-weekend': 'Cozy getaway and countryside vibes',
        'mallorca': 'Mediterranean vacation essentials',
        'workout-sets': 'Athletic and activewear pieces',
        'date-night': 'Romantic and special occasion outfits',
        'south-of-france': 'Effortless Mediterranean vacation style',
        'uncategorized': 'Other items'
      };

      const firstItem = folderItems[folderId][0] as WishlistItem;
      const coverImage = firstItem?.imageUrl;

      return {
        id: folderId,
        name: folderNames[folderId] || folderId,
        description: folderDescriptions[folderId] || '',
        itemCount: folderCounts[folderId],
        coverImage: coverImage,
        isPrivate: false,
        isCollaborative: false,
        isArchived: false
      };
    });

    return realBoards;
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
      <div className="masonry-item group cursor-pointer" onClick={handleItemClick}>
        <div className="relative">
          <ItemImage 
            imageUrl={item.imageUrl}
            alt={item.name || "Fashion item"}
            className="w-full h-auto object-cover"
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
      className="pinterest-card cursor-pointer group"
      onClick={() => {
        setSelectedBoard(board.id);
        setViewMode("items");
      }}
    >
      <div className="relative">
        <ItemImage 
          imageUrl={board.coverImage}
          alt={board.name}
          className="w-full h-48 object-cover"
          width={250}
          height={192}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
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
          <h3 className="font-semibold text-sm text-lulo-dark">{board.name}</h3>
          {board.isPrivate && (
            <Badge variant="secondary" className="text-xs">
              Secret
            </Badge>
          )}
        </div>
        <p className="text-xs text-lulo-gray mt-1">{board.itemCount} Pins</p>
      </div>
    </div>
  );

  return (
    <div className="mobile-main">
      {/* Search Header */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lulo-gray" />
            <Input
              placeholder="Search your saved ideas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-lulo-border rounded-full bg-lulo-light-gray"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === "boards" ? "items" : "boards")}
            className="text-lulo-gray"
          >
            {viewMode === "boards" ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-lulo-gray hover:text-lulo-dark hover:bg-gray-100"
              onClick={() => {
                console.log("Wishlist plus button clicked!");
                setShowAddModal(!showAddModal);
              }}
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
        <div className="glass-filter-container rounded-full p-1">
          <div className="grid grid-cols-4 gap-1">
            <button 
              className={`glass-filter-tab rounded-full py-2 px-3 text-xs font-medium ${
                selectedBoard === "all" ? "glass-filter-tab-active" : ""
              }`}
              onClick={() => setSelectedBoard("all")}
            >
              All
            </button>
            <button 
              className={`glass-filter-tab rounded-full py-2 px-3 text-xs font-medium ${
                selectedBoard === "collaborative" ? "glass-filter-tab-active" : ""
              }`}
              onClick={() => setSelectedBoard("collaborative")}
            >
              Collaborative
            </button>
            <button 
              className={`glass-filter-tab rounded-full py-2 px-3 text-xs font-medium ${
                selectedBoard === "secret" ? "glass-filter-tab-active" : ""
              }`}
              onClick={() => setSelectedBoard("secret")}
            >
              Secret
            </button>
            <button 
              className={`glass-filter-tab rounded-full py-2 px-3 text-xs font-medium ${
                selectedBoard === "archived" ? "glass-filter-tab-active" : ""
              }`}
              onClick={() => setSelectedBoard("archived")}
            >
              Archived
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-lulo-light-gray">
        {viewMode === "boards" ? (
          <MasonryLayout>
            {filteredBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </MasonryLayout>
        ) : (
          <>
            {/* Board Header */}
            <div className="bg-white px-4 py-3 border-b border-lulo-border">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("boards")}
                  className="text-lulo-gray"
                >
                  ← Back to Boards
                </Button>
                <h2 className="font-semibold text-lulo-dark">
                  {boardsData.find(b => b.id === selectedBoard)?.name || "All Items"}
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
