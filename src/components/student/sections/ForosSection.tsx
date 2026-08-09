import React, { useState, useMemo } from 'react';
import { MessageSquare, Search, Filter, Plus, Eye, MessageCircle, Star, ThumbsUp, Clock, User, X } from 'lucide-react';
import { ForumTopic, ForumReply } from '../../../types/student.types';

interface ForosSectionProps {
  topicos: ForumTopic[];
  respuestas: ForumReply[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  crearTopico: (titulo: string, descripcion: string, categoria: string, curso: string) => void;
  crearRespuesta: (topicoId: string | number, contenido: string) => void;
}

// Componente de Búsqueda
const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  darkMode: boolean;
  border: string;
}> = ({ value, onChange, darkMode, border }) => (
  <div className="relative">
    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
    <input
      type="text"
      placeholder="Buscar temas en los foros..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full pl-10 pr-4 py-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
    />
  </div>
);

// Componente de Tarjeta de Tópico
const TopicCard: React.FC<{
  topico: ForumTopic;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  onClick: () => void;
}> = ({ topico, darkMode, card, text, border, onClick }) => {
  const getEstadoBadge = () => {
    switch (topico.estado) {
      case 'destacado':
        return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full"><Star size={12} />Destacado</span>;
      case 'cerrado':
        return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Cerrado</span>;
      default:
        return null;
    }
  };

  const getCategoriaColor = () => {
    const colors = {
      general: 'bg-blue-100 text-blue-700',
      academico: 'bg-green-100 text-green-700',
      dudas: 'bg-orange-100 text-orange-700',
      proyectos: 'bg-purple-100 text-purple-700'
    };
    return colors[topico.categoria] || colors.general;
  };

  return (
    <div
      onClick={onClick}
      className={`${card} rounded-lg shadow p-4 border ${border} hover:shadow-lg transition cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-bold ${text} text-lg`}>{topico.titulo}</h3>
            {getEstadoBadge()}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
            {topico.descripcion}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${getCategoriaColor()}`}>
          {topico.categoria}
        </span>
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          {topico.curso}
        </span>
      </div>

      <div className={`flex items-center justify-between pt-3 border-t ${border}`}>
        <div className="flex items-center gap-4 text-sm">
          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <User size={14} />
            {topico.autor}
          </span>
          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <MessageCircle size={14} />
            {topico.respuestas}
          </span>
          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Eye size={14} />
            {topico.vistas}
          </span>
        </div>
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          <Clock size={12} className="inline mr-1" />
          {new Date(topico.ultimaActividad).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

// Componente de Respuesta
const ReplyCard: React.FC<{
  respuesta: ForumReply;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}> = ({ respuesta, darkMode, card, text, border }) => (
  <div className={`${card} rounded-lg shadow p-4 border ${border} ${respuesta.esRespuestaProfesor ? 'border-l-4 border-green-500' : ''}`}>
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
        <User size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`font-semibold ${text}`}>{respuesta.autor}</span>
          {respuesta.esRespuestaProfesor && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Profesor</span>
          )}
          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {new Date(respuesta.fecha).toLocaleString()}
          </span>
        </div>
        <p className={`${text} mb-3`}>{respuesta.contenido}</p>
        <button className={`flex items-center gap-1 text-sm ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>
          <ThumbsUp size={14} />
          {respuesta.likes}
        </button>
      </div>
    </div>
  </div>
);

// Componente Principal
export const ForosSection: React.FC<ForosSectionProps> = ({
  topicos,
  respuestas,
  darkMode,
  card,
  text,
  border,
  crearTopico,
  crearRespuesta
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [topicoSeleccionado, setTopicoSeleccionado] = useState<ForumTopic | null>(null);
  const [modalNuevoTopico, setModalNuevoTopico] = useState(false);
  const [nuevoTopico, setNuevoTopico] = useState({ titulo: '', descripcion: '', categoria: 'general', curso: '' });
  const [nuevaRespuesta, setNuevaRespuesta] = useState('');

  const categorias = ['todas', 'general', 'academico', 'dudas', 'proyectos'];

  // Filtrar tópicos
  const topicosFiltrados = useMemo(() => {
    return topicos.filter(topico => {
      const matchSearch = topico.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topico.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria = categoriaFiltro === 'todas' || topico.categoria === categoriaFiltro;
      return matchSearch && matchCategoria;
    });
  }, [topicos, searchTerm, categoriaFiltro]);

  // Obtener respuestas del tópico seleccionado
  const respuestasTopico = useMemo(() => {
    if (!topicoSeleccionado) return [];
    return respuestas.filter(r => r.topicoId === topicoSeleccionado.id);
  }, [topicoSeleccionado, respuestas]);

  const handleCrearTopico = () => {
    if (!nuevoTopico.titulo || !nuevoTopico.descripcion) {
      alert('Por favor completa todos los campos');
      return;
    }
    crearTopico(nuevoTopico.titulo, nuevoTopico.descripcion, nuevoTopico.categoria, nuevoTopico.curso);
    setModalNuevoTopico(false);
    setNuevoTopico({ titulo: '', descripcion: '', categoria: 'general', curso: '' });
  };

  const handleCrearRespuesta = () => {
    if (!nuevaRespuesta.trim() || !topicoSeleccionado) return;
    crearRespuesta(topicoSeleccionado.id, nuevaRespuesta);
    setNuevaRespuesta('');
  };

  // Vista de detalle del tópico
  if (topicoSeleccionado) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setTopicoSeleccionado(null)}
            className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
          >
            ← Volver a los foros
          </button>
        </div>

        {/* Tópico Principal */}
        <div className={`${card} rounded-lg shadow p-6 border ${border}`}>
          <div className="flex items-start gap-2 mb-4">
            <h2 className={`text-2xl font-bold ${text} flex-1`}>{topicoSeleccionado.titulo}</h2>
            {topicoSeleccionado.estado === 'destacado' && (
              <Star className="text-yellow-500" size={24} />
            )}
          </div>
          <p className={`${text} mb-4`}>{topicoSeleccionado.descripcion}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Por {topicoSeleccionado.autor}
            </span>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {new Date(topicoSeleccionado.fechaCreacion).toLocaleString()}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {topicoSeleccionado.curso}
            </span>
          </div>
        </div>

        {/* Respuestas */}
        <div className="space-y-4">
          <h3 className={`text-lg font-bold ${text}`}>Respuestas ({respuestasTopico.length})</h3>
          {respuestasTopico.map(respuesta => (
            <ReplyCard
              key={respuesta.id}
              respuesta={respuesta}
              darkMode={darkMode}
              card={card}
              text={text}
              border={border}
            />
          ))}
        </div>

        {/* Formulario de Nueva Respuesta */}
        {topicoSeleccionado.estado !== 'cerrado' && (
          <div className={`${card} rounded-lg shadow p-6 border ${border}`}>
            <h3 className={`text-lg font-bold ${text} mb-4`}>Agregar Respuesta</h3>
            <textarea
              value={nuevaRespuesta}
              onChange={(e) => setNuevaRespuesta(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className={`w-full p-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
              rows={4}
            />
            <button
              onClick={handleCrearRespuesta}
              className="mt-3 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Publicar Respuesta
            </button>
          </div>
        )}
      </div>
    );
  }

  // Vista de lista de tópicos
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${text}`}>Foros de Discusión</h2>
        <button
          onClick={() => setModalNuevoTopico(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
          Nuevo Tema
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <MessageSquare className="text-blue-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Temas</p>
          <p className={`text-2xl font-bold ${text}`}>{topicos.length}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <MessageCircle className="text-green-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Respuestas</p>
          <p className={`text-2xl font-bold ${text}`}>{respuestas.length}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Star className="text-yellow-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Temas Destacados</p>
          <p className={`text-2xl font-bold ${text}`}>{topicos.filter(t => t.estado === 'destacado').length}</p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="space-y-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} darkMode={darkMode} border={border} />
        <div className="flex items-center gap-2">
          <Filter size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          <div className="flex flex-wrap gap-2">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className={`px-4 py-2 rounded-lg transition capitalize ${
                  categoriaFiltro === cat
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Tópicos */}
      <div className="space-y-4">
        {topicosFiltrados.map(topico => (
          <TopicCard
            key={topico.id}
            topico={topico}
            darkMode={darkMode}
            card={card}
            text={text}
            border={border}
            onClick={() => setTopicoSeleccionado(topico)}
          />
        ))}
        {topicosFiltrados.length === 0 && (
          <div className={`${card} rounded-lg shadow p-12 text-center border ${border}`}>
            <MessageSquare size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`${text} font-bold mb-2`}>No se encontraron temas</p>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Intenta con otros términos de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Modal Nuevo Tópico */}
      {modalNuevoTopico && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg max-w-2xl w-full p-6`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${text}`}>Crear Nuevo Tema</h3>
              <button onClick={() => setModalNuevoTopico(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Título</label>
                <input
                  type="text"
                  value={nuevoTopico.titulo}
                  onChange={(e) => setNuevoTopico({ ...nuevoTopico, titulo: e.target.value })}
                  className={`w-full p-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Título del tema..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${text} mb-2`}>Descripción</label>
                <textarea
                  value={nuevoTopico.descripcion}
                  onChange={(e) => setNuevoTopico({ ...nuevoTopico, descripcion: e.target.value })}
                  className={`w-full p-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  rows={4}
                  placeholder="Describe tu tema..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Categoría</label>
                  <select
                    value={nuevoTopico.categoria}
                    onChange={(e) => setNuevoTopico({ ...nuevoTopico, categoria: e.target.value })}
                    className={`w-full p-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  >
                    <option value="general">General</option>
                    <option value="academico">Académico</option>
                    <option value="dudas">Dudas</option>
                    <option value="proyectos">Proyectos</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${text} mb-2`}>Curso</label>
                  <input
                    type="text"
                    value={nuevoTopico.curso}
                    onChange={(e) => setNuevoTopico({ ...nuevoTopico, curso: e.target.value })}
                    className={`w-full p-3 border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    placeholder="Nombre del curso..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCrearTopico}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  Crear Tema
                </button>
                <button
                  onClick={() => setModalNuevoTopico(false)}
                  className={`px-6 py-3 border ${border} rounded-lg hover:bg-gray-100 transition ${text}`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
