'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle, Loader } from 'lucide-react';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GPSLocationProps {
  onLocationUpdate: (location: GPSCoordinates) => void;
  autoUpdate?: boolean;
  showMap?: boolean;
}

export default function GPSLocation({
  onLocationUpdate,
  autoUpdate = true,
  showMap = false
}: GPSLocationProps) {
  const [location, setLocation] = useState<GPSCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (autoUpdate) {
      getCurrentLocation();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [autoUpdate]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your device');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GPSCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        setLocation(coords);
        onLocationUpdate(coords);
        setLoading(false);
      },
      (err) => {
        setLoading(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please try again.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An error occurred while getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const startWatching = () => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coords: GPSCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        setLocation(coords);
        onLocationUpdate(coords);
      },
      (err) => {
        console.error('GPS watch error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    setWatchId(id);
  };

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const formatCoordinate = (value: number, isLatitude: boolean) => {
    const direction = isLatitude
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    const absoluteValue = Math.abs(value);
    return `${absoluteValue.toFixed(6)}° ${direction}`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 10) return 'text-green-600 bg-green-100';
    if (accuracy < 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getGoogleMapsUrl = () => {
    if (!location) return '#';
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin size={20} className="text-green-600" />
          <h3 className="font-semibold text-gray-900">GPS Location</h3>
        </div>
        {!loading && !error && (
          <button
            onClick={getCurrentLocation}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Refresh location"
          >
            <Navigation size={18} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader size={32} className="text-green-600 animate-spin mb-2" />
          <p className="text-sm text-gray-600">Getting your location...</p>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 mb-2">{error}</p>
            <button
              onClick={getCurrentLocation}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && location && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Latitude</p>
              <p className="font-mono text-sm font-semibold text-gray-900">
                {formatCoordinate(location.latitude, true)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Longitude</p>
              <p className="font-mono text-sm font-semibold text-gray-900">
                {formatCoordinate(location.longitude, false)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Accuracy</p>
              <p className="text-sm font-semibold text-gray-900">
                ±{Math.round(location.accuracy)}m
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(location.accuracy)}`}>
              {location.accuracy < 10 ? 'Excellent' : location.accuracy < 50 ? 'Good' : 'Fair'}
            </span>
          </div>

          {showMap && (
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 text-white text-center py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              View on Map
            </a>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="watch-location"
              checked={watchId !== null}
              onChange={(e) => {
                if (e.target.checked) {
                  startWatching();
                } else {
                  stopWatching();
                }
              }}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="watch-location" className="text-sm text-gray-700">
              Continuously track location
            </label>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Last updated: {new Date(location.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}

      {!loading && !error && !location && (
        <div className="text-center py-6">
          <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-4">No location data yet</p>
          <button
            onClick={getCurrentLocation}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Get Location
          </button>
        </div>
      )}
    </div>
  );
}
