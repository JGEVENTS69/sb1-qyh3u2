import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { BookBox, Visit } from '../types';
import { BookOpen, Navigation, User, Star, Clock, MapPin, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, LayersControl } from 'react-leaflet';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const VisitModal = ({ isOpen, onClose, onSubmit, loading }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  loading: boolean;
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Noter cette boîte à livres</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className="p-2"
                  >
                    <Star className={`h-6 w-6 ${value <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                rows={4}
                placeholder="Partagez votre expérience..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                onClick={() => onSubmit(rating, comment)}
                isLoading={loading}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const BoxDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [box, setBox] = useState<BookBox | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBoxAndVisits = async () => {
      try {
        // Récupérer les détails de la boîte
        const { data: boxData, error: boxError } = await supabase
          .from('book_boxes')
          .select('*')
          .eq('id', id)
          .single();

        if (boxError) throw boxError;
        setBox(boxData);

        // Récupérer les visites
        const { data: visitsData, error: visitsError } = await supabase
          .from('box_visits')
          .select(`
            *,
            visitor:users (
              username,
              avatar_url
            )
          `)
          .eq('box_id', id)
          .order('visited_at', { ascending: false });

        if (visitsError) throw visitsError;
        setVisits(visitsData || []);

        // Vérifier si l'utilisateur a déjà visité
        if (user) {
          const { data: visitData } = await supabase
            .from('box_visits')
            .select('*')
            .eq('box_id', id)
            .eq('visitor_id', user.id)
            .maybeSingle();

          setHasVisited(!!visitData);

          // Vérifier si la boîte est en favoris
          const { data: favoriteData } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('box_id', id)
            .maybeSingle();

          setIsFavorite(!!favoriteData);
        }
      } catch (error: any) {
        toast.error('Erreur lors du chargement de la boîte à livres');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBoxAndVisits();
  }, [id, user, navigate]);

  const handleVisit = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsVisitModalOpen(true);
  };

  const handleVisitSubmit = async (rating: number, comment: string) => {
    if (!user || !id) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('box_visits')
        .insert([
          {
            box_id: id,
            visitor_id: user.id,
            rating,
            comment: comment.trim() || null
          }
        ]);

      if (error) throw error;

      setHasVisited(true);
      setIsVisitModalOpen(false);
      toast.success('Visite enregistrée !');

      // Rafraîchir la liste des visites
      const { data: newVisits, error: visitsError } = await supabase
        .from('box_visits')
        .select(`
          *,
          visitor:users (
            username,
            avatar_url
          )
        `)
        .eq('box_id', id)
        .order('visited_at', { ascending: false });

      if (visitsError) throw visitsError;
      setVisits(newVisits || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('box_id', id);

        if (error) throw error;
        setIsFavorite(false);
        toast.success('Retiré des favoris');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, box_id: id }]);

        if (error) throw error;
        setIsFavorite(true);
        toast.success('Ajouté aux favoris');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading || !box) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {box.image_url ? (
          <img
            src={box.image_url}
            alt={box.name}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-gray-400" />
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{box.name}</h1>
            {user && (
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full hover:bg-gray-100 ${
                  isFavorite ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                <Star className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4 text-gray-600 mb-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">
                Ajoutée le {new Date(box.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <button
              onClick={() => navigate(`/user/${box.creator_username}`)}
              className="flex items-center hover:text-primary"
            >
              <User className="h-4 w-4 mr-1" />
              <span className="text-sm">Par {box.creator_username}</span>
            </button>
          </div>

          <p className="text-gray-700 mb-6">{box.description}</p>

          <div className="h-64 rounded-lg overflow-hidden mb-6">
            <MapContainer
              center={[box.latitude, box.longitude]}
              zoom={18}
              className="h-full"
              scrollWheelZoom={false}
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="OpenStreetMap FR">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="OpenTopoMap">
                  <TileLayer
                    attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>
              <Marker position={[box.latitude, box.longitude]} />
            </MapContainer>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${box.latitude},${box.longitude}`,
                  '_blank'
                )
              }
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Y aller
            </button>
            {!hasVisited && user && (
              <button
                onClick={handleVisit}
                className="flex-1 bg-white border-2 border-primary text-primary py-3 px-6 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Marquer comme visité
              </button>
            )}
          </div>
        </div>
      </div>

      {visits.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Visites</h2>
          <div className="space-y-4">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {visit.visitor.avatar_url ? (
                      <img
                        src={visit.visitor.avatar_url}
                        alt={visit.visitor.username}
                        className="w-10 h-10 rounded-full mr-4"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <button
                        onClick={() => navigate(`/user/${visit.visitor.username}`)}
                        className="font-medium hover:text-primary"
                      >
                        {visit.visitor.username}
                      </button>
                      <p className="text-sm text-gray-600">
                        {new Date(visit.visited_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {visit.rating && (
                    <div className="flex">
                      {[...Array(visit.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  )}
                </div>
                {visit.comment && (
                  <p className="text-gray-700 mt-2">{visit.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        onSubmit={handleVisitSubmit}
        loading={isSubmitting}
      />
    </div>
  );
};

export default BoxDetails;