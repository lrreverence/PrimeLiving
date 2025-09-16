import Header from "@/components/Header";
import LocationCard from "@/components/LocationCard";
import caintaImage from "@/assets/cainta-building.jpg";
import sampalocImage from "@/assets/sampaloc-building.jpg";
import cubaoImage from "@/assets/cubao-building.jpg";

const Locations = () => {
  const locations = [
    {
      name: "Cainta Rizal Branch",
      location: "Cainta, Rizal",
      image: caintaImage,
      status: "Available",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk",
    },
    {
      name: "Sampaloc Manila Branch",
      location: "Sampaloc, Manila",
      image: sampalocImage,
      status: "Available",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk",
    },
    {
      name: "Cubao QC Branch",
      location: "Cubao, Quezon City",
      image: cubaoImage,
      status: "Available",
      distanceToCBD: "15-25 mins",
      publicTransport: "5 mins walk",
      shoppingMall: "10 mins walk",
    },
  ];

  const handleExploreLocation = (locationName: string) => {
    console.log(`Exploring ${locationName}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Prime Locations
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Strategically located in Metro Manila's most sought-after areas with easy
            access to business districts, schools, and entertainment.
          </p>
        </div>
        
        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location, index) => (
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
      </main>
    </div>
  );
};

export default Locations;