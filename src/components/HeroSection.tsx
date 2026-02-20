import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import hero1 from "@/assets/1.jpg";
import hero2 from "@/assets/2.jpeg";
import hero3 from "@/assets/2.jpg";
import hero4 from "@/assets/3.webp";

const HERO_IMAGES = [
  { src: hero1, alt: "Happy family in a modern home" },
  { src: hero2, alt: "Family enjoying their home" },
  { src: hero3, alt: "Family moving into a new home" },
  { src: hero4, alt: "Comfortable family living" },
];

const HeroSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    const interval = setInterval(() => api?.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [api]);

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

          {/* Right Image Carousel */}
          <div className="relative">
            <Carousel
              setApi={setApi}
              opts={{ loop: true, align: "start" }}
              className="w-full"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <CarouselContent className="-ml-0">
                  {HERO_IMAGES.map((img) => (
                    <CarouselItem key={img.src} className="pl-0">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-[400px] lg:h-[500px] object-cover"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Navigation Arrows */}
                <button
                  type="button"
                  onClick={() => api?.scrollPrev()}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => api?.scrollNext()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {HERO_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollTo(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        i === current
                          ? "w-6 bg-white"
                          : "w-2 bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;