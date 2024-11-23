import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Check, BookOpen, Map, Star, Users, Zap, Crown } from 'lucide-react';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const PricingCard = ({ 
  title, 
  price, 
  features, 
  isPopular, 
  onSelect,
  current
}: {
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
  current?: boolean;
}) => (
  <div className={`relative bg-white rounded-2xl shadow-lg ${isPopular ? 'ring-2 ring-primary' : ''}`}>
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
          Populaire
        </span>
      </div>
    )}
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-4xl font-bold">{price}</span>
            {price !== 'Gratuit' && <span className="text-gray-500 ml-1">/mois</span>}
          </div>
        </div>
        {title === 'Premium' && <Crown className="h-8 w-8 text-yellow-500" />}
        {title === 'Freemium' && <BookOpen className="h-8 w-8 text-primary" />}
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={onSelect}
        variant={isPopular ? 'primary' : 'secondary'}
        className="w-full"
        disabled={current}
      >
        {current ? 'Plan actuel' : 'Sélectionner'}
      </Button>
    </div>
  </div>
);

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleSelect = (plan: 'freemium' | 'premium') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (plan === 'premium') {
      toast.error('La souscription Premium sera bientôt disponible !');
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez le plan qui vous convient
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des options flexibles pour tous les utilisateurs, de l'amateur occasionnel au passionné de lecture.
          </p>
        </div>

        {/* Grille des fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: BookOpen,
              title: "Boîtes à livres",
              description: "Ajoutez et gérez vos boîtes à livres"
            },
            {
              icon: Map,
              title: "Carte interactive",
              description: "Localisez facilement les boîtes autour de vous"
            },
            {
              icon: Star,
              title: "Avis et notes",
              description: "Partagez votre expérience avec la communauté"
            },
            {
              icon: Users,
              title: "Profil personnalisé",
              description: "Créez votre profil de lecteur unique"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6">
              <feature.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Plans tarifaires */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Freemium"
            price="Gratuit"
            features={[
              "Jusqu'à 5 boîtes à livres",
              "Carte interactive",
              "Profil personnalisé",
              "Avis et notes",
              "Support communautaire"
            ]}
            current={user?.subscription === 'freemium'}
            onSelect={() => handleSelect('freemium')}
          />
          <PricingCard
            title="Premium"
            price="4.99€"
            features={[
              "Boîtes à livres illimitées",
              "Badge Premium exclusif",
              "Statistiques avancées",
              "Support prioritaire",
              "Fonctionnalités en avant-première",
              "Sans publicité"
            ]}
            isPopular
            current={user?.subscription === 'premium'}
            onSelect={() => handleSelect('premium')}
          />
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Puis-je changer de plan à tout moment ?",
                answer: "Oui, vous pouvez passer du plan Freemium à Premium quand vous le souhaitez."
              },
              {
                question: "Comment fonctionne la limite de boîtes ?",
                answer: "Le plan Freemium permet d'ajouter jusqu'à 5 boîtes à livres. Le plan Premium n'a pas de limite."
              },
              {
                question: "Y a-t-il un engagement de durée ?",
                answer: "Non, vous pouvez annuler votre abonnement Premium à tout moment."
              },
              {
                question: "Que se passe-t-il si je dépasse la limite ?",
                answer: "Vous devrez passer au plan Premium pour ajouter plus de boîtes à livres."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;