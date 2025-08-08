import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Plus, Camera, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Chat {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  lastMessage?: string;
  messageCount?: number;
  timestamp: string;
  isVerified?: boolean;
  hasUnread?: boolean;
  isOnline?: boolean;
  type: "message" | "like" | "activity";
}

interface ActivityItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  action: string;
  timestamp: string;
  isVerified?: boolean;
  type: "like" | "follow" | "comment" | "mention" | "wishlist" | "borrow" | "share";
  comment?: string;
  thumbnails?: string[];
  showFollowBack?: boolean;
}

export default function BoardroomPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"boardroom" | "activity">("boardroom");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Check for shared content in URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const shareArticleData = urlParams.get('shareArticle');
  const shareItemData = urlParams.get('shareItem');
  const targetFriendId = urlParams.get('friendId');
  const [sharedArticle, setSharedArticle] = useState<any>(null);
  const [sharedItem, setSharedItem] = useState<any>(null);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  // Parse shared content data on component mount
  useEffect(() => {
    if (shareArticleData) {
      try {
        const articleData = JSON.parse(decodeURIComponent(shareArticleData));
        setSharedArticle(articleData);
        setActiveTab("boardroom"); // Switch to boardroom tab for sharing
      } catch (error) {
        console.error("Failed to parse shared article data:", error);
      }
    }
    
    if (shareItemData) {
      try {
        const itemData = JSON.parse(decodeURIComponent(shareItemData));
        setSharedItem(itemData);
        setActiveTab("boardroom"); // Switch to boardroom tab for sharing
        
        // If a specific friend is targeted, pre-select them
        if (targetFriendId) {
          setSelectedChats([targetFriendId]);
        }
      } catch (error) {
        console.error("Failed to parse shared item data:", error);
      }
    }
  }, [shareArticleData, shareItemData, targetFriendId]);

  // Mock chat data
  const chats: Chat[] = [
    {
      id: "1",
      userId: "1",
      username: "isa",
      displayName: "Isa",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      lastMessage: "One of my friends is also graduating...",
      timestamp: "1h",
      isVerified: false,
      hasUnread: true,
      type: "message"
    },
    {
      id: "2",
      userId: "2",
      username: "isa",
      displayName: "Isa",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      lastMessage: "I have this one but I feel like its not the right vibe?",
      timestamp: "1h",
      hasUnread: true,
      type: "message"
    },
    {
      id: "3",
      userId: "3",
      username: "isa",
      displayName: "Isa",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      lastMessage: "I LOOOOVE the gold!!",
      timestamp: "2h",
      hasUnread: true,
      type: "message"
    },
    {
      id: "4",
      userId: "4",
      username: "isa",
      displayName: "Isa",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      lastMessage: "No its good!! Just bring a sweater...",
      timestamp: "17h",
      hasUnread: true,
      type: "message"
    },
    {
      id: "5",
      userId: "5",
      username: "rhenaoj",
      displayName: "Rhena OJ",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
      messageCount: 3,
      timestamp: "18h",
      hasUnread: true,
      type: "message"
    },
    {
      id: "6",
      userId: "6",
      username: "whoisjustinawho",
      displayName: "Justin Awho",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      lastMessage: "Exactly",
      timestamp: "1d",
      hasUnread: true,
      type: "message"
    },
    {
      id: "7",
      userId: "7",
      username: "Camille",
      displayName: "Camille 💄👄",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
      lastMessage: "Liked a message",
      timestamp: "1d",
      hasUnread: true,
      type: "like"
    },
    {
      id: "8",
      userId: "8",
      username: "ISABELLA",
      displayName: "ISABELLA",
      avatarUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop",
      lastMessage: "Seen yesterday",
      timestamp: "",
      type: "activity"
    },
    {
      id: "9",
      userId: "9",
      username: "fam bam memes",
      displayName: "Fam Bam Memes",
      avatarUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=150&h=150&fit=crop",
      messageCount: 4,
      timestamp: "1d",
      hasUnread: true,
      type: "message"
    }
  ];

  // Mock activity data
  const activities: ActivityItem[] = [
    {
      id: "1",
      userId: "10",
      username: "starryskies23",
      displayName: "Starry Skies",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      action: "Started following you",
      timestamp: "1d",
      isVerified: false,
      type: "follow",
      showFollowBack: true
    },
    {
      id: "2",
      userId: "11",
      username: "nebulanomad",
      displayName: "Nebula Nomad",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      action: "Approved your borrow request",
      timestamp: "1d",
      type: "borrow"
    },
    {
      id: "3",
      userId: "12",
      username: "emberecho",
      displayName: "Ember Echo",
      avatarUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop",
      action: "Liked your comment",
      timestamp: "2d",
      type: "like",
      comment: "This is my favorite out of all 😍"
    },
    {
      id: "4",
      userId: "13",
      username: "lunavoyager",
      displayName: "Luna Voyager",
      avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop",
      action: "Saved your '4th of July' Wishlist",
      timestamp: "3d",
      type: "wishlist",
      thumbnails: [
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=100&h=100&fit=crop"
      ]
    },
    {
      id: "5",
      userId: "14",
      username: "shadowlynx",
      displayName: "Shadow Lynx",
      avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop",
      action: "Commented on your Lookboard",
      timestamp: "4d",
      type: "comment",
      comment: "The silver earrings look so much better!!",
      thumbnails: [
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=100&h=100&fit=crop"
      ]
    },
    {
      id: "6",
      userId: "15",
      username: "nebulanomad",
      displayName: "Nebula Nomad",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      action: "Shared a lulo to your 'Perfect White Tee' open wishlist",
      timestamp: "5d",
      type: "share",
      thumbnails: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop"
      ]
    },
    {
      id: "7",
      userId: "16",
      username: "lunavoyager",
      displayName: "Luna Voyager",
      avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop",
      action: "Liked your comment",
      timestamp: "5d",
      type: "like",
      comment: "This is so adorable!!!"
    }
  ];

  const filteredChats = chats.filter(chat =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (chatId: string) => {
    if (sharedArticle || sharedItem) {
      // If sharing content, toggle chat selection
      setSelectedChats(prev => 
        prev.includes(chatId) 
          ? prev.filter(id => id !== chatId)
          : [...prev, chatId]
      );
    } else {
      // Normal navigation to individual chat
      navigate(`/chat/${chatId}`);
    }
  };

  const handleSendContent = () => {
    if ((!sharedArticle && !sharedItem) || selectedChats.length === 0) return;
    
    if (sharedArticle) {
      // Send article
      console.log("Sending article to chats:", selectedChats, sharedArticle);
      alert(`Article "${sharedArticle.title}" sent to ${selectedChats.length} chat(s)!`);
      navigate(`/article/${sharedArticle.id}`);
    } else if (sharedItem) {
      // Send item
      console.log("Sending item to chats:", selectedChats, sharedItem);
      alert(`Item "${sharedItem.name}" sent to ${selectedChats.length} chat(s)!`);
      // Navigate back to the previous page (usually the article where the item was)
      window.history.back();
    }
  };

  const handleCancelShare = () => {
    if (sharedArticle) {
      navigate(`/article/${sharedArticle.id}`);
    } else if (sharedItem) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-lulo-border sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 pt-4 pb-2">
          {(sharedArticle || sharedItem) ? (
            /* Sharing Header */
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={handleCancelShare}>
                  Cancel
                </Button>
                <h1 className="text-lg font-semibold">
                  {sharedArticle ? "Share Article" : "Share Item"}
                </h1>
              </div>
              <Button 
                onClick={handleSendContent}
                disabled={selectedChats.length === 0}
                className="bg-[#FADADD] hover:bg-[#FADADD]/90 text-white"
              >
                Send ({selectedChats.length})
              </Button>
            </div>
          ) : (
            /* Normal Tabs */
            <div className="flex items-center justify-center space-x-8">
              <button
                onClick={() => setActiveTab("boardroom")}
                className={`text-sm font-medium pb-2 border-b-2 transition-all duration-200 ${
                  activeTab === "boardroom"
                    ? "text-[#FADADD] border-[#FADADD]"
                    : "text-gray-400 border-transparent hover:text-[#FADADD] hover:border-[#FADADD]/50"
                }`}
              >
                Board Room
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`relative text-sm font-medium pb-2 border-b-2 transition-all duration-200 ${
                  activeTab === "activity"
                    ? "text-[#FADADD] border-[#FADADD]"
                    : "text-gray-400 border-transparent hover:text-[#FADADD] hover:border-[#FADADD]/50"
                }`}
              >
                Activity
                {/* Notification badge */}
                <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  1
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full"
            />
          </div>
          <Button variant="ghost" size="sm" className="rounded-full p-2 lulo-hover">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Shared Content Preview */}
      {(sharedArticle || sharedItem) && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-600 mb-2">
              Sharing this {sharedArticle ? "article" : "item"}:
            </p>
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex space-x-3">
                <img 
                  src={sharedArticle ? sharedArticle.imageUrl : sharedItem.imageUrl} 
                  alt={sharedArticle ? sharedArticle.title : sharedItem.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  {sharedArticle ? (
                    <>
                      <p className="text-xs text-gray-500 mb-1">{sharedArticle.source}</p>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                        {sharedArticle.title}
                      </h4>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 mb-1">{sharedItem.brand}</p>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                        {sharedItem.name}
                      </h4>
                      <p className="text-xs text-gray-600">{sharedItem.price}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-md mx-auto">
        {(activeTab === "boardroom" || sharedArticle || sharedItem) ? (
          /* Chat List */
          <div className="divide-y divide-gray-100">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              ))
            ) : (
              filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleChatClick(chat.id)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {/* Selection checkbox for sharing */}
                  {(sharedArticle || sharedItem) && (
                    <input
                      type="checkbox"
                      checked={selectedChats.includes(chat.id)}
                      onChange={() => handleChatClick(chat.id)}
                      className="w-4 h-4 text-[#FADADD] border-gray-300 rounded focus:ring-[#FADADD]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  
                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chat.avatarUrl} />
                      <AvatarFallback>{chat.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {chat.hasUnread && (
                      <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Chat info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <h3 
                        className="font-medium text-sm truncate hover:text-[#FADADD] cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/${chat.userId}`);
                        }}
                      >
                        {chat.username}
                      </h3>
                      {chat.isVerified && (
                        <Badge variant="secondary" className="w-4 h-4 p-0 bg-blue-500 rounded-full">
                          <span className="text-white text-xs">✓</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.messageCount 
                        ? `${chat.messageCount}${chat.messageCount >= 4 ? '+' : ''} new messages`
                        : chat.lastMessage
                      }
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-gray-400">
                    {chat.timestamp}
                  </span>
                </div>

                {/* Camera icon */}
                <Button variant="ghost" size="sm" className="ml-2 p-2">
                  <Camera className="w-5 h-5 text-gray-400" />
                </Button>
              </div>
            ))
            )}
          </div>
        ) : (
          /* Activity List */
          <div className="divide-y divide-gray-100">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex items-start px-4 py-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-8" />
                </div>
              ))
            ) : (
              activities.map((activity) => (
              <div
                key={activity.id}
                className="relative flex items-start px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Red dot for unread */}
                <div className="absolute left-1 top-6 w-2 h-2 bg-red-500 rounded-full"></div>

                <div className="flex items-start space-x-3 flex-1">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={activity.avatarUrl} />
                    <AvatarFallback>{activity.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* Activity info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mb-1">
                      <h3 
                        className="font-semibold text-sm hover:text-[#FADADD] cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/${activity.userId}`);
                        }}
                      >
                        {activity.username}
                      </h3>
                      <span className="text-xs text-gray-400">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    
                    {/* Comment text if present */}
                    {activity.comment && (
                      <p className="text-sm text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1 inline-block">
                        {activity.comment}
                      </p>
                    )}
                    
                    {/* Follow back button */}
                    {activity.showFollowBack && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs bg-black text-white hover:bg-gray-800 rounded-full px-4 py-1"
                      >
                        follow back
                      </Button>
                    )}
                  </div>
                </div>

                {/* Thumbnails */}
                {activity.thumbnails && (
                  <div className="flex space-x-1">
                    {activity.thumbnails.map((thumb, idx) => (
                      <img
                        key={idx}
                        src={thumb}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}