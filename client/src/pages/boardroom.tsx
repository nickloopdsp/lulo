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
    // Navigate to individual chat
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 pt-4 pb-2">
          {/* Tabs */}
          <div className="flex items-center justify-center space-x-8 mb-4">
            <button
              onClick={() => setActiveTab("boardroom")}
              className={`text-base font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "boardroom"
                  ? "text-lulo-pink border-lulo-pink"
                  : "text-gray-400 border-transparent"
              }`}
            >
              Board Room
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`relative text-base font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "activity"
                  ? "text-lulo-pink border-lulo-pink"
                  : "text-gray-400 border-transparent"
              }`}
            >
              Activity
              {/* Notification badge */}
              <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                1
              </span>
            </button>
          </div>

          {/* Search bar */}
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
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">
        {activeTab === "boardroom" ? (
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
                      <h3 className="font-medium text-sm truncate">{chat.username}</h3>
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
                      <h3 className="font-semibold text-sm">{activity.username}</h3>
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