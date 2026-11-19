import React, { useState } from 'react';
import { TrendingUp, Users, BookOpen, ClipboardCheck, Award, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';

interface AnaliticasSectionProps {
  cursos: any[];
  estudiantes: any[];
  tareas: any[];
  examenes: any[];
}

export const AnaliticasSection: React.FC<AnaliticasSectionProps> = ({
  cursos,
  estudiantes,
  tareas,
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
          <h2 className={`text-2xl font-bold text-pn-ink`}>Analíticas y Reportes</h2>
          <p className="text-pn-muted mt-1">Panel de seguimiento y análisis de desempeño</p>
        </div>
        <div className="flex gap-3">
          <select
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            className={`px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
          >
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mes</option>
            <option value="trimestre">Trimestre</option>
            <option value="semestre">Semestre</option>
          </select>
          <select
            value={cursoFiltro}
            onChange={(e) => setCursoFiltro(e.target.value)}
            className={`px-4 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
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
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <Users className="text-pn-accent-text" size={32} />
            <span className="text-2xl font-bold text-pn-accent-text">+{estudiantesActivos}</span>
          </div>
          <h3 className={`font-semibold text-pn-ink`}>Estudiantes Activos</h3>
          <p className="text-sm text-pn-muted mt-1">De {totalEstudiantes} totales</p>
          <div className="mt-3 flex items-center text-sm text-pn-ok">
            <TrendingUp size={16} className="mr-1" />
            <span>+8% vs mes anterior</span>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <Award className="text-pn-ok" size={32} />
            <span className="text-2xl font-bold text-pn-ok">{promedioGeneral}</span>
          </div>
          <h3 className={`font-semibold text-pn-ink`}>Promedio General</h3>
          <p className="text-sm text-pn-muted mt-1">Calificación promedio</p>
          <div className="mt-3 flex items-center text-sm text-pn-ok">
            <TrendingUp size={16} className="mr-1" />
            <span>+0.3 vs mes anterior</span>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <ClipboardCheck className="text-pn-warn" size={32} />
            <span className="text-2xl font-bold text-pn-warn">{tareasPendientes}</span>
          </div>
          <h3 className={`font-semibold text-pn-ink`}>Tareas por Revisar</h3>
          <p className="text-sm text-pn-muted mt-1">De {tareas.length} totales</p>
          <div className="mt-3">
            <div className="w-full bg-pn-surface-3 rounded-full h-2">
              <div
                className="bg-pn-warn h-2 rounded-full"
                style={{ width: `${(tareasRevisadas / tareas.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="text-pn-accent-2-text" size={32} />
            <span className="text-2xl font-bold text-pn-accent-2-text">{cursos.length}</span>
          </div>
          <h3 className={`font-semibold text-pn-ink`}>Cursos Activos</h3>
          <p className="text-sm text-pn-muted mt-1">En este periodo</p>
          <div className="mt-3 text-sm text-pn-ink-2">
            {estudiantes.length} estudiantes totales
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento Académico */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-pn-accent-text" size={24} />
              <h3 className={`text-lg font-bold text-pn-ink`}>Rendimiento Académico</h3>
            </div>
            <span className="text-sm text-pn-muted">Últimos 6 meses</span>
          </div>

          <div className="space-y-4">
            {datosRendimiento.map((dato, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-pn-ink">{dato.mes}</span>
                  <span className="font-semibold text-pn-accent-text">{dato.promedio}</span>
                </div>
                <div className="w-full bg-pn-surface-3 rounded-full h-2">
                  <div
                    className="bg-pn-accent h-2 rounded-full transition-all"
                    style={{ width: `${(dato.promedio / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución de Calificaciones */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="text-pn-accent-2-text" size={24} />
              <h3 className={`text-lg font-bold text-pn-ink`}>Distribución de Calificaciones</h3>
            </div>
          </div>

          <div className="space-y-3">
            {distribucionCalificaciones.map((dist, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium">{dist.rango}</div>
                <div className="flex-1">
                  <div className="w-full bg-pn-surface-3 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-6 flex items-center justify-center text-xs text-pn-accent-ink font-semibold transition-all ${
                        index === 0 ? 'bg-pn-ok' :
                        index === 1 ? 'bg-pn-accent' :
                        index === 2 ? 'bg-pn-warn' :
                        index === 3 ? 'bg-pn-warn' :
                        'bg-pn-danger'
                      }`}
                      style={{ width: `${dist.porcentaje}%` }}
                    >
                      {dist.porcentaje > 15 && `${dist.cantidad}`}
                    </div>
                  </div>
                </div>
                <div className="w-16 text-sm text-pn-muted text-right">
                  {dist.porcentaje}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asistencia */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="text-pn-ok" size={24} />
              <h3 className={`text-lg font-bold text-pn-ink`}>Asistencia</h3>
            </div>
            <span className="text-sm text-pn-muted">Último mes</span>
          </div>

          <div className="space-y-4">
            {datosAsistencia.map((dato, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-pn-ink">{dato.semana}</span>
                  <span className={`font-semibold ${dato.asistencia >= 90 ? 'text-pn-ok' : 'text-pn-warn'}`}>
                    {dato.asistencia}%
                  </span>
                </div>
                <div className="w-full bg-pn-surface-3 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${dato.asistencia >= 90 ? 'bg-pn-ok' : 'bg-pn-warn'}`}
                    style={{ width: `${dato.asistencia}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximas Actividades */}
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-pn-warn" size={24} />
              <h3 className={`text-lg font-bold text-pn-ink`}>Actividad Reciente</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`p-3 bg-pn-accent-soft rounded`}>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pn-accent rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className={`text-sm font-medium text-pn-ink`}>15 nuevas entregas</p>
                  <p className="text-xs text-pn-muted">Tarea: Proyecto Final IA</p>
                  <p className="text-xs text-pn-muted">Hace 2 horas</p>
                </div>
              </div>
            </div>

            <div className={`p-3 bg-pn-ok-soft rounded`}>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pn-ok rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className={`text-sm font-medium text-pn-ink`}>23 estudiantes completaron el módulo</p>
                  <p className="text-xs text-pn-muted">Programación Avanzada</p>
                  <p className="text-xs text-pn-muted">Hoy</p>
                </div>
              </div>
            </div>

            <div className={`p-3 bg-pn-info-soft rounded`}>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pn-accent-2 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className={`text-sm font-medium text-pn-ink`}>Nuevo mensaje en foro</p>
                  <p className="text-xs text-pn-muted">Dudas sobre patrones de diseño</p>
                  <p className="text-xs text-pn-muted">Hace 1 hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Top Estudiantes */}
      <div className={`bg-pn-surface rounded-lg shadow`}>
        <div className="p-6 border-b border-pn-line">
          <h3 className={`text-lg font-bold text-pn-ink`}>Top Estudiantes</h3>
          <p className="text-sm text-pn-muted mt-1">Mejor desempeño del periodo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={'bg-pn-surface-2'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium text-pn-ink uppercase tracking-wider`}>#</th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-pn-ink uppercase tracking-wider`}>Estudiante</th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-pn-ink uppercase tracking-wider`}>Curso</th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-pn-ink uppercase tracking-wider`}>Promedio</th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-pn-ink uppercase tracking-wider`}>Progreso</th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-pn-ink uppercase tracking-wider`}>Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y border-pn-line">
              {estudiantes
                .sort((a, b) => b.calificacionActual - a.calificacionActual)
                .slice(0, 10)
                .map((estudiante, index) => (
                  <tr key={estudiante.id} className="hover:bg-pn-surface-2">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        index < 3 ? 'bg-pn-warn text-pn-warn font-bold' : `bg-pn-surface-3 text-pn-ink`
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{estudiante.nombre}</div>
                      <div className="text-sm text-pn-muted">{estudiante.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{estudiante.curso}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-pn-ok">{estudiante.calificacionActual.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-pn-surface-3 rounded-full h-2">
                          <div
                            className="bg-pn-accent h-2 rounded-full"
                            style={{ width: `${estudiante.progreso}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-pn-ink-2">{estudiante.progreso}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-pn-ok-soft text-pn-ok">
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
