import React, { useState } from 'react';
import { X, Save, FileText, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

interface Submission {
  id: number;
  estudianteId: number;
  estudianteNombre: string;
  estudianteEmail: string;
  fechaEntrega: string;
  contenido: string;
  archivoUrl?: string;
  calificacion?: number;
  feedback?: string;
  estado: 'pendiente' | 'revisada';
}

interface RevisionTareaModalProps {
  tarea: {
    id: number;
    titulo: string;
    curso: string;
    fechaLimite: string;
    entregasTotales: number;
    entregasRevisadas: number;
    submissions?: Submission[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveGrade: (submissionId: number, calificacion: number, feedback: string) => void;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

export const RevisionTareaModal: React.FC<RevisionTareaModalProps> = ({
  tarea,
  isOpen,
  onClose,
  onSaveGrade,
  darkMode,
  card,
  text,
  border,
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [calificacion, setCalificacion] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'revisadas'>('pendientes');

  if (!isOpen || !tarea) return null;

  const submissions = tarea.submissions || [];

  const submissionsFiltradas = submissions.filter(s => {
    if (filtro === 'pendientes') return s.estado === 'pendiente';
    if (filtro === 'revisadas') return s.estado === 'revisada';
    return true;
  });

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setCalificacion(submission.calificacion || 0);
    setFeedback(submission.feedback || '');
  };

  const handleSaveGrade = () => {
    if (!selectedSubmission) return;

    if (calificacion < 0 || calificacion > 10) {
      alert('La calificación debe estar entre 0 y 10');
      return;
    }

    onSaveGrade(selectedSubmission.id, calificacion, feedback);

    // Actualizar el estado local
    const nextPendiente = submissionsFiltradas.find(
      s => s.id !== selectedSubmission.id && s.estado === 'pendiente'
    );

    if (nextPendiente) {
      handleSelectSubmission(nextPendiente);
    } else {
      setSelectedSubmission(null);
      setCalificacion(0);
      setFeedback('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${card} rounded-lg w-full max-w-6xl h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`p-6 ${border} border-b flex justify-between items-center`}>
          <div>
            <h3 className={`text-xl font-bold ${text}`}>Revisión de Tarea</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {tarea.titulo} - {tarea.curso}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              📅 Fecha límite: {tarea.fechaLimite}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${text} hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className={`p-4 ${border} border-b grid grid-cols-3 gap-4`}>
          <div className="text-center">
            <p className={`text-2xl font-bold ${text}`}>{submissions.length}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total entregas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {submissions.filter(s => s.estado === 'pendiente').length}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Por revisar</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.estado === 'revisada').length}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Revisadas</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Lista de entregas */}
          <div className={`w-1/3 ${border} border-r overflow-y-auto`}>
            <div className={`p-4 ${border} border-b sticky top-0 ${card} z-10`}>
              <h4 className={`font-bold ${text} mb-3`}>Entregas</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltro('todas')}
                  className={`px-3 py-1 rounded text-sm ${
                    filtro === 'todas'
                      ? 'bg-blue-600 text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                  }`}
                >
                  Todas ({submissions.length})
                </button>
                <button
                  onClick={() => setFiltro('pendientes')}
                  className={`px-3 py-1 rounded text-sm ${
                    filtro === 'pendientes'
                      ? 'bg-orange-600 text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                  }`}
                >
                  Pendientes ({submissions.filter(s => s.estado === 'pendiente').length})
                </button>
                <button
                  onClick={() => setFiltro('revisadas')}
                  className={`px-3 py-1 rounded text-sm ${
                    filtro === 'revisadas'
                      ? 'bg-green-600 text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                  }`}
                >
                  Revisadas ({submissions.filter(s => s.estado === 'revisada').length})
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {submissionsFiltradas.length === 0 ? (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No hay entregas {filtro !== 'todas' ? filtro : ''}
                </p>
              ) : (
                submissionsFiltradas.map((submission) => (
                  <div
                    key={submission.id}
                    onClick={() => handleSelectSubmission(submission)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedSubmission?.id === submission.id
                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                        : `${border} border hover:bg-gray-50 dark:hover:bg-gray-700`
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={14} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                          <p className={`font-medium text-sm ${text}`}>{submission.estudianteNombre}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock size={12} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {submission.fechaEntrega}
                          </span>
                        </div>
                      </div>
                      {submission.estado === 'revisada' ? (
                        <CheckCircle size={18} className="text-green-600" />
                      ) : (
                        <AlertCircle size={18} className="text-orange-600" />
                      )}
                    </div>
                    {submission.estado === 'revisada' && submission.calificacion !== undefined && (
                      <div className="mt-2 text-xs">
                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          Calificación: {submission.calificacion.toFixed(1)}/10
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel de revisión */}
          <div className="flex-1 flex flex-col">
            {selectedSubmission ? (
              <>
                {/* Info del estudiante y trabajo */}
                <div className={`p-6 ${border} border-b overflow-y-auto flex-1`}>
                  <div className="mb-6">
                    <h5 className={`font-bold ${text} mb-2`}>Información del Estudiante</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nombre:</p>
                        <p className={`font-medium ${text}`}>{selectedSubmission.estudianteNombre}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email:</p>
                        <p className={`font-medium ${text}`}>{selectedSubmission.estudianteEmail}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha de entrega:</p>
                        <p className={`font-medium ${text}`}>{selectedSubmission.fechaEntrega}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estado:</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          selectedSubmission.estado === 'revisada'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                        }`}>
                          {selectedSubmission.estado === 'revisada' ? 'Revisada' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h5 className={`font-bold ${text} mb-2 flex items-center gap-2`}>
                      <FileText size={18} />
                      Contenido de la Entrega
                    </h5>
                    <div className={`p-4 rounded-lg ${border} border ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <p className={`${text} whitespace-pre-wrap`}>{selectedSubmission.contenido}</p>
                    </div>
                  </div>

                  {selectedSubmission.archivoUrl && (
                    <div className="mb-6">
                      <h5 className={`font-bold ${text} mb-2`}>Archivo Adjunto</h5>
                      <a
                        href={selectedSubmission.archivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        <FileText size={16} />
                        Descargar archivo
                      </a>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className={`block ${text} mb-2 font-medium`}>
                      Calificación (0-10) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={calificacion}
                      onChange={(e) => setCalificacion(parseFloat(e.target.value) || 0)}
                      className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                      placeholder="Ingresa la calificación"
                    />
                  </div>

                  <div>
                    <label className={`block ${text} mb-2 font-medium`}>
                      Retroalimentación
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={6}
                      className={`w-full px-4 py-2 rounded-lg ${border} border ${card} ${text}`}
                      placeholder="Escribe comentarios, sugerencias o retroalimentación para el estudiante..."
                    />
                  </div>
                </div>

                {/* Footer con acciones */}
                <div className={`p-6 ${border} border-t flex justify-between items-center`}>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {submissionsFiltradas.filter(s => s.estado === 'pendiente').length > 0 && (
                      <span>
                        {submissionsFiltradas.filter(s => s.estado === 'pendiente').length} entrega(s) pendiente(s)
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedSubmission(null);
                        setCalificacion(0);
                        setFeedback('');
                      }}
                      className={`px-4 py-2 rounded-lg ${text} hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveGrade}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Save size={18} />
                      Guardar Calificación
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText size={64} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Selecciona una entrega para revisar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
