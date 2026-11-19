import { EducationLevel, InstitutionType } from '@prisma/client';

/**
 * Diccionario de textos del sitio público por tipo de institución.
 *
 * Regla de §0.1: el tipo de institución SOLO pone valores por defecto de la
 * interfaz; la lógica real (qué otorga el programa, su unidad de duración, su
 * identificador oficial) se decide por el EducationLevel de CADA programa.
 * Nada de "semestre" o "pregrado" escrito a mano en las plantillas: todo sale
 * de aquí. El admin recibe este mismo diccionario por API (GET admin/sitio-web),
 * así la SPA y las plantillas comparten una única fuente.
 */

export interface TextosUI {
  /** "Inscripciones" | "Admisiones" */
  inscripciones: string;
  /** Verbo del botón principal */
  inscribete: string;
  /** "programa" | "grado" */
  unidadOferta: string;
  ofertaTitulo: string;
  ofertaSubtitulo: string;
  /** Quién llena el formulario por defecto */
  quienLlena: 'aspirante' | 'acudiente';
  /** Rótulo legal de vigilancia: IES → Mineducación; ETDH y colegios → SED. */
  vigilada: string;
}

export const TEXTOS_POR_TIPO: Record<InstitutionType, TextosUI> = {
  COLEGIO: {
    inscripciones: 'Admisiones',
    inscribete: 'Inscríbete',
    unidadOferta: 'grado',
    ofertaTitulo: 'Nuestros niveles',
    ofertaSubtitulo: 'De preescolar a once, una sola comunidad.',
    quienLlena: 'acudiente',
    vigilada: 'Vigilado · Secretaría de Educación',
  },
  ETDH: {
    inscripciones: 'Inscripciones',
    inscribete: 'Inscríbete',
    unidadOferta: 'programa',
    ofertaTitulo: 'Nuestra oferta',
    ofertaSubtitulo: 'Programas de formación laboral con registro oficial.',
    quienLlena: 'aspirante',
    vigilada: 'Vigilado · Secretaría de Educación',
  },
  TECNICA_PROFESIONAL: {
    inscripciones: 'Inscripciones',
    inscribete: 'Inscríbete',
    unidadOferta: 'programa',
    ofertaTitulo: 'Nuestra oferta',
    ofertaSubtitulo: 'Programas técnicos profesionales para el mundo real.',
    quienLlena: 'aspirante',
    vigilada: 'Vigilada Mineducación',
  },
  TECNOLOGICA: {
    inscripciones: 'Inscripciones',
    inscribete: 'Inscríbete',
    unidadOferta: 'programa',
    ofertaTitulo: 'Nuestra oferta',
    ofertaSubtitulo: 'Programas tecnológicos y de educación continua.',
    quienLlena: 'aspirante',
    vigilada: 'Vigilada Mineducación',
  },
  UNIVERSITARIA: {
    inscripciones: 'Inscripciones',
    inscribete: 'Inscríbete',
    unidadOferta: 'programa',
    ofertaTitulo: 'Nuestra oferta',
    ofertaSubtitulo: 'Pregrado, posgrado y educación continua.',
    quienLlena: 'aspirante',
    vigilada: 'Vigilada Mineducación',
  },
  UNIVERSIDAD: {
    inscripciones: 'Inscripciones',
    inscribete: 'Inscríbete',
    unidadOferta: 'programa',
    ofertaTitulo: 'Nuestra oferta',
    ofertaSubtitulo: 'Pregrado, posgrado y educación continua.',
    quienLlena: 'aspirante',
    vigilada: 'Vigilada Mineducación',
  },
  MIXTA: {
    inscripciones: 'Inscripciones',
    inscribete: 'Inscríbete',
    unidadOferta: 'programa',
    ofertaTitulo: 'Nuestra oferta',
    ofertaSubtitulo: 'Formación para cada etapa de tu vida.',
    quienLlena: 'aspirante',
    vigilada: 'Vigilada Mineducación',
  },
};

/** Categoría pública de nivel (filtro de la oferta). */
export type CategoriaPublica =
  | 'pregrado'
  | 'posgrado'
  | 'tecnico-laboral'
  | 'educacion-continua'
  | 'colegio';

export const CATEGORIA_POR_NIVEL: Record<EducationLevel, CategoriaPublica> = {
  TECNICO_PROFESIONAL: 'pregrado',
  TECNOLOGICO: 'pregrado',
  PROFESIONAL_UNIVERSITARIO: 'pregrado',
  ESPECIALIZACION: 'posgrado',
  MAESTRIA: 'posgrado',
  DOCTORADO: 'posgrado',
  TECNICO_LABORAL: 'tecnico-laboral',
  CONOCIMIENTOS_ACADEMICOS: 'tecnico-laboral',
  PREESCOLAR: 'colegio',
  BASICA_PRIMARIA: 'colegio',
  BASICA_SECUNDARIA: 'colegio',
  MEDIA_BACHILLERATO: 'colegio',
  BACHILLERATO_POR_CICLOS: 'colegio',
  DIPLOMADO: 'educacion-continua',
  CURSO_LIBRE: 'educacion-continua',
  TALLER: 'educacion-continua',
  SEMINARIO: 'educacion-continua',
  OTRO: 'educacion-continua',
};

export const ETIQUETA_CATEGORIA: Record<CategoriaPublica, string> = {
  pregrado: 'Pregrado',
  posgrado: 'Posgrado',
  'tecnico-laboral': 'Técnico laboral',
  'educacion-continua': 'Educación continua',
  colegio: 'Colegio',
};

/** Subtipo visible en la tarjeta (la referencia muestra el tipo de posgrado). */
export const ETIQUETA_NIVEL: Record<EducationLevel, string> = {
  TECNICO_PROFESIONAL: 'Técnico profesional',
  TECNOLOGICO: 'Tecnológico',
  PROFESIONAL_UNIVERSITARIO: 'Profesional universitario',
  ESPECIALIZACION: 'Especialización',
  MAESTRIA: 'Maestría',
  DOCTORADO: 'Doctorado',
  TECNICO_LABORAL: 'Técnico laboral',
  CONOCIMIENTOS_ACADEMICOS: 'Conocimientos académicos',
  PREESCOLAR: 'Preescolar',
  BASICA_PRIMARIA: 'Básica primaria',
  BASICA_SECUNDARIA: 'Básica secundaria',
  MEDIA_BACHILLERATO: 'Media / Bachillerato',
  BACHILLERATO_POR_CICLOS: 'Bachillerato por ciclos',
  DIPLOMADO: 'Diplomado',
  CURSO_LIBRE: 'Curso libre',
  TALLER: 'Taller',
  SEMINARIO: 'Seminario',
  OTRO: 'Programa',
};

export const ETIQUETA_MODALIDAD: Record<string, string> = {
  PRESENCIAL: 'Presencial',
  VIRTUAL: 'Virtual',
  HIBRIDA: 'Híbrida',
  DISTANCIA: 'A distancia',
};

const ES_ETDH = (n: EducationLevel) =>
  n === 'TECNICO_LABORAL' || n === 'CONOCIMIENTOS_ACADEMICOS';

const ES_COLEGIO = (n: EducationLevel) => CATEGORIA_POR_NIVEL[n] === 'colegio';

/**
 * Rótulo de lo que otorga el programa. En ETDH NUNCA se usa la palabra
 * "título": es un certificado de aptitud ocupacional (§0.1 y normas de
 * publicidad del sector).
 */
export function rotuloOtorga(nivel: EducationLevel): string {
  if (ES_ETDH(nivel)) return 'Certificado que otorga';
  if (ES_COLEGIO(nivel)) {
    return nivel === 'MEDIA_BACHILLERATO' || nivel === 'BACHILLERATO_POR_CICLOS'
      ? 'Título que otorga'
      : 'Nivel';
  }
  if (CATEGORIA_POR_NIVEL[nivel] === 'educacion-continua') return 'Certificado que otorga';
  return 'Título que otorga';
}

export function textoOtorga(nivel: EducationLevel, degreeTitle?: string | null): string | null {
  if (degreeTitle) {
    // Defensa en profundidad: a un programa ETDH jamás se le muestra "Título de…"
    if (ES_ETDH(nivel) && /^\s*t[ií]tulo/i.test(degreeTitle)) {
      return degreeTitle.replace(/^\s*t[ií]tulo\s+(de\s+)?/i, 'Certificado de ');
    }
    return degreeTitle;
  }
  if (ES_ETDH(nivel)) return 'Certificado de técnico laboral por competencias';
  return null;
}

/** Rótulo del identificador oficial según el nivel (SNIES / registro / licencia). */
export function rotuloIdentificador(nivel: EducationLevel): string {
  if (ES_ETDH(nivel)) return 'Registro del programa';
  if (ES_COLEGIO(nivel)) return 'Licencia de funcionamiento';
  if (CATEGORIA_POR_NIVEL[nivel] === 'educacion-continua') return 'Registro';
  return 'Código SNIES';
}

/** Duración visible en la unidad del programa: "6 semestres", "620 horas", "11 grados". */
export function textoDuracion(p: {
  educationLevel: EducationLevel;
  academicUnit: string;
  periodStructure: string;
  durationPeriods?: number | null;
  totalHours?: number | null;
  totalCredits?: number | null;
}): string {
  const partes: string[] = [];
  if (p.academicUnit === 'HORAS' && p.totalHours) {
    partes.push(`${p.totalHours} horas`);
    if (p.durationPeriods && p.periodStructure === 'MODULAR') partes.push(`${p.durationPeriods} módulos`);
  } else if (ES_COLEGIO(p.educationLevel)) {
    if (p.durationPeriods) partes.push(p.durationPeriods === 1 ? '1 grado' : `${p.durationPeriods} grados`);
  } else if (p.durationPeriods) {
    const unidad =
      p.periodStructure === 'SEMESTRAL' ? 'semestres'
      : p.periodStructure === 'CUATRIMESTRAL' ? 'cuatrimestres'
      : p.periodStructure === 'TRIMESTRAL' ? 'trimestres'
      : p.periodStructure === 'ANUAL' ? 'años'
      : p.periodStructure === 'POR_CICLOS' ? 'ciclos'
      : p.periodStructure === 'MODULAR' ? 'módulos'
      : 'periodos';
    partes.push(p.durationPeriods === 1 ? `1 ${unidad.replace(/s$/, '')}` : `${p.durationPeriods} ${unidad}`);
    if (p.totalCredits) partes.push(`${p.totalCredits} créditos`);
  } else if (p.totalHours) {
    partes.push(`${p.totalHours} horas`);
  }
  return partes.join(' · ');
}

/** Nombre del nivel del pensum: "Semestre 3", "Módulo 2", "Grado 10". */
export function nombreNivelPensum(periodStructure: string, nivel: EducationLevel, n: number): string {
  if (ES_COLEGIO(nivel)) return n === 0 ? 'Transición' : `Grado ${n}`;
  switch (periodStructure) {
    case 'SEMESTRAL': return `Semestre ${n}`;
    case 'CUATRIMESTRAL': return `Cuatrimestre ${n}`;
    case 'TRIMESTRAL': return `Trimestre ${n}`;
    case 'ANUAL': return `Año ${n}`;
    case 'POR_CICLOS': return `Ciclo ${n}`;
    case 'MODULAR': return `Módulo ${n}`;
    default: return `Nivel ${n}`;
  }
}
