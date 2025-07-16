import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Heart, MessageCircle, Share2, Users, UserPlus, Star, 
  Clock, MoreHorizontal, Eye, Gift, BookOpen, Camera, Bell,
  ArrowLeft, Phone, Video, Smile, Mic, Send, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LuloWordmark } from "@/components/lulo-icon";

export default function Notifications() {
  const [selectedTab, setSelectedTab] = useState("board-room");
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");

  // Mock Board Room conversations data
  const mockBoardRoomData = [
    {
      id: 1,
      user: {
        id: "nicksent",
        name: "nicksent",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      lastMessage: "4+ new messages",
      timestamp: "1h",
      unreadCount: 4,
      isNew: true
    },
    {
      id: 2,
      user: {
        id: "Isa",
        name: "Isa",
        avatar: "/api/placeholder/40/40"
      },
      lastMessage: "2 new messages",
      timestamp: "1h",
      unreadCount: 2,
      isNew: true
    },
    {
      id: 3,
      user: {
        id: "cmf",
        name: "cmf",
        avatar: "/api/placeholder/40/40"
      },
      lastMessage: "2 new messages",
      timestamp: "2h",
      unreadCount: 2,
      isNew: true
    },
    {
      id: 4,
      user: {
        id: "victoriaxvivero",
        name: "victoriaxvivero",
        avatar: "/api/placeholder/40/40"
      },
      lastMessage: "4 new messages",
      timestamp: "17h",
      unreadCount: 4,
      isNew: false
    },
    {
      id: 5,
      user: {
        id: "rhenaoj",
        name: "rhenaoj",
        avatar: "/api/placeholder/40/40"
      },
      lastMessage: "3 new messages",
      timestamp: "18h",
      unreadCount: 3,
      isNew: false
    },
    {
      id: 6,
      user: {
        id: "whoisjustinawho",
        name: "whoisjustinawho",
        avatar: "/api/placeholder/40/40"
      },
      lastMessage: "Exactly",
      timestamp: "1d",
      unreadCount: 0,
      isNew: false
    },
    {
      id: 7,
      user: {
        id: "Camille",
        name: "Camille",
        avatar: "/api/placeholder/40/40",
        emoji: "🌸😘"
      },
      lastMessage: "Liked a message",
      timestamp: "1d",
      unreadCount: 0,
      isNew: false
    },
    {
      id: 8,
      user: {
        id: "ISABELLA",
        name: "ISABELLA",
        avatar: "/api/placeholder/40/40"
      },
      lastMessage: "Seen yesterday",
      timestamp: "yesterday",
      unreadCount: 0,
      isNew: false,
      isOffline: true
    },
    {
      id: 9,
      user: {
        id: "fam bam memes",
        name: "fam bam memes",
        avatar: "/api/placeholder/40/40"
      },
      lastMessage: "4+ new messages",
      timestamp: "1d",
      unreadCount: 4,
      isNew: false
    },
    {
      id: 10,
      user: {
        id: "Mariana Perales Senior",
        name: "Mariana Perales Senior",
        avatar: "/api/placeholder/40/40"
      },
      lastMessage: "2 new messages",
      timestamp: "2d",
      unreadCount: 2,
      isNew: false
    }
  ];

  // Mock chat messages for individual conversations
  const mockChatMessages = [
    {
      id: 1,
      user: "Isa",
      message: "What do you think of this for the welcome dinner?",
      timestamp: "Nov 30, 2023, 9:41 AM",
      image: "/api/placeholder/300/400",
      isMe: false
    },
    {
      id: 2,
      user: "me",
      message: "OMGQ",
      timestamp: "Nov 30, 2023, 9:41 AM",
      isMe: true
    },
    {
      id: 3,
      user: "me",
      message: "I love it!!!",
      timestamp: "Nov 30, 2023, 9:41 AM",
      isMe: true
    },
    {
      id: 4,
      user: "Isa",
      message: "I saw it on sale at Harrods the other day, do you want me to check for you?",
      timestamp: "Nov 30, 2023, 9:41 AM",
      isMe: false
    },
    {
      id: 5,
      user: "me",
      message: "That would be amazing!! I'll be flying in in two weeks, I also saw it on Selfridge's so let me know and I can order either.",
      timestamp: "Nov 30, 2023, 9:41 AM",
      isMe: true
    },
    {
      id: 6,
      user: "Isa",
      message: "On it!!",
      timestamp: "Nov 30, 2023, 9:41 AM",
      isMe: false
    },
    {
      id: 7,
      user: "Isa",
      message: "I also saw this one I think would look amazing with your eyes for the day after!",
      timestamp: "Nov 30, 2023, 9:41 AM",
      isMe: false
    }
  ];

  // Mock activity notifications data (existing functionality)
  const mockActivityData = [
    {
      id: 1,
      type: "follow",
      user: {
        id: "starryskies23",
        name: "starryskies23",
        avatar: "/api/placeholder/40/40"
      },
      action: "Started following you",
      timestamp: "1d",
      isNew: true
    },
    {
      id: 2,
      type: "borrow_request",
      user: {
        id: "nebulanomad",
        name: "nebulanomad",
        avatar: "/api/placeholder/40/40"
      },
      action: "Approved your borrow request",
      timestamp: "1d",
      isNew: false
    },
    {
      id: 3,
      type: "comment",
      user: {
        id: "emberecho",
        name: "emberecho",
        avatar: "/api/placeholder/40/40"
      },
      action: "Liked your comment",
      comment: "This is my favorite out of all 😍",
      timestamp: "2d",
      isNew: false
    },
    {
      id: 4,
      type: "save",
      user: {
        id: "lunavoyager",
        name: "lunavoyager",
        avatar: "/api/placeholder/40/40"
      },
      action: "Saved your '4th of July' Wishlist",
      thumbnail: "/api/placeholder/50/50",
      timestamp: "3d",
      isNew: false
    },
    {
      id: 5,
      type: "comment",
      user: {
        id: "shadowlynx",
        name: "shadowlynx",
        avatar: "/api/placeholder/40/40"
      },
      action: "Commented on your Lookboard",
      comment: "The silver earrings look so much better!!",
      timestamp: "4d",
      isNew: false
    },
    {
      id: 6,
      type: "share",
      user: {
        id: "nebulanomad",
        name: "nebulanomad",
        avatar: "/api/placeholder/40/40"
      },
      action: "Shared a lulo to your 'Perfect White Tee' open wishlist",
      thumbnail: "/api/placeholder/50/50",
      timestamp: "5d",
      isNew: false
    },
    {
      id: 7,
      type: "comment",
      user: {
        id: "lunavoyager",
        name: "lunavoyager",
        avatar: "/api/placeholder/40/40"
      },
      action: "Liked your comment",
      comment: "This is so adorable!!!",
      timestamp: "5d",
      isNew: false
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <UserPlus className="w-4 h-4 text-lulo-coral" />;
      case "like":
        return <Heart className="w-4 h-4 text-lulo-pink" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-lulo-sage" />;
      case "save":
        return <BookOpen className="w-4 h-4 text-lulo-coral" />;
      case "share":
        return <Share2 className="w-4 h-4 text-lulo-sage" />;
      case "borrow_request":
        return <Gift className="w-4 h-4 text-lulo-pink" />;
      default:
        return <Star className="w-4 h-4 text-lulo-gray" />;
    }
  };

  const BoardRoomItem = ({ conversation }: { conversation: any }) => (
    <div 
      className={`flex items-center space-x-3 p-4 ${
        conversation.isNew ? 'bg-white' : 'bg-white'
      } hover:bg-lulo-light-gray transition-colors border-b border-lulo-border cursor-pointer`}
      onClick={() => setSelectedChat(conversation)}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={conversation.user.avatar} />
          <AvatarFallback className="bg-lulo-light-gray text-lulo-dark text-sm">
            {conversation.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-lulo-coral rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${conversation.unreadCount > 0 ? 'font-semibold text-lulo-dark' : 'font-medium text-lulo-dark'}`}>
            {conversation.user.name}
          </span>
          {conversation.user.verified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          {conversation.user.emoji && (
            <span className="text-sm">{conversation.user.emoji}</span>
          )}
        </div>
        <p className={`text-xs mt-1 ${
          conversation.unreadCount > 0 ? 'text-lulo-dark font-medium' : 'text-lulo-gray'
        } ${conversation.isOffline ? 'italic' : ''}`}>
          {conversation.lastMessage}
        </p>
      </div>
      
      <div className="flex flex-col items-end space-y-1">
        <span className="text-xs text-lulo-gray">{conversation.timestamp}</span>
        <div className="w-6 h-6 flex items-center justify-center">
          <Camera className="w-4 h-4 text-lulo-gray" />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: { activity: any }) => (
    <div className="flex items-start space-x-3 p-4 bg-white hover:bg-lulo-light-gray transition-colors border-b border-lulo-border">
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={activity.user.avatar} />
          <AvatarFallback className="bg-lulo-light-gray text-lulo-dark text-sm">
            {activity.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          {getActivityIcon(activity.type)}
        </div>
        {activity.isNew && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-lulo-coral rounded-full"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-lulo-dark text-sm">{activity.user.name}</span>
          <span className="text-lulo-gray text-xs">{activity.timestamp}</span>
        </div>
        <p className="text-lulo-gray text-sm mt-1">{activity.action}</p>
        
        {activity.comment && (
          <div className="mt-2 p-2 bg-lulo-light-gray rounded-lg">
            <p className="text-lulo-dark text-sm italic">"{activity.comment}"</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {activity.thumbnail && (
          <img 
            src={activity.thumbnail} 
            alt="Notification thumbnail" 
            className="w-10 h-10 rounded object-cover"
          />
        )}
      </div>
    </div>
  );

  const ChatMessage = ({ message }: { message: any }) => (
    <div className={`flex ${message.isMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        message.isMe 
          ? 'bg-lulo-dark text-white' 
          : 'bg-lulo-light-gray text-lulo-dark'
      }`}>
        {message.image && (
          <img src={message.image} alt="Shared image" className="w-full rounded-lg mb-2" />
        )}
        <p className="text-sm">{message.message}</p>
      </div>
    </div>
  );

  const sendMessage = () => {
    if (messageInput.trim()) {
      // Mock sending message functionality
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

  // If a chat is selected, show the chat interface
  if (selectedChat) {
    return (
      <div className="mobile-main bg-white">
        {/* Chat Header */}
        <div className="bg-white px-4 py-3 border-b border-lulo-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedChat(null)}
                className="p-1"
              >
                <ArrowLeft className="w-5 h-5 text-lulo-dark" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src={selectedChat.user.avatar} />
                <AvatarFallback className="bg-lulo-light-gray text-lulo-dark text-sm">
                  {selectedChat.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-sm font-semibold text-lulo-dark">{selectedChat.user.name}</h2>
                <p className="text-xs text-lulo-gray">Active 11m ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Phone className="w-5 h-5 text-lulo-dark" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Video className="w-5 h-5 text-lulo-dark" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {mockChatMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-lulo-border p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <ImageIcon className="w-5 h-5 text-lulo-gray" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Smile className="w-5 h-5 text-lulo-gray" />
            </Button>
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Message..."
              className="flex-1 border-none bg-lulo-light-gray rounded-full px-4"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button variant="ghost" size="sm" className="p-2">
              <Mic className="w-5 h-5 text-lulo-gray" />
            </Button>
            <Button 
              onClick={sendMessage}
              variant="ghost" 
              size="sm" 
              className="p-2"
              disabled={!messageInput.trim()}
            >
              <Send className={`w-5 h-5 ${messageInput.trim() ? 'text-lulo-dark' : 'text-lulo-gray'}`} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-main">
      {/* Logo Header */}
      <div className="bg-white border-b border-lulo-border sticky top-0 z-50">
        <div className="flex items-center justify-start px-4 py-3">
          <LuloWordmark 
            iconSize={20} 
            textSize="text-lg" 
            color="hsl(240, 12%, 11%)"
            className="text-lulo-dark"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-lulo-border">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="board-room" className="text-sm">
              Board Room
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-sm">
              Activity
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="bg-lulo-light-gray flex-1">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsContent value="board-room" className="m-0">
            <div className="bg-white">
              {mockBoardRoomData.map((conversation) => (
                <BoardRoomItem key={conversation.id} conversation={conversation} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="m-0">
            <div className="bg-white">
              {mockActivityData.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 