import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (latlng: LatLng) => void }) => {
  const [marker, setMarker] = useState<LatLng | null>(null);

  useMapEvents({
    click(e) {
      setMarker(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return marker ? <Marker position={marker} /> : null;
};

const AddBox = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [boxCount, setBoxCount] = useState(0);
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

    // Vérifier le nombre de boîtes de l'utilisateur
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

  const isFreemium = user?.subscription === 'freemium';
  const boxLimit = isFreemium ? 5 : Infinity;
  const canAddBox = boxCount < boxLimit;

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Limite atteinte</h2>
          <p className="text-gray-600 mb-6">
            Vous avez atteint la limite de {boxLimit} boîtes pour un compte Freemium.
            Passez à Premium pour ajouter plus de boîtes !
          </p>
          <Button onClick={() => navigate('/profile')}>
            Passer à Premium
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ajouter une boîte à livres</h1>

      {isFreemium && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            {boxCount} / {boxLimit} boîtes utilisées
          </p>
          <div className="h-2 bg-gray-200 rounded-full mt-2">
            <div
              className="h-2 bg-primary rounded-full transition-all"
              style={{ width: `${(boxCount / boxLimit) * 100}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la boîte
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <span className="text-primary">Cliquez pour uploader</span> ou
                      glissez-déposez
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              {imagePreview && (
                <div className="h-32 w-32">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Emplacement</h2>
          <p className="text-sm text-gray-600 mb-4">
            Cliquez sur la carte pour placer la boîte à livres
          </p>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[46.603354, 1.888334]}
              zoom={6}
              className="h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker onLocationSelect={setLocation} />
            </MapContainer>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/my-boxes')}
          >
            Annuler
          </Button>
          <Button type="submit" isLoading={loading}>
            Ajouter la boîte
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddBox;