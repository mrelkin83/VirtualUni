import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  Library,
  Mail,
  Megaphone,
  PieChart,
  Send,
  Settings,
  TrendingUp,
  Globe,
  Inbox,
  Plug,
  Upload,
  User,
  Users,
  UsersRound,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { StudentSectionType } from '../../types/student.types';
import type { SectionType as SeccionDocente } from '../../types/teacher.types';

/**
 * Navegación agrupada de los tres roles.
 *
 * Hoy el estudiante tiene 16 entradas en una lista plana y el administrador 20,
 * cada una con un color arbitrario que no codifica nada: «Trámites» y
 * «Documentos» son morados, «Usuarios» e «Inscripción» verdes, sin relación
 * entre sí. A veinte elementos, una lista plana deja de ser legible.
 *
 * Aquí las entradas se agrupan por lo que el usuario viene a hacer, no por el
 * módulo del que salieron. Cuatro o cinco listas de cinco se leen; una de
 * veinte, no. El color desaparece de las entradas: el acento solo marca la
 * activa, que es la única vez que el color dice algo.
 */

export interface EntradaNav<T extends string> {
  id: T;
  etiqueta: string;
  icono: LucideIcon;
  /** Nombre de la cuenta de no leídos que corresponda, si la hay. */
  contador?: 'mensajes' | 'tareas' | 'tramites';
}

export interface GrupoNav<T extends string> {
  titulo: string;
  entradas: EntradaNav<T>[];
}

/* ------------------------------------------------------------------ */
/* Estudiante — 16 entradas en 4 grupos                                */
/* ------------------------------------------------------------------ */

