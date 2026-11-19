import React from 'react';
import { Award, TrendingUp } from 'lucide-react';

interface CalificacionesSectionProps {
  calificaciones: any[];
}

/**
 * Los umbrales estaban puestos sobre una escala de 0 a 10, heredada de los
 * datos de ejemplo. Las notas reales van de 0 a 100, asi que todas caian en el
 * tramo rojo. Se expresan como porcentaje para no depender de la escala.
 */
const colorPorNota = (n: number) => {
  const pct = n > 10 ? n : n * 10;
  if (pct >= 90) return 'bg-pn-ok-soft text-pn-ok';
  if (pct >= 70) return 'bg-pn-accent-soft text-pn-accent-text';
  if (pct >= 60) return 'bg-pn-warn-soft text-pn-warn';
  return 'bg-pn-danger-soft text-pn-danger';
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
  if (n === null) return <span className="text-pn-muted">-</span>;
  return (
    <span className={`inline-block px-3 py-1 rounded ${colorPorNota(n)}`}>
      {n.toFixed(decimales)}
    </span>
  );
};

export const CalificacionesSection: React.FC<CalificacionesSectionProps> = ({
  calificaciones,
}) => {
  const promedios = (calificaciones ?? [])
    .map((c) => c?.promedio)
    .filter((p): p is number => typeof p === 'number' && Number.isFinite(p));
  const promedioGeneral = promedios.length
    ? promedios.reduce((sum, p) => sum + p, 0) / promedios.length
    : null;

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold text-pn-ink`}>Calificaciones</h2>

      {/* General Average */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <div className="flex items-center gap-4">
          <div className="bg-pn-ok-soft p-4 rounded-full">
            <Award className="text-pn-ok" size={32} />
          </div>
          <div>
            <p className="text-sm text-pn-muted">Promedio General</p>
            <p className={`text-4xl font-bold text-pn-ink`}>
              {promedioGeneral === null ? '—' : promedioGeneral.toFixed(2)}
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 text-pn-ok">
              <TrendingUp size={20} />
              <span className="font-semibold">Excelente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className={`bg-pn-surface rounded-lg shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`bg-pn-surface-2`}>
              <tr>
                <th className={`text-left p-4 text-pn-ink font-semibold`}>Curso</th>
                <th className={`text-center p-4 text-pn-ink font-semibold`}>Parcial 1</th>
                <th className={`text-center p-4 text-pn-ink font-semibold`}>Parcial 2</th>
                <th className={`text-center p-4 text-pn-ink font-semibold`}>Talleres</th>
                <th className={`text-center p-4 text-pn-ink font-semibold`}>Proyecto</th>
                <th className={`text-center p-4 text-pn-ink font-semibold`}>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {(calificaciones ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-pn-muted">
                    Todavía no hay calificaciones registradas.
                  </td>
                </tr>
              ) : (
                (calificaciones ?? []).map((cal, idx) => (
                  <tr key={cal?.curso ?? idx} className={`border-t border-pn-line`}>
                    <td className={`p-4 text-pn-ink font-semibold`}>{cal?.curso ?? '—'}</td>
                    <td className="text-center p-4"><Nota valor={cal?.parcial1} /></td>
                    <td className="text-center p-4"><Nota valor={cal?.parcial2} /></td>
                    <td className="text-center p-4"><Nota valor={cal?.talleres} /></td>
                    <td className="text-center p-4"><Nota valor={cal?.proyecto} /></td>
                    <td className="text-center p-4">
                      <span
                        className={`inline-block px-4 py-2 rounded font-bold ${
                          typeof cal?.promedio === 'number'
                            ? colorPorNota(cal.promedio)
                            : 'bg-pn-surface-3 text-pn-muted'
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
