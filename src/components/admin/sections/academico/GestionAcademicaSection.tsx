import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CalendarDays,
  Layers,
  Network,
  FileCheck,
  ArrowLeftRight,
} from 'lucide-react';
import { ProgramasTab } from './ProgramasTab';
import { AsignaturasTab } from './AsignaturasTab';
import { PeriodosTab } from './PeriodosTab';
import { GruposTab } from './GruposTab';
import { ArticulacionTab } from './ArticulacionTab';
import { HomologacionesTab } from './HomologacionesTab';
import { EquivalenciasTab } from './EquivalenciasTab';

export type PestanaAcademica =
  | 'programas'
  | 'asignaturas'
  | 'periodos'
  | 'grupos'
  | 'articulacion'
  | 'homologaciones'
  | 'equivalencias';

const PESTANAS: { id: PestanaAcademica; label: string; icono: React.ElementType }[] = [
  { id: 'programas', label: 'Programas', icono: GraduationCap },
  { id: 'asignaturas', label: 'Asignaturas', icono: BookOpen },
  { id: 'periodos', label: 'Periodos', icono: CalendarDays },
  { id: 'grupos', label: 'Grupos', icono: Layers },
  { id: 'articulacion', label: 'Articulación', icono: Network },
  { id: 'homologaciones', label: 'Homologaciones', icono: FileCheck },
  { id: 'equivalencias', label: 'Equivalencias', icono: ArrowLeftRight },
];

/**
 * Gestión académica: Programas · Asignaturas · Periodos · Grupos ·
 * Articulación · Homologaciones · Equivalencias.
 * La antigua sección "Cursos" vive aquí como la pestaña "Grupos" (un grupo es
 * una asignatura dictada en un periodo por un docente).
 */
export function GestionAcademicaSection({
  pestanaInicial = 'programas',
}: {
  pestanaInicial?: PestanaAcademica;
}) {
  const [pestana, setPestana] = useState<PestanaAcademica>(pestanaInicial);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-pn-ink">Gestión académica</h2>

      {/* Las pestañas se desplazan en vez de envolverse: son ocho y a 390 px
          se salían 570 px. Apiladas ocuparían media pantalla. */}
      <div className="pn-scroll overflow-x-auto border-b border-pn-line">
        <nav className="flex w-max gap-1 -mb-px" aria-label="Pestañas de gestión académica">
          {PESTANAS.map(({ id, label, icono: Icono }) => (
            <button
              key={id}
              onClick={() => setPestana(id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium ${
                pestana === id
                  ? 'border-pn-accent-line text-pn-accent-text'
                  : 'border-transparent text-pn-muted hover:text-pn-ink-2 hover:border-pn-line'
              }`}
              aria-current={pestana === id ? 'page' : undefined}
            >
              <Icono size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {pestana === 'programas' && <ProgramasTab />}
      {pestana === 'asignaturas' && <AsignaturasTab />}
      {pestana === 'periodos' && <PeriodosTab />}
      {pestana === 'grupos' && <GruposTab />}
      {pestana === 'articulacion' && <ArticulacionTab />}
      {pestana === 'homologaciones' && <HomologacionesTab />}
      {pestana === 'equivalencias' && <EquivalenciasTab />}
    </div>
  );
}