export const NAV_ESTUDIANTE: GrupoNav<StudentSectionType>[] = [
  {
    titulo: 'Cursar',
    entradas: [
      { id: 'inicio', etiqueta: 'Inicio', icono: Home },
      { id: 'miprograma', etiqueta: 'Mi programa', icono: GraduationCap },
      { id: 'cursos', etiqueta: 'Mis cursos', icono: BookOpen },
      { id: 'materiales', etiqueta: 'Materiales', icono: FolderOpen },
      { id: 'clases', etiqueta: 'Clases', icono: Video },
    ],
  },
  {
    titulo: 'Evaluación',
    entradas: [
      { id: 'tareas', etiqueta: 'Tareas', icono: FileText },
      { id: 'examenes', etiqueta: 'Exámenes', icono: ClipboardList },
      { id: 'calificaciones', etiqueta: 'Calificaciones', icono: Award },
    ],
  },
  {
    titulo: 'Recursos',
    entradas: [
      { id: 'horarios', etiqueta: 'Horarios', icono: Calendar },
      { id: 'biblioteca', etiqueta: 'Biblioteca', icono: Library },
      { id: 'comunidad', etiqueta: 'Comunidad', icono: UsersRound },
      { id: 'mensajes', etiqueta: 'Mensajes', icono: Mail, contador: 'mensajes' },
    ],
  },
  {
    titulo: 'Gestiones',
    entradas: [
      { id: 'certificados', etiqueta: 'Certificados', icono: FileCheck },
      { id: 'tramites', etiqueta: 'Trámites', icono: Send },
      { id: 'financiero', etiqueta: 'Estado de cuenta', icono: DollarSign },
      { id: 'perfil', etiqueta: 'Mi perfil', icono: User },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Docente — 14 entradas en 4 grupos                                   */
/* ------------------------------------------------------------------ */

export const NAV_DOCENTE: GrupoNav<SeccionDocente>[] = [
  {
    titulo: 'Enseñar',
    entradas: [
      { id: 'inicio', etiqueta: 'Inicio', icono: Home },
      { id: 'cursos', etiqueta: 'Mis cursos', icono: BookOpen },
      { id: 'materiales', etiqueta: 'Materiales', icono: Upload },
      { id: 'clases', etiqueta: 'Clases en vivo', icono: Video },
    ],
  },
  {
    titulo: 'Evaluar',
    entradas: [
      {
        id: 'tareas',
        etiqueta: 'Tareas',
        icono: ClipboardCheck,
        contador: 'tareas',
      },
      { id: 'examenes', etiqueta: 'Exámenes', icono: FileText },
      { id: 'calificaciones', etiqueta: 'Calificaciones', icono: BarChart3 },
      { id: 'asistencia', etiqueta: 'Asistencia', icono: ClipboardCheck },
    ],
  },
  {
    titulo: 'Personas',
    entradas: [
      { id: 'estudiantes', etiqueta: 'Estudiantes', icono: Users },
      // «Equipos de trabajo», no «Grupos»: en la estructura académica un GRUPO
      // es la asignatura dictada en un periodo (Course). Esta sección son los
      // equipos de estudiantes DENTRO de un curso (CourseGroup).
      { id: 'grupos', etiqueta: 'Equipos de trabajo', icono: UsersRound },
      { id: 'mensajes', etiqueta: 'Mensajes', icono: Mail, contador: 'mensajes' },
    ],
  },
  {
    titulo: 'Seguimiento',
    entradas: [
      { id: 'calendario', etiqueta: 'Calendario', icono: Calendar },
      { id: 'analiticas', etiqueta: 'Analíticas', icono: BarChart3 },
      { id: 'configuracion', etiqueta: 'Configuración', icono: Settings },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Administrador — 20 entradas en 5 grupos                             */
/* ------------------------------------------------------------------ */

export type SeccionAdmin =
  | 'inicio'
  | 'mensajes'
  | 'tramites'
  | 'anuncios'
  | 'mensajesmasivos'
  | 'inscripcion'
  | 'documentos'
  | 'plantillas'
  | 'usuarios'
  | 'academico'
  | 'sitioweb'
  | 'admisiones'
  | 'integraciones'
  | 'activos'
  | 'inventario'
  | 'nomina'
  | 'recursoshumanos'
  | 'biblioteca'
  | 'carnetizacion'
  | 'finanzas'
  | 'reportes'
  | 'analiticas'
  | 'configuracion'
  // Alias heredado: la búsqueda global sigue enviando a 'cursos', que hoy abre
  // la pestaña Grupos de gestión académica. No aparece en el menú, pero es una
  // sección alcanzable y por tanto una URL válida.
  | 'cursos';

export const NAV_ADMIN: GrupoNav<SeccionAdmin>[] = [
  {
    titulo: 'Académico',
    entradas: [
      { id: 'inicio', etiqueta: 'Dashboard', icono: TrendingUp },
      { id: 'academico', etiqueta: 'Gestión académica', icono: BookOpen },
      { id: 'sitioweb', etiqueta: 'Sitio web', icono: Globe },
      { id: 'admisiones', etiqueta: 'Admisiones', icono: Inbox },
      { id: 'inscripcion', etiqueta: 'Inscripción', icono: Users },
      { id: 'plantillas', etiqueta: 'Plantillas de certificado', icono: Award },
      { id: 'biblioteca', etiqueta: 'Biblioteca', icono: Library },
    ],
  },
  {
    titulo: 'Personas',
    entradas: [
      { id: 'usuarios', etiqueta: 'Usuarios', icono: Users },
      { id: 'recursoshumanos', etiqueta: 'Recursos humanos', icono: UsersRound },
      { id: 'carnetizacion', etiqueta: 'Carnetización', icono: User },
      { id: 'nomina', etiqueta: 'Nómina', icono: CreditCard },
    ],
  },
  {
    titulo: 'Finanzas',
    entradas: [
      { id: 'finanzas', etiqueta: 'Finanzas y contabilidad', icono: DollarSign },
      { id: 'activos', etiqueta: 'Gestión de activos', icono: Building2 },
      { id: 'inventario', etiqueta: 'Inventario', icono: ClipboardCheck },
    ],
  },
  {
    titulo: 'Comunicación',
    entradas: [
      { id: 'mensajes', etiqueta: 'Mensajes', icono: Mail, contador: 'mensajes' },
      { id: 'mensajesmasivos', etiqueta: 'Mensajes masivos', icono: Send },
      { id: 'anuncios', etiqueta: 'Anuncios', icono: Megaphone },
      {
        id: 'tramites',
        etiqueta: 'Trámites',
        icono: FileText,
        contador: 'tramites',
      },
      { id: 'documentos', etiqueta: 'Documentos', icono: FileText },
    ],
  },
  {
    titulo: 'Plataforma',
    entradas: [
      { id: 'integraciones', etiqueta: 'Integraciones', icono: Plug },
      { id: 'reportes', etiqueta: 'Reportes', icono: PieChart },
      { id: 'analiticas', etiqueta: 'Analíticas', icono: BarChart3 },
      { id: 'configuracion', etiqueta: 'Configuración', icono: Settings },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Validadores para la sincronización con la URL                       */
/* ------------------------------------------------------------------ */

/**
 * `alias` son secciones alcanzables que no están en el menú. Hoy solo el
 * 'cursos' del administrador, al que siguen llegando enlaces viejos desde la
 * búsqueda global. Sin esto, recargar /admin/cursos devolvería al Dashboard.
 */
function construirValidador<T extends string>(
  grupos: GrupoNav<T>[],
  alias: readonly T[] = [],
) {
  const validas = new Set<string>([
    ...grupos.flatMap((g) => g.entradas.map((e) => e.id as string)),
    ...(alias as readonly string[]),
  ]);
  return (valor: string): valor is T => validas.has(valor);
}

export const esSeccionEstudiante = construirValidador(NAV_ESTUDIANTE);
export const esSeccionDocente = construirValidador(NAV_DOCENTE);
export const esSeccionAdmin = construirValidador(NAV_ADMIN, ['cursos']);
