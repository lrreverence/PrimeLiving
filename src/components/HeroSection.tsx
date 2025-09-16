import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import apartmentBuilding from "@/assets/apartment-building.jpg";

const HeroSection = () => {
  return (
    <section className="w-full px-6 py-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Premium Apartment Living
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Find Your Perfect Home Today
              </h1>
              <div className="space-y-2 text-muted-foreground text-lg">
                <p>Experience modern living in prime locations across Metro Manila.</p>
                <p>Our thoughtfully designed apartments offer comfort,</p>
                <p>convenience, and community.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 text-base">
                View Apartments
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button 
                variant="outline" 
                className="border-border hover:bg-accent hover:text-accent-foreground px-6 py-3 text-base"
              >
                <Phone className="w-4 h-4 mr-2" />
                Chat with Us
              </Button>
            </div>

            {/* Features */}
            <div className="flex gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent-foreground" />
                </div>
                <span className="text-foreground font-medium">Move-in Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent-foreground" />
                </div>
                <span className="text-foreground font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent-foreground" />
                </div>
                <span className="text-foreground font-medium">Prime Locations</span>
              </div>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={apartmentBuilding}
                alt="Modern apartment building exterior"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              
              {/* Navigation Arrows */}
              <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>

              {/* Image Caption */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-1">Modern Exterior</h3>
                  <p className="text-muted-foreground text-sm">
                    Contemporary architecture with premium finishes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;