import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  MessageSquare,
  Eye,
  Download,
  Users,
  Award,
  FileText
} from 'lucide-react';

interface EstudiantesSectionProps {
  estudiantes: any[];
  setEstudianteDetalle: (est: any) => void;
  verPerfilEstudiante: (id: number) => void;
  enviarMensajeEstudiante: (id: number) => void;
  exportarDatosEstudiante: (id: number) => void;
}

export const EstudiantesSection: React.FC<EstudiantesSectionProps> = ({
  estudiantes,
  verPerfilEstudiante,
  enviarMensajeEstudiante,
  exportarDatosEstudiante,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState('todos');
  const [ordenamiento, setOrdenamiento] = useState<'nombre' | 'progreso' | 'calificacion'>('nombre');

  // Obtener lista única de cursos
  const cursosUnicos = useMemo(() => {
    const cursos = [...new Set(estudiantes.map(e => e.curso))];
    return cursos.sort();
  }, [estudiantes]);

  // Filtrar y ordenar estudiantes
  const estudiantesFiltrados = useMemo(() => {
    let resultado = estudiantes.filter(estudiante => {
      const matchBusqueda =
        estudiante.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        estudiante.email.toLowerCase().includes(busqueda.toLowerCase());

      const matchCurso = cursoFiltro === 'todos' || estudiante.curso === cursoFiltro;

      return matchBusqueda && matchCurso;
    });

    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'progreso':
          return b.progreso - a.progreso;
        case 'calificacion':
          return b.calificacionActual - a.calificacionActual;
        default:
          return 0;
      }
    });

    return resultado;
  }, [estudiantes, busqueda, cursoFiltro, ordenamiento]);

  // Estadísticas generales
  const estadisticas = useMemo(() => {
    return {
      total: estudiantesFiltrados.length,
      promedioGeneral: estudiantesFiltrados.reduce((sum, e) => sum + e.calificacionActual, 0) / estudiantesFiltrados.length || 0,
      progresoPromedio: estudiantesFiltrados.reduce((sum, e) => sum + e.progreso, 0) / estudiantesFiltrados.length || 0,
      conTareasPendientes: estudiantesFiltrados.filter(e => e.tareasPendientes > 0).length,
    };
  }, [estudiantesFiltrados]);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className={`text-2xl font-bold text-pn-ink`}>Mis Estudiantes</h2>
          <p className={`text-sm text-pn-ink-2 mt-1`}>
            Gestiona y da seguimiento al progreso de tus estudiantes
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pn-accent-soft rounded-lg">
              <Users className="text-pn-accent-text" size={24} />
            </div>
            <div>
              <p className={`text-2xl font-bold text-pn-ink`}>{estadisticas.total}</p>
              <p className={`text-xs text-pn-ink-2`}>
                Total Estudiantes
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pn-ok-soft rounded-lg">
              <Award className="text-pn-ok" size={24} />
            </div>
            <div>
              <p className={`text-2xl font-bold text-pn-ink`}>{estadisticas.promedioGeneral.toFixed(1)}</p>
              <p className={`text-xs text-pn-ink-2`}>
                Promedio General
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pn-accent-2-soft rounded-lg">
              <TrendingUp className="text-pn-accent-2-text" size={24} />
            </div>
            <div>
              <p className={`text-2xl font-bold text-pn-ink`}>{estadisticas.progresoPromedio.toFixed(0)}%</p>
              <p className={`text-xs text-pn-ink-2`}>
                Progreso Promedio
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pn-warn-soft rounded-lg">
              <FileText className="text-pn-warn" size={24} />
            </div>
            <div>
              <p className={`text-2xl font-bold text-pn-ink`}>{estadisticas.conTareasPendientes}</p>
              <p className={`text-xs text-pn-ink-2`}>
                Con Tareas Pendientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
        <div className="flex gap-4 flex-wrap">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted`}
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border-pn-line border bg-pn-surface text-pn-ink focus:outline-none focus:ring-2 focus:ring-pn-accent`}
              />
            </div>
          </div>

          {/* Filtro por curso */}
          <div className="flex items-center gap-2">
            <Filter size={20} className={'text-pn-ink-2'} />
            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              className={`px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink focus:outline-none focus:ring-2 focus:ring-pn-accent`}
            >
              <option value="todos">Todos los cursos</option>
              {cursosUnicos.map(curso => (
                <option key={curso} value={curso}>{curso}</option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value as any)}
              className={`px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink focus:outline-none focus:ring-2 focus:ring-pn-accent`}
            >
              <option value="nombre">Ordenar por Nombre</option>
              <option value="progreso">Ordenar por Progreso</option>
              <option value="calificacion">Ordenar por Calificación</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de estudiantes */}
      <div className="grid grid-cols-1 gap-4">
        {estudiantesFiltrados.length === 0 ? (
          <div className={`bg-pn-surface rounded-lg shadow p-12 text-center`}>
            <Users size={64} className={`mx-auto mb-4 text-pn-muted`} />
            <p className={`text-lg text-pn-muted`}>
              No se encontraron estudiantes
            </p>
            <p className={`text-sm text-pn-muted mt-2`}>
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          estudiantesFiltrados.map((estudiante) => (
            <div
              key={estudiante.id}
              className={`bg-pn-surface rounded-lg shadow p-4 hover:shadow-lg transition`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pn-accent to-pn-accent-hover rounded-full flex items-center justify-center text-pn-accent-ink font-bold text-lg">
                    {estudiante.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-pn-ink`}>{estudiante.nombre}</h3>
                    <p className={`text-sm text-pn-ink-2`}>
                      {estudiante.email}
                    </p>
                    <p className={`text-xs text-pn-muted`}>
                      {estudiante.curso}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-pn-muted mb-1">Progreso</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-pn-surface-3 rounded-full h-2">
                        <div
                          className="bg-pn-accent h-2 rounded-full transition-all"
                          style={{ width: `${estudiante.progreso}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold text-pn-ink`}>
                        {estudiante.progreso}%
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-pn-muted mb-1">Calificación</p>
                    <p className={`text-xl font-bold text-pn-ink`}>
                      {estudiante.calificacionActual.toFixed(1)}/10
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-pn-muted mb-1">Pendientes</p>
                    <p
                      className={`text-xl font-bold ${
                        estudiante.tareasPendientes > 0 ? 'text-pn-warn' : 'text-pn-ok'
                      }`}
                    >
                      {estudiante.tareasPendientes}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-pn-muted mb-1">Última actividad</p>
                    <p className={`text-sm font-semibold text-pn-ink`}>
                      {estudiante.ultimaActividad}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => verPerfilEstudiante(estudiante.id)}
                      className="p-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
                      title="Ver perfil completo"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => enviarMensajeEstudiante(estudiante.id)}
                      className={`p-2 border-pn-line border rounded-lg hover:bg-pn-surface-3 transition text-pn-ink`}
                      title="Enviar mensaje"
                    >
                      <MessageSquare size={18} />
                    </button>
                    <button
                      onClick={() => exportarDatosEstudiante(estudiante.id)}
                      className={`p-2 border-pn-line border rounded-lg hover:bg-pn-surface-3 transition text-pn-ink`}
                      title="Exportar datos"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pie de página con información */}
      {estudiantesFiltrados.length > 0 && (
        <div className={`text-sm text-pn-ink-2 text-center`}>
          Mostrando {estudiantesFiltrados.length} de {estudiantes.length} estudiantes
        </div>
      )}
    </div>
  );
};
