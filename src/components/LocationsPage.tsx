import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

const libraries: ('places' | 'drawing' | 'geometry' | 'localContext' | 'visualization')[] = ['places'];

export const LocationsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyASy-3DPv_iQV_DVAqf_mzzps1c3JltsD4',
    libraries,
  });

  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Handle error or default location
          setCurrentPosition({ lat: 40.1105, lng: -88.2073 }); // Default to Champaign, IL
        }
      );
    } else {
      // Geolocation not supported
      setCurrentPosition({ lat: 40.1105, lng: -88.2073 }); // Default to Champaign, IL
    }
  }, []);

  if (loadError) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <p>Error loading maps</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#28428c]">Find Nearby Locations</h2>
        <button onClick={onBack} className="px-3 py-2 text-sm bg-gray-100 text-[#28428c] rounded-lg hover:bg-gray-200 transition-colors duration-200">
          Back to Dashboard
        </button>
      </div>
      {isLoaded && currentPosition ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition}
          zoom={14}
        >
          <Marker position={currentPosition} />
        </GoogleMap>
      ) : (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#28428c]"></div>
        </div>
      )}
    </div>
  );
};
