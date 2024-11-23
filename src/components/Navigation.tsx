import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Map, User, LogOut } from 'lucide-react';
import Button from './Button';

const Navigation = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Logo-long.png?t=2024-11-22T23%3A51%3A02.438Z"
                alt="Logo Bookineo"
                className="h-12 w-30"
              />
            </Link>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                to="/map"
                className={`inline-flex items-center px-2 py-2 text-sm font-medium ${
                  isActive('/map')
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <Map className="h-4 w-4 mr-1" />
                Carte
              </Link>

              <Link
                to="/#features"
                className="inline-flex items-center px-2 py-2 text-gray-500 hover:text-primary"
              >
                Fonctionnalités
              </Link>
              <Link
                to="/#pricing"
                className="inline-flex items-center px-2 py-2 text-gray-500 hover:text-primary"
              >
                Tarifs
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive('/profile')
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="ml-2">{user.username}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-primary p-2 rounded-full"
                  title="Se déconnecter"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Button onClick={() => navigate('/auth')}>Se connecter</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
