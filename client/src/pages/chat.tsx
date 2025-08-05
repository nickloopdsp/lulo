import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { ChevronLeft, MoreHorizontal, Heart } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = chatId ? mockConversations[chatId] : null;

  useEffect(() => {
    // Scroll to bottom on mount and when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

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
            <h2 className="font-semibold text-base">{user.displayName}</h2>
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
                        <div className="max-w-[280px]">
                          <div className="p-2 border-2 border-lulo-pink rounded-lg">
                            <div className="grid grid-cols-2 gap-1">
                              {msg.attachments.slice(0, 4).map((item, idx) => (
                                <div key={item.id} className="relative overflow-hidden rounded">
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
                            className="mt-2 w-full text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Follow Wishlist
                          </Button>
                          <p className="text-center text-xs font-medium text-gray-700 mt-2">
                            WISHLIST: GRAD
                          </p>
                        </div>
                      ) : (
                        <div className="max-w-[240px]">
                          {msg.attachments.map((item) => (
                            <Card key={item.id} className="overflow-hidden border-0 shadow-sm">
                              <div className="relative bg-gray-50">
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
                              <div className="p-3 bg-white">
                                <div className="space-y-1 mb-3">
                                  <p className="text-xs text-gray-500">Add to a Wishlist</p>
                                  <p className="text-xs text-gray-500">Add to My Closet</p>
                                </div>
                                <p className="text-xs font-medium uppercase">{item.source}: {item.name}</p>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )
                    )}
                    
                    {msg.type === "closet" && (
                      <div className="space-y-2 max-w-[200px]">
                        {msg.attachments.map((item) => (
                          <div key={item.id} className="border-2 border-lulo-pink rounded-lg overflow-hidden">
                            <div className="relative bg-gray-50">
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
                            <div className="p-3 bg-white text-center">
                              <p className="text-xs text-gray-600 mb-1">{item.brand}</p>
                              <p className="text-xs text-gray-600 mb-2">{item.price}</p>
                              <p className="text-xs font-medium">{item.source}: {item.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {msg.type === "lookboard" && (
                      <div className="grid grid-cols-2 gap-1 max-w-[280px]">
                        {msg.attachments.map((item, idx) => (
                          <div key={item.id} className="relative overflow-hidden rounded-lg">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-40 object-cover"
                            />
                            {idx === 0 && item.source && (
                              <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
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
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-lulo-pink text-lulo-pink hover:bg-lulo-pink hover:text-white transition-colors rounded-full px-4 py-1"
              onClick={() => setActiveInsertMenu("wishlist")}
            >
              insert wishlist
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-lulo-pink text-lulo-pink hover:bg-lulo-pink hover:text-white transition-colors rounded-full px-4 py-1"
              onClick={() => setActiveInsertMenu("closet")}
            >
              insert closet
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-lulo-pink text-lulo-pink hover:bg-lulo-pink hover:text-white transition-colors rounded-full px-4 py-1"
              onClick={() => setActiveInsertMenu("lookboard")}
            >
              insert lookboard
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}