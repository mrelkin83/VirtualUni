import React from 'react';
import { Award, TrendingUp } from 'lucide-react';

interface CalificacionesSectionProps {
  calificaciones: any[];
  darkMode: boolean;
  card: string;
  text: string;
  border: string;
}

/**
 * Los umbrales estaban puestos sobre una escala de 0 a 10, heredada de los
 * datos de ejemplo. Las notas reales van de 0 a 100, asi que todas caian en el
 * tramo rojo. Se expresan como porcentaje para no depender de la escala.
 */
const colorPorNota = (n: number) => {
  const pct = n > 10 ? n : n * 10;
  if (pct >= 90) return 'bg-green-100 text-green-700';
  if (pct >= 70) return 'bg-blue-100 text-blue-700';
  if (pct >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

/**
 * Celda de nota. Antes comparaba `!== null`, pero cuando el dato llega de la
 * API los huecos son `undefined`, que no es `null`: pasaba el filtro y
 * `.toFixed()` lanzaba un TypeError que desmontaba la aplicacion entera.
 */
const Nota: React.FC<{ valor: unknown; decimales?: number }> = ({
  valor,
  decimales = 1,
}) => {
  const n = typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
  if (n === null) return <span className="text-gray-400">-</span>;
  return (
    <span className={`inline-block px-3 py-1 rounded ${colorPorNota(n)}`}>
      {n.toFixed(decimales)}
    </span>
  );
};

export const CalificacionesSection: React.FC<CalificacionesSectionProps> = ({
  calificaciones,
  darkMode,
  card,
  text,
  border
}) => {
  const promedios = (calificaciones ?? [])
    .map((c) => c?.promedio)
    .filter((p): p is number => typeof p === 'number' && Number.isFinite(p));
  const promedioGeneral = promedios.length
    ? promedios.reduce((sum, p) => sum + p, 0) / promedios.length
    : null;

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Calificaciones</h2>

      {/* General Average */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Award className="text-green-600" size={32} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Promedio General</p>
            <p className={`text-4xl font-bold ${text}`}>
              {promedioGeneral === null ? '—' : promedioGeneral.toFixed(2)}
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp size={20} />
              <span className="font-semibold">Excelente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className={`${card} rounded-lg shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`text-left p-4 ${text} font-semibold`}>Curso</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Parcial 1</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Parcial 2</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Talleres</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Proyecto</th>
                <th className={`text-center p-4 ${text} font-semibold`}>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {(calificaciones ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Todavía no hay calificaciones registradas.
                  </td>
                </tr>
              ) : (
                (calificaciones ?? []).map((cal, idx) => (
                  <tr key={cal?.curso ?? idx} className={`border-t ${border}`}>
                    <td className={`p-4 ${text} font-semibold`}>{cal?.curso ?? '—'}</td>
                    <td className="text-center p-4"><Nota valor={cal?.parcial1} /></td>
                    <td className="text-center p-4"><Nota valor={cal?.parcial2} /></td>
                    <td className="text-center p-4"><Nota valor={cal?.talleres} /></td>
                    <td className="text-center p-4"><Nota valor={cal?.proyecto} /></td>
                    <td className="text-center p-4">
                      <span
                        className={`inline-block px-4 py-2 rounded font-bold ${
                          typeof cal?.promedio === 'number'
                            ? colorPorNota(cal.promedio)
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {typeof cal?.promedio === 'number'
                          ? cal.promedio.toFixed(2)
                          : '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
