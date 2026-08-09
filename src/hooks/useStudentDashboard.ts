import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { notificationsService } from '../services/notifications.service';
import {
  coursesApi,
  assignmentsApi,
  gradesApi,
  messagesApi,
} from '../api/endpoints/student';
import { usersApi } from '../api/endpoints/users';
import { examsApi } from '../api/endpoints/exams';
import { libraryApi } from '../api/endpoints/library';
import { forumsApi } from '../api/endpoints/forums';
import { communityApi } from '../api/endpoints/community';
import { certificatesApi } from '../api/endpoints/certificates';
import { scheduleApi } from '../api/endpoints/schedule';
import { liveClassesApi } from '../api/endpoints/live-classes';
import { financeApi } from '../api/endpoints/finance';
import {
  StudentSectionType,
  StudentCourse,
  StudentTask,
  StudentExam,
  StudentProfile,
  Book,
  LibraryLoan,
  LibraryReservation,
  ForumTopic,
  ForumReply,
  ScheduleClass,
  ScheduleEvent,
  Certificate,
  CertificateRequest,
  Clase,
  ComunidadPost
} from '../types/student.types';
import {
  studentMensajes,
  studentCursos,
  clasesVivo,
  clasesGrabadas,
  studentTareas,
  studentExamenes,
  calificaciones,
  libros,
  prestamosActivos,
  reservasLibros,
  forosTopicos,
  forosRespuestas,
  horarioClases,
  horarioEventos,
  certificadosDisponibles,
  solicitudesCertificados,
  solicitudes,
  tramites,
  tramitesDisponibles,
  anuncios,
  datosPerfil as datosPerfilInicial,
  historialPagos,
  deudasPendientes,
  resumenFinanciero,
  clasesData,
  examenesData as studentExamenesData,
  comunidadPosts
} from '../data/studentMockData';

/**
 * Nombre del usuario autenticado, para firmar lo que publica. Antes se ponia
 * literalmente 'Dayla Otalvaro' en cada publicacion optimista, asi que el
 * alumno veia sus propios mensajes atribuidos a otra persona hasta recargar.
 */
