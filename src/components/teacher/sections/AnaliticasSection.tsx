import React, { useState } from 'react';
import { TrendingUp, Users, BookOpen, ClipboardCheck, Award, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';

interface AnaliticasSectionProps {
  cursos: any[];
  estudiantes: any[];
  tareas: any[];
  examenes: any[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const AnaliticasSection: React.FC<AnaliticasSectionProps> = ({
  cursos,
  estudiantes,
  tareas,
  darkMode,
  card,
  text,
  border
}) => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [cursoFiltro, setCursoFiltro] = useState('todos');

  // Cálculos de estadísticas
  const totalEstudiantes = estudiantes.length;
  const estudiantesActivos = estudiantes.filter(e => e.ultimaActividad &&
    new Date(e.ultimaActividad) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const tareasRevisadas = tareas.filter(t => t.entregasRevisadas === t.entregasTotales).length;
  const tareasPendientes = tareas.length - tareasRevisadas;

  const promedioGeneral = estudiantes.length > 0
    ? (estudiantes.reduce((sum, e) => sum + (e.calificacionActual || 0), 0) / estudiantes.length).toFixed(1)
    : 0;

  // Datos para gráficos (simulados)
  const datosRendimiento = [
    { mes: 'Ene', promedio: 3.8 },
    { mes: 'Feb', promedio: 4.0 },
    { mes: 'Mar', promedio: 3.9 },
    { mes: 'Abr', promedio: 4.2 },
    { mes: 'May', promedio: 4.1 },
    { mes: 'Jun', promedio: 4.3 }
  ];

  const datosAsistencia = [
    { semana: 'Sem 1', asistencia: 95 },
    { semana: 'Sem 2', asistencia: 92 },
    { semana: 'Sem 3', asistencia: 88 },
    { semana: 'Sem 4', asistencia: 90 }
  ];

  const distribucionCalificaciones = [
    { rango: '4.5-5.0', cantidad: 12, porcentaje: 30 },
    { rango: '4.0-4.4', cantidad: 15, porcentaje: 37 },
    { rango: '3.5-3.9', cantidad: 8, porcentaje: 20 },
    { rango: '3.0-3.4', cantidad: 4, porcentaje: 10 },
    { rango: '0-2.9', cantidad: 1, porcentaje: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${text}`}>Analíticas y Reportes</h2>
          <p className="text-gray-500 mt-1">Panel de seguimiento y análisis de desempeño</p>
        </div>
        <div className="flex gap-3">
          <select
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            className={`px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
          >
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mes</option>
            <option value="trimestre">Trimestre</option>
            <option value="semestre">Semestre</option>
          </select>
          <select
            value={cursoFiltro}
            onChange={(e) => setCursoFiltro(e.target.value)}
            className={`px-4 py-2 border ${border} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
          >
            <option value="todos">Todos los Cursos</option>
            {cursos.map(curso => (
              <option key={curso.id} value={curso.id}>{curso.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <Users className="text-blue-600" size={32} />
            <span className="text-2xl font-bold text-blue-600">+{estudiantesActivos}</span>
          </div>
          <h3 className={`font-semibold ${text}`}>Estudiantes Activos</h3>
          <p className="text-sm text-gray-500 mt-1">De {totalEstudiantes} totales</p>
          <div className="mt-3 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span>+8% vs mes anterior</span>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <Award className="text-green-600" size={32} />
            <span className="text-2xl font-bold text-green-600">{promedioGeneral}</span>
          </div>
          <h3 className={`font-semibold ${text}`}>Promedio General</h3>
          <p className="text-sm text-gray-500 mt-1">Calificación promedio</p>
          <div className="mt-3 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span>+0.3 vs mes anterior</span>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <ClipboardCheck className="text-orange-600" size={32} />
            <span className="text-2xl font-bold text-orange-600">{tareasPendientes}</span>
          </div>
          <h3 className={`font-semibold ${text}`}>Tareas por Revisar</h3>
          <p className="text-sm text-gray-500 mt-1">De {tareas.length} totales</p>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${(tareasRevisadas / tareas.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="text-purple-600" size={32} />
            <span className="text-2xl font-bold text-purple-600">{cursos.length}</span>
          </div>
          <h3 className={`font-semibold ${text}`}>Cursos Activos</h3>
          <p className="text-sm text-gray-500 mt-1">En este periodo</p>
          <div className="mt-3 text-sm text-gray-600">
            {estudiantes.length} estudiantes totales
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento Académico */}
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={24} />
              <h3 className={`text-lg font-bold ${text}`}>Rendimiento Académico</h3>
            </div>
            <span className="text-sm text-gray-500">Últimos 6 meses</span>
          </div>

          <div className="space-y-4">
            {datosRendimiento.map((dato, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={text}>{dato.mes}</span>
                  <span className="font-semibold text-blue-600">{dato.promedio}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(dato.promedio / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución de Calificaciones */}
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="text-purple-600" size={24} />
              <h3 className={`text-lg font-bold ${text}`}>Distribución de Calificaciones</h3>
            </div>
          </div>

          <div className="space-y-3">
            {distribucionCalificaciones.map((dist, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium">{dist.rango}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-6 flex items-center justify-center text-xs text-white font-semibold transition-all ${
                        index === 0 ? 'bg-green-600' :
                        index === 1 ? 'bg-blue-600' :
                        index === 2 ? 'bg-yellow-600' :
                        index === 3 ? 'bg-orange-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${dist.porcentaje}%` }}
                    >
                      {dist.porcentaje > 15 && `${dist.cantidad}`}
                    </div>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-500 text-right">
                  {dist.porcentaje}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asistencia */}
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="text-green-600" size={24} />
              <h3 className={`text-lg font-bold ${text}`}>Asistencia</h3>
            </div>
            <span className="text-sm text-gray-500">Último mes</span>
          </div>

          <div className="space-y-4">
            {datosAsistencia.map((dato, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={text}>{dato.semana}</span>
                  <span className={`font-semibold ${dato.asistencia >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                    {dato.asistencia}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${dato.asistencia >= 90 ? 'bg-green-600' : 'bg-orange-600'}`}
                    style={{ width: `${dato.asistencia}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximas Actividades */}
        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-orange-600" size={24} />
              <h3 className={`text-lg font-bold ${text}`}>Actividad Reciente</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded`}>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${text}`}>15 nuevas entregas</p>
                  <p className="text-xs text-gray-500">Tarea: Proyecto Final IA</p>
                  <p className="text-xs text-gray-400">Hace 2 horas</p>
                </div>
              </div>
            </div>

            <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-green-50'} rounded`}>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${text}`}>23 estudiantes completaron el módulo</p>
                  <p className="text-xs text-gray-500">Programación Avanzada</p>
                  <p className="text-xs text-gray-400">Hoy</p>
                </div>
              </div>
            </div>

            <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-purple-50'} rounded`}>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${text}`}>Nuevo mensaje en foro</p>
                  <p className="text-xs text-gray-500">Dudas sobre patrones de diseño</p>
                  <p className="text-xs text-gray-400">Hace 1 hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Top Estudiantes */}
      <div className={`${card} rounded-lg shadow`}>
        <div className="p-6 border-b ${border}">
          <h3 className={`text-lg font-bold ${text}`}>Top Estudiantes</h3>
          <p className="text-sm text-gray-500 mt-1">Mejor desempeño del periodo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${text} uppercase tracking-wider`}>#</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${text} uppercase tracking-wider`}>Estudiante</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${text} uppercase tracking-wider`}>Curso</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${text} uppercase tracking-wider`}>Promedio</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${text} uppercase tracking-wider`}>Progreso</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${text} uppercase tracking-wider`}>Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y ${border}">
              {estudiantes
                .sort((a, b) => b.calificacionActual - a.calificacionActual)
                .slice(0, 10)
                .map((estudiante, index) => (
                  <tr key={estudiante.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        index < 3 ? 'bg-yellow-400 text-yellow-900 font-bold' : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${text}`
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{estudiante.nombre}</div>
                      <div className="text-sm text-gray-500">{estudiante.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{estudiante.curso}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">{estudiante.calificacionActual.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${estudiante.progreso}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{estudiante.progreso}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        95%
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
