import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  MessageSquare,
  Download,
  Award,
  Activity,
  FileText,
  Users,
} from 'lucide-react';
import { EstudianteDetalle } from '../../../types/teacher.types';

interface PerfilEstudianteModalProps {
  estudiante: EstudianteDetalle | null;
  isOpen: boolean;
  onClose: () => void;
  onEnviarMensaje: (estudianteId: number) => void;
  onExportarDatos: (estudianteId: number) => void;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const PerfilEstudianteModal: React.FC<PerfilEstudianteModalProps> = ({
  estudiante,
  isOpen,
  onClose,
  onEnviarMensaje,
  onExportarDatos,
  darkMode,
  card,
  text,
  border,
}) => {
  const [tabActiva, setTabActiva] = useState<'resumen' | 'calificaciones' | 'actividad'>('resumen');

  if (!isOpen || !estudiante) return null;

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: User },
    { id: 'calificaciones', label: 'Calificaciones', icon: Award },
    { id: 'actividad', label: 'Actividad', icon: Activity },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${card} rounded-lg w-full max-w-5xl h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`p-6 ${border} border-b`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {estudiante.nombre.charAt(0)}
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${text}`}>{estudiante.nombre}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {estudiante.email}
                    </span>
                  </div>
                  {estudiante.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {estudiante.telefono}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Inscrito: {estudiante.fechaInscripcion}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${text} hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Acciones rápidas */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onEnviarMensaje(estudiante.id)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <MessageSquare size={18} />
              Enviar Mensaje
            </button>
            <button
              onClick={() => onExportarDatos(estudiante.id)}
              className={`flex items-center gap-2 px-4 py-2 ${border} border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${text}`}
            >
              <Download size={18} />
              Exportar Datos
            </button>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className={`p-4 ${border} border-b grid grid-cols-4 gap-4`}>
          <div className={`${card} p-4 rounded-lg ${border} border`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${text}`}>{estudiante.promedioGeneral.toFixed(1)}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Promedio General
                </p>
              </div>
            </div>
          </div>

          <div className={`${card} p-4 rounded-lg ${border} border`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${text}`}>{estudiante.progreso}%</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Progreso del Curso
                </p>
              </div>
            </div>
          </div>

          <div className={`${card} p-4 rounded-lg ${border} border`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileText className="text-purple-600" size={24} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${text}`}>
                  {estudiante.tareasRevisadas}/{estudiante.tareasEntregadas}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tareas Calificadas
                </p>
              </div>
            </div>
          </div>

          <div className={`${card} p-4 rounded-lg ${border} border`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Users className="text-orange-600" size={24} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${text}`}>{estudiante.asistencia.porcentaje}%</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Asistencia
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${border} border-b`}>
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    tabActiva === tab.id
                      ? 'bg-blue-600 text-white'
                      : `${text} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido de tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          {tabActiva === 'resumen' && (
            <div className="space-y-6">
              {/* Cursos inscritos */}
              <div>
                <h4 className={`font-bold ${text} mb-3 flex items-center gap-2`}>
                  <BookOpen size={20} />
                  Cursos Inscritos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {estudiante.cursosInscritos.map((curso, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {curso}
                    </span>
                  ))}
                </div>
              </div>

              {/* Información de asistencia */}
              <div>
                <h4 className={`font-bold ${text} mb-3 flex items-center gap-2`}>
                  <Users size={20} />
                  Resumen de Asistencia
                </h4>
                <div className={`${card} p-4 rounded-lg ${border} border`}>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className={`text-3xl font-bold text-green-600`}>
                        {estudiante.asistencia.presente}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Presente
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-3xl font-bold text-red-600`}>
                        {estudiante.asistencia.ausente}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Ausente
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${text}`}>
                        {estudiante.asistencia.total}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${estudiante.asistencia.porcentaje}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Últimas actividades */}
              <div>
                <h4 className={`font-bold ${text} mb-3 flex items-center gap-2`}>
                  <Activity size={20} />
                  Últimas Actividades
                </h4>
                <div className="space-y-2">
                  {estudiante.ultimasActividades.map((actividad, idx) => (
                    <div
                      key={idx}
                      className={`${card} p-3 rounded-lg ${border} border flex items-start gap-3`}
                    >
                      <div className="mt-1">
                        {actividad.tipo === 'entrega' && (
                          <FileText size={18} className="text-blue-600" />
                        )}
                        {actividad.tipo === 'examen' && (
                          <Award size={18} className="text-purple-600" />
                        )}
                        {actividad.tipo === 'asistencia' && (
                          <CheckCircle size={18} className="text-green-600" />
                        )}
                        {actividad.tipo === 'mensaje' && (
                          <MessageSquare size={18} className="text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${text}`}>{actividad.descripcion}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          {actividad.fecha}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tabActiva === 'calificaciones' && (
            <div>
              <h4 className={`font-bold ${text} mb-4 flex items-center gap-2`}>
                <Award size={20} />
                Historial de Calificaciones
              </h4>
              <div className="space-y-2">
                {estudiante.historialCalificaciones.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    No hay calificaciones registradas
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`${border} border-b`}>
                          <th className={`text-left p-3 ${text}`}>Tarea</th>
                          <th className={`text-left p-3 ${text}`}>Curso</th>
                          <th className={`text-center p-3 ${text}`}>Calificación</th>
                          <th className={`text-left p-3 ${text}`}>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiante.historialCalificaciones.map((cal, idx) => (
                          <tr
                            key={idx}
                            className={`${border} border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition`}
                          >
                            <td className={`p-3 ${text}`}>{cal.tarea}</td>
                            <td className={`p-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {cal.curso}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-full font-bold ${
                                  cal.calificacion >= 7
                                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                    : cal.calificacion >= 5
                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                }`}
                              >
                                {cal.calificacion.toFixed(1)}/10
                              </span>
                            </td>
                            <td className={`p-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {cal.fecha}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {tabActiva === 'actividad' && (
            <div>
              <h4 className={`font-bold ${text} mb-4 flex items-center gap-2`}>
                <Clock size={20} />
                Registro de Actividad
              </h4>
              <div className="space-y-3">
                {estudiante.ultimasActividades.map((actividad, idx) => (
                  <div
                    key={idx}
                    className={`${card} p-4 rounded-lg ${border} border flex items-center gap-4`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`p-3 rounded-lg ${
                          actividad.tipo === 'entrega'
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : actividad.tipo === 'examen'
                            ? 'bg-purple-100 dark:bg-purple-900'
                            : actividad.tipo === 'asistencia'
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-orange-100 dark:bg-orange-900'
                        }`}
                      >
                        {actividad.tipo === 'entrega' && (
                          <FileText size={24} className="text-blue-600" />
                        )}
                        {actividad.tipo === 'examen' && (
                          <Award size={24} className="text-purple-600" />
                        )}
                        {actividad.tipo === 'asistencia' && (
                          <CheckCircle size={24} className="text-green-600" />
                        )}
                        {actividad.tipo === 'mensaje' && (
                          <MessageSquare size={24} className="text-orange-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${text}`}>{actividad.descripcion}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {actividad.fecha}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          actividad.tipo === 'entrega'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : actividad.tipo === 'examen'
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                            : actividad.tipo === 'asistencia'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                        }`}
                      >
                        {actividad.tipo === 'entrega'
                          ? 'Entrega'
                          : actividad.tipo === 'examen'
                          ? 'Examen'
                          : actividad.tipo === 'asistencia'
                          ? 'Asistencia'
                          : 'Mensaje'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 ${border} border-t flex justify-between items-center`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Última actividad: {estudiante.ultimaActividad}
          </div>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg ${text} hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
