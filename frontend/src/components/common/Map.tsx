import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../../types';

// Import marker icon images from Leaflet's dist directory
// In a real project, you'd need to set up custom marker icons
// This is a workaround for the missing marker icon issue in Leaflet with React
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set the default icon for all markers
L.Marker.prototype.options.icon = defaultIcon;

interface MapProps {
  locations?: Location[];
  selectedLocationId?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (location: Location) => void;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

const Map: React.FC<MapProps> = ({
  locations = [],
  selectedLocationId,
  center = [41.8781, -87.6298], // Default center (Chicago)
  zoom = 10,
  height = '400px',
  onLocationSelect,
  onMapClick,
  interactive = true
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      
      // Add click handler if provided
      if (onMapClick && interactive) {
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }
    }
    
    return () => {
      // Clean up map on component unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, onMapClick, interactive]);
  
  // Update markers when locations change
  useEffect(() => {
    if (mapRef.current) {
      // Clear existing markers
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          mapRef.current?.removeLayer(layer);
        }
      });
      
      // Add new markers for each location
      locations.forEach(location => {
        const marker = L.marker([location.latitude, location.longitude], {
          title: location.name,
          // Use a different icon for selected location
          icon: location.id === selectedLocationId
            ? L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })
            : defaultIcon
        });
        
        // Add popup with location name
        marker.bindPopup(`<b>${location.name}</b><br>${location.notes || ''}`);
        
        // Add click handler if provided
        if (onLocationSelect && interactive) {
          marker.on('click', () => {
            onLocationSelect(location);
          });
        }
        
        marker.addTo(mapRef.current!);
      });
    }
  }, [locations, selectedLocationId, onLocationSelect, interactive]);
  
  // Update map center and zoom when props change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);
  
  return (
    <div 
      ref={mapContainerRef} 
      style={{ height, width: '100%' }}
      className="map-container"
    ></div>
  );
};

export default Map;