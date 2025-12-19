import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGallery } from '../services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Home as HomeIcon, Image as ImageIcon, Plus, Calendar } from 'lucide-react';

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const response = await getGallery();
      setPhotos(response.data);
    } catch (error) {
      console.error('Erro ao carregar galeria:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando galeria...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="hover:bg-blue-700 p-1 rounded transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Galeria</h1>
        </div>
      </div>

      <div className="p-4">
        {photos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Nenhuma foto ainda</p>
            <p className="text-sm mt-2">Adicione fotos às atividades!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="relative cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.photo_data}
                  alt={photo.activity_title}
                  className="w-full h-48 object-cover rounded-lg shadow hover:shadow-lg transition"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 rounded-b-lg">
                  <p className="text-white text-xs font-semibold truncate">
                    {photo.activity_title}
                  </p>
                  <p className="text-white text-xs opacity-90">
                    {format(parseISO(photo.activity_date), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t safe-area-bottom">
        <div className="flex justify-around items-center p-3">
          <button
            onClick={() => navigate('/home')}
            className="flex flex-col items-center text-gray-600 font-medium text-sm gap-1"
          >
            <HomeIcon size={20} />
            <span className="text-xs">Início</span>
          </button>
          <button
            className="bg-gray-300 text-gray-500 rounded-full px-6 py-3 shadow-lg font-semibold -mt-2 cursor-not-allowed flex items-center gap-2"
            disabled
          >
            <Plus size={18} />
            Nova
          </button>
          <button
            onClick={() => navigate('/gallery')}
            className="flex flex-col items-center text-blue-600 font-medium text-sm gap-1"
          >
            <ImageIcon size={20} />
            <span className="text-xs">Galeria</span>
          </button>
        </div>
      </div>

      {/* Modal para visualizar foto */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full">
            <img
              src={selectedPhoto.photo_data}
              alt={selectedPhoto.activity_title}
              className="w-full h-auto max-h-screen object-contain rounded-lg"
            />
            <div className="bg-white p-4 mt-2 rounded-lg">
              <h3 className="font-semibold text-lg">{selectedPhoto.activity_title}</h3>
              <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                <Calendar size={14} />
                {format(parseISO(selectedPhoto.activity_date), "dd 'de' MMMM", { locale: ptBR })}
              </p>
              <p className="text-gray-500 text-sm mt-1">Por {selectedPhoto.uploaded_by}</p>
              {selectedPhoto.caption && (
                <p className="text-gray-700 mt-2">{selectedPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