const nombreDelUsuario = (): string => {
  const u = (useAuthStore as any).getState?.()?.user;
  return [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Yo';
};

const inicialesDelUsuario = (): string =>
  nombreDelUsuario()
    .split(' ')
    .map((p: string) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

/**
 * La API devuelve una fila por nota (gradeType, grade, weight, course), pero la
 * tabla de calificaciones espera una fila por curso con una columna por tipo.
 * Sin esta conversión las filas llegaban en crudo, `cal.parcial1` era
 * `undefined` y `.toFixed()` lanzaba un TypeError que desmontaba el panel
 * entero: la sección se quedaba en blanco.
 */
const agruparNotasPorCurso = (notas: any[]) => {
  const porCurso = new Map<string, any>();

  for (const n of notas) {
    const nombre = n?.course?.name ?? n?.courseId ?? 'Sin curso';
    if (!porCurso.has(nombre)) {
      porCurso.set(nombre, {
        curso: nombre,
        parcial1: null,
        parcial2: null,
        talleres: null,
        proyecto: null,
        promedio: null,
        _suma: 0,
        _peso: 0,
      });
    }
    const fila = porCurso.get(nombre);
    const valor = typeof n?.grade === 'number' ? n.grade : null;
    if (valor === null) continue;

    // El tipo viene tal cual del backend: parcial1, parcial2, talleres,
    // proyecto. Si apareciera uno nuevo no se pierde, entra en el promedio.
    if (n.gradeType in fila) fila[n.gradeType] = valor;

    const peso = typeof n?.weight === 'number' && n.weight > 0 ? n.weight : 1;
    fila._suma += valor * peso;
    fila._peso += peso;
  }

  return [...porCurso.values()].map(({ _suma, _peso, ...fila }) => ({
    ...fila,
    promedio: _peso > 0 ? _suma / _peso : null,
  }));
};

export const useStudentDashboard = () => {
  // Navigation and UI State
  const [activeSection, setActiveSection] = useState<StudentSectionType>('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Messaging State
  const [conversacionActiva, setConversacionActiva] = useState<any>(null);
  const [nuevoMensajeModal, setNuevoMensajeModal] = useState(false);
  const [mensajesAbiertas, setMensajesAbiertas] = useState(false);
  const [mensajes, setMensajes] = useState(studentMensajes);

  // Exam State
  const [examenActivo, setExamenActivo] = useState<StudentExam | null>(null);
  const [attemptActivoId, setAttemptActivoId] = useState<string | null>(null);
  const [respuestasExamen, setRespuestasExamen] = useState<Record<string | number, number>>({});
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [examenes, setExamenes] = useState(studentExamenes);

  // Course State
  const [cursoDetalle, setCursoDetalle] = useState<StudentCourse | null>(null);
  const [temaSeleccionado, setTemaSeleccionado] = useState<any>(null);
  const [bloqueActivo, setBloqueActivo] = useState(1);
  const [expandirIdeasClave, setExpandirIdeasClave] = useState(false);
  const [cursos, setCursos] = useState(studentCursos);

  // Tasks State
  const [modalTarea, setModalTarea] = useState<StudentTask | null>(null);
  const [archivoTarea, setArchivoTarea] = useState<File | null>(null);
  const [comentarioTarea, setComentarioTarea] = useState('');
  const [tareas, setTareas] = useState(studentTareas);

  // Classes State
  const [claseActiva, setClaseActiva] = useState<any>(null);
  const [tipoClase, setTipoClase] = useState<'vivo' | 'grabada'>('vivo');
  const [clasesVivoData, setClasesVivoData] = useState<any[]>(clasesVivo);
  const [clasesGrabadasData, setClasesGrabadasData] = useState<any[]>(clasesGrabadas);

  // Administrative State
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [tipoSolicitud, setTipoSolicitud] = useState('');
  const [solicitudesData, setSolicitudesData] = useState(solicitudes);

  // Tramites State
  const [modalTramite, setModalTramite] = useState(false);
  const [tipoTramite, setTipoTramite] = useState('');
  const [observacionesTramite, setObservacionesTramite] = useState('');
  const [tramiteDetalle, setTramiteDetalle] = useState<any>(null);
  const [tramitesData, setTramitesData] = useState(tramites);
  const [tramitesDisponiblesData] = useState(tramitesDisponibles);

  // Profile State
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [datosPerfil, setDatosPerfil] = useState<StudentProfile>(datosPerfilInicial);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  // Grades & Profile Data (loaded from backend)
  const [calificacionesData, setCalificacionesData] = useState(calificaciones);
  const [anunciosData] = useState(anuncios);

  // Library State
  const [librosData, setLibrosData] = useState<Book[]>(libros);
  const [prestamosData, setPrestamosData] = useState<LibraryLoan[]>(prestamosActivos);
  const [reservasData, setReservasData] = useState<LibraryReservation[]>(reservasLibros);

  // Forums State
  const [topicosData, setTopicosData] = useState<ForumTopic[]>(forosTopicos);
  const [respuestasData, setRespuestasData] = useState<ForumReply[]>(forosRespuestas);

  // Schedule State
  const [clasesHorario, setClasesHorario] = useState<ScheduleClass[]>(horarioClases);
  const [eventosHorario] = useState<ScheduleEvent[]>(horarioEventos);

  // Certificates State
  const [certificadosData] = useState<Certificate[]>(certificadosDisponibles);
  const [solicitudesCertificadosData, setSolicitudesCertificadosData] = useState<CertificateRequest[]>(solicitudesCertificados);

  // Financial Data
  const [historialPagosData, setHistorialPagosData] = useState(historialPagos);
  const [deudasPendientesData, setDeudasPendientesData] = useState(deudasPendientes);
  const [resumenFinancieroData, setResumenFinancieroData] = useState(resumenFinanciero);

  // Notifications State
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  // Load notifications from backend
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationsService.getNotifications(1, 20);
        if (response?.notifications) {
          setNotificaciones(response.notifications.map((n: any) => ({
            id: parseInt(n.id) || n.id,
            titulo: n.titulo,
            mensaje: n.mensaje,
            fecha: n.createdAt || n.fecha,
            leida: n.leida,
            tipo: (n.tipo?.toLowerCase() || 'info') as 'info' | 'warning' | 'success' | 'error',
          })));
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };

    loadNotifications();
  }, []);

  // New Sections Data
  const [clases, setClases] = useState<Clase[]>(clasesData);
  const [examenesDataState, setExamenesDataState] = useState<StudentExam[]>(studentExamenesData);
  const [comunidadPostsData, setComunidadPostsData] = useState<ComunidadPost[]>(comunidadPosts);

  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme Classes
  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-800' : 'bg-white';
  const text = darkMode ? 'text-gray-100' : 'text-gray-800';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  // ---- Mapeadores API -> forma que consumen los componentes ----

  const soloFecha = (iso?: string | null): string =>
    typeof iso === 'string' ? iso.split('T')[0] : '';

  const soloHora = (iso?: string | null): string =>
    iso ? new Date(iso).toTimeString().slice(0, 5) : '';

  const nombreCompleto = (u: any): string =>
    u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '';

  function mapLibroApi(b: any): Book {
    return {
      id: b.id,
      titulo: b.titulo,
      autor: b.autor,
      categoria: b.categoria,
      disponible: (b.ejemplaresDisponibles ?? 0) > 0,
      portada: b.portadaUrl || undefined,
      descripcion: b.descripcion || undefined,
      isbn: b.isbn || undefined,
      editorial: b.editorial || undefined,
      anioPublicacion: b.anio || undefined,
      copias: b.ejemplaresTotal,
      copiasDisponibles: b.ejemplaresDisponibles,
    };
  }

  const ESTADO_PRESTAMO_API: Record<string, LibraryLoan['estado']> = {
    ACTIVO: 'activo',
    DEVUELTO: 'devuelto',
    VENCIDO: 'vencido',
  };

  function mapPrestamoApi(l: any): LibraryLoan {
    const vence = l.fechaVencimiento ? new Date(l.fechaVencimiento) : null;
    const diasRestantes = vence
      ? Math.ceil((vence.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : undefined;

    return {
      id: l.id,
      libroId: l.bookId,
      libroTitulo: l.book?.titulo ?? '',
      libroAutor: l.book?.autor ?? '',
      fechaPrestamo: soloFecha(l.fechaPrestamo),
      fechaDevolucion: soloFecha(l.fechaVencimiento),
      estado: ESTADO_PRESTAMO_API[l.estado] ?? 'activo',
      diasRestantes,
    };
  }

  const ESTADO_RESERVA_API: Record<string, LibraryReservation['estado']> = {
    PENDIENTE: 'pendiente',
    LISTA: 'disponible',
    CANCELADA: 'cancelada',
    COMPLETADA: 'disponible',
  };

  function mapReservaApi(r: any): LibraryReservation {
    return {
      id: r.id,
      libroId: r.bookId,
      libroTitulo: r.book?.titulo ?? '',
      fechaReserva: soloFecha(r.fechaReserva),
      estado: ESTADO_RESERVA_API[r.estado] ?? 'pendiente',
    };
  }

  const CATEGORIAS_FORO: ForumTopic['categoria'][] = [
    'general',
    'academico',
    'dudas',
    'proyectos',
  ];

  function mapTopicoApi(t: any): ForumTopic {
    return {
      id: t.id,
      titulo: t.titulo,
      descripcion: t.contenido,
      autor: nombreCompleto(t.autor),
      curso: t.course?.name ?? '',
      fechaCreacion: soloFecha(t.createdAt),
      respuestas: t._count?.replies ?? t.replies?.length ?? 0,
      vistas: t.vistas ?? 0,
      ultimaActividad: soloFecha(t.updatedAt),
      estado: t.cerrado ? 'cerrado' : t.fijado ? 'destacado' : 'abierto',
      categoria: CATEGORIAS_FORO.includes(t.categoria) ? t.categoria : 'general',
    };
  }

  function mapRespuestaApi(r: any): ForumReply {
    return {
      id: r.id,
      topicoId: r.topicId,
      autor: nombreCompleto(r.autor),
      contenido: r.contenido,
      fecha: soloFecha(r.createdAt),
      likes: r.likes ?? 0,
      esRespuestaProfesor: r.autor?.role === 'TEACHER',
    };
  }

  function mapPostApi(p: any): ComunidadPost {
    return {
      id: p.id,
      autor: nombreCompleto(p.autor),
      avatarAutor: p.autor?.avatarUrl ?? '',
      contenido: p.contenido,
      fecha: soloFecha(p.createdAt),
      likes: p.totalLikes ?? 0,
      comentarios: p.totalComentarios ?? p.comments?.length ?? 0,
      compartidos: 0,
      imagenes: p.imagenUrl ? [p.imagenUrl] : undefined,
      esProfesor: p.autor?.role === 'TEACHER',
      curso: undefined,
    };
  }

  const ESTADO_CERTIFICADO_API: Record<string, CertificateRequest['estado']> = {
    PENDIENTE: 'pendiente',
    EN_PROCESO: 'pendiente',
    EMITIDO: 'completado',
    RECHAZADO: 'rechazado',
  };

  function mapSolicitudCertificadoApi(c: any): CertificateRequest {
    return {
      id: c.id,
      tipoCertificado: c.tipo,
      fechaSolicitud: soloFecha(c.createdAt),
      estado: ESTADO_CERTIFICADO_API[c.estado] ?? 'pendiente',
      observaciones: c.observaciones || undefined,
      fechaEstimada: soloFecha(c.fechaEmision) || undefined,
      archivoUrl: c.archivoUrl || undefined,
    };
  }

  const DIAS_SEMANA: ScheduleClass['dia'][] = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  function mapHorarioApi(e: any): ScheduleClass {
    return {
      id: e.id,
      curso: e.course?.name ?? e.titulo,
      profesor: '',
      dia: DIAS_SEMANA[(e.diaSemana ?? 1) - 1] ?? 'Lunes',
      horaInicio: e.horaInicio,
      horaFin: e.horaFin,
      aula: e.aula ?? '',
      tipo: 'presencial',
      color: e.color ?? 'bg-blue-500',
    };
  }

  const ESTADO_CLASE_API: Record<string, Clase['estado']> = {
    PROGRAMADA: 'programada',
    EN_CURSO: 'en_curso',
    FINALIZADA: 'finalizada',
    CANCELADA: 'finalizada',
  };

  function mapClaseApi(c: any): Clase {
    return {
      id: c.id,
      titulo: c.titulo,
      curso: c.course?.name ?? '',
      profesor: '',
      // Una clase con grabacion ya disponible se consume como "grabada".
      tipo: c.grabacionUrl ? 'grabada' : 'en_vivo',
      fecha: soloFecha(c.fechaInicio),
      duracion: c.duracionMinutos ? `${c.duracionMinutos} min` : soloHora(c.fechaInicio),
      estado: ESTADO_CLASE_API[c.estado] ?? 'programada',
      enlace: c.enlace || undefined,
      descripcion: c.descripcion || undefined,
      asistentes: c.asistentes ?? 0,
      grabacionUrl: c.grabacionUrl || undefined,
    };
  }

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = (useAuthStore as any).getState?.()?.user?.id;

        const [
          coursesData,
          assignmentsData,
          inboxMessages,
          gradesData,
          profileData,
          examsData,
          attemptsData,
          booksData,
          loansData,
          reservationsData,
          topicsData,
          postsData,
          certificatesData,
          scheduleData,
          liveClassesData,
          invoicesData,
          financialSummaryData,
        ] = await Promise.allSettled([
          coursesApi.getAll(),
          assignmentsApi.getAll(),
          messagesApi.getInbox().catch(() => []),
          gradesApi.getMy(),
          userId ? usersApi.getById(userId) : Promise.resolve({ data: null }),
          examsApi.getAll(),
          examsApi.getMyAttempts().catch(() => ({ data: [] })),
          libraryApi.getBooks(),
          libraryApi.getMyLoans(),
          libraryApi.getMyReservations(),
          forumsApi.getTopics(),
          communityApi.getPosts(),
          certificatesApi.getMy(),
          scheduleApi.getMy(),
          liveClassesApi.getMy(),
          financeApi.getMyInvoices(),
          financeApi.getMyFinancialSummary(),
        ]);

        if (coursesData.status === 'fulfilled') {
          const data = (coursesData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) setCursos(data);
        }
        if (assignmentsData.status === 'fulfilled') {
          const data = (assignmentsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) setTareas(data);
        }
        if (inboxMessages.status === 'fulfilled') {
          const data = inboxMessages.value as any;
          if (Array.isArray(data) && data.length > 0) setMensajes(data);
        }
        if (gradesData.status === 'fulfilled') {
          const data = (gradesData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setCalificacionesData(agruparNotasPorCurso(data));
          }
        }
        if (profileData.status === 'fulfilled') {
          const data = (profileData.value as any)?.data;
          if (data) {
            setDatosPerfil(prev => ({
              ...prev,
              nombre: data.firstName || data.nombre || prev.nombre,
              email: data.email || prev.email,
              telefono: data.phone || data.telefono || prev.telefono,
              carrera: data.career || data.carrera || prev.carrera,
              semestre: data.semester || data.semestre || prev.semestre,
            }));
          }
        }
        if (examsData.status === 'fulfilled') {
          const data = (examsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            const intentos = attemptsData.status === 'fulfilled'
              ? ((attemptsData.value as any)?.data || [])
              : [];
            const examenesApi = data.map((e: any) => {
              const intento = intentos.find(
                (a: any) => a.examId === e.id && (a.estado === 'CALIFICADO' || a.estado === 'ENVIADO')
              );
              return {
                id: e.id,
                titulo: e.titulo,
                curso: e.course?.name || e.curso || '',
                fecha: typeof e.fecha === 'string' ? e.fecha.split('T')[0] : e.fecha,
                duracion: `${e.duracion} min`,
                estado: intento ? 'calificado' : e.estado === 'FINALIZADO' ? 'finalizado' : 'pendiente',
                calificacion: intento?.calificacion ?? undefined,
                preguntas: (e.preguntas || []).map((p: any) => ({
                  id: p.id,
                  pregunta: p.pregunta,
                  tipo: 'multiple' as const,
                  opciones: p.opciones || [],
                })),
              };
            });
            setExamenes(examenesApi as any);
            setExamenesDataState(examenesApi as any);
          }
        }
        if (booksData.status === 'fulfilled') {
          const data = (booksData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setLibrosData(data.map(mapLibroApi));
          }
        }
        if (loansData.status === 'fulfilled') {
          const data = (loansData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setPrestamosData(data.map(mapPrestamoApi));
          }
        }
        if (reservationsData.status === 'fulfilled') {
          const data = (reservationsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setReservasData(data.map(mapReservaApi));
          }
        }
        if (topicsData.status === 'fulfilled') {
          const data = (topicsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setTopicosData(data.map(mapTopicoApi));
          }
        }
        if (postsData.status === 'fulfilled') {
          const data = (postsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setComunidadPostsData(data.map(mapPostApi));
          }
        }
        if (certificatesData.status === 'fulfilled') {
          const data = (certificatesData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setSolicitudesCertificadosData(data.map(mapSolicitudCertificadoApi));
          }
        }
        if (scheduleData.status === 'fulfilled') {
          const data = (scheduleData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setClasesHorario(data.map(mapHorarioApi));
          }
        }
        if (liveClassesData.status === 'fulfilled') {
          const data = (liveClassesData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            const mapeadas = data.map(mapClaseApi);
            setClases(mapeadas);
            setClasesVivoData(mapeadas.filter((c: any) => c.tipo === 'en_vivo'));
            setClasesGrabadasData(mapeadas.filter((c: any) => c.tipo === 'grabada'));
          }
        }
        if (invoicesData.status === 'fulfilled') {
          const data = (invoicesData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            // Cada pago aplicado es una linea del historial.
            const pagos = data.flatMap((f: any) =>
              (f.payments || []).map((p: any) => ({
                id: p.id,
                concepto: (f.conceptos || []).join(', ') || f.numero,
                monto: p.monto,
                fecha: soloFecha(p.fecha),
                metodoPago: p.metodoPago,
                estado: 'completado' as const,
                comprobante: p.referencia || f.numero,
              }))
            );
            if (pagos.length > 0) setHistorialPagosData(pagos as any);

            // Una factura con saldo pendiente es una deuda.
            const deudas = data
              .map((f: any) => {
                const pagado = (f.payments || []).reduce(
                  (s: number, p: any) => s + p.monto,
                  0
                );
                return {
                  id: f.id,
                  concepto: (f.conceptos || []).join(', ') || f.numero,
                  monto: f.total - pagado,
                  fechaVencimiento: soloFecha(f.fechaVencimiento),
                  estado: 'pendiente' as const,
                };
              })
              .filter((d: any) => d.monto > 0);
            setDeudasPendientesData(deudas as any);
          }
        }
        if (financialSummaryData.status === 'fulfilled') {
          const data = (financialSummaryData.value as any)?.data;
          if (data && typeof data.totalPagado === 'number') {
            setResumenFinancieroData(prev => ({
              ...prev,
              totalPagado: data.totalPagado,
              saldoPendiente: data.saldoPendiente,
            }));
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Action Handlers
  const iniciarExamen = (examen: StudentExam) => {
    setExamenActivo(examen);
    const duracionMinutos = parseInt(examen.duracion);
    setTiempoRestante(duracionMinutos * 60);
    setRespuestasExamen({});
    setPreguntaActual(0);
  };

  const finalizarExamen = async () => {
    if (!examenActivo || !examenActivo.preguntas) return;

    // Examen del backend: enviar respuestas para calificación en el servidor
    if (attemptActivoId) {
      try {
        const respuestas: Record<string, number> = {};
        Object.entries(respuestasExamen).forEach(([preguntaId, opcion]) => {
          respuestas[String(preguntaId)] = opcion;
        });
        const { data } = await examsApi.submitAttempt(attemptActivoId, respuestas);
        const calificacion = data?.calificacion ?? 0;
        const correctas = data?.correctas ?? 0;
        const total = data?.totalPreguntas ?? examenActivo.preguntas.length;

        const actualizar = (lista: StudentExam[]) => lista.map(e =>
          e.id === examenActivo.id
            ? { ...e, estado: 'calificado', calificacion, fecha: new Date().toISOString().split('T')[0] }
            : e
        );
        setExamenes(prev => actualizar(prev));
        setExamenesDataState(prev => actualizar(prev));

        alert(`Examen enviado y calificado!\nCalificación: ${calificacion}\nRespuestas correctas: ${correctas}/${total}`);
      } catch (err: any) {
        console.error('Error enviando examen:', err);
        alert(`No se pudo enviar el examen al servidor (${err?.message || 'error de conexión'}). Intenta de nuevo.`);
        return;
      }
      setAttemptActivoId(null);
      setExamenActivo(null);
      setRespuestasExamen({});
      setTiempoRestante(null);
      return;
    }

    // Examen local (mock): calificar en el cliente
    let correctas = 0;
    examenActivo.preguntas.forEach(pregunta => {
      if (respuestasExamen[pregunta.id] === pregunta.respuestaCorrecta) {
        correctas++;
      }
    });

    const calificacion = parseFloat((correctas / examenActivo.preguntas.length * 10).toFixed(1));

    setExamenes(examenes.map(e =>
      e.id === examenActivo.id
        ? { ...e, estado: 'completado', calificacion, fecha: new Date().toISOString().split('T')[0] }
        : e
    ));

    alert(`Examen finalizado!\nCalificación: ${calificacion}\nRespuestas correctas: ${correctas}/${examenActivo.preguntas.length}`);
    setExamenActivo(null);
    setRespuestasExamen({});
    setTiempoRestante(null);
  };

  const entregarTarea = async (tareaId: number) => {
    if (!archivoTarea) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      // `content` es el nombre real del campo en el modelo Submission;
      // `comentario` no existia y se descartaba.
      await assignmentsApi.submit(String(tareaId), {
        content: comentarioTarea,
      });

      setTareas(tareas.map(t =>
        t.id === tareaId ? { ...t, estado: 'entregada' } : t
      ));

      alert('Tarea entregada exitosamente!');
    } catch (err: any) {
      alert('Error al entregar tarea: ' + (err.message || 'Error desconocido'));
    } finally {
      setModalTarea(null);
      setArchivoTarea(null);
      setComentarioTarea('');
    }
  };

  const enviarSolicitud = () => {
    if (!tipoSolicitud) {
      alert('Por favor selecciona un tipo de solicitud');
      return;
    }

    const nuevaSolicitud = {
      id: solicitudesData.length + 1,
      tipo: tipoSolicitud,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'En proceso',
      respuesta: 'Pendiente'
    };

    setSolicitudesData([nuevaSolicitud, ...solicitudesData]);
    alert('Solicitud enviada exitosamente!');
    setModalSolicitud(false);
    setTipoSolicitud('');
  };

  const enviarTramite = () => {
    if (!tipoTramite) {
      alert('Por favor selecciona un tipo de trámite');
      return;
    }

    const nuevoTramite = {
      id: tramitesData.length + 1,
      tipo: tipoTramite,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      observaciones: observacionesTramite || 'Sin observaciones',
      descripcion: tramitesDisponiblesData.find(t => t.nombre === tipoTramite)?.descripcion || ''
    };

    setTramitesData([nuevoTramite, ...tramitesData]);
    alert('Trámite enviado exitosamente!');
    setModalTramite(false);
    setTipoTramite('');
    setObservacionesTramite('');
  };

  const cancelarTramite = (tramiteId: number) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar este trámite?')) {
      setTramitesData(tramitesData.filter(t => t.id !== tramiteId));
      alert('Trámite cancelado');
    }
  };

  const actualizarPerfil = async () => {
    try {
      const userId = (useAuthStore as any).getState?.()?.user?.id;
      if (userId) {
        // `phone` y `career` no son campos del modelo User -- el telefono vive
        // en la ficha de estudiante y el programa tambien -- asi que la
        // peticion entera fallaba y no se guardaba ni el nombre. Hasta que
        // exista una ruta para que el alumnado edite su propia ficha, aqui
        // solo se actualiza lo que la cuenta de usuario realmente contiene.
        await usersApi.update(userId, {
          firstName: datosPerfil.nombre,
        });
      }
      alert('Perfil actualizado!');
      setEditandoPerfil(false);
    } catch (err: any) {
      alert('Error al actualizar perfil: ' + (err.message || 'Error desconocido'));
    }
  };

  const subirFotoPerfil = (archivo: File) => {
    // Simular procesamiento y redimensionamiento
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;

      // TODO: En producción, enviar al backend para:
      // 1. Redimensionar a 300x300
      // 2. Optimizar imagen
      // 3. Guardar en servidor/cloud storage
      // 4. Devolver URL de la imagen

      setFotoPerfil(result);
      alert(`Foto de perfil actualizada!\n\nTamaño: ${(archivo.size / 1024).toFixed(2)} KB\nFormato: ${archivo.type}\n\nEn producción se redimensionará a 300x300px.`);
    };
    reader.readAsDataURL(archivo);
  };

  // Library Actions
  const solicitarPrestamo = async (libroId: string | number) => {
    const libro = librosData.find(l => l.id === libroId);
    if (!libro) return;

    if (!libro.disponible || (libro.copiasDisponibles && libro.copiasDisponibles === 0)) {
      alert('Este libro no está disponible en este momento.');
      return;
    }

    if (typeof libroId === 'string') {
      try {
        const { data } = await libraryApi.createLoan(libroId);
        setPrestamosData([mapPrestamoApi(data), ...prestamosData]);
        setLibrosData(librosData.map(l =>
          l.id === libroId
            ? {
                ...l,
                copiasDisponibles: Math.max((l.copiasDisponibles || 1) - 1, 0),
                disponible: (l.copiasDisponibles || 1) - 1 > 0,
              }
            : l
        ));
        alert(
          `Préstamo solicitado exitosamente!\n\nLibro: ${libro.titulo}\nFecha de devolución: ${soloFecha(data?.fechaVencimiento)}`
        );
        return;
      } catch (err: any) {
        alert(err?.message || 'No se pudo registrar el préstamo.');
        return;
      }
    }

    // Crear nuevo préstamo
    const nuevoPrestamo: LibraryLoan = {
      id: prestamosData.length + 1,
      libroId: libro.id,
      libroTitulo: libro.titulo,
      libroAutor: libro.autor,
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 días
      estado: 'activo',
      diasRestantes: 14
    };

    setPrestamosData([nuevoPrestamo, ...prestamosData]);

    // Actualizar disponibilidad del libro
    setLibrosData(librosData.map(l => {
      if (l.id === libroId) {
        const nuevasCopiasDisponibles = (l.copiasDisponibles || 0) - 1;
        return {
          ...l,
          copiasDisponibles: nuevasCopiasDisponibles,
          disponible: nuevasCopiasDisponibles > 0
        };
      }
      return l;
    }));

    alert(`Préstamo solicitado exitosamente!\n\nLibro: ${libro.titulo}\nFecha de devolución: ${nuevoPrestamo.fechaDevolucion}`);
  };

  const devolverLibro = async (prestamoId: string | number) => {
    const prestamo = prestamosData.find(p => p.id === prestamoId);
    if (!prestamo) return;

    if (!window.confirm(`¿Confirmas la devolución de "${prestamo.libroTitulo}"?`)) {
      return;
    }

    if (typeof prestamoId === 'string') {
      try {
        await libraryApi.returnLoan(prestamoId);
      } catch (err: any) {
        alert(err?.message || 'No se pudo registrar la devolución.');
        return;
      }
    }

    // Actualizar estado del préstamo
    setPrestamosData(prestamosData.map(p =>
      p.id === prestamoId ? { ...p, estado: 'devuelto' } : p
    ));

    // Actualizar disponibilidad del libro
    setLibrosData(librosData.map(l => {
      if (l.id === prestamo.libroId) {
        const nuevasCopiasDisponibles = (l.copiasDisponibles || 0) + 1;
        return {
          ...l,
          copiasDisponibles: nuevasCopiasDisponibles,
          disponible: true
        };
      }
      return l;
    }));

    alert('Libro devuelto exitosamente!');
  };

  const reservarLibro = async (libroId: string | number) => {
    const libro = librosData.find(l => l.id === libroId);
    if (!libro) return;

    // Verificar si ya tiene una reserva activa para este libro
    const reservaExistente = reservasData.find(r => r.libroId === libroId && r.estado === 'pendiente');
    if (reservaExistente) {
      alert('Ya tienes una reserva activa para este libro.');
      return;
    }

    if (typeof libroId === 'string') {
      try {
        const { data } = await libraryApi.createReservation(libroId);
        setReservasData([mapReservaApi(data), ...reservasData]);
        alert(
          `Reserva realizada exitosamente!\n\nTe notificaremos cuando "${libro.titulo}" esté disponible.`
        );
        return;
      } catch (err: any) {
        alert(err?.message || 'No se pudo realizar la reserva.');
        return;
      }
    }

    const nuevaReserva: LibraryReservation = {
      id: reservasData.length + 1,
      libroId: libro.id,
      libroTitulo: libro.titulo,
      fechaReserva: new Date().toISOString().split('T')[0],
      estado: 'pendiente'
    };

    setReservasData([nuevaReserva, ...reservasData]);
    alert(`Reserva realizada exitosamente!\n\nTe notificaremos cuando "${libro.titulo}" esté disponible.`);
  };

  // Forum Actions
  const crearTopico = async (titulo: string, descripcion: string, categoria: string, curso: string) => {
    // El curso llega como nombre; el API necesita su id (si el estudiante lo cursa).
    const cursoApi: any = (cursos as any[]).find(
      (c: any) => c.name === curso || c.nombre === curso
    );

    try {
      const { data } = await forumsApi.createTopic({
        titulo,
        contenido: descripcion,
        categoria: categoria || 'general',
        courseId: typeof cursoApi?.id === 'string' ? cursoApi.id : undefined,
      });
      setTopicosData([mapTopicoApi(data), ...topicosData]);
      alert('Tema creado exitosamente!');
      return;
    } catch (err: any) {
      console.error('Error creando tema en el servidor:', err);
      alert(
        `No se pudo guardar en el servidor (${err?.message || 'error de conexión'}). Se guardará localmente.`
      );
    }

    const nuevoTopico: ForumTopic = {
      id: topicosData.length + 1,
      titulo,
      descripcion,
      autor: nombreDelUsuario(),
      curso: curso || 'General',
      fechaCreacion: new Date().toISOString(),
      respuestas: 0,
      vistas: 0,
      ultimaActividad: new Date().toISOString(),
      estado: 'abierto',
      categoria: categoria as any
    };

    setTopicosData([nuevoTopico, ...topicosData]);
    alert('Tema creado exitosamente!');
  };

  const crearRespuesta = async (topicoId: string | number, contenido: string) => {
    if (typeof topicoId === 'string') {
      try {
        const { data } = await forumsApi.createReply(topicoId, contenido);
        setRespuestasData([...respuestasData, mapRespuestaApi(data)]);
        setTopicosData(topicosData.map(t =>
          t.id === topicoId
            ? { ...t, respuestas: t.respuestas + 1, ultimaActividad: new Date().toISOString() }
            : t
        ));
        alert('Respuesta publicada exitosamente!');
        return;
      } catch (err: any) {
        alert(err?.message || 'No se pudo publicar la respuesta.');
        return;
      }
    }

    const nuevaRespuesta: ForumReply = {
      id: respuestasData.length + 1,
      topicoId,
      autor: nombreDelUsuario(),
      contenido,
      fecha: new Date().toISOString(),
      likes: 0,
      esRespuestaProfesor: false
    };

    setRespuestasData([...respuestasData, nuevaRespuesta]);

    // Actualizar contador de respuestas del tópico
    setTopicosData(topicosData.map(t =>
      t.id === topicoId
        ? { ...t, respuestas: t.respuestas + 1, ultimaActividad: new Date().toISOString() }
        : t
    ));

    alert('Respuesta publicada exitosamente!');
  };

  // Certificate Actions
  const solicitarCertificado = async (certificadoId: string | number, observaciones: string) => {
    const certificado = certificadosData.find(c => c.id === certificadoId);
    if (!certificado) return;

    try {
      const { data } = await certificatesApi.create({
        tipo: certificado.tipo,
        motivo: observaciones || undefined,
        costo: certificado.costo,
      });
      setSolicitudesCertificadosData([
        mapSolicitudCertificadoApi(data),
        ...solicitudesCertificadosData,
      ]);
      alert(
        certificado.costo > 0
          ? `Solicitud enviada exitosamente!\n\nCosto: $${certificado.costo.toLocaleString()}\nTiempo estimado: ${certificado.tiempoEstimado}\n\nRecibirás una notificación cuando esté listo.`
          : `Solicitud enviada exitosamente!\n\nTiempo estimado: ${certificado.tiempoEstimado}`
      );
      return;
    } catch (err: any) {
      console.error('Error solicitando certificado en el servidor:', err);
      alert(
        `No se pudo guardar en el servidor (${err?.message || 'error de conexión'}). Se guardará localmente.`
      );
    }

    const nuevaSolicitud: CertificateRequest = {
      id: solicitudesCertificadosData.length + 1,
      tipoCertificado: certificado.tipo,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      estado: certificado.requiereAprobacion ? 'pendiente' : 'aprobado',
      observaciones: observaciones || undefined,
      fechaEstimada: certificado.tiempoEstimado === 'Inmediato'
        ? new Date().toISOString().split('T')[0]
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setSolicitudesCertificadosData([nuevaSolicitud, ...solicitudesCertificadosData]);

    if (certificado.costo > 0) {
      alert(`Solicitud enviada exitosamente!\n\nCosto: $${certificado.costo.toLocaleString()}\nTiempo estimado: ${certificado.tiempoEstimado}\n\nRecibirás una notificación cuando esté listo.`);
    } else {
      alert(`Solicitud enviada exitosamente!\n\nTiempo estimado: ${certificado.tiempoEstimado}`);
    }
  };

  const descargarCertificado = (solicitudId: number) => {
    const solicitud = solicitudesCertificadosData.find(s => s.id === solicitudId);
    if (!solicitud || !solicitud.archivoUrl) {
      alert('El certificado aún no está disponible para descargar.');
      return;
    }

    alert(`Descargando certificado: ${solicitud.tipoCertificado}\nArchivo: ${solicitud.archivoUrl}`);
  };

  const generarCertificadoCurso = (cursoId: number, nombreArchivo: string) => {
    // Registrar el certificado generado en la base de datos
    const curso = cursos.find(c => c.id === cursoId);
    if (!curso) return;

    const nuevaSolicitud: CertificateRequest = {
      id: solicitudesCertificadosData.length + 1,
      tipoCertificado: `Certificado de Finalización - ${curso.nombre}`,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      estado: 'completado',
      observaciones: 'Certificado generado automáticamente al completar el curso',
      fechaEstimada: new Date().toISOString().split('T')[0],
      archivoUrl: `/certificados/${nombreArchivo}`
    };

    setSolicitudesCertificadosData([nuevaSolicitud, ...solicitudesCertificadosData]);
  };

  // Classes Actions
  const unirseClase = async (claseId: string | number) => {
    const clase = clases.find(c => c.id === claseId);
    if (!clase) return;

    if (clase.tipo !== 'en_vivo') {
      alert('Solo puedes unirte a clases en vivo.');
      return;
    }

    if (clase.estado === 'finalizada') {
      alert('Esta clase ya finalizó.');
      return;
    }

    if (clase.estado === 'programada') {
      alert('Esta clase aún no ha comenzado. Te avisaremos cuando inicie.');
      return;
    }

    if (typeof claseId === 'string') {
      try {
        const { data } = await liveClassesApi.join(claseId);
        if (data?.enlace) {
          window.open(data.enlace, '_blank', 'noopener,noreferrer');
          return;
        }
        alert('El enlace de la clase no está disponible aún.');
        return;
      } catch (err: any) {
        alert(err?.message || 'No se pudo unir a la clase.');
        return;
      }
    }

    if (clase.enlace) {
      window.open(clase.enlace, '_blank', 'noopener,noreferrer');
    } else {
      alert('El enlace de la clase no está disponible aún.');
    }
  };

  const verGrabacion = (claseId: number) => {
    const clase = clases.find(c => c.id === claseId);
    if (!clase) return;

    if (clase.tipo !== 'grabada' && clase.estado !== 'finalizada') {
      alert('Esta grabación aún no está disponible.');
      return;
    }

    if (clase.grabacionUrl) {
      alert(`Reproduciendo: ${clase.titulo}\n\nURL: ${clase.grabacionUrl}\n\nEn un caso real, se reproduciría el video.`);
      // En producción: window.open(clase.grabacionUrl, '_blank');
    } else {
      alert('La grabación no está disponible.');
    }
  };

  // Exams Actions (for ExamenesSection)
  const iniciarExamenNuevo = async (examenId: number | string) => {
    const examen = examenesDataState.find(e => e.id === examenId);
    if (!examen) return;

    if (examen.estado === 'calificado') {
      alert('Este examen ya fue completado y calificado.');
      return;
    }

    if (examen.estado === 'en_curso' && examenActivo) {
      alert(`Continuando con el examen: ${examen.titulo}`);
      setExamenActivo(examen);
      return;
    }

    if (!window.confirm(`¿Deseas iniciar el examen "${examen.titulo}"?\n\nDuración: ${examen.duracion}\nPreguntas: ${examen.preguntas?.length || 'N/A'}`)) {
      return;
    }

    // Examen del backend: crear intento en el servidor
    if (typeof examenId === 'string') {
      try {
        const { data } = await examsApi.startAttempt(examenId);
        const preguntasApi = (data?.exam?.preguntas || data?.preguntas || examen.preguntas || []).map((p: any) => ({
          id: p.id,
          pregunta: p.pregunta,
          tipo: 'multiple' as const,
          opciones: p.opciones || [],
        }));
        setAttemptActivoId(data?.id || null);
        const examenConPreguntas = { ...examen, preguntas: preguntasApi };
        setExamenesDataState(examenesDataState.map(e =>
          e.id === examenId ? { ...e, estado: 'en_curso' } : e
        ));
        setExamenActivo(examenConPreguntas);
        const duracionMinutos = parseInt(examen.duracion);
        setTiempoRestante((isNaN(duracionMinutos) ? 60 : duracionMinutos) * 60);
        setRespuestasExamen({});
        setPreguntaActual(0);
        alert(`Examen iniciado. ¡Buena suerte!`);
      } catch (err: any) {
        console.error('Error iniciando examen:', err);
        alert(`No se pudo iniciar el examen (${err?.message || 'error de conexión'}).`);
      }
      return;
    }

    // Examen local (mock)
    setExamenesDataState(examenesDataState.map(e =>
      e.id === examenId ? { ...e, estado: 'en_curso' } : e
    ));
    setExamenActivo(examen);
    const duracionMinutos = parseInt(examen.duracion);
    setTiempoRestante(duracionMinutos * 60);
    alert(`Examen iniciado. ¡Buena suerte!`);
  };

  const verResultadosExamen = (examenId: number) => {
    const examen = examenesDataState.find(e => e.id === examenId);
    if (!examen) return;

    if (examen.estado !== 'calificado') {
      alert('Este examen aún no ha sido calificado.');
      return;
    }

    alert(`Resultados del examen: ${examen.titulo}\n\nCalificación: ${examen.calificacion || 'N/A'}\nEstado: Calificado\nFecha: ${examen.fecha}`);
  };

  // Community Actions
  const darLike = async (postId: string | number) => {
    if (typeof postId === "string") {
      try {
        const { data } = await communityApi.toggleLike(postId);
        setComunidadPostsData(comunidadPostsData.map(post =>
          post.id === postId ? mapPostApi(data) : post
        ));
        return;
      } catch (err: any) {
        alert(err?.message || "No se pudo registrar el like.");
        return;
      }
    }

    setComunidadPostsData(comunidadPostsData.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const comentarPost = async (postId: string | number, contenido: string) => {
    if (!contenido.trim()) {
      alert('El comentario no puede estar vacío.');
      return;
    }

    if (typeof postId === 'string') {
      try {
        const { data } = await communityApi.addComment(postId, contenido);
        setComunidadPostsData(comunidadPostsData.map(post =>
          post.id === postId ? mapPostApi(data) : post
        ));
        alert('Comentario publicado exitosamente!');
        return;
      } catch (err: any) {
        alert(err?.message || 'No se pudo publicar el comentario.');
        return;
      }
    }

    setComunidadPostsData(comunidadPostsData.map(post =>
      post.id === postId ? { ...post, comentarios: post.comentarios + 1 } : post
    ));

    alert('Comentario publicado exitosamente!');
  };

  const compartirPost = (postId: number) => {
    const post = comunidadPostsData.find(p => p.id === postId);
    if (!post) return;

    setComunidadPostsData(comunidadPostsData.map(p =>
      p.id === postId ? { ...p, compartidos: p.compartidos + 1 } : p
    ));

    alert(`Post compartido: "${post.contenido.substring(0, 50)}..."`);
  };

  const crearPostComunidad = (contenido: string) => {
    if (!contenido.trim()) {
      alert('El contenido del post no puede estar vacío.');
      return;
    }

    const nuevoPost: ComunidadPost = {
      id: comunidadPostsData.length + 1,
      autor: nombreDelUsuario(),
      avatarAutor: inicialesDelUsuario(),
      contenido,
      fecha: 'Ahora',
      likes: 0,
      comentarios: 0,
      compartidos: 0,
      esProfesor: false
    };

    setComunidadPostsData([nuevoPost, ...comunidadPostsData]);
    alert('Post publicado exitosamente!');
  };

  // Payment Actions
  const realizarPago = (deudaId: number, metodoPago: string, datosPago: any) => {
    const deuda = deudasPendientesData.find(d => d.id === deudaId);
    if (!deuda) {
      alert('Deuda no encontrada.');
      return;
    }

    // Crear nuevo pago en el historial
    const nuevoPago = {
      id: historialPagosData.length + 1,
      fecha: new Date().toISOString().split('T')[0],
      concepto: deuda.concepto,
      monto: deuda.monto,
      metodoPago: metodoPago,
      estado: 'completado' as const,
      referencia: `REF-${Date.now()}`,
      comprobante: `COMP-${Date.now()}`
    };

    setHistorialPagosData([nuevoPago, ...historialPagosData]);

    // Eliminar la deuda de pendientes
    setDeudasPendientesData(deudasPendientesData.filter(d => d.id !== deudaId));

    // Actualizar resumen financiero
    setResumenFinancieroData({
      ...resumenFinancieroData,
      totalPagado: resumenFinancieroData.totalPagado + deuda.monto,
      saldoPendiente: resumenFinancieroData.saldoPendiente - deuda.monto,
      ultimoPago: deuda.monto
    });
  };

  // Message Actions
  const enviarMensaje = async (destinatario: string, asunto: string, mensaje: string) => {
    try {
      await messagesApi.create({
        destinatario,
        asunto,
        contenido: mensaje,
      });
      alert(`Mensaje enviado a ${destinatario}!\n\nAsunto: ${asunto}\nMensaje: ${mensaje.substring(0, 100)}...`);
    } catch (err: any) {
      alert('Error al enviar mensaje: ' + (err.message || 'Error desconocido'));
    }
  };

  const verMensaje = (mensaje: any) => {
    // TODO: Abrir modal o sección para ver mensaje completo
    console.log('Ver mensaje:', mensaje);
    setConversacionActiva(mensaje);
  };

  const marcarMensajeComoLeido = async (id: number) => {
    try {
      await messagesApi.markAsRead(String(id));
      setMensajes(prev => prev.map(m => m.id === id ? { ...m, leido: true } : m));
    } catch (err: any) {
      console.error('Error marcando mensaje como leído:', err);
    }
  };

  const eliminarMensaje = async (id: number) => {
    try {
      await messagesApi.delete(String(id));
      setMensajes(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      console.error('Error eliminando mensaje:', err);
    }
  };

  // Notification Actions
  const marcarComoLeida = async (id: number) => {
    try {
      await notificationsService.markAsRead(String(id));
      setNotificaciones(notificaciones.map(n =>
        n.id === id ? { ...n, leida: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const eliminarNotificacion = async (id: number) => {
    try {
      await notificationsService.deleteNotification(String(id));
      setNotificaciones(notificaciones.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return {
    // State
    activeSection,
    sidebarOpen,
    darkMode,
    conversacionActiva,
    nuevoMensajeModal,
    mensajes,
    examenActivo,
    respuestasExamen,
    tiempoRestante,
    preguntaActual,
    examenes,
    cursoDetalle,
    temaSeleccionado,
    bloqueActivo,
    expandirIdeasClave,
    cursos,
    modalTarea,
    archivoTarea,
    comentarioTarea,
    tareas,
    claseActiva,
    tipoClase,
    clasesVivoData,
    clasesGrabadasData,
    modalSolicitud,
    tipoSolicitud,
    solicitudesData,
    modalTramite,
    tipoTramite,
    observacionesTramite,
    tramiteDetalle,
    tramitesData,
    tramitesDisponiblesData,
    editandoPerfil,
    datosPerfil,
    fotoPerfil,
    calificacionesData,
    anunciosData,
    historialPagosData,
    deudasPendientesData,
    resumenFinancieroData,
    notificacionesAbiertas,
    notificaciones,

    // Library Data
    librosData,
    prestamosData,
    reservasData,

    // Forums Data
    topicosData,
    respuestasData,

    // Schedule Data
    clasesHorario,
    eventosHorario,

    // Certificates Data
    certificadosData,
    solicitudesCertificadosData,

    // New Sections Data
    clases,
    examenesData: examenesDataState,
    comunidadPosts: comunidadPostsData,

    // Theme
    bg,
    card,
    text,
    border,

    // Setters
    setActiveSection,
    setSidebarOpen,
    setDarkMode,
    setConversacionActiva,
    setNuevoMensajeModal,
    setExamenActivo,
    setRespuestasExamen,
    setTiempoRestante,
    setPreguntaActual,
    setExamenes,
    setCursoDetalle,
    setTemaSeleccionado,
    setBloqueActivo,
    setExpandirIdeasClave,
    setModalTarea,
    setArchivoTarea,
    setComentarioTarea,
    setTareas,
    setClaseActiva,
    setTipoClase,
    setModalSolicitud,
    setTipoSolicitud,
    setSolicitudesData,
    setModalTramite,
    setTipoTramite,
    setObservacionesTramite,
    setTramiteDetalle,
    setTramitesData,
    setEditandoPerfil,
    setDatosPerfil,
    setNotificacionesAbiertas,

    // Actions
    iniciarExamen,
    finalizarExamen,
    entregarTarea,
    enviarSolicitud,
    enviarTramite,
    cancelarTramite,
    actualizarPerfil,
    subirFotoPerfil,
    solicitarPrestamo,
    devolverLibro,
    reservarLibro,
    crearTopico,
    crearRespuesta,
    solicitarCertificado,
    descargarCertificado,
    generarCertificadoCurso,

    // New Sections Actions
    unirseClase,
    verGrabacion,
    iniciarExamenNuevo,
    verResultadosExamen,
    darLike,
    comentar: comentarPost,
    compartir: compartirPost,
    crearPost: crearPostComunidad,

    // Payment Actions
    realizarPago,

    // Message Actions
    enviarMensaje,
    mensajesAbiertas,
    setMensajesAbiertas,
    verMensaje,
    marcarMensajeComoLeido,
    eliminarMensaje,

    // Notification Actions
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion
  };
};
