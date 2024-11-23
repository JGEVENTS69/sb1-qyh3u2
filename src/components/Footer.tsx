import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, MapPin, Phone, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo et Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/logo.png"
                alt="Bookineo Logo"
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-white">Bookineo</span>
            </div>
            <p className="text-white mb-6 max-w-md">
              Découvrez et rejoignez la 1ère communauté de partage de livres
              près de chez vous.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/map"
                  className="text-white hover:border-b-2 transition-colors"
                >
                  Carte
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-white hover:border-b-2 transition-colors"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-white hover:border-b-2 transition-colors"
                >
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-white hover:border-b-2 transition-colors"
                >
                  Tarifs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-white">
                <MapPin className="h-5 w-5 text-white" />
                <span>Paris, France</span>
              </li>
              <li className="flex items-center space-x-2 text-white">
                <Phone className="h-5 w-5 text-white" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center space-x-2 text-white">
                <Mail className="h-5 w-5 text-white" />
                <span>contact@bookineo.fr</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-white-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white text-sm">
              © {currentYear} Bookineo. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/privacy"
                className="text-white hover:text-[#ffebc2] text-sm transition-colors"
              >
                Politique de confidentialité
              </Link>
              <Link
                to="/terms"
                className="text-white hover:text-[#ffebc2] text-sm transition-colors"
              >
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
