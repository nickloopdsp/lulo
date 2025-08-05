import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VisualSearchPage() {
  const [, navigate] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        // Navigate to results after image selection
        navigate(`/visual-search/results?image=${encodeURIComponent(result)}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-lg font-medium">Visual Search</h1>
          
          <div className="w-9" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {!selectedImage ? (
          <>
            {/* Visual Search Button */}
            <div className="mb-8">
              <button
                onClick={triggerFileSelect}
                className="w-full py-4 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 text-white rounded-xl font-medium hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 transition-all"
              >
                Visual Search
              </button>
            </div>

            {/* Upload Area */}
            <div 
              onClick={triggerFileSelect}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-600 mb-2">Select an image from your camera roll</p>
              <p className="text-sm text-gray-400">or take a screenshot to search</p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Take Photo Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  // Use capture attribute for camera
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.setAttribute('capture', 'environment');
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const result = reader.result as string;
                        setSelectedImage(result);
                        navigate(`/visual-search/results?image=${encodeURIComponent(result)}`);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Take a photo or screenshot</h3>
                  <p className="text-sm text-gray-500">Capture any fashion item you love</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Upload className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Upload from gallery</h3>
                  <p className="text-sm text-gray-500">Select saved images to find similar items</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700 font-medium">Analyzing image...</p>
              <p className="text-sm text-gray-500 mt-2">Using AI to identify fashion items</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}