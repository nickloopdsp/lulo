import { Button } from "@/components/ui/button";
import { Heart, Users, Camera, Star } from "lucide-react";
import { LuloWordmark, LuloIcon } from "@/components/lulo-icon";

export default function Landing() {
  return (
    <div className="mobile-app-container bg-gradient-to-br from-purple-200 via-purple-100 to-pink-100">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-center p-6">
          <LuloWordmark 
            iconSize={48} 
            textSize="text-3xl" 
            color="white"
            className="text-white"
          />
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Shop with friends, <br />
              discover your style
            </h2>
            <p className="text-purple-100 text-lg leading-relaxed">
              Create wishlists, share your closet, and discover amazing pieces through the people you trust.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-xs">
            <div className="text-center">
              <div className="w-16 h-16 bg-lulo-pink rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LuloIcon size={32} color="white" />
              </div>
              <p className="text-sm text-purple-200">Create Wishlists</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-lulo-sage rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-purple-200">Shop Together</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-lulo-coral rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-purple-200">Visual Discovery</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-purple-200">Style Inspiration</p>
            </div>
          </div>

          {/* CTA */}
          <div className="w-full max-w-sm">
            <Button
              className="w-full bg-lulo-pink hover:bg-lulo-coral text-white font-semibold py-4 rounded-xl text-lg touch-feedback"
              onClick={() => {
                window.location.href = "/api/login";
              }}
            >
              Get Started
            </Button>
            <p className="text-xs text-purple-200 mt-4">
              Free to use • Connect with friends • Discover new styles
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-xs text-purple-200">
            Join the community of fashion lovers who shop smarter together
          </p>
        </footer>
      </div>
    </div>
  );
}
