import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, MousePointer, Plus, MoreHorizontal, Palette, Image, X, RotateCw, Layers, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";

interface LookboardItem {
  id: string;
  type: 'image' | 'text';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color?: string;
  isMovable: boolean;
  isSelected: boolean;
  zIndex: number;
  rotation: number;
}

const CreateLookboard = () => {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<LookboardItem[]>([]);
  const [cursorMode, setCursorMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FADADD");
  const [canvasBackground, setCanvasBackground] = useState("#f9fafb");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [showClosetModal, setShowClosetModal] = useState(false);
  const [selectedClosetCategory, setSelectedClosetCategory] = useState<string | null>(null);
  const [closetItems, setClosetItems] = useState<any[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [itemHistory, setItemHistory] = useState<LookboardItem[][]>([]);
  const [resizeMode, setResizeMode] = useState<string | null>(null);
  const [rotateMode, setRotateMode] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [rotateStart, setRotateStart] = useState({ x: 0, y: 0, angle: 0 });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    setLocation("/lookboards");
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title for your lookboard");
      return;
    }
    
    // TODO: Implement actual save to backend
    console.log("Saving lookboard:", { title, items });
    alert("Lookboard saved successfully!");
    setLocation("/lookboards");
  };

  const handleCursorToggle = () => {
    setCursorMode(!cursorMode);
    setShowColorPicker(false);
    setShowAddMenu(false);
  };

  const handleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
    setCursorMode(false);
    setShowAddMenu(false);
  };

  const handleColorSelect = (color: string) => {
    setCanvasBackground(color);
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  const handleHueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hue = event.target.value;
    const color = `hsl(${hue}, 70%, 80%)`; // Light, vibrant colors
    setCanvasBackground(color);
    setSelectedColor(color);
  };

  const handleAddItem = () => {
    setShowAddMenu(!showAddMenu);
    setCursorMode(false);
    setShowColorPicker(false);
  };

  const handleAddFromWishlist = () => {
    setShowWishlistModal(true);
    setShowAddMenu(false);
  };

  const handleWishlistSelect = (wishlistName: string) => {
    setSelectedWishlist(wishlistName);
    // TODO: Fetch items for the selected wishlist
    // For now, using mock data
    if (wishlistName === "All Items") {
      setWishlistItems([
        { id: 1, name: "Summer Dress", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300" },
        { id: 2, name: "Denim Jacket", image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300" },
        { id: 3, name: "White Sneakers", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300" }
      ]);
    } else {
      setWishlistItems([
        { id: 4, name: "Floral Top", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300" },
        { id: 5, name: "High Waist Pants", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300" }
      ]);
    }
  };

  const handleItemSelect = (item: any) => {
    const newItem: LookboardItem = {
      id: Date.now().toString(),
      type: 'image',
      content: item.image,
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
      size: { width: 150, height: 150 },
      isMovable: true,
      isSelected: false,
      zIndex: items.length + 10,
      rotation: 0
    };
    
    // Save current state to history
    setItemHistory(prev => [...prev, [...items]]);
    
    setItems(prev => [...prev, newItem]);
    setCursorMode(true); // Auto-activate cursor mode
    setShowWishlistModal(false);
    setShowClosetModal(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If clicking on canvas (not on an item), lock all items
    if (e.target === canvasRef.current) {
      setItems(prev => prev.map(item => ({
        ...item,
        isMovable: false,
        isSelected: false
      })));
    }
  };

  const handleItemClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setItems(prev => prev.map(item => ({
      ...item,
      isSelected: item.id === itemId,
      isMovable: item.id === itemId ? cursorMode : false
    })));
  };

  const handleMouseDown = (itemId: string, e: React.MouseEvent) => {
    if (!cursorMode) return;
    
    e.stopPropagation();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setDraggedItem(itemId);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
    setResizeMode(null);
    setRotateMode(null);
  };

  const handleResizeStart = (itemId: string, corner: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setResizeMode(corner);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: item.size.width,
      height: item.size.height
    });
  };

  const handleRotateStart = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find(i => i.id === itemId);
    if (!item || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const itemCenterX = item.position.x + item.size.width / 2;
    const itemCenterY = item.position.y + item.size.height / 2;
    
    const startAngle = Math.atan2(
      e.clientY - canvasRect.top - itemCenterY,
      e.clientX - canvasRect.left - itemCenterX
    ) * 180 / Math.PI;

    setRotateMode(itemId);
    setRotateStart({
      x: e.clientX,
      y: e.clientY,
      angle: startAngle - item.rotation
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedItem && !canvasRef.current) return;

    if (draggedItem) {
      const canvasRect = canvasRef.current!.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      setItems(prev => prev.map(item => 
        item.id === draggedItem 
          ? { ...item, position: { x: newX, y: newY } }
          : item
      ));
    }

    if (resizeMode && canvasRef.current) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      // Calculate proportional scaling based on the corner being dragged
      let scaleX = 1, scaleY = 1;
      
      if (resizeMode.includes('right')) {
        scaleX = (resizeStart.width + deltaX) / resizeStart.width;
      } else if (resizeMode.includes('left')) {
        scaleX = (resizeStart.width - deltaX) / resizeStart.width;
      }
      
      if (resizeMode.includes('bottom')) {
        scaleY = (resizeStart.height + deltaY) / resizeStart.height;
      } else if (resizeMode.includes('top')) {
        scaleY = (resizeStart.height - deltaY) / resizeStart.height;
      }
      
      // Use the smaller scale to maintain aspect ratio
      const scale = Math.min(scaleX, scaleY);
      
      setItems(prev => prev.map(item => {
        if (item.id === resizeMode.split('-')[0]) {
          const newWidth = resizeStart.width * scale;
          const newHeight = resizeStart.height * scale;
          
          // Adjust position for left/top resizing
          let newX = item.position.x;
          let newY = item.position.y;
          
          if (resizeMode.includes('left')) {
            newX = item.position.x + (resizeStart.width - newWidth);
          }
          if (resizeMode.includes('top')) {
            newY = item.position.y + (resizeStart.height - newHeight);
          }
          
          return {
            ...item,
            position: { x: newX, y: newY },
            size: { width: newWidth, height: newHeight }
          };
        }
        return item;
      }));
    }

    if (rotateMode && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const item = items.find(i => i.id === rotateMode);
      if (!item) return;

      const itemCenterX = item.position.x + item.size.width / 2;
      const itemCenterY = item.position.y + item.size.height / 2;
      
      const currentAngle = Math.atan2(
        e.clientY - canvasRect.top - itemCenterY,
        e.clientX - canvasRect.left - itemCenterX
      ) * 180 / Math.PI;
      
      const newRotation = currentAngle - rotateStart.angle;
      
      setItems(prev => prev.map(item => 
        item.id === rotateMode 
          ? { ...item, rotation: newRotation }
          : item
      ));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    // Save current state to history
    setItemHistory(prev => [...prev, [...items]]);
    
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUndo = () => {
    if (itemHistory.length > 0) {
      const previousState = itemHistory[itemHistory.length - 1];
      setItems(previousState);
      setItemHistory(prev => prev.slice(0, -1));
    }
  };

  const handleCursorMode = () => {
    setCursorMode(!cursorMode);
    setShowColorPicker(false);
    setShowAddMenu(false);
  };

  const handleSaveLookboard = () => {
    // TODO: Implement actual save functionality
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const closeWishlistModal = () => {
    setShowWishlistModal(false);
    setSelectedWishlist(null);
    setWishlistItems([]);
  };

  const handleAddFromCloset = () => {
    setShowClosetModal(true);
    setShowAddMenu(false);
  };

  const handleClosetSelect = (categoryName: string) => {
    setSelectedClosetCategory(categoryName);
    // TODO: Fetch items for the selected closet category
    // For now, using mock data
    if (categoryName === "All Items") {
      setClosetItems([
        { id: 1, name: "Summer Dress", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300" },
        { id: 2, name: "Denim Jacket", image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300" },
        { id: 3, name: "White Sneakers", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300" }
      ]);
    } else {
      setClosetItems([
        { id: 4, name: "Floral Top", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300" },
        { id: 5, name: "High Waist Pants", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300" }
      ]);
    }
  };

  const closeClosetModal = () => {
    setShowClosetModal(false);
    setSelectedClosetCategory(null);
    setClosetItems([]);
  };

  const handleAddText = () => {
    const text = prompt("Enter text for your lookboard:");
    if (text && text.trim()) {
      const newItem: LookboardItem = {
        id: Date.now().toString(),
        type: 'text',
        content: text,
        position: { x: 50, y: 50 },
        size: { width: 200, height: 100 },
        color: selectedColor,
        isMovable: true,
        isSelected: false,
        zIndex: 10,
        rotation: 0
      };
      setItems([...items, newItem]);
    }
    setShowAddMenu(false);
  };

  const addImageItem = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newItem: LookboardItem = {
            id: Date.now().toString(),
            type: 'image',
            content: e.target?.result as string,
            position: { x: 50, y: 50 },
            size: { width: 200, height: 200 },
            isMovable: true,
            isSelected: false,
            zIndex: 10,
            rotation: 0
          };
          setItems([...items, newItem]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    setShowAddMenu(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemDrag = (id: string, newPosition: { x: number; y: number }) => {
    if (!cursorMode) return;
    
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, position: newPosition }
        : item
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setLocation("/lookboards")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter lookboard title..."
          className="flex-1 mx-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FADADD] focus:border-transparent"
        />
        
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
          
          {showAddMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={handleSaveLookboard}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Lookboard</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-6 relative">
        {/* Undo Button */}
        {itemHistory.length > 0 && (
          <button
            onClick={handleUndo}
            className="absolute top-2 left-2 z-50 bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors shadow-sm"
            title="Undo"
          >
            <Undo className="w-4 h-4 text-gray-600" />
          </button>
        )}
        
        {/* Success Message Overlay */}
        {showSuccessMessage && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
                  <p className="text-gray-600">Lookboard successfully saved</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div 
          ref={canvasRef}
          className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[400px] relative overflow-hidden"
          style={{ cursor: cursorMode ? 'move' : 'default', backgroundColor: canvasBackground }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Add items to your lookboard</p>
                <p className="text-gray-400 text-xs mt-1">Tap the + button below to get started</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`absolute group ${item.isMovable ? 'border-2 border-blue-400' : ''} ${item.isSelected ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: item.position.x,
                  top: item.position.y,
                  width: item.size.width,
                  height: item.size.height,
                  zIndex: item.zIndex,
                  transform: `rotate(${item.rotation}deg)`
                }}
                onClick={(e) => handleItemClick(item.id, e)}
                onMouseDown={(e) => handleMouseDown(item.id, e)}
              >
                {item.type === 'image' ? (
                  <div className="relative w-full h-full">
                    <img
                      src={item.content}
                      alt="Lookboard item"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    {/* Layer Button (only when movable) */}
                    {item.isMovable && (
                      <button
                        className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Change Layer"
                      >
                        <Layers className="w-3 h-3" />
                      </button>
                    )}
                    
                    {/* Resize Corner Arrows (only when movable) */}
                    {item.isMovable && (
                      <>
                        {/* Top-left corner */}
                        <div
                          className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onMouseDown={(e) => handleResizeStart(item.id, `${item.id}-top-left`, e)}
                        >
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Top-right corner */}
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onMouseDown={(e) => handleResizeStart(item.id, `${item.id}-top-right`, e)}
                        >
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Bottom-left corner */}
                        <div
                          className="absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onMouseDown={(e) => handleResizeStart(item.id, `${item.id}-bottom-left`, e)}
                        >
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Bottom-right corner */}
                        <div
                          className="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onMouseDown={(e) => handleResizeStart(item.id, `${item.id}-bottom-right`, e)}
                        >
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Rotation Arrow (only when movable) */}
                    {item.isMovable && (
                      <div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onMouseDown={(e) => handleRotateStart(item.id, e)}
                      >
                        <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    className="relative w-full h-full rounded-lg flex items-center justify-center p-4"
                    style={{ backgroundColor: item.color }}
                  >
                    <p className="text-gray-800 font-medium">{item.content}</p>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    {/* Layer Button (only when movable) */}
                    {item.isMovable && (
                      <button
                        className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Change Layer"
                      >
                        <Layers className="w-3 h-3" />
                      </button>
                    )}
                    
                    {/* Resize Corner Arrows (only when movable) */}
                    {item.isMovable && (
                      <>
                        {/* Top-left corner */}
                        <div
                          className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onMouseDown={(e) => handleResizeStart(item.id, `${item.id}-top-left`, e)}
                        >
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Top-right corner */}
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onMouseDown={(e) => handleResizeStart(item.id, `${item.id}-top-right`, e)}
                        >
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Bottom-left corner */}
                        <div
                          className="absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onMouseDown={(e) => handleResizeStart(item.id, `${item.id}-bottom-left`, e)}
                        >
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Bottom-right corner */}
                        <div
                          className="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onMouseDown={(e) => handleResizeStart(item.id, `${item.id}-bottom-right`, e)}
                        >
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Rotation Arrow (only when movable) */}
                    {item.isMovable && (
                      <div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onMouseDown={(e) => handleRotateStart(item.id, e)}
                      >
                        <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex flex-col items-center space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Choose Canvas Color</h3>
            <div className="w-64 h-8 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500 rounded-lg relative">
              <input
                type="range"
                min="0"
                max="360"
                defaultValue="0"
                onChange={handleHueChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 rounded-lg pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500 rounded-lg"></div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: selectedColor }}
              ></div>
              <span className="text-xs text-gray-600">Selected: {selectedColor}</span>
            </div>
            <button
              onClick={() => setShowColorPicker(false)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Menu */}
      {showAddMenu && (
        <div className="px-4 py-4 bg-white border-t border-gray-200">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleAddFromWishlist}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg font-bold text-gray-700 mb-1">W</span>
              <span className="text-xs text-gray-600">Add from Wishlist</span>
            </button>
            <button
              onClick={handleAddFromCloset}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg font-bold text-gray-700 mb-1">C</span>
              <span className="text-xs text-gray-600">Add from Closet</span>
            </button>
            <button
              onClick={handleAddText}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg font-bold text-gray-700 mb-1">T</span>
              <span className="text-xs text-gray-600">Add Text</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-6">
        <div className="flex justify-center space-x-4">
          <button 
            onClick={handleCursorMode}
            className={`w-12 h-12 border border-[#FADADD] rounded-full flex items-center justify-center transition-colors ${
              cursorMode 
                ? 'bg-yellow-200 border-yellow-300' 
                : 'bg-[#FADADD] hover:bg-[#FADADD]/80'
            }`}
          >
            <MousePointer className={`w-5 h-5 ${cursorMode ? 'text-yellow-700' : 'text-gray-700'}`} />
          </button>
          <button 
            onClick={handleAddItem}
            className="w-12 h-12 bg-[#FADADD] border border-[#FADADD] rounded-full flex items-center justify-center hover:bg-[#FADADD]/80 transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
          <button 
            onClick={handleColorPicker}
            className={`w-12 h-12 border border-[#FADADD] rounded-full flex items-center justify-center transition-colors ${
              showColorPicker 
                ? 'bg-[#FADADD] text-gray-700' 
                : 'bg-white text-gray-700 hover:bg-[#FADADD]/20'
            }`}
          >
            <Palette className="w-5 h-5" />
          </button>
        </div>
        
        {/* Save Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#FADADD] text-gray-700 rounded-lg hover:bg-[#FADADD]/80 transition-colors font-medium"
          >
            Save Lookboard
          </button>
        </div>
      </div>

      {/* Wishlist Selection Modal */}
      {showWishlistModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeWishlistModal}
          ></div>
          
          {/* Modal Content */}
          <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-white rounded-t-3xl shadow-2xl">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedWishlist ? selectedWishlist : "Select Wishlist"}
                </h2>
                <button
                  onClick={closeWishlistModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!selectedWishlist ? (
                // Wishlist Selection View
                <div className="space-y-3">
                  <button
                    onClick={() => handleWishlistSelect("All Items")}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#FADADD] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">A</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">All Items</h3>
                        <p className="text-sm text-gray-500">All your saved items</p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Mock wishlists - replace with actual data */}
                  <button
                    onClick={() => handleWishlistSelect("Summer Collection")}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Summer Collection</h3>
                        <p className="text-sm text-gray-500">5 items</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleWishlistSelect("Date Night")}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">D</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Date Night</h3>
                        <p className="text-sm text-gray-500">3 items</p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                // Items View
                <div>
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedWishlist(null)}
                      className="flex items-center text-[#FADADD] hover:text-[#FADADD]/80 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Wishlists
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {wishlistItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
                        className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-105"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Closet Selection Modal */}
      {showClosetModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeClosetModal}
          ></div>
          
          {/* Modal Content */}
          <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-white rounded-t-3xl shadow-2xl">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedClosetCategory ? selectedClosetCategory : "Select Closet Category"}
                </h2>
                <button
                  onClick={closeClosetModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!selectedClosetCategory ? (
                // Closet Category Selection View
                <div className="space-y-3">
                  <button
                    onClick={() => handleClosetSelect("All Items")}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#FADADD] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">A</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">All Items</h3>
                        <p className="text-sm text-gray-500">All your saved items</p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Mock closet categories - replace with actual data */}
                  <button
                    onClick={() => handleClosetSelect("Summer Collection")}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Summer Collection</h3>
                        <p className="text-sm text-gray-500">5 items</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleClosetSelect("Date Night")}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">D</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Date Night</h3>
                        <p className="text-sm text-gray-500">3 items</p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                // Items View
                <div>
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedClosetCategory(null)}
                      className="flex items-center text-[#FADADD] hover:text-[#FADADD]/80 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Categories
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {closetItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
                        className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-105"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default CreateLookboard; 