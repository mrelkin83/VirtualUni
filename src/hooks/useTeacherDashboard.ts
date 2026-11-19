import { useState, useEffect } from 'react';
import { avisar, confirmar } from '../components/ui';
import {
  teacherCoursesApi,
  teacherStudentsApi,
  teacherAssignmentsApi,
  teacherMessagesApi,
} from '../api/endpoints/teacher';
import { usersApi } from '../api/endpoints/users';
import { examsApi } from '../api/endpoints/exams';
import { materialsApi, MaterialType } from '../api/endpoints/materials';
import { liveClassesApi } from '../api/endpoints/live-classes';
import { groupsApi } from '../api/endpoints/groups';
import { uploadsApi } from '../api/endpoints/uploads';
import { announcementsApi } from '../api/endpoints/announcements';
import { massMessagesApi } from '../api/endpoints/mass-messages';
import { scheduleApi } from '../api/endpoints/schedule';
import { bancoPreguntasApi } from '../api/endpoints/question-bank';
import { plantillasMensajeApi } from '../api/endpoints/message-templates';
import { temarioApi } from '../api/endpoints/course-topics';
import { generateStudentDataExcel } from '../utils/excelExport';
import { comoArreglo } from '../utils/respuestaApi';
import { useAuthStore } from '../store/authStore';
import { notificationsService } from '../services/notifications.service';
import { cursosDocente, estudiantesData, estudiantesDetalleData, tareasData, examenesData, examenesDetalladosData, bancoPreguntasData, modulosCursoData, mensajesData, gruposData, materialesData, carpetasMaterialesData, clasesVivoData } from '../data/teacherMockData';
import { SectionType, EstudianteDetalle, CarpetaMaterial, Question } from '../types/teacher.types';

