import React, { useState } from 'react';
import { BookOpen, FileText, Video, Award, Calendar, TrendingUp, ChevronRight, CircleDot, Clock, AlertCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { StudentCourse, StudentTask, Clase } from '../../../types/student.types';

interface InicioSectionProps {
  cursos: StudentCourse[];
  tareas: StudentTask[];
  anuncios: any[];
  calificaciones: any[];
  clases?: Clase[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  setCursoDetalle: (curso: StudentCourse) => void;
  setActiveSection: (section: any) => void;
  unirseClase?: (claseId: string | number) => void;
}

export const InicioSection: React.FC<InicioSectionProps> = ({
  cursos,
  tareas,
  anuncios,
  calificaciones,
  clases = [],
  darkMode,
  card,
  text,
  border,
  setCursoDetalle,
  setActiveSection,
  unirseClase
}) => {
  const [anunciosExpandidos, setAnunciosExpandidos] = useState<(string | number)[]>([]);

  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
  const promedioGeneral = calificaciones.reduce((sum, c) => sum + c.promedio, 0) / calificaciones.length;
  const cursosActivos = cursos.length;

  // Filtrar clases en vivo y próximas
  const clasesEnVivo = clases.filter(c => c.estado === 'en_curso');
  const clasesProximas = clases.filter(c => c.estado === 'programada').slice(0, 3);

  // Función para toggle de anuncios
  const toggleAnuncio = (id: string | number) => {
    setAnunciosExpandidos(prev =>
      prev.includes(id) ? prev.filter(anuncioId => anuncioId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${text} mb-2`}>Bienvenida, Dayla</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Aquí está tu resumen académico
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{cursosActivos}</p>
              <p className="text-sm text-gray-500">Cursos Activos</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <FileText className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{tareasPendientes}</p>
              <p className="text-sm text-gray-500">Tareas Pendientes</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Award className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{promedioGeneral.toFixed(1)}</p>
              <p className="text-sm text-gray-500">Promedio General</p>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">7mo</p>
              <p className="text-sm text-gray-500">Semestre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clases en Vivo y Próximas */}
      {(clasesEnVivo.length > 0 || clasesProximas.length > 0) && (
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold ${text} flex items-center gap-2`}>
              <Video size={20} />
              Clases en Vivo y Próximas
            </h3>
            <button
              onClick={() => setActiveSection('clases')}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Ver todas
            </button>
          </div>

          {/* Clases en vivo ahora */}
          {clasesEnVivo.length > 0 && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <CircleDot className="text-red-500 animate-pulse" size={24} />
                <h4 className={`font-bold ${text}`}>
                  {clasesEnVivo.length} clase{clasesEnVivo.length > 1 ? 's' : ''} en vivo ahora
                </h4>
              </div>
              <div className="space-y-2">
                {clasesEnVivo.map(clase => (
                  <div
                    key={clase.id}
                    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border ${border} rounded-lg p-3 cursor-pointer hover:shadow-md transition`}
                    onClick={() => unirseClase && unirseClase(clase.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className={`font-semibold ${text}`}>{clase.titulo}</h5>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{clase.curso}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unirseClase?.(clase.id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition"
                      >
                        <Video size={16} />
                        Unirse ahora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximas clases */}
          {clasesProximas.length > 0 && (
            <div className="space-y-2">
              {clasesProximas.map(clase => (
                <div
                  key={clase.id}
                  className={`border ${border} rounded-lg p-3 hover:shadow-md transition cursor-pointer`}
                  onClick={() => setActiveSection('clases')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className={`font-semibold ${text}`}>{clase.titulo}</h5>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{clase.curso}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <Clock size={14} />
                        {clase.fecha}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Programada
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcements */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${text} flex items-center gap-2`}>
            <Calendar size={20} />
            Anuncios Importantes
          </h3>
        </div>
        <div className="space-y-3">
          {anuncios.map(anuncio => {
            const isExpanded = anunciosExpandidos.includes(anuncio.id);
            return (
              <div
                key={anuncio.id}
                className={`border-l-4 ${anuncio.color} ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded transition`}
              >
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => toggleAnuncio(anuncio.id)}
                >
                  <span className="text-2xl">{anuncio.icono}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${text}`}>{anuncio.titulo}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{anuncio.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-1">{anuncio.fecha}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={20} />
                  ) : (
                    <ChevronDown className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={20} />
                  )}
                </div>
                {isExpanded && anuncio.contenido && (
                  <div className={`mt-3 pt-3 border-t ${border} pl-11`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                      {anuncio.contenido}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold ${text}`}>Mis Cursos</h3>
            <button
              onClick={() => setActiveSection('cursos')}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {cursos.slice(0, 3).map(curso => (
              <div
                key={curso.id}
                className={`border ${border} rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
                onClick={() => {
                  setCursoDetalle(curso);
                  setActiveSection('cursos');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${text}`}>{curso.nombre}</h4>
                  <span className={`text-sm font-bold ${text}`}>{curso.progreso}%</span>
                </div>
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mb-2`}>
                  <div className={`${curso.color} h-2 rounded-full`} style={{ width: `${curso.progreso}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{curso.profesor}</span>
                  <span className="text-blue-600">{curso.tareasPendientes} tareas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold ${text}`}>Tareas Pendientes</h3>
            <button
              onClick={() => setActiveSection('tareas')}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {tareas.filter(t => t.estado === 'pendiente').slice(0, 3).map(tarea => (
              <div
                key={tarea.id}
                className={`border ${border} rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
                onClick={() => setActiveSection('tareas')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${text} mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{tarea.curso}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-orange-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {tarea.fechaLimite}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        tarea.estado === 'pendiente' ? 'bg-orange-100 text-orange-700' :
                        tarea.estado === 'entregada' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {tarea.estado}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submitted Tasks */}
      {tareas.filter(t => t.estado === 'entregada' || t.estado === 'calificada').length > 0 && (
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold ${text}`}>Tareas Entregadas</h3>
            <button
              onClick={() => setActiveSection('tareas')}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {tareas.filter(t => t.estado === 'entregada' || t.estado === 'calificada').slice(0, 3).map(tarea => (
              <div
                key={tarea.id}
                className={`border ${border} rounded-lg p-4 hover:shadow-md transition cursor-pointer`}
                onClick={() => setActiveSection('tareas')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${text} mb-1`}>{tarea.titulo}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{tarea.curso}</p>
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      {tarea.fechaEntrega && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle size={14} />
                          Entregada: {tarea.fechaEntrega}
                        </span>
                      )}
                      {tarea.estado === 'calificada' && tarea.calificacion && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700`}>
                          Calificación: {tarea.calificacion}/5.0
                        </span>
                      )}
                      {tarea.estado === 'entregada' && (
                        <span className={`px-2 py-1 rounded text-xs bg-blue-100 text-blue-700`}>
                          En revisión
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
