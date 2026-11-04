/**
 * Cálculo puro de la nota definitiva de un grupo, sin Prisma, para poder
 * probarlo y reutilizarlo desde el cierre de notas y el backfill.
 *
 * Escalas: `Grade.grade` se captura de 0 a 100 en todo el sistema (lo valida
 * CreateGradeDto y lo asume el módulo de exámenes), mientras que la nota
 * aprobatoria del programa vive en la escala institucional (`gradeScaleMax`,
 * 5.0 por defecto en Colombia). Por eso el promedio ponderado se normaliza
 * antes de compararlo con `passingGrade`.
 */

/** Peso declarado 0..1; `null` significa "reparte lo que sobre". */
export interface NotaParcial {
  gradeType: string;
  grade: number;
  weight: number | null;
}

export interface NotaDefinitiva {
  /** Promedio ponderado en la escala de captura (0..100). */
  promedio100: number;
  /** El mismo valor llevado a la escala del programa. */
  finalGrade: number;
  /** Suma de los pesos declarados (0 si ninguno los trae). */
  pesoDeclarado: number;
  /** Notas que no pudieron entrar al promedio porque los pesos ya suman 1. */
  parcialesIgnorados: string[];
}

/**
 * Promedio ponderado del grupo. Las notas con `weight` usan su peso; las que
 * no lo traen se reparten en partes iguales lo que falte para completar 1. Si
 * los pesos declarados ya suman 1 (o más), las notas sin peso quedan fuera y
 * se devuelven en `parcialesIgnorados` para avisar en la previsualización.
 */
export function calcularNotaDefinitiva(
  parciales: NotaParcial[],
  gradeScaleMax: number,
): NotaDefinitiva | null {
  if (parciales.length === 0) return null;

  const conPeso = parciales.filter((p) => p.weight != null && p.weight > 0);
  const sinPeso = parciales.filter((p) => p.weight == null || p.weight === 0);
  const pesoDeclarado = conPeso.reduce((acc, p) => acc + (p.weight as number), 0);

  const resto = Math.max(0, 1 - pesoDeclarado);
  const pesoCadaUnoSinPeso = sinPeso.length > 0 ? resto / sinPeso.length : 0;

  const entradas: Array<{ grade: number; peso: number }> = [
    ...conPeso.map((p) => ({ grade: p.grade, peso: p.weight as number })),
    ...sinPeso.map((p) => ({ grade: p.grade, peso: pesoCadaUnoSinPeso })),
  ];

  const pesoTotal = entradas.reduce((acc, e) => acc + e.peso, 0);
  if (pesoTotal <= 0) return null;

  const promedio100 =
    entradas.reduce((acc, e) => acc + e.grade * e.peso, 0) / pesoTotal;

  return {
    promedio100: redondear(promedio100),
    finalGrade: redondear((promedio100 / 100) * gradeScaleMax),
    pesoDeclarado: redondear(pesoDeclarado),
    parcialesIgnorados:
      pesoCadaUnoSinPeso === 0 ? sinPeso.map((p) => p.gradeType) : [],
  };
}

/** Horas de una asignatura: las explícitas o las derivadas de los créditos. */
export function horasDeAsignatura(
  hours: number | null | undefined,
  credits: number | null | undefined,
  hoursPerCredit: number,
): number | null {
  if (hours != null) return hours;
  if (credits != null) return credits * hoursPerCredit;
  return null;
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}
