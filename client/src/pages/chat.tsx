import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MoreHorizontal, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: "text" | "wishlist" | "closet" | "lookboard";
  attachments?: {
    id: string;
    name: string;
    brand?: string;
    price?: string;
    imageUrl: string;
    source?: string;
    liked?: boolean;
  }[];
}

interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isActive: boolean;
  lastSeen: string;
}

// Mock chat data for demo
const mockConversations: Record<string, { user: ChatUser; messages: Message[] }> = {
  "1": {
    user: {
      id: "1",
      username: "isa",
      displayName: "Isa",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      isActive: true,
      lastSeen: "Active 11m ago"
    },
    messages: [
      {
        id: "1",
        senderId: "me",
        receiverId: "1",
        content: "One of my friends is also graduating this spring look at her wishlist I think you can find some good options!",
        timestamp: "10:30 AM",
        type: "text"
      },
      {
        id: "2",
        senderId: "me",
        receiverId: "1",
        content: "",
        timestamp: "10:31 AM",
        type: "wishlist",
        attachments: [
          {
            id: "w1",
            name: "WISHLIST: GRAD",
            brand: "Galvan",
            imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
            source: "WISHLIST: GRAD"
          },
          {
            id: "w2",
            name: "Robe Camella",
            brand: "Reformation",
            price: "€398",
            imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop",
            source: ""
          },
          {
            id: "w3",
            name: "Midi Dress",
            brand: "Sandro",
            imageUrl: "https://images.unsplash.com/photo-1623609163859-ca93c959b98a?w=400&h=500&fit=crop",
            source: ""
          },
          {
            id: "w4",
            name: "Silk Gown",
            brand: "Designer",
            imageUrl: "https://images.unsplash.com/photo-1562137369-1a1b0d1b9ba5?w=400&h=500&fit=crop",
            source: ""
          }
        ]
      }
    ]
  },
  "2": {
    user: {
      id: "2",
      username: "isa",
      displayName: "Isa",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      isActive: true,
      lastSeen: "Active 11m ago"
    },
    messages: [
      {
        id: "1",
        senderId: "me",
        receiverId: "2",
        content: "What if you just wear it with a simple white tank?",
        timestamp: "2:15 PM",
        type: "text"
      },
      {
        id: "2",
        senderId: "2",
        receiverId: "me",
        content: "I have this one but I feel like its not the right vibe?",
        timestamp: "2:16 PM",
        type: "text"
      },
      {
        id: "3",
        senderId: "2",
        receiverId: "me",
        content: "",
        timestamp: "2:17 PM",
        type: "closet",
        attachments: [
                  {
          id: "c1",
          name: "AGOLDE - POPPY SHRUNKEN WHITE TANK",
          brand: "Add to a Wishlist",
          price: "Add to My Closet",
          imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
          source: "CLOSET",
          liked: true
        }
        ]
      },
      {
        id: "4",
        senderId: "me",
        receiverId: "2",
        content: "That's perfect!!!",
        timestamp: "2:18 PM",
        type: "text"
      }
    ]
  },
  "3": {
    user: {
      id: "3",
      username: "isa",
      displayName: "Isa",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      isActive: true,
      lastSeen: "Active 11m ago"
    },
    messages: [
      {
        id: "1",
        senderId: "me",
        receiverId: "3",
        content: "I'm debating if it looks better with silver or gold accents? What do you think?",
        timestamp: "4:30 PM",
        type: "text"
      },
      {
        id: "2",
        senderId: "me",
        receiverId: "3",
        content: "",
        timestamp: "4:31 PM",
        type: "lookboard",
        attachments: [
          {
            id: "l1",
            name: "SILVER VS GOLD",
            brand: "",
            imageUrl: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=400&h=500&fit=crop",
            source: "LOOKBOARDS"
          },
          {
            id: "l2",
            name: "",
            brand: "",
            imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
            source: "",
            liked: true
          }
        ]
      },
      {
        id: "3",
        senderId: "3",
        receiverId: "me",
        content: "I LOOOOVE the gold!!",
        timestamp: "4:32 PM",
        type: "text"
      },
      {
        id: "4",
        senderId: "3",
        receiverId: "me",
        content: "I have a similar gold clutch you can borrow if you don't want to spend on a new one",
        timestamp: "4:33 PM",
        type: "text"
      },
      {
        id: "5",
        senderId: "3",
        receiverId: "me",
        content: "",
        timestamp: "4:34 PM",
        type: "closet",
        attachments: [
          {
            id: "c2",
            name: "SIMKHAI GOLD CLUTCH",
            brand: "",
            imageUrl: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400&h=500&fit=crop",
            source: "CLOSET"
          }
        ]
      }
    ]
  },
  "4": {
    user: {
      id: "4",
      username: "isa",
      displayName: "Isa",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      isActive: true,
      lastSeen: "Active 11m ago"
    },
    messages: [
      {
        id: "1",
        senderId: "me",
        receiverId: "4",
        content: "Is this too much for a dinner in Medellin?",
        timestamp: "7:45 PM",
        type: "text"
      },
      {
        id: "2",
        senderId: "me",
        receiverId: "4",
        content: "",
        timestamp: "7:46 PM",
        type: "wishlist",
        attachments: [
                  {
          id: "w3",
          name: "ANDRES OTALORA - MENDRA GALA GOWN",
          brand: "Andres Otalora",
          price: "",
          imageUrl: "https://images.unsplash.com/photo-1566479179817-0ddb5fa87cd9?w=400&h=600&fit=crop",
          source: "ITEM",
          liked: true
        }
        ]
      },
      {
        id: "3",
        senderId: "4",
        receiverId: "me",
        content: "No its good!! Just bring a sweater bc it gets chilly at night",
        timestamp: "7:47 PM",
        type: "text"
      },
      {
        id: "4",
        senderId: "me",
        receiverId: "4",
        content: "amazing thanks!!! can't wait :)",
        timestamp: "7:48 PM",
        type: "text"
      }
    ]
  }
};

