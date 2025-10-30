import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox, Libraries } from '@react-google-maps/api';
import { Search, X, LocateFixed } from 'lucide-react';
import { getEventOfTheDay } from '../data/eventsOfDay.ts';
import { getMapsApiKey, MAPS_KEY_STORAGE } from '../utils/config';
import { useFriends } from '../hooks/useFriends';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

// Enable full native gestures and controls
const mapOptions: google.maps.MapOptions = {
  gestureHandling: 'greedy', // allow scroll/pinch zoom aggressively
  draggable: true,
  scrollwheel: true,
  keyboardShortcuts: true,
  clickableIcons: true,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  rotateControl: true,
  scaleControl: true,
  disableDoubleClickZoom: false,
  // keep default UI visible
  disableDefaultUI: false,
};

const libraries: Libraries = ['places'];

const apiKey: string | undefined = getMapsApiKey();

export const LocationsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [locating, setLocating] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{ name?: string; address?: string } | null>(null);
  const { friends } = useFriends();

  // Derive a friendship status summary to color the banner similarly to friend cards
  const friendshipStatus = useMemo(() => {
    if (!friends || friends.length === 0) return null;
    const MS_DAY = 24 * 60 * 60 * 1000;
    let minDays = Number.POSITIVE_INFINITY; // most recent contact (fewest days)
    let maxDays = -1; // most overdue friend (most days)
    let mostRecent: any = null;
    let mostOverdue: any = null;
    const now = Date.now();

    for (const f of friends) {
      const d = new Date(f.last_contacted).getTime();
      const days = Math.floor(Math.abs(now - d) / MS_DAY);
      if (days < minDays) {
        minDays = days;
        mostRecent = f;
      }
      if (days > maxDays) {
        maxDays = days;
        mostOverdue = f;
      }
    }

    const isToday = minDays === 0;
    const color: 'green' | 'yellow' | 'red' = isToday ? 'green' : (minDays <= 14 ? 'yellow' : 'red');
    const styles = color === 'green'
      ? { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-700' }
      : color === 'yellow'
      ? { border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-700' }
      : { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700' };

    return { color, isToday, minDays, maxDays, mostRecent, mostOverdue, ...styles };
  }, [friends]);

  // Rotate the suggested event on each page reopen within the same tab/session.
  // Uses a session-scoped counter with a 1s guard to avoid React StrictMode double-mount increments.
  const eventOfTheDay = useMemo(() => {
    try {
      const COUNT_KEY = 'net-umbrella:maps:eodCount';
      const TS_KEY = 'net-umbrella:maps:eodTs';

      const now = Date.now();
      const lastTs = Number(sessionStorage.getItem(TS_KEY) || '0');
      let count = Number(sessionStorage.getItem(COUNT_KEY) || '0');
      if (!Number.isFinite(count)) count = 0;

      // Only bump the counter if it's been >1s since the last increment.
      // This avoids counting the dev-time React StrictMode remount as two separate "opens".
      if (now - lastTs > 1000) {
        count += 1;
        sessionStorage.setItem(COUNT_KEY, String(count));
        sessionStorage.setItem(TS_KEY, String(now));
      }

      // Shift today's date by the counter so we get a different entry each time.
      const adjusted = new Date(now + count * 24 * 60 * 60 * 1000);
      return getEventOfTheDay(adjusted);
    } catch {
      return getEventOfTheDay(new Date());
    }
  }, []);

  useEffect(() => {
    // Try saved place first
    try {
      const saved = localStorage.getItem('net-umbrella:lastPlace');
      if (saved) {
        const parsed = JSON.parse(saved) as { lat: number; lng: number; name?: string; address?: string };
        if (
          parsed &&
          typeof parsed.lat === 'number' &&
          typeof parsed.lng === 'number'
        ) {
          setCurrentPosition({ lat: parsed.lat, lng: parsed.lng });
          setSelectedPlace({ name: parsed.name, address: parsed.address });
          setSearchValue(parsed.name || '');
          return;
        }
      }
    } catch {}

    // Fallback to geolocation
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

  if (!apiKey) {
    // Allow runtime paste of key for environments without env vars (e.g., Bolt link)
    const [tempKey, setTempKey] = useState('');
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="mb-3 p-4 rounded-lg border border-red-200 bg-red-50">
          <p className="text-sm text-red-700 font-medium">Google Maps API key missing</p>
          <p className="text-sm text-red-700">Paste a browser API key below or add VITE_GOOGLE_MAPS_API_KEY in your environment. You can also use the URL parameter <code>?mapsKey=YOUR_KEY</code>.</p>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder="Paste your Google Maps browser key"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28428c]"
          />
          <button
            onClick={() => {
              try {
                if (tempKey.trim()) {
                  localStorage.setItem(MAPS_KEY_STORAGE, tempKey.trim());
                  window.location.reload();
                }
              } catch {}
            }}
            className="px-3 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1f326b]"
          >
            Save & Reload
          </button>
        </div>
        <button onClick={onBack} className="px-3 py-2 text-sm bg-gray-100 text-[#28428c] rounded-lg hover:bg-gray-200 transition-colors duration-200">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <p className="text-red-700 font-medium mb-2">Error loading Google Maps</p>
        <pre className="text-xs bg-red-50 p-3 rounded border border-red-200 overflow-auto">{String(loadError)}</pre>
        <div className="mt-3 text-sm text-[#28428c]">
          Ensure your API key has the Maps JavaScript API and Places API enabled and allowed for http://localhost:5173.
        </div>
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

      {/* Suggested Event of the Day */}
      <div className={`mb-4 p-4 rounded-lg border ${friendshipStatus?.border ?? 'border-[#ffacd6]/30'} ${friendshipStatus?.bg ?? 'bg-[#fff8fb]'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm text-[#892f1a] font-semibold mb-1">Suggested event of the day</p>
            <p className="text-[#28428c]">{eventOfTheDay}</p>
            {friendshipStatus && (
              <p className={`mt-1 text-xs ${friendshipStatus.text}`}>
                Friendship status: {friendshipStatus.isToday ? 'You connected with someone today' : `Most recent contact was ${friendshipStatus.minDays} day${friendshipStatus.minDays === 1 ? '' : 's'} ago`}.
                {friendshipStatus.mostOverdue ? ` Consider inviting ${friendshipStatus.mostOverdue.name} to this!` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Places Search */}
      <div className="mb-3">
        {isLoaded && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <StandaloneSearchBox
                onLoad={(ref) => setSearchBox(ref)}
                onPlacesChanged={() => {
                  const places = searchBox?.getPlaces();
                  const first = places && places[0];
                  const loc = first?.geometry?.location;
                  if (loc) {
                    const next = { lat: loc.lat(), lng: loc.lng() };
                    setCurrentPosition(next);
                    const name = first?.name;
                    const address = first?.formatted_address || first?.vicinity;
                    setSelectedPlace({ name: name || undefined, address: address || undefined });
                    setSearchValue(name || '');
                    try {
                      localStorage.setItem(
                        'net-umbrella:lastPlace',
                        JSON.stringify({ ...next, name, address })
                      );
                    } catch {}
                  }
                }}
              >
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28428c]"
                  placeholder="Search for a place (e.g., cafe, park, address)"
                  type="text"
                />
              </StandaloneSearchBox>
              {searchValue && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearchValue('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setLocating(true);
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setCurrentPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                      });
                      setLocating(false);
                      setSelectedPlace({ name: 'My location', address: undefined });
                      setSearchValue('');
                    },
                    () => {
                      setCurrentPosition({ lat: 40.1105, lng: -88.2073 });
                      setLocating(false);
                    }
                  );
                } else {
                  setCurrentPosition({ lat: 40.1105, lng: -88.2073 });
                  setLocating(false);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-2 bg-[#28428c] text-white rounded-lg hover:bg-[#1f326b] transition-colors duration-200"
            >
              <LocateFixed className="h-4 w-4" />
              <span>{locating ? 'Locating...' : 'Use my location'}</span>
            </button>
          </div>
        )}
      </div>
      {/* Selected place details */}
      {selectedPlace && (selectedPlace.name || selectedPlace.address) && (
        <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
          {selectedPlace.name && (
            <p className="text-sm font-medium text-[#28428c]">{selectedPlace.name}</p>
          )}
          {selectedPlace.address && (
            <p className="text-xs text-gray-600">{selectedPlace.address}</p>
          )}
        </div>
      )}
      {isLoaded && currentPosition ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition}
          zoom={14}
          options={mapOptions}
        >
          <Marker
            key={`${currentPosition.lat},${currentPosition.lng}`}
            position={currentPosition}
            // Use DROP animation if available; fallback to undefined to avoid type issues
            animation={(window as any)?.google?.maps?.Animation?.DROP}
          />
        </GoogleMap>
      ) : (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#28428c]"></div>
        </div>
      )}
    </div>
  );
};
