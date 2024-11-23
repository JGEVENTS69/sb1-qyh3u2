import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

        if (authError) throw authError;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (userError) throw userError;
        if (!userData) throw new Error('Profil utilisateur non trouvé');

        setUser(userData);
        toast.success('Connexion réussie !');
        navigate('/map'); // Redirection vers la carte après connexion
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                first_name: formData.firstName,
                last_name: formData.lastName,
                username: formData.username,
              },
            },
          }
        );

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from('users').insert([
            {
              id: authData.user.id,
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              username: formData.username,
              subscription: 'freemium',
            },
          ]);

          if (profileError) throw profileError;

          toast.success('Inscription réussie ! Vérifiez votre email.');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 space-y-8">
          <div className="text-center">
            <img
              src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Logo-long.png?t=2024-11-22T23%3A51%3A02.438Z"
              alt="Logo Bookineo"
              className="h-12 mx-auto"
            />
            <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
              {isLogin
                ? 'Content de vous revoir !'
                : 'Créer un compte rapidement.'}
            </h2>
            <p className="text-sm text-gray-500">
              {isLogin
                ? 'Connectez-vous pour continuer.'
                : 'Créez votre profile et enrichissez vos quartiers !'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-primary focus:border-primary sm:text-sm"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Prénom
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      className="mt-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      className="mt-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom d'utilisateur
                    </label>
                    <input
                      id="username"
                      type="text"
                      required
                      className="mt-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="mt-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-primary focus:border-primary sm:text-sm"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 transition"
              >
                {loading
                  ? 'Chargement...'
                  : isLogin
                  ? 'Se connecter'
                  : "S'inscrire"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:text-primary-dark"
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
