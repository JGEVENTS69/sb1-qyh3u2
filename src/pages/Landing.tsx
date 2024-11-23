import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  BookOpen,
  Map,
  Users,
  Star,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Crown,
  Heart,
  ChevronRight,
  Sparkles,
  BookMarked,
  Share2,
  Coffee,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import AnimatedSection from '../components/AnimatedSection';
import AnimatedFeatureCard from '../components/AnimatedFeatureCard';
import AnimatedPricingCard from '../components/AnimatedPricingCard';
import AnimatedHeader from '../components/AnimatedHeader';
import TypeWriter from '../components/TypeWriter';
import Footer from '../components/Footer';
import ShuffleGrid from '../components/ShuffleGrid';
import toast from 'react-hot-toast';
import FAQSection from '../components/Faq-section';

const Landing = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', ''); // Enlève le "#" pour obtenir l'id
      const section = document.getElementById(sectionId); // Cherche l'élément avec cet id
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' }); // Défilement fluide
      }
    }
  }, [location]);

  const dynamicWords = [
    'partageons nos livres.',
    'créons des liens.',
    'donnons vie aux livres.',
    'enrichissons nos quartiers !',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full px-8 py-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8 max-w-6xl mx-auto">
        <div>
          <span className="block mb-1 text-5xl md:text-5xl text-primary font-medium">
            Ensemble,
            <h3 className="text-4xl md:text-4xl text-black font-semibold">
              <TypeWriter words={dynamicWords} speed={80} delay={2500} />
            </h3>
          </span>

          <p className="text-base md:text-base text-slate-700 my-4 md:my-6">
            Rejoignez la 1ère communauté de partage de livres en explorant les
            boîtes à livres près de chez vous.
          </p>
          <Button
            onClick={() => navigate('/map')}
            className="bg-primary text-white hover:bg-primary-dark"
          >
            Explorer la carte
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        <ShuffleGrid />
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-white via-gray-50 to-primary/10"
      >
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explorez, partagez, connectez :
            </h2>
            <p className="text-base text-gray-600">
              Découvrez toutes les fonctionnalités simples pour partager vos
              livres.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {[
              {
                icon: Map,
                title: 'Carte interactive',
                description:
                  'Localisez facilement les boîtes à livres autour de vous.',
                image:
                  'https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/carte.jpeg?t=2024-11-22T17%3A56%3A32.189Z',
              },
              {
                icon: BookMarked,
                title: 'Gestion simplifiée',
                description:
                  'Ajoutez et gérez vos boîtes à livres en quelques clics.',
                image:
                  'https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/box.jpeg',
              },
              {
                icon: Star,
                title: 'Évaluations et commentaires',
                description:
                  'Évaluez les boîtes à livres et consultez les avis des autres utilisateurs.',
                image:
                  'https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/box-avis.jpeg?t=2024-11-22T17%3A49%3A06.074Z',
              },
            ].map((feature, index) => (
              <AnimatedFeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                image={feature.image}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-b from-primary/10 via-white to-primary"
      >
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Votre abonnement, à votre mesure !
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explorez de temps en temps ou gérez plusieurs boîtes, nos forfaits
              sont faits pour vous.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedPricingCard
              title="Freemium"
              price="Gratuit"
              features={[
                'Carte interactive.',
                "Jusqu'à 5 boîtes à livres.",
                "Jusqu'à 5 boîtes à livres en favoris.",
                "Jusqu'à 5 avis et évaluations.",
              ]}
              icon={BookOpen}
              onSelect={() => navigate('/auth')}
              current={user?.subscription === 'freemium'}
              index={0}
            />
            <AnimatedPricingCard
              title="Premium"
              price="4.99€"
              features={[
                'Carte interactive.',
                'Boîtes à livres illimitées.',
                'Boîtes à livres favorites illimitées.',
                'Avis et évaluations illimitées.',
                'Badge Premium exclusif.',
                'Signalement des boîtes à livres défectueuses.',
              ]}
              icon={Crown}
              isPopular
              onSelect={() => {
                if (!user) {
                  navigate('/auth');
                } else {
                  toast.error(
                    'La souscription Premium sera bientôt disponible !'
                  );
                }
              }}
              current={user?.subscription === 'premium'}
              index={1}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <>
        {/* Autres sections */}
        <FAQSection />
        {/* Autres sections */}
      </>

      <Footer />
    </div>
  );
};

export default Landing;
