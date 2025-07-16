import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Layout, Eye, Share2, Edit, Trash2, Heart, Clock, User, Users, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import MasonryLayout from "@/components/masonry-layout";
import LookbookCreator from "@/components/lookbook-creator";

export default function Lookbooks() {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedTab, setSelectedTab] = useState("public");

  const { data: lookbooks = [], isLoading } = useQuery({
    queryKey: ["/api/lookbooks"],
  });

  // Mock lookbooks data matching the Figma design
  const mockLookbooks = [
    {
      id: 1,
      title: "Sara's Wedding",
      description: "Wedding guest outfit inspiration",
      coverImage: "/api/placeholder/200/250",
      visibility: "public",
      likes: 45,
      items: [
        { id: 1, imageUrl: "/api/placeholder/100/120", name: "Mint green dress" },
        { id: 2, imageUrl: "/api/placeholder/100/120", name: "Gold jewelry" },
        { id: 3, imageUrl: "/api/placeholder/100/120", name: "Brown sandals" },
        { id: 4, imageUrl: "/api/placeholder/100/120", name: "Clutch bag" }
      ],
      createdAt: "2024-01-15",
      author: { name: "You", avatar: "/api/placeholder/40/40" }
    },
    {
      id: 2,
      title: "Girl's Trip Mallorca",
      description: "Summer vacation outfits",
      coverImage: "/api/placeholder/200/280",
      visibility: "public",
      likes: 67,
      items: [
        { id: 1, imageUrl: "/api/placeholder/100/120", name: "Striped shirt" },
        { id: 2, imageUrl: "/api/placeholder/100/120", name: "Linen pants" },
        { id: 3, imageUrl: "/api/placeholder/100/120", name: "Sandals" },
        { id: 4, imageUrl: "/api/placeholder/100/120", name: "Sunglasses" },
        { id: 5, imageUrl: "/api/placeholder/100/120", name: "Beach bag" }
      ],
      createdAt: "2024-01-10",
      author: { name: "You", avatar: "/api/placeholder/40/40" }
    },
    {
      id: 3,
      title: "Work Looks",
      description: "Professional outfits for the office",
      coverImage: "/api/placeholder/200/260",
      visibility: "private",
      likes: 23,
      items: [
        { id: 1, imageUrl: "/api/placeholder/100/120", name: "Blazer" },
        { id: 2, imageUrl: "/api/placeholder/100/120", name: "Trousers" },
        { id: 3, imageUrl: "/api/placeholder/100/120", name: "Heels" },
        { id: 4, imageUrl: "/api/placeholder/100/120", name: "Lipstick" }
      ],
      createdAt: "2024-01-08",
      author: { name: "You", avatar: "/api/placeholder/40/40" }
    },
    {
      id: 4,
      title: "NYC Summer",
      description: "Urban summer style",
      coverImage: "/api/placeholder/200/300",
      visibility: "public",
      likes: 89,
      items: [
        { id: 1, imageUrl: "/api/placeholder/100/120", name: "Black tee" },
        { id: 2, imageUrl: "/api/placeholder/100/120", name: "Cargo pants" },
        { id: 3, imageUrl: "/api/placeholder/100/120", name: "Sneakers" },
        { id: 4, imageUrl: "/api/placeholder/100/120", name: "Backpack" }
      ],
      createdAt: "2024-01-05",
      author: { name: "You", avatar: "/api/placeholder/40/40" }
    }
  ];

  const publicLookbooks = mockLookbooks.filter(lb => lb.visibility === "public");
  const privateLookbooks = mockLookbooks.filter(lb => lb.visibility === "private");

  const LookbookCard = ({ lookbook }: { lookbook: any }) => (
    <div className="masonry-item group cursor-pointer">
      <div className="relative">
        <img 
          src={lookbook.coverImage}
          alt={lookbook.title}
          className="w-full h-auto object-cover rounded-t-2xl"
        />
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge 
            variant="secondary" 
            className={`text-xs text-white ${
              lookbook.visibility === 'public' ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            {lookbook.visibility === 'public' ? 
              <><Globe className="w-3 h-3 mr-1" /> Public</> : 
              <><Lock className="w-3 h-3 mr-1" /> Private</>
            }
          </Badge>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-sm text-lulo-dark mb-1 line-clamp-1">
          {lookbook.title}
        </h3>
        <p className="text-xs text-lulo-gray mb-2 line-clamp-2">
          {lookbook.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Avatar className="w-5 h-5">
              <AvatarImage src={lookbook.author.avatar} />
              <AvatarFallback className="text-xs">U</AvatarFallback>
            </Avatar>
            <span className="text-xs text-lulo-gray">{lookbook.author.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-lulo-gray" />
              <span className="text-xs text-lulo-gray">{lookbook.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-lulo-gray" />
              <span className="text-xs text-lulo-gray">
                {new Date(lookbook.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Preview items */}
        <div className="flex space-x-1 mt-2 overflow-x-auto">
          {lookbook.items.slice(0, 4).map((item: any) => (
            <img 
              key={item.id}
              src={item.imageUrl}
              alt={item.name}
              className="w-8 h-8 object-cover rounded flex-shrink-0"
            />
          ))}
          {lookbook.items.length > 4 && (
            <div className="w-8 h-8 bg-lulo-light-gray rounded flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-lulo-gray">+{lookbook.items.length - 4}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-main">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-lulo-dark">Lookbooks</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreator(true)}
            className="text-lulo-gray"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-lulo-border">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border-b border-lulo-border">
            <TabsTrigger value="public" className="text-sm">
              Public
            </TabsTrigger>
            <TabsTrigger value="private" className="text-sm">
              Private
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-sm">
              <Heart className="w-4 h-4 mr-1" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              <Clock className="w-4 h-4 mr-1" />
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="bg-lulo-light-gray flex-1">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsContent value="public" className="m-0">
            <MasonryLayout>
              {publicLookbooks.map((lookbook) => (
                <LookbookCard key={lookbook.id} lookbook={lookbook} />
              ))}
            </MasonryLayout>
          </TabsContent>
          
          <TabsContent value="private" className="m-0">
            <MasonryLayout>
              {privateLookbooks.map((lookbook) => (
                <LookbookCard key={lookbook.id} lookbook={lookbook} />
              ))}
            </MasonryLayout>
          </TabsContent>
          
          <TabsContent value="favorites" className="m-0">
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-lulo-gray mx-auto mb-4" />
              <p className="text-lulo-gray">No favorite lookbooks yet</p>
              <p className="text-sm text-lulo-gray mt-2">Heart lookbooks you love to see them here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="m-0">
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-lulo-gray mx-auto mb-4" />
              <p className="text-lulo-gray">No history yet</p>
              <p className="text-sm text-lulo-gray mt-2">Your recently viewed lookbooks will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lookbook Creator Modal */}
      <LookbookCreator 
        open={showCreator} 
        onOpenChange={setShowCreator}
      />
    </div>
  );
} 