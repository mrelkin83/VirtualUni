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
  iniciarExamen: (examenId: number | string) => void;
  verResultados: (examenId: number | string) => void;
}

// Componente de tarjeta de examen
const ExamenCard: React.FC<{
  examen: StudentExam;
  iniciarExamen: (id: number | string) => void;
  verResultados: (id: number | string) => void;
}> = ({ examen, iniciarExamen, verResultados }) => {
  const getEstadoInfo = () => {
    switch (examen.estado) {
      case 'pendiente':
        return {
          color: 'bg-pn-warn-soft text-pn-warn',
          icon: <AlertCircle size={20} />,
          text: 'Pendiente'
        };
      case 'en_curso':
        return {
          color: 'bg-pn-accent-soft text-pn-accent-text',
          icon: <Play size={20} />,
          text: 'En curso'
        };
      case 'finalizado':
        return {
          color: 'bg-pn-ok-soft text-pn-ok',
          icon: <CheckCircle size={20} />,
          text: 'Finalizado'
        };
      case 'calificado':
        return {
          color: 'bg-pn-accent-2-soft text-pn-accent-2-text',
          icon: <Award size={20} />,
          text: 'Calificado'
        };
      default:
        return {
          color: 'bg-pn-surface-3 text-pn-ink-2',
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
      className={`bg-pn-surface rounded-lg shadow-md p-5 border border-pn-line hover:shadow-lg transition-shadow ${
        esProximo ? 'border-l-4 border-l-yellow-500' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between mb-3 gap-4">
        <div className="flex-1">
          <h3 className={`font-bold text-pn-ink text-lg mb-1`}>{examen.titulo}</h3>
          <p className={`text-sm text-pn-ink-2`}>{examen.curso}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${estadoInfo.color}`}>
          {estadoInfo.icon}
          {estadoInfo.text}
        </span>
      </div>

      <div className={`grid grid-cols-2 gap-3 mb-4 text-sm text-pn-ink-2`}>
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
                        <span className="font-semibold text-pn-accent-text">{examen.calificacion}/100</span>
          </div>
        )}
      </div>

      {esProximo && examen.estado === 'pendiente' && (
        <div className="mb-4 bg-pn-warn-soft border border-pn-warn rounded p-2">
          <p className="text-xs text-pn-warn flex items-center gap-1">
            <AlertCircle size={14} />
            Próximamente - Prepárate para este examen
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {examen.estado === 'pendiente' && fechaExamen <= hoy && (
          <button
            onClick={() => iniciarExamen(examen.id)}
            className="flex-1 bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Play size={18} />
            Iniciar examen
          </button>
        )}

        {examen.estado === 'en_curso' && (
          <button
            onClick={() => iniciarExamen(examen.id)}
            className="flex-1 bg-pn-ok hover:bg-pn-ok text-pn-surface px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Play size={18} />
            Continuar examen
          </button>
        )}

        {(examen.estado === 'finalizado' || examen.estado === 'calificado') && (
          <button
            onClick={() => verResultados(examen.id)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition bg-pn-surface-3 hover:bg-pn-line text-pn-ink`}
          >
            <ChevronRight size={18} />
            Ver resultados
          </button>
        )}

        {examen.estado === 'pendiente' && fechaExamen > hoy && (
          <button
            disabled
            className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed ${
              'bg-pn-surface-3 text-pn-muted'
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
        <h2 className={`text-2xl font-bold text-pn-ink`}>Mis Exámenes</h2>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <FileText className="text-pn-accent-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Total Exámenes</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.total}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <AlertCircle className="text-pn-warn mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Pendientes</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.pendientes}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <CheckCircle className="text-pn-ok mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Finalizados</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.finalizados}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <TrendingUp className="text-pn-accent-2-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Promedio</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.promedio.toFixed(1)}</p>
        </div>
      </div>

      {/* Alerta de exámenes en curso */}
      {examenesEnCurso.length > 0 && (
        <div className="bg-pn-accent-soft border border-pn-accent-line rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Play className="text-pn-accent-text" size={24} />
            <div className="flex-1">
              <h3 className={`font-bold text-pn-ink`}>
                Tienes {examenesEnCurso.length} examen{examenesEnCurso.length > 1 ? 'es' : ''} en curso
              </h3>
              <p className={`text-sm text-pn-ink-2`}>
                Continúa donde lo dejaste
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de exámenes próximos */}
      {examenesProximos.length > 0 && (
        <div className="bg-pn-warn-soft border border-pn-warn rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-pn-warn" size={24} />
            <div className="flex-1">
              <h3 className={`font-bold text-pn-ink`}>
                {examenesProximos.length} examen{examenesProximos.length > 1 ? 'es' : ''} próximo{examenesProximos.length > 1 ? 's' : ''}
              </h3>
              <p className={`text-sm text-pn-ink-2`}>
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted" size={20} />
            <input
              type="text"
              placeholder="Buscar exámenes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border border-pn-line ${
                'bg-pn-surface text-pn-ink'
              } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className={'text-pn-ink-2'} />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            className={`px-4 py-2 rounded-lg border border-pn-line ${
              'bg-pn-surface text-pn-ink'
            } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
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
              iniciarExamen={iniciarExamen}
              verResultados={verResultados}
            />
          ))}
        </div>
      ) : (
        <div className={`bg-pn-surface rounded-lg shadow p-12 text-center border border-pn-line`}>
          <FileText size={64} className={`mx-auto mb-4 text-pn-muted`} />
          <p className={`text-pn-ink font-bold mb-2`}>No se encontraron exámenes</p>
          <p className={'text-pn-ink-2'}>
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};