export default function ChatPage() {
  const { chatId } = useParams();
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [activeInsertMenu, setActiveInsertMenu] = useState<string | null>(null);
  const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
  const [showClosetDropdown, setShowClosetDropdown] = useState(false);
  const [showLookboardDropdown, setShowLookboardDropdown] = useState(false);
  const [selectedClosetCategory, setSelectedClosetCategory] = useState<string | null>(null);
  const [selectedLookboardCollection, setSelectedLookboardCollection] = useState<string | null>(null);
  const [showClosetItems, setShowClosetItems] = useState(false);
  const [showLookboardItems, setShowLookboardItems] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wishlistButtonRef = useRef<HTMLDivElement>(null);
  const closetButtonRef = useRef<HTMLDivElement>(null);
  const lookboardButtonRef = useRef<HTMLDivElement>(null);

  // Fetch user's wishlist folders
  const { data: wishlistFolders = [] } = useQuery({
    queryKey: ["/api/wishlist/folders"],
    enabled: showWishlistDropdown
  });

  // Mock closet categories data - in real app this would come from API
  const mockClosetCategories = [
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

  const conversation = chatId ? mockConversations[chatId] : null;

  useEffect(() => {
    // Scroll to bottom on mount and when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wishlistButtonRef.current && !wishlistButtonRef.current.contains(event.target as Node)) {
        setShowWishlistDropdown(false);
      }
      if (closetButtonRef.current && !closetButtonRef.current.contains(event.target as Node)) {
        setShowClosetDropdown(false);
        setShowClosetItems(false);
        setSelectedClosetCategory(null);
      }
      if (lookboardButtonRef.current && !lookboardButtonRef.current.contains(event.target as Node)) {
        setShowLookboardDropdown(false);
        setSelectedLookboardCollection(null);
        setShowLookboardItems(false);
      }
    }

    if (showWishlistDropdown || showClosetDropdown || showLookboardDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showWishlistDropdown, showClosetDropdown, showLookboardDropdown]);

  const handleWishlistSelect = (wishlistName: string) => {
    // Here you would normally send the wishlist to the chat
    console.log("Sending wishlist to chat:", wishlistName);
    
    // For now, just close the dropdown
    setShowWishlistDropdown(false);
    
    // In a real implementation, you would:
    // 1. Fetch the wishlist items for this folder
    // 2. Add a new message to the conversation with type "wishlist"
    // 3. Include the wishlist items as attachments
  };

  const handleClosetCategorySelect = (categoryName: string) => {
    setSelectedClosetCategory(categoryName);
    setShowClosetItems(true);
  };

  const handleClosetItemSelect = (item: any) => {
    // Here you would normally send the closet item to the chat
    console.log("Sending closet item to chat:", item);
    
    // Close all dropdowns
    setShowClosetDropdown(false);
    setShowClosetItems(false);
    setSelectedClosetCategory(null);
    
    // In a real implementation, you would:
    // 1. Add a new message to the conversation with type "closet"
    // 2. Include the item as an attachment
  };

  const handleLookboardCollectionSelect = (collectionName: string) => {
    setSelectedLookboardCollection(collectionName);
    setShowLookboardItems(true);
  };

  const handleLookboardItemSelect = (item: any) => {
    // Here you would normally send the lookboard item to the chat
    console.log("Sending lookboard item to chat:", item);
    
    // Close all dropdowns
    setShowLookboardDropdown(false);
    setShowLookboardItems(false);
    setSelectedLookboardCollection(null);
    
    // In a real implementation, you would:
    // 1. Add a new message to the conversation with type "lookboard"
    // 2. Include the item as an attachment
  };

  if (!conversation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Chat not found</p>
      </div>
    );
  }

  const { user, messages } = conversation;

  const handleSendMessage = () => {
    // Handle sending message
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/boardroom")}
            className="p-1"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>
          
          <div>
            <h2 
              className="font-semibold text-base hover:text-[#FADADD] cursor-pointer"
              onClick={() => navigate(`/user/${user.id}`)}
            >
              {user.displayName}
            </h2>
            <p className="text-xs text-gray-500">{user.lastSeen}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="p-2">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                {msg.content && (
                  <div
                    className={`px-4 py-3 rounded-3xl ${
                      isMe
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                )}
                
                {msg.attachments && (
                  <div className="mt-2">
                    {msg.type === "wishlist" && (
                      msg.attachments.length > 1 ? (
                        <div 
                          className="max-w-[280px] cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            const wishlistName = msg.attachments?.[0]?.source;
                            if (wishlistName) {
                              navigate(`/wishlist?folder=${encodeURIComponent(wishlistName)}`);
                            }
                          }}
                        >
                          <div className="liquid-glass rounded-2xl p-3">
                            <div className="grid grid-cols-2 gap-2">
                              {msg.attachments?.slice(0, 4).map((item, idx) => (
                                <div key={item.id} className="relative overflow-hidden rounded-xl">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-32 object-cover"
                                  />
                                  {item.liked && (
                                    <div className="absolute top-2 right-2">
                                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 w-full text-xs glass-button"
                          >
                            Follow Wishlist
                          </Button>
                          <p className="text-center text-xs font-medium text-gray-700 mt-2">
                            {msg.attachments?.[0]?.source}
                          </p>
                        </div>
                      ) : (
                        <div className="max-w-[240px]">
                          {msg.attachments?.map((item) => (
                            <div key={item.id} className="liquid-glass rounded-2xl overflow-hidden shadow-lg mb-3">
                              <div className="relative">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-64 object-cover"
                                />
                                {item.liked && (
                                  <div className="absolute top-2 right-2">
                                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3">
                                <div className="space-y-1 mb-3">
                                  <p className="text-xs text-gray-500">Add to a Wishlist</p>
                                  <p className="text-xs text-gray-500">Add to My Closet</p>
                                </div>
                                <p className="text-xs font-medium uppercase text-gray-800">{item.source}: {item.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                    
                    {msg.type === "closet" && (
                      <div className="space-y-3 max-w-[200px]">
                        {msg.attachments?.map((item) => (
                          <div 
                            key={item.id} 
                            className="liquid-glass rounded-2xl overflow-hidden cursor-pointer hover:liquid-glass-hover transition-all duration-200"
                            onClick={() => {
                              // Navigate to product page with item data
                              const itemData = {
                                id: item.id,
                                name: item.name,
                                brand: item.brand,
                                price: item.price,
                                imageUrl: item.imageUrl,
                                source: item.source
                              };
                              navigate(`/item/${item.id}?data=${encodeURIComponent(JSON.stringify(itemData))}`);
                            }}
                          >
                            <div className="relative">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-56 object-cover"
                              />
                              {item.liked && (
                                <div className="absolute top-2 right-2">
                                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 text-center">
                              <p className="text-xs text-gray-600 mb-1">{item.brand}</p>
                              <p className="text-xs text-gray-600 mb-2">{item.price}</p>
                              <p className="text-xs font-medium text-gray-800">{item.source}: {item.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {msg.type === "lookboard" && (
                      <div className="liquid-glass rounded-2xl p-3 max-w-[280px]">
                        <div className="grid grid-cols-2 gap-2">
                          {msg.attachments?.map((item, idx) => (
                            <div key={item.id} className="relative overflow-hidden rounded-xl">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-40 object-cover"
                              />
                              {idx === 0 && item.source && (
                                <div className="absolute bottom-2 left-2 glass-button px-2 py-1 rounded-lg text-xs font-medium">
                                  {item.source}: {item.name}
                                </div>
                              )}
                              {item.liked && (
                                <div className="absolute top-2 right-2">
                                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Send message ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-2 border-lulo-pink rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lulo-pink focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex space-x-2">
            <div ref={wishlistButtonRef} className="relative">
              <Button
                variant="outline"
                size="sm"
                className="text-xs glass-button rounded-full px-4 py-1 text-gray-700"
                onClick={() => setShowWishlistDropdown(!showWishlistDropdown)}
              >
                insert wishlist
              </Button>

              {/* Wishlist Dropdown */}
              {showWishlistDropdown && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <div className="liquid-glass rounded-2xl shadow-lg p-3 min-w-[200px]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-800">Select Wishlist</h4>
                      <Button
                        onClick={() => setShowWishlistDropdown(false)}
                        variant="ghost"
                        size="sm"
                        className="p-1 glass-button rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleWishlistSelect("uncategorized")}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start glass-button"
                      >
                        Uncategorized
                      </Button>
                      
                      {(wishlistFolders as string[])?.map((folder: string) => (
                        <Button
                          key={folder}
                          onClick={() => handleWishlistSelect(folder)}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start glass-button"
                        >
                          {folder}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={closetButtonRef} className="relative">
              <Button
                variant="outline"
                size="sm"
                className="text-xs glass-button rounded-full px-4 py-1 text-gray-700"
                onClick={() => setShowClosetDropdown(!showClosetDropdown)}
              >
                insert closet
              </Button>

              {/* Closet Dropdown */}
              {showClosetDropdown && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <div className="liquid-glass rounded-2xl shadow-lg p-3 min-w-[200px]">
                    {!showClosetItems ? (
                      // Category Selection
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-800">Select Category</h4>
                          <Button
                            onClick={() => setShowClosetDropdown(false)}
                            variant="ghost"
                            size="sm"
                            className="p-1 glass-button rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {mockClosetCategories.map((category) => (
                            <Button
                              key={category.name}
                              onClick={() => handleClosetCategorySelect(category.name)}
                              variant="outline"
                              size="sm"
                              className="w-full text-left justify-start glass-button"
                            >
                              {category.name} ({category.itemCount})
                            </Button>
                          ))}
                        </div>
                      </>
                    ) : (
                      // Item Selection
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => {
                                setShowClosetItems(false);
                                setSelectedClosetCategory(null);
                              }}
                              variant="ghost"
                              size="sm"
                              className="p-1 glass-button rounded-full"
                            >
                              ←
                            </Button>
                            <h4 className="text-sm font-semibold text-gray-800">{selectedClosetCategory}</h4>
                          </div>
                          <Button
                            onClick={() => {
                              setShowClosetDropdown(false);
                              setShowClosetItems(false);
                              setSelectedClosetCategory(null);
                            }}
                            variant="ghost"
                            size="sm"
                            className="p-1 glass-button rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {mockClosetCategories
                            .find(cat => cat.name === selectedClosetCategory)
                            ?.items.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => handleClosetItemSelect(item)}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">{item.name}</p>
                                  <p className="text-xs text-gray-500">{item.brand}</p>
                                  <p className="text-xs text-gray-600">{item.price}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div ref={lookboardButtonRef} className="relative">
              <Button
                variant="outline"
                size="sm"
                className="text-xs glass-button rounded-full px-4 py-1 text-gray-700"
                onClick={() => setShowLookboardDropdown(!showLookboardDropdown)}
              >
                insert lookboard
              </Button>

              {/* Lookboard Dropdown */}
              {showLookboardDropdown && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <div className="liquid-glass rounded-2xl shadow-lg p-3 min-w-[200px]">
                    {!showLookboardItems ? (
                      // Collection Selection
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-800">Select Collection</h4>
                          <Button
                            onClick={() => setShowLookboardDropdown(false)}
                            variant="ghost"
                            size="sm"
                            className="p-1 glass-button rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Mock lookboard collections */}
                          <Button
                            onClick={() => handleLookboardCollectionSelect("Silver vs Gold")}
                            variant="outline"
                            size="sm"
                            className="w-full text-left justify-start glass-button"
                          >
                            Silver vs Gold
                          </Button>
                          <Button
                            onClick={() => handleLookboardCollectionSelect("Pastel Colors")}
                            variant="outline"
                            size="sm"
                            className="w-full text-left justify-start glass-button"
                          >
                            Pastel Colors
                          </Button>
                          <Button
                            onClick={() => handleLookboardCollectionSelect("Bold Patterns")}
                            variant="outline"
                            size="sm"
                            className="w-full text-left justify-start glass-button"
                          >
                            Bold Patterns
                          </Button>
                          <Button
                            onClick={() => handleLookboardCollectionSelect("See All Lookboards")}
                            variant="outline"
                            size="sm"
                            className="w-full text-left justify-start glass-button"
                          >
                            See All Lookboards
                          </Button>
                        </div>
                      </>
                    ) : (
                      // Item Selection
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => {
                                setShowLookboardItems(false);
                                setSelectedLookboardCollection(null);
                              }}
                              variant="ghost"
                              size="sm"
                              className="p-1 glass-button rounded-full"
                            >
                              ←
                            </Button>
                            <h4 className="text-sm font-semibold text-gray-800">{selectedLookboardCollection}</h4>
                          </div>
                          <Button
                            onClick={() => {
                              setShowLookboardDropdown(false);
                              setShowLookboardItems(false);
                              setSelectedLookboardCollection(null);
                            }}
                            variant="ghost"
                            size="sm"
                            className="p-1 glass-button rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {/* Mock lookboard items for the selected collection */}
                          {selectedLookboardCollection === "Silver vs Gold" && (
                            <>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 1, name: "Silver Accessories", brand: "Silver", price: "€120", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Silver" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Silver Accessories</p>
                                  <p className="text-xs text-gray-500">Silver</p>
                                  <p className="text-xs text-gray-600">€120</p>
                                </div>
                              </div>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 2, name: "Gold Earrings", brand: "Gold", price: "€80", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Gold" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Gold Earrings</p>
                                  <p className="text-xs text-gray-500">Gold</p>
                                  <p className="text-xs text-gray-600">€80</p>
                                </div>
                              </div>
                            </>
                          )}
                          {selectedLookboardCollection === "Pastel Colors" && (
                            <>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 3, name: "Pastel Floral Dress", brand: "Reformation", price: "€298", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Pastel Dress" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Pastel Floral Dress</p>
                                  <p className="text-xs text-gray-500">Reformation</p>
                                  <p className="text-xs text-gray-600">€298</p>
                                </div>
                              </div>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 4, name: "Pastel Mini Bag", brand: "Mansur Gavriel", price: "€395", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Pastel Bag" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Pastel Mini Bag</p>
                                  <p className="text-xs text-gray-500">Mansur Gavriel</p>
                                  <p className="text-xs text-gray-600">€395</p>
                                </div>
                              </div>
                            </>
                          )}
                          {selectedLookboardCollection === "Bold Patterns" && (
                            <>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 5, name: "Bold Striped Top", brand: "Zara", price: "€45", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Bold Top" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Bold Striped Top</p>
                                  <p className="text-xs text-gray-500">Zara</p>
                                  <p className="text-xs text-gray-600">€45</p>
                                </div>
                              </div>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 6, name: "Bold Checkered Pants", brand: "HIGH SPORT", price: "€960", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Bold Pants" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Bold Checkered Pants</p>
                                  <p className="text-xs text-gray-500">HIGH SPORT</p>
                                  <p className="text-xs text-gray-600">€960</p>
                                </div>
                              </div>
                            </>
                          )}
                          {selectedLookboardCollection === "See All Lookboards" && (
                            <>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 1, name: "Silver Accessories", brand: "Silver", price: "€120", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Silver" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Silver Accessories</p>
                                  <p className="text-xs text-gray-500">Silver</p>
                                  <p className="text-xs text-gray-600">€120</p>
                                </div>
                              </div>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 2, name: "Gold Earrings", brand: "Gold", price: "€80", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Gold" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Gold Earrings</p>
                                  <p className="text-xs text-gray-500">Gold</p>
                                  <p className="text-xs text-gray-600">€80</p>
                                </div>
                              </div>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 3, name: "Pastel Floral Dress", brand: "Reformation", price: "€298", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Pastel Dress" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Pastel Floral Dress</p>
                                  <p className="text-xs text-gray-500">Reformation</p>
                                  <p className="text-xs text-gray-600">€298</p>
                                </div>
                              </div>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 4, name: "Pastel Mini Bag", brand: "Mansur Gavriel", price: "€395", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Pastel Bag" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Pastel Mini Bag</p>
                                  <p className="text-xs text-gray-500">Mansur Gavriel</p>
                                  <p className="text-xs text-gray-600">€395</p>
                                </div>
                              </div>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 5, name: "Bold Striped Top", brand: "Zara", price: "€45", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Bold Top" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Bold Striped Top</p>
                                  <p className="text-xs text-gray-500">Zara</p>
                                  <p className="text-xs text-gray-600">€45</p>
                                </div>
                              </div>
                              <div 
                                onClick={() => handleLookboardItemSelect({ id: 6, name: "Bold Checkered Pants", brand: "HIGH SPORT", price: "€960", imageUrl: "/api/placeholder/200/250" })}
                                className="flex items-center space-x-3 p-2 hover:liquid-glass-hover rounded-lg cursor-pointer liquid-glass transition-all duration-200"
                              >
                                <img src="/api/placeholder/200/250" alt="Bold Pants" className="w-12 h-12 object-cover rounded-lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-800">Bold Checkered Pants</p>
                                  <p className="text-xs text-gray-500">HIGH SPORT</p>
                                  <p className="text-xs text-gray-600">€960</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-2 glass-button rounded-full">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}