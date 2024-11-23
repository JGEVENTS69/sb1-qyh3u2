import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { BookBox } from '../types';
import Button from '../components/Button';
import { BookOpen, Heart, Trash2, PenSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const MyBoxes = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState<BookBox[]>([]);
  const [favorites, setFavorites] = useState<BookBox[]>([]);
  const [activeTab, setActiveTab] = useState<'my-boxes' | 'favorites'>('my-boxes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchBoxes = async () => {
      try {
        // Fetch user's boxes
        const { data: userBoxes, error: boxesError } = await supabase
          .from('book_boxes')
          .select('*')
          .eq('creator_id', user.id);

        if (boxesError) throw boxesError;

        // Fetch user's favorites
        const { data: userFavorites, error: favoritesError } = await supabase
          .from('favorites')
          .select(`
            book_boxes (*)
          `)
          .eq('user_id', user.id);

        if (favoritesError) throw favoritesError;

        setBoxes(userBoxes || []);
        setFavorites(userFavorites?.map(f => f.book_boxes) || []);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, [user, navigate]);

  const handleDelete = async (boxId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette boîte à livres ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('book_boxes')
        .delete()
        .eq('id', boxId);

      if (error) throw error;

      setBoxes(boxes.filter(box => box.id !== boxId));
      toast.success('Boîte à livres supprimée avec succès');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemoveFavorite = async (boxId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('box_id', boxId);

      if (error) throw error;

      setFavorites(favorites.filter(box => box.id !== boxId));
      toast.success('Retiré des favoris');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'my-boxes'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('my-boxes')}
          >
            Mes boîtes
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'favorites'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('favorites')}
          >
            Favoris
          </button>
        </div>
        <Button onClick={() => navigate('/add-box')}>
          Ajouter une boîte
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'my-boxes' ? boxes : favorites).map((box) => (
            <div
              key={box.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {box.image_url ? (
                <img
                  src={box.image_url}
                  alt={box.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{box.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ajoutée le {new Date(box.created_at).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/box/${box.id}`)}
                  >
                    Voir les détails
                  </Button>
                  {activeTab === 'my-boxes' ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/edit-box/${box.id}`)}
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDelete(box.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRemoveFavorite(box.id)}
                    >
                      <Heart className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBoxes;