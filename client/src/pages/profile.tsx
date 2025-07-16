import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["/api/wishlist"],
  });

  const { data: closetItems = [] } = useQuery({
    queryKey: ["/api/closet"],
  });

  // Type guard to ensure arrays
  const wishlistArray = Array.isArray(wishlistItems) ? wishlistItems : [];
  const closetArray = Array.isArray(closetItems) ? closetItems : [];

  // Mock background images for masonry header (representing closet items)
  const headerImages = [
    "/api/placeholder/200/250",
    "/api/placeholder/200/300", 
    "/api/placeholder/200/280",
    "/api/placeholder/200/320",
    "/api/placeholder/200/260",
    "/api/placeholder/200/290",
    "/api/placeholder/200/310",
    "/api/placeholder/200/270",
    "/api/placeholder/200/330",
    "/api/placeholder/200/240",
    "/api/placeholder/200/285",
    "/api/placeholder/200/295",
  ];

  // Mock content folders
  const contentFolders = [
    {
      name: "Summer Vibes",
      itemCount: 12,
      previewImages: [
        "/api/placeholder/200/285",
        "/api/placeholder/200/295",
        "/api/placeholder/200/305",
        "/api/placeholder/200/275",
      ]
    },
    {
      name: "Work Outfits", 
      itemCount: 8,
      previewImages: [
        "/api/placeholder/200/240",
        "/api/placeholder/200/330",
        "/api/placeholder/200/265",
        "/api/placeholder/200/315",
      ]
    },
    {
      name: "Date Night",
      itemCount: 6,
      previewImages: [
        "/api/placeholder/200/255",
        "/api/placeholder/200/325",
        "/api/placeholder/200/285",
        "/api/placeholder/200/295",
      ]
    }
  ];

  const mockUser = {
    name: "JUANITA MORENO",
    bio: "bio",
    username: "@juanitamorenoh",
    luloPoints: 200,
    following: 321,
    wishlists: 16,
    profileImageUrl: "/api/placeholder/120/120"
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header with Masonry Grid of Closet Items */}
      <div className="relative h-72 overflow-hidden bg-gray-50">
        <div className="header-masonry h-full">
          {headerImages.map((src, index) => (
            <div key={index} className="header-masonry-item">
              <img 
                src={src} 
                alt=""
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Profile Picture Overlay - Positioned relative to main container */}
      <div className="absolute top-72 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <Avatar className="w-28 h-28 border-4 border-white shadow-2xl ring-2 ring-white bg-white">
          <AvatarImage src={mockUser.profileImageUrl} alt={mockUser.name} />
          <AvatarFallback className="bg-lulo-light-gray text-lulo-dark text-xl font-bold">
            JM
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Profile Info Section */}
      <div className="bg-white pt-16 pb-6 px-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-black">{mockUser.name}</h1>
          <p className="text-gray-600 text-sm">{mockUser.bio}</p>
          <p className="text-gray-600 text-sm font-medium">{mockUser.username}</p>
        </div>
        
        {/* Stats Section */}
        <div className="mt-4 text-center">
          <p className="text-gray-700 text-sm font-medium">
            {mockUser.luloPoints} Lulos | {mockUser.following} following | {mockUser.wishlists} Wishlists
          </p>
        </div>
      </div>

      {/* Content Folders */}
      <div className="px-4 pb-20">
        <div className="space-y-4">
          {contentFolders.map((folder, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {/* Folder Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{folder.name}</h3>
                    <p className="text-sm text-gray-500">{folder.itemCount} items</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              {/* Folder Preview - Enhanced Stacked Images */}
              <div className="p-6">
                <div className="relative w-full h-44 flex items-center justify-center">
                  {folder.previewImages.map((src, imgIndex) => (
                    <div 
                      key={imgIndex} 
                      className="absolute w-28 h-36 rounded-xl overflow-hidden shadow-xl"
                      style={{
                        transform: `rotate(${(imgIndex - 1.5) * 12}deg) translateX(${(imgIndex - 1.5) * 16}px) translateY(${Math.abs(imgIndex - 1.5) * 4}px)`,
                        zIndex: 4 - Math.abs(imgIndex - 1.5),
                      }}
                    >
                      <img 
                        src={src} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
