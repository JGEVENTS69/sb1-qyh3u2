import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import { Upload, MapPin, X, ArrowLeft, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';

// Nouveau composant LocationPicker modifié avec gestion de l'icône personnalisée
const CustomLocationPicker = ({ onLocationSelect, markerIconUrl }: { onLocationSelect: (latlng: LatLng) => void, markerIconUrl: string }) => {
  const [marker, setMarker] = useState<LatLng | null>(null);
  
  const isMobile = window.innerWidth <= 768;
  // Initialisation de l'icône personnalisée
  const markerIcon = new Icon({
    iconUrl: markerIconUrl,  // Utilisation de l'URL de l'icône
    iconSize: isMobile ? [24, 24] : [24, 24],      // Taille de l'icône
    iconAnchor: [16, 32],    // Point d'ancrage (au bas de l'icône)
  });

  useMapEvents({
    click(e) {
      setMarker(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return marker ? <Marker position={marker} icon={markerIcon} /> : null; // Utilisation de l'icône personnalisée ici
};

const AddBox = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [boxCount, setBoxCount] = useState(0);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const checkBoxCount = async () => {
      const { count } = await supabase
        .from('book_boxes')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);
      
      setBoxCount(count || 0);
    };

    checkBoxCount();
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const isFreemium = user?.subscription === 'freemium';
  const boxLimit = isFreemium ? 5 : Infinity;
  const canAddBox = boxCount < boxLimit;

  const handleNextStep = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAddBox) {
      toast.error('Vous avez atteint la limite de boîtes pour un compte Freemium');
      return;
    }

    if (!location) {
      toast.error('Veuillez sélectionner un emplacement sur la carte');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = null;
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `book-boxes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('book-boxes')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('book-boxes')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('book_boxes').insert([
        {
          name: formData.name,
          description: formData.description,
          latitude: location.lat,
          longitude: location.lng,
          image_url: imageUrl,
          creator_id: user?.id,
          creator_username: user?.username,
        },
      ]);

      if (error) throw error;

      toast.success('Boîte à livres ajoutée avec succès');
      navigate('/my-boxes');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!canAddBox) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Limite de boîtes atteinte</h2>
          <p className="text-gray-600 mb-6">
            Vous avez atteint la limite de {boxLimit} boîtes pour un compte Freemium.
            Passez à Premium pour ajouter plus de boîtes !
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Passer à Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold">
            {step === 1 ? 'Ajoutez votre boîte à livre' : "Validez l'emplacement"}
          </h1>
        </div>

        {/* Étapes */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center w-full">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full">
              1
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-1 bg-primary transition-all ${
                step > 1 ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step > 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          // Étape 1 : Informations
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la boîte
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ma boîte à livres"
                  className="mt-1 block w-full h-9 rounded-md outline outline-1 outline-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-2 py-2"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre boîte à livres..."
                  rows={4}
                  className="mt-1 block w-full h-9 rounded-md outline outline-1 outline-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-2 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo
                </label>
                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Cliquez pour ajouter une photo</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 p-1"
                    >
                      <Trash className="w-6 h-6 text-[#d8596e] " />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate('/my-boxes')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!formData.name.trim() || !formData.description.trim()}
              >
                Suivant
              </button>
            </div>
          </div>
        ) : (
          // Étape 2 : Emplacement
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <p>Cliquez sur la carte pour placer votre boîte</p>
              </div>
              <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={[46.603354, 1.888334]}
                  zoom={6}
                  className="h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker onLocationSelect={setLocation} markerIconUrl="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/marker-icon%20(1).png" />
                </MapContainer>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading || !location}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Ajout en cours...' : 'Ajouter la boîte'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddBox;