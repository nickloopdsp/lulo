import { useState } from "react";
import { Camera, Link, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import ImageRecognition from "./image-recognition";

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddItemModal({ open, onOpenChange }: AddItemModalProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showImageRecognition, setShowImageRecognition] = useState(false);

  const handleCameraCapture = () => {
    onOpenChange(false);
    setShowImageRecognition(true);
  };

  const handleItemFound = (item: any) => {
    // Navigate to add-item page with pre-filled data
    navigate(`/add-item?prefill=${encodeURIComponent(JSON.stringify(item))}`);
    setShowImageRecognition(false);
  };

  const handleLinkAdd = () => {
    onOpenChange(false);
    navigate("/add-item");
  };

  const handleManualAdd = () => {
    onOpenChange(false);
    navigate("/add-item");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md mx-4 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center">Add to Lulo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Button
              className="w-full bg-lulo-pink hover:bg-lulo-coral text-white p-4 rounded-xl flex items-center justify-center space-x-3 h-auto"
              onClick={handleCameraCapture}
            >
              <Camera className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Take Photo</div>
                <div className="text-sm opacity-90">AI-powered item recognition</div>
              </div>
            </Button>
            
            <Button
              className="w-full bg-lulo-sage hover:bg-lulo-sage/90 text-white p-4 rounded-xl flex items-center justify-center space-x-3 h-auto"
              onClick={handleLinkAdd}
            >
              <Link className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Add Link</div>
                <div className="text-sm opacity-90">Paste a product URL</div>
              </div>
            </Button>
            
            <Button
              className="w-full bg-lulo-coral hover:bg-lulo-coral/90 text-white p-4 rounded-xl flex items-center justify-center space-x-3 h-auto"
              onClick={handleManualAdd}
            >
              <Plus className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Add Manually</div>
                <div className="text-sm opacity-90">Enter details yourself</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ImageRecognition
        open={showImageRecognition}
        onOpenChange={setShowImageRecognition}
        onItemFound={handleItemFound}
      />
    </>
  );
}
