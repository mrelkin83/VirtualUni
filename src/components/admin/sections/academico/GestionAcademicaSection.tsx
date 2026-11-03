import React, { useState } from 'react';
import { GraduationCap, BookOpen, CalendarDays, Layers } from 'lucide-react';
import { ProgramasTab } from './ProgramasTab';
import { AsignaturasTab } from './AsignaturasTab';
import { PeriodosTab } from './PeriodosTab';
import { GruposTab } from './GruposTab';

export type PestanaAcademica = 'programas' | 'asignaturas' | 'periodos' | 'grupos';

const PESTANAS: { id: PestanaAcademica; label: string; icono: React.ElementType }[] = [
  { id: 'programas', label: 'Programas', icono: GraduationCap },
  { id: 'asignaturas', label: 'Asignaturas', icono: BookOpen },
  { id: 'periodos', label: 'Periodos', icono: CalendarDays },
  { id: 'grupos', label: 'Grupos', icono: Layers },
];

/**
 * Gestión académica: Programas · Asignaturas · Periodos · Grupos.
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
      <h2 className="text-2xl font-bold text-gray-900">Gestión académica</h2>

      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px" aria-label="Pestañas de gestión académica">
          {PESTANAS.map(({ id, label, icono: Icono }) => (
            <button
              key={id}
              onClick={() => setPestana(id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium ${
                pestana === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
    </div>
  );
}