export const useTeacherDashboard = () => {
  // Navigation & UI state
  const [activeSection, setActiveSection] = useState<SectionType>('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data state.
  //
  // Vacios, no con los *MockData: el estado arrancaba con los datos de ejemplo
  // y la carga solo los reemplazaba `if (data.length > 0)`, asi que un tenant
  // nuevo (listas vacias en el API) se quedaba viendo cursos y estudiantes
  // ficticios para siempre. El mock queda solo como fuente de los tipos.
  const [cursos, setCursos] = useState<typeof cursosDocente>([]);
  const [estudiantes, setEstudiantes] = useState<typeof estudiantesData>([]);
  const [tareas, setTareas] = useState<typeof tareasData>([]);
  const [examenes, setExamenes] = useState<typeof examenesData>([]);
  const [bancoPreguntas, setBancoPreguntas] = useState<typeof bancoPreguntasData>([]);
  const [modulosCurso, setModulosCurso] = useState<typeof modulosCursoData>([]);
  const [mensajes, setMensajes] = useState<typeof mensajesData>([]);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<typeof gruposData>([]);
  const [materiales, setMateriales] = useState<typeof materialesData>([]);
  const [carpetas, setCarpetas] = useState<typeof carpetasMaterialesData>([]);
  const [clasesVivo, setClasesVivo] = useState<typeof clasesVivoData>([]);
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [anuncios, setAnuncios] = useState<any[]>([]);

  // Modal states
  const [tareaEnRevision, setTareaEnRevision] = useState<any>(null);
  const [calificacionModal, setCalificacionModal] = useState<any>(null);
  const [crearTareaModal, setCrearTareaModal] = useState(false);
  const [crearExamenModal, setCrearExamenModal] = useState(false);
  const [estudianteDetalle, setEstudianteDetalle] = useState<EstudianteDetalle | null>(null);
  const [cursoDetalle, setCursoDetalle] = useState<any>(null);
  const [nuevoMensajeModal, setNuevoMensajeModal] = useState(false);
  const [conversacionActiva, setConversacionActiva] = useState<any>(null);
  const [modalMateriales, setModalMateriales] = useState(false);
  const [modalAsistencia, setModalAsistencia] = useState<any>(null);
  const [modalClase, setModalClase] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [modalGrupos, setModalGrupos] = useState(false);
  const [modalBancoPreguntas, setModalBancoPreguntas] = useState(false);
  const [vistaPreviaExamen, setVistaPreviaExamen] = useState(false);
  const [modalModulo, setModalModulo] = useState(false);
  const [modalTema, setModalTema] = useState(false);
  const [modalMaterialTema, setModalMaterialTema] = useState<any>(null);
  const [moduloEditar, setModuloEditar] = useState<any>(null);
  const [temaEditar, setTemaEditar] = useState<any>(null);
  const [claseEditar, setClaseEditar] = useState<any>(null);
  const [verParticipantes, setVerParticipantes] = useState<any>(null);
  const [verGrabaciones, setVerGrabaciones] = useState(false);
  const [modalClasePregrabada, setModalClasePregrabada] = useState(false);
  const [modalRubrica, setModalRubrica] = useState(false);
  const [rubricaEditar, setRubricaEditar] = useState<any>(null);
  const [vistaCalendario, setVistaCalendario] = useState('mes');
  const [modalEvento, setModalEvento] = useState(false);
  const [evaluacionConRubrica, setEvaluacionConRubrica] = useState<any>(null);
  const [modalMensajeMasivo, setModalMensajeMasivo] = useState(false);
  const [modalAnuncio, setModalAnuncio] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [modalConfigCurso, setModalConfigCurso] = useState<any>(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<any>(null);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<any[]>([]);
  const [libroCalificaciones, setLibroCalificaciones] = useState<any>(null);
  const [editandoCalificacion, setEditandoCalificacion] = useState<any>(null);
  const [filtroNotificaciones, setFiltroNotificaciones] = useState('todas');
  const [verTodasNotificaciones, setVerTodasNotificaciones] = useState(false);

  // Exam state
  const [preguntasExamen, setPreguntasExamen] = useState<any[]>([]);
  const [asistenciaEstudiantes, setAsistenciaEstudiantes] = useState<any>({});

  // Theme classes

  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = (useAuthStore as any).getState?.()?.user?.id;

        const [
          coursesData,
          studentsData,
          assignmentsData,
          inboxMessages,
          profileData,
          examsData,
          materialsData,
          foldersData,
          liveClassesData,
          groupsData,
          bancoRes,
          plantillasRes,
        ] = await Promise.allSettled([
          teacherCoursesApi.getAll(),
          teacherStudentsApi.getAll(),
          teacherAssignmentsApi.getAll(),
          teacherMessagesApi.getInbox().catch(() => []),
          userId ? usersApi.getById(userId) : Promise.resolve({ data: null }),
          examsApi.getAll(),
          materialsApi.getAll(),
          materialsApi.getFolders(),
          liveClassesApi.getAll(),
          groupsApi.getAll(),
          bancoPreguntasApi.getAll(),
          plantillasMensajeApi.getAll(),
        ]);

        if (bancoRes.status === "fulfilled") {
          const d = (bancoRes.value as any)?.data;
          // Se aplica aunque venga vacio: si no, seguirian a la vista las
          // preguntas y plantillas de ejemplo, que no existen en la base.
          if (Array.isArray(d)) setBancoPreguntas(d as any);
        }
        if (plantillasRes.status === "fulfilled") {
          const d = (plantillasRes.value as any)?.data;
          if (Array.isArray(d)) setPlantillas(d as any);
        }
        if (coursesData.status === "fulfilled") {
          // GET /courses responde { data, meta } y el cliente lo envuelve otra
          // vez, asi que `.data` es el sobre y no la lista: Array.isArray daba
          // false siempre y "Mis Cursos" quedaba vacio aunque el docente
          // tuviera grupos, dejando el temario fuera de alcance.
          //
          // Ademas la vista nacio contra el mock y lee nombre/codigo/color,
          // mientras el API devuelve name/code y ningun color: sin traducir
          // los campos las tarjetas salen en blanco. Se conserva el resto del
          // curso (id uuid, subjectId) porque de ahi cuelgan los materiales.
          const COLORES = [
            'bg-pn-accent',
            'bg-pn-ok',
            'bg-pn-warn',
            'bg-pn-accent-2',
            'bg-pn-accent-2',
            'bg-pn-ok',
          ];
          setCursos(
            comoArreglo<any>(coursesData.value).map((c, i) => ({
              ...c,
              nombre: c.nombre ?? c.name,
              codigo: c.codigo ?? c.code,
              estudiantes: c.estudiantes ?? c._count?.enrollments ?? 0,
              tareasPendientesRevision: c.tareasPendientesRevision ?? 0,
              progresoGeneral: c.progresoGeneral ?? 0,
              color: c.color ?? COLORES[i % COLORES.length],
            })) as any,
          );
        }
        if (studentsData.status === 'fulfilled') {
          const data = (studentsData.value as any)?.data;
          if (Array.isArray(data)) setEstudiantes(data);
        }
        if (assignmentsData.status === 'fulfilled') {
          const data = (assignmentsData.value as any)?.data;
          if (Array.isArray(data)) {
            // La API no expone `entregasTotales`; el conteo viene en
            // `_count.submissions`. Sin este mapeo la vista dividia por
            // undefined y pintaba `width: NaN%` en la barra de progreso.
            setTareas(
              data.map((t: any) => ({
                ...t,
                titulo: t.titulo ?? t.title,
                descripcion: t.descripcion ?? t.description,
                curso: t.curso ?? t.course?.name,
                // La vista lee `fechaLimite`; la API la llama `dueDate`, así
                // que la tarjeta mostraba "📅 Límite:" sin fecha alguna.
                fechaLimite:
                  t.fechaLimite ??
                  (t.dueDate ? new Date(t.dueDate).toLocaleDateString('es-CO') : ''),
                entregasTotales: t._count?.submissions ?? t.entregasTotales,
              })) as any,
            );
          }
        }
        if (inboxMessages.status === 'fulfilled') {
          const data = inboxMessages.value as any;
          if (Array.isArray(data)) setMensajes(data);
        }
        if (profileData.status === 'fulfilled') {
          const data = (profileData.value as any)?.data;
          if (data) {
            // Profile data available in state if needed; currently no dedicated teacher profile state
            // Sin estado de perfil docente todavia; nada que guardar aqui.
          }
        }
        if (examsData.status === 'fulfilled') {
          const data = (examsData.value as any)?.data;
          if (Array.isArray(data)) {
            setExamenes(data.map(mapExamenApi) as any);
          }
        }
        if (materialsData.status === 'fulfilled') {
          const data = (materialsData.value as any)?.data;
          if (Array.isArray(data)) {
            setMateriales(data.map(mapMaterialApi) as any);
          }
        }
        if (foldersData.status === 'fulfilled') {
          const data = (foldersData.value as any)?.data;
          if (Array.isArray(data)) {
            setCarpetas(data.map(mapCarpetaApi) as any);
          }
        }
        if (liveClassesData.status === 'fulfilled') {
          const data = (liveClassesData.value as any)?.data;
          if (Array.isArray(data)) {
            setClasesVivo(data.map(mapClaseVivoApi) as any);
          }
        }
        if (groupsData.status === 'fulfilled') {
          const data = (groupsData.value as any)?.data;
          if (Array.isArray(data)) {
            setGrupos(data.map(mapGrupoApi) as any);
          }
        }

        // Temario real. modulosCurso jamas se cargaba del API: nacia del mock
        // y solo crecia con creaciones locales, asi que al recargar el docente
        // veia otra vez el temario de ejemplo. Un "modulo" es un CourseTopic y
        // cada "tema" uno de sus blocks (ver src/api/endpoints/course-topics.ts).
        if (coursesData.status === 'fulfilled') {
          const cursosReales = comoArreglo<any>(coursesData.value);
          if (cursosReales.length > 0) {
            const temarios = await Promise.allSettled(
              cursosReales.map((c: any) => temarioApi.getByCourse(String(c.id))),
            );
            const modulos = temarios.flatMap((t, idx) => {
              if (t.status !== 'fulfilled') return [];
              const data = (t.value as any)?.data;
              if (!Array.isArray(data)) return [];
              return data.map((m: any) => ({
                id: m.id,
                cursoId: cursosReales[idx].id,
                titulo: m.title ?? m.titulo,
                descripcion: m.description ?? m.descripcion ?? '',
                orden: m.orderIndex ?? m.orden ?? 0,
                temas: Array.isArray(m.blocks)
                  ? m.blocks.map((b: any) => ({
                      id: b.id,
                      titulo: b.title ?? b.titulo,
                      tipo: 'teoria',
                      duracion: '',
                      completado: false,
                      materiales: [],
                    }))
                  : [],
              }));
            });
            setModulosCurso(modulos as any);
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

  // ========== ACTION FUNCTIONS ==========

  // Grupos Actions
  const verDetalleGrupo = (grupoId: number) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    avisar.info(`Detalle del Grupo:\n\nNombre: ${grupo.nombre}\nCódigo: ${grupo.codigo}\nCurso: ${grupo.curso}\nEstudiantes: ${grupo.estudiantesActivos}/${grupo.estudiantesTotales}\nProgreso: ${grupo.progreso}%\nHorario: ${grupo.horario}\nAula: ${grupo.aula}\nPróxima clase: ${grupo.proximaClase}`);
    setGrupoSeleccionado(grupo);
  };

  const enviarMensajeGrupo = (grupoId: number) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    const mensaje = prompt(`Enviar mensaje a todos los estudiantes del ${grupo.nombre}:\n\n(Escribe tu mensaje)`);
    if (mensaje && mensaje.trim()) {
      avisar.ok(`Mensaje enviado a ${grupo.estudiantesActivos} estudiantes del ${grupo.nombre}:\n\n"${mensaje}"`);
      // El aviso decía "mensaje enviado a N estudiantes" y no salía ninguno.
      // No hay envío a grupo en la API, así que se manda uno por integrante.
      const integrantes: any[] = (grupo as any).estudiantes ?? [];
      const destinatarios = integrantes
        .map((e: any) => e.userId ?? e.user?.id)
        .filter(Boolean);

      if (destinatarios.length === 0) {
        avisar.error('Este grupo no tiene integrantes con cuenta a los que escribir.');
      } else {
        Promise.allSettled(
          destinatarios.map((id: string) =>
            teacherMessagesApi.create({
              recipientId: id,
              subject: `Mensaje a ${grupo.nombre}`,
              body: mensaje,
            }),
          ),
        ).then((res) => {
          const fallos = res.filter((r) => r.status === 'rejected').length;
          if (fallos) avisar.error(`${fallos} de ${destinatarios.length} mensajes no se pudieron enviar.`);
        });
      }

      const nuevoMensaje = {
        id: mensajes.length + 1,
        para: grupo.nombre,
        asunto: 'Mensaje grupal',
        mensaje,
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'enviado' as const
      };
      setMensajes([nuevoMensaje, ...mensajes]);
    }
  };

  const crearGrupo = async (grupoData: any) => {
    const courseId = grupoData.courseId || resolverCourseId(grupoData.curso);

    if (courseId) {
      try {
        const { data } = await groupsApi.create({
          courseId,
          nombre: grupoData.nombre,
          descripcion: grupoData.descripcion || undefined,
          capacidadMaxima: grupoData.capacidadMaxima
            ? Number(grupoData.capacidadMaxima)
            : undefined,
          horario: grupoData.horario || undefined,
          aula: grupoData.aula || undefined,
          color: grupoData.color || undefined,
        });
        setGrupos([...grupos, mapGrupoApi(data)] as any);
        avisar.ok(`Grupo "${grupoData.nombre}" creado exitosamente!`);
        return;
      } catch (err: any) {
        console.error('Error creando grupo en el servidor:', err);
        avisar.error(
          `No se pudo guardar en el servidor (${err?.message || 'error de conexión'}). Se guardará localmente.`
        );
      }
    }

    const nuevoGrupo = {
      id: grupos.length + 1,
      nombre: grupoData.nombre,
      codigo: grupoData.codigo,
      curso: grupoData.curso,
      estudiantesActivos: 0,
      estudiantesTotales: 0,
      progreso: 0,
      horario: grupoData.horario || 'Por definir',
      aula: grupoData.aula || 'Por asignar',
      color: grupoData.color || 'bg-pn-accent',
      proximaClase: grupoData.proximaClase || 'Por programar',
      estudiantes: [],
      tareas: []
    };

    setGrupos([...grupos, nuevoGrupo] as any);
    avisar.ok(`Grupo "${grupoData.nombre}" creado exitosamente!`);
  };

  const editarGrupo = async (grupoId: number | string, grupoData: any) => {
    if (typeof grupoId === 'string') {
      try {
        await groupsApi.update(grupoId, {
          nombre: grupoData.nombre,
          horario: grupoData.horario,
          aula: grupoData.aula,
          color: grupoData.color,
          ...(grupoData.capacidadMaxima
            ? { capacidadMaxima: Number(grupoData.capacidadMaxima) }
            : {}),
        });
      } catch (err: any) {
        console.error('Error actualizando grupo en el servidor:', err);
        avisar.error(`No se pudo actualizar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setGrupos((grupos as any[]).map(g =>
      g.id === grupoId
        ? {
            ...g,
            nombre: grupoData.nombre,
            codigo: grupoData.codigo,
            curso: grupoData.curso,
            horario: grupoData.horario,
            aula: grupoData.aula,
            color: grupoData.color,
            proximaClase: grupoData.proximaClase
          }
        : g
    ) as any);
    avisar.ok(`Grupo "${grupoData.nombre}" actualizado exitosamente!`);
  };

  const eliminarGrupo = async (grupoId: number | string) => {
    const grupo = (grupos as any[]).find(g => g.id === grupoId);
    if (!grupo) return;

    if (typeof grupoId === 'string') {
      try {
        await groupsApi.delete(grupoId);
      } catch (err: any) {
        console.error('Error eliminando grupo en el servidor:', err);
        avisar.error(`No se pudo eliminar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setGrupos((grupos as any[]).filter(g => g.id !== grupoId) as any);
    avisar.ok(`Grupo "${grupo.nombre}" eliminado exitosamente.`);
  };

  const asignarEstudiantes = (grupoId: number, estudianteIds: number[]) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    const estudiantesAsignados = estudiantes.filter(e => estudianteIds.includes(e.id));

    // La asignación solo se reflejaba en la lista del navegador: el grupo
    // seguía vacío en la base y al recargar no quedaba nadie dentro.
    groupsApi
      .addMembers(String(grupoId), estudiantesAsignados.map((e: any) => String(e.id)))
      .catch((err: any) =>
        avisar.error('No se pudieron asignar los estudiantes: ' + (err?.message || 'error de conexión')),
      );

    setGrupos(grupos.map(g =>
      g.id === grupoId
        ? {
            ...g,
            estudiantes: estudiantesAsignados,
            estudiantesActivos: estudiantesAsignados.length,
            estudiantesTotales: estudiantesAsignados.length
          }
        : g
    ));

    avisar.ok(`${estudiantesAsignados.length} estudiante${estudiantesAsignados.length !== 1 ? 's' : ''} asignado${estudiantesAsignados.length !== 1 ? 's' : ''} al grupo "${grupo.nombre}" exitosamente!`);
  };

  const eliminarEstudianteDeGrupo = (grupoId: number, estudianteId: number) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;

    groupsApi
      .removeMember(String(grupoId), String(estudianteId))
      .catch((err: any) =>
        avisar.error('No se pudo sacar del grupo: ' + (err?.message || 'error de conexión')),
      );

    setGrupos(grupos.map(g =>
      g.id === grupoId
        ? {
            ...g,
            estudiantes: (g as any).estudiantes?.filter((e: any) => e.id !== estudianteId) || [],
            estudiantesActivos: Math.max(0, g.estudiantesActivos - 1),
            estudiantesTotales: Math.max(0, g.estudiantesTotales - 1)
          }
        : g
    ));

    avisar.ok(`"${estudiante.nombre}" eliminado del grupo "${grupo.nombre}".`);
  };

  const crearTareaGrupal = (grupoId: number, tareaData: any) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    const nuevaTarea = {
      id: tareas.length + 1,
      titulo: tareaData.titulo,
      descripcion: tareaData.descripcion,
      fechaEntrega: tareaData.fechaEntrega,
      puntos: tareaData.puntos,
      tipo: 'grupal' as const,
      curso: grupo.curso,
      grupoId: grupoId,
      estado: 'pendiente' as const,
      entregadas: 0,
      pendientes: grupo.estudiantesActivos
    };

    // La tarea grupal solo se apuntaba en memoria: el alumnado del grupo nunca
    // la veía. Se crea como tarea del curso del grupo; el backend no distingue
    // aún entre tarea individual y grupal, así que el matiz queda en el título.
    const courseId = resolverCourseId(grupo.curso);
    if (courseId) {
      teacherAssignmentsApi
        .create({
          courseId,
          titulo: tareaData.titulo,
          descripcion: tareaData.descripcion,
          fechaLimite: tareaData.fechaEntrega,
        } as any)
        .catch((err: any) =>
          avisar.error('No se pudo crear la tarea: ' + (err?.message || 'error de conexión')),
        );
    } else {
      avisar.error('No se pudo identificar el curso del grupo; la tarea no se guardó.');
    }

    setTareas([...tareas, nuevaTarea as any]);

    setGrupos(grupos.map(g =>
      g.id === grupoId
        ? {
            ...g,
            tareas: [...((g as any).tareas || []), nuevaTarea]
          }
        : g
    ));

    avisar.ok(`Tarea grupal "${tareaData.titulo}" creada exitosamente para el grupo "${grupo.nombre}"!\n\nSe notificará a ${grupo.estudiantesActivos} estudiante${grupo.estudiantesActivos !== 1 ? 's' : ''}.`);
  };

  // Aqui vivian crearCurso/editarCurso/eliminarCurso/archivarCurso: mutaban
  // solo el estado local con prompt() y anunciaban "exitosamente!" sin llamar
  // al API, asi que el curso desaparecia al recargar. Ademas el backend
  // reserva crear/eliminar cursos a TENANT_ADMIN (courses.controller.ts), de
  // modo que conectarlos desde el rol docente era imposible: se retiraron
  // junto con el resto de simulaciones ("En un caso real...").

  const agregarEstudiante = () => {
    const nombre = prompt('Nombre del estudiante:');
    if (!nombre?.trim()) return;

    const email = prompt('Email del estudiante:');
    if (!email?.trim()) return;

    const curso = prompt('Curso al que desea inscribir:');
    if (!curso?.trim()) return;

    const nuevoEstudiante = {
      id: estudiantes.length + 1,
      nombre,
      email,
      curso,
      progreso: 0,
      calificacionActual: 0,
      tareasPendientes: 0,
      ultimaActividad: 'Recién inscrito'
    };

    setEstudiantes([...estudiantes, nuevoEstudiante]);
    avisar.ok(`Estudiante "${nombre}" agregado exitosamente!`);
  };

  const editarEstudiante = (estudianteId: number) => {
    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;

    const nuevoEmail = prompt('Nuevo email:', estudiante.email);
    if (nuevoEmail && nuevoEmail.trim()) {
      setEstudiantes(estudiantes.map(e =>
        e.id === estudianteId ? { ...e, email: nuevoEmail } : e
      ));
      avisar.ok('Estudiante actualizado exitosamente!');
    }
  };

  const eliminarEstudiante = (estudianteId: number) => {
    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;

    // Esto decía "Estudiante eliminado exitosamente" y solo lo quitaba de la
    // lista del navegador: el alumno seguía matriculado y reaparecía al
    // recargar. Dar de baja a alguien de la institución es competencia de la
    // administración -- el backend responde 403 a un docente --, así que se
    // dice en claro en lugar de aparentar una baja que no ocurre.
    avisar.info(
      `Los docentes no pueden dar de baja a un estudiante de la institución.\n\n` +
      `Si "${estudiante.nombre}" debe salir de tu curso, pide a la administración ` +
      `que lo retire de la matrícula; si debe salir de un grupo, usa la gestión de grupos.`,
    );
  };

  /**
   * El mensaje se enviaba solo a la lista en memoria: el aviso decía "Mensaje
   * enviado" y el alumno no recibía nada. La API necesita el id de USUARIO del
   * destinatario, que no es el id de la ficha de estudiante.
   */
  const enviarMensajeEstudiante = async (estudianteId: number | string) => {
    const estudiante: any = estudiantes.find((e: any) => e.id === estudianteId);
    if (!estudiante) return;

    const nombre =
      estudiante.nombre ??
      [estudiante.user?.firstName, estudiante.user?.lastName].filter(Boolean).join(' ');
    const destinatario = estudiante.userId ?? estudiante.user?.id;
    if (!destinatario) {
      avisar.error('No se pudo determinar el destinatario de este estudiante.');
      return;
    }

    const asunto = prompt(`Asunto del mensaje a ${nombre}:`);
    if (!asunto?.trim()) return;
    const mensaje = prompt('Contenido del mensaje:');
    if (!mensaje?.trim()) return;

    try {
      await teacherMessagesApi.create({
        recipientId: destinatario,
        subject: asunto,
        body: mensaje,
      });
      setMensajes([
        {
          id: Date.now(),
          para: nombre,
          asunto,
          mensaje,
          fecha: new Date().toISOString().split('T')[0],
          tipo: 'enviado' as const,
        } as any,
        ...mensajes,
      ]);
      avisar.ok(`Mensaje enviado a ${nombre}!`);
    } catch (err: any) {
      avisar.error('No se pudo enviar el mensaje: ' + (err?.message || 'error de conexión'));
    }
  };

  const verPerfilEstudiante = (estudianteId: number) => {
    const perfilDetallado = estudiantesDetalleData.find(e => e.id === estudianteId);
    if (perfilDetallado) {
      setEstudianteDetalle(perfilDetallado);
    } else {
      avisar.error('No se encontró el perfil detallado del estudiante');
    }
  };

  const exportarDatosEstudiante = (estudianteId: number) => {
    const estudiante = estudiantesDetalleData.find(e => e.id === estudianteId);
    if (!estudiante) {
      avisar.error('Estudiante no encontrado');
      return;
    }

    try {
      generateStudentDataExcel(estudiante);
    } catch (err: any) {
      avisar.error('No se pudo generar el archivo: ' + (err?.message || 'error desconocido'));
    }
  };

  // Mensajes Actions
  const marcarMensajeLeido = async (mensajeId: number, leido: boolean) => {
    try {
      if (leido) {
        await teacherMessagesApi.markAsRead(String(mensajeId));
      }
      setMensajes(mensajes.map(m =>
        m.id === mensajeId ? { ...m, leido } as any : m
      ));
    } catch (err: any) {
      console.error('Error marcando mensaje como leído:', err);
    }
  };

  const eliminarMensaje = async (mensajeId: number) => {
    try {
      await teacherMessagesApi.delete(String(mensajeId));
      setMensajes(mensajes.filter(m => m.id !== mensajeId));
      avisar.ok('Mensaje eliminado exitosamente');
    } catch (err: any) {
      avisar.error('Error al eliminar mensaje: ' + (err.message || 'Error desconocido'));
    }
  };

  /**
   * La respuesta se añadía únicamente al hilo en memoria: el estudiante nunca
   * la recibía y al recargar desaparecía. Se envía como mensaje real a quien
   * escribió el original.
   */
  const responderMensaje = async (mensajeId: number | string, respuesta: string) => {
    const original: any = mensajes.find((m: any) => m.id === mensajeId);
    const destinatario = original?.senderId ?? original?.sender?.id;

    if (destinatario) {
      try {
        await teacherMessagesApi.create({
          recipientId: destinatario,
          subject: original?.subject
            ? `Re: ${original.subject}`
            : `Re: ${original?.asunto ?? 'tu mensaje'}`,
          body: respuesta,
        });
        await teacherMessagesApi.markAsRead(String(mensajeId)).catch(() => undefined);
      } catch (err: any) {
        avisar.error('No se pudo enviar la respuesta: ' + (err?.message || 'error de conexión'));
        return;
      }
    }

    setMensajes(mensajes.map(m => {
      if (m.id === mensajeId) {
        const nuevaRespuesta = {
          id: Date.now(),
          de: 'Profesor',
          mensaje: respuesta,
          fecha: new Date().toLocaleString('es', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        return {
          ...m,
          respuestas: [...(m.respuestas || []), nuevaRespuesta],
          leido: true
        } as any;
      }
      return m;
    }));
  };

  const archivarMensaje = async (mensajeId: number) => {
    try {
      await teacherMessagesApi.delete(String(mensajeId));
      avisar.ok('Mensaje archivado exitosamente');
    } catch (err: any) {
      console.error('Error archivando mensaje:', err);
    }
  };

  const enviarMensajeIndividual = async (destinatario: string, asunto: string, mensaje: string, adjuntos: string[] = []) => {
    try {
      await teacherMessagesApi.create({
        destinatario,
        asunto,
        contenido: mensaje,
        adjuntos,
      });

      const nuevoMensaje = {
        id: mensajes.length + 1,
        para: destinatario,
        asunto,
        mensaje,
        fecha: new Date().toLocaleString('es', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        tipo: 'enviado' as const,
        adjuntos: adjuntos.length > 0 ? adjuntos : undefined
      };

      setMensajes([nuevoMensaje as any, ...mensajes]);
      avisar.ok(`Mensaje enviado a ${destinatario} exitosamente`);
    } catch (err: any) {
      avisar.error('Error al enviar mensaje: ' + (err.message || 'Error desconocido'));
    }
  };

  // Tareas Actions
  const crearTarea = async (tareaData?: any) => {
    // Si se pasa data, usar eso; sino usar prompts (compatibilidad)
    if (tareaData) {
      try {
        const created = await teacherAssignmentsApi.create({
          titulo: tareaData.titulo,
          curso: tareaData.curso,
          fechaLimite: tareaData.fechaLimite,
          descripcion: tareaData.descripcion || '',
          puntaje: tareaData.puntaje || 10,
        });
        setTareas([...tareas, created as any]);
        avisar.ok(`Tarea "${tareaData.titulo}" creada exitosamente!`);
      } catch (err: any) {
        avisar.error('Error al crear tarea: ' + (err.message || 'Error desconocido'));
      } finally {
        setCrearTareaModal(false);
      }
      return;
    }

    // Modo legacy con prompts
    const titulo = prompt('Título de la tarea:');
    if (!titulo?.trim()) return;

    const curso = prompt('Curso:');
    if (!curso?.trim()) return;

    const fechaLimite = prompt('Fecha límite (YYYY-MM-DD):');
    if (!fechaLimite?.trim()) return;

    try {
      const created = await teacherAssignmentsApi.create({
        titulo,
        curso,
        fechaLimite,
      });
      setTareas([...tareas, created as any]);
      avisar.ok(`Tarea "${titulo}" creada exitosamente!`);
    } catch (err: any) {
      avisar.error('Error al crear tarea: ' + (err.message || 'Error desconocido'));
    } finally {
      setCrearTareaModal(false);
    }
  };

  /**
   * Abre el modal de revisión con las entregas cargadas.
   *
   * El listado `/assignments` solo trae el conteo (`_count.submissions`), no
   * las entregas, así que al pulsar una tarea el modal se abría con "Todas
   * (0)" y el docente no tenía nada que calificar. El detalle sí las incluye.
   */
  const abrirRevisionTarea = async (tarea: any) => {
    setTareaEnRevision(tarea);
    if (!tarea?.id) return;
    try {
      const { data } = (await teacherAssignmentsApi.getById(String(tarea.id))) as { data: any };
      const entregas = (data?.submissions || []).map((s: any) => ({
        id: s.id,
        estudianteId: s.studentId,
        estudianteNombre: [s.student?.user?.firstName, s.student?.user?.lastName]
          .filter(Boolean)
          .join(' '),
        estudianteEmail: s.student?.user?.email ?? '',
        fechaEntrega: s.submittedAt,
        archivo: s.fileUrl ?? undefined,
        comentario: s.content ?? '',
        calificacion: s.grade ?? undefined,
        feedback: s.feedback ?? '',
        estado: s.grade === null || s.grade === undefined ? 'pendiente' : 'revisada',
      }));
      setTareaEnRevision({
        ...tarea,
        titulo: tarea.titulo ?? data?.title,
        curso: tarea.curso ?? data?.course?.name,
        submissions: entregas,
        entregasTotales: entregas.length,
        entregasRevisadas: entregas.filter((e: any) => e.estado === 'revisada').length,
      });
    } catch (err: any) {
      console.error('Error cargando entregas:', err);
      avisar.error('No se pudieron cargar las entregas: ' + (err?.message || 'error de conexión'));
    }
  };

  const calificarEntrega = async (submissionId: number, calificacion: number, feedback: string) => {
    try {
      await teacherAssignmentsApi.grade(String(submissionId), { grade: calificacion, feedback });

      setTareas(tareas.map(tarea => {
        if (!tarea.submissions) return tarea;

        const submissionIndex = tarea.submissions.findIndex(s => s.id === submissionId);
        if (submissionIndex === -1) return tarea;

        const updatedSubmissions = [...tarea.submissions];
        const submission = updatedSubmissions[submissionIndex];

        const wasNew = submission.estado === 'pendiente';

        updatedSubmissions[submissionIndex] = {
          ...submission,
          calificacion,
          feedback,
          estado: 'revisada'
        };

        return {
          ...tarea,
          submissions: updatedSubmissions,
          entregasRevisadas: wasNew ? tarea.entregasRevisadas + 1 : tarea.entregasRevisadas
        };
      }));

      avisar.ok('¡Calificación guardada exitosamente!');
    } catch (err: any) {
      avisar.error('Error al guardar calificación: ' + (err.message || 'Error desconocido'));
    }
  };

  const editarTarea = (tareaId: number) => {
    const tarea = tareas.find(t => t.id === tareaId);
    if (!tarea) return;

    const nuevoTitulo = prompt('Nuevo título de la tarea:', tarea.titulo);
    if (nuevoTitulo && nuevoTitulo.trim()) {
      setTareas(tareas.map(t =>
        t.id === tareaId ? { ...t, titulo: nuevoTitulo } : t
      ));
      avisar.ok('Tarea actualizada exitosamente!');
    }
  };

  const eliminarTarea = async (tareaId: number) => {
    const tarea = tareas.find(t => t.id === tareaId);
    if (!tarea) return;

    if (await confirmar({ titulo: 'Eliminar tarea', mensaje: `¿Estás seguro de que deseas eliminar la tarea "${tarea.titulo}"?`, textoConfirmar: 'Eliminar', destructiva: true })) {
      setTareas(tareas.filter(t => t.id !== tareaId));
      avisar.ok('Tarea eliminada exitosamente.');
    }
  };

  const calificarTarea = (tareaId: number, estudianteId: number) => {
    const calificacion = prompt('Ingresa la calificación (0-10):');
    if (!calificacion) return;

    const nota = parseFloat(calificacion);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      avisar.error('Calificación inválida. Debe estar entre 0 y 10.');
      return;
    }

    const comentarios = prompt('Comentarios (opcional):');
    avisar.ok(`Tarea calificada:\nNota: ${nota}\nComentarios: ${comentarios || 'Ninguno'}`);

    setTareas(tareas.map(t =>
      t.id === tareaId
        ? { ...t, entregasRevisadas: t.entregasRevisadas + 1 }
        : t
    ));
  };

  // Exámenes Actions (conectados al API con respaldo local si el backend no responde)
  const ESTADO_EXAMEN_API: Record<string, string> = {
    PROGRAMADO: 'programado',
    ACTIVO: 'activo',
    FINALIZADO: 'finalizado',
  };

  // ---- Mapeadores API -> forma que consumen los componentes ----

  // El backend guarda el tipo en mayusculas (MaterialType); la UI usa etiquetas cortas.
  const TIPO_MATERIAL_API: Record<string, string> = {
    DOCUMENTO: 'pdf',
    VIDEO: 'video',
    ENLACE: 'enlace',
    // 'ppt' no es un valor de Material['tipo']: la presentación salía con el
    // icono genérico y no la encontraba el filtro por tipo.
    PRESENTACION: 'presentacion',
    IMAGEN: 'imagen',
    AUDIO: 'audio',
    OTRO: 'otro',
  };

  const TIPO_MATERIAL_UI: Record<string, MaterialType> = {
    pdf: 'DOCUMENTO',
    doc: 'DOCUMENTO',
    docx: 'DOCUMENTO',
    documento: 'DOCUMENTO',
    video: 'VIDEO',
    enlace: 'ENLACE',
    link: 'ENLACE',
    ppt: 'PRESENTACION',
    pptx: 'PRESENTACION',
    presentacion: 'PRESENTACION',
    imagen: 'IMAGEN',
    audio: 'AUDIO',
  };

  const formatearTamanio = (kb?: number | null): string => {
    if (kb == null) return '';
    return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
  };

  function mapMaterialApi(m: any) {
    return {
      id: m.id,
      nombre: m.nombre,
      tipo: TIPO_MATERIAL_API[m.tipo] || 'otro',
      url: m.url,
      tamaño: formatearTamanio(m.tamanioKb),
      fechaSubida:
        typeof m.createdAt === 'string' ? m.createdAt.split('T')[0] : m.createdAt,
      curso: m.course?.name || '',
      courseId: m.courseId,
      folderId: m.folderId,
      modulo: m.folder?.nombre || '',
      tema: m.descripcion || '',
      descargas: m.descargas ?? 0,
      vistas: m.descargas ?? 0,
      visible: m.visible,
    };
  }

  function mapCarpetaApi(c: any) {
    return {
      id: c.id,
      nombre: c.nombre,
      curso: c.course?.name || '',
      courseId: c.courseId,
      materiales: [] as any[],
      totalMateriales: c._count?.materials ?? 0,
    };
  }

  const ESTADO_CLASE_API: Record<string, string> = {
    PROGRAMADA: 'programada',
    EN_CURSO: 'en_curso',
    FINALIZADA: 'finalizada',
    CANCELADA: 'cancelada',
  };

  const soloHora = (iso?: string | null): string =>
    iso ? new Date(iso).toTimeString().slice(0, 5) : '';

  function mapClaseVivoApi(c: any) {
    return {
      id: c.id,
      titulo: c.titulo,
      curso: c.course?.name || '',
      courseId: c.courseId,
      tipo: ESTADO_CLASE_API[c.estado] || 'programada',
      fecha:
        typeof c.fechaInicio === 'string'
          ? c.fechaInicio.split('T')[0]
          : c.fechaInicio,
      horaInicio: soloHora(c.fechaInicio),
      horaFin: soloHora(c.fechaFin),
      duracion: c.duracionMinutos ? `${c.duracionMinutos} min` : '',
      enlaceReunion: c.enlace || '',
      plataforma: c.plataforma || '',
      descripcion: c.descripcion || '',
      grabacionUrl: c.grabacionUrl || '',
      participantes: [] as any[],
      totalAsistentes: c.asistentes ?? 0,
      materialesCompartidos: [] as any[],
    };
  }

  function mapGrupoApi(g: any) {
    const totales = g.members?.length ?? 0;
    return {
      id: g.id,
      nombre: g.nombre,
      curso: g.course?.name || '',
      courseId: g.courseId,
      codigo: g.course?.code ? `${g.course.code}-${g.nombre}` : g.nombre,
      estudiantesActivos: totales,
      estudiantesTotales: g.capacidadMaxima ?? totales,
      progreso: 0,
      horario: g.horario || '',
      aula: g.aula || '',
      color: g.color || 'bg-pn-accent-2',
      proximaClase: g.horario || '',
      miembros: g.members ?? [],
    };
  }

  function mapExamenApi(e: any) {
    return {
      id: e.id,
      titulo: e.titulo,
      curso: e.course?.name || e.curso || '',
      courseId: e.courseId,
      fecha: typeof e.fecha === 'string' ? e.fecha.split('T')[0] : e.fecha,
      duracion: e.duracion,
      estado: ESTADO_EXAMEN_API[e.estado] || e.estado,
      participantes: e._count?.intentos ?? e.participantes ?? 0,
    };
  }

  // Los cursos cargados del API tienen id uuid (string); los del mock, numérico
  const resolverCourseId = (curso: any): string | undefined => {
    const c: any = (cursos as any[]).find(
      (x: any) => x.id === curso || x.nombre === curso || x.name === curso
    );
    return typeof c?.id === 'string' ? c.id : undefined;
  };

  const crearExamen = async (examenData: any) => {
    const courseId = examenData.courseId || resolverCourseId(examenData.curso);
    if (courseId) {
      try {
        const fechaDate = new Date(examenData.fecha);
        const { data } = await examsApi.create({
          courseId,
          titulo: examenData.titulo,
          instrucciones: examenData.instrucciones || undefined,
          fecha: isNaN(fechaDate.getTime()) ? new Date().toISOString() : fechaDate.toISOString(),
          duracion: Number(examenData.duracion) || 60,
          notaMinima: examenData.notaMinima != null ? Number(examenData.notaMinima) : undefined,
          intentosPermitidos:
            examenData.intentosPermitidos != null ? Number(examenData.intentosPermitidos) : undefined,
          mostrarResultados: examenData.mostrarResultados,
          mezclarPreguntas: examenData.mezclarPreguntas,
          preguntas: (examenData.preguntas || []).map((p: any, i: number) => ({
            pregunta: p.pregunta,
            opciones: p.opciones || [],
            respuestaCorrecta: Number(p.respuestaCorrecta) || 0,
            puntaje: p.puntaje != null ? Number(p.puntaje) : undefined,
            orderIndex: i,
          })),
        });
        setExamenes([...examenes, mapExamenApi({ ...data, course: { name: examenData.curso } })] as any);
        avisar.ok(`Examen "${examenData.titulo}" creado exitosamente!\n\nPreguntas: ${examenData.preguntas?.length || 0}`);
        setCrearExamenModal(false);
        return;
      } catch (err: any) {
        console.error('Error creando examen en el servidor:', err);
        avisar.error(`No se pudo guardar en el servidor (${err?.message || 'error de conexión'}). Se guardará localmente.`);
      }
    }

    const nuevoExamen = {
      id: examenes.length + 1,
      titulo: examenData.titulo,
      curso: examenData.curso,
      fecha: examenData.fecha,
      duracion: examenData.duracion,
      estado: examenData.estado || 'programado',
      participantes: examenData.participantes || 0
    };
    setExamenes([...examenes, nuevoExamen]);
    avisar.ok(`Examen "${examenData.titulo}" creado exitosamente!\n\nPreguntas: ${examenData.preguntas?.length || 0}\nPuntaje total: ${examenData.puntajeTotal || 0} puntos`);
    setCrearExamenModal(false);
  };

  const editarExamen = async (examenId: any, examenData: any) => {
    if (typeof examenId === 'string') {
      try {
        const fechaDate = new Date(examenData.fecha);
        const { data } = await examsApi.update(examenId, {
          titulo: examenData.titulo,
          instrucciones: examenData.instrucciones || undefined,
          fecha: isNaN(fechaDate.getTime()) ? undefined : fechaDate.toISOString(),
          duracion: examenData.duracion != null ? Number(examenData.duracion) : undefined,
          notaMinima: examenData.notaMinima != null ? Number(examenData.notaMinima) : undefined,
          intentosPermitidos:
            examenData.intentosPermitidos != null ? Number(examenData.intentosPermitidos) : undefined,
          mostrarResultados: examenData.mostrarResultados,
          mezclarPreguntas: examenData.mezclarPreguntas,
          preguntas: examenData.preguntas
            ? examenData.preguntas.map((p: any, i: number) => ({
                pregunta: p.pregunta,
                opciones: p.opciones || [],
                respuestaCorrecta: Number(p.respuestaCorrecta) || 0,
                puntaje: p.puntaje != null ? Number(p.puntaje) : undefined,
                orderIndex: i,
              }))
            : undefined,
        });
        setExamenes(examenes.map((e: any) =>
          e.id === examenId ? mapExamenApi({ ...data, course: { name: examenData.curso || e.curso } }) : e
        ) as any);
        avisar.ok(`Examen "${examenData.titulo}" actualizado exitosamente!`);
        setCrearExamenModal(false);
        return;
      } catch (err: any) {
        console.error('Error actualizando examen en el servidor:', err);
        avisar.error(`No se pudo actualizar en el servidor (${err?.message || 'error de conexión'}).`);
        return;
      }
    }

    const examenActualizado = {
      id: examenId,
      titulo: examenData.titulo,
      curso: examenData.curso,
      fecha: examenData.fecha,
      duracion: examenData.duracion,
      estado: examenData.estado,
      participantes: examenData.participantes || 0
    };
    setExamenes(examenes.map(e =>
      e.id === examenId ? examenActualizado : e
    ));
    avisar.ok(`Examen "${examenData.titulo}" actualizado exitosamente!`);
    setCrearExamenModal(false);
  };

  const verResultadosExamen = async (examenId: any) => {
    const examen: any = examenes.find((e: any) => e.id === examenId);
    if (!examen) return;

    try {
      const { data } = await examsApi.getResults(String(examenId));
      const stats = data?.stats || {};
      const lista = (data?.intentos || [])
        .map((i: any) => `- ${i.estudiante} (${i.studentCode || 's/c'}): ${i.calificacion ?? 'sin calificar'}`)
        .join('\n');
      avisar.ok(
        `Resultados del Examen: ${examen.titulo}\n\n` +
        `Presentados: ${stats.presentados ?? 0}\n` +
        `Promedio: ${stats.promedio ?? 0}\n` +
        `Aprobados: ${stats.aprobados ?? 0} | Reprobados: ${stats.reprobados ?? 0}\n\n` +
        (lista || 'Aún no hay intentos registrados.')
      );
    } catch (err: any) {
      console.error('Error consultando resultados:', err);
      avisar.error(`No se pudieron consultar los resultados (${err?.message || 'error de conexión'}).`);
    }
  };

  const eliminarExamen = async (examenId: any) => {
    const examen: any = examenes.find((e: any) => e.id === examenId);
    if (!examen) return;

    if (!(await confirmar({ titulo: 'Eliminar examen', mensaje: `¿Estás seguro de que deseas eliminar el examen "${examen.titulo}"?`, textoConfirmar: 'Eliminar', destructiva: true }))) return;

    if (typeof examenId === 'string') {
      try {
        await examsApi.delete(examenId);
      } catch (err: any) {
        console.error('Error eliminando examen en el servidor:', err);
        avisar.error(`No se pudo eliminar en el servidor (${err?.message || 'error de conexión'}).`);
        return;
      }
    }
    setExamenes(examenes.filter((e: any) => e.id !== examenId));
    avisar.ok('Examen eliminado exitosamente.');
  };

  const publicarExamen = async (examenId: any) => {
    const examen: any = examenes.find((e: any) => e.id === examenId);
    if (!examen) return;

    if (!(await confirmar({ titulo: 'Publicar examen', mensaje: `¿Deseas publicar el examen "${examen.titulo}"?\n\nLos estudiantes podrán verlo y realizarlo.`, textoConfirmar: 'Publicar' }))) return;

    if (typeof examenId === 'string') {
      try {
        await examsApi.publish(examenId);
      } catch (err: any) {
        console.error('Error publicando examen en el servidor:', err);
        avisar.error(`No se pudo publicar en el servidor (${err?.message || 'error de conexión'}).`);
        return;
      }
    }
    setExamenes(examenes.map((e: any) =>
      e.id === examenId ? { ...e, estado: 'activo' as const } : e
    ) as any);
    avisar.ok('Examen publicado exitosamente!');
  };

  const obtenerExamenDetallado = (examenId: number) => {
    const examenDetallado = examenesDetalladosData.find((e: any) => e.id === examenId);

    if (examenDetallado) {
      return examenDetallado;
    }

    const examenBasico = examenes.find(e => e.id === examenId);
    if (examenBasico) {
      return {
        ...examenBasico,
        preguntas: [],
        instrucciones: 'Este examen aún no tiene instrucciones configuradas.',
        puntajeTotal: 0,
        notaMinima: 6,
        intentosPermitidos: 1,
        mostrarResultados: true,
        mezclarPreguntas: false
      };
    }

    return null;
  };

  // Calificaciones Actions
  // Mensajes Actions
  const enviarMensaje = () => {
    setNuevoMensajeModal(true);
  };

  const marcarComoLeido = async (mensajeId: number | string) => {
    // Solo se marcaba en memoria: al recargar el mensaje volvía a aparecer
    // como no leído y el contador de la campana nunca bajaba.
    try {
      await teacherMessagesApi.markAsRead(String(mensajeId));
    } catch {
      /* si falla, al menos no se bloquea la interfaz */
    }
    setMensajes(mensajes.map(m =>
      m.id === mensajeId ? { ...m, leido: true } as any : m
    ));
  };

  // Comunicación masiva y anuncios
  /**
   * Igual que los anuncios: el mensaje solo se apuntaba en la lista local y se
   * informaba de cuántos estudiantes lo recibirían, cuando no lo recibía
   * ninguno. El backend reserva POST /mass-messages a la administración
   * --403 para un docente, comprobado--, así que se hace la llamada real y se
   * muestra el motivo si la rechaza, en lugar de fingir el envío.
   */
  const enviarMensajeMasivo = async (mensajeData: any) => {
    const curso: any = cursos.find((c: any) => String(c.id) === String(mensajeData.cursoId));
    if (!curso) {
      avisar.error('Curso no encontrado');
      return;
    }

    try {
      await massMessagesApi.create({
        asunto: mensajeData.asunto,
        contenido: mensajeData.mensaje,
        destinatarios: 'ESTUDIANTES',
        cursoId: curso.id,
      } as any);
    } catch (err: any) {
      avisar.error('No se pudo enviar el mensaje masivo: ' + (err?.message || 'error de conexión'));
      return;
    }

    const estudiantesCurso = estudiantes.filter((e: any) => e.curso === curso.nombre);

    const nuevoMensaje = {
      id: mensajes.length + 1,
      para: `Todos los estudiantes de ${curso.nombre}`,
      asunto: mensajeData.asunto,
      mensaje: mensajeData.mensaje,
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'enviado' as const,
      masivo: true,
      adjuntos: mensajeData.adjuntos || []
    };

    setMensajes([nuevoMensaje, ...mensajes]);

    const adjuntosTexto = mensajeData.adjuntos && mensajeData.adjuntos.length > 0
      ? `\n\nArchivos adjuntos: ${mensajeData.adjuntos.map((f: File) => f.name).join(', ')}`
      : '';

    avisar.ok(`Mensaje masivo enviado exitosamente!\n\nDestinatarios: ${estudiantesCurso.length} estudiantes de ${curso.nombre}\nAsunto: ${mensajeData.asunto}${adjuntosTexto}`);
  };

  /**
   * El anuncio se anadia solo a la lista en memoria y se anunciaba que se
   * notificaria a N estudiantes: nadie recibia nada y al recargar desaparecia.
   *
   * OJO: el backend reserva POST /announcements a TENANT_ADMIN y SUPER_ADMIN
   * -- comprobado contra el sistema, un docente recibe 403 --, asi que aqui no
   * se inventa el permiso: se hace la llamada real y, si el servidor la
   * rechaza, se muestra su motivo en vez de un exito falso. Habilitar los
   * anuncios al profesorado es una decision de producto, no un arreglo.
   */
  const crearAnuncio = async (anuncioData: any) => {
    const curso: any = cursos.find((c: any) => String(c.id) === String(anuncioData.cursoId));
    if (!curso) {
      avisar.error('Curso no encontrado');
      return;
    }

    try {
      await announcementsApi.create({
        titulo: anuncioData.titulo,
        contenido: anuncioData.contenido,
        prioridad: String(anuncioData.prioridad || 'MEDIA').toUpperCase(),
        dirigidoA: 'ESTUDIANTES',
      } as any);
    } catch (err: any) {
      avisar.error('No se pudo publicar el anuncio: ' + (err?.message || 'error de conexión'));
      return;
    }

    const nuevoAnuncio = {
      id: anuncios.length + 1,
      titulo: anuncioData.titulo,
      contenido: anuncioData.contenido,
      curso: curso.nombre,
      prioridad: anuncioData.prioridad,
      fecha: new Date().toISOString().split('T')[0],
      adjuntos: anuncioData.adjuntos || [],
      visto: 0,
      totalEstudiantes: estudiantes.filter(e => e.curso === curso.nombre).length
    };

    setAnuncios([nuevoAnuncio, ...anuncios]);

    const prioridadEmoji = anuncioData.prioridad === 'alta' ? '🔴 ' : anuncioData.prioridad === 'normal' ? '🟡 ' : '🟢 ';
    const adjuntosTexto = anuncioData.adjuntos && anuncioData.adjuntos.length > 0
      ? `\n\nArchivos adjuntos: ${anuncioData.adjuntos.map((f: File) => f.name).join(', ')}`
      : '';

    avisar.ok(`${prioridadEmoji}Anuncio creado exitosamente!\n\nTítulo: ${anuncioData.titulo}\nCurso: ${curso.nombre}\nPrioridad: ${anuncioData.prioridad}${adjuntosTexto}\n\nSe notificará a ${nuevoAnuncio.totalEstudiantes} estudiantes.`);
  };

  /** Las plantillas de mensaje tampoco tenían dónde guardarse. */
  const guardarPlantilla = async (plantillaData: any) => {
    try {
      const { data } = await plantillasMensajeApi.create({
        nombre: plantillaData.nombre,
        contenido: plantillaData.contenido,
        categoria: plantillaData.categoria,
      });
      setPlantillas([
        ...plantillas,
        {
          id: (data as any)?.id,
          nombre: plantillaData.nombre,
          categoria: plantillaData.categoria,
          contenido: plantillaData.contenido,
          fechaCreacion: new Date().toISOString().split('T')[0],
        },
      ] as any);
      avisar.ok(`Plantilla "${plantillaData.nombre}" guardada exitosamente!`);
    } catch (err: any) {
      avisar.error('No se pudo guardar la plantilla: ' + (err?.message || 'error de conexión'));
    }
  };

  const eliminarPlantilla = async (plantillaId: number) => {
    const plantilla = plantillas.find(p => p.id === plantillaId);
    if (!plantilla) return;

    if (await confirmar({ titulo: 'Eliminar plantilla', mensaje: `¿Estás seguro de eliminar la plantilla "${plantilla.nombre}"?`, textoConfirmar: 'Eliminar', destructiva: true })) {
      // Sin esta llamada la plantilla reaparecía al recargar.
      plantillasMensajeApi.remove(String(plantillaId)).catch(() => undefined);
      setPlantillas(plantillas.filter(p => p.id !== plantillaId));
      avisar.ok('Plantilla eliminada exitosamente.');
    }
  };

  // Materiales Actions
  const subirMaterial = async (materialData: any) => {
    const courseId = materialData.courseId || resolverCourseId(materialData.curso);

    if (courseId) {
      try {
        // Si el usuario eligió un archivo, primero se sube y se usa su URL.
        let url = materialData.url;
        let formato = materialData.formato;
        let tamanioKb: number | undefined;

        if (materialData.archivo instanceof File) {
          const { data: archivo } = await uploadsApi.subir(materialData.archivo, 'materiales');
          url = archivo.url;
          formato = archivo.formato;
          tamanioKb = archivo.tamanioKb;
        }

        if (!url) {
          avisar.warn('Debes seleccionar un archivo o indicar un enlace.');
          return;
        }

        const { data } = await materialsApi.create({
          courseId,
          folderId: materialData.folderId || undefined,
          nombre: materialData.nombre,
          descripcion: materialData.tema || materialData.descripcion || undefined,
          tipo: TIPO_MATERIAL_UI[String(materialData.tipo).toLowerCase()] || 'OTRO',
          url,
          formato: formato || undefined,
          tamanioKb,
        });
        setMateriales([
          ...materiales,
          mapMaterialApi({ ...data, course: { name: materialData.curso } }),
        ] as any);
        avisar.ok(`Material "${materialData.nombre}" subido exitosamente!`);
        return;
      } catch (err: any) {
        console.error('Error subiendo material al servidor:', err);
        avisar.error(
          `No se pudo guardar en el servidor (${err?.message || 'error de conexión'}). Se guardará localmente.`
        );
      }
    }

    const nuevoMaterial = {
      id: materiales.length + 1,
      nombre: materialData.nombre,
      tipo: materialData.tipo,
      url: materialData.url,
      tamaño: materialData.tamaño,
      duracion: materialData.duracion,
      fechaSubida: new Date().toISOString().split('T')[0],
      curso: materialData.curso,
      modulo: materialData.modulo,
      tema: materialData.tema,
      descargas: 0,
      vistas: 0
    };

    setMateriales([...materiales, nuevoMaterial] as any);
    avisar.ok(`Material "${materialData.nombre}" subido exitosamente!`);
  };

  const eliminarMaterial = async (materialId: number | string) => {
    const material = (materiales as any[]).find(m => m.id === materialId);
    if (!material) return;

    if (!(await confirmar({ titulo: 'Eliminar material', mensaje: `¿Estás seguro de que deseas eliminar "${material.nombre}"?`, textoConfirmar: 'Eliminar', destructiva: true }))) return;

    if (typeof materialId === 'string') {
      try {
        await materialsApi.delete(materialId);
      } catch (err: any) {
        console.error('Error eliminando material en el servidor:', err);
        avisar.error(`No se pudo eliminar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setMateriales((materiales as any[]).filter(m => m.id !== materialId) as any);
    avisar.ok('Material eliminado exitosamente.');
  };

  const editarMaterial = async (materialId: number | string, materialData: any) => {
    if (typeof materialId === 'string') {
      try {
        await materialsApi.update(materialId, {
          nombre: materialData.nombre,
          descripcion: materialData.tema || materialData.descripcion,
          url: materialData.url,
          visible: materialData.visible,
          ...(materialData.tipo
            ? { tipo: TIPO_MATERIAL_UI[String(materialData.tipo).toLowerCase()] || 'OTRO' }
            : {}),
        });
      } catch (err: any) {
        console.error('Error actualizando material en el servidor:', err);
        avisar.error(`No se pudo actualizar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setMateriales((materiales as any[]).map(m =>
      m.id === materialId
        ? { ...m, ...materialData }
        : m
    ) as any);
    avisar.ok('Material actualizado exitosamente!');
  };

  const crearCarpeta = async (carpetaData: any) => {
    const courseId = carpetaData.courseId || resolverCourseId(carpetaData.curso);

    if (courseId) {
      try {
        const { data } = await materialsApi.createFolder({
          courseId,
          nombre: carpetaData.nombre,
          descripcion: carpetaData.descripcion || undefined,
        });
        setCarpetas([
          ...carpetas,
          mapCarpetaApi({ ...data, course: { name: carpetaData.curso } }),
        ] as any);
        avisar.ok(`Carpeta "${carpetaData.nombre}" creada exitosamente!`);
        return;
      } catch (err: any) {
        console.error('Error creando carpeta en el servidor:', err);
        avisar.error(
          `No se pudo guardar en el servidor (${err?.message || 'error de conexión'}). Se guardará localmente.`
        );
      }
    }

    const nuevaCarpeta = {
      id: carpetas.length + 1,
      nombre: carpetaData.nombre,
      curso: carpetaData.curso,
      materiales: []
    };

    setCarpetas([...carpetas, nuevaCarpeta] as any);
    avisar.ok(`Carpeta "${carpetaData.nombre}" creada exitosamente!`);
  };

  const eliminarCarpeta = async (carpetaId: number | string) => {
    const carpeta = (carpetas as any[]).find(c => c.id === carpetaId);
    if (!carpeta) return;

    if (!(await confirmar({ titulo: 'Eliminar carpeta', mensaje: `¿Estás seguro de que deseas eliminar la carpeta "${carpeta.nombre}"?`, textoConfirmar: 'Eliminar', destructiva: true }))) return;

    if (typeof carpetaId === 'string') {
      try {
        await materialsApi.deleteFolder(carpetaId);
      } catch (err: any) {
        console.error('Error eliminando carpeta en el servidor:', err);
        avisar.error(`No se pudo eliminar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setCarpetas((carpetas as any[]).filter(c => c.id !== carpetaId) as any);
    avisar.ok('Carpeta eliminada exitosamente.');
  };

  /**
   * Las carpetas y la pertenencia de cada material a una carpeta solo se
   * movían en memoria: al recargar volvía la organización anterior. En la base
   * la relación vive en `Material.folderId`, así que mover un material es
   * actualizar ese campo, no tocar una lista dentro de la carpeta.
   */
  const editarCarpeta = async (carpetaId: number | string, carpetaData: Partial<CarpetaMaterial>) => {
    try {
      await materialsApi.updateFolder(String(carpetaId), carpetaData as any);
      setCarpetas(carpetas.map(c => (c.id === carpetaId ? { ...c, ...carpetaData } : c)));
      avisar.ok('Carpeta actualizada exitosamente!');
    } catch (err: any) {
      avisar.error('No se pudo actualizar la carpeta: ' + (err?.message || 'error de conexión'));
    }
  };

  const agregarMaterialCarpeta = async (carpetaId: number | string, materialId: number | string) => {
    const carpeta: any = carpetas.find((c: any) => c.id === carpetaId);

    if (carpeta?.materiales?.includes(materialId as any)) {
      avisar.warn('Material ya está en la carpeta');
      return;
    }

    try {
      await materialsApi.update(String(materialId), { folderId: String(carpetaId) } as any);
    } catch (err: any) {
      avisar.error('No se pudo mover el material: ' + (err?.message || 'error de conexión'));
      return;
    }

    setCarpetas(carpetas.map(c =>
      c.id === carpetaId
        ? { ...c, materiales: [...c.materiales, materialId] }
        : c
    ) as any);
    avisar.ok('Material agregado exitosamente!');
  };

  const removerMaterialCarpeta = async (carpetaId: number | string, materialId: number | string) => {
    try {
      // Sacar de la carpeta es dejar el material sin carpeta, no borrarlo.
      await materialsApi.update(String(materialId), { folderId: null } as any);
    } catch (err: any) {
      avisar.error('No se pudo sacar el material: ' + (err?.message || 'error de conexión'));
      return;
    }
    setCarpetas(carpetas.map(c =>
      c.id === carpetaId
        ? { ...c, materiales: c.materiales.filter(mId => mId !== materialId) }
        : c
    ));
    avisar.ok('Material removido exitosamente!');
  };

  const moverMaterial = async (
    materialId: number | string,
    carpetaIdOrigen: number | string | null,
    carpetaIdDestino: number | string | null
  ) => {
    try {
      // Un solo campo decide dónde está el material: la carpeta destino, o
      // ninguna si se saca a la raíz. Antes solo se reordenaban dos listas en
      // memoria y al recargar todo volvía a su sitio anterior.
      await materialsApi.update(String(materialId), {
        folderId: carpetaIdDestino ? String(carpetaIdDestino) : null,
      } as any);
    } catch (err: any) {
      avisar.error('No se pudo mover el material: ' + (err?.message || 'error de conexión'));
      return;
    }

    if (carpetaIdOrigen) {
      setCarpetas(carpetas.map(c =>
        c.id === carpetaIdOrigen
          ? { ...c, materiales: c.materiales.filter(mId => mId !== materialId) }
          : c
      ));
    }

    if (carpetaIdDestino) {
      setCarpetas(carpetas.map(c =>
        c.id === carpetaIdDestino
          ? { ...c, materiales: [...c.materiales, materialId] }
          : c
      ) as any);
    }

    avisar.ok('Material movido exitosamente!');
  };

  const organizarMateriales = () => {
    avisar.info('Organizando materiales...\n\nPuedes crear carpetas, mover archivos, y reorganizar el contenido.');
    setModalMateriales(true);
  };

  // Calendario Actions
  /**
   * Los eventos del calendario se anunciaban como creados y no se guardaban en
   * ningún sitio: ni siquiera se añadían a la lista local. El horario del
   * backend trabaja por día de la semana y franja horaria, no por fecha
   * suelta, así que se pide el día y las horas de inicio y fin.
   */
  const crearEvento = async () => {
    const titulo = prompt('Título del evento:');
    if (!titulo?.trim()) return;

    const dia = prompt('Día de la semana (1 = lunes … 7 = domingo):');
    const diaSemana = parseInt(String(dia), 10);
    if (!Number.isFinite(diaSemana) || diaSemana < 1 || diaSemana > 7) {
      avisar.error('Día inválido. Debe ser un número del 1 al 7.');
      return;
    }

    const horaInicio = prompt('Hora de inicio (HH:MM):');
    if (!horaInicio?.trim()) return;
    const horaFin = prompt('Hora de fin (HH:MM):');
    if (!horaFin?.trim()) return;

    try {
      await scheduleApi.create({ titulo, diaSemana, horaInicio, horaFin });
      avisar.ok(`Evento "${titulo}" creado.`);
      setModalEvento(false);
    } catch (err: any) {
      avisar.error('No se pudo crear el evento: ' + (err?.message || 'error de conexión'));
    }
  };

  const editarEvento = async (eventoId: number | string) => {
    const horaInicio = prompt('Nueva hora de inicio (HH:MM):');
    if (!horaInicio?.trim()) return;
    const horaFin = prompt('Nueva hora de fin (HH:MM):');
    if (!horaFin?.trim()) return;
    try {
      await scheduleApi.update(String(eventoId), { horaInicio, horaFin });
      avisar.ok('Evento actualizado exitosamente!');
    } catch (err: any) {
      avisar.error('No se pudo actualizar: ' + (err?.message || 'error de conexión'));
    }
  };

  const eliminarEvento = async (eventoId: number | string) => {
    if (!(await confirmar({ titulo: 'Eliminar evento', mensaje: '¿Estás seguro de que deseas eliminar este evento?', textoConfirmar: 'Eliminar', destructiva: true }))) return;
    try {
      await scheduleApi.delete(String(eventoId));
      avisar.ok('Evento eliminado exitosamente.');
    } catch (err: any) {
      avisar.error('No se pudo eliminar: ' + (err?.message || 'error de conexión'));
    }
  };

  // Analíticas Actions
  const generarEstadisticas = () => {
    avisar.info('Generando estadísticas generales...\n\nIncluye: Rendimiento de estudiantes, progreso de cursos, tendencias');
  };

  // Configuración Actions
  const actualizarConfiguracion = () => {
    avisar.ok('Configuración actualizada exitosamente!');
  };

  const cambiarContrasena = () => {
    const nuevaContrasena = prompt('Nueva contraseña:');
    if (nuevaContrasena && nuevaContrasena.trim()) {
      const confirmarContrasena = prompt('Confirmar contraseña:');
      if (nuevaContrasena === confirmarContrasena) {
        avisar.ok('Contraseña actualizada exitosamente!');
      } else {
        avisar.warn('Las contraseñas no coinciden.');
      }
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      await notificationsService.markAsRead(String(id));
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const eliminarNotificacion = async (id: number) => {
    try {
      await notificationsService.deleteNotification(String(id));
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Banco de Preguntas Actions
  const agregarPregunta = () => {
    const pregunta = prompt('Texto de la pregunta:');
    if (!pregunta?.trim()) return;

    const tipo = prompt('Tipo (multiple, verdadero-falso, abierta):');
    if (!tipo?.trim()) return;

    const nuevaPregunta: any = {
      id: bancoPreguntas.length + 1,
      tipo: tipo as any,
      pregunta,
      puntos: 1,
      categoria: 'General'
    };

    if (tipo === 'multiple') {
      nuevaPregunta.opciones = ['Opción A', 'Opción B', 'Opción C', 'Opción D'];
      nuevaPregunta.respuestaCorrecta = 0;
    } else if (tipo === 'verdadero-falso') {
      nuevaPregunta.respuestaCorrecta = true;
    }

    // El banco solo existía en memoria: se perdía al recargar. Ahora persiste.
    bancoPreguntasApi
      .create({
        pregunta: nuevaPregunta.pregunta,
        tipo: nuevaPregunta.tipo,
        opciones: nuevaPregunta.opciones ?? [],
        respuestaCorrecta:
          typeof nuevaPregunta.respuestaCorrecta === 'number'
            ? nuevaPregunta.respuestaCorrecta
            : undefined,
        puntos: nuevaPregunta.puntos,
        categoria: nuevaPregunta.categoria,
      })
      .then(({ data }) => {
        setBancoPreguntas([...bancoPreguntas, { ...nuevaPregunta, id: (data as any)?.id }] as any);
        avisar.ok('Pregunta agregada al banco exitosamente!');
      })
      .catch((err: any) =>
        avisar.error('No se pudo guardar la pregunta: ' + (err?.message || 'error de conexión')),
      );
    setModalBancoPreguntas(false);
  };

  const editarPregunta = (preguntaId: number, preguntaData?: Partial<Question>) => {
    const preguntaExistente = bancoPreguntas.find(p => p.id === preguntaId);
    if (!preguntaExistente) return;

    // Si se proporciona preguntaData, usar eso (llamado desde modal)
    if (preguntaData) {
      bancoPreguntasApi.update(String(preguntaId), (preguntaData || {}) as any).catch(() => undefined);
      setBancoPreguntas(bancoPreguntas.map(p =>
        p.id === preguntaId ? { ...p, ...preguntaData } : p
      ));
      avisar.ok('Pregunta actualizada exitosamente!');
      return;
    }

    // Modo legacy con prompt (para compatibilidad)
    const nuevaPregunta = prompt('Nuevo texto:', preguntaExistente.pregunta);
    if (nuevaPregunta && nuevaPregunta.trim()) {
      setBancoPreguntas(bancoPreguntas.map(p =>
        p.id === preguntaId ? { ...p, pregunta: nuevaPregunta } : p
      ));
      avisar.ok('Pregunta actualizada exitosamente!');
    }
  };

  const eliminarPregunta = async (preguntaId: number, pedirConfirmacion: boolean = true) => {
    // Si pedirConfirmacion es false, eliminar directamente (llamado desde modal con confirmación previa)
    if (!pedirConfirmacion) {
      bancoPreguntasApi.remove(String(preguntaId)).catch(() => undefined);
      setBancoPreguntas(bancoPreguntas.filter(p => p.id !== preguntaId));
      avisar.ok('Pregunta eliminada exitosamente.');
      return;
    }

    // Modo con confirmación (comportamiento por defecto)
    if (await confirmar({ titulo: 'Eliminar pregunta', mensaje: '¿Estás seguro de que deseas eliminar esta pregunta del banco?', textoConfirmar: 'Eliminar', destructiva: true })) {
      bancoPreguntasApi.remove(String(preguntaId)).catch(() => undefined);
      setBancoPreguntas(bancoPreguntas.filter(p => p.id !== preguntaId));
      avisar.ok('Pregunta eliminada exitosamente.');
    }
  };

  // Módulos y Contenido Actions
  const crearModulo = (moduloData: any) => {
    const nuevoModulo = {
      id: modulosCurso.length + 1,
      cursoId: moduloData.cursoId,
      titulo: moduloData.titulo,
      descripcion: moduloData.descripcion,
      orden: moduloData.orden || modulosCurso.length + 1,
      temas: []
    };

    // Sin esta llamada el temario solo existia en memoria y se perdia al
    // recargar. En la base un "modulo" es un CourseTopic.
    temarioApi
      .crearModulo({
        courseId: String(moduloData.cursoId),
        title: moduloData.titulo,
        description: moduloData.descripcion,
        orderIndex: moduloData.orden,
      })
      .then(({ data }) => {
        setModulosCurso([...modulosCurso, { ...nuevoModulo, id: (data as any)?.id }] as any);
        // El exito se anuncia cuando el servidor confirma; antes el alert salia
        // de inmediato aunque el modulo no se hubiera guardado.
        avisar.ok(`Módulo "${moduloData.titulo}" creado exitosamente!`);
      })
      .catch((err) => avisar.error("No se pudo crear el modulo: " + ((err && err.message) || "error de conexion")));
  };

  const editarModulo = (moduloId: number | string, moduloData: any) => {
    temarioApi
      .actualizarModulo(String(moduloId), {
        title: moduloData.titulo,
        description: moduloData.descripcion,
        orderIndex: moduloData.orden,
      })
      .catch((err: any) =>
        avisar.error('No se pudo actualizar el módulo: ' + (err?.message || 'error de conexión')),
      );
    setModulosCurso(modulosCurso.map(m =>
      m.id === moduloId
        ? { ...m, titulo: moduloData.titulo, descripcion: moduloData.descripcion, orden: moduloData.orden }
        : m
    ));
    avisar.ok('Módulo actualizado exitosamente!');
  };

  const eliminarModulo = async (moduloId: number) => {
    const modulo = modulosCurso.find(m => m.id === moduloId);
    if (!modulo) return;

    if (await confirmar({ titulo: 'Eliminar módulo', mensaje: `¿Estás seguro de que deseas eliminar el módulo "${modulo.titulo}"?\n\nEsta acción eliminará también todos sus temas.`, textoConfirmar: 'Eliminar', destructiva: true })) {
      // El borrado arrastra sus temas por la cascada del esquema.
      temarioApi.eliminarModulo(String(moduloId)).catch(() => undefined);
      setModulosCurso(modulosCurso.filter(m => m.id !== moduloId));
      avisar.ok('Módulo eliminado exitosamente.');
    }
  };

  const crearTema = (moduloId: number, temaData: any) => {
    const modulo = modulosCurso.find(m => m.id === moduloId);
    if (!modulo) {
      avisar.error('Error: Módulo no encontrado');
      return;
    }

    const nuevoTema = {
      id: Date.now(),
      titulo: temaData.titulo,
      tipo: temaData.tipo,
      duracion: temaData.duracion,
      descripcion: temaData.descripcion || '',
      materiales: []
    };

    temarioApi
      .crearTema(String(moduloId), {
        title: temaData.titulo,
        content: temaData.descripcion || '',
      })
      .then(({ data }) => {
        const conId = { ...nuevoTema, id: (data as any)?.id ?? nuevoTema.id };
        setModulosCurso(modulosCurso.map(m =>
          m.id === moduloId ? { ...m, temas: [...m.temas, conId as any] } : m
        ));
      })
      .catch((err: any) =>
        avisar.error('No se pudo crear el tema: ' + (err?.message || 'error de conexión')),
      );

    avisar.ok(`Tema "${temaData.titulo}" creado exitosamente!`);
  };

  const editarTema = (temaId: number | string, temaData: any) => {
    temarioApi
      .actualizarTema(String(temaId), {
        title: temaData.titulo,
        content: temaData.descripcion,
      })
      .catch((err: any) =>
        avisar.error('No se pudo actualizar el tema: ' + (err?.message || 'error de conexión')),
      );
    setModulosCurso(modulosCurso.map(modulo => ({
      ...modulo,
      temas: modulo.temas.map(tema =>
        tema.id === temaId
          ? { ...tema, ...temaData }
          : tema
      )
    })));
    avisar.ok('Tema actualizado exitosamente!');
  };

  const eliminarTema = async (temaId: number) => {
    if (await confirmar({ titulo: 'Eliminar tema', mensaje: '¿Estás seguro de que deseas eliminar este tema?', textoConfirmar: 'Eliminar', destructiva: true })) {
      temarioApi.eliminarTema(String(temaId)).catch(() => undefined);
      setModulosCurso(modulosCurso.map(modulo => ({
        ...modulo,
        temas: modulo.temas.filter(tema => tema.id !== temaId)
      })));
      avisar.ok('Tema eliminado exitosamente.');
    }
  };

  // Clases en Vivo Actions

  /** Combina una fecha (YYYY-MM-DD) y una hora (HH:mm) en un ISO valido. */
  const combinarFechaHora = (fecha: string, hora?: string): string => {
    const base = new Date(`${fecha}T${hora || '00:00'}:00`);
    return isNaN(base.getTime()) ? new Date().toISOString() : base.toISOString();
  };

  const programarClase = async (claseData: any) => {
    const courseId = claseData.courseId || resolverCourseId(claseData.curso);

    if (courseId) {
      try {
        const { data } = await liveClassesApi.create({
          courseId,
          titulo: claseData.titulo,
          descripcion: claseData.descripcion || undefined,
          fechaInicio: combinarFechaHora(claseData.fecha, claseData.horaInicio),
          fechaFin: claseData.horaFin
            ? combinarFechaHora(claseData.fecha, claseData.horaFin)
            : undefined,
          enlace: claseData.enlaceReunion || undefined,
          plataforma: claseData.plataforma || undefined,
        });
        setClasesVivo([
          ...clasesVivo,
          mapClaseVivoApi({ ...data, course: { name: claseData.curso } }),
        ] as any);
        avisar.ok(`Clase "${claseData.titulo}" programada para ${claseData.fecha} a las ${claseData.horaInicio}!\n\nSe enviará notificación a los estudiantes.`);
        setModalClase(false);
        return;
      } catch (err: any) {
        console.error('Error programando clase en el servidor:', err);
        avisar.error(
          `No se pudo guardar en el servidor (${err?.message || 'error de conexión'}). Se guardará localmente.`
        );
      }
    }

    const nuevaClase = {
      id: clasesVivo.length + 1,
      titulo: claseData.titulo,
      curso: claseData.curso,
      tipo: 'programada' as const,
      fecha: claseData.fecha,
      horaInicio: claseData.horaInicio,
      horaFin: claseData.horaFin,
      duracion: claseData.duracion,
      enlaceReunion: claseData.enlaceReunion,
      plataforma: claseData.plataforma,
      descripcion: claseData.descripcion,
      participantes: [],
      materialesCompartidos: [],
      grabacionDisponible: false
    };

    setClasesVivo([...clasesVivo, nuevaClase as any]);
    avisar.ok(`Clase "${claseData.titulo}" programada para ${claseData.fecha} a las ${claseData.horaInicio}!\n\nSe enviará notificación a los estudiantes.`);
    setModalClase(false);
  };

  const subirClasePregrabada = (claseData: any) => {
    const nuevaClase = {
      id: clasesVivo.length + 1,
      titulo: claseData.titulo,
      curso: claseData.curso,
      tipo: 'pregrabada' as const,
      fecha: claseData.fecha,
      horaInicio: '00:00',
      horaFin: '00:00',
      duracion: claseData.duracion,
      plataforma: 'Otra' as const,
      descripcion: claseData.descripcion,
      grabacionUrl: claseData.grabacionUrl,
      grabacionDisponible: true
    };

    // Solo se añadía a la lista del navegador: la clase no existía para nadie
    // más y desaparecía al recargar.
    const courseId = resolverCourseId(claseData.curso);
    if (!courseId) {
      avisar.error('No se pudo identificar el curso; la clase no se guardó.');
      return;
    }

    liveClassesApi
      .create({
        courseId,
        titulo: claseData.titulo,
        descripcion: claseData.descripcion,
        // Una grabación no tiene franja horaria: se registra con la fecha
        // indicada y se marca como finalizada, que es su estado real.
        fechaHora: combinarFechaHora(claseData.fecha, '00:00'),
        duracion: Number(claseData.duracion) || 60,
        grabacionUrl: claseData.grabacionUrl,
      } as any)
      .then(({ data }) => {
        setClasesVivo([...clasesVivo, { ...nuevaClase, id: (data as any)?.id ?? nuevaClase.id }] as any);
        avisar.ok(`Clase pregrabada "${claseData.titulo}" subida exitosamente!`);
      })
      .catch((err: any) =>
        avisar.error('No se pudo guardar la clase: ' + (err?.message || 'error de conexión')),
      );
  };

  const iniciarClaseEnVivo = async (claseId: number | string) => {
    const clase = (clasesVivo as any[]).find(c => c.id === claseId);
    if (!clase) return;

    try {
      await liveClassesApi.start(String(claseId));
    } catch (err: any) {
      console.error('Error iniciando clase en el servidor:', err);
      avisar.error(`No se pudo iniciar en el servidor: ${err?.message || 'error de conexión'}`);
      return;
    }

    setClasesVivo((clasesVivo as any[]).map(c =>
      c.id === claseId ? { ...c, tipo: 'en_curso' } : c
    ) as any);

    // La clase queda iniciada en el servidor y se abre la sala directamente,
    // en vez del aviso "en un caso real se abriría la plataforma".
    if (clase.enlaceReunion) {
      window.open(clase.enlaceReunion, '_blank', 'noopener');
    } else {
      avisar.warn('La clase quedó iniciada, pero no tiene enlace de reunión configurado.');
    }
  };

  const finalizarClase = async (claseId: number | string) => {
    const clase = (clasesVivo as any[]).find(c => c.id === claseId);
    if (!clase) return;

    if (!(await confirmar({ titulo: 'Finalizar clase', mensaje: `¿Deseas finalizar la clase "${clase.titulo}"?`, textoConfirmar: 'Finalizar' }))) return;

    if (typeof claseId === 'string') {
      try {
        await liveClassesApi.finish(claseId, clase.grabacionUrl || undefined);
      } catch (err: any) {
        console.error('Error finalizando clase en el servidor:', err);
        avisar.error(`No se pudo finalizar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setClasesVivo((clasesVivo as any[]).map(c =>
      c.id === claseId
        ? { ...c, tipo: 'finalizada', grabacionDisponible: true }
        : c
    ) as any);
    avisar.ok('Clase finalizada. La grabación estará disponible en breve.');
  };

  const compartirEnlaceClase = (claseId: number) => {
    const clase = clasesVivo.find(c => c.id === claseId);
    if (!clase || !clase.enlaceReunion) return;

    const textoCompartir = `Clase en Vivo: ${clase.titulo}\nFecha: ${clase.fecha}\nHora: ${clase.horaInicio} - ${clase.horaFin}\nEnlace: ${clase.enlaceReunion}\nPlataforma: ${clase.plataforma}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(clase.enlaceReunion);
      avisar.ok(`Enlace copiado al portapapeles!\n\n${textoCompartir}`);
    } else {
      avisar.info(textoCompartir);
    }
  };

  const verParticipacionClase = (claseId: number) => {
    const clase = clasesVivo.find(c => c.id === claseId);
    if (!clase) return;

    if (clase.participantes && clase.participantes.length > 0) {
      const asistieron = clase.participantes.filter(p => p.asistio).length;
      const promedio = clase.participantes
        .filter(p => p.minutosConectado)
        .reduce((acc, p) => acc + (p.minutosConectado || 0), 0) / asistieron;

      avisar.info(`Participación en: ${clase.titulo}\n\nEstudiantes que asistieron: ${asistieron}/${clase.participantes.length}\nTiempo promedio conectado: ${Math.round(promedio)} minutos\n\nEn un caso real, se mostraría:\n- Lista detallada de participantes\n- Gráficos de asistencia\n- Estadísticas de participación`);
    } else {
      avisar.info(`La clase "${clase.titulo}" aún no tiene datos de participación.`);
    }
  };

  const eliminarClase = async (claseId: number | string) => {
    const clase = (clasesVivo as any[]).find(c => c.id === claseId);
    if (!clase) return;

    if (!(await confirmar({ titulo: 'Eliminar clase', mensaje: `¿Estás seguro de que deseas eliminar la clase "${clase.titulo}"?`, textoConfirmar: 'Eliminar', destructiva: true }))) return;

    if (typeof claseId === 'string') {
      try {
        await liveClassesApi.delete(claseId);
      } catch (err: any) {
        console.error('Error eliminando clase en el servidor:', err);
        avisar.error(`No se pudo eliminar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setClasesVivo((clasesVivo as any[]).filter(c => c.id !== claseId) as any);
    avisar.ok('Clase eliminada exitosamente.');
  };

  const editarClase = async (claseId: number | string, claseData: any) => {
    if (typeof claseId === 'string') {
      try {
        await liveClassesApi.update(claseId, {
          titulo: claseData.titulo,
          descripcion: claseData.descripcion,
          enlace: claseData.enlaceReunion,
          plataforma: claseData.plataforma,
          ...(claseData.fecha
            ? { fechaInicio: combinarFechaHora(claseData.fecha, claseData.horaInicio) }
            : {}),
          ...(claseData.fecha && claseData.horaFin
            ? { fechaFin: combinarFechaHora(claseData.fecha, claseData.horaFin) }
            : {}),
        });
      } catch (err: any) {
        console.error('Error actualizando clase en el servidor:', err);
        avisar.error(`No se pudo actualizar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setClasesVivo((clasesVivo as any[]).map(c =>
      c.id === claseId
        ? { ...c, ...claseData }
        : c
    ) as any);
    avisar.ok('Clase actualizada exitosamente!');
  };

  return {
    // State
    activeSection,
    sidebarOpen,
    cursos,
    estudiantes,
    tareas,
    examenes,
    bancoPreguntas,
    preguntasExamen,
    asistenciaEstudiantes,
    modulosCurso,
    mensajes,
    notificaciones,
    grupos,
    materiales,
    carpetas,
    clasesVivo,
    plantillas,
    anuncios,

    // Modals
    tareaEnRevision,
    abrirRevisionTarea,
    calificacionModal,
    crearTareaModal,
    crearExamenModal,
    estudianteDetalle,
    cursoDetalle,
    nuevoMensajeModal,
    conversacionActiva,
    modalMateriales,
    modalAsistencia,
    modalClase,
    notificacionesAbiertas,
    modalGrupos,
    modalBancoPreguntas,
    vistaPreviaExamen,
    modalModulo,
    modalTema,
    modalMaterialTema,
    moduloEditar,
    temaEditar,
    claseEditar,
    verParticipantes,
    verGrabaciones,
    modalClasePregrabada,
    modalRubrica,
    rubricaEditar,
    vistaCalendario,
    modalEvento,
    evaluacionConRubrica,
    modalMensajeMasivo,
    modalAnuncio,
    plantillaSeleccionada,
    modalConfigCurso,
    grupoSeleccionado,
    archivosAdjuntos,
    libroCalificaciones,
    editandoCalificacion,
    filtroNotificaciones,
    verTodasNotificaciones,

    // Setters
    setActiveSection,
    setSidebarOpen,
    setCursos,
    setEstudiantes,
    setTareas,
    setExamenes,
    setBancoPreguntas,
    setPreguntasExamen,
    setAsistenciaEstudiantes,
    setModulosCurso,
    setMensajes,
    setNotificaciones,
    setGrupos,
    setMateriales,
    setCarpetas,
    setClasesVivo,
    setPlantillas,
    setAnuncios,
    setTareaEnRevision,
    setCalificacionModal,
    setCrearTareaModal,
    setCrearExamenModal,
    setEstudianteDetalle,
    setCursoDetalle,
    setNuevoMensajeModal,
    setConversacionActiva,
    setModalMateriales,
    setModalAsistencia,
    setModalClase,
    setNotificacionesAbiertas,
    setModalGrupos,
    setModalBancoPreguntas,
    setVistaPreviaExamen,
    setModalModulo,
    setModalTema,
    setModalMaterialTema,
    setModuloEditar,
    setTemaEditar,
    setClaseEditar,
    setVerParticipantes,
    setVerGrabaciones,
    setModalClasePregrabada,
    setModalRubrica,
    setRubricaEditar,
    setVistaCalendario,
    setModalEvento,
    setEvaluacionConRubrica,
    setModalMensajeMasivo,
    setModalAnuncio,
    setPlantillaSeleccionada,
    setModalConfigCurso,
    setGrupoSeleccionado,
    setArchivosAdjuntos,
    setLibroCalificaciones,
    setEditandoCalificacion,
    setFiltroNotificaciones,
    setVerTodasNotificaciones,

    // Theme classes

    // Action Functions
    // Grupos
    verDetalleGrupo,
    enviarMensajeGrupo,
    crearGrupo,
    editarGrupo,
    eliminarGrupo,
    asignarEstudiantes,
    eliminarEstudianteGrupo: eliminarEstudianteDeGrupo,
    crearTareaGrupal,
    // Cursos
    // Estudiantes
    agregarEstudiante,
    editarEstudiante,
    eliminarEstudiante,
    enviarMensajeEstudiante,
    verPerfilEstudiante,
    exportarDatosEstudiante,
    // Tareas
    crearTarea,
    editarTarea,
    eliminarTarea,
    calificarTarea,
    calificarEntrega,
    // Exámenes
    crearExamen,
    editarExamen,
    eliminarExamen,
    publicarExamen,
    verResultadosExamen,
    obtenerExamenDetallado,
    // Calificaciones
    // Asistencia
    // Mensajes
    enviarMensaje,
    eliminarMensaje,
    marcarComoLeido,
    responderMensaje,
    enviarMensajeMasivo,
    crearAnuncio,
    guardarPlantilla,
    eliminarPlantilla,
    marcarMensajeLeido,
    archivarMensaje,
    enviarMensajeIndividual,
    // Notificaciones
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    // Materiales
    subirMaterial,
    eliminarMaterial,
    editarMaterial,
    crearCarpeta,
    eliminarCarpeta,
    editarCarpeta,
    agregarMaterialCarpeta,
    removerMaterialCarpeta,
    moverMaterial,
    organizarMateriales,
    // Calendario
    crearEvento,
    editarEvento,
    eliminarEvento,
    // Analíticas
    generarEstadisticas,
    // Configuración
    actualizarConfiguracion,
    cambiarContrasena,
    // Banco de Preguntas
    agregarPregunta,
    editarPregunta,
    eliminarPregunta,
    // Módulos
    crearModulo,
    editarModulo,
    eliminarModulo,
    crearTema,
    editarTema,
    eliminarTema,
    // Clases en Vivo
    programarClase,
    subirClasePregrabada,
    iniciarClaseEnVivo,
    finalizarClase,
    compartirEnlaceClase,
    verParticipacionClase,
    eliminarClase,
    editarClase
  };
};
