import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import caintaBuilding from "@/assets/cainta-building.jpg";
import sampalocBuilding from "@/assets/sampaloc-building.jpg";
import cubaoBuilding from "@/assets/cubao-building.jpg";

const PrimeLocationsSection = () => {
  const locations = [
    {
      name: "Cainta Rizal Branch",
      image: caintaBuilding,
      location: "Cainta, Rizal",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk"
    },
    {
      name: "Sampaloc Manila Branch",
      image: sampalocBuilding,
      location: "Sampaloc, Manila",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk"
    },
    {
      name: "Cubao QC Branch",
      image: cubaoBuilding,
      location: "Cubao, Quezon City",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk"
    }
  ];

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
          {locations.map((location, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/50 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Building Image */}
              <div className="relative">
                <img
                  src={location.image}
                  alt={`${location.name} building`}
                  className="w-full h-48 object-cover"
                />
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
                >
                  Explore Location
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrimeLocationsSection;

