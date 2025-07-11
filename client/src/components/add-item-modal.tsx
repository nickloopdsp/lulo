import { Camera, Link, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddItemModal({ open, onOpenChange }: AddItemModalProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleCameraCapture = () => {
    onOpenChange(false);
    toast({
      title: "Camera feature",
      description: "Camera integration would be implemented here",
    });
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
            <span className="font-medium">Take Photo</span>
          </Button>
          
          <Button
            className="w-full bg-lulo-sage hover:bg-lulo-sage/90 text-white p-4 rounded-xl flex items-center justify-center space-x-3 h-auto"
            onClick={handleLinkAdd}
          >
            <Link className="w-5 h-5" />
            <span className="font-medium">Add Link</span>
          </Button>
          
          <Button
            className="w-full bg-lulo-coral hover:bg-lulo-coral/90 text-white p-4 rounded-xl flex items-center justify-center space-x-3 h-auto"
            onClick={handleManualAdd}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Manually</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
