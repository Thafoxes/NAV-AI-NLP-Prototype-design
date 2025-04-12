import React from 'react';
import Map, { Marker } from 'react-map-gl';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

const MapView: React.FC<MapViewProps> = ({ location }) => {
  if (!location) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden">
        <Map
          initialViewState={{
            longitude: location.longitude,
            latitude: location.latitude,
            zoom: 14
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
        >
          <Marker
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="bottom"
          >
            <MapPin className="w-6 h-6 text-red-500" />
          </Marker>
        </Map>
      </div>
    </div>
  );
};

export default MapView;