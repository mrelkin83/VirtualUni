import { EducationLevel } from '@prisma/client';

/**
 * Política académica por defecto y textos de las advertencias normativas.
 *
 * Los valores por defecto se repiten en `Program` (passingGrade, gradeScaleMax,
 * hoursPerCredit, maxRecognitionPct, minRecognitionGrade) porque allí son
 * configurables por programa; aquí viven los que se usan cuando el estudiante
 * todavía no tiene programa (p. ej. un grupo sin inscripciones a programa) y
 * los textos de las advertencias ETDH, para poder ajustarlos sin tocar lógica.
 */
export const POLITICA_ACADEMICA_POR_DEFECTO = {
  passingGrade: 3.0,
  gradeScaleMax: 5.0,
  hoursPerCredit: 48,
  maxRecognitionPct: 50,
  minRecognitionGrade: 3.0,
} as const;

/** Escala en la que se capturan las notas parciales (`Grade.grade`). */
export const ESCALA_DE_CAPTURA = 100;

export interface AdvertenciaDePensum {
  codigo: string;
  mensaje: string;
}

/**
 * Reglas de horas mínimas por nivel de formación. Son ADVERTENCIAS, no
 * bloqueos: la norma admite excepciones y el dato de horas suele llegar
 * incompleto mientras el admin arma el pensum.
 */
const REGLAS_DE_HORAS: Partial<
  Record<
    EducationLevel,
    {
      horasMinimas?: number;
      porcentajePracticaMinimo?: number;
    }
  >
> = {
  TECNICO_LABORAL: { horasMinimas: 600, porcentajePracticaMinimo: 50 },
  CONOCIMIENTOS_ACADEMICOS: { horasMinimas: 160 },
};

const TEXTOS = {
  horasInsuficientes: (nivel: string, total: number, minimo: number) =>
    `El pensum suma ${total} h y un programa de ${nivel} requiere al menos ${minimo} h. Confirma las horas reales de cada asignatura con la institución.`,
  practicaInsuficiente: (pct: number, minimo: number) =>
    `La práctica es el ${pct} % del total y debería ser al menos el ${minimo} %. Revisa el desglose de horas teóricas y prácticas.`,
  horasSinDesglose:
    'Hay asignaturas sin horas teóricas/prácticas: el porcentaje de práctica se calculó solo con las que sí lo tienen.',
} as const;

/**
 * Advertencias de un pensum según su nivel de formación. `horasTotales` y
 * `horasPracticas` vienen ya resueltas (horas explícitas o créditos ×
 * hoursPerCredit).
 */
export function advertenciasDePensum(params: {
  educationLevel: EducationLevel;
  horasTotales: number;
  horasPracticas: number;
  asignaturasSinDesglose: number;
}): AdvertenciaDePensum[] {
  const { educationLevel, horasTotales, horasPracticas, asignaturasSinDesglose } =
    params;
  const regla = REGLAS_DE_HORAS[educationLevel];
  if (!regla) return [];

  const advertencias: AdvertenciaDePensum[] = [];

  if (regla.horasMinimas != null && horasTotales < regla.horasMinimas) {
    advertencias.push({
      codigo: 'HORAS_INSUFICIENTES',
      mensaje: TEXTOS.horasInsuficientes(
        educationLevel,
        horasTotales,
        regla.horasMinimas,
      ),
    });
  }

  if (regla.porcentajePracticaMinimo != null && horasTotales > 0) {
    const pct = Math.round((horasPracticas / horasTotales) * 100);
    if (pct < regla.porcentajePracticaMinimo) {
      advertencias.push({
        codigo: 'PRACTICA_INSUFICIENTE',
        mensaje: TEXTOS.practicaInsuficiente(pct, regla.porcentajePracticaMinimo),
      });
    }
    if (asignaturasSinDesglose > 0) {
      advertencias.push({
        codigo: 'HORAS_SIN_DESGLOSE',
        mensaje: TEXTOS.horasSinDesglose,
      });
    }
  }

  return advertencias;
}
