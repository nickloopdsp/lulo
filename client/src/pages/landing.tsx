import { Button } from "@/components/ui/button";
import { Heart, Users, Camera, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="mobile-app-container bg-lulo-cream">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-lulo-pink rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-lulo-dark">Lulo</h1>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-lulo-dark mb-4">
              Shop with friends, <br />
              discover your style
            </h2>
            <p className="text-lulo-gray text-lg leading-relaxed">
              Create wishlists, share your closet, and discover amazing pieces through the people you trust.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-xs">
            <div className="text-center">
              <div className="w-16 h-16 bg-lulo-pink rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-lulo-gray">Create Wishlists</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-lulo-sage rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-lulo-gray">Shop Together</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-lulo-coral rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-lulo-gray">Visual Discovery</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-lulo-pink to-lulo-coral rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-lulo-gray">Style Inspiration</p>
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
            <p className="text-xs text-lulo-gray mt-4">
              Free to use • Connect with friends • Discover new styles
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-xs text-lulo-gray">
            Join the community of fashion lovers who shop smarter together
          </p>
        </footer>
      </div>
    </div>
  );
}
