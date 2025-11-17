import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
// Use CDN URLs for icons to avoid import issues
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

export interface ApartmentLocation {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  status: string;
  distanceToCBD?: string;
  publicTransport?: string;
  shoppingMall?: string;
}

interface ApartmentMapProps {
  locations: ApartmentLocation[];
  selectedLocationId?: string;
  onLocationSelect?: (location: ApartmentLocation) => void;
  height?: string;
  showControls?: boolean;
}

const ApartmentMap = ({ 
  locations, 
  selectedLocationId, 
  onLocationSelect,
  height = '600px',
  showControls = true
}: ApartmentMapProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate center point (average of all locations)
  const centerLat = locations.reduce((sum, loc) => sum + loc.coordinates[0], 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.coordinates[1], 0) / locations.length;
  const center: [number, number] = [centerLat, centerLng];

  // Don't render map until component is mounted (client-side only)
  if (!isMounted || typeof window === 'undefined') {
    return (
      <Card className="w-full">
        {showControls && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Apartment Locations</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={showControls ? 'p-6' : ''}>
          <div style={{ height, width: '100%' }} className="flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-500">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validate locations array
  if (!locations || locations.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">No locations available</p>
        </CardContent>
      </Card>
    );
  }

  // If map failed to load, show fallback
  if (mapError) {
    return (
      <Card className="w-full">
        {showControls && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Apartment Locations</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-6">
          <div style={{ height }} className="space-y-4">
            <p className="text-gray-600">View locations on OpenStreetMap:</p>
            <div className="space-y-2">
              {locations.map((location) => (
                <a
                  key={location.id}
                  href={`https://www.openstreetmap.org/?mlat=${location.coordinates[0]}&mlon=${location.coordinates[1]}&zoom=15`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{location.name}</h4>
                      <p className="text-sm text-gray-600">{location.location}</p>
                    </div>
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                </a>
              ))}
            </div>
            {mapError && (
              <p className="text-xs text-red-600 mt-2">Error: {mapError}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create custom icon for apartment markers
  const createCustomIcon = (isSelected: boolean) => {
    try {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${isSelected ? '#2563eb' : '#10b981'};
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 20px;
            ">🏢</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
    } catch (error) {
      console.warn('Failed to create custom icon:', error);
      return undefined;
    }
  };

  return (
    <Card className="w-full">
      {showControls && (
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Apartment Locations</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showControls ? 'p-0' : 'p-0'}>
        <div 
          id={`map-container-${selectedLocationId || 'all'}`}
          style={{ height, width: '100%', position: 'relative', minHeight: height }}
        >
          <MapContainer
            center={selectedLocationId ? (locations.find(l => l.id === selectedLocationId)?.coordinates || center) : center}
            zoom={selectedLocationId ? 15 : 11}
            style={{ height: '100%', width: '100%', borderRadius: showControls ? '0 0 8px 8px' : '8px', zIndex: 0 }}
            scrollWheelZoom={true}
            ref={mapRef}
            key={`map-${selectedLocationId || 'all'}`}
            whenReady={() => {
              try {
                if (mapRef.current && selectedLocationId) {
                  const selectedLoc = locations.find(l => l.id === selectedLocationId);
                  if (selectedLoc) {
                    mapRef.current.setView(selectedLoc.coordinates, 15);
                  }
                }
              } catch (error) {
                console.error('Error setting map view:', error);
                setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
              }
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {locations.map((location) => {
              const isSelected = selectedLocationId === location.id;
              return (
                <Marker
                  key={location.id}
                  position={location.coordinates}
                  icon={createCustomIcon(isSelected)}
                  eventHandlers={{
                    click: () => {
                      if (onLocationSelect) {
                        onLocationSelect(location);
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{location.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{location.location}</p>
                      <Badge className={location.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {location.status}
                      </Badge>
                      {location.distanceToCBD && (
                        <p className="text-xs text-gray-500 mt-2">
                          Distance to CBD: {location.distanceToCBD}
                        </p>
                      )}
                      {location.publicTransport && (
                        <p className="text-xs text-gray-500">
                          Public Transport: {location.publicTransport}
                        </p>
                      )}
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${location.coordinates[0]}&mlon=${location.coordinates[1]}&zoom=17`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 underline mt-2 inline-block"
                      >
                        View on OpenStreetMap →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApartmentMap;
