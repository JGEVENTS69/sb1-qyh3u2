import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLng, Icon, DivIcon } from 'leaflet';
import {
  BookOpen,
  Navigation as NavigationIcon,
  Crosshair,
  Clock,
  User,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BookBox } from '../types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
      },
      (error) => {
        setError(error.message);
        toast.error('Erreur de géolocalisation: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { location, error, getLocation };
};

const LocationButton = () => {
  const map = useMap();
  const { location, getLocation } = useGeolocation();

  const handleClick = () => {
    getLocation();
    if (location) {
      map.flyTo([location.coords.latitude, location.coords.longitude], 15, {
        duration: 1.5,
      });
    } else {
      toast.error(
        'Veuillez autoriser la géolocalisation dans votre navigateur'
      );
    }
  };

  return (
    <div
      className="leaflet-bottom leaflet-right"
      style={{ marginBottom: '24px', marginRight: '10px' }}
    >
      <div className="leaflet-control">
        <button
          onClick={handleClick}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          title="Me localiser"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Crosshair className="h-4 w-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const Map = () => {
  const [bookBoxes, setBookBoxes] = useState<BookBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [markerIcon, setMarkerIcon] = useState<string | null>(null);
  const { location } = useGeolocation();
  const navigate = useNavigate();

  const defaultPosition: LatLng = new LatLng(46.603354, 1.888334);
  const userPosition = location
    ? new LatLng(location.coords.latitude, location.coords.longitude)
    : null;

  useEffect(() => {
    const fetchBookBoxes = async () => {
      try {
        // Récupérer l'icône du marqueur depuis Supabase Storage
        const {
          data: { publicUrl },
        } = supabase.storage.from('assets').getPublicUrl('marker-icon.png');

        setMarkerIcon(publicUrl);

        // Récupérer les boîtes à livres
        const { data, error } = await supabase.from('book_boxes').select('*');

        if (error) throw error;
        setBookBoxes(data || []);
      } catch (error: any) {
        toast.error('Erreur lors du chargement des boîtes à livres');
      } finally {
        setLoading(false);
      }
    };

    fetchBookBoxes();
  }, []);

  const bookBoxIcon = markerIcon
    ? new Icon({
        iconUrl: markerIcon, // URL de l'icône
        iconSize: [8, 24], // Diminue ici les dimensions, par exemple [16, 24] pour une taille plus petite
        iconAnchor: [8, 24], // Déplacer l'ancrage pour centrer correctement l'icône
        popupAnchor: [12, -24], // Si nécessaire, ajuste l'ancrage du popup
      })
    : new DivIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #3A7C6A; width: 8px; height: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [8, 8], // Ajuste cette taille
        iconAnchor: [6, 6], // Ancrage centré pour une taille plus petite
      });

  const userIcon = new DivIcon({
    className: 'custom-div-icon',
    html: `
          <div style="background-color: #4285F4; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);">
            <div style="background-color: rgba(66, 133, 244, 0.2); width: 6px; height: 6px; border-radius: 50%; position: absolute; top: -2px; left: -2px;"></div>
          </div>
        `,
    iconSize: [12, 12], // Nouvelle taille réduite
    iconAnchor: [6, 6], // Centrer l'icône
  });

  return (
    <div className="h-[calc(100vh-4rem)]">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <MapContainer
          center={userPosition || defaultPosition}
          zoom={userPosition ? 15 : 6}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationButton />

          {userPosition && (
            <Marker position={userPosition} icon={userIcon}>
              <Popup>Vous êtes ici</Popup>
            </Marker>
          )}

          {bookBoxes.map((box) => (
            <Marker
              key={box.id}
              position={[box.latitude, box.longitude]}
              icon={bookBoxIcon}
            >
              <Popup>
                <div className="w-full">
                  {box.image_url ? (
                    <img
                      src={box.image_url}
                      alt={box.name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-2xl font-bold mb-2">{box.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          Ajoutée le {formatDate(box.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/user/${box.creator_username}`);
                          }}
                          className="text-sm italic hover:text-primary hover:underline"
                        >
                          Par {box.creator_username}
                        </button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/box/${box.id}`)}
                        className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                      >
                        Plus d'infos
                      </button>
                      <button
                        onClick={() => {
                          if (userPosition) {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&origin=${userPosition.lat},${userPosition.lng}&destination=${box.latitude},${box.longitude}`,
                              '_blank'
                            );
                          } else {
                            toast.error('Veuillez activer la géolocalisation');
                          }
                        }}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Y aller
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default Map;
