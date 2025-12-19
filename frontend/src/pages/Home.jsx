import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActivities, createActivity, deleteActivity, toggleActivityComplete } from '../services/api';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar, Clock, CheckCircle, RotateCcw, Trash2, Home as HomeIcon, Image as ImageIcon, Plus, Camera, MessageCircle } from 'lucide-react';

function Home() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    activity_date: '',
    activity_time: ''
  });

  const { nickname, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activities, filter]);

  const loadActivities = async () => {
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  const applyFilter = () => {
    let filtered = [...activities];

    switch (filter) {
      case 'today':
        filtered = filtered.filter(a => isToday(parseISO(a.activity_date)));
        break;
      case 'tomorrow':
        filtered = filtered.filter(a => isTomorrow(parseISO(a.activity_date)));
        break;
      case 'pending':
        filtered = filtered.filter(a => !a.completed);
        break;
      case 'completed':
        filtered = filtered.filter(a => a.completed);
        break;
      default:
        break;
    }

    setFilteredActivities(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createActivity(formData);
      setShowModal(false);
      setFormData({ title: '', location: '', activity_date: '', activity_time: '' });
      loadActivities();
    } catch (error) {
      alert('Erro ao criar atividade');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await toggleActivityComplete(id);
      loadActivities();
    } catch (error) {
      alert('Erro ao atualizar atividade');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta atividade?')) {
      try {
        await deleteActivity(id);
        loadActivities();
      } catch (error) {
        alert('Erro ao excluir atividade');
      }
    }
  };

  const formatDate = (date) => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) return 'Hoje';
    if (isTomorrow(parsedDate)) return 'Amanhã';
    return format(parsedDate, "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Olá, {nickname}!</h1>
            <p className="text-sm text-blue-100">Viagem Aparecida</p>
          </div>
          <button
            onClick={logout}
            className="bg-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="flex overflow-x-auto p-3 gap-2 hide-scrollbar">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'today', label: 'Hoje' },
            { key: 'tomorrow', label: 'Amanhã' },
            { key: 'pending', label: 'Pendentes' },
            { key: 'completed', label: 'Concluídas' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="p-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Nenhuma atividade encontrada</p>
            <p className="text-sm mt-2">Adicione uma nova atividade!</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div
              key={activity.id}
              className={`bg-white rounded-lg shadow p-4 ${
                activity.completed ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => navigate(`/activity/${activity.id}`)}>
                  <h3 className={`font-semibold text-lg ${activity.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {activity.title}
                  </h3>
                  {activity.location && (
                    <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                      <MapPin size={14} />
                      {activity.location}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(activity.activity_date)}
                    </span>
                    {activity.activity_time && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {activity.activity_time.substring(0, 5)}
                      </span>
                    )}
                  </div>

                  {/* Badges de Fotos e Comentários */}
                  {(activity.photo_count > 0 || activity.comment_count > 0) && (
                    <div className="flex items-center gap-2 mt-2">
                      {activity.photo_count > 0 && (
                        <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          <Camera size={12} />
                          {activity.photo_count}
                        </span>
                      )}
                      {activity.comment_count > 0 && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          <MessageCircle size={12} />
                          {activity.comment_count}
                        </span>
                      )}
                    </div>
                  )}

                  {activity.completed && (
                    <p className="text-xs text-green-600 mt-2">
                      Concluída por {activity.completed_by}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-3">
                  <button
                    onClick={() => handleToggleComplete(activity.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                      activity.completed
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {activity.completed ? (
                      <>
                        <RotateCcw size={14} />
                        Desfazer
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        Concluir
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t safe-area-bottom">
        <div className="flex justify-around items-center p-3">
          <button
            onClick={() => navigate('/home')}
            className="flex flex-col items-center text-blue-600 font-medium text-sm gap-1"
          >
            <HomeIcon size={20} />
            <span className="text-xs">Início</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white rounded-full px-6 py-3 shadow-lg font-semibold -mt-2 flex items-center gap-2"
          >
            <Plus size={18} />
            Nova
          </button>
          <button
            onClick={() => navigate('/gallery')}
            className="flex flex-col items-center text-gray-600 font-medium text-sm gap-1"
          >
            <ImageIcon size={20} />
            <span className="text-xs">Galeria</span>
          </button>
        </div>
      </div>

      {/* Modal para criar atividade */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 safe-area-bottom animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">Nova Atividade</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atividade *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="O que vamos fazer?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Onde?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.activity_date}
                    onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formData.activity_time}
                    onChange={(e) => setFormData({ ...formData, activity_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
