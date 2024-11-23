import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import { User, Upload, Trash2, BookOpen, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boxCount, setBoxCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
  });

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('mobile-menu');
      const menuButton = document.getElementById('menu-button');
      if (
        menu &&
        !menu.contains(event.target as Node) &&
        !menuButton?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Récupérer le nombre de boîtes créées par l'utilisateur
    const fetchBoxCount = async () => {
      const { count } = await supabase
        .from('book_boxes')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);

      setBoxCount(count || 0);
    };

    fetchBoxCount();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user?.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success('Photo de profil mise à jour');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
      )
    ) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', user?.id);

        if (error) throw error;

        await signOut();
        navigate('/');
        toast.success('Compte supprimé avec succès');
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) return null;

  const isFreemium = user.subscription === 'freemium';
  const boxLimit = isFreemium ? 5 : Infinity;
  const remainingBoxes = isFreemium ? boxLimit - boxCount : Infinity;
  const handleTabNavigation = (tab: 'boxes' | 'favorites') => {
    setIsMenuOpen(false); // Fermer le menu après la sélection
    navigate('/my-boxes', { state: { activeTab: tab } });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header avec menu hamburger */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={loading}
                />
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-primary capitalize">
                {user.subscription}
              </p>
            </div>
          </div>

          {/* Menu Hamburger - visible uniquement sur mobile */}
          <div className="relative md:hidden">
            <button
              id="menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>

            {/* Menu déroulant */}
            {isMenuOpen && (
              <div
                id="mobile-menu"
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                <button
                  onClick={() => handleTabNavigation('boxes')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mes boîtes
                </button>
                <button
                  onClick={() => handleTabNavigation('favorites')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mes favoris
                </button>
              </div>
            )}
          </div>

          {/* Version desktop des liens - visible uniquement sur desktop */}
          <div className="hidden md:flex md:space-x-4">
            <Link
              to="/my-boxes"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Mes boîtes
            </Link>
            <Link
              to="/my-favorites"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Mes favoris
            </Link>
          </div>
        </div>

        {/* Statistiques des boîtes */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-medium">Vos boîtes à livres</h3>
            </div>
            <span className="text-sm text-gray-600">
              {boxCount} {isFreemium ? `/ ${boxLimit}` : ''} boîtes
            </span>
          </div>
          {isFreemium && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary rounded-full transition-all"
                  style={{ width: `${(boxCount / boxLimit) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {remainingBoxes > 0
                  ? `Il vous reste ${remainingBoxes} boîte${
                      remainingBoxes > 1 ? 's' : ''
                    } à ajouter`
                  : 'Vous avez atteint la limite de boîtes pour un compte Freemium'}
              </p>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" isLoading={loading}>
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <Button onClick={() => setIsEditing(true)}>
                Modifier le profil
              </Button>
            </div>
            {isFreemium && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Passez à Premium</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Profitez d'avantages exclusifs et créez un nombre illimité de
                  boîtes à livres.
                </p>
                <Button>Passer à Premium</Button>
              </div>
            )}
            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="mr-2"
              >
                Se déconnecter
              </Button>
              <Button
                variant="secondary"
                onClick={handleDeleteAccount}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer le compte
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
