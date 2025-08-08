import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, Plus, MoreVertical, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/bottom-navigation';

// Type definitions
interface ProductItem {
  id: string;
  name: string;
  brand: string;
  price?: string;
  imageUrl: string;
  sourceUrl: string;
}
interface IndividualLookboard {
  id: number;
  name: string;
  itemCount: number;
  imageCollage: string[];
  isPrivate: boolean;
  isArchived: boolean;
  products?: ProductItem[];
}

interface MiniatureLookboard {
  id: number;
  name: string;
  imageCollage: string[];
}

interface Collection {
  id: number;
  name: string;
  lookboardCount: number;
  isPrivate: boolean;
  miniatureLookboards: MiniatureLookboard[];
}

// Seed collection: LONDON! (from provided links)
const londonImageUrls = [
  "https://i.pinimg.com/1200x/07/0d/9e/070d9e7d041e906192695304d8d5477a.jpg",
  "https://i.pinimg.com/736x/a9/bd/e3/a9bde36c7a270dd5a0748517d479ae6d.jpg",
  "https://i.pinimg.com/1200x/27/c1/f7/27c1f73fa6f640a7267bfbef71fdde7c.jpg",
];

const defaultImportedCollections: Collection[] = [
  {
    id: 10001,
    name: "LONDON!",
    lookboardCount: londonImageUrls.length,
    isPrivate: false,
    miniatureLookboards: londonImageUrls.map((url, idx) => ({
      id: 20000 + idx,
      name: "",
      imageCollage: [url],
    })),
  },
];

const defaultCollectionLookboards: Record<string, IndividualLookboard[]> = {
  "LONDON!": londonImageUrls.map((url, idx) => ({
    id: 30000 + idx,
    name: "",
    itemCount: 1,
    imageCollage: [url],
    isPrivate: false,
    isArchived: false,
    products: [
      {
        id: `p-${idx}-1`,
        name: "Sample Knit Sweater",
        brand: "Brand A",
        price: "$120",
        imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=300",
        sourceUrl: "https://example.com/product/a",
      },
      {
        id: `p-${idx}-2`,
        name: "Wide-Leg Jeans",
        brand: "Brand B",
        price: "$180",
        imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9b?w=300",
        sourceUrl: "https://example.com/product/b",
      },
    ],
  })),
};

// Mock data for individual lookboards (for ALL tab)
const mockIndividualLookboards: IndividualLookboard[] = [
  {
    id: 1,
    name: "Honeymoon Collection",
    itemCount: 4,
    imageCollage: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop", 
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop"
    ],
    isPrivate: false,
    isArchived: false
  },
  {
    id: 2,
    name: "Paris Girls Trip",
    itemCount: 4,
    imageCollage: [
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop", 
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop"
    ],
    isPrivate: false,
    isArchived: false
  },
  {
    id: 3,
    name: "Beach Looks",
    itemCount: 4,
    imageCollage: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop"
    ],
    isPrivate: false,
    isArchived: false
  },
  {
    id: 4,
    name: "Casual Weekend",
    itemCount: 4,
    imageCollage: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop"
    ],
    isPrivate: true,
    isArchived: false
  },
  {
    id: 5,
    name: "Spring Archive",
    itemCount: 4,
    imageCollage: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop"
    ],
    isPrivate: false,
    isArchived: true
  },
  {
    id: 6,
    name: "Old Date Looks",
    itemCount: 4,
    imageCollage: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
    ],
    isPrivate: false,
    isArchived: true
  }
];

