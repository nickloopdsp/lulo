import { useLocation } from "wouter";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [, navigate] = useLocation();

  const uploadOptions = [
    {
      id: "manual",
      label: "Manual Upload",
      onClick: () => {
        // TODO: Implement manual upload
        console.log("Manual upload clicked");
      }
    },
    {
      id: "link",
      label: "Link Upload",
      onClick: () => {
        navigate("/link-upload");
      }
    },
    {
      id: "visual",
      label: "Visual Search",
      onClick: () => {
        navigate("/visual-search");
      },
      gradient: true
    }
  ];

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
          
          <div className="w-9" /> {/* Spacer for back button balance */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pt-16">
        {/* Camera Icon */}
        <div className="flex justify-center mb-12">
          <div className="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center">
            <Camera className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
          </div>
        </div>

        {/* Upload Options */}
        <div className="space-y-3 mb-16">
          {uploadOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.onClick}
              className={`w-full py-4 rounded-xl text-center font-medium transition-all ${
                option.gradient
                  ? "bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 text-white hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="py-5 rounded-xl font-medium hover:bg-gray-50 border-gray-200"
            onClick={() => {
              // TODO: Implement create wishlist
              console.log("Create wishlist clicked");
            }}
          >
            <div className="text-center">
              <div className="text-sm text-gray-700">Create</div>
              <div className="text-sm text-gray-700">Wishlist</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="py-5 rounded-xl font-medium hover:bg-gray-50 border-gray-200"
            onClick={() => {
              // TODO: Implement create lookboard
              console.log("Create lookboard clicked");
            }}
          >
            <div className="text-center">
              <div className="text-sm text-gray-700">Create</div>
              <div className="text-sm text-gray-700">Lookboard</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}