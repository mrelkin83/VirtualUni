import React from 'react';
import { BookOpen, Users, ClipboardCheck, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { Course, Student, Assignment } from '../../../types/teacher.types';

interface InicioSectionProps {
  cursos: Course[];
  estudiantes: Student[];
  tareas: Assignment[];
  setCursoDetalle: (curso: any) => void;
  setEstudianteDetalle: (estudiante: any) => void;
  setTareaEnRevision: (tarea: any) => void;
  setActiveSection?: (section: any) => void;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const InicioSection: React.FC<InicioSectionProps> = ({
  cursos,
  estudiantes,
  tareas,
  setCursoDetalle,
  setTareaEnRevision,
  setActiveSection,
  darkMode,
  card,
  text,
  border
}) => {
  const totalEstudiantes = cursos.reduce((acc, curso) => acc + curso.estudiantes, 0);
  const tareasPendientes = cursos.reduce((acc, curso) => acc + curso.tareasPendientesRevision, 0);
  const promedioProgreso = Math.round(cursos.reduce((acc, curso) => acc + curso.progresoGeneral, 0) / cursos.length);

  const estadisticas = [
    { titulo: 'Cursos Activos', valor: cursos.length, icon: BookOpen, color: 'bg-blue-500' },
    { titulo: 'Estudiantes', valor: totalEstudiantes, icon: Users, color: 'bg-green-500' },
    { titulo: 'Tareas Pendientes', valor: tareasPendientes, icon: ClipboardCheck, color: 'bg-orange-500' },
    { titulo: 'Progreso Promedio', valor: `${promedioProgreso}%`, icon: TrendingUp, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticas.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${card} rounded-lg shadow p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.titulo}</p>
                  <p className={`text-3xl font-bold ${text} mt-2`}>{stat.valor}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-full`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mis Cursos */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${text}`}>Mis Cursos</h3>
          {setActiveSection && (
            <button
              onClick={() => setActiveSection('cursos')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
            >
              Ver Todos
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cursos.map((curso) => (
            <div
              key={curso.id}
              className={`p-4 border ${border} rounded-lg hover:shadow-md transition cursor-pointer`}
              onClick={() => {
                if (setActiveSection) setActiveSection('cursos');
                setCursoDetalle(curso);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className={`font-bold ${text}`}>{curso.nombre}</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{curso.codigo}</p>
                </div>
                <div className={`${curso.color} w-3 h-3 rounded-full`}></div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Estudiantes</span>
                  <span className={`font-semibold ${text}`}>{curso.estudiantes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Tareas pendientes</span>
                  <span className="font-semibold text-orange-500">{curso.tareasPendientesRevision}</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progreso</span>
                    <span className={`font-semibold ${text}`}>{curso.progresoGeneral}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${curso.progresoGeneral}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tareas Pendientes de Revisión */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-bold ${text} mb-4 flex items-center gap-2`}>
          <AlertCircle className="text-orange-500" size={24} />
          Tareas Pendientes de Revisión
        </h3>
        <div className="space-y-3">
          {tareas.filter((t) => t.entregasRevisadas < t.entregasTotales).map((tarea) => (
            <div
              key={tarea.id}
              className={`p-4 border ${border} rounded-lg hover:shadow-md transition cursor-pointer`}
              onClick={() => setTareaEnRevision(tarea)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className={`font-bold ${text}`}>{tarea.titulo}</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tarea.curso}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-500">
                    {tarea.entregasTotales - tarea.entregasRevisadas} por revisar
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Límite: {tarea.fechaLimite}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estudiantes Recientes */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${text}`}>Actividad Reciente de Estudiantes</h3>
          {setActiveSection && (
            <button
              onClick={() => setActiveSection('estudiantes')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium text-sm"
            >
              Ver Todos
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        <div className="space-y-3">
          {estudiantes.slice(0, 4).map((estudiante) => (
            <div
              key={estudiante.id}
              className={`p-4 border ${border} rounded-lg hover:shadow-md transition flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {estudiante.nombre.charAt(0)}
                </div>
                <div>
                  <p
                    className={`font-semibold ${text} cursor-pointer hover:text-blue-600 hover:underline transition`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setActiveSection) {
                        setActiveSection('estudiantes');
                      }
                    }}
                  >
                    {estudiante.nombre}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{estudiante.curso}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${text}`}>{estudiante.calificacionActual}/10</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {estudiante.ultimaActividad}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
