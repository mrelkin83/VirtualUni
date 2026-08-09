import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Play,
  ChevronRight,
  Award,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { StudentExam } from '../../../types/student.types';

interface ExamenesSectionProps {
  examenes: StudentExam[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  iniciarExamen: (examenId: number | string) => void;
  verResultados: (examenId: number | string) => void;
}

// Componente de tarjeta de examen
const ExamenCard: React.FC<{
  examen: StudentExam;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  iniciarExamen: (id: number | string) => void;
  verResultados: (id: number | string) => void;
}> = ({ examen, darkMode, card, text, border, iniciarExamen, verResultados }) => {
  const getEstadoInfo = () => {
    switch (examen.estado) {
      case 'pendiente':
        return {
          color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
          icon: <AlertCircle size={20} />,
          text: 'Pendiente'
        };
      case 'en_curso':
        return {
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          icon: <Play size={20} />,
          text: 'En curso'
        };
      case 'finalizado':
        return {
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          icon: <CheckCircle size={20} />,
          text: 'Finalizado'
        };
      case 'calificado':
        return {
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
          icon: <Award size={20} />,
          text: 'Calificado'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
          icon: <FileText size={20} />,
          text: examen.estado
        };
    }
  };

  const estadoInfo = getEstadoInfo();
  const fechaExamen = new Date(examen.fecha);
  const hoy = new Date();
  const esProximo = fechaExamen > hoy && fechaExamen.getTime() - hoy.getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div
      className={`${card} rounded-lg shadow-md p-5 border ${border} hover:shadow-lg transition-shadow ${
        esProximo ? 'border-l-4 border-l-yellow-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-bold ${text} text-lg mb-1`}>{examen.titulo}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{examen.curso}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${estadoInfo.color}`}>
          {estadoInfo.icon}
          {estadoInfo.text}
        </span>
      </div>

      <div className={`grid grid-cols-2 gap-3 mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{examen.fecha}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{examen.duracion}</span>
        </div>
        {examen.preguntas && (
          <div className="flex items-center gap-2">
            <FileText size={16} />
            <span>{examen.preguntas.length} preguntas</span>
          </div>
        )}
        {examen.calificacion !== undefined && (
          <div className="flex items-center gap-2">
            <Award size={16} />
                        <span className="font-semibold text-blue-500">{examen.calificacion}/100</span>
          </div>
        )}
      </div>

      {esProximo && examen.estado === 'pendiente' && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
            <AlertCircle size={14} />
            Próximamente - Prepárate para este examen
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {examen.estado === 'pendiente' && fechaExamen <= hoy && (
          <button
            onClick={() => iniciarExamen(examen.id)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Play size={18} />
            Iniciar examen
          </button>
        )}

        {examen.estado === 'en_curso' && (
          <button
            onClick={() => iniciarExamen(examen.id)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Play size={18} />
            Continuar examen
          </button>
        )}

        {(examen.estado === 'finalizado' || examen.estado === 'calificado') && (
          <button
            onClick={() => verResultados(examen.id)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            <ChevronRight size={18} />
            Ver resultados
          </button>
        )}

        {examen.estado === 'pendiente' && fechaExamen > hoy && (
          <button
            disabled
            className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed ${
              darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
            }`}
          >
            <Clock size={18} />
            Disponible {examen.fecha}
          </button>
        )}
      </div>
    </div>
  );
};

// Componente Principal
export const ExamenesSection: React.FC<ExamenesSectionProps> = ({
  examenes,
  darkMode,
  card,
  text,
  border,
  iniciarExamen,
  verResultados
}) => {
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'en_curso' | 'finalizado' | 'calificado'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Filtrar exámenes
  const examenesFiltrados = examenes.filter(examen => {
    const coincideEstado = filtroEstado === 'todos' || examen.estado === filtroEstado;
    const coincideBusqueda =
      examen.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      examen.curso.toLowerCase().includes(busqueda.toLowerCase());

    return coincideEstado && coincideBusqueda;
  });

  // Exámenes pendientes próximos
  const hoy = new Date();
  const examenesProximos = examenes.filter(e => {
    const fechaExamen = new Date(e.fecha);
    return e.estado === 'pendiente' && fechaExamen > hoy && fechaExamen.getTime() - hoy.getTime() < 7 * 24 * 60 * 60 * 1000;
  });

  // Exámenes en curso
  const examenesEnCurso = examenes.filter(e => e.estado === 'en_curso');

  // Estadísticas
  const stats = {
    total: examenes.length,
    pendientes: examenes.filter(e => e.estado === 'pendiente').length,
    finalizados: examenes.filter(e => e.estado === 'finalizado' || e.estado === 'calificado').length,
    promedio: examenes
      .filter(e => e.calificacion !== undefined)
      .reduce((acc, e) => acc + (e.calificacion || 0), 0) / examenes.filter(e => e.calificacion !== undefined).length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className={`text-2xl font-bold ${text}`}>Mis Exámenes</h2>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <FileText className="text-blue-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Exámenes</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.total}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <AlertCircle className="text-yellow-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pendientes</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.pendientes}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <CheckCircle className="text-green-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Finalizados</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.finalizados}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border ${border}`}>
          <TrendingUp className="text-purple-500 mb-2" size={32} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Promedio</p>
          <p className={`text-2xl font-bold ${text}`}>{stats.promedio.toFixed(1)}</p>
        </div>
      </div>

      {/* Alerta de exámenes en curso */}
      {examenesEnCurso.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Play className="text-blue-500" size={24} />
            <div className="flex-1">
              <h3 className={`font-bold ${text}`}>
                Tienes {examenesEnCurso.length} examen{examenesEnCurso.length > 1 ? 'es' : ''} en curso
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Continúa donde lo dejaste
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de exámenes próximos */}
      {examenesProximos.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-500" size={24} />
            <div className="flex-1">
              <h3 className={`font-bold ${text}`}>
                {examenesProximos.length} examen{examenesProximos.length > 1 ? 'es' : ''} próximo{examenesProximos.length > 1 ? 's' : ''}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                En los próximos 7 días - Prepárate adecuadamente
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
              placeholder="Buscar exámenes..."
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
            <option value="pendiente">Pendientes</option>
            <option value="en_curso">En curso</option>
            <option value="finalizado">Finalizados</option>
            <option value="calificado">Calificados</option>
          </select>
        </div>
      </div>

      {/* Lista de exámenes */}
      {examenesFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {examenesFiltrados.map(examen => (
            <ExamenCard
              key={examen.id}
              examen={examen}
              darkMode={darkMode}
              card={card}
              text={text}
              border={border}
              iniciarExamen={iniciarExamen}
              verResultados={verResultados}
            />
          ))}
        </div>
      ) : (
        <div className={`${card} rounded-lg shadow p-12 text-center border ${border}`}>
          <FileText size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`${text} font-bold mb-2`}>No se encontraron exámenes</p>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};
