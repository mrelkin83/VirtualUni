import { useState, useEffect } from 'react';
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
import { useAuthStore } from '../store/authStore';
import { notificationsService } from '../services/notifications.service';
import { cursosDocente, estudiantesData, estudiantesDetalleData, tareasData, examenesData, examenesDetalladosData, bancoPreguntasData, modulosCursoData, mensajesData, gruposData, materialesData, carpetasMaterialesData, clasesVivoData } from '../data/teacherMockData';
import { SectionType, EstudianteDetalle, CarpetaMaterial, Question } from '../types/teacher.types';

export const useTeacherDashboard = () => {
  // Navigation & UI state
  const [activeSection, setActiveSection] = useState<SectionType>('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Data state
  const [cursos, setCursos] = useState(cursosDocente);
  const [estudiantes, setEstudiantes] = useState(estudiantesData);
  const [tareas, setTareas] = useState(tareasData);
  const [examenes, setExamenes] = useState(examenesData);
  const [bancoPreguntas, setBancoPreguntas] = useState(bancoPreguntasData);
  const [modulosCurso, setModulosCurso] = useState(modulosCursoData);
  const [mensajes, setMensajes] = useState(mensajesData);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [grupos, setGrupos] = useState(gruposData);
  const [materiales, setMateriales] = useState(materialesData);
  const [carpetas, setCarpetas] = useState(carpetasMaterialesData);
  const [clasesVivo, setClasesVivo] = useState(clasesVivoData);
  const [plantillas, setPlantillas] = useState<any[]>([
    {
      id: 1,
      nombre: 'Recordatorio de Tarea',
      categoria: 'recordatorio',
      contenido: 'Estimados estudiantes,\n\nLes recuerdo que tienen una tarea pendiente de entrega.\n\nSaludos cordiales',
      fechaCreacion: '2025-09-01'
    },
    {
      id: 2,
      nombre: 'Felicitación por Logro',
      categoria: 'felicitacion',
      contenido: '¡Felicidades por tu excelente desempeño!\n\nSigue así.',
      fechaCreacion: '2025-09-01'
    }
  ]);
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
  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-800' : 'bg-white';
  const text = darkMode ? 'text-gray-100' : 'text-gray-800';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

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
        ]);

        if (coursesData.status === 'fulfilled') {
          const data = (coursesData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) setCursos(data);
        }
        if (studentsData.status === 'fulfilled') {
          const data = (studentsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) setEstudiantes(data);
        }
        if (assignmentsData.status === 'fulfilled') {
          const data = (assignmentsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            // La API no expone `entregasTotales`; el conteo viene en
            // `_count.submissions`. Sin este mapeo la vista dividia por
            // undefined y pintaba `width: NaN%` en la barra de progreso.
            setTareas(
              data.map((t: any) => ({
                ...t,
                titulo: t.titulo ?? t.title,
                curso: t.curso ?? t.course?.name,
                entregasTotales: t._count?.submissions ?? t.entregasTotales,
              })) as any,
            );
          }
        }
        if (inboxMessages.status === 'fulfilled') {
          const data = inboxMessages.value as any;
          if (Array.isArray(data) && data.length > 0) setMensajes(data);
        }
        if (profileData.status === 'fulfilled') {
          const data = (profileData.value as any)?.data;
          if (data) {
            // Profile data available in state if needed; currently no dedicated teacher profile state
            console.log('Teacher profile loaded:', data);
          }
        }
        if (examsData.status === 'fulfilled') {
          const data = (examsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setExamenes(data.map(mapExamenApi) as any);
          }
        }
        if (materialsData.status === 'fulfilled') {
          const data = (materialsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setMateriales(data.map(mapMaterialApi) as any);
          }
        }
        if (foldersData.status === 'fulfilled') {
          const data = (foldersData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setCarpetas(data.map(mapCarpetaApi) as any);
          }
        }
        if (liveClassesData.status === 'fulfilled') {
          const data = (liveClassesData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setClasesVivo(data.map(mapClaseVivoApi) as any);
          }
        }
        if (groupsData.status === 'fulfilled') {
          const data = (groupsData.value as any)?.data;
          if (Array.isArray(data) && data.length > 0) {
            setGrupos(data.map(mapGrupoApi) as any);
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

    alert(`Detalle del Grupo:\n\nNombre: ${grupo.nombre}\nCódigo: ${grupo.codigo}\nCurso: ${grupo.curso}\nEstudiantes: ${grupo.estudiantesActivos}/${grupo.estudiantesTotales}\nProgreso: ${grupo.progreso}%\nHorario: ${grupo.horario}\nAula: ${grupo.aula}\nPróxima clase: ${grupo.proximaClase}`);
    setGrupoSeleccionado(grupo);
  };

  const enviarMensajeGrupo = (grupoId: number) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    const mensaje = prompt(`Enviar mensaje a todos los estudiantes del ${grupo.nombre}:\n\n(Escribe tu mensaje)`);
    if (mensaje && mensaje.trim()) {
      alert(`Mensaje enviado a ${grupo.estudiantesActivos} estudiantes del ${grupo.nombre}:\n\n"${mensaje}"`);
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
        alert(`Grupo "${grupoData.nombre}" creado exitosamente!`);
        return;
      } catch (err: any) {
        console.error('Error creando grupo en el servidor:', err);
        alert(
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
      color: grupoData.color || 'bg-blue-500',
      proximaClase: grupoData.proximaClase || 'Por programar',
      estudiantes: [],
      tareas: []
    };

    setGrupos([...grupos, nuevoGrupo] as any);
    alert(`Grupo "${grupoData.nombre}" creado exitosamente!`);
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
        alert(`No se pudo actualizar en el servidor: ${err?.message || 'error de conexión'}`);
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
    alert(`Grupo "${grupoData.nombre}" actualizado exitosamente!`);
  };

  const eliminarGrupo = async (grupoId: number | string) => {
    const grupo = (grupos as any[]).find(g => g.id === grupoId);
    if (!grupo) return;

    if (typeof grupoId === 'string') {
      try {
        await groupsApi.delete(grupoId);
      } catch (err: any) {
        console.error('Error eliminando grupo en el servidor:', err);
        alert(`No se pudo eliminar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setGrupos((grupos as any[]).filter(g => g.id !== grupoId) as any);
    alert(`Grupo "${grupo.nombre}" eliminado exitosamente.`);
  };

  const asignarEstudiantes = (grupoId: number, estudianteIds: number[]) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    const estudiantesAsignados = estudiantes.filter(e => estudianteIds.includes(e.id));

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

    alert(`${estudiantesAsignados.length} estudiante${estudiantesAsignados.length !== 1 ? 's' : ''} asignado${estudiantesAsignados.length !== 1 ? 's' : ''} al grupo "${grupo.nombre}" exitosamente!`);
  };

  const eliminarEstudianteDeGrupo = (grupoId: number, estudianteId: number) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;

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

    alert(`"${estudiante.nombre}" eliminado del grupo "${grupo.nombre}".`);
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

    setTareas([...tareas, nuevaTarea as any]);

    setGrupos(grupos.map(g =>
      g.id === grupoId
        ? {
            ...g,
            tareas: [...((g as any).tareas || []), nuevaTarea]
          }
        : g
    ));

    alert(`Tarea grupal "${tareaData.titulo}" creada exitosamente para el grupo "${grupo.nombre}"!\n\nSe notificará a ${grupo.estudiantesActivos} estudiante${grupo.estudiantesActivos !== 1 ? 's' : ''}.`);
  };

  const exportarDatosGrupo = (grupoId: number) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return;

    alert(`Exportando datos del ${grupo.nombre}...\n\nFormato: Excel\nIncluye: Lista de estudiantes, calificaciones, asistencia\n\nEn un caso real, se descargaría un archivo Excel.`);
  };

  // Cursos Actions
  const crearCurso = () => {
    const nombre = prompt('Nombre del curso:');
    if (!nombre?.trim()) return;

    const codigo = prompt('Código del curso:');
    if (!codigo?.trim()) return;

    const nuevoCurso = {
      id: cursos.length + 1,
      nombre,
      codigo,
      estudiantes: 0,
      tareasPendientesRevision: 0,
      progresoGeneral: 0,
      color: 'bg-blue-500'
    };

    setCursos([...cursos, nuevoCurso]);
    alert(`Curso "${nombre}" creado exitosamente!`);
  };

  const editarCurso = (cursoId: number) => {
    const curso = cursos.find(c => c.id === cursoId);
    if (!curso) return;

    const nuevoNombre = prompt('Nuevo nombre del curso:', curso.nombre);
    if (nuevoNombre && nuevoNombre.trim()) {
      setCursos(cursos.map(c =>
        c.id === cursoId ? { ...c, nombre: nuevoNombre } : c
      ));
      alert('Curso actualizado exitosamente!');
    }
  };

  const eliminarCurso = (cursoId: number) => {
    const curso = cursos.find(c => c.id === cursoId);
    if (!curso) return;

    if (window.confirm(`¿Estás seguro de que deseas eliminar el curso "${curso.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      setCursos(cursos.filter(c => c.id !== cursoId));
      alert('Curso eliminado exitosamente.');
    }
  };

  const archivarCurso = (cursoId: number) => {
    const curso = cursos.find(c => c.id === cursoId);
    if (!curso) return;

    if (window.confirm(`¿Deseas archivar el curso "${curso.nombre}"?`)) {
      alert('Curso archivado. Los datos se conservan pero el curso ya no aparecerá en la lista activa.');
    }
  };

  // Estudiantes Actions
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
    alert(`Estudiante "${nombre}" agregado exitosamente!`);
  };

  const editarEstudiante = (estudianteId: number) => {
    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;

    const nuevoEmail = prompt('Nuevo email:', estudiante.email);
    if (nuevoEmail && nuevoEmail.trim()) {
      setEstudiantes(estudiantes.map(e =>
        e.id === estudianteId ? { ...e, email: nuevoEmail } : e
      ));
      alert('Estudiante actualizado exitosamente!');
    }
  };

  const eliminarEstudiante = (estudianteId: number) => {
    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;

    if (window.confirm(`¿Estás seguro de que deseas eliminar a "${estudiante.nombre}"?`)) {
      setEstudiantes(estudiantes.filter(e => e.id !== estudianteId));
      alert('Estudiante eliminado exitosamente.');
    }
  };

  const enviarMensajeEstudiante = (estudianteId: number) => {
    const estudiante = estudiantes.find(e => e.id === estudianteId);
    if (!estudiante) return;

    const asunto = prompt(`Asunto del mensaje a ${estudiante.nombre}:`);
    if (!asunto?.trim()) return;

    const mensaje = prompt('Contenido del mensaje:');
    if (mensaje && mensaje.trim()) {
      const nuevoMensaje = {
        id: mensajes.length + 1,
        para: estudiante.nombre,
        asunto,
        mensaje,
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'enviado' as const
      };
      setMensajes([nuevoMensaje, ...mensajes]);
      alert(`Mensaje enviado a ${estudiante.nombre}!`);
    }
  };

  const verPerfilEstudiante = (estudianteId: number) => {
    const perfilDetallado = estudiantesDetalleData.find(e => e.id === estudianteId);
    if (perfilDetallado) {
      setEstudianteDetalle(perfilDetallado);
    } else {
      alert('No se encontró el perfil detallado del estudiante');
    }
  };

  const exportarDatosEstudiante = (estudianteId: number) => {
    const estudiante = estudiantesDetalleData.find(e => e.id === estudianteId);
    if (!estudiante) {
      alert('Estudiante no encontrado');
      return;
    }

    // Simular exportación de datos (en producción, esto generaría un archivo CSV/PDF)
    const datosExportacion = {
      informacionGeneral: {
        nombre: estudiante.nombre,
        email: estudiante.email,
        telefono: estudiante.telefono,
        fechaInscripcion: estudiante.fechaInscripcion,
      },
      rendimientoAcademico: {
        promedioGeneral: estudiante.promedioGeneral,
        progreso: estudiante.progreso,
        tareasEntregadas: estudiante.tareasEntregadas,
        tareasRevisadas: estudiante.tareasRevisadas,
        tareasPendientes: estudiante.tareasPendientes,
      },
      asistencia: estudiante.asistencia,
      historialCalificaciones: estudiante.historialCalificaciones,
      cursosInscritos: estudiante.cursosInscritos,
    };

    // En producción, aquí se generaría un archivo descargable
    console.log('Datos del estudiante exportados:', datosExportacion);
    alert(`Datos de ${estudiante.nombre} exportados exitosamente!\nRevisa la consola del navegador para ver los detalles.`);
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
      alert('Mensaje eliminado exitosamente');
    } catch (err: any) {
      alert('Error al eliminar mensaje: ' + (err.message || 'Error desconocido'));
    }
  };

  const responderMensaje = (mensajeId: number, respuesta: string) => {
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
      alert('Mensaje archivado exitosamente');
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
      alert(`Mensaje enviado a ${destinatario} exitosamente`);
    } catch (err: any) {
      alert('Error al enviar mensaje: ' + (err.message || 'Error desconocido'));
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
        alert(`Tarea "${tareaData.titulo}" creada exitosamente!`);
      } catch (err: any) {
        alert('Error al crear tarea: ' + (err.message || 'Error desconocido'));
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
      alert(`Tarea "${titulo}" creada exitosamente!`);
    } catch (err: any) {
      alert('Error al crear tarea: ' + (err.message || 'Error desconocido'));
    } finally {
      setCrearTareaModal(false);
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

      alert('¡Calificación guardada exitosamente!');
    } catch (err: any) {
      alert('Error al guardar calificación: ' + (err.message || 'Error desconocido'));
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
      alert('Tarea actualizada exitosamente!');
    }
  };

  const eliminarTarea = (tareaId: number) => {
    const tarea = tareas.find(t => t.id === tareaId);
    if (!tarea) return;

    if (window.confirm(`¿Estás seguro de que deseas eliminar la tarea "${tarea.titulo}"?`)) {
      setTareas(tareas.filter(t => t.id !== tareaId));
      alert('Tarea eliminada exitosamente.');
    }
  };

  const calificarTarea = (tareaId: number, estudianteId: number) => {
    const calificacion = prompt('Ingresa la calificación (0-10):');
    if (!calificacion) return;

    const nota = parseFloat(calificacion);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      alert('Calificación inválida. Debe estar entre 0 y 10.');
      return;
    }

    const comentarios = prompt('Comentarios (opcional):');
    alert(`Tarea calificada:\nNota: ${nota}\nComentarios: ${comentarios || 'Ninguno'}`);

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
    PRESENTACION: 'ppt',
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
      color: g.color || 'bg-purple-500',
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
        alert(`Examen "${examenData.titulo}" creado exitosamente!\n\nPreguntas: ${examenData.preguntas?.length || 0}`);
        setCrearExamenModal(false);
        return;
      } catch (err: any) {
        console.error('Error creando examen en el servidor:', err);
        alert(`No se pudo guardar en el servidor (${err?.message || 'error de conexión'}). Se guardará localmente.`);
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
    alert(`Examen "${examenData.titulo}" creado exitosamente!\n\nPreguntas: ${examenData.preguntas?.length || 0}\nPuntaje total: ${examenData.puntajeTotal || 0} puntos`);
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
        alert(`Examen "${examenData.titulo}" actualizado exitosamente!`);
        setCrearExamenModal(false);
        return;
      } catch (err: any) {
        console.error('Error actualizando examen en el servidor:', err);
        alert(`No se pudo actualizar en el servidor (${err?.message || 'error de conexión'}).`);
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
    alert(`Examen "${examenData.titulo}" actualizado exitosamente!`);
    setCrearExamenModal(false);
  };

  const verResultadosExamen = async (examenId: any) => {
    const examen: any = examenes.find((e: any) => e.id === examenId);
    if (!examen) return;

    if (typeof examenId === 'string') {
      try {
        const { data } = await examsApi.getResults(examenId);
        const stats = data?.stats || {};
        const lista = (data?.intentos || [])
          .map((i: any) => `- ${i.estudiante} (${i.studentCode || 's/c'}): ${i.calificacion ?? 'sin calificar'}`)
          .join('\n');
        alert(
          `Resultados del Examen: ${examen.titulo}\n\n` +
          `Presentados: ${stats.presentados ?? 0}\n` +
          `Promedio: ${stats.promedio ?? 0}\n` +
          `Aprobados: ${stats.aprobados ?? 0} | Reprobados: ${stats.reprobados ?? 0}\n\n` +
          (lista || 'Aún no hay intentos registrados.')
        );
        return;
      } catch (err: any) {
        console.error('Error consultando resultados:', err);
        alert(`No se pudieron consultar los resultados (${err?.message || 'error de conexión'}).`);
        return;
      }
    }

    alert(`Resultados del Examen: ${examen.titulo}\n\nEstudiantes que presentaron: ${examen.participantes}\n\nEn un caso real, se mostraría:\n- Lista de estudiantes con calificaciones\n- Promedio del grupo\n- Estadísticas por pregunta\n- Gráficos de distribución de notas`);
  };

  const eliminarExamen = async (examenId: any) => {
    const examen: any = examenes.find((e: any) => e.id === examenId);
    if (!examen) return;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar el examen "${examen.titulo}"?`)) return;

    if (typeof examenId === 'string') {
      try {
        await examsApi.delete(examenId);
      } catch (err: any) {
        console.error('Error eliminando examen en el servidor:', err);
        alert(`No se pudo eliminar en el servidor (${err?.message || 'error de conexión'}).`);
        return;
      }
    }
    setExamenes(examenes.filter((e: any) => e.id !== examenId));
    alert('Examen eliminado exitosamente.');
  };

  const publicarExamen = async (examenId: any) => {
    const examen: any = examenes.find((e: any) => e.id === examenId);
    if (!examen) return;

    if (!window.confirm(`¿Deseas publicar el examen "${examen.titulo}"?\n\nLos estudiantes podrán verlo y realizarlo.`)) return;

    if (typeof examenId === 'string') {
      try {
        await examsApi.publish(examenId);
      } catch (err: any) {
        console.error('Error publicando examen en el servidor:', err);
        alert(`No se pudo publicar en el servidor (${err?.message || 'error de conexión'}).`);
        return;
      }
    }
    setExamenes(examenes.map((e: any) =>
      e.id === examenId ? { ...e, estado: 'activo' as const } : e
    ) as any);
    alert('Examen publicado exitosamente!');
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
  const exportarCalificaciones = () => {
    alert('Exportando calificaciones...\n\nFormato: Excel\nIncluye: Todas las calificaciones de todos los cursos\n\nEn un caso real, se descargaría un archivo Excel.');
  };

  const importarCalificaciones = () => {
    alert('Función de importación:\n\nPermite cargar calificaciones desde un archivo Excel.\n\nEn un caso real, se abriría un diálogo para seleccionar el archivo.');
  };

  const generarReporteCalificaciones = () => {
    alert('Generando reporte de calificaciones...\n\nIncluye: Estadísticas, promedios, distribución de notas\n\nEn un caso real, se generaría un PDF.');
  };

  // Asistencia Actions
  const registrarAsistencia = (fecha: string) => {
    alert(`Registrando asistencia para la fecha: ${fecha}\n\nEn un caso real, se mostraría un modal con la lista de estudiantes para marcar presente/ausente.`);
    setModalAsistencia({ fecha, estudiantes: estudiantes });
  };

  const exportarAsistencia = () => {
    alert('Exportando reporte de asistencia...\n\nFormato: Excel\nIncluye: Asistencia de todos los estudiantes\n\nEn un caso real, se descargaría un archivo Excel.');
  };

  const generarReporteAsistencia = () => {
    alert('Generando reporte de asistencia...\n\nIncluye: Porcentajes, estadísticas, estudiantes con baja asistencia\n\nEn un caso real, se generaría un PDF.');
  };

  // Mensajes Actions
  const enviarMensaje = () => {
    setNuevoMensajeModal(true);
  };

  const marcarComoLeido = (mensajeId: number) => {
      setMensajes(mensajes.map(m =>
      m.id === mensajeId ? { ...m, leido: true } as any : m
    ));
  };

  // Comunicación masiva y anuncios
  const enviarMensajeMasivo = (mensajeData: any) => {
    const curso = cursos.find(c => c.id === parseInt(mensajeData.cursoId));
    if (!curso) {
      alert('Curso no encontrado');
      return;
    }

    const estudiantesCurso = estudiantes.filter(e => e.curso === curso.nombre);

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

    alert(`Mensaje masivo enviado exitosamente!\n\nDestinatarios: ${estudiantesCurso.length} estudiantes de ${curso.nombre}\nAsunto: ${mensajeData.asunto}${adjuntosTexto}`);
  };

  const crearAnuncio = (anuncioData: any) => {
    const curso = cursos.find(c => c.id === parseInt(anuncioData.cursoId));
    if (!curso) {
      alert('Curso no encontrado');
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

    alert(`${prioridadEmoji}Anuncio creado exitosamente!\n\nTítulo: ${anuncioData.titulo}\nCurso: ${curso.nombre}\nPrioridad: ${anuncioData.prioridad}${adjuntosTexto}\n\nSe notificará a ${nuevoAnuncio.totalEstudiantes} estudiantes.`);
  };

  const guardarPlantilla = (plantillaData: any) => {
    const nuevaPlantilla = {
      id: plantillas.length + 1,
      nombre: plantillaData.nombre,
      categoria: plantillaData.categoria,
      contenido: plantillaData.contenido,
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    setPlantillas([...plantillas, nuevaPlantilla]);
    alert(`Plantilla "${plantillaData.nombre}" guardada exitosamente!`);
  };

  const eliminarPlantilla = (plantillaId: number) => {
    const plantilla = plantillas.find(p => p.id === plantillaId);
    if (!plantilla) return;

    if (window.confirm(`¿Estás seguro de eliminar la plantilla "${plantilla.nombre}"?`)) {
      setPlantillas(plantillas.filter(p => p.id !== plantillaId));
      alert('Plantilla eliminada exitosamente.');
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
          alert('Debes seleccionar un archivo o indicar un enlace.');
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
        alert(`Material "${materialData.nombre}" subido exitosamente!`);
        return;
      } catch (err: any) {
        console.error('Error subiendo material al servidor:', err);
        alert(
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
    alert(`Material "${materialData.nombre}" subido exitosamente!`);
  };

  const eliminarMaterial = async (materialId: number | string) => {
    const material = (materiales as any[]).find(m => m.id === materialId);
    if (!material) return;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${material.nombre}"?`)) return;

    if (typeof materialId === 'string') {
      try {
        await materialsApi.delete(materialId);
      } catch (err: any) {
        console.error('Error eliminando material en el servidor:', err);
        alert(`No se pudo eliminar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setMateriales((materiales as any[]).filter(m => m.id !== materialId) as any);
    alert('Material eliminado exitosamente.');
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
        alert(`No se pudo actualizar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setMateriales((materiales as any[]).map(m =>
      m.id === materialId
        ? { ...m, ...materialData }
        : m
    ) as any);
    alert('Material actualizado exitosamente!');
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
        alert(`Carpeta "${carpetaData.nombre}" creada exitosamente!`);
        return;
      } catch (err: any) {
        console.error('Error creando carpeta en el servidor:', err);
        alert(
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
    alert(`Carpeta "${carpetaData.nombre}" creada exitosamente!`);
  };

  const eliminarCarpeta = async (carpetaId: number | string) => {
    const carpeta = (carpetas as any[]).find(c => c.id === carpetaId);
    if (!carpeta) return;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar la carpeta "${carpeta.nombre}"?`)) return;

    if (typeof carpetaId === 'string') {
      try {
        await materialsApi.deleteFolder(carpetaId);
      } catch (err: any) {
        console.error('Error eliminando carpeta en el servidor:', err);
        alert(`No se pudo eliminar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setCarpetas((carpetas as any[]).filter(c => c.id !== carpetaId) as any);
    alert('Carpeta eliminada exitosamente.');
  };

  const editarCarpeta = (carpetaId: number, carpetaData: Partial<CarpetaMaterial>) => {
    setCarpetas(carpetas.map(c =>
      c.id === carpetaId ? { ...c, ...carpetaData } : c
    ));
    alert('Carpeta actualizada exitosamente!');
  };

  const agregarMaterialCarpeta = (carpetaId: number, materialId: number) => {
    const carpeta = carpetas.find(c => c.id === carpetaId);

    if (carpeta?.materiales.includes(materialId)) {
      alert('Material ya está en la carpeta');
      return;
    }

    setCarpetas(carpetas.map(c =>
      c.id === carpetaId
        ? { ...c, materiales: [...c.materiales, materialId] }
        : c
    ));
    alert('Material agregado exitosamente!');
  };

  const removerMaterialCarpeta = (carpetaId: number, materialId: number) => {
    setCarpetas(carpetas.map(c =>
      c.id === carpetaId
        ? { ...c, materiales: c.materiales.filter(mId => mId !== materialId) }
        : c
    ));
    alert('Material removido exitosamente!');
  };

  const moverMaterial = (
    materialId: number,
    carpetaIdOrigen: number | null,
    carpetaIdDestino: number | null
  ) => {
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
      ));
    }

    alert('Material movido exitosamente!');
  };

  const organizarMateriales = () => {
    alert('Organizando materiales...\n\nPuedes crear carpetas, mover archivos, y reorganizar el contenido.');
    setModalMateriales(true);
  };

  // Calendario Actions
  const crearEvento = () => {
    const titulo = prompt('Título del evento:');
    if (!titulo?.trim()) return;

    const fecha = prompt('Fecha (YYYY-MM-DD):');
    if (!fecha?.trim()) return;

    const hora = prompt('Hora (HH:MM):');
    if (!hora?.trim()) return;

    alert(`Evento "${titulo}" creado para el ${fecha} a las ${hora}!`);
    setModalEvento(false);
  };

  const editarEvento = (eventoId: number) => {
    const nuevaFecha = prompt('Nueva fecha (YYYY-MM-DD):');
    if (nuevaFecha && nuevaFecha.trim()) {
      alert('Evento actualizado exitosamente!');
    }
  };

  const eliminarEvento = (eventoId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      alert('Evento eliminado exitosamente.');
    }
  };

  // Analíticas Actions
  const generarReporte = (tipo: string) => {
    alert(`Generando reporte de ${tipo}...\n\nIncluye: Gráficos, estadísticas, tendencias\n\nEn un caso real, se generaría un reporte detallado.`);
  };

  const exportarReporte = (tipo: string) => {
    alert(`Exportando reporte de ${tipo}...\n\nFormato: PDF\n\nEn un caso real, se descargaría un archivo PDF.`);
  };

  const generarEstadisticas = () => {
    alert('Generando estadísticas generales...\n\nIncluye: Rendimiento de estudiantes, progreso de cursos, tendencias');
  };

  // Configuración Actions
  const actualizarConfiguracion = () => {
    alert('Configuración actualizada exitosamente!');
  };

  const cambiarContrasena = () => {
    const nuevaContrasena = prompt('Nueva contraseña:');
    if (nuevaContrasena && nuevaContrasena.trim()) {
      const confirmarContrasena = prompt('Confirmar contraseña:');
      if (nuevaContrasena === confirmarContrasena) {
        alert('Contraseña actualizada exitosamente!');
      } else {
        alert('Las contraseñas no coinciden.');
      }
    }
  };

  const configurarNotificaciones = () => {
    alert('Configurando preferencias de notificaciones...\n\nPuedes elegir qué notificaciones recibir y cómo.');
  };

  // Notification Actions
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

    setBancoPreguntas([...bancoPreguntas, nuevaPregunta]);
    alert('Pregunta agregada al banco exitosamente!');
    setModalBancoPreguntas(false);
  };

  const editarPregunta = (preguntaId: number, preguntaData?: Partial<Question>) => {
    const preguntaExistente = bancoPreguntas.find(p => p.id === preguntaId);
    if (!preguntaExistente) return;

    // Si se proporciona preguntaData, usar eso (llamado desde modal)
    if (preguntaData) {
      setBancoPreguntas(bancoPreguntas.map(p =>
        p.id === preguntaId ? { ...p, ...preguntaData } : p
      ));
      alert('Pregunta actualizada exitosamente!');
      return;
    }

    // Modo legacy con prompt (para compatibilidad)
    const nuevaPregunta = prompt('Nuevo texto:', preguntaExistente.pregunta);
    if (nuevaPregunta && nuevaPregunta.trim()) {
      setBancoPreguntas(bancoPreguntas.map(p =>
        p.id === preguntaId ? { ...p, pregunta: nuevaPregunta } : p
      ));
      alert('Pregunta actualizada exitosamente!');
    }
  };

  const eliminarPregunta = (preguntaId: number, confirmar: boolean = true) => {
    // Si confirmar es false, eliminar directamente (llamado desde modal con confirmación previa)
    if (!confirmar) {
      setBancoPreguntas(bancoPreguntas.filter(p => p.id !== preguntaId));
      alert('Pregunta eliminada exitosamente.');
      return;
    }

    // Modo con confirmación (comportamiento por defecto)
    if (window.confirm('¿Estás seguro de que deseas eliminar esta pregunta del banco?')) {
      setBancoPreguntas(bancoPreguntas.filter(p => p.id !== preguntaId));
      alert('Pregunta eliminada exitosamente.');
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

    setModulosCurso([...modulosCurso, nuevoModulo]);
    alert(`Módulo "${moduloData.titulo}" creado exitosamente!`);
  };

  const editarModulo = (moduloId: number, moduloData: any) => {
    setModulosCurso(modulosCurso.map(m =>
      m.id === moduloId
        ? { ...m, titulo: moduloData.titulo, descripcion: moduloData.descripcion, orden: moduloData.orden }
        : m
    ));
    alert('Módulo actualizado exitosamente!');
  };

  const eliminarModulo = (moduloId: number) => {
    const modulo = modulosCurso.find(m => m.id === moduloId);
    if (!modulo) return;

    if (window.confirm(`¿Estás seguro de que deseas eliminar el módulo "${modulo.titulo}"?\n\nEsta acción eliminará también todos sus temas.`)) {
      setModulosCurso(modulosCurso.filter(m => m.id !== moduloId));
      alert('Módulo eliminado exitosamente.');
    }
  };

  const crearTema = (moduloId: number, temaData: any) => {
    const modulo = modulosCurso.find(m => m.id === moduloId);
    if (!modulo) {
      alert('Error: Módulo no encontrado');
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

    setModulosCurso(modulosCurso.map(m =>
      m.id === moduloId
        ? { ...m, temas: [...m.temas, nuevoTema as any] }
        : m
    ));

    alert(`Tema "${temaData.titulo}" creado exitosamente!`);
  };

  const editarTema = (temaId: number, temaData: any) => {
    setModulosCurso(modulosCurso.map(modulo => ({
      ...modulo,
      temas: modulo.temas.map(tema =>
        tema.id === temaId
          ? { ...tema, ...temaData }
          : tema
      )
    })));
    alert('Tema actualizado exitosamente!');
  };

  const eliminarTema = (temaId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este tema?')) {
      setModulosCurso(modulosCurso.map(modulo => ({
        ...modulo,
        temas: modulo.temas.filter(tema => tema.id !== temaId)
      })));
      alert('Tema eliminado exitosamente.');
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
        alert(`Clase "${claseData.titulo}" programada para ${claseData.fecha} a las ${claseData.horaInicio}!\n\nSe enviará notificación a los estudiantes.`);
        setModalClase(false);
        return;
      } catch (err: any) {
        console.error('Error programando clase en el servidor:', err);
        alert(
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
    alert(`Clase "${claseData.titulo}" programada para ${claseData.fecha} a las ${claseData.horaInicio}!\n\nSe enviará notificación a los estudiantes.`);
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

    setClasesVivo([...clasesVivo, nuevaClase as any]);
    alert(`Clase pregrabada "${claseData.titulo}" subida exitosamente!`);
  };

  const iniciarClaseEnVivo = async (claseId: number | string) => {
    const clase = (clasesVivo as any[]).find(c => c.id === claseId);
    if (!clase) return;

    if (typeof claseId === 'string') {
      try {
        await liveClassesApi.start(claseId);
      } catch (err: any) {
        console.error('Error iniciando clase en el servidor:', err);
        alert(`No se pudo iniciar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setClasesVivo((clasesVivo as any[]).map(c =>
      c.id === claseId ? { ...c, tipo: 'en_curso' } : c
    ) as any);

    alert(`Iniciando clase en vivo: ${clase.titulo}\n\nEnlace de reunión: ${clase.enlaceReunion}\n\nEn un caso real, se abriría la plataforma de videoconferencia.`);
  };

  const finalizarClase = async (claseId: number | string) => {
    const clase = (clasesVivo as any[]).find(c => c.id === claseId);
    if (!clase) return;

    if (!window.confirm(`¿Deseas finalizar la clase "${clase.titulo}"?`)) return;

    if (typeof claseId === 'string') {
      try {
        await liveClassesApi.finish(claseId, clase.grabacionUrl || undefined);
      } catch (err: any) {
        console.error('Error finalizando clase en el servidor:', err);
        alert(`No se pudo finalizar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setClasesVivo((clasesVivo as any[]).map(c =>
      c.id === claseId
        ? { ...c, tipo: 'finalizada', grabacionDisponible: true }
        : c
    ) as any);
    alert('Clase finalizada. La grabación estará disponible en breve.');
  };

  const compartirEnlaceClase = (claseId: number) => {
    const clase = clasesVivo.find(c => c.id === claseId);
    if (!clase || !clase.enlaceReunion) return;

    const textoCompartir = `Clase en Vivo: ${clase.titulo}\nFecha: ${clase.fecha}\nHora: ${clase.horaInicio} - ${clase.horaFin}\nEnlace: ${clase.enlaceReunion}\nPlataforma: ${clase.plataforma}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(clase.enlaceReunion);
      alert(`Enlace copiado al portapapeles!\n\n${textoCompartir}`);
    } else {
      alert(textoCompartir);
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

      alert(`Participación en: ${clase.titulo}\n\nEstudiantes que asistieron: ${asistieron}/${clase.participantes.length}\nTiempo promedio conectado: ${Math.round(promedio)} minutos\n\nEn un caso real, se mostraría:\n- Lista detallada de participantes\n- Gráficos de asistencia\n- Estadísticas de participación`);
    } else {
      alert(`La clase "${clase.titulo}" aún no tiene datos de participación.`);
    }
  };

  const eliminarClase = async (claseId: number | string) => {
    const clase = (clasesVivo as any[]).find(c => c.id === claseId);
    if (!clase) return;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar la clase "${clase.titulo}"?`)) return;

    if (typeof claseId === 'string') {
      try {
        await liveClassesApi.delete(claseId);
      } catch (err: any) {
        console.error('Error eliminando clase en el servidor:', err);
        alert(`No se pudo eliminar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setClasesVivo((clasesVivo as any[]).filter(c => c.id !== claseId) as any);
    alert('Clase eliminada exitosamente.');
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
        alert(`No se pudo actualizar en el servidor: ${err?.message || 'error de conexión'}`);
        return;
      }
    }

    setClasesVivo((clasesVivo as any[]).map(c =>
      c.id === claseId
        ? { ...c, ...claseData }
        : c
    ) as any);
    alert('Clase actualizada exitosamente!');
  };

  return {
    // State
    activeSection,
    sidebarOpen,
    darkMode,
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
    setDarkMode,
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
    bg,
    card,
    text,
    border,

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
    exportarDatosGrupo,
    // Cursos
    crearCurso,
    editarCurso,
    eliminarCurso,
    archivarCurso,
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
    exportarCalificaciones,
    importarCalificaciones,
    generarReporteCalificaciones,
    // Asistencia
    registrarAsistencia,
    exportarAsistencia,
    generarReporteAsistencia,
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
    generarReporte,
    exportarReporte,
    generarEstadisticas,
    // Configuración
    actualizarConfiguracion,
    cambiarContrasena,
    configurarNotificaciones,
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
