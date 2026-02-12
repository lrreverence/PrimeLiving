import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import ApartmentMap, { ApartmentLocation } from "@/components/ApartmentMap";
import MapErrorBoundary from "@/components/MapErrorBoundary";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ca1 from "@/assets/ca1.jpg";
import ca2 from "@/assets/ca2.jpg";
import ca3 from "@/assets/ca3.jpg";
import sampalocSlide1 from "@/assets/sam1.png";
import sampalocSlide2 from "@/assets/sam2.png";
import sampalocSlide3 from "@/assets/sam3.png";
import cub1 from "@/assets/cub1.jpg";
import cub2 from "@/assets/cub2.jpg";
import cub3 from "@/assets/cub3.jpg";
import cub4 from "@/assets/cub4.jpg";
import cub5 from "@/assets/cub5.jpg";
import cub6 from "@/assets/cub6.jpg";
import cub7 from "@/assets/cub7.jpg";

const caintaSlides = [ca1, ca2, ca3];
const sampalocSlides = [sampalocSlide1, sampalocSlide2, sampalocSlide3];
const cubaoSlides = [cub1, cub2, cub3, cub4, cub5, cub6, cub7];

const PrimeLocationsSection = () => {
  const [selectedLocation, setSelectedLocation] = useState<ApartmentLocation | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Apartment locations with coordinates
  const locations: ApartmentLocation[] = [
    {
      id: 'cainta',
      name: "Cainta Rizal Branch",
      location: "Cainta, Rizal",
      coordinates: [14.5794, 121.1220],
      status: "Available",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk"
    },
    {
      id: 'sampaloc',
      name: "Sampaloc Manila Branch",
      location: "Sampaloc, Manila",
      coordinates: [14.6042, 120.9822],
      status: "Available",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk"
    },
    {
      id: 'cubao',
      name: "Cubao QC Branch",
      location: "Cubao, Quezon City",
      coordinates: [14.6186, 121.0567],
      status: "Available",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk"
    }
  ];

  const handleExploreLocation = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
      setMapModalOpen(true);
      setMapReady(false);
      // Delay to ensure modal is fully rendered and visible before map initializes
      setTimeout(() => {
        setMapReady(true);
      }, 300);
    }
  };

  const handleCloseModal = () => {
    setMapModalOpen(false);
    setMapReady(false);
    setSelectedLocation(null);
  };

  const locationCards = locations.map(loc => ({
    id: loc.id,
    name: loc.name,
    image: loc.id === 'cainta' ? ca1 : loc.id === 'sampaloc' ? sampalocSlide1 : cub1,
    location: loc.location,
    distanceToCBD: loc.distanceToCBD || "15-25 mins",
    publicTransport: loc.publicTransport || "5 mins walk",
    shoppingMall: loc.shoppingMall || "10 mins walk"
  }));

  return (
    <section className="w-full px-6 py-16 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Prime Locations
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Strategically located in Metro Manila's most sought-after areas with easy access to business districts, schools, and entertainment.
          </p>
        </div>

        {/* Location Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {locationCards.map((location, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/50 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Building Image — all branches use slide carousels */}
              <div className="relative h-48 overflow-hidden">
                {location.id === "cainta" ? (
                  <Carousel
                    opts={{ loop: true, align: "start" }}
                    className="w-full h-full"
                  >
                    <CarouselContent className="h-48 -ml-0">
                      {caintaSlides.map((slide, i) => (
                        <CarouselItem key={i} className="pl-0">
                          <img
                            src={slide}
                            alt={`${location.name} — ${i + 1} of ${caintaSlides.length}`}
                            className="w-full h-48 object-cover"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 h-8 w-8 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
                    <CarouselNext className="right-2 h-8 w-8 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
                  </Carousel>
                ) : location.id === "sampaloc" ? (
                  <Carousel
                    opts={{ loop: true, align: "start" }}
                    className="w-full h-full"
                  >
                    <CarouselContent className="h-48 -ml-0">
                      {sampalocSlides.map((slide, i) => (
                        <CarouselItem key={i} className="pl-0">
                          <img
                            src={slide}
                            alt={`${location.name} — ${i + 1} of ${sampalocSlides.length}`}
                            className="w-full h-48 object-cover"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 h-8 w-8 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
                    <CarouselNext className="right-2 h-8 w-8 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
                  </Carousel>
                ) : location.id === "cubao" ? (
                  <Carousel
                    opts={{ loop: true, align: "start" }}
                    className="w-full h-full"
                  >
                    <CarouselContent className="h-48 -ml-0">
                      {cubaoSlides.map((slide, i) => (
                        <CarouselItem key={i} className="pl-0">
                          <img
                            src={slide}
                            alt={`${location.name} — ${i + 1} of ${cubaoSlides.length}`}
                            className="w-full h-48 object-cover"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 h-8 w-8 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
                    <CarouselNext className="right-2 h-8 w-8 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
                  </Carousel>
                ) : null}
              </div>

              {/* Card Content */}
              <div className="p-6">
                {/* Branch Name and Availability */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground">
                    {location.name}
                  </h3>
                  <div className="bg-muted rounded-full px-3 py-1">
                    <span className="text-sm font-medium text-foreground">
                      Available
                    </span>
                  </div>
                </div>

                {/* Location Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">
                      {location.location}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        Distance to CBD:
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {location.distanceToCBD}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        Public Transport:
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {location.publicTransport}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">
                        Shopping Mall:
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {location.shoppingMall}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explore Location Button */}
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleExploreLocation(location.id)}
                >
                  Explore Location
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Map Modal */}
        <Dialog open={mapModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
              <DialogTitle className="text-2xl font-bold">
                {selectedLocation?.name || 'Apartment Location'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto p-6" style={{ minHeight: '600px' }}>
              {mapModalOpen && mapReady && (
                <MapErrorBoundary>
                  <ApartmentMap
                    locations={locations}
                    selectedLocationId={selectedLocation?.id}
                    onLocationSelect={(loc) => setSelectedLocation(loc)}
                    height="600px"
                    showControls={false}
                  />
                </MapErrorBoundary>
              )}
              {mapModalOpen && !mapReady && (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Preparing map...</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default PrimeLocationsSection;

