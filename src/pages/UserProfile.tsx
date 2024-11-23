import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, BookBox } from '../types';
import { BookOpen, User as UserIcon, Mail, Crown, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [boxes, setBoxes] = useState<BookBox[]>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndBoxes = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (userError) throw userError;
        setUser(userData);

        const { data: boxesData, error: boxesError } = await supabase
          .from('book_boxes')
          .select('*')
          .eq('creator_username', username)
          .order('created_at', { ascending: false });

        if (boxesError) throw boxesError;
        setBoxes(boxesData || []);

        const { count, error: visitsError } = await supabase
          .from('box_visits')
          .select('*', { count: 'exact', head: true })
          .eq('visitor_id', userData.id);

        if (visitsError) throw visitsError;
        setVisitCount(count || 0);
      } catch (error: any) {
        toast.error('Erreur lors du chargement du profil');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBoxes();
  }, [username, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Utilisateur non trouvé</h1>
          <p className="text-gray-600">
            L'utilisateur que vous recherchez n'existe pas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              {/* Photo de profil */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gray-50 flex items-center justify-center shadow-md">
                    <UserIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Informations utilisateur */}
              <div className="flex-grow text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  {user.username}
                </h1>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Crown className={`h-5 w-5 mr-2 ${user.subscription === 'premium' ? 'text-yellow-500' : ''}`} />
                    <span className="capitalize">{user.subscription}</span>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto sm:mx-0">
                  <div className="bg-gray-50 px-4 py-3 rounded-xl text-center">
                    <p className="text-3xl font-bold text-primary">{boxes.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Boîtes ajoutées</p>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-xl text-center">
                    <p className="text-3xl font-bold text-primary">{visitCount}</p>
                    <p className="text-sm text-gray-600 mt-1">Boîtes visitées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des boîtes */}
        {boxes.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 px-1">Boîtes à livres</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boxes.map((box) => (
                <div
                  key={box.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/box/${box.id}`)}
                >
                  {box.image_url ? (
                    <img
                      src={box.image_url}
                      alt={box.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{box.name}</h3>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <p className="text-sm">
                        {new Date(box.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-8 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {user.username} n'a pas encore ajouté de boîte à livres.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;