import React from 'react';
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { StudentExam } from '../../../types/student.types';

/**
 * Pantalla para rendir un examen.
 *
 * El backend tenía el módulo completo --crear intento, enviar respuestas,
 * calificar-- y el hook ya exponía `examenActivo`, `respuestasExamen`,
 * `preguntaActual`, `tiempoRestante` y `finalizarExamen`, pero ningún
 * componente los consumía: al pulsar "Iniciar examen" se creaba el intento en
 * el servidor y no se abría nada. Esta es la mitad que faltaba.
 */
interface Props {
  examen: StudentExam;
  respuestas: Record<string | number, number>;
  setRespuestas: (r: Record<string | number, number>) => void;
  preguntaActual: number;
  setPreguntaActual: (n: number) => void;
  tiempoRestante: number | null;
  finalizarExamen: () => void;
  abandonar: () => void;
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

const formatearTiempo = (segundos: number | null): string => {
  if (segundos === null || !Number.isFinite(segundos)) return '--:--';
  const s = Math.max(0, Math.floor(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dosCifras = (n: number) => String(n).padStart(2, '0');
  return h > 0
    ? `${dosCifras(h)}:${dosCifras(m)}:${dosCifras(seg)}`
    : `${dosCifras(m)}:${dosCifras(seg)}`;
};

export const RendirExamenSection: React.FC<Props> = ({
  examen,
  respuestas,
  setRespuestas,
  preguntaActual,
  setPreguntaActual,
  tiempoRestante,
  finalizarExamen,
  abandonar,
  darkMode,
  card,
  text,
  border,
}) => {
  const preguntas = examen.preguntas ?? [];
  const total = preguntas.length;

  if (total === 0) {
    return (
      <div className={`${card} rounded-lg shadow p-8 text-center space-y-4`}>
        <AlertCircle className="mx-auto text-orange-500" size={40} />
        <h2 className={`text-xl font-bold ${text}`}>{examen.titulo}</h2>
        <p className="text-gray-500">
          Este examen no tiene preguntas cargadas. Avisa a tu docente antes de continuar.
        </p>
        <button
          onClick={abandonar}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Volver a mis exámenes
        </button>
      </div>
    );
  }

  const indice = Math.min(Math.max(preguntaActual, 0), total - 1);
  const pregunta = preguntas[indice];
  const contestadas = preguntas.filter((p) => respuestas[p.id] !== undefined).length;
  const quedaPoco = tiempoRestante !== null && tiempoRestante <= 300;

  const responder = (opcion: number) =>
    setRespuestas({ ...respuestas, [pregunta.id]: opcion });

  return (
    <div className="space-y-6">
      {/* Cabecera: examen, avance y tiempo */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${text}`}>{examen.titulo}</h2>
            <p className="text-sm text-gray-500">{examen.curso}</p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${
              quedaPoco ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            <Clock size={18} />
            {formatearTiempo(tiempoRestante)}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Pregunta {indice + 1} de {total}</span>
            <span>{contestadas} de {total} contestadas</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${(contestadas / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pregunta */}
      <div className={`${card} rounded-lg shadow p-6 space-y-4`}>
        <p className={`text-lg font-semibold ${text}`}>{pregunta.pregunta}</p>

        <div className="space-y-2">
          {(pregunta.opciones ?? []).map((opcion: string, i: number) => {
            const elegida = respuestas[pregunta.id] === i;
            return (
              <label
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  elegida
                    ? 'border-blue-600 bg-blue-50'
                    : `${border} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`
                }`}
              >
                <input
                  type="radio"
                  name={`pregunta-${pregunta.id}`}
                  checked={elegida}
                  onChange={() => responder(i)}
                  className="w-4 h-4"
                />
                <span className={elegida ? 'text-blue-900 font-medium' : text}>{opcion}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Navegación */}
      <div className={`${card} rounded-lg shadow p-4 flex flex-wrap items-center gap-3`}>
        <button
          onClick={() => setPreguntaActual(indice - 1)}
          disabled={indice === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Anterior
        </button>

        <div className="flex flex-wrap gap-1">
          {preguntas.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPreguntaActual(i)}
              className={`w-8 h-8 rounded text-sm font-semibold ${
                i === indice
                  ? 'bg-blue-600 text-white'
                  : respuestas[p.id] !== undefined
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPreguntaActual(indice + 1)}
          disabled={indice === total - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 disabled:opacity-40"
        >
          Siguiente <ChevronRight size={16} />
        </button>

        <div className="ml-auto flex gap-2">
          <button
            onClick={abandonar}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Salir sin enviar
          </button>
          <button
            onClick={finalizarExamen}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            <CheckCircle size={18} /> Enviar examen
          </button>
        </div>
      </div>

      {contestadas < total && (
        <p className="text-sm text-orange-600 flex items-center gap-2">
          <AlertCircle size={16} />
          Te quedan {total - contestadas} preguntas sin contestar.
        </p>
      )}
    </div>
  );
};
