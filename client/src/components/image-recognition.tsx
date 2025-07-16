import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Upload, X, Search, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImageRecognitionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemFound?: (item: any) => void;
}

interface RecognitionResult {
  confidence: number;
  category: string;
  suggestedName: string;
  suggestedBrand?: string;
  suggestedPrice?: number;
  similarItems?: any[];
  colors?: string[];
  tags?: string[];
  description?: string;
}

export default function ImageRecognition({ open, onOpenChange, onItemFound }: ImageRecognitionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState<'capture' | 'analyze' | 'results'>('capture');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const analyzeImageMutation = useMutation({
    mutationFn: async (imageData: string) => {
      return await apiRequest("POST", "/api/ai/analyze-image", { imageBase64: imageData });
    },
    onSuccess: (result: any) => {
      // Convert AI analysis result to recognition result format
      const recognitionResult = {
        confidence: result.confidence,
        category: result.category,
        suggestedName: result.name,
        suggestedBrand: result.brand,
        suggestedPrice: result.estimatedPrice,
        similarItems: result.similarItems || [],
        colors: result.colors,
        tags: result.tags,
        description: result.description,
      };
      setRecognitionResult(recognitionResult);
      setIsAnalyzing(false);
      setStep('results');
      toast({
        title: "Image analyzed successfully!",
        description: `Found ${result.name} with ${Math.round(result.confidence * 100)}% confidence`,
      });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to take photos.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setStep('analyze');
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        setStep('analyze');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const analyzeImage = useCallback(() => {
    if (capturedImage) {
      setIsAnalyzing(true);
      analyzeImageMutation.mutate(capturedImage);
    }
  }, [capturedImage, analyzeImageMutation]);

  const handleItemSelect = useCallback((item: any) => {
    onItemFound?.(item);
    onOpenChange(false);
    resetState();
  }, [onItemFound, onOpenChange]);

  const resetState = useCallback(() => {
    setCapturedImage(null);
    setRecognitionResult(null);
    setIsAnalyzing(false);
    setStep('capture');
    stopCamera();
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg mx-4 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-center">Find Items with AI</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {step === 'capture' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Take a photo or upload an image to find similar items
                </p>
              </div>

              {/* Camera Section */}
              <div className="space-y-3">
                {!isCameraActive ? (
                  <Button
                    onClick={startCamera}
                    className="w-full bg-lulo-pink hover:bg-lulo-coral text-white p-4 rounded-xl flex items-center justify-center space-x-3 h-auto"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo</span>
                  </Button>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                      <Button
                        onClick={capturePhoto}
                        className="bg-white hover:bg-gray-100 text-gray-900 rounded-full p-3"
                      >
                        <Camera className="w-6 h-6" />
                      </Button>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="bg-white hover:bg-gray-100 text-gray-900 rounded-full p-3"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Section */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full p-4 rounded-xl flex items-center justify-center space-x-3 h-auto border-2 border-dashed border-gray-300 hover:border-lulo-pink"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Image</span>
              </Button>
            </div>
          )}

          {step === 'analyze' && (
            <div className="space-y-4">
              {capturedImage && (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => setStep('capture')}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Ready to analyze this image?
                </p>
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="bg-lulo-sage hover:bg-lulo-sage/90 text-white px-6 py-3"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Similar Items
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'results' && recognitionResult && (
            <div className="space-y-4">
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Analyzed"
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}

              {/* Recognition Results */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Item Recognized</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {Math.round(recognitionResult.confidence * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-green-700 font-medium">{recognitionResult.suggestedName}</p>
                  <p className="text-green-600 text-sm">
                    {recognitionResult.suggestedBrand} • ${recognitionResult.suggestedPrice}
                  </p>
                </CardContent>
              </Card>

              {/* Similar Items */}
              {recognitionResult.similarItems && recognitionResult.similarItems.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Similar Items Found</h3>
                  <div className="space-y-2">
                    {recognitionResult.similarItems.map((item, index) => (
                      <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.brand} • ${item.price}</p>
                            </div>
                            <Button
                              onClick={() => handleItemSelect(item)}
                              size="sm"
                              className="bg-lulo-pink hover:bg-lulo-coral text-white"
                            >
                              Add This
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Item */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-600 mb-3">
                    Don't see what you're looking for?
                  </p>
                  <Button
                    onClick={() => handleItemSelect({
                      name: recognitionResult.suggestedName,
                      brand: recognitionResult.suggestedBrand,
                      price: recognitionResult.suggestedPrice,
                      category: recognitionResult.category,
                      imageUrl: "", // Don't store large base64 URLs - let the placeholder system handle it
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Create New Item
                  </Button>
                </CardContent>
              </Card>

              <Button
                onClick={resetState}
                variant="outline"
                className="w-full"
              >
                Try Another Image
              </Button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
} 