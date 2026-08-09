import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, BookOpen, Play, FileText, Award } from 'lucide-react';
import { StudentCourse, CourseTopic } from '../../../types/student.types';
import { generateCertificateFromCourse } from '../../../utils/certificateGenerator';

interface CursosSectionProps {
  cursos: StudentCourse[];
  cursoDetalle: StudentCourse | null;
  temaSeleccionado: CourseTopic | null;
  bloqueActivo: number;
  expandirIdeasClave: boolean;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
  setCursoDetalle: (curso: StudentCourse | null) => void;
  setTemaSeleccionado: (tema: CourseTopic | null) => void;
  setBloqueActivo: (bloque: number) => void;
  setExpandirIdeasClave: (expandir: boolean) => void;
  generarCertificadoCurso?: (cursoId: number, nombreArchivo: string) => void;
}

export const CursosSection: React.FC<CursosSectionProps> = ({
  cursos,
  cursoDetalle,
  temaSeleccionado,
  bloqueActivo,
  expandirIdeasClave,
  darkMode,
  card,
  text,
  border,
  setCursoDetalle,
  setTemaSeleccionado,
  setBloqueActivo,
  setExpandirIdeasClave,
  generarCertificadoCurso
}) => {
  const handleGenerateCertificate = (curso: StudentCourse) => {
    // Obtener nombre del estudiante del perfil (simulado)
    const studentName = 'Dayla Melanie Otalvaro Rodriguez';

    const result = generateCertificateFromCourse(
      studentName,
      curso.nombre,
      curso.profesor,
      curso.progreso,
      undefined // Calificación opcional
    );

    if (result.certificadoGenerado) {
      // Registrar en la base de datos
      if (generarCertificadoCurso) {
        generarCertificadoCurso(curso.id, result.nombreArchivo);
      }
      alert(`¡Certificado generado exitosamente!\n\nPuedes encontrarlo en:\n- Sección "Certificados" > "Mis Solicitudes"\n- Archivo descargado: ${result.nombreArchivo}`);
    }
  };

  // Render course list
  if (!cursoDetalle) {
    return (
      <div className="space-y-6">
        <h2 className={`text-2xl font-bold ${text}`}>Mis Cursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursos.map(curso => (
            <div
              key={curso.id}
              className={`${card} rounded-lg shadow p-6 hover:shadow-xl transition cursor-pointer`}
              onClick={() => setCursoDetalle(curso)}
            >
              <div className="flex items-center justify-between mb-3">
                <BookOpen className={curso.color.replace('bg-', 'text-')} size={24} />
                <span className={`text-sm font-bold ${text}`}>{curso.progreso}%</span>
              </div>
              <h3 className={`font-bold ${text} mb-2`}>{curso.nombre}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                {curso.profesor}
              </p>
              <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mb-3`}>
                <div className={`${curso.color} h-2 rounded-full`} style={{ width: `${curso.progreso}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {curso.temas.length} temas
                </span>
                <span className="text-orange-600">{curso.tareasPendientes} tareas</span>
              </div>
              <div className={`mt-3 pt-3 border-t ${border}`}>
                <p className="text-sm text-blue-600">📅 Próxima clase: {curso.proximaClase}</p>
              </div>

              {/* Botón de generar certificado si el curso está completado */}
              {curso.progreso === 100 && (
                <div className="mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateCertificate(curso);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                  >
                    <Award size={18} />
                    Generar Certificado
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render course detail with topics
  if (!temaSeleccionado) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCursoDetalle(null)}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <ChevronLeft size={20} /> Volver a cursos
        </button>

        <div className={`${card} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h3 className={`text-2xl font-bold ${text}`}>{cursoDetalle.nombre}</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{cursoDetalle.profesor}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              <div>
                <p className={`text-3xl font-bold ${text}`}>{cursoDetalle.progreso}%</p>
                <p className="text-sm text-gray-500">Completado</p>
              </div>
              {/* Botón de certificado en vista de detalle */}
              {cursoDetalle.progreso === 100 && (
                <button
                  onClick={() => handleGenerateCertificate(cursoDetalle)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                >
                  <Award size={18} />
                  Generar Certificado
                </button>
              )}
            </div>
          </div>

          <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 mb-6`}>
            <div className={`${cursoDetalle.color} h-3 rounded-full`} style={{ width: `${cursoDetalle.progreso}%` }}></div>
          </div>

          <h4 className={`text-xl font-bold mb-4 ${text}`}>Temas del Curso</h4>
          <div className="space-y-3">
            {cursoDetalle.temas.map(tema => (
              <div
                key={tema.id}
                className={`border ${border} rounded-lg p-4 cursor-pointer hover:shadow-md transition`}
                onClick={() => {
                  setTemaSeleccionado(tema);
                  setBloqueActivo(1);
                }}
              >
                <div className="flex items-start gap-3">
                  {tema.completado ? (
                    <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                  ) : (
                    <Circle className="text-gray-400 flex-shrink-0" size={24} />
                  )}
                  <div className="flex-1">
                    <h5 className={`font-semibold ${text}`}>{tema.titulo}</h5>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tema.bloques?.length || 0} bloques • {tema.materiales.length} materiales
                    </p>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render topic detail with blocks
  const bloqueSeleccionado = temaSeleccionado.bloques?.[bloqueActivo - 1];

  return (
    <div className="space-y-6">
      <button
        onClick={() => setTemaSeleccionado(null)}
        className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
      >
        <ChevronLeft size={20} /> Volver a temas
      </button>

      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-2xl font-bold ${text} mb-4`}>{temaSeleccionado.titulo}</h3>

        {/* Block Navigation */}
        {temaSeleccionado.bloques && temaSeleccionado.bloques.length > 0 && (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {temaSeleccionado.bloques.map((bloque, index) => (
                <button
                  key={bloque.id}
                  onClick={() => setBloqueActivo(index + 1)}
                  className={`px-4 py-2 rounded whitespace-nowrap ${
                    bloqueActivo === index + 1
                      ? 'bg-blue-600 text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300`
                  }`}
                >
                  Bloque {index + 1}
                </button>
              ))}
            </div>

            {bloqueSeleccionado && (
              <div className="space-y-6">
                <div>
                  <h4 className={`text-xl font-bold ${text} mb-4`}>{bloqueSeleccionado.titulo}</h4>

                  {/* Objetivos */}
                  <div className={`${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border-l-4 border-blue-600 p-4 rounded mb-6`}>
                    <h5 className={`font-bold ${text} mb-2`}>Objetivos de Aprendizaje</h5>
                    <ul className="space-y-2">
                      {bloqueSeleccionado.objetivos.map((objetivo, idx) => (
                        <li key={idx} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex gap-2`}>
                          <span className="text-blue-600">•</span>
                          <span>{objetivo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ideas Clave */}
                  {bloqueSeleccionado.ideasClave && bloqueSeleccionado.ideasClave.length > 0 && (
                    <div className={`border ${border} rounded-lg p-4 mb-6`}>
                      <button
                        onClick={() => setExpandirIdeasClave(!expandirIdeasClave)}
                        className={`w-full flex justify-between items-center font-bold ${text}`}
                      >
                        <span>Ideas Clave</span>
                        <ChevronRight
                          className={`transform transition ${expandirIdeasClave ? 'rotate-90' : ''}`}
                          size={20}
                        />
                      </button>
                      {expandirIdeasClave && (
                        <ul className="mt-4 space-y-2">
                          {bloqueSeleccionado.ideasClave.map((idea, idx) => (
                            <li key={idx} className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex gap-2`}>
                              <span className="text-blue-600 font-bold">{idx + 1}.</span>
                              <span>{idea}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  {bloqueSeleccionado.contenido && (
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                        {bloqueSeleccionado.contenido}
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setBloqueActivo(Math.max(1, bloqueActivo - 1))}
                    disabled={bloqueActivo === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${
                      bloqueActivo === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ChevronLeft size={20} />
                    Anterior
                  </button>
                  <button
                    onClick={() => setBloqueActivo(Math.min(temaSeleccionado.bloques!.length, bloqueActivo + 1))}
                    disabled={bloqueActivo === temaSeleccionado.bloques!.length}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${
                      bloqueActivo === temaSeleccionado.bloques!.length
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Siguiente
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Materials */}
        <div className={`mt-6 pt-6 border-t ${border}`}>
          <h5 className={`font-bold ${text} mb-3`}>Materiales del Tema</h5>
          <div className="space-y-2">
            {temaSeleccionado.materiales.map((material, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                {material.toLowerCase().includes('video') ? (
                  <Play className="text-red-600" size={20} />
                ) : material.toLowerCase().includes('pdf') ? (
                  <FileText className="text-blue-600" size={20} />
                ) : (
                  <BookOpen className="text-green-600" size={20} />
                )}
                <span className={text}>{material}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
