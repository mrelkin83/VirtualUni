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
  unirseClase: (claseId: string | number) => void;
  verGrabacion: (claseId: string | number) => void;
}

// Componente de tarjeta de clase
const ClaseCard: React.FC<{
  clase: Clase;
  unirseClase: (id: string | number) => void;
  verGrabacion: (id: string | number) => void;
}> = ({ clase, unirseClase, verGrabacion }) => {
  const getEstadoColor = () => {
    switch (clase.estado) {
      case 'en_curso':
        return 'bg-pn-danger-soft text-pn-danger';
      case 'programada':
        return 'bg-pn-accent-soft text-pn-accent-text';
      case 'finalizada':
        return 'bg-pn-surface-3 text-pn-ink-2';
      case 'disponible':
        return 'bg-pn-ok-soft text-pn-ok';
      default:
        return 'bg-pn-surface-3 text-pn-ink-2';
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
      <CircleDot className={clase.estado === 'en_curso' ? 'text-pn-danger animate-pulse' : ''} size={20} />
    ) : (
      <Play className="text-pn-ok" size={20} />
    );
  };

  return (
    <div className={`bg-pn-surface rounded-lg shadow-md p-5 border border-pn-line hover:shadow-lg transition-shadow`}>
      <div className="flex flex-wrap items-start justify-between mb-3 gap-4">
        <div className="flex items-center gap-3">
          {getTipoIcon()}
          <div>
            <h3 className={`font-bold text-pn-ink text-lg`}>{clase.titulo}</h3>
            <p className={`text-sm text-pn-ink-2`}>{clase.curso}</p>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getEstadoColor()}`}>
          {getEstadoTexto()}
        </span>
      </div>

      <p className={`text-sm text-pn-ink-2 mb-4 line-clamp-2`}>
        {clase.descripcion}
      </p>

      <div className={`grid grid-cols-2 gap-3 mb-4 text-sm text-pn-ink-2`}>
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
          <p className={`text-xs font-semibold text-pn-ink mb-2`}>Materiales adjuntos:</p>
          <div className="flex flex-wrap gap-2">
            {clase.materialesAdjuntos.map((material, idx) => (
              <button
                key={idx}
                className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded border border-pn-line ${
                  'hover:bg-pn-surface-3'
                } transition`}
              >
                <FileText size={12} />
                {material}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {clase.estado === 'en_curso' && (
          <button
            onClick={() => unirseClase(clase.id)}
            className="flex-1 bg-pn-danger hover:bg-pn-danger text-pn-surface px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Video size={18} />
            Unirse ahora
          </button>
        )}

        {clase.estado === 'programada' && clase.enlace && (
          <button
            onClick={() => unirseClase(clase.id)}
            className="flex-1 bg-pn-accent hover:bg-pn-accent text-pn-accent-ink px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <ExternalLink size={18} />
            Ver detalles
          </button>
        )}

        {(clase.estado === 'disponible' || clase.estado === 'finalizada') && clase.grabacionUrl && (
          <button
            onClick={() => verGrabacion(clase.id)}
            className="flex-1 bg-pn-ok hover:bg-pn-ok text-pn-surface px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <Play size={18} />
            Ver grabación
          </button>
        )}

        {clase.materialesAdjuntos && clase.materialesAdjuntos.length > 0 && (
          <button
            className={`px-4 py-2 rounded-lg border border-pn-line ${
              'hover:bg-pn-surface-3'
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
        <h2 className={`text-2xl font-bold text-pn-ink`}>Mis Clases</h2>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroTipo('todas')}
            className={`px-4 py-2 rounded-lg transition ${
              filtroTipo === 'todas'
                ? 'bg-pn-accent text-pn-accent-ink'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroTipo('en_vivo')}
            className={`px-4 py-2 rounded-lg transition ${
              filtroTipo === 'en_vivo'
                ? 'bg-pn-accent text-pn-accent-ink'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
            }`}
          >
            En Vivo
          </button>
          <button
            onClick={() => setFiltroTipo('grabada')}
            className={`px-4 py-2 rounded-lg transition ${
              filtroTipo === 'grabada'
                ? 'bg-pn-accent text-pn-accent-ink'
                : 'bg-pn-surface-3 text-pn-ink-2 hover:bg-pn-line'
            }`}
          >
            Grabadas
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Video className="text-pn-accent-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Total Clases</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.total}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <CircleDot className="text-pn-danger mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>En Vivo</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.enVivo}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Play className="text-pn-ok mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>Grabadas</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.grabadas}</p>
        </div>
        <div className={`bg-pn-surface rounded-lg shadow p-4 border border-pn-line`}>
          <Users className="text-pn-accent-2-text mb-2" size={32} />
          <p className={`text-sm text-pn-ink-2`}>En Curso Ahora</p>
          <p className={`text-2xl font-bold text-pn-ink`}>{stats.enCurso}</p>
        </div>
      </div>

      {/* Alerta de clases en curso */}
      {clasesEnCurso.length > 0 && (
        <div className="bg-pn-danger-soft border border-pn-danger rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CircleDot className="text-pn-danger animate-pulse" size={24} />
            <div className="flex-1">
              <h3 className={`font-bold text-pn-ink`}>
                {clasesEnCurso.length} clase{clasesEnCurso.length > 1 ? 's' : ''} en vivo ahora
              </h3>
              <p className={`text-sm text-pn-ink-2`}>
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted" size={20} />
            <input
              type="text"
              placeholder="Buscar clases..."
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
              unirseClase={unirseClase}
              verGrabacion={verGrabacion}
            />
          ))}
        </div>
      ) : (
        <div className={`bg-pn-surface rounded-lg shadow p-12 text-center border border-pn-line`}>
          <Video size={64} className={`mx-auto mb-4 text-pn-muted`} />
          <p className={`text-pn-ink font-bold mb-2`}>No se encontraron clases</p>
          <p className={'text-pn-ink-2'}>
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};
