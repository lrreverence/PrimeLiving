import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink } from "lucide-react";

interface LocationCardProps {
  name: string;
  location: string;
  image: string;
  status: string;
  distanceToCBD: string;
  publicTransport: string;
  shoppingMall: string;
  onExplore: () => void;
  coordinates?: [number, number]; // [latitude, longitude]
}

const LocationCard = ({
  name,
  location,
  image,
  status,
  distanceToCBD,
  publicTransport,
  shoppingMall,
  onExplore,
  coordinates,
}: LocationCardProps) => {
  const openInMaps = () => {
    if (coordinates) {
      // Open in OpenStreetMap
      const [lat, lng] = coordinates;
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`, '_blank');
    }
  };
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
        />
        <Badge 
          className="absolute top-4 right-4 bg-accent text-accent-foreground"
        >
          {status}
        </Badge>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">{name}</h3>
        
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Distance to CBD:</span>
            <span className="text-sm text-foreground font-medium">{distanceToCBD}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Public Transport:</span>
            <span className="text-sm text-foreground font-medium">{publicTransport}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Shopping Mall:</span>
            <span className="text-sm text-foreground font-medium">{shoppingMall}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onExplore}
          >
            View on Map
          </Button>
          {coordinates && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={openInMaps}
              title="Open in OpenStreetMap"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationCard;