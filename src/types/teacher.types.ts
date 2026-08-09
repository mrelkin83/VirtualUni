// Tipos para el Panel de Docente

export interface Course {
  id: number;
  nombre: string;
  codigo: string;
  estudiantes: number;
  tareasPendientesRevision: number;
  progresoGeneral: number;
  color: string;
}

export interface Student {
  id: number;
  nombre: string;
  email: string;
  curso: string;
  progreso: number;
  calificacionActual: number;
  tareasPendientes: number;
  ultimaActividad: string;
}

export interface EstudianteDetalle extends Student {
  telefono?: string;
  fechaInscripcion: string;
  historialCalificaciones: {
    tarea: string;
    calificacion: number;
    fecha: string;
    curso: string;
  }[];
  asistencia: {
    total: number;
    presente: number;
    ausente: number;
    porcentaje: number;
  };
  tareasEntregadas: number;
  tareasRevisadas: number;
  promedioGeneral: number;
  cursosInscritos: string[];
  ultimasActividades: {
    tipo: 'entrega' | 'examen' | 'asistencia' | 'mensaje';
    descripcion: string;
    fecha: string;
  }[];
}

export interface Submission {
  id: number;
  tareaId: number;
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

export interface Assignment {
  id: number;
  titulo: string;
  curso: string;
  fechaLimite: string;
  entregasTotales: number;
  entregasRevisadas: number;
  submissions?: Submission[];
}

export interface Exam {
  id: number;
  titulo: string;
  curso: string;
  fecha: string;
  duracion: string;
  estado: string;
  participantes: number;
}

export interface Question {
  id: number;
  tipo: 'multiple' | 'verdadero-falso' | 'abierta' | 'multiple-imagen';
  pregunta: string;
  opciones?: string[];
  imagenUrl?: string;
  opcionesConImagenes?: { texto: string; imagenUrl?: string }[];
  respuestaCorrecta?: number | boolean | string;
  puntos: number;
  categoria: string;
  explicacion?: string;
}

export interface ExamDetalle extends Exam {
  preguntas: Question[];
  instrucciones?: string;
  puntajeTotal: number;
  notaMinima?: number;
  intentosPermitidos?: number;
  mostrarResultados?: boolean;
  mezclarPreguntas?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

// Tipos para Grupos
export interface Grupo {
  id: number;
  nombre: string;
  curso: string;
  codigo: string;
  estudiantesActivos: number;
  estudiantesTotales: number;
  progreso: number;
  horario: string;
  aula: string;
  color: string;
  proximaClase: string;
}

export interface GrupoDetalle {
  id: number;
  nombre: string;
  codigo: string;
  curso: string;
  descripcion: string;
  horarios: {
    dia: string;
    horaInicio: string;
    horaFin: string;
    aula: string;
  }[];
  estudiantes: {
    id: number;
    nombre: string;
    email: string;
    progreso: number;
    calificacion: number;
    asistencia: number;
  }[];
  estadisticas: {
    progresoPromedio: number;
    asistenciaPromedio: number;
    calificacionPromedio: number;
    tareasEntregadas: number;
    tareasPendientes: number;
  };
}

// Tipos para Materiales
export interface Material {
  id: number;
  nombre: string;
  tipo: 'pdf' | 'video' | 'documento' | 'presentacion' | 'imagen' | 'enlace' | 'otro';
  url: string;
  tamaño?: string;
  duracion?: string;
  fechaSubida: string;
  curso: string;
  modulo?: string;
  tema?: string;
  descargas?: number;
  vistas?: number;
}

export interface CarpetaMaterial {
  id: number;
  nombre: string;
  curso: string;
  materiales: number[]; // IDs en lugar de objetos
  subcarpetas?: CarpetaMaterial[];
}

// Tipos para Clases en Vivo
export interface ClaseVivo {
  id: number;
  titulo: string;
  curso: string;
  tipo: 'programada' | 'en_curso' | 'finalizada' | 'pregrabada';
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracion: string;
  enlaceReunion?: string;
  plataforma: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Otra';
  descripcion?: string;
  grabacionUrl?: string;
  participantes?: {
    id: number;
    nombre: string;
    asistio: boolean;
    minutosConectado?: number;
  }[];
  materialesCompartidos?: string[];
  grabacionDisponible?: boolean;
}

export type SectionType =
  | 'inicio'
  | 'cursos'
  | 'estudiantes'
  | 'tareas'
  | 'examenes'
  | 'calificaciones'
  | 'asistencia'
  | 'mensajes'
  | 'materiales'
  | 'clases'
  | 'calendario'
  | 'analiticas'
  | 'configuracion'
  | 'grupos';
