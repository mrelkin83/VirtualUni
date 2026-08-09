// Tipos para el Panel de Estudiante

export interface StudentCourse {
  id: number;
  nombre: string;
  progreso: number;
  color: string;
  tareasPendientes: number;
  proximaClase: string;
  profesor: string;
  temas: CourseTopic[];
}

export interface CourseTopic {
  id: number;
  titulo: string;
  completado: boolean;
  materiales: string[];
  bloques?: TopicBlock[];
}

export interface TopicBlock {
  id: number;
  titulo: string;
  objetivos: string[];
  ideasClave?: string[];
  contenido?: string;
}

export interface StudentTask {
  id: number;
  titulo: string;
  curso: string;
  fechaLimite: string;
  fechaEntrega?: string;
  estado: 'pendiente' | 'entregada' | 'calificada';
  calificacion?: number;
  descripcion?: string;
}

export interface StudentExam {
  id: number | string; // number en datos mock, uuid string cuando viene del API
  titulo: string;
  curso: string;
  fecha: string;
  duracion: string;
  estado: string;
  calificacion?: number;
  preguntas?: ExamQuestion[];
}

export interface ExamQuestion {
  id: number | string;
  pregunta: string;
  tipo: 'multiple' | 'verdadero-falso' | 'abierta';
  opciones?: string[];
  respuestaCorrecta?: any;
}

export interface StudentMessage {
  id: number;
  remitente: string;
  asunto: string;
  preview: string;
  fecha: string;
  leido: boolean;
  tipo: 'recibido' | 'enviado';
  avatar: string;
}

export interface StudentProfile {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  email: string;
  programa: string;
  semestre: string;
  codigo: string;
  [key: string]: any;
}

export interface Pago {
  id: number;
  concepto: string;
  monto: number;
  fecha: string;
  metodoPago: string;
  estado: 'completado' | 'pendiente' | 'vencido';
  comprobante?: string;
}

export interface Deuda {
  id: number;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  estado: 'pendiente' | 'vencido';
}

export interface ResumenFinanciero {
  totalPagado: number;
  saldoPendiente: number;
  proximoVencimiento: string;
  ultimoPago: number;
}

export interface Book {
  id: string | number;
  titulo: string;
  autor: string;
  categoria: string;
  disponible: boolean;
  portada?: string;
  descripcion?: string;
  isbn?: string;
  editorial?: string;
  anioPublicacion?: number;
  copias?: number;
  copiasDisponibles?: number;
}

export interface LibraryLoan {
  id: string | number;
  libroId: string | number;
  libroTitulo: string;
  libroAutor: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  estado: 'activo' | 'devuelto' | 'vencido';
  diasRestantes?: number;
}

export interface LibraryReservation {
  id: string | number;
  libroId: string | number;
  libroTitulo: string;
  fechaReserva: string;
  estado: 'pendiente' | 'disponible' | 'cancelada';
}

// Tipos para Foros
export interface ForumTopic {
  id: string | number;
  titulo: string;
  descripcion: string;
  autor: string;
  curso: string;
  fechaCreacion: string;
  respuestas: number;
  vistas: number;
  ultimaActividad: string;
  estado: 'abierto' | 'cerrado' | 'destacado';
  categoria: 'general' | 'academico' | 'dudas' | 'proyectos';
}

export interface ForumReply {
  id: string | number;
  topicoId: string | number;
  autor: string;
  contenido: string;
  fecha: string;
  likes: number;
  esRespuestaProfesor: boolean;
}

// Tipos para Horarios
export interface ScheduleClass {
  id: string | number;
  curso: string;
  profesor: string;
  dia: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  horaInicio: string;
  horaFin: string;
  aula: string;
  tipo: 'presencial' | 'virtual' | 'hibrido';
  enlaceVirtual?: string;
  color: string;
}

export interface ScheduleEvent {
  id: string | number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  tipo: 'examen' | 'entrega' | 'evento' | 'reunion';
  curso?: string;
  prioridad: 'alta' | 'media' | 'baja';
}

// Tipos para Certificados
export interface Certificate {
  id: string | number;
  tipo: string;
  descripcion: string;
  estado: 'disponible' | 'en_proceso' | 'rechazado';
  fechaSolicitud?: string;
  fechaEmision?: string;
  costo: number;
  requiereAprobacion: boolean;
  tiempoEstimado?: string;
}

export interface CertificateRequest {
  id: string | number;
  tipoCertificado: string;
  fechaSolicitud: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'completado';
  observaciones?: string;
  fechaEstimada?: string;
  archivoUrl?: string;
}

// Tipos para Clases
export interface Clase {
  id: string | number;
  titulo: string;
  curso: string;
  profesor: string;
  tipo: 'en_vivo' | 'grabada';
  fecha: string;
  duracion: string;
  estado: 'programada' | 'en_curso' | 'finalizada' | 'disponible';
  enlace?: string;
  descripcion?: string;
  asistentes?: number;
  grabacionUrl?: string;
  materialesAdjuntos?: string[];
}

// Tipos para Comunidad
export interface ComunidadPost {
  id: string | number;
  autor: string;
  avatarAutor: string;
  contenido: string;
  fecha: string;
  likes: number;
  comentarios: number;
  compartidos: number;
  imagenes?: string[];
  esProfesor: boolean;
  curso?: string;
}

export interface ComunidadComentario {
  id: string | number;
  postId: string | number;
  autor: string;
  avatarAutor: string;
  contenido: string;
  fecha: string;
  likes: number;
}

export type StudentSectionType =
  | 'inicio'
  | 'cursos'
  | 'tareas'
  | 'examenes'
  | 'calificaciones'
  | 'mensajes'
  | 'clases'
  | 'biblioteca'
  | 'horarios'
  | 'certificados'
  | 'tramites'
  | 'financiero'
  | 'perfil'
  | 'comunidad';