// Mock collections data with miniature lookboards inside each collection card
const mockCollections: Collection[] = [
  {
    id: 1,
    name: "Honeymoon",
    lookboardCount: 4,
    isPrivate: false,
    miniatureLookboards: [
      {
        id: 1,
        name: "Honeymoon Collection",
        imageCollage: [
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop", 
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 2,
        name: "Beach Day 1",
        imageCollage: [
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 3,
        name: "Beach Day 2", 
        imageCollage: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop"
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Beach Trips",
    lookboardCount: 3,
    isPrivate: true,
    miniatureLookboards: [
      {
        id: 4,
        name: "Beach Looks",
        imageCollage: [
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 5,
        name: "Ski Day 1",
        imageCollage: [
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Paris Girls Trip",
    lookboardCount: 4,
    isPrivate: false,
    miniatureLookboards: [
      {
        id: 6,
        name: "Paris Girls Trip",
        imageCollage: [
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop", 
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 7,
        name: "Central Park",
        imageCollage: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 8,
        name: "Broadway Night",
        imageCollage: [
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Ski Vibes",
    lookboardCount: 5,
    isPrivate: false,
    miniatureLookboards: [
      {
        id: 9,
        name: "Friday Dinner",
        imageCollage: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 10,
        name: "Town Exploring",
        imageCollage: [
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 11,
        name: "Travel Day",
        imageCollage: [
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop"
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Pilates",
    lookboardCount: 4,
    isPrivate: true,
    miniatureLookboards: [
      {
        id: 12,
        name: "Morning Class",
        imageCollage: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 13,
        name: "Evening Flow",
        imageCollage: [
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Work Looks",
    lookboardCount: 9,
    isPrivate: true,
    miniatureLookboards: [
      {
        id: 14,
        name: "Monday Meeting",
        imageCollage: [
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 15,
        name: "Client Presentation",
        imageCollage: [
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
        ]
      },
      {
        id: 16,
        name: "Casual Friday",
        imageCollage: [
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop",
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop"
        ]
      }
    ]
  }
];

// Mock data for specific collection lookboards (e.g., Honeymoon)
const mockHoneymoonLookboards: IndividualLookboard[] = [
  {
    id: 1,
    name: "Friday Dinner",
    itemCount: 12,
    imageCollage: [
      "/api/placeholder/200/250",
      "/api/placeholder/200/300",
      "/api/placeholder/200/280",
      "/api/placeholder/200/320"
    ],
    isPrivate: false,
    isArchived: false
  },
  {
    id: 2,
    name: "Town Exploring",
    itemCount: 8,
    imageCollage: [
      "/api/placeholder/200/260",
      "/api/placeholder/200/290",
      "/api/placeholder/200/310",
      "/api/placeholder/200/270"
    ],
    isPrivate: false,
    isArchived: false
  },
  {
    id: 3,
    name: "Travel Day",
    itemCount: 10,
    imageCollage: [
      "/api/placeholder/200/270",
      "/api/placeholder/200/330",
      "/api/placeholder/200/240",
      "/api/placeholder/200/280"
    ],
    isPrivate: false,
    isArchived: false
  },
  {
    id: 4,
    name: "Vineyard Daytrip",
    itemCount: 6,
    imageCollage: [
      "/api/placeholder/200/280",
      "/api/placeholder/200/300",
      "/api/placeholder/200/320",
      "/api/placeholder/200/290"
    ],
    isPrivate: false,
    isArchived: false
  }
];

// Type guard functions
const isCollection = (item: Collection | IndividualLookboard): item is Collection => {
  return 'miniatureLookboards' in item;
};

const isIndividualLookboard = (item: Collection | IndividualLookboard): item is IndividualLookboard => {
  return 'itemCount' in item;
};

export default function Lookboards() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedLookboard, setSelectedLookboard] = useState<IndividualLookboard | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setLocation] = useLocation();
  const [importedCollections, setImportedCollections] = useState<Collection[]>(defaultImportedCollections);
  const [collectionLookboards, setCollectionLookboards] = useState<Record<string, IndividualLookboard[]>>(defaultCollectionLookboards);

  // Check if we're viewing a specific collection
  const isViewingCollection = selectedCollection !== null;
  
  // Check if we're viewing a specific lookboard
  const isViewingLookboard = selectedLookboard !== null;

  // Get the appropriate data based on current view
  const getCurrentData = (): (Collection | IndividualLookboard)[] => {
    if (isViewingLookboard) {
      return []; // We'll handle this in the detail view
    }
    if (isViewingCollection) {
      if (selectedCollection && collectionLookboards[selectedCollection]) {
        return collectionLookboards[selectedCollection];
      }
      return mockHoneymoonLookboards; // fallback sample
    }
    if (selectedFilter === "collections") {
      // Collections tab shows collection folders
      return [...importedCollections, ...mockCollections];
    }
    if (selectedFilter === "archived") {
      return mockIndividualLookboards.filter(lookboard => lookboard.isArchived);
    }
    // For "all" filter, show individual lookboard collages (non-archived)
    return mockIndividualLookboards.filter(lookboard => !lookboard.isArchived);
  };

  const currentData = getCurrentData();

  // Filter data based on search query
  const filteredData = currentData?.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleBack = () => {
    if (isViewingLookboard) {
      setSelectedLookboard(null);
    } else if (isViewingCollection) {
      setSelectedCollection(null);
    } else {
      navigate('/wishlist'); // Go back to main navigation
    }
  };

  const handleLookboardClick = (lookboard: IndividualLookboard) => {
    if (isViewingCollection) {
      setSelectedLookboard(lookboard);
    } else {
      // Navigate to lookboard detail view
      navigate(`/lookboard/${lookboard.id}`);
    }
  };

  const handleCollectionClick = (collection: Collection) => {
    setSelectedCollection(collection.name);
  };

  const handleCreateLookboard = () => {
    setLocation("/create-lookboard");
  };

  // Import flow removed per request

  // Lookboard Detail View
  if (isViewingLookboard) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-lulo-border">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="p-2">
              <ArrowLeft className="w-5 h-5 text-lulo-dark" />
            </button>
            <h1 className="text-lg font-semibold text-[#FADADD]">{selectedLookboard.name}</h1>
            <button className="p-2">
              <MoreVertical className="w-5 h-5 text-lulo-gray" />
            </button>
          </div>
        </div>
        
        {/* Lookboard Detail Content */}
        <div className="p-4">
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            {selectedLookboard.imageCollage.length === 1 ? (
              <div className="mb-4">
                <img
                  src={`/api/image-proxy?url=${encodeURIComponent(selectedLookboard.imageCollage[0])}`}
                  alt="Lookboard image"
                  className="w-full h-auto object-contain rounded-xl"
                  style={{ maxHeight: '70vh' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = selectedLookboard.imageCollage[0];
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedLookboard.imageCollage.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={`/api/image-proxy?url=${encodeURIComponent(image)}`}
                    alt="Lookboard image"
                    className="w-full h-40 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = image;
                    }}
                  />
                ))}
              </div>
            )}

            {selectedLookboard.name && (
              <h2 className="text-xl font-semibold text-lulo-dark mb-2">{selectedLookboard.name}</h2>
            )}
            <p className="text-sm text-gray-500">{selectedLookboard.itemCount} Items</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-6">
            <Button variant="ghost" size="sm" className="p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Button>
            <Button variant="ghost" size="sm" className="p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </Button>
            <Button variant="ghost" size="sm" className="p-3">
              <Plus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button variant="ghost" size="sm" className="p-3">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>

          {/* Get the Look */}
          <div className="mt-2">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Get the Look</h3>
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {(selectedLookboard.products || []).map((p) => (
                <div
                  key={p.id}
                  className="cursor-pointer group flex-shrink-0 w-32"
                  onClick={() => navigate(`/item/${encodeURIComponent(p.id)}`)}
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-gray-100">
                    <img
                      src={`/api/image-proxy?url=${encodeURIComponent(p.imageUrl)}`}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = p.imageUrl; }}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-black">{p.brand}</p>
                    <p className="text-xs text-gray-600 truncate">{p.name}</p>
                    {p.price && <p className="text-xs font-semibold text-lulo-dark">{p.price}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lulo-gray" />
          <Input
            placeholder="Search your lookboards"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 border-lulo-border rounded-full bg-gray-50"
          />
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="bg-white px-4 py-3 border-b border-lulo-border">
        <div className="flex items-center justify-between">
          <button className="p-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex space-x-2">
            <button 
              key="all"
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedFilter === "all"
                  ? "bg-lulo-pink text-lulo-pink-accent"
                  : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
              }`}
            >
              ALL
            </button>
            <button 
              key="collections"
              onClick={() => setSelectedFilter("collections")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedFilter === "collections"
                  ? "bg-lulo-pink text-lulo-pink-accent"
                  : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
              }`}
            >
              Collections
            </button>
            <button 
              key="archived"
              onClick={() => setSelectedFilter("archived")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedFilter === "archived"
                  ? "bg-lulo-pink text-lulo-pink-accent"
                  : "text-gray-700 hover:bg-lulo-pink hover:text-lulo-pink-accent"
              }`}
            >
              Archived
            </button>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 lulo-hover rounded-lg"
              onClick={handleCreateLookboard}
            >
              <Plus className="w-5 h-5" />
            </Button>
            
            {showCreateModal && (
              <div className="absolute top-12 right-0 z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Create New Lookbook</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lookbook Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter lookbook name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FADADD] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collection (Optional)
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FADADD] focus:border-transparent">
                        <option value="">Select a collection</option>
                        <option value="beach-trips">Beach Trips</option>
                        <option value="ski-vibes">Ski Vibes</option>
                        <option value="nyc-summer">NYC Summer</option>
                        <option value="honeymoon">Honeymoon</option>
                        <option value="pilates">Pilates</option>
                        <option value="work-looks">Work Looks</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private-lookbook"
                        className="h-4 w-4 text-[#FADADD] focus:ring-[#FADADD] border-gray-300 rounded"
                      />
                      <label htmlFor="private-lookbook" className="text-sm text-gray-700">
                        Make this lookbook private
                      </label>
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={() => setShowCreateModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        // TODO: Handle lookbook creation
                        console.log("Creating lookbook...");
                        setShowCreateModal(false);
                      }}
                      className="flex-1 bg-[#FADADD] hover:bg-[#FADADD]/90 text-white"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* Import modal removed per request */}
          </div>
        </div>
      </div>

      {/* Content Grid - Consistent 2-column layout for all tabs */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="liquid-glass rounded-2xl overflow-hidden cursor-pointer hover:border-[#FADADD]/30 transition-colors relative group transform transition-all duration-300 hover:scale-[1.02]"
              onClick={() => {
                if (isCollection(item)) {
                  handleCollectionClick(item);
                } else {
                  handleLookboardClick(item);
                }
              }}
            >
              {isCollection(item) ? (
                // Collection Card - Shows 2-3 miniature lookboards inside
                <div>
                  {/* Miniature Lookboards Grid */}
                  <div className="p-2">
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {item.miniatureLookboards.slice(0, 4).map((miniLookboard: MiniatureLookboard, index: number) => (
                        <div key={index} className="relative">
                          <img
                            src={`/api/image-proxy?url=${encodeURIComponent(miniLookboard.imageCollage[0])}`}
                            alt={miniLookboard.name}
                            className="w-full h-12 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          {index === 3 && item.miniatureLookboards.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                              <span className="text-white text-xs font-medium">+{item.miniatureLookboards.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collection Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-gray-900 transition-colors">{item.name}</h3>
                    <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{item.lookboardCount} Lookboards</p>
                  </div>
                </div>
              ) : (
                // Individual Lookboard Card - Shows 4-image collage
                <div>
                  {/* Image Collage */}
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {item.imageCollage.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={`/api/image-proxy?url=${encodeURIComponent(image)}`}
                        alt=""
                        className="w-full h-16 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                      />
                    ))}
                  </div>

                  {/* Lookboard Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-gray-900 transition-colors">{item.name}</h3>
                    <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{item.itemCount} Items</p>
                  </div>
                </div>
              )}

              {/* Private Indicator */}
              {item.isPrivate && (
                <div className="absolute top-2 left-2">
                  <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                  </svg>
                </div>
              )}

              {/* Options Menu */}
              <div className="absolute top-2 right-2">
                <button className="p-1">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
} 