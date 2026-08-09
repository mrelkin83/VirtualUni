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
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const EstudiantesSection: React.FC<EstudiantesSectionProps> = ({
  estudiantes,
  verPerfilEstudiante,
  enviarMensajeEstudiante,
  exportarDatosEstudiante,
  darkMode,
  card,
  text,
  border
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
          <h2 className={`text-2xl font-bold ${text}`}>Mis Estudiantes</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Gestiona y da seguimiento al progreso de tus estudiantes
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <div className={`${card} p-4 rounded-lg ${border} border`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${text}`}>{estadisticas.total}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Estudiantes
              </p>
            </div>
          </div>
        </div>

        <div className={`${card} p-4 rounded-lg ${border} border`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Award className="text-green-600" size={24} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${text}`}>{estadisticas.promedioGeneral.toFixed(1)}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Promedio General
              </p>
            </div>
          </div>
        </div>

        <div className={`${card} p-4 rounded-lg ${border} border`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${text}`}>{estadisticas.progresoPromedio.toFixed(0)}%</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Progreso Promedio
              </p>
            </div>
          </div>
        </div>

        <div className={`${card} p-4 rounded-lg ${border} border`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <FileText className="text-orange-600" size={24} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${text}`}>{estadisticas.conTareasPendientes}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Con Tareas Pendientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className={`${card} p-4 rounded-lg ${border} border`}>
        <div className="flex gap-4 flex-wrap">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${border} border ${card} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Filtro por curso */}
          <div className="flex items-center gap-2">
            <Filter size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              className={`px-4 py-2 border ${border} rounded-lg ${card} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
              className={`px-4 py-2 border ${border} rounded-lg ${card} ${text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
          <div className={`${card} rounded-lg shadow p-12 text-center`}>
            <Users size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No se encontraron estudiantes
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-500'} mt-2`}>
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          estudiantesFiltrados.map((estudiante) => (
            <div
              key={estudiante.id}
              className={`${card} rounded-lg shadow p-4 hover:shadow-lg transition`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {estudiante.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`font-bold ${text}`}>{estudiante.nombre}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {estudiante.email}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {estudiante.curso}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Progreso</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${estudiante.progreso}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold ${text}`}>
                        {estudiante.progreso}%
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Calificación</p>
                    <p className={`text-xl font-bold ${text}`}>
                      {estudiante.calificacionActual.toFixed(1)}/10
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Pendientes</p>
                    <p
                      className={`text-xl font-bold ${
                        estudiante.tareasPendientes > 0 ? 'text-orange-500' : 'text-green-500'
                      }`}
                    >
                      {estudiante.tareasPendientes}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Última actividad</p>
                    <p className={`text-sm font-semibold ${text}`}>
                      {estudiante.ultimaActividad}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => verPerfilEstudiante(estudiante.id)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      title="Ver perfil completo"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => enviarMensajeEstudiante(estudiante.id)}
                      className={`p-2 ${border} border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${text}`}
                      title="Enviar mensaje"
                    >
                      <MessageSquare size={18} />
                    </button>
                    <button
                      onClick={() => exportarDatosEstudiante(estudiante.id)}
                      className={`p-2 ${border} border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${text}`}
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
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
          Mostrando {estudiantesFiltrados.length} de {estudiantes.length} estudiantes
        </div>
      )}
    </div>
  );
};
