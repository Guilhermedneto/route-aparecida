import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getActivity,
  updateActivity,
  addPhoto,
  addComment,
  deletePhoto,
  deleteComment
} from '../services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar, Clock, Trash2, ArrowLeft, CheckSquare, Square } from 'lucide-react';

function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nickname } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [comment, setComment] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    activity_date: '',
    activity_time: ''
  });

  useEffect(() => {
    loadActivity();
  }, [id]);

  const loadActivity = async () => {
    try {
      const response = await getActivity(id);
      setActivity(response.data);
      setFormData({
        title: response.data.title,
        location: response.data.location || '',
        activity_date: response.data.activity_date.split('T')[0],
        activity_time: response.data.activity_time ? response.data.activity_time.substring(0, 5) : ''
      });
    } catch (error) {
      console.error('Erro ao carregar atividade:', error);
      alert('Erro ao carregar atividade');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateActivity(id, formData);
      setEditMode(false);
      loadActivity();
    } catch (error) {
      alert('Erro ao atualizar atividade');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande! Máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await addPhoto({
          activity_id: id,
          photo_data: reader.result,
          caption: ''
        });
        loadActivity();
      } catch (error) {
        alert('Erro ao enviar foto');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addComment({
        activity_id: id,
        comment_text: comment
      });
      setComment('');
      loadActivity();
    } catch (error) {
      alert('Erro ao adicionar comentário');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Deseja excluir esta foto?')) {
      try {
        await deletePhoto(photoId);
        loadActivity();
      } catch (error) {
        alert('Erro ao excluir foto');
      }
    }
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      } else {
        return [...prev, photoId];
      }
    });
  };

  const handleDeleteSelectedPhotos = async () => {
    if (selectedPhotos.length === 0) {
      alert('Selecione pelo menos uma foto para excluir');
      return;
    }

    if (window.confirm(`Deseja excluir ${selectedPhotos.length} foto(s)?`)) {
      try {
        await Promise.all(selectedPhotos.map(photoId => deletePhoto(photoId)));
        setSelectedPhotos([]);
        setSelectionMode(false);
        loadActivity();
      } catch (error) {
        alert('Erro ao excluir fotos');
      }
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedPhotos([]);
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Deseja excluir este comentário?')) {
      try {
        await deleteComment(commentId);
        loadActivity();
      } catch (error) {
        alert('Erro ao excluir comentário');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="hover:bg-blue-700 p-1 rounded transition">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Detalhes da Atividade</h1>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
          >
            {editMode ? 'Cancelar' : 'Editar'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Activity Info */}
        <div className="bg-white rounded-lg shadow p-4">
          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Local"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={formData.activity_date}
                  onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="time"
                  value={formData.activity_time}
                  onChange={(e) => setFormData({ ...formData, activity_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Salvar Alterações
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{activity.title}</h2>
              {activity.location && (
                <p className="text-gray-600 mb-3 flex items-center gap-2">
                  <MapPin size={16} />
                  {activity.location}
                </p>
              )}
              <div className="flex gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {format(parseISO(activity.activity_date), "dd 'de' MMMM", { locale: ptBR })}
                </span>
                {activity.activity_time && (
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {activity.activity_time.substring(0, 5)}
                  </span>
                )}
              </div>
              {activity.completed && (
                <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  Concluída por {activity.completed_by}
                </div>
              )}
            </>
          )}
        </div>

        {/* Photos */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Fotos</h3>
            <div className="flex gap-2">
              {activity.photos && activity.photos.length > 0 && (
                <button
                  onClick={toggleSelectionMode}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    selectionMode
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {selectionMode ? 'Cancelar' : 'Selecionar'}
                </button>
              )}
              {!selectionMode && (
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-blue-700 transition">
                  + Adicionar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Selection Mode Action Bar */}
          {selectionMode && selectedPhotos.length > 0 && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">
                {selectedPhotos.length} foto(s) selecionada(s)
              </span>
              <button
                onClick={handleDeleteSelectedPhotos}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Excluir Selecionadas
              </button>
            </div>
          )}

          {activity.photos && activity.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {activity.photos.map(photo => (
                <div
                  key={photo.id}
                  className="relative group"
                  onClick={() => selectionMode && togglePhotoSelection(photo.id)}
                >
                  <img
                    src={photo.photo_data}
                    alt="Foto da atividade"
                    className={`w-full h-40 object-cover rounded-lg transition ${
                      selectionMode ? 'cursor-pointer' : ''
                    } ${
                      selectedPhotos.includes(photo.id) ? 'ring-4 ring-blue-500' : ''
                    }`}
                  />

                  {/* Selection Checkbox */}
                  {selectionMode && (
                    <div className="absolute top-2 left-2">
                      {selectedPhotos.includes(photo.id) ? (
                        <CheckSquare size={24} className="text-blue-600 bg-white rounded" />
                      ) : (
                        <Square size={24} className="text-gray-400 bg-white rounded" />
                      )}
                    </div>
                  )}

                  {/* Delete Button (only in normal mode) */}
                  {!selectionMode && (
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition text-xs font-medium flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  )}

                  <div className="mt-1 text-xs text-gray-500">
                    Por {photo.uploaded_by}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Nenhuma foto ainda</p>
          )}
        </div>

        {/* Comments - Chat Style */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-4">Comentários</h3>

          {/* Chat Messages */}
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {activity.comments && activity.comments.length > 0 ? (
              activity.comments.map(c => {
                const isMyMessage = c.author === nickname;
                const initials = c.author.substring(0, 2).toUpperCase();

                return (
                  <div
                    key={c.id}
                    className={`flex gap-2 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                      isMyMessage ? 'bg-blue-600' : 'bg-gray-500'
                    }`}>
                      {initials}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex flex-col max-w-[75%] ${isMyMessage ? 'items-end' : 'items-start'}`}>
                      {!isMyMessage && (
                        <span className="text-xs font-semibold text-gray-700 mb-1 px-1">
                          {c.author}
                        </span>
                      )}
                      <div className="relative group">
                        <div className={`rounded-2xl px-4 py-2 ${
                          isMyMessage
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          <p className="text-sm break-words">{c.comment_text}</p>
                        </div>
                        {isMyMessage && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Excluir"
                          >
                            <Trash2 size={14} className="text-red-600 hover:text-red-700" />
                          </button>
                        )}
                      </div>
                      <span className={`text-xs text-gray-400 mt-1 px-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                        {format(parseISO(c.created_at), "HH:mm")}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Nenhum comentário ainda</p>
                <p className="text-xs mt-1">Seja o primeiro a comentar!</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleAddComment}>
            <div className="flex gap-2 items-center border-t pt-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ActivityDetail;
