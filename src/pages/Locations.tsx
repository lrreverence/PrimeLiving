import { useState } from "react";
import Header from "@/components/Header";
import LocationCard from "@/components/LocationCard";
import Contact from "@/components/Contact";
import ApartmentMap, { ApartmentLocation } from "@/components/ApartmentMap";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";
import caintaImage from "@/assets/ca1.jpg";
import sampalocImage from "@/assets/sampaloc-building.jpg";
import cubaoImage from "@/assets/cubao-building.jpg";

const Locations = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Apartment locations with coordinates (approximate coordinates for Metro Manila)
  const locations: ApartmentLocation[] = [
    {
      id: 'cainta',
      name: "Cainta Rizal Branch",
      location: "Cainta, Rizal",
      coordinates: [14.5794, 121.1220], // Approximate coordinates for Cainta, Rizal
      status: "Available",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk",
    },
    {
      id: 'sampaloc',
      name: "Sampaloc Manila Branch",
      location: "Sampaloc, Manila",
      coordinates: [14.6042, 120.9822], // Approximate coordinates for Sampaloc, Manila
      status: "Available",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk",
    },
    {
      id: 'cubao',
      name: "Cubao QC Branch",
      location: "Cubao, Quezon City",
      coordinates: [14.6186, 121.0567], // Approximate coordinates for Cubao, Quezon City
      status: "Available",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk",
    },
  ];

  // Map location data to card data
  const locationCards = locations.map(loc => ({
    name: loc.name,
    location: loc.location,
    image: loc.id === 'cainta' ? caintaImage : loc.id === 'sampaloc' ? sampalocImage : cubaoImage,
    status: loc.status,
    distanceToCBD: loc.distanceToCBD || "15-25 mins",
    publicTransport: loc.publicTransport || "5 mins walk",
    shoppingMall: loc.shoppingMall || "10 mins walk",
    coordinates: loc.coordinates,
  }));

  const handleExploreLocation = (locationName: string) => {
    console.log(`Exploring ${locationName}`);
    // Find and select the location on map
    const location = locations.find(loc => loc.name === locationName);
    if (location) {
      setSelectedLocation(location.id);
      setViewMode('map');
    }
  };

  const handleLocationSelect = (location: ApartmentLocation) => {
    setSelectedLocation(location.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Prime Locations
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            Strategically located in Metro Manila's most sought-after areas with easy
            access to business districts, schools, and entertainment.
          </p>
          
          {/* View Toggle */}
          <div className="flex justify-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="flex items-center space-x-2"
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              className="flex items-center space-x-2"
            >
              <Map className="w-4 h-4" />
              <span>Map View</span>
            </Button>
          </div>
        </div>
        
        {/* Content based on view mode */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locationCards.map((location, index) => (
              <LocationCard
                key={index}
                name={location.name}
                location={location.location}
                image={location.image}
                status={location.status}
                distanceToCBD={location.distanceToCBD}
                publicTransport={location.publicTransport}
                shoppingMall={location.shoppingMall}
                coordinates={location.coordinates}
                onExplore={() => handleExploreLocation(location.name)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <ApartmentMap
              locations={locations}
              selectedLocationId={selectedLocation || undefined}
              onLocationSelect={handleLocationSelect}
              height="600px"
            />
            
            {/* Location details below map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {locationCards.map((location, index) => (
                <LocationCard
                  key={index}
                  name={location.name}
                  location={location.location}
                  image={location.image}
                  status={location.status}
                  distanceToCBD={location.distanceToCBD}
                  publicTransport={location.publicTransport}
                  shoppingMall={location.shoppingMall}
                  onExplore={() => handleExploreLocation(location.name)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Contact Section */}
      <Contact />
    </div>
  );
};

export default Locations;