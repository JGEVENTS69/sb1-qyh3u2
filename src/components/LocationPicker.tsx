import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { Icon } from 'leaflet';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  markerIconUrl: string; // L'URL de l'icône récupérée
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  markerIconUrl,
}) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const isMobile = window.innerWidth <= 768;

  // Configuration de l'icône personnalisée
  const markerIcon = new Icon({
    iconUrl: markerIconUrl, // Utilisation de l'URL fournie
    iconSize: isMobile ? [24, 24] : [32, 32], // Taille de l'icône (ajustez si nécessaire)
    iconAnchor: [16, 32], // Point d'ancrage (centre bas)
  });

  // Gestion des clics sur la carte
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng }); // Mise à jour de la position
        onLocationSelect({ lat, lng }); // Notification au parent
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[46.603354, 1.888334]} // Coordonnées par défaut
      zoom={6}
      className="h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler />
      {position && (
        <Marker
          position={[position.lat, position.lng]}
          icon={markerIcon} // Appliquer l'icône personnalisée ici
        />
      )}
    </MapContainer>
  );
};

export default LocationPicker;