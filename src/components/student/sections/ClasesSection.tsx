import React, { useState } from 'react';
import {
  Video,
  Play,
  Calendar,
  Clock,
  Users,
  Download,
  FileText,
  ExternalLink,
  CircleDot,
  Filter,
  Search
} from 'lucide-react';
import { Clase } from '../../../types/student.types';

interface ClasesSectionProps {
  clases: Clase[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  unirseClase: (claseId: string | number) => void;
  verGrabacion: (claseId: string | number) => void;
}

// Componente de tarjeta de clase
const ClaseCard: React.FC<{
  clase: Clase;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  unirseClase: (id: string | number) => void;
  verGrabacion: (id: string | number) => void;
}> = ({ clase, darkMode, card, text, border, unirseClase, verGrabacion }) => {
  const getEstadoColor = () => {
    switch (clase.estado) {
      case 'en_curso':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'programada':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'finalizada':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      case 'disponible':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoTexto = () => {
    switch (clase.estado) {
      case 'en_curso':
        return 'En vivo ahora';
      case 'programada':
        return 'Programada';
      case 'finalizada':
        return 'Finalizada';
      case 'disponible':
        return 'Grabación disponible';
      default:
        return clase.estado;
    }
  };

  const getTipoIcon = () => {
    return clase.tipo === 'en_vivo' ? (
      <CircleDot className={clase.estado === 'en_curso' ? 'text-red-500 animate-pulse' : ''} size={20} />
    ) : (
      <Play className="text-green-500" size={20} />
    );
  };

  return (
    <div className={`${card} rounded-lg shadow-md p-5 border ${border} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {getTipoIcon()}
          <div>
            <h3 className={`font-bold ${text} text-lg`}>{clase.titulo}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{clase.curso}</p>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getEstadoColor()}`}>
          {getEstadoTexto()}
        </span>
      </div>

      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 line-clamp-2`}>
        {clase.descripcion}
      </p>

      <div className={`grid grid-cols-2 gap-3 mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>{clase.profesor}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{clase.duracion}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{clase.fecha}</span>
        </div>
        {clase.asistentes !== undefined && (
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>{clase.asistentes} asistentes</span>
          </div>
        )}
      </div>

      {clase.materialesAdjuntos && clase.materialesAdjuntos.length > 0 && (
        <div className="mb-4">
          <p className={`text-xs font-semibold ${text} mb-2`}>Materiales adjuntos:</p>
          <div className="flex flex-wrap gap-2">
            {clase.materialesAdjuntos.map((material, idx) => (
              <button
                key={idx}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${border} ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } transition`}
              >
                <FileText size={12} />
                {material}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {clase.estado === 'en_curso' && (
          <button
            onClick={() => unirseClase(clase.id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Video size={18} />
            Unirse ahora
          </button>
        )}

        {clase.estado === 'programada' && clase.enlace && (
          <button
            onClick={() => unirseClase(clase.id)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <ExternalLink size={18} />
            Ver detalles
          </button>
        )}

        {(clase.estado === 'disponible' || clase.estado === 'finalizada') && clase.grabacionUrl && (
          <button
            onClick={() => verGrabacion(clase.id)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Play size={18} />
            Ver grabación
          </button>
        )}

        {clase.materialesAdjuntos && clase.materialesAdjuntos.length > 0 && (
          <button
            className={`px-4 py-2 rounded-lg border ${border} ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            } transition flex items-center gap-2`}
          >
            <Download size={18} />
            Descargar
          </button>
        )}
      </div>
    </div>
  );
};

// Componente Principal
export const ClasesSection: React.FC<ClasesSectionProps> = ({
  clases,
  darkMode,
  card,
  text,
  border,
  unirseClase,
  verGrabacion
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'en_vivo' | 'grabada'>('todas');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'programada' | 'en_curso' | 'disponible' | 'finalizada'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Filtrar clases
  const clasesFiltradas = clases.filter(clase => {
    const coincideTipo = filtroTipo === 'todas' || clase.tipo === filtroTipo;
    const coincideEstado = filtroEstado === 'todos' || clase.estado === filtroEstado;
    const coincideBusqueda =
      clase.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      clase.curso.toLowerCase().includes(busqueda.toLowerCase()) ||
      clase.profesor.toLowerCase().includes(busqueda.toLowerCase());

    return coincideTipo && coincideEstado && coincideBusqueda;
  });

  // Separar clases por tipo
  const clasesEnVivo = clasesFiltradas.filter(c => c.tipo === 'en_vivo');
  const clasesGrabadas = clasesFiltradas.filter(c => c.tipo === 'grabada');

  // Clases en curso
  const clasesEnCurso = clases.filter(c => c.estado === 'en_curso');

  // Estadísticas
  const stats = {
    total: clases.length,
    enVivo: clases.filter(c => c.tipo === 'en_vivo').length,
    grabadas: clases.filter(c => c.tipo === 'grabada').length,
    enCurso: clasesEnCurso.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className={`text-2xl font-bold ${text}`}>Mis Clases</h2>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroTipo('todas')}
            className={`px-4 py-2 rounded-lg transition ${
              filtroTipo === 'todas'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroTipo('en_vivo')}
            className={`px-4 py-2 rounded-lg transition ${
              filtroTipo === 'en_vivo'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            En Vivo
          </button>
          <button
            onClick={() => setFiltroTipo('grabada')}
            className={`px-4 py-2 rounded-lg transition ${
              filtroTipo === 'grabada'
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grabadas
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Video className="text-blue-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Clases</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.total}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <CircleDot className="text-red-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>En Vivo</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.enVivo}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Play className="text-green-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Grabadas</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.grabadas}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <Users className="text-purple-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>En Curso Ahora</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.enCurso}</p>
        </div>
      </div>

      {/* Alerta de clases en curso */}
      {clasesEnCurso.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CircleDot className="text-red-500 animate-pulse" size={24} />
            <div className="flex-1">
              <h3 className={`font-bold ${text}`}>
                {clasesEnCurso.length} clase{clasesEnCurso.length > 1 ? 's' : ''} en vivo ahora
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Haz clic para unirte a la clase
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar clases..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${border} ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            className={`px-4 py-2 rounded-lg border ${border} ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="todos">Todos los estados</option>
            <option value="en_curso">En curso</option>
            <option value="programada">Programadas</option>
            <option value="disponible">Grabaciones disponibles</option>
            <option value="finalizada">Finalizadas</option>
          </select>
        </div>
      </div>

      {/* Lista de clases */}
      {clasesFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clasesFiltradas.map(clase => (
            <ClaseCard
              key={clase.id}
              clase={clase}
              darkMode={darkMode}
              card={card}
              text={text}
              border={border}
              unirseClase={unirseClase}
              verGrabacion={verGrabacion}
            />
          ))}
        </div>
      ) : (
        <div className={`${card} rounded-lg shadow p-12 text-center border ${border}`}>
          <Video size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`${text} font-bold mb-2`}>No se encontraron clases</p>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};
