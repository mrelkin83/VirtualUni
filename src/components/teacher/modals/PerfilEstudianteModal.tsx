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
import { useModalA11y } from '../../../hooks/useModalA11y';

interface PerfilEstudianteModalProps {
  estudiante: EstudianteDetalle | null;
  isOpen: boolean;
  onClose: () => void;
  onEnviarMensaje: (estudianteId: number) => void;
  onExportarDatos: (estudianteId: number) => void;
}

export const PerfilEstudianteModal: React.FC<PerfilEstudianteModalProps> = ({
  estudiante,
  isOpen,
  onClose,
  onEnviarMensaje,
  onExportarDatos,
}) => {
  const [tabActiva, setTabActiva] = useState<'resumen' | 'calificaciones' | 'actividad'>('resumen');

  const dialogRef = useModalA11y(isOpen && !!estudiante, onClose);

  if (!isOpen || !estudiante) return null;

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: User },
    { id: 'calificaciones', label: 'Calificaciones', icon: Award },
    { id: 'actividad', label: 'Actividad', icon: Activity },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-perfil-estudiante"
        tabIndex={-1}
        className={`bg-pn-surface rounded-lg w-full max-w-5xl h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className={`p-6 border-pn-line border-b`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pn-accent to-pn-accent-hover rounded-full flex items-center justify-center text-pn-accent-ink font-bold text-2xl">
                {estudiante.nombre.charAt(0)}
              </div>
              <div>
                <h3 id="titulo-perfil-estudiante" className={`text-2xl font-bold text-pn-ink`}>{estudiante.nombre}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className={'text-pn-ink-2'} />
                    <span className={`text-sm text-pn-ink-2`}>
                      {estudiante.email}
                    </span>
                  </div>
                  {estudiante.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className={'text-pn-ink-2'} />
                      <span className={`text-sm text-pn-ink-2`}>
                        {estudiante.telefono}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className={'text-pn-ink-2'} />
                    <span className={`text-sm text-pn-ink-2`}>
                      Inscrito: {estudiante.fechaInscripcion}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`text-pn-ink hover:bg-pn-surface-3 p-2 rounded-lg transition`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Acciones rápidas */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onEnviarMensaje(estudiante.id)}
              className="flex items-center gap-2 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition"
            >
              <MessageSquare size={18} />
              Enviar Mensaje
            </button>
            <button
              onClick={() => onExportarDatos(estudiante.id)}
              className={`flex items-center gap-2 px-4 py-2 border-pn-line border rounded-lg hover:bg-pn-surface-3 transition text-pn-ink`}
            >
              <Download size={18} />
              Exportar Datos
            </button>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className={`p-4 border-pn-line border-b grid grid-cols-2 sm:grid-cols-4 gap-4`}>
          <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pn-accent-soft rounded-lg">
                <TrendingUp className="text-pn-accent-text" size={24} />
              </div>
              <div>
                <p className={`text-2xl font-bold text-pn-ink`}>{estudiante.promedioGeneral.toFixed(1)}</p>
                <p className={`text-xs text-pn-ink-2`}>
                  Promedio General
                </p>
              </div>
            </div>
          </div>

          <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pn-ok-soft rounded-lg">
                <CheckCircle className="text-pn-ok" size={24} />
              </div>
              <div>
                <p className={`text-2xl font-bold text-pn-ink`}>{estudiante.progreso}%</p>
                <p className={`text-xs text-pn-ink-2`}>
                  Progreso del Curso
                </p>
              </div>
            </div>
          </div>

          <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pn-accent-2-soft rounded-lg">
                <FileText className="text-pn-accent-2-text" size={24} />
              </div>
              <div>
                <p className={`text-2xl font-bold text-pn-ink`}>
                  {estudiante.tareasRevisadas}/{estudiante.tareasEntregadas}
                </p>
                <p className={`text-xs text-pn-ink-2`}>
                  Tareas Calificadas
                </p>
              </div>
            </div>
          </div>

          <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pn-warn-soft rounded-lg">
                <Users className="text-pn-warn" size={24} />
              </div>
              <div>
                <p className={`text-2xl font-bold text-pn-ink`}>{estudiante.asistencia.porcentaje}%</p>
                <p className={`text-xs text-pn-ink-2`}>
                  Asistencia
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`border-pn-line border-b`}>
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    tabActiva === tab.id
                      ? 'bg-pn-accent text-pn-accent-ink'
                      : `text-pn-ink hover:bg-pn-surface-3`
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
                <h4 className={`font-bold text-pn-ink mb-3 flex items-center gap-2`}>
                  <BookOpen size={20} />
                  Cursos Inscritos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {estudiante.cursosInscritos.map((curso, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-pn-accent-soft text-pn-accent-text rounded-full text-sm"
                    >
                      {curso}
                    </span>
                  ))}
                </div>
              </div>

              {/* Información de asistencia */}
              <div>
                <h4 className={`font-bold text-pn-ink mb-3 flex items-center gap-2`}>
                  <Users size={20} />
                  Resumen de Asistencia
                </h4>
                <div className={`bg-pn-surface p-4 rounded-lg border-pn-line border`}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className={`text-3xl font-bold text-pn-ok`}>
                        {estudiante.asistencia.presente}
                      </p>
                      <p className={`text-sm text-pn-ink-2`}>
                        Presente
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-3xl font-bold text-pn-danger`}>
                        {estudiante.asistencia.ausente}
                      </p>
                      <p className={`text-sm text-pn-ink-2`}>
                        Ausente
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-3xl font-bold text-pn-ink`}>
                        {estudiante.asistencia.total}
                      </p>
                      <p className={`text-sm text-pn-ink-2`}>
                        Total
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-pn-surface-3 rounded-full h-3">
                      <div
                        className="bg-pn-ok h-3 rounded-full transition-all"
                        style={{ width: `${estudiante.asistencia.porcentaje}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Últimas actividades */}
              <div>
                <h4 className={`font-bold text-pn-ink mb-3 flex items-center gap-2`}>
                  <Activity size={20} />
                  Últimas Actividades
                </h4>
                <div className="space-y-2">
                  {estudiante.ultimasActividades.map((actividad, idx) => (
                    <div
                      key={idx}
                      className={`bg-pn-surface p-3 rounded-lg border-pn-line border flex items-start gap-3`}
                    >
                      <div className="mt-1">
                        {actividad.tipo === 'entrega' && (
                          <FileText size={18} className="text-pn-accent-text" />
                        )}
                        {actividad.tipo === 'examen' && (
                          <Award size={18} className="text-pn-accent-2-text" />
                        )}
                        {actividad.tipo === 'asistencia' && (
                          <CheckCircle size={18} className="text-pn-ok" />
                        )}
                        {actividad.tipo === 'mensaje' && (
                          <MessageSquare size={18} className="text-pn-warn" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm text-pn-ink`}>{actividad.descripcion}</p>
                        <p className={`text-xs text-pn-muted mt-1`}>
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
              <h4 className={`font-bold text-pn-ink mb-4 flex items-center gap-2`}>
                <Award size={20} />
                Historial de Calificaciones
              </h4>
              <div className="space-y-2">
                {estudiante.historialCalificaciones.length === 0 ? (
                  <p className={`text-center py-8 text-pn-muted`}>
                    No hay calificaciones registradas
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-pn-line border-b`}>
                          <th className={`text-left p-3 text-pn-ink`}>Tarea</th>
                          <th className={`text-left p-3 text-pn-ink`}>Curso</th>
                          <th className={`text-center p-3 text-pn-ink`}>Calificación</th>
                          <th className={`text-left p-3 text-pn-ink`}>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiante.historialCalificaciones.map((cal, idx) => (
                          <tr
                            key={idx}
                            className={`border-pn-line border-b hover:bg-pn-surface-2 transition`}
                          >
                            <td className={`p-3 text-pn-ink`}>{cal.tarea}</td>
                            <td className={`p-3 text-pn-ink-2`}>
                              {cal.curso}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-full font-bold ${
                                  cal.calificacion >= 7
                                    ? 'bg-pn-ok-soft text-pn-ok'
                                    : cal.calificacion >= 5
                                    ? 'bg-pn-warn-soft text-pn-warn'
                                    : 'bg-pn-danger-soft text-pn-danger'
                                }`}
                              >
                                {cal.calificacion.toFixed(1)}/10
                              </span>
                            </td>
                            <td className={`p-3 text-pn-ink-2`}>
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
              <h4 className={`font-bold text-pn-ink mb-4 flex items-center gap-2`}>
                <Clock size={20} />
                Registro de Actividad
              </h4>
              <div className="space-y-3">
                {estudiante.ultimasActividades.map((actividad, idx) => (
                  <div
                    key={idx}
                    className={`bg-pn-surface p-4 rounded-lg border-pn-line border flex items-center gap-4`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`p-3 rounded-lg ${
                          actividad.tipo === 'entrega'
                            ? 'bg-pn-accent-soft'
                            : actividad.tipo === 'examen'
                            ? 'bg-pn-accent-2-soft'
                            : actividad.tipo === 'asistencia'
                            ? 'bg-pn-ok-soft'
                            : 'bg-pn-warn-soft'
                        }`}
                      >
                        {actividad.tipo === 'entrega' && (
                          <FileText size={24} className="text-pn-accent-text" />
                        )}
                        {actividad.tipo === 'examen' && (
                          <Award size={24} className="text-pn-accent-2-text" />
                        )}
                        {actividad.tipo === 'asistencia' && (
                          <CheckCircle size={24} className="text-pn-ok" />
                        )}
                        {actividad.tipo === 'mensaje' && (
                          <MessageSquare size={24} className="text-pn-warn" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-pn-ink`}>{actividad.descripcion}</p>
                      <p className={`text-sm text-pn-ink-2 mt-1`}>
                        {actividad.fecha}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          actividad.tipo === 'entrega'
                            ? 'bg-pn-accent-soft text-pn-accent-text'
                            : actividad.tipo === 'examen'
                            ? 'bg-pn-accent-2-soft text-pn-accent-2-text'
                            : actividad.tipo === 'asistencia'
                            ? 'bg-pn-ok-soft text-pn-ok'
                            : 'bg-pn-warn-soft text-pn-warn'
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
        <div className={`p-4 border-pn-line border-t flex justify-between items-center`}>
          <div className={`text-sm text-pn-ink-2`}>
            Última actividad: {estudiante.ultimaActividad}
          </div>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg text-pn-ink hover:bg-pn-surface-3 transition`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
