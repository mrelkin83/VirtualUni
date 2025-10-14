import React, { useState } from 'react';
import { Calendar, BookOpen, Video, FileText, Bell, Award, MessageSquare, TrendingUp, User, Menu, X, Play, CheckCircle, Moon, Sun, Users, BarChart3, Send, Eye, ClipboardCheck, Plus, Edit3, Mail, Upload, Download, Trash2, Copy, AlertCircle, FolderPlus, Clock, UserCheck, Activity, Settings } from 'lucide-react';

export default function PanelDocente() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [tareaEnRevision, setTareaEnRevision] = useState(null);
  const [calificacionModal, setCalificacionModal] = useState(null);
  const [crearTareaModal, setCrearTareaModal] = useState(false);
  const [crearExamenModal, setCrearExamenModal] = useState(false);
  const [estudianteDetalle, setEstudianteDetalle] = useState(null);
  const [cursoDetalle, setCursoDetalle] = useState(null);
  const [nuevoMensajeModal, setNuevoMensajeModal] = useState(false);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  
  const [modalMateriales, setModalMateriales] = useState(false);
  const [modalAsistencia, setModalAsistencia] = useState(null);
  const [modalClase, setModalClase] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [modalGrupos, setModalGrupos] = useState(false);
  const [preguntasExamen, setPreguntasExamen] = useState([]);
  const [bancoPreguntas, setBancoPreguntas] = useState([
    { 
      id: 1, 
      tipo: 'multiple', 
      pregunta: '¿Qué es un patrón de diseño?', 
      opciones: ['Una solución reutilizable', 'Un tipo de variable', 'Una función', 'Un algoritmo'], 
      respuestaCorrecta: 0,
      puntos: 2,
      categoria: 'Conceptos básicos'
    },
    { 
      id: 2, 
      tipo: 'verdadero-falso', 
      pregunta: 'El patrón Singleton permite crear múltiples instancias de una clase', 
      respuestaCorrecta: false,
      puntos: 1,
      categoria: 'Patrones creacionales'
    },
    { 
      id: 3, 
      tipo: 'multiple', 
      pregunta: '¿Cuál de los siguientes NO es un patrón creacional?', 
      opciones: ['Factory', 'Singleton', 'Observer', 'Builder'], 
      respuestaCorrecta: 2,
      puntos: 2,
      categoria: 'Patrones creacionales'
    }
  ]);
  const [vistaPreviaExamen, setVistaPreviaExamen] = useState(false);
  const [modalBancoPreguntas, setModalBancoPreguntas] = useState(false);
  const [asistenciaEstudiantes, setAsistenciaEstudiantes] = useState({});
  const [modalModulo, setModalModulo] = useState(false);
  const [modalTema, setModalTema] = useState(false);
  const [modalMaterialTema, setModalMaterialTema] = useState(null);
  const [moduloEditar, setModuloEditar] = useState(null);
  const [temaEditar, setTemaEditar] = useState(null);
  const [claseEditar, setClaseEditar] = useState(null);
  const [verParticipantes, setVerParticipantes] = useState(null);
  const [verGrabaciones, setVerGrabaciones] = useState(false);
  const [modalClasePregrabada, setModalClasePregrabada] = useState(false);
  const [filtroNotificaciones, setFiltroNotificaciones] = useState('todas');
  const [verTodasNotificaciones, setVerTodasNotificaciones] = useState(false);
  const [modalRubrica, setModalRubrica] = useState(false);
  const [rubricaEditar, setRubricaEditar] = useState(null);
  const [vistaCalendario, setVistaCalendario] = useState('mes');
  const [modalEvento, setModalEvento] = useState(false);
  const [evaluacionConRubrica, setEvaluacionConRubrica] = useState(null);
  const [modalMensajeMasivo, setModalMensajeMasivo] = useState(false);
  const [modalAnuncio, setModalAnuncio] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [modalConfigCurso, setModalConfigCurso] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);
  const [libroCalificaciones, setLibroCalificaciones] = useState(null);
  const [editandoCalificacion, setEditandoCalificacion] = useState(null);

  const [cursosDocente, setCursosDocente] = useState([
    { id: 1, nombre: 'Programación Avanzada', codigo: 'CS301', estudiantes: 45, tareasPendientesRevision: 12, progresoGeneral: 68, color: 'bg-blue-500' },
    { id: 2, nombre: 'Base de Datos', codigo: 'CS302', estudiantes: 38, tareasPendientesRevision: 5, progresoGeneral: 75, color: 'bg-green-500' },
    { id: 3, nombre: 'Inteligencia Artificial', codigo: 'CS401', estudiantes: 52, tareasPendientesRevision: 18, progresoGeneral: 55, color: 'bg-orange-500' },
    { id: 4, nombre: 'Diseño de Interfaces', codigo: 'CS303', estudiantes: 42, tareasPendientesRevision: 10, progresoGeneral: 72, color: 'bg-purple-500' }
  ]);

  const [estudiantes] = useState([
    { id: 1, nombre: 'Ana García', email: 'ana@univ.edu', curso: 'Programación Avanzada', progreso: 85, calificacionActual: 9.2, tareasPendientes: 1, ultimaActividad: 'Hace 2h' },
    { id: 2, nombre: 'Carlos López', email: 'carlos@univ.edu', curso: 'Programación Avanzada', progreso: 62, calificacionActual: 7.8, tareasPendientes: 3, ultimaActividad: 'Hace 1d' },
    { id: 3, nombre: 'María Rodríguez', email: 'maria@univ.edu', curso: 'Base de Datos', progreso: 78, calificacionActual: 8.5, tareasPendientes: 0, ultimaActividad: 'Hace 3h' },
    { id: 4, nombre: 'Juan Martínez', email: 'juan@univ.edu', curso: 'Inteligencia Artificial', progreso: 45, calificacionActual: 6.5, tareasPendientes: 5, ultimaActividad: 'Hace 2d' }
  ]);

  const [tareasDocente, setTareasDocente] = useState([
    { id: 1, titulo: 'Proyecto Final IA', curso: 'Inteligencia Artificial', fechaLimite: '2025-10-05', entregasTotales: 15, entregasRevisadas: 0 },
    { id: 2, titulo: 'Taller JavaScript', curso: 'Programación Avanzada', fechaLimite: '2025-10-03', entregasTotales: 28, entregasRevisadas: 16 },
    { id: 3, titulo: 'Consultas SQL', curso: 'Base de Datos', fechaLimite: '2025-10-04', entregasTotales: 35, entregasRevisadas: 30 }
  ]);

  const [examenes, setExamenes] = useState([
    { id: 1, titulo: 'Parcial 2', curso: 'Programación Avanzada', fecha: '2025-10-08', estudiantes: 45, estado: 'programado' },
    { id: 2, titulo: 'Quiz Redes', curso: 'Inteligencia Artificial', fecha: '2025-10-06', estudiantes: 52, estado: 'programado' },
    { id: 3, titulo: 'Parcial 1 BD', curso: 'Base de Datos', fecha: '2025-09-28', estudiantes: 38, estado: 'calificado', promedio: 8.3 }
  ]);

  const [mensajes, setMensajes] = useState([
    { id: 1, remitente: 'Ana García', asunto: 'Consulta sobre el Proyecto Final', preview: 'Profesor, tengo una duda sobre los requisitos del proyecto...', fecha: '2025-10-03 09:30', leido: false, avatar: 'AG', adjuntos: [{ nombre: 'proyecto_borrador.pdf', tamaño: '1.2 MB' }] },
    { id: 2, remitente: 'Carlos López', asunto: 'Solicitud de prórroga', preview: 'Buenos días profesor, le escribo para solicitar una extensión...', fecha: '2025-10-02 16:45', leido: false, avatar: 'CL', adjuntos: [] },
    { id: 3, remitente: 'María Rodríguez', asunto: 'Gracias por la retroalimentación', preview: 'Muchas gracias por sus comentarios...', fecha: '2025-10-02 14:20', leido: true, avatar: 'MR', adjuntos: [] }
  ]);

  const [notificaciones, setNotificaciones] = useState([
    { id: 1, titulo: 'Nueva entrega: Proyecto Final IA', tipo: 'tarea', fecha: '2025-10-04 10:30', leida: false, mensaje: 'Ana García ha entregado el Proyecto Final de IA', accion: 'tareas' },
    { id: 2, titulo: 'Clase programada: Hoy 14:00', tipo: 'clase', fecha: '2025-10-04 08:00', leida: false, mensaje: 'Recordatorio: Clase de Programación Avanzada a las 14:00', accion: 'clases' },
    { id: 3, titulo: 'Mensaje de Ana García', tipo: 'mensaje', fecha: '2025-10-03 09:30', leida: false, mensaje: 'Consulta sobre el Proyecto Final', accion: 'mensajes' },
    { id: 4, titulo: '5 entregas pendientes de revisar', tipo: 'urgente', fecha: '2025-10-03 07:00', leida: true, mensaje: 'Tienes tareas sin revisar desde hace 2 días', accion: 'tareas' },
    { id: 5, titulo: 'Nuevo estudiante inscrito', tipo: 'info', fecha: '2025-10-02 15:20', leida: true, mensaje: 'Pedro Ramírez se ha inscrito en Base de Datos', accion: 'estudiantes' },
    { id: 6, titulo: 'Examen programado para el 08/10', tipo: 'examen', fecha: '2025-10-02 11:00', leida: true, mensaje: 'Parcial 2 de Programación Avanzada', accion: 'examenes' }
  ]);

  const [materialesCurso, setMaterialesCurso] = useState([
    { id: 1, titulo: 'Introducción a Patrones', tipo: 'pdf', curso: 'Programación Avanzada', tamaño: '2.5 MB', fecha: '2025-09-28' },
    { id: 2, titulo: 'Video: Singleton Pattern', tipo: 'video', curso: 'Programación Avanzada', tamaño: '45 MB', fecha: '2025-09-28' },
    { id: 3, titulo: 'Ejercicios SQL', tipo: 'pdf', curso: 'Base de Datos', tamaño: '1.8 MB', fecha: '2025-09-30' }
  ]);

  const [registrosAsistencia] = useState([
    { id: 1, curso: 'Programación Avanzada', fecha: '2025-10-01', presentes: 42, ausentes: 3, justificados: 0 },
    { id: 2, curso: 'Base de Datos', fecha: '2025-10-02', presentes: 36, ausentes: 2, justificados: 0 }
  ]);

  const [clasesVirtuales, setClasesVirtuales] = useState([
    { 
      id: 1, 
      titulo: 'Patrones de Diseño - Singleton y Factory', 
      curso: 'Programación Avanzada', 
      fecha: '2025-10-04', 
      hora: '14:00',
      horaFin: '16:00',
      duracion: 120, 
      link: 'https://zoom.us/j/123456789',
      password: 'prog2024',
      estado: 'programada',
      descripcion: 'Revisión de patrones creacionales con ejemplos prácticos'
    },
    { 
      id: 2, 
      titulo: 'Redes Neuronales Profundas', 
      curso: 'Inteligencia Artificial', 
      fecha: '2025-10-04', 
      hora: '18:00',
      horaFin: '20:00',
      duracion: 120, 
      link: 'https://zoom.us/j/987654321',
      password: 'ia2024',
      estado: 'programada',
      descripcion: 'Introducción a deep learning y arquitecturas CNN'
    }
  ]);

  const [clasesRealizadas] = useState([
    {
      id: 4,
      titulo: 'Introducción a Patrones de Diseño',
      curso: 'Programación Avanzada',
      fecha: '2025-09-28',
      hora: '14:00',
      duracion: 120,
      participantes: [
        { nombre: 'Ana García', asistio: true, tiempoConexion: '118 min' },
        { nombre: 'Carlos López', asistio: true, tiempoConexion: '95 min' },
        { nombre: 'María Rodríguez', asistio: false, tiempoConexion: '0 min' },
        { nombre: 'Juan Martínez', asistio: true, tiempoConexion: '120 min' }
      ],
      grabacion: {
        disponible: true,
        url: '#',
        duracion: '1:58:32',
        tamaño: '450 MB',
        vistas: 42
      }
    },
    {
      id: 5,
      titulo: 'Normalización de Bases de Datos',
      curso: 'Base de Datos',
      fecha: '2025-09-30',
      hora: '16:00',
      duracion: 120,
      participantes: [
        { nombre: 'María Rodríguez', asistio: true, tiempoConexion: '115 min' },
        { nombre: 'Pedro Sánchez', asistio: true, tiempoConexion: '120 min' }
      ],
      grabacion: {
        disponible: true,
        url: '#',
        duracion: '2:05:18',
        tamaño: '520 MB',
        vistas: 35
      }
    }
  ]);

  const [grupos, setGrupos] = useState([
    { id: 1, nombre: 'Grupo 1', curso: 'Programación Avanzada', estudiantes: ['Ana García', 'Carlos López'], tareas: ['Proyecto Final'] },
    { id: 2, nombre: 'Grupo 2', curso: 'Programación Avanzada', estudiantes: ['María Rodríguez', 'Juan Martínez'], tareas: [] }
  ]);

  const [anuncios, setAnuncios] = useState([
    { id: 1, titulo: 'Cambio de horario Parcial 2', curso: 'Programación Avanzada', mensaje: 'El examen parcial se ha movido al 10 de octubre', fecha: '2025-10-02', importante: true },
    { id: 2, titulo: 'Material adicional disponible', curso: 'Base de Datos', mensaje: 'He subido material complementario en la sección de materiales', fecha: '2025-10-01', importante: false }
  ]);

  const [plantillasMensajes] = useState([
    { id: 1, nombre: 'Recordatorio de entrega', contenido: 'Estimado/a estudiante,\n\nLe recuerdo que la fecha límite para la entrega de [TAREA] es el [FECHA].\n\nSaludos cordiales,\nProf. García' },
    { id: 2, nombre: 'Felicitación por buen desempeño', contenido: 'Estimado/a [NOMBRE],\n\nFelicitaciones por su excelente desempeño en [ACTIVIDAD]. Siga así.\n\nSaludos,\nProf. García' },
    { id: 3, nombre: 'Invitación a asesoría', contenido: 'Estimado/a [NOMBRE],\n\nHe notado que podría beneficiarse de una asesoría personalizada. Mi horario de atención es [HORARIO].\n\nQuedo atento,\nProf. García' }
  ]);

  const [rubricas, setRubricas] = useState([
    { 
      id: 1, 
      nombre: 'Rúbrica Proyectos de Programación', 
      curso: 'Programación Avanzada',
      criterios: [
        { 
          id: 1, 
          nombre: 'Funcionalidad', 
          peso: 40,
          niveles: [
            { puntos: 10, descripcion: 'Excelente: Todas las funcionalidades implementadas correctamente' },
            { puntos: 8, descripcion: 'Bueno: Mayoría de funcionalidades correctas con errores menores' },
            { puntos: 6, descripcion: 'Regular: Funcionalidades básicas con varios errores' },
            { puntos: 4, descripcion: 'Deficiente: Muchas funcionalidades no implementadas o con errores graves' }
          ]
        },
        { 
          id: 2, 
          nombre: 'Código Limpio', 
          peso: 30,
          niveles: [
            { puntos: 10, descripcion: 'Excelente: Código bien estructurado, nombrado y comentado' },
            { puntos: 8, descripcion: 'Bueno: Código mayormente organizado' },
            { puntos: 6, descripcion: 'Regular: Código funcional pero desorganizado' },
            { puntos: 4, descripcion: 'Deficiente: Código difícil de leer y mantener' }
          ]
        }
      ]
    }
  ]);

  const [eventosCalendario] = useState([
    { id: 1, titulo: 'Clase Prog. Avanzada', tipo: 'clase', fecha: '2025-10-04', hora: '14:00', duracion: 120, curso: 'Programación Avanzada', color: 'bg-blue-500' },
    { id: 2, titulo: 'Clase IA', tipo: 'clase', fecha: '2025-10-04', hora: '18:00', duracion: 120, curso: 'Inteligencia Artificial', color: 'bg-orange-500' },
    { id: 3, titulo: 'Vence: Proyecto Final IA', tipo: 'tarea', fecha: '2025-10-05', hora: '23:59', curso: 'Inteligencia Artificial', color: 'bg-red-500' },
    { id: 5, titulo: 'Parcial 2 Prog. Avanzada', tipo: 'examen', fecha: '2025-10-08', hora: '14:00', duracion: 90, curso: 'Programación Avanzada', color: 'bg-purple-500' }
  ]);

  const [horarioSemanal] = useState([
    { dia: 'Lunes', bloques: [
      { hora: '14:00 - 16:00', curso: 'Programación Avanzada', tipo: 'clase', salon: 'Lab 301' },
      { hora: '18:00 - 20:00', curso: 'Inteligencia Artificial', tipo: 'clase', salon: 'Aula 405' }
    ]},
    { dia: 'Martes', bloques: [
      { hora: '10:00 - 12:00', curso: 'Diseño de Interfaces', tipo: 'clase', salon: 'Lab 205' },
      { hora: '16:00 - 18:00', curso: 'Oficina', tipo: 'asesoría', salon: 'Oficina 302' }
    ]},
    { dia: 'Miércoles', bloques: [
      { hora: '14:00 - 16:00', curso: 'Programación Avanzada', tipo: 'clase', salon: 'Lab 301' }
    ]},
    { dia: 'Jueves', bloques: [
      { hora: '10:00 - 12:00', curso: 'Diseño de Interfaces', tipo: 'clase', salon: 'Lab 205' }
    ]},
    { dia: 'Viernes', bloques: [
      { hora: '16:00 - 18:00', curso: 'Base de Datos', tipo: 'clase', salon: 'Aula 303' }
    ]}
  ]);

  const [modulosCurso, setModulosCurso] = useState([
    {
      id: 1,
      cursoId: 1,
      titulo: 'Semana 1: Introducción a Patrones de Diseño',
      descripcion: 'Conceptos fundamentales y tipos de patrones',
      orden: 1,
      temas: [
        {
          id: 1,
          titulo: 'Qué son los Patrones de Diseño',
          tipo: 'teoria',
          duracion: '45 min',
          completado: true,
          materiales: [
            { id: 1, nombre: 'Introducción - PDF', tipo: 'pdf', url: '#', tamaño: '2.5 MB' },
            { id: 2, nombre: 'Video Explicativo', tipo: 'video', url: '#', tamaño: '120 MB', duracion: '15:30' }
          ]
        }
      ]
    }
  ]);

  const menuItems = [
    { id: 'inicio', icon: TrendingUp, label: 'Dashboard' },
    { id: 'cursos', icon: BookOpen, label: 'Mis Cursos' },
    { id: 'estudiantes', icon: Users, label: 'Estudiantes' },
    { id: 'materiales', icon: FolderPlus, label: 'Materiales' },
    { id: 'tareas', icon: FileText, label: 'Tareas' },
    { id: 'examenes', icon: ClipboardCheck, label: 'Exámenes' },
    { id: 'calificaciones', icon: Award, label: 'Calificaciones' },
    { id: 'asistencia', icon: UserCheck, label: 'Asistencia' },
    { id: 'mensajes', icon: Mail, label: 'Mensajes', badge: mensajes.filter(m => !m.leido).length },
    { id: 'notificaciones', icon: Bell, label: 'Notificaciones', badge: notificaciones.filter(n => !n.leida).length },
    { id: 'clases', icon: Video, label: 'Clases' },
    { id: 'calendario', icon: Calendar, label: 'Calendario' },
    { id: 'rubricas', icon: ClipboardCheck, label: 'Rúbricas' },
    { id: 'grupos', icon: Users, label: 'Grupos' },
    { id: 'reportes', icon: BarChart3, label: 'Reportes' }
  ];

  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-800' : 'bg-white';
  const text = darkMode ? 'text-gray-100' : 'text-gray-800';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  // Funciones de utilidad
  const crearTarea = (datos) => {
    const nuevaTarea = {
      id: Date.now(),
      titulo: datos.titulo,
      curso: datos.curso,
      fechaLimite: datos.fechaLimite,
      entregasTotales: 0,
      entregasRevisadas: 0
    };
    setTareasDocente([...tareasDocente, nuevaTarea]);
    setCrearTareaModal(false);
  };

  const crearExamen = (datos) => {
    if (preguntasExamen.length === 0) {
      alert('Debes agregar al menos una pregunta al examen');
      return;
    }
    const nuevoExamen = {
      id: Date.now(),
      titulo: datos.titulo,
      curso: datos.curso,
      fecha: datos.fecha,
      duracion: parseInt(datos.duracion),
      intentos: parseInt(datos.intentos),
      estudiantes: cursosDocente.find(c => c.nombre === datos.curso)?.estudiantes || 0,
      estado: 'programado',
      preguntas: preguntasExamen,
      puntajeTotal: preguntasExamen.reduce((sum, p) => sum + (p.puntos || 0), 0)
    };
    setExamenes([...examenes, nuevoExamen]);
    setCrearExamenModal(false);
    setPreguntasExamen([]);
  };

  const agregarPreguntaExamen = (tipo) => {
    const nuevaPregunta = {
      id: Date.now(),
      tipo: tipo,
      pregunta: '',
      puntos: 1,
      opciones: tipo === 'multiple' ? ['', '', '', ''] : null,
      respuestaCorrecta: tipo === 'multiple' ? 0 : tipo === 'verdadero-falso' ? true : '',
      categoria: ''
    };
    setPreguntasExamen([...preguntasExamen, nuevaPregunta]);
  };

  const actualizarPregunta = (id, campo, valor) => {
    setPreguntasExamen(preguntasExamen.map(p => 
      p.id === id ? { ...p, [campo]: valor } : p
    ));
  };

  const actualizarOpcion = (preguntaId, opcionIndex, valor) => {
    setPreguntasExamen(preguntasExamen.map(p => {
      if (p.id === preguntaId) {
        const nuevasOpciones = [...p.opciones];
        nuevasOpciones[opcionIndex] = valor;
        return { ...p, opciones: nuevasOpciones };
      }
      return p;
    }));
  };

  const eliminarPreguntaExamen = (id) => {
    setPreguntasExamen(preguntasExamen.filter(p => p.id !== id));
  };

  const agregarDesdebanco = (pregunta) => {
    setPreguntasExamen([...preguntasExamen, { ...pregunta, id: Date.now() }]);
  };

  const guardarEnBanco = (pregunta) => {
    setBancoPreguntas([...bancoPreguntas, { ...pregunta, id: Date.now() }]);
    alert('Pregunta guardada en el banco de preguntas');
  };

  const eliminarMaterial = (id) => {
    setMaterialesCurso(materialesCurso.filter(m => m.id !== id));
  };

  const agregarMaterial = (datos) => {
    const nuevoMaterial = {
      id: Date.now(),
      titulo: datos.titulo,
      tipo: datos.tipo,
      curso: datos.curso,
      tamaño: '2.5 MB',
      fecha: new Date().toISOString().split('T')[0]
    };
    setMaterialesCurso([...materialesCurso, nuevoMaterial]);
    setModalMateriales(false);
  };

  const crearGrupo = (datos) => {
    const nuevoGrupo = {
      id: Date.now(),
      nombre: datos.nombre,
      curso: datos.curso,
      estudiantes: datos.estudiantes || [],
      tareas: []
    };
    setGrupos([...grupos, nuevoGrupo]);
    setModalGrupos(false);
  };

  const eliminarGrupo = (id) => {
    setGrupos(grupos.filter(g => g.id !== id));
  };

  const crearModulo = (datos) => {
    const nuevoModulo = {
      id: Date.now(),
      cursoId: cursoDetalle.id,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      orden: datos.orden,
      temas: []
    };
    setModulosCurso([...modulosCurso, nuevoModulo]);
    setModalModulo(false);
    setModuloEditar(null);
  };

  const actualizarModulo = (moduloId, datos) => {
    setModulosCurso(modulosCurso.map(m => 
      m.id === moduloId ? { ...m, ...datos } : m
    ));
    setModalModulo(false);
    setModuloEditar(null);
  };

  const eliminarModulo = (moduloId) => {
    if (window.confirm('¿Está seguro de eliminar este módulo?')) {
      setModulosCurso(modulosCurso.filter(m => m.id !== moduloId));
    }
  };

  const crearTemaEnModulo = (moduloId, datos) => {
    const nuevoTema = {
      id: Date.now(),
      titulo: datos.titulo,
      tipo: datos.tipo,
      duracion: datos.duracion,
      completado: false,
      materiales: []
    };
    
    setModulosCurso(modulosCurso.map(modulo => 
      modulo.id === moduloId 
        ? { ...modulo, temas: [...modulo.temas, nuevoTema] }
        : modulo
    ));
    setModalTema(false);
    setTemaEditar(null);
    setModuloEditar(null);
  };

  const eliminarTema = (moduloId, temaId) => {
    if (window.confirm('¿Está seguro de eliminar este tema?')) {
      setModulosCurso(modulosCurso.map(modulo => 
        modulo.id === moduloId 
          ? { ...modulo, temas: modulo.temas.filter(t => t.id !== temaId) }
          : modulo
      ));
    }
  };

  const programarClase = (datos) => {
    if (claseEditar) {
      setClasesVirtuales(clasesVirtuales.map(c => 
        c.id === claseEditar.id ? { ...c, ...datos } : c
      ));
    } else {
      const nuevaClase = {
        id: Date.now(),
        ...datos,
        estado: 'programada'
      };
      setClasesVirtuales([...clasesVirtuales, nuevaClase]);
    }
    setModalClase(false);
    setClaseEditar(null);
  };

  const eliminarClase = (id) => {
    if (window.confirm('¿Está seguro de cancelar esta clase?')) {
      setClasesVirtuales(clasesVirtuales.filter(c => c.id !== id));
    }
  };

  const crearRubrica = (datos) => {
    if (rubricaEditar) {
      setRubricas(rubricas.map(r => 
        r.id === rubricaEditar.id ? { ...r, ...datos } : r
      ));
    } else {
      const nuevaRubrica = {
        id: Date.now(),
        ...datos,
        criterios: []
      };
      setRubricas([...rubricas, nuevaRubrica]);
    }
    setModalRubrica(false);
    setRubricaEditar(null);
  };

  const eliminarRubrica = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta rúbrica?')) {
      setRubricas(rubricas.filter(r => r.id !== id));
    }
  };

  const publicarAnuncio = (datos) => {
    const nuevoAnuncio = {
      id: Date.now(),
      titulo: datos.titulo,
      curso: datos.curso,
      mensaje: datos.mensaje,
      fecha: new Date().toISOString().split('T')[0],
      importante: datos.importante,
      adjuntos: archivosAdjuntos.map(a => ({ nombre: a.name, tamaño: (a.size / 1024).toFixed(1) + ' KB' }))
    };
    setAnuncios([nuevoAnuncio, ...anuncios]);
    setModalAnuncio(false);
    setArchivosAdjuntos([]);
  };

  const enviarMensajeMasivo = (datos) => {
    alert(`Mensaje masivo enviado a: ${datos.destinatarios}\n\nAsunto: ${datos.asunto}\n\nCon ${archivosAdjuntos.length} archivo(s) adjunto(s)`);
    setModalMensajeMasivo(false);
    setArchivosAdjuntos([]);
  };

  const subirClasePregrabada = (datos) => {
    const nuevaClase = {
      id: Date.now(),
      titulo: datos.titulo,
      curso: datos.curso,
      descripcion: datos.descripcion,
      fecha: datos.fecha,
      duracion: datos.duracion,
      grabacion: {
        disponible: true,
        url: '#',
        duracion: datos.duracion + ':00',
        tamaño: datos.archivo ? (datos.archivo.size / (1024 * 1024)).toFixed(0) + ' MB' : '0 MB',
        vistas: 0
      },
      participantes: []
    };
    setClasesVirtuales([...clasesVirtuales, nuevaClase]);
    setModalClasePregrabada(false);
    alert('Clase pregrabada subida exitosamente');
  };

  const marcarMensajeLeido = (id) => {
    setMensajes(mensajes.map(m => 
      m.id === id ? { ...m, leido: true } : m
    ));
  };

  const enviarMensaje = (datos) => {
    const nuevoMensaje = {
      id: Date.now(),
      remitente: 'Tú',
      asunto: datos.asunto,
      preview: datos.mensaje.substring(0, 50) + '...',
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      leido: true,
      avatar: 'TU',
      adjuntos: archivosAdjuntos.map(a => ({ nombre: a.name, tamaño: (a.size / 1024).toFixed(1) + ' KB' }))
    };
    setMensajes([nuevoMensaje, ...mensajes]);
    setNuevoMensajeModal(false);
    setArchivosAdjuntos([]);
  };

  // Datos de ejemplo para el libro de calificaciones
  const generarCalificacionesEstudiantes = (cursoNombre) => {
    const estudiantesCurso = estudiantes.filter(e => e.curso === cursoNombre);
    return estudiantesCurso.map(est => ({
      ...est,
      tareas: [
        { nombre: 'Tarea 1', nota: 8.5, peso: 10 },
        { nombre: 'Tarea 2', nota: 9.0, peso: 10 },
        { nombre: 'Tarea 3', nota: 7.5, peso: 10 }
      ],
      examenes: [
        { nombre: 'Parcial 1', nota: 8.0, peso: 15 },
        { nombre: 'Parcial 2', nota: null, peso: 15 }
      ],
      participacion: 8.5,
      proyecto: null,
      promedioFinal: est.calificacionActual
    }));
  };

  // RENDER CURSOS
  const renderCursos = () => (
    <div className="space-y-6">
      {cursoDetalle ? (
        <>
          <button onClick={() => setCursoDetalle(null)} className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
            ← Volver a cursos
          </button>
          
          <div className={`${card} rounded-lg shadow p-6`}>
            <div className={`${cursoDetalle.color} -m-6 mb-4 p-6 rounded-t-lg text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{cursoDetalle.nombre}</h2>
                  <p>{cursoDetalle.codigo} • {cursoDetalle.estudiantes} estudiantes</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalConfigCurso(cursoDetalle);
                  }} 
                  className="bg-white text-blue-700 hover:bg-gray-100 px-4 py-2 rounded flex items-center gap-2 font-semibold shadow-lg transition-all hover:shadow-xl"
                >
                  <Settings size={18} />Configurar Curso
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-2xl font-bold text-blue-600">{cursoDetalle.progresoGeneral}%</p>
                <p className="text-sm">Progreso General</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-2xl font-bold text-green-600">{cursoDetalle.estudiantes}</p>
                <p className="text-sm">Estudiantes</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-2xl font-bold text-orange-600">{cursoDetalle.tareasPendientesRevision}</p>
                <p className="text-sm">Por Revisar</p>
              </div>
            </div>

            {/* GESTIÓN DE CONTENIDO DEL CURSO */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${text}`}>Contenido del Curso</h3>
                <button onClick={() => { setModalModulo(true); setModuloEditar(null); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                  <Plus size={18} />Nuevo Módulo
                </button>
              </div>

              <div className="space-y-4">
                {modulosCurso.filter(m => m.cursoId === cursoDetalle.id).map((modulo, idx) => (
                  <div key={modulo.id} className={`border ${border} rounded-lg overflow-hidden`}>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className={`font-bold ${text} mb-1`}>{modulo.titulo}</h4>
                          <p className="text-sm text-gray-500">{modulo.descripcion}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>{modulo.temas.length} temas</span>
                            <span>•</span>
                            <span>{modulo.temas.reduce((acc, t) => acc + t.materiales.length, 0)} materiales</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setModalTema(true); setTemaEditar(null); setModuloEditar(modulo); }} className="p-2 hover:bg-gray-200 rounded" title="Agregar tema">
                            <Plus size={18} />
                          </button>
                          <button onClick={() => { setModuloEditar(modulo); setModalModulo(true); }} className="p-2 hover:bg-gray-200 rounded" title="Editar módulo">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => eliminarModulo(modulo.id)} className="p-2 hover:bg-gray-200 rounded text-red-600" title="Eliminar módulo">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* TEMAS DEL MÓDULO */}
                    {modulo.temas.length > 0 && (
                      <div className="p-4 space-y-3">
                        {modulo.temas.map((tema, temaIdx) => (
                          <div key={tema.id} className={`border ${border} rounded-lg p-3`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${tema.tipo === 'teoria' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                {tema.tipo === 'teoria' ? <BookOpen size={16} /> : <ClipboardCheck size={16} />}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className={`font-semibold ${text}`}>{tema.titulo}</h5>
                                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                      <span>{tema.tipo === 'teoria' ? '📚 Teoría' : '💻 Práctica'}</span>
                                      <span>⏱️ {tema.duracion}</span>
                                      <span>{tema.materiales.length} material{tema.materiales.length !== 1 ? 'es' : ''}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button onClick={() => setModalMaterialTema(tema)} className="p-1 hover:bg-gray-100 rounded text-blue-600" title="Gestionar materiales">
                                      <Upload size={16} />
                                    </button>
                                    <button onClick={() => eliminarTema(modulo.id, tema.id)} className="p-1 hover:bg-gray-100 rounded text-red-600" title="Eliminar tema">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>

                                {/* MATERIALES DEL TEMA */}
                                {tema.materiales.length > 0 && (
                                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-2 mt-2 space-y-1`}>
                                    {tema.materiales.map(material => (
                                      <div key={material.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          {material.tipo === 'pdf' && <FileText className="text-red-600" size={14} />}
                                          {material.tipo === 'video' && <Video className="text-purple-600" size={14} />}
                                          {material.tipo === 'documento' && <FileText className="text-blue-600" size={14} />}
                                          <span>{material.nombre}</span>
                                          <span className="text-xs text-gray-400">({material.tamaño})</span>
                                        </div>
                                        <div className="flex gap-1">
                                          <button className="p-1 hover:bg-gray-200 rounded"><Eye size={14} /></button>
                                          <button className="p-1 hover:bg-gray-200 rounded"><Download size={14} /></button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MODAL: CONFIGURACIÓN DE CURSO */}
          {modalConfigCurso && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-auto`}>
                <div className="flex justify-between mb-6">
                  <div>
                    <h3 className={`text-2xl font-bold ${text}`}>Configuración del Curso</h3>
                    <p className="text-sm text-gray-500">{modalConfigCurso.nombre}</p>
                  </div>
                  <button onClick={() => setModalConfigCurso(null)}><X size={24} /></button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const updatedCursos = cursosDocente.map(c => 
                    c.id === modalConfigCurso.id 
                      ? { 
                          ...c, 
                          nombre: formData.get('nombre'),
                          codigo: formData.get('codigo')
                        }
                      : c
                  );
                  setCursosDocente(updatedCursos);
                  alert('Configuración guardada exitosamente');
                  setModalConfigCurso(null);
                }}>
                  <div className="space-y-6">
                    {/* INFORMACIÓN BÁSICA */}
                    <div>
                      <h4 className={`font-bold text-lg mb-4 ${text}`}>Información Básica</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Nombre del Curso</label>
                          <input 
                            type="text" 
                            name="nombre"
                            defaultValue={modalConfigCurso.nombre} 
                            required
                            className={`w-full p-2 border ${border} rounded`} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Código</label>
                          <input 
                            type="text" 
                            name="codigo"
                            defaultValue={modalConfigCurso.codigo} 
                            required
                            className={`w-full p-2 border ${border} rounded`} 
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-semibold mb-2">Descripción</label>
                        <textarea 
                          name="descripcion"
                          rows={3}
                          className={`w-full p-2 border ${border} rounded`} 
                          placeholder="Descripción breve del curso"
                        ></textarea>
                      </div>
                    </div>

                    {/* POLÍTICAS DE CALIFICACIÓN */}
                    <div className={`border-t ${border} pt-6`}>
                      <h4 className={`font-bold text-lg mb-4 ${text}`}>Políticas de Calificación</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Tareas:</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              name="peso_tareas"
                              min="0" 
                              max="100" 
                              defaultValue="40"
                              className={`flex-1 p-2 border ${border} rounded`} 
                            />
                            <span className="text-sm font-semibold">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Exámenes:</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              name="peso_examenes"
                              min="0" 
                              max="100" 
                              defaultValue="30"
                              className={`flex-1 p-2 border ${border} rounded`} 
                            />
                            <span className="text-sm font-semibold">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Participación:</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              name="peso_participacion"
                              min="0" 
                              max="100" 
                              defaultValue="20"
                              className={`flex-1 p-2 border ${border} rounded`} 
                            />
                            <span className="text-sm font-semibold">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Proyecto:</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              name="peso_proyecto"
                              min="0" 
                              max="100" 
                              defaultValue="10"
                              className={`flex-1 p-2 border ${border} rounded`} 
                            />
                            <span className="text-sm font-semibold">%</span>
                          </div>
                        </div>
                      </div>
                      <div className={`mt-3 p-3 ${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'} rounded flex items-center gap-2`}>
                        <AlertCircle size={16} className="text-blue-600" />
                        <p className="text-xs text-blue-600">Los porcentajes deben sumar 100%</p>
                      </div>
                    </div>

                    {/* OPCIONES AVANZADAS */}
                    <div className={`border-t ${border} pt-6`}>
                      <h4 className={`font-bold text-lg mb-4 ${text}`}>Opciones Avanzadas</h4>
                      <div className="space-y-3">
                        <label className={`flex items-start gap-3 p-3 border ${border} rounded hover:bg-gray-50 cursor-pointer`}>
                          <input type="checkbox" name="entregas_tardias" defaultChecked className="mt-1" />
                          <div>
                            <p className="font-semibold text-sm">Permitir entregas tardías con penalización</p>
                            <p className="text-xs text-gray-500">Los estudiantes pueden entregar tareas después de la fecha límite con deducción de puntos</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3 border ${border} rounded hover:bg-gray-50 cursor-pointer`}>
                          <input type="checkbox" name="foros" defaultChecked className="mt-1" />
                          <div>
                            <p className="font-semibold text-sm">Habilitar foros de discusión</p>
                            <p className="text-xs text-gray-500">Permite a los estudiantes participar en foros y debates del curso</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3 border ${border} rounded hover:bg-gray-50 cursor-pointer`}>
                          <input type="checkbox" name="notif_materiales" defaultChecked className="mt-1" />
                          <div>
                            <p className="font-semibold text-sm">Notificar a estudiantes sobre nuevos materiales</p>
                            <p className="text-xs text-gray-500">Envía notificaciones automáticas cuando se suben nuevos recursos</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3 border ${border} rounded hover:bg-gray-50 cursor-pointer`}>
                          <input type="checkbox" name="auto_inscripcion" className="mt-1" />
                          <div>
                            <p className="font-semibold text-sm">Permitir auto-inscripción</p>
                            <p className="text-xs text-gray-500">Los estudiantes pueden inscribirse al curso sin aprobación previa</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3 border ${border} rounded hover:bg-gray-50 cursor-pointer`}>
                          <input type="checkbox" name="codigo_acceso" className="mt-1" />
                          <div>
                            <p className="font-semibold text-sm">Requerir código de acceso</p>
                            <p className="text-xs text-gray-500">Los estudiantes necesitan un código para inscribirse en el curso</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3 border ${border} rounded hover:bg-gray-50 cursor-pointer`}>
                          <input type="checkbox" name="seguimiento_progreso" defaultChecked className="mt-1" />
                          <div>
                            <p className="font-semibold text-sm">Mostrar progreso a estudiantes</p>
                            <p className="text-xs text-gray-500">Los estudiantes pueden ver su progreso y calificaciones en tiempo real</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* CONFIGURACIÓN DE ENTREGAS */}
                    <div className={`border-t ${border} pt-6`}>
                      <h4 className={`font-bold text-lg mb-4 ${text}`}>Configuración de Entregas</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Penalización por día de retraso:</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              name="penalizacion_retraso"
                              min="0" 
                              max="100" 
                              defaultValue="10"
                              className={`flex-1 p-2 border ${border} rounded`} 
                            />
                            <span className="text-sm font-semibold">%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Días máximos de retraso:</label>
                          <input 
                            type="number" 
                            name="max_dias_retraso"
                            min="0" 
                            max="30" 
                            defaultValue="3"
                            className={`w-full p-2 border ${border} rounded`} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* COLOR DEL CURSO */}
                    <div className={`border-t ${border} pt-6`}>
                      <h4 className={`font-bold text-lg mb-4 ${text}`}>Apariencia</h4>
                      <label className="block text-sm font-semibold mb-2">Color del Curso</label>
                      <div className="flex gap-3">
                        {[
                          { color: 'bg-blue-500', name: 'Azul' },
                          { color: 'bg-green-500', name: 'Verde' },
                          { color: 'bg-orange-500', name: 'Naranja' },
                          { color: 'bg-purple-500', name: 'Morado' },
                          { color: 'bg-red-500', name: 'Rojo' },
                          { color: 'bg-pink-500', name: 'Rosa' },
                          { color: 'bg-indigo-500', name: 'Índigo' },
                          { color: 'bg-teal-500', name: 'Teal' }
                        ].map(item => (
                          <button 
                            key={item.color}
                            type="button"
                            className={`w-12 h-12 ${item.color} rounded-lg hover:ring-2 ring-offset-2 ring-gray-400 transition-all flex items-center justify-center group relative`}
                            title={item.name}
                          >
                            <span className="absolute -bottom-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="flex gap-3 pt-6 border-t">
                      <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                        Guardar Configuración
                      </button>
                      <button type="button" onClick={() => setModalConfigCurso(null)} className={`flex-1 border ${border} py-3 rounded-lg hover:bg-gray-50 font-semibold transition-colors`}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: CREAR/EDITAR MÓDULO */}
          {modalModulo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`}>
                <h3 className={`text-2xl font-bold mb-4 ${text}`}>
                  {moduloEditar ? 'Editar Módulo' : 'Nuevo Módulo'}
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const datos = {
                    titulo: formData.get('titulo'),
                    descripcion: formData.get('descripcion'),
                    orden: parseInt(formData.get('orden'))
                  };
                  if (moduloEditar) {
                    actualizarModulo(moduloEditar.id, datos);
                  } else {
                    crearModulo(datos);
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Título del Módulo</label>
                      <input 
                        type="text" 
                        name="titulo"
                        placeholder="Ej: Semana 1: Introducción a..." 
                        defaultValue={moduloEditar?.titulo}
                        required
                        className={`w-full p-2 border ${border} rounded`} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Descripción</label>
                      <textarea 
                        name="descripcion"
                        rows={3}
                        placeholder="Descripción breve del contenido del módulo"
                        defaultValue={moduloEditar?.descripcion}
                        className={`w-full p-2 border ${border} rounded`}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Orden</label>
                      <input 
                        type="number" 
                        name="orden"
                        min="1"
                        defaultValue={moduloEditar?.orden || modulosCurso.length + 1}
                        className={`w-full p-2 border ${border} rounded`} 
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        {moduloEditar ? 'Actualizar' : 'Crear'} Módulo
                      </button>
                      <button type="button" onClick={() => { setModalModulo(false); setModuloEditar(null); }} className={`flex-1 border ${border} py-2 rounded`}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: CREAR/EDITAR TEMA */}
          {modalTema && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`}>
                <h3 className={`text-2xl font-bold mb-4 ${text}`}>
                  {temaEditar ? 'Editar Tema' : 'Nuevo Tema'}
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const datos = {
                    titulo: formData.get('titulo'),
                    tipo: formData.get('tipo'),
                    duracion: formData.get('duracion')
                  };
                  crearTemaEnModulo(moduloEditar.id, datos);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Título del Tema</label>
                      <input 
                        type="text" 
                        name="titulo"
                        placeholder="Ej: Introducción a Patrones de Diseño"
                        defaultValue={temaEditar?.titulo}
                        required
                        className={`w-full p-2 border ${border} rounded`} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Tipo</label>
                        <select name="tipo" defaultValue={temaEditar?.tipo || 'teoria'} className={`w-full p-2 border ${border} rounded`}>
                          <option value="teoria">Teoría</option>
                          <option value="practica">Práctica</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Duración estimada</label>
                        <input 
                          type="text" 
                          name="duracion"
                          placeholder="Ej: 45 min"
                          defaultValue={temaEditar?.duracion}
                          className={`w-full p-2 border ${border} rounded`} 
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        {temaEditar ? 'Actualizar' : 'Crear'} Tema
                      </button>
                      <button type="button" onClick={() => { setModalTema(false); setTemaEditar(null); setModuloEditar(null); }} className={`flex-1 border ${border} py-2 rounded`}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: GESTIONAR MATERIALES DEL TEMA */}
          {modalMaterialTema && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-auto`}>
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className={`text-2xl font-bold ${text}`}>Materiales: {modalMaterialTema.titulo}</h3>
                    <p className="text-sm text-gray-500">{modalMaterialTema.materiales.length} material{modalMaterialTema.materiales.length !== 1 ? 'es' : ''}</p>
                  </div>
                  <button onClick={() => setModalMaterialTema(null)}><X size={24} /></button>
                </div>

                <div className="space-y-2 mb-4">
                  {modalMaterialTema.materiales.map(material => (
                    <div key={material.id} className={`border ${border} rounded p-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        {material.tipo === 'pdf' && <FileText className="text-red-600" size={20} />}
                        {material.tipo === 'video' && <Video className="text-purple-600" size={20} />}
                        {material.tipo === 'documento' && <FileText className="text-blue-600" size={20} />}
                        <div>
                          <p className={`font-semibold ${text}`}>{material.nombre}</p>
                          <p className="text-xs text-gray-500">{material.tamaño}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded"><Eye size={16} /></button>
                        <button className="p-2 hover:bg-gray-100 rounded"><Download size={16} /></button>
                        <button className="p-2 hover:bg-gray-100 rounded text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`border-t ${border} pt-4`}>
                  <h4 className="font-semibold mb-3">Agregar Nuevo Material</h4>
                  <div className="space-y-3">
                    <input type="text" placeholder="Nombre del material" className={`w-full p-2 border ${border} rounded`} />
                    <select className={`w-full p-2 border ${border} rounded`}>
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="documento">Documento</option>
                      <option value="enlace">Enlace externo</option>
                    </select>
                    <div className={`border-2 border-dashed ${border} rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50`}>
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-sm text-gray-500">Arrastra archivos o haz clic para seleccionar</p>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                      Agregar Material
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cursosDocente.map(curso => (
            <div key={curso.id} className={`${card} rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer`} onClick={() => setCursoDetalle(curso)}>
              <div className={`${curso.color} h-32 flex items-center justify-center`}>
                <BookOpen size={48} className="text-white" />
              </div>
              <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 ${text}`}>{curso.nombre}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{curso.codigo}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Estudiantes</p>
                    <p className={`text-xl font-bold ${text}`}>{curso.estudiantes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Por revisar</p>
                    <p className="text-xl font-bold text-orange-600">{curso.tareasPendientesRevision}</p>
                  </div>
                </div>
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mb-3`}>
                  <div className={`${curso.color} h-2 rounded-full`} style={{ width: `${curso.progresoGeneral}%` }}></div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Ver Curso</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // RENDER ESTUDIANTES
  const renderEstudiantes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Estudiantes</h2>
        <select className={`p-2 border ${border} rounded`}>
          <option>Todos los cursos</option>
          {cursosDocente.map(c => <option key={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {estudiantes.map(est => (
          <div key={est.id} className={`${card} rounded-lg shadow p-4`}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {est.nombre.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className={`font-bold ${text}`}>{est.nombre}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{est.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs h-fit ${est.calificacionActual >= 8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {est.calificacionActual}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Progreso</p>
                    <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mt-1`}>
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${est.progreso}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pendientes</p>
                    <p className={`text-lg font-bold ${text}`}>{est.tareasPendientes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Última actividad</p>
                    <p className="text-sm">{est.ultimaActividad}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEstudianteDetalle(est)} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">
                    Ver Perfil
                  </button>
                  <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 text-sm">
                    Contactar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {estudianteDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEstudianteDetalle(null)}>
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className={`text-2xl font-bold ${text}`}>{estudianteDetalle.nombre}</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{estudianteDetalle.email}</p>
              </div>
              <button onClick={() => setEstudianteDetalle(null)}><X size={24} /></button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-3xl font-bold text-blue-600">{estudianteDetalle.calificacionActual}</p>
                <p className="text-sm">Calificación</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-3xl font-bold text-green-600">{estudianteDetalle.progreso}%</p>
                <p className="text-sm">Progreso</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded text-center`}>
                <p className="text-3xl font-bold text-orange-600">{estudianteDetalle.tareasPendientes}</p>
                <p className="text-sm">Pendientes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBIR CLASE PREGRABADA */}
      {modalClasePregrabada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto`}>
            <h3 className={`text-2xl font-bold mb-4 ${text}`}>Subir Clase Pregrabada</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const archivo = e.target.archivo.files[0];
              subirClasePregrabada({
                titulo: formData.get('titulo'),
                curso: formData.get('curso'),
                descripcion: formData.get('descripcion'),
                fecha: formData.get('fecha'),
                duracion: formData.get('duracion'),
                archivo: archivo
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Título de la clase</label>
                  <input 
                    type="text" 
                    name="titulo"
                    placeholder="Ej: Introducción a Patrones de Diseño"
                    required
                    className={`w-full p-2 border ${border} rounded`} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Curso</label>
                  <select name="curso" required className={`w-full p-2 border ${border} rounded`}>
                    <option value="">Seleccionar curso...</option>
                    {cursosDocente.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Descripción</label>
                  <textarea 
                    name="descripcion"
                    rows={3}
                    placeholder="Breve descripción del contenido..."
                    className={`w-full p-2 border ${border} rounded`}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Fecha de grabación</label>
                    <input 
                      type="date" 
                      name="fecha"
                      required
                      className={`w-full p-2 border ${border} rounded`} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Duración (minutos)</label>
                    <input 
                      type="number" 
                      name="duracion"
                      placeholder="120"
                      required
                      className={`w-full p-2 border ${border} rounded`} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Archivo de video</label>
                  <div className={`border-2 border-dashed ${border} rounded-lg p-8 text-center`}>
                    <input 
                      type="file" 
                      name="archivo"
                      accept="video/*"
                      required
                      className="hidden" 
                      id="video-upload"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          document.getElementById('file-name').textContent = file.name;
                          document.getElementById('file-size').textContent = `(${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
                        }
                      }}
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-gray-400" size={48} />
                      <p className="text-gray-500 mb-1">Arrastra el video aquí o haz clic para seleccionar</p>
                      <p className="text-xs text-gray-400">Formatos soportados: MP4, AVI, MOV, WMV</p>
                      <p className="text-xs text-gray-400">Tamaño máximo: 2GB</p>
                      <div className="mt-3">
                        <span id="file-name" className="text-sm font-semibold text-blue-600"></span>
                        <span id="file-size" className="text-xs text-gray-500 ml-2"></span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded`}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Publicar inmediatamente</span>
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Notificar a estudiantes</span>
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" />
                    <span className="text-sm">Permitir descargas</span>
                  </label>
                </div>

                <div className={`${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'} p-4 rounded flex items-start gap-2`}>
                  <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Procesamiento de video</p>
                    <p className="text-xs text-blue-600 mt-1">El video será procesado después de subirlo. Esto puede tomar algunos minutos dependiendo del tamaño del archivo.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Subir Clase
                  </button>
                  <button type="button" onClick={() => setModalClasePregrabada(false)} className={`flex-1 border ${border} py-2 rounded`}>
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER TAREAS
  const renderTareas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Tareas</h2>
        <button onClick={() => setCrearTareaModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Crear Tarea
        </button>
      </div>

      <div className="space-y-3">
        {tareasDocente.map(tarea => (
          <div key={tarea.id} className={`${card} rounded-lg shadow p-4`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className={`font-bold ${text}`}>{tarea.titulo}</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tarea.curso} • Vence: {tarea.fechaLimite}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Revisadas: {tarea.entregasRevisadas}/{tarea.entregasTotales}</span>
                    <span>{Math.round((tarea.entregasRevisadas/tarea.entregasTotales)*100)}%</span>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(tarea.entregasRevisadas/tarea.entregasTotales)*100}%` }}></div>
                  </div>
                </div>
              </div>
              <button onClick={() => setTareaEnRevision(tarea)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4">
                Revisar
              </button>
            </div>
          </div>
        ))}
      </div>

      {crearTareaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`}>
            <h3 className={`text-2xl font-bold mb-4 ${text}`}>Crear Nueva Tarea</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              crearTarea({
                titulo: formData.get('titulo'),
                curso: formData.get('curso'),
                fechaLimite: formData.get('fechaLimite')
              });
            }}>
              <div className="space-y-4">
                <select name="curso" required className={`w-full p-2 border ${border} rounded`}>
                  <option value="">Seleccionar curso...</option>
                  {cursosDocente.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                </select>
                <input type="text" name="titulo" placeholder="Título" required className={`w-full p-2 border ${border} rounded`} />
                <textarea name="instrucciones" rows={6} placeholder="Instrucciones" className={`w-full p-2 border ${border} rounded`}></textarea>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" name="fechaLimite" required className={`p-2 border ${border} rounded`} />
                  <input type="number" name="puntos" placeholder="Puntos" className={`p-2 border ${border} rounded`} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Publicar</button>
                  <button type="button" onClick={() => setCrearTareaModal(false)} className={`flex-1 border ${border} py-2 rounded`}>Cancelar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {tareaEnRevision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-2xl font-bold ${text}`}>Revisar: {tareaEnRevision.titulo}</h3>
              <button onClick={() => setTareaEnRevision(null)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`border ${border} rounded-lg p-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-semibold ${text}`}>Estudiante {i}</p>
                      <p className="text-sm text-gray-500">Entregado hace 2 días</p>
                    </div>
                    <button onClick={() => setCalificacionModal({ tarea: tareaEnRevision, estudiante: i })} className="bg-green-600 text-white px-4 py-2 rounded">
                      Calificar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {calificacionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-xl font-bold mb-4 ${text}`}>Calificar Tarea</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const nuevasTareas = tareasDocente.map(t => 
                t.id === calificacionModal.tarea.id 
                  ? { ...t, entregasRevisadas: t.entregasRevisadas + 1 }
                  : t
              );
              setTareasDocente(nuevasTareas);
              setCalificacionModal(null);
              setTareaEnRevision(null);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm">Calificación (0-10)</label>
                  <input type="number" min="0" max="10" step="0.1" required className={`w-full p-2 border ${border} rounded`} />
                </div>
                <div>
                  <label className="block mb-2 text-sm">Retroalimentación</label>
                  <textarea rows={4} className={`w-full p-2 border ${border} rounded`}></textarea>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded">Guardar</button>
                  <button type="button" onClick={() => setCalificacionModal(null)} className={`flex-1 border ${border} py-2rounded`}>Cancelar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER EXAMENES
  const renderExamenes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Exámenes</h2>
        <button onClick={() => { setCrearExamenModal(true); setPreguntasExamen([]); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Crear Examen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examenes.map(ex => (
          <div key={ex.id} className={`${card} rounded-lg shadow p-6`}>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className={`font-bold text-lg ${text}`}>{ex.titulo}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ex.curso}</p>
                <p className="text-sm text-gray-500">Fecha: {ex.fecha}</p>
              </div>
              <span className={`px-3 py-1 rounded text-xs h-fit ${ex.estado === 'programado' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {ex.estado === 'programado' ? 'Programado' : 'Calificado'}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-sm">Estudiantes: {ex.estudiantes}</span>
              {ex.promedio && <span className="text-lg font-bold text-green-600">Promedio: {ex.promedio}</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">
                {ex.estado === 'programado' ? 'Editar' : 'Resultados'}
              </button>
              <button className={`border ${border} py-2 rounded text-sm`}>Detalles</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: CREAR EXAMEN */}
      {crearExamenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col`}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className={`text-2xl font-bold ${text}`}>Crear Examen</h3>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setVistaPreviaExamen(true)} 
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                >
                  <Eye size={16} />Vista Previa
                </button>
                <button onClick={() => { setCrearExamenModal(false); setPreguntasExamen([]); }}>
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                crearExamen({
                  titulo: formData.get('titulo'),
                  curso: formData.get('curso'),
                  fecha: formData.get('fecha'),
                  duracion: formData.get('duracion'),
                  intentos: formData.get('intentos')
                });
              }}>
                <div className="space-y-6">
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                    <h4 className="font-semibold mb-4">Información del Examen</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Título</label>
                        <input type="text" name="titulo" placeholder="Ej: Parcial 2" required className={`w-full p-2 border ${border} rounded`} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Curso</label>
                        <select name="curso" required className={`w-full p-2 border ${border} rounded`}>
                          <option value="">Seleccionar curso...</option>
                          {cursosDocente.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Fecha</label>
                        <input type="date" name="fecha" required className={`w-full p-2 border ${border} rounded`} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Duración (min)</label>
                        <input type="number" name="duracion" placeholder="90" required className={`w-full p-2 border ${border} rounded`} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Intentos permitidos</label>
                        <input type="number" name="intentos" placeholder="1" min="1" required className={`w-full p-2 border ${border} rounded`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">Preguntas del Examen ({preguntasExamen.length})</h4>
                        <p className="text-sm text-gray-500">
                          Puntaje total: {preguntasExamen.reduce((sum, p) => sum + (p.puntos || 0), 0)} puntos
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setModalBancoPreguntas(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                        >
                          <FolderPlus size={16} />Banco
                        </button>
                        <button 
                          type="button"
                          onClick={() => agregarPreguntaExamen('multiple')}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Plus size={16} />Agregar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {preguntasExamen.length === 0 ? (
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-12 rounded-lg text-center`}>
                          <ClipboardCheck size={48} className="mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500 mb-2">No hay preguntas agregadas</p>
                          <p className="text-sm text-gray-400">Haz clic en Agregar para comenzar</p>
                        </div>
                      ) : (
                        preguntasExamen.map((pregunta, idx) => (
                          <div key={pregunta.id} className={`border ${border} rounded-lg p-4`}>
                            <div className="flex justify-between mb-3">
                              <span className="font-bold">Pregunta {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => eliminarPreguntaExamen(pregunta.id)}
                                className="text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <textarea
                              value={pregunta.pregunta}
                              onChange={(e) => actualizarPregunta(pregunta.id, 'pregunta', e.target.value)}
                              placeholder="Escribe la pregunta..."
                              rows={2}
                              className={`w-full p-2 border ${border} rounded mb-2`}
                            />
                            <input
                              type="number"
                              value={pregunta.puntos}
                              onChange={(e) => actualizarPregunta(pregunta.id, 'puntos', parseInt(e.target.value))}
                              className="w-20 p-2 border rounded"
                              min="1"
                            />
                            <span className="text-sm ml-2">puntos</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold">
                      Publicar Examen
                    </button>
                    <button type="button" onClick={() => { setCrearExamenModal(false); setPreguntasExamen([]); }} className={`flex-1 border ${border} py-3 rounded font-semibold`}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BANCO DE PREGUNTAS */}
      {modalBancoPreguntas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className={`text-2xl font-bold ${text}`}>Banco de Preguntas</h3>
                <p className="text-sm text-gray-500">{bancoPreguntas.length} preguntas guardadas</p>
              </div>
              <button onClick={() => setModalBancoPreguntas(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-3">
                {bancoPreguntas.map((pregunta) => (
                  <div key={pregunta.id} className={`border ${border} rounded-lg p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold mb-2">{pregunta.pregunta}</p>
                        <span className="text-xs text-gray-500">{pregunta.puntos} pts</span>
                      </div>
                      <button
                        onClick={() => {
                          agregarDesdebanco(pregunta);
                          setModalBancoPreguntas(false);
                        }}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                ))}
                {bancoPreguntas.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>No hay preguntas en el banco</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VISTA PREVIA */}
      {vistaPreviaExamen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${card} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-2xl font-bold">Vista Previa del Examen</h3>
              <button onClick={() => setVistaPreviaExamen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {preguntasExamen.map((pregunta, idx) => (
                  <div key={pregunta.id} className="border-b pb-4">
                    <div className="flex items-start gap-3">
                      <span className="font-bold">{idx + 1}.</span>
                      <div>
                        <p className="font-semibold">{pregunta.pregunta}</p>
                        <span className="text-xs text-gray-500">({pregunta.puntos} pts)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER CALIFICACIONES
  const renderCalificaciones = () => {
    return (
      <div className="space-y-6">
        <h2 className={`text-2xl font-bold ${text}`}>Calificaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cursosDocente.map(curso => (
            <div key={curso.id} className={`${card} rounded-lg shadow p-6`}>
              <h3 className={`font-bold text-lg mb-4 ${text}`}>{curso.nombre}</h3>
              <div className="space-y-3">
                <div className={`flex justify-between py-2 border-b ${border}`}>
                  <span>Promedio</span>
                  <span className="font-bold text-green-600 text-xl">8.2</span>
                </div>
                <div className={`flex justify-between py-2 border-b ${border}`}>
                  <span>Aprobados</span>
                  <span className="font-bold text-blue-600">38/{curso.estudiantes}</span>
                </div>
                <div className={`flex justify-between py-2`}>
                  <span>En riesgo</span>
                  <span className="font-bold text-red-600">5</span>
                </div>
                <button 
                  onClick={() => setLibroCalificaciones({
                    curso: curso,
                    estudiantes: generarCalificacionesEstudiantes(curso.nombre)
                  })}
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Ver Libro de Calificaciones
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL: LIBRO DE CALIFICACIONES */}
        {libroCalificaciones && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${card} rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col`}>
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-start">
                <div>
                  <h3 className={`text-2xl font-bold ${text}`}>Libro de Calificaciones</h3>
                  <p className="text-sm text-gray-500">{libroCalificaciones.curso.nombre} - {libroCalificaciones.curso.codigo}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => alert('Exportando a Excel...')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download size={16} />Excel
                  </button>
                  <button 
                    onClick={() => alert('Exportando a PDF...')}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                  >
                    <Download size={16} />PDF
                  </button>
                  <button onClick={() => setLibroCalificaciones(null)}>
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b grid grid-cols-5 gap-4`}>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Estudiantes</p>
                  <p className={`text-xl font-bold ${text}`}>{libroCalificaciones.estudiantes.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Promedio General</p>
                  <p className="text-xl font-bold text-green-600">8.2</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Aprobados</p>
                  <p className="text-xl font-bold text-blue-600">{libroCalificaciones.estudiantes.filter(e => e.promedioFinal >= 7).length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Reprobados</p>
                  <p className="text-xl font-bold text-red-600">{libroCalificaciones.estudiantes.filter(e => e.promedioFinal < 7).length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">En riesgo</p>
                  <p className="text-xl font-bold text-orange-600">{libroCalificaciones.estudiantes.filter(e => e.promedioFinal < 7.5 && e.promedioFinal >= 6).length}</p>
                </div>
              </div>

              {/* Tabla de calificaciones */}
              <div className="flex-1 overflow-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} sticky top-0`}>
                      <tr>
                        <th className="p-3 text-left font-semibold border-b-2 border-gray-300 min-w-[200px]">Estudiante</th>
                        <th className="p-3 text-center font-semibold border-b-2 border-gray-300" colSpan={3}>Tareas (30%)</th>
                        <th className="p-3 text-center font-semibold border-b-2 border-gray-300" colSpan={2}>Exámenes (30%)</th>
                        <th className="p-3 text-center font-semibold border-b-2 border-gray-300">Part. (20%)</th>
                        <th className="p-3 text-center font-semibold border-b-2 border-gray-300">Proy. (20%)</th>
                        <th className="p-3 text-center font-semibold border-b-2 border-gray-300 bg-blue-100 min-w-[100px]">Final</th>
                      </tr>
                      <tr className={`${darkMode ? 'bg-gray-600' : 'bg-gray-50'} text-xs`}>
                        <th className="p-2 text-left border-b"></th>
                        <th className="p-2 text-center border-b">T1 (10%)</th>
                        <th className="p-2 text-center border-b">T2 (10%)</th>
                        <th className="p-2 text-center border-b">T3 (10%)</th>
                        <th className="p-2 text-center border-b">P1 (15%)</th>
                        <th className="p-2 text-center border-b">P2 (15%)</th>
                        <th className="p-2 text-center border-b">20%</th>
                        <th className="p-2 text-center border-b">20%</th>
                        <th className="p-2 text-center border-b bg-blue-100">100%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {libroCalificaciones.estudiantes.map((estudiante, idx) => (
                        <tr key={estudiante.id} className={`${idx % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')} hover:bg-blue-50 transition`}>
                          <td className="p-3 border-b">
                            <div>
                              <p className={`font-semibold ${text}`}>{estudiante.nombre}</p>
                              <p className="text-xs text-gray-500">{estudiante.email}</p>
                            </div>
                          </td>
                          {/* Tareas */}
                          {estudiante.tareas.map((tarea, tIdx) => (
                            <td key={tIdx} className="p-3 border-b text-center">
                              {editandoCalificacion?.estudianteId === estudiante.id && editandoCalificacion?.campo === `tarea-${tIdx}` ? (
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="10" 
                                  step="0.1"
                                  defaultValue={tarea.nota}
                                  onBlur={() => setEditandoCalificacion(null)}
                                  autoFocus
                                  className="w-16 p-1 border rounded text-center"
                                />
                              ) : (
                                <button 
                                  onClick={() => setEditandoCalificacion({ estudianteId: estudiante.id, campo: `tarea-${tIdx}` })}
                                  className={`px-2 py-1 rounded hover:bg-gray-200 ${
                                    tarea.nota >= 8 ? 'text-green-600 font-semibold' : 
                                    tarea.nota >= 7 ? 'text-blue-600' : 
                                    'text-red-600'
                                  }`}
                                >
                                  {tarea.nota.toFixed(1)}
                                </button>
                              )}
                            </td>
                          ))}
                          {/* Exámenes */}
                          {estudiante.examenes.map((examen, eIdx) => (
                            <td key={eIdx} className="p-3 border-b text-center">
                              {examen.nota !== null ? (
                                editandoCalificacion?.estudianteId === estudiante.id && editandoCalificacion?.campo === `examen-${eIdx}` ? (
                                  <input 
                                    type="number" 
                                    min="0" 
                                    max="10" 
                                    step="0.1"
                                    defaultValue={examen.nota}
                                    onBlur={() => setEditandoCalificacion(null)}
                                    autoFocus
                                    className="w-16 p-1 border rounded text-center"
                                  />
                                ) : (
                                  <button 
                                    onClick={() => setEditandoCalificacion({ estudianteId: estudiante.id, campo: `examen-${eIdx}` })}
                                    className={`px-2 py-1 rounded hover:bg-gray-200 ${
                                      examen.nota >= 8 ? 'text-green-600 font-semibold' : 
                                      examen.nota >= 7 ? 'text-blue-600' : 
                                      'text-red-600'
                                    }`}
                                  >
                                    {examen.nota.toFixed(1)}
                                  </button>
                                )
                              ) : (
                                <span className="text-gray-400 text-sm">Pendiente</span>
                              )}
                            </td>
                          ))}
                          {/* Participación */}
                          <td className="p-3 border-b text-center">
                            <button 
                              onClick={() => setEditandoCalificacion({ estudianteId: estudiante.id, campo: 'participacion' })}
                              className="px-2 py-1 rounded hover:bg-gray-200 text-blue-600"
                            >
                              {estudiante.participacion.toFixed(1)}
                            </button>
                          </td>
                          {/* Proyecto */}
                          <td className="p-3 border-b text-center">
                            {estudiante.proyecto !== null ? (
                              <span className="text-green-600 font-semibold">{estudiante.proyecto.toFixed(1)}</span>
                            ) : (
                              <span className="text-gray-400 text-sm">Pendiente</span>
                            )}
                          </td>
                          {/* Promedio Final */}
                          <td className={`p-3 border-b text-center bg-blue-50 font-bold ${
                            estudiante.promedioFinal >= 9 ? 'text-green-600' :
                            estudiante.promedioFinal >= 7.5 ? 'text-blue-600' :
                            estudiante.promedioFinal >= 7 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {estudiante.promedioFinal.toFixed(1)}
                            {estudiante.promedioFinal >= 7 ? ' ✓' : ' ✗'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} font-semibold`}>
                      <tr>
                        <td className="p-3 border-t-2">PROMEDIOS</td>
                        <td className="p-3 border-t-2 text-center">8.3</td>
                        <td className="p-3 border-t-2 text-center">8.5</td>
                        <td className="p-3 border-t-2 text-center">7.8</td>
                        <td className="p-3 border-t-2 text-center">8.0</td>
                        <td className="p-3 border-t-2 text-center">-</td>
                        <td className="p-3 border-t-2 text-center">8.5</td>
                        <td className="p-3 border-t-2 text-center">-</td>
                        <td className="p-3 border-t-2 text-center bg-blue-100 text-blue-700">8.2</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Footer con leyenda */}
              <div className={`p-4 border-t ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Excelente (≥9.0)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>Bueno (7.5-8.9)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Aceptable (7.0-7.4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Reprobado (&lt;7.0)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    💡 Haz clic en cualquier calificación para editarla
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // RENDER MENSAJES
  const renderMensajes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Mensajes</h2>
        <div className="flex gap-2">
          <button onClick={() => setModalAnuncio(true)} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2">
            <Bell size={18} />Anuncio
          </button>
          <button onClick={() => setModalMensajeMasivo(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
            <Users size={18} />Mensaje Masivo
          </button>
          <button onClick={() => setNuevoMensajeModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
            <Send size={18} />Nuevo
          </button>
        </div>
      </div>

      {/* ANUNCIOS DEL CURSO */}
      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className="text-lg font-semibold mb-4">Anuncios Recientes</h3>
        <div className="space-y-3">
          {anuncios.map(anuncio => (
            <div key={anuncio.id} className={`border-l-4 ${anuncio.importante ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'} p-4 rounded`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold">{anuncio.titulo}</h4>
                  <p className="text-sm text-gray-600">{anuncio.curso} • {anuncio.fecha}</p>
                </div>
                {anuncio.importante && (
                  <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Importante</span>
                )}
              </div>
              <p className="text-sm">{anuncio.mensaje}</p>
              {anuncio.adjuntos && anuncio.adjuntos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-xs font-semibold mb-2">Archivos adjuntos:</p>
                  <div className="space-y-1">
                    {anuncio.adjuntos.map((archivo, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <FileText size={14} className="text-blue-600" />
                        <span>{archivo.nombre}</span>
                        <span className="text-gray-500">({archivo.tamaño})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 ${card} rounded-lg shadow p-4`}>
          <div className="space-y-2">
            {mensajes.map(mensaje => (
              <div key={mensaje.id} className={`p-3 rounded-lg cursor-pointer ${conversacionActiva?.id === mensaje.id ? 'bg-blue-100' : !mensaje.leido ? 'bg-blue-50' : ''} border ${border}`} onClick={() => {
                setConversacionActiva(mensaje);
                marcarMensajeLeido(mensaje.id);
              }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {mensaje.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${!mensaje.leido ? 'font-bold' : ''}`}>{mensaje.remitente}</p>
                    <p className="text-sm truncate">{mensaje.asunto}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 ${card} rounded-lg shadow p-6`}>
          {conversacionActiva ? (
            <div>
              <h3 className={`text-xl font-bold ${text} mb-2`}>{conversacionActiva.remitente}</h3>
              <h4 className={`font-semibold ${text} mb-4`}>{conversacionActiva.asunto}</h4>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-4`}>
                <p>{conversacionActiva.preview}</p>
                
                {conversacionActiva.adjuntos && conversacionActiva.adjuntos.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold mb-2">Archivos adjuntos:</p>
                    <div className="space-y-2">
                      {conversacionActiva.adjuntos.map((archivo, idx) => (
                        <div key={idx} className={`flex items-center gap-2 p-2 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded border ${border}`}>
                          <FileText className="text-blue-600" size={20} />
                          <span className="flex-1 text-sm">{archivo.nombre}</span>
                          <span className="text-xs text-gray-500">{archivo.tamaño}</span>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Download size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Usar plantilla:</label>
                <select 
                  value={plantillaSeleccionada} 
                  onChange={(e) => {
                    setPlantillaSeleccionada(e.target.value);
                    const plantilla = plantillasMensajes.find(p => p.id === parseInt(e.target.value));
                    if (plantilla) {
                      document.getElementById('respuesta-mensaje').value = plantilla.contenido;
                    }
                  }}
                  className={`w-full p-2 border ${border} rounded`}
                >
                  <option value="">Seleccionar plantilla...</option>
                  {plantillasMensajes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <textarea id="respuesta-mensaje" rows={4} placeholder="Escribe tu respuesta..." className={`w-full p-3 border ${border} rounded`}></textarea>
              
              <div className="mt-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                  <Upload size={16} />
                  <span className="text-sm">Adjuntar archivos</span>
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setArchivosAdjuntos([...archivosAdjuntos, ...files]);
                    }}
                  />
                </label>
                
                {archivosAdjuntos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {archivosAdjuntos.map((archivo, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-600" />
                          <span className="text-sm">{archivo.name}</span>
                          <span className="text-xs text-gray-500">({(archivo.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button 
                          onClick={() => setArchivosAdjuntos(archivosAdjuntos.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                <Send size={16} />Enviar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Selecciona un mensaje</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALES DE MENSAJERÍA */}
      {modalAnuncio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-2xl font-bold ${text}`}>Publicar Anuncio</h3>
              <button onClick={() => setModalAnuncio(false)}><X size={24} /></button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              publicarAnuncio({
                titulo: formData.get('titulo'),
                curso: formData.get('curso'),
                mensaje: formData.get('mensaje'),
                importante: formData.get('importante') === 'on'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Curso</label>
                  <select name="curso" required className={`w-full p-2 border ${border} rounded`}>
                    <option value="">Seleccionar...</option>
                    <option>Todos mis cursos</option>
                    {cursosDocente.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Título del anuncio</label>
                  <input type="text" name="titulo" placeholder="Ej: Cambio de horario" required className={`w-full p-2 border ${border} rounded`} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Mensaje</label>
                  <textarea name="mensaje" rows={6} placeholder="Contenido del anuncio..." required className={`w-full p-2 border ${border} rounded`}></textarea>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" name="importante" id="importante" />
                  <label htmlFor="importante" className="text-sm font-semibold">Marcar como importante</label>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                    Publicar Anuncio
                  </button>
                  <button type="button" onClick={() => setModalAnuncio(false)} className={`flex-1 border ${border} py-2 rounded`}>
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {nuevoMensajeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-2xl font-bold ${text}`}>Nuevo Mensaje</h3>
              <button onClick={() => { setNuevoMensajeModal(false); setArchivosAdjuntos([]); }}><X size={24} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              enviarMensaje({
                asunto: formData.get('asunto'),
                mensaje: formData.get('mensaje')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Destinatario</label>
                  <select required className={`w-full p-2 border ${border} rounded`}>
                    <option value="">Seleccionar estudiante...</option>
                    {estudiantes.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Asunto</label>
                  <input type="text" name="asunto" placeholder="Asunto del mensaje" required className={`w-full p-2 border ${border} rounded`} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mensaje</label>
                  <textarea name="mensaje" rows={8} placeholder="Escribe tu mensaje..." required className={`w-full p-2 border ${border} rounded`}></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Archivos adjuntos</label>
                  <label className="cursor-pointer flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded hover:bg-gray-50">
                    <Upload size={20} />
                    <span>Seleccionar archivos</span>
                    <input type="file" multiple className="hidden" onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setArchivosAdjuntos([...archivosAdjuntos, ...files]);
                    }} />
                  </label>
                  
                  {archivosAdjuntos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {archivosAdjuntos.map((archivo, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-blue-600" />
                            <span className="text-sm">{archivo.name}</span>
                            <span className="text-xs text-gray-500">({(archivo.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button type="button" onClick={() => setArchivosAdjuntos(archivosAdjuntos.filter((_, i) => i !== idx))} className="text-red-600">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MENSAJE MASIVO */}
      {modalMensajeMasivo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-2xl font-bold ${text}`}>Mensaje Masivo</h3>
              <button onClick={() => { setModalMensajeMasivo(false); setArchivosAdjuntos([]); }}><X size={24} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              enviarMensajeMasivo({
                destinatarios: formData.get('destinatarios'),
                asunto: formData.get('asunto'),
                mensaje: formData.get('mensaje')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Destinatarios</label>
                  <select name="destinatarios" required className={`w-full p-2 border ${border} rounded`}>
                    <option value="">Seleccionar grupo...</option>
                    <option value="todos">Todos mis estudiantes</option>
                    {cursosDocente.map(c => <option key={c.id} value={c.nombre}>Estudiantes de {c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Asunto</label>
                  <input type="text" name="asunto" placeholder="Asunto del mensaje" required className={`w-full p-2 border ${border} rounded`} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mensaje</label>
                  <textarea name="mensaje" rows={8} placeholder="Escribe tu mensaje..." required className={`w-full p-2 border ${border} rounded`}></textarea>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Enviar a Todos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER CLASES
  const renderClases = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Clases Virtuales</h2>
        <div className="flex gap-2">
          <button onClick={() => setVerGrabaciones(!verGrabaciones)} className={`px-4 py-2 rounded flex items-center gap-2 ${verGrabaciones ? 'bg-purple-600 text-white' : `border ${border}`}`}>
            <Video size={18} />Grabaciones
          </button>
          <button onClick={() => setModalClasePregrabada(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
            <Upload size={18} />Subir Clase
          </button>
          <button onClick={() => { setModalClase(true); setClaseEditar(null); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
            <Plus size={18} />Programar Clase
          </button>
        </div>
      </div>

      {verGrabaciones ? (
        <div className="space-y-4">
          <div className={`${card} rounded-lg shadow p-4`}>
            <h3 className="text-lg font-semibold mb-4">Clases Grabadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clasesRealizadas.filter(c => c.grabacion?.disponible).map(clase => (
                <div key={clase.id} className={`border ${border} rounded-lg p-4 hover:shadow-md transition`}>
                  <div className="flex gap-3">
                    <div className="w-24 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                      <Play className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${text} mb-1`}>{clase.titulo}</h4>
                      <p className="text-xs text-gray-500 mb-2">{clase.curso}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />{clase.grabacion.duracion}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />{clase.grabacion.vistas} vistas
                        </span>
                        <span>{clase.grabacion.tamaño}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1">
                      <Play size={14} />Ver
                    </button>
                    <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 text-sm flex items-center justify-center gap-1">
                      <Download size={14} />Descargar
                    </button>
                    <button className="px-3 border border-gray-300 rounded hover:bg-gray-50">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={`${card} rounded-lg shadow p-6`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Clases Programadas
            </h3>
            <div className="space-y-3">
              {clasesVirtuales.filter(c => c.estado === 'programada').map(clase => (
                <div key={clase.id} className={`border ${border} rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className={`font-bold ${text} mb-1`}>{clase.titulo}</h4>
                      <p className="text-sm text-gray-500 mb-2">{clase.curso}</p>
                      <p className="text-sm text-gray-600">{clase.descripcion}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />{clase.fecha}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />{clase.hora} - {clase.horaFin}
                        </span>
                        <span>({clase.duracion} min)</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setClaseEditar(clase); setModalClase(true); }} className="p-2 hover:bg-gray-100 rounded" title="Editar">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => eliminarClase(clase.id)} className="p-2 hover:bg-gray-100 rounded text-red-600" title="Cancelar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-3 mb-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Enlace de reunión:</span>
                      <button onClick={() => { navigator.clipboard.writeText(clase.link); alert('Enlace copiado'); }} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                        <Copy size={14} />Copiar enlace
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <code className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded text-xs`}>{clase.link}</code>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="font-semibold">Contraseña:</span>
                      <code className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-2 py-1 rounded text-xs`}>{clase.password}</code>
                      <button onClick={() => { navigator.clipboard.writeText(clase.password); alert('Contraseña copiada'); }} className="text-blue-600 hover:text-blue-700">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => window.open(clase.link, '_blank')} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                      <Play size={16} />Iniciar Clase
                    </button>
                    <button onClick={() => { 
                      const mensaje = `📚 *${clase.curso}*\n\n*Clase:* ${clase.titulo}\n*Fecha:* ${clase.fecha}\n*Hora:* ${clase.hora} - ${clase.horaFin}\n\n*Enlace:* ${clase.link}\n*Contraseña:* ${clase.password}`;
                      navigator.clipboard.writeText(mensaje);
                      alert('Información copiada para compartir');
                    }} className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 flex items-center gap-2">
                      <Send size={16} />Compartir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} rounded-lg shadow p-6`}>
            <h3 className="text-xl font-semibold mb-4">Clases Realizadas</h3>
            <div className="space-y-3">
              {clasesRealizadas.map(clase => (
                <div key={clase.id} className={`border ${border} rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className={`font-bold ${text}`}>{clase.titulo}</h4>
                      <p className="text-sm text-gray-500">{clase.curso} • {clase.fecha} • {clase.hora}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setVerParticipantes(clase)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm flex items-center gap-1">
                        <Users size={14} />{clase.participantes.filter(p => p.asistio).length}/{clase.participantes.length}
                      </button>
                      {clase.grabacion?.disponible && (
                        <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm flex items-center gap-1">
                          <Video size={14} />Grabación
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-2 rounded`}>
                      <p className="text-xs text-gray-500">Asistencia</p>
                      <p className="font-bold text-green-600">
                        {Math.round((clase.participantes.filter(p => p.asistio).length / clase.participantes.length) * 100)}%
                      </p>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-2 rounded`}>
                      <p className="text-xs text-gray-500">Duración</p>
                      <p className="font-bold">{clase.duracion} min</p>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-2 rounded`}>
                      <p className="text-xs text-gray-500">Vistas grabación</p>
                      <p className="font-bold text-purple-600">{clase.grabacion?.vistas || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* MODAL: CREAR/EDITAR CLASE */}
      {modalClase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto`}>
            <h3 className={`text-2xl font-bold mb-4 ${text}`}>
              {claseEditar ? 'Editar Clase Virtual' : 'Programar Nueva Clase'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              programarClase({
                titulo: formData.get('titulo'),
                curso: formData.get('curso'),
                descripcion: formData.get('descripcion'),
                fecha: formData.get('fecha'),
                hora: formData.get('hora'),
                horaFin: formData.get('horaFin'),
                duracion: parseInt(formData.get('duracion')),
                link: formData.get('link'),
                password: formData.get('password')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Título de la clase</label>
                  <input 
                    type="text" 
                    name="titulo"
                    placeholder="Ej: Patrones de Diseño - Singleton"
                    defaultValue={claseEditar?.titulo}
                    required
                    className={`w-full p-2 border ${border} rounded`} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Curso</label>
                  <select name="curso" defaultValue={claseEditar?.curso} required className={`w-full p-2 border ${border} rounded`}>
                    <option value="">Seleccionar curso...</option>
                    {cursosDocente.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Descripción</label>
                  <textarea 
                    name="descripcion"
                    rows={3}
                    placeholder="Breve descripción de los temas a tratar..."
                    defaultValue={claseEditar?.descripcion}
                    className={`w-full p-2 border ${border} rounded`}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Fecha</label>
                    <input 
                      type="date" 
                      name="fecha"
                      defaultValue={claseEditar?.fecha}
                      required
                      className={`w-full p-2 border ${border} rounded`} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Duración (minutos)</label>
                    <input 
                      type="number" 
                      name="duracion"
                      placeholder="120"
                      defaultValue={claseEditar?.duracion}
                      required
                      className={`w-full p-2 border ${border} rounded`} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Hora inicio</label>
                    <input 
                      type="time" 
                      name="hora"
                      defaultValue={claseEditar?.hora}
                      required
                      className={`w-full p-2 border ${border} rounded`} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Hora fin</label>
                    <input 
                      type="time" 
                      name="horaFin"
                      defaultValue={claseEditar?.horaFin}
                      required
                      className={`w-full p-2 border ${border} rounded`} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Enlace de la reunión</label>
                  <input 
                    type="url" 
                    name="link"
                    placeholder="https://zoom.us/j/..."
                    defaultValue={claseEditar?.link}
                    required
                    className={`w-full p-2 border ${border} rounded`} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Contraseña de la reunión (opcional)</label>
                  <input 
                    type="text" 
                    name="password"
                    placeholder="Contraseña"
                    defaultValue={claseEditar?.password}
                    className={`w-full p-2 border ${border} rounded`} 
                  />
                </div>

                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded`}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Grabar clase automáticamente</span>
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Enviar recordatorio a estudiantes 1 hora antes</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    {claseEditar ? 'Actualizar Clase' : 'Programar Clase'}
                  </button>
                  <button type="button" onClick={() => { setModalClase(false); setClaseEditar(null); }} className={`flex-1 border ${border} py-2 rounded`}>
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VER PARTICIPANTES */}
      {verParticipantes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-auto`}>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className={`text-2xl font-bold ${text}`}>Participación en Clase</h3>
                <p className="text-sm text-gray-500">{verParticipantes.titulo} • {verParticipantes.fecha}</p>
              </div>
              <button onClick={() => setVerParticipantes(null)}><X size={24} /></button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded text-center`}>
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="text-3xl font-bold">{verParticipantes.participantes.length}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded text-center`}>
                <p className="text-sm text-gray-500 mb-1">Presentes</p>
                <p className="text-3xl font-bold text-green-600">
                  {verParticipantes.participantes.filter(p => p.asistio).length}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded text-center`}>
                <p className="text-sm text-gray-500 mb-1">Ausentes</p>
                <p className="text-3xl font-bold text-red-600">
                  {verParticipantes.participantes.filter(p => !p.asistio).length}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold mb-3">Lista de Participantes</h4>
              {verParticipantes.participantes.map((participante, idx) => (
                <div key={idx} className={`border ${border} rounded p-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${participante.asistio ? 'bg-green-600' : 'bg-red-600'}`}>
                      {participante.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-semibold ${text}`}>{participante.nombre}</p>
                      <p className="text-xs text-gray-500">Tiempo en clase: {participante.tiempoConexion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {participante.asistio ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm flex items-center gap-1">
                        <CheckCircle size={14} />Asistió
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm flex items-center gap-1">
                        <AlertCircle size={14} />Ausente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                <Download size={16} />Exportar Reporte
              </button>
              <button onClick={() => setVerParticipantes(null)} className={`flex-1 border ${border} py-2 rounded`}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER MATERIALES
  const renderMateriales = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Materiales del Curso</h2>
        <button onClick={() => setModalMateriales(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Upload size={18} />Subir
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {materialesCurso.map(material => (
          <div key={material.id} className={`${card} rounded-lg shadow p-4`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${material.tipo === 'pdf' ? 'bg-red-100' : 'bg-purple-100'}`}>
                {material.tipo === 'pdf' ? <FileText className="text-red-600" size={24} /> : <Video className="text-purple-600" size={24} />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${text}`}>{material.titulo}</h3>
                <p className="text-sm text-gray-500">{material.curso} • {material.tamaño}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded"><Download size={18} /></button>
                <button onClick={() => eliminarMaterial(material.id)} className="p-2 hover:bg-gray-100 rounded text-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalMateriales && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`}>
            <h3 className={`text-2xl font-bold mb-4 ${text}`}>Subir Material</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              agregarMaterial({
                titulo: formData.get('titulo'),
                curso: formData.get('curso'),
                tipo: formData.get('tipo')
              });
            }}>
              <div className="space-y-4">
                <select name="curso" required className={`w-full p-2 border ${border} rounded`}>
                  <option value="">Seleccionar curso...</option>
                  {cursosDocente.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                </select>
                <input type="text" name="titulo" placeholder="Título" required className={`w-full p-2 border ${border} rounded`} />
                <select name="tipo" required className={`w-full p-2 border ${border} rounded`}>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="documento">Documento</option>
                </select>
                <div className={`border-2 border-dashed ${border} rounded-lg p-8 text-center`}>
                  <Upload className="mx-auto mb-2 text-gray-400" size={48} />
                  <p className="text-gray-500">Arrastra archivos o haz clic para seleccionar</p>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Subir</button>
                  <button type="button" onClick={() => setModalMateriales(false)} className={`flex-1 border ${border} py-2 rounded`}>Cancelar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER ASISTENCIA
  const renderAsistencia = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Asistencia</h2>
        <button onClick={() => setModalAsistencia({ curso: cursosDocente[0] })} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <UserCheck size={18} />Tomar
        </button>
      </div>

      <div className="space-y-3">
        {registrosAsistencia.map(reg => (
          <div key={reg.id} className={`${card} rounded-lg shadow p-4`}>
            <div className="flex justify-between mb-2">
              <div>
                <h4 className={`font-bold ${text}`}>{reg.curso}</h4>
                <p className="text-sm text-gray-500">{reg.fecha}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">✓ {reg.presentes}</span>
                <span className="text-red-600">✗ {reg.ausentes}</span>
              </div>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(reg.presentes/(reg.presentes+reg.ausentes))*100}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {modalAsistencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-2xl font-bold ${text}`}>Tomar Asistencia - {modalAsistencia.curso.nombre}</h3>
              <button onClick={() => setModalAsistencia(null)}><X size={24} /></button>
            </div>
            <div className="space-y-2 mb-4">
              {estudiantes.filter(e => e.curso === modalAsistencia.curso.nombre).map(est => (
                <div key={est.id} className={`border ${border} rounded p-3 flex justify-between items-center`}>
                  <span>{est.nombre}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setAsistenciaEstudiantes({...asistenciaEstudiantes, [est.id]: 'presente'})} className={`px-4 py-2 rounded ${asistenciaEstudiantes[est.id] === 'presente' ? 'bg-green-600 text-white' : 'border'}`}>
                      Presente
                    </button>
                    <button onClick={() => setAsistenciaEstudiantes({...asistenciaEstudiantes, [est.id]: 'ausente'})} className={`px-4 py-2 rounded ${asistenciaEstudiantes[est.id] === 'ausente' ? 'bg-red-600 text-white' : 'border'}`}>
                      Ausente
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { alert('Asistencia guardada'); setModalAsistencia(null); }} className="w-full bg-blue-600 text-white py-3 rounded">Guardar</button>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER GRUPOS
  const renderGrupos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Grupos de Trabajo</h2>
        <button onClick={() => setModalGrupos(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Crear Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grupos.map(grupo => (
          <div key={grupo.id} className={`${card} rounded-lg shadow`}>
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className={`font-bold text-lg ${text}`}>{grupo.nombre}</h3>
                  <p className="text-sm text-gray-500">{grupo.curso}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setGrupoSeleccionado(grupo)} className="p-2 hover:bg-gray-100 rounded" title="Ver detalles">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => eliminarGrupo(grupo.id)} className="p-2 hover:bg-gray-100 rounded text-red-600" title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{grupo.estudiantes.length} miembros</span>
                <span>•</span>
                <span>{grupo.tareas?.length || 0} tareas</span>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm font-semibold mb-2">Integrantes:</p>
              <div className="space-y-2">
                {grupo.estudiantes.map((est, idx) => (
                  <div key={idx} className={`flex items-center gap-2 p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {est.charAt(0)}
                    </div>
                    <span className="text-sm">{est}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t">
              <button onClick={() => setGrupoSeleccionado(grupo)} className="w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50">
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: CREAR GRUPO */}
      {modalGrupos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`}>
            <h3 className={`text-2xl font-bold mb-4 ${text}`}>Crear Grupo</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              crearGrupo({
                nombre: formData.get('nombre'),
                curso: formData.get('curso'),
                estudiantes: []
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre del grupo</label>
                  <input type="text" name="nombre" placeholder="Ej: Grupo 1" required className={`w-full p-2 border ${border} rounded`} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Curso</label>
                  <select name="curso" required className={`w-full p-2 border ${border} rounded`}>
                    <option value="">Seleccionar...</option>
                    {cursosDocente.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Crear</button>
                  <button type="button" onClick={() => setModalGrupos(false)} className={`flex-1 border ${border} py-2 rounded`}>Cancelar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETALLE DEL GRUPO */}
      {grupoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto`}>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className={`text-2xl font-bold ${text}`}>{grupoSeleccionado.nombre}</h3>
                <p className="text-sm text-gray-500">{grupoSeleccionado.curso}</p>
              </div>
              <button onClick={() => setGrupoSeleccionado(null)}><X size={24} /></button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-3">Integrantes ({grupoSeleccionado.estudiantes.length})</h4>
                <div className="space-y-2">
                  {grupoSeleccionado.estudiantes.map((est, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {est.charAt(0)}
                        </div>
                        <span>{est}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Tareas Grupales ({grupoSeleccionado.tareas?.length || 0})</h4>
                <div className="space-y-2">
                  {grupoSeleccionado.tareas?.map((tarea, idx) => (
                    <div key={idx} className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                      <p className="font-semibold">{tarea}</p>
                      <p className="text-sm text-gray-500">Pendiente de entrega</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER NOTIFICACIONES
  const renderNotificaciones = () => {
    const tiposNotificacion = [
      { id: 'todas', label: 'Todas', count: notificaciones.length },
      { id: 'urgente', label: 'Urgentes', count: notificaciones.filter(n => n.tipo === 'urgente').length },
      { id: 'tarea', label: 'Tareas', count: notificaciones.filter(n => n.tipo === 'tarea').length },
      { id: 'mensaje', label: 'Mensajes', count: notificaciones.filter(n => n.tipo === 'mensaje').length },
      { id: 'clase', label: 'Clases', count: notificaciones.filter(n => n.tipo === 'clase').length }
    ];

    const notificacionesFiltradas = filtroNotificaciones === 'todas' 
      ? notificaciones 
      : notificaciones.filter(n => n.tipo === filtroNotificaciones);

    const marcarComoLeida = (id) => {
      setNotificaciones(notificaciones.map(n => 
        n.id === id ? { ...n, leida: true } : n
      ));
    };

    const marcarTodasLeidas = () => {
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
    };

    const eliminarNotificacion = (id) => {
      setNotificaciones(notificaciones.filter(n => n.id !== id));
    };

    const getTipoIcon = (tipo) => {
      switch(tipo) {
        case 'urgente': return <AlertCircle className="text-red-600" size={20} />;
        case 'tarea': return <FileText className="text-orange-600" size={20} />;
        case 'mensaje': return <Mail className="text-blue-600" size={20} />;
        case 'clase': return <Video className="text-purple-600" size={20} />;
        case 'examen': return <ClipboardCheck className="text-green-600" size={20} />;
        default: return <Bell className="text-gray-600" size={20} />;
      }
    };

    const ejecutarAccion = (notificacion) => {
      if (notificacion.accion) {
        setActiveSection(notificacion.accion);
        marcarComoLeida(notificacion.id);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${text}`}>Notificaciones</h2>
          <div className="flex gap-2">
            <button onClick={marcarTodasLeidas} className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 flex items-center gap-2">
              <CheckCircle size={16} />Marcar todas como leídas
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className={`${card} rounded-lg shadow p-4`}>
          <div className="flex gap-2 overflow-x-auto">
            {tiposNotificacion.map(tipo => (
              <button
                key={tipo.id}
                onClick={() => setFiltroNotificaciones(tipo.id)}
                className={`px-4 py-2 rounded whitespace-nowrap transition ${
                  filtroNotificaciones === tipo.id
                    ? 'bg-blue-600 text-white'
                    : `border ${border} hover:bg-gray-50`
                }`}
              >
                {tipo.label} ({tipo.count})
              </button>
            ))}
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${card} rounded-lg shadow p-4 border-l-4 border-blue-500`}>
            <p className="text-sm text-gray-500">Total</p>
            <p className={`text-2xl font-bold ${text}`}>{notificaciones.length}</p>
          </div>
          <div className={`${card} rounded-lg shadow p-4 border-l-4 border-red-500`}>
            <p className="text-sm text-gray-500">No leídas</p>
            <p className={`text-2xl font-bold ${text}`}>{notificaciones.filter(n => !n.leida).length}</p>
          </div>
          <div className={`${card} rounded-lg shadow p-4 border-l-4 border-orange-500`}>
            <p className="text-sm text-gray-500">Urgentes</p>
            <p className={`text-2xl font-bold ${text}`}>{notificaciones.filter(n => n.tipo === 'urgente').length}</p>
          </div>
          <div className={`${card} rounded-lg shadow p-4 border-l-4 border-green-500`}>
            <p className="text-sm text-gray-500">Hoy</p>
            <p className={`text-2xl font-bold ${text}`}>{notificaciones.filter(n => n.fecha.startsWith('2025-10-04')).length}</p>
          </div>
        </div>

        {/* LISTA DE NOTIFICACIONES */}
        <div className={`${card} rounded-lg shadow`}>
          <div className="divide-y divide-gray-200">
            {notificacionesFiltradas.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay notificaciones de este tipo</p>
              </div>) : (
              notificacionesFiltradas.map(notificacion => (
                <div
                  key={notificacion.id}
                  className={`p-4 hover:bg-gray-50 transition ${
                    !notificacion.leida ? `${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'}` : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex items-start pt-1">
                      {!notificacion.leida && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-shrink-0 pt-1">
                      {getTipoIcon(notificacion.tipo)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h4 className={`font-semibold ${!notificacion.leida ? 'font-bold' : ''} ${text}`}>
                          {notificacion.titulo}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {notificacion.fecha.split(' ')[1] || notificacion.fecha}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notificacion.mensaje}</p>
                      
                      <div className="flex items-center gap-2">
                        {notificacion.accion && (
                          <button
                            onClick={() => ejecutarAccion(notificacion)}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            Ver más →
                          </button>
                        )}
                        {!notificacion.leida && (
                          <button
                            onClick={() => marcarComoLeida(notificacion.id)}
                            className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                          >
                            <CheckCircle size={14} />Marcar leída
                          </button>
                        )}
                        <button
                          onClick={() => eliminarNotificacion(notificacion.id)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <Trash2 size={14} />Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // RENDER CALENDARIO
  const renderCalendario = () => {
    const getDiasDelMes = () => {
      const dias = [];
      const primerDia = new Date(2025, 9, 1).getDay();
      const diasEnMes = 31;
      
      for (let i = 0; i < primerDia; i++) {
        dias.push(null);
      }
      
      for (let dia = 1; dia <= diasEnMes; dia++) {
        dias.push(dia);
      }
      
      return dias;
    };

    const getEventosDelDia = (dia) => {
      const fecha = `2025-10-${dia.toString().padStart(2, '0')}`;
      return eventosCalendario.filter(e => e.fecha === fecha);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${text}`}>Calendario</h2>
          <div className="flex gap-2">
            <button onClick={() => setVistaCalendario('mes')} className={`px-4 py-2 rounded ${vistaCalendario === 'mes' ? 'bg-blue-600 text-white' : `border ${border}`}`}>
              Mes
            </button>
            <button onClick={() => setVistaCalendario('semana')} className={`px-4 py-2 rounded ${vistaCalendario === 'semana' ? 'bg-blue-600 text-white' : `border ${border}`}`}>
              Semana
            </button>
            <button onClick={() => setVistaCalendario('horario')} className={`px-4 py-2 rounded ${vistaCalendario === 'horario' ? 'bg-blue-600 text-white' : `border ${border}`}`}>
              Mi Horario
            </button>
            <button onClick={() => setModalEvento(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <Plus size={18} />Evento
            </button>
          </div>
        </div>

        {vistaCalendario === 'mes' && (
          <div className={`${card} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Octubre 2025</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Clases</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Exámenes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Entregas</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                <div key={dia} className="text-center font-semibold text-sm p-2">{dia}</div>
              ))}
              
              {getDiasDelMes().map((dia, idx) => {
                const eventos = dia ? getEventosDelDia(dia) : [];
                const esHoy = dia === 4;
                
                return (
                  <div 
                    key={idx} 
                    className={`min-h-[100px] p-2 border ${border} rounded ${
                      dia ? 'cursor-pointer hover:shadow' : 'bg-gray-50'
                    } ${esHoy ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {dia && (
                      <>
                        <div className={`font-semibold text-sm mb-1 ${esHoy ? 'text-blue-600' : ''}`}>
                          {dia}
                        </div>
                        <div className="space-y-1">
                          {eventos.slice(0, 3).map(evento => (
                            <div 
                              key={evento.id} 
                              className={`${evento.color} text-white text-xs p-1 rounded truncate`}
                              title={evento.titulo}
                            >
                              {evento.hora} {evento.titulo}
                            </div>
                          ))}
                          {eventos.length > 3 && (
                            <div className="text-xs text-gray-500">+{eventos.length - 3} más</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {vistaCalendario === 'semana' && (
          <div className={`${card} rounded-lg shadow p-6`}>
            <h3 className="text-xl font-bold mb-4">Esta Semana</h3>
            <div className="space-y-3">
              {eventosCalendario
                .filter(e => {
                  const dia = parseInt(e.fecha.split('-')[2]);
                  return dia >= 4 && dia <= 10;
                })
                .sort((a, b) => new Date(a.fecha + ' ' + a.hora) - new Date(b.fecha + ' ' + b.hora))
                .map(evento => (
                  <div key={evento.id} className={`border-l-4 ${evento.color} ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-bold ${text}`}>{evento.titulo}</h4>
                        <p className="text-sm text-gray-500">{evento.curso}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />{evento.fecha}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />{evento.hora}
                          </span>
                          {evento.duracion && <span>{evento.duracion} min</span>}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs ${
                        evento.tipo === 'clase' ? 'bg-blue-100 text-blue-700' :
                        evento.tipo === 'examen' ? 'bg-purple-100 text-purple-700' :
                        evento.tipo === 'tarea' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {vistaCalendario === 'horario' && (
          <div className={`${card} rounded-lg shadow p-6`}>
            <h3 className="text-xl font-bold mb-4">Mi Horario Semanal</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Hora</th>
                    {horarioSemanal.map(dia => (
                      <th key={dia.dia} className="px-4 py-3 text-center text-sm font-semibold">{dia.dia}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {['10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00'].map(horario => (
                    <tr key={horario}>
                      <td className="px-4 py-3 font-semibold text-sm">{horario}</td>
                      {horarioSemanal.map(dia => {
                        const bloque = dia.bloques.find(b => b.hora === horario);
                        return (
                          <td key={dia.dia} className="px-2 py-2">
                            {bloque && (
                              <div className={`${
                                bloque.tipo === 'clase' ? 'bg-blue-100 border-blue-400' :
                                bloque.tipo === 'asesoría' ? 'bg-green-100 border-green-400' :
                                'bg-gray-100 border-gray-400'
                              } border-l-4 p-2 rounded`}>
                                <p className="font-semibold text-sm">{bloque.curso}</p>
                                <p className="text-xs text-gray-600">{bloque.salon}</p>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modalEvento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`}>
              <h3 className={`text-2xl font-bold mb-4 ${text}`}>Agregar Evento</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Título del evento" className={`w-full p-2 border ${border} rounded`} />
                <select className={`w-full p-2 border ${border} rounded`}>
                  <option>Tipo de evento...</option>
                  <option>Clase</option>
                  <option>Examen</option>
                  <option>Reunión</option>
                  <option>Asesoría</option>
                  <option>Otro</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" className={`p-2 border ${border} rounded`} />
                  <input type="time" className={`p-2 border ${border} rounded`} />
                </div>
                <textarea rows={3} placeholder="Descripción (opcional)" className={`w-full p-2 border ${border} rounded`}></textarea>
                <div className="flex gap-3">
                  <button onClick={() => { alert('Evento agregado'); setModalEvento(false); }} className="flex-1 bg-blue-600 text-white py-2 rounded">Agregar</button>
                  <button onClick={() => setModalEvento(false)} className={`flex-1 border ${border} py-2 rounded`}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // RENDER RUBRICAS
  const renderRubricas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Rúbricas de Evaluación</h2>
        <button onClick={() => { setModalRubrica(true); setRubricaEditar(null); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Crear Rúbrica
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {rubricas.map(rubrica => (
          <div key={rubrica.id} className={`${card} rounded-lg shadow`}>
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-xl font-bold ${text}`}>{rubrica.nombre}</h3>
                  <p className="text-sm text-gray-500">{rubrica.curso}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEvaluacionConRubrica(rubrica)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                    Usar para Evaluar
                  </button>
                  <button onClick={() => { setRubricaEditar(rubrica); setModalRubrica(true); }} className="p-2 hover:bg-gray-100 rounded">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => eliminarRubrica(rubrica.id)} className="p-2 hover:bg-gray-100 rounded text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Criterio</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Peso</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Niveles de Desempeño</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rubrica.criterios.map(criterio => (
                    <tr key={criterio.id}>
                      <td className="px-4 py-3 font-semibold">{criterio.nombre}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                          {criterio.peso}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          {criterio.niveles.map((nivel, idx) => (
                            <div key={idx} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-2 rounded text-sm`}>
                              <span className="font-semibold">{nivel.puntos} pts:</span> {nivel.descripcion}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {modalRubrica && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto`}>
            <h3 className={`text-2xl font-bold mb-4 ${text}`}>
              {rubricaEditar ? 'Editar Rúbrica' : 'Crear Nueva Rúbrica'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              crearRubrica({
                nombre: formData.get('nombre'),
                curso: formData.get('curso')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre de la Rúbrica</label>
                  <input type="text" name="nombre" placeholder="Ej: Rúbrica Proyectos" defaultValue={rubricaEditar?.nombre} required className={`w-full p-2 border ${border} rounded`} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Curso</label>
                  <select name="curso" defaultValue={rubricaEditar?.curso} required className={`w-full p-2 border ${border} rounded`}>
                    <option value="">Seleccionar...</option>
                    {cursosDocente.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">
                    {rubricaEditar ? 'Actualizar' : 'Crear'} Rúbrica
                  </button>
                  <button type="button" onClick={() => { setModalRubrica(false); setRubricaEditar(null); }} className={`flex-1 border ${border} py-2 rounded`}>
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {evaluacionConRubrica && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${card} rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto`}>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className={`text-2xl font-bold ${text}`}>Evaluar con Rúbrica</h3>
                <p className="text-sm text-gray-500">{evaluacionConRubrica.nombre}</p>
              </div>
              <button onClick={() => setEvaluacionConRubrica(null)}><X size={24} /></button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Estudiante</label>
              <select className={`w-full p-2 border ${border} rounded`}>
                {estudiantes.map(e => <option key={e.id}>{e.nombre}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {evaluacionConRubrica.criterios.map(criterio => (
                <div key={criterio.id} className={`border ${border} rounded p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold">{criterio.nombre}</h4>
                    <span className="text-sm text-gray-500">Peso: {criterio.peso}%</span>
                  </div>
                  <div className="space-y-2">
                    {criterio.niveles.map((nivel, idx) => (
                      <label key={idx} className={`flex items-start gap-3 p-3 border ${border} rounded cursor-pointer hover:bg-gray-50`}>
                        <input type="radio" name={`criterio-${criterio.id}`} className="mt-1" />
                        <div className="flex-1">
                          <span className="font-semibold">{nivel.puntos} puntos</span>
                          <p className="text-sm text-gray-600">{nivel.descripcion}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <label className="block text-sm font-semibold mb-2">Retroalimentación General</label>
              <textarea rows={4} placeholder="Comentarios adicionales para el estudiante..." className={`w-full p-3 border ${border} rounded`}></textarea>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => { alert('Evaluación guardada'); setEvaluacionConRubrica(null); }} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                Guardar Evaluación
              </button>
              <button onClick={() => setEvaluacionConRubrica(null)} className={`flex-1 border ${border} py-2 rounded`}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // RENDER REPORTES
  const renderReportes = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Reportes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className="font-bold mb-4">Rendimiento</h3>
          {cursosDocente.map(curso => (
            <div key={curso.id} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{curso.codigo}</span>
                <span className="font-semibold">8.{Math.floor(Math.random() * 9)}</span>
              </div>
              <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                <div className={`${curso.color} h-2 rounded-full`} style={{ width: `${curso.progresoGeneral}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className="font-bold mb-4">Participación</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">78%</div>
            <p className="text-sm text-gray-500">Asistencia</p>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className="font-bold mb-4">Estudiantes</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-2xl font-bold text-red-600">12</span>
              <span className="text-sm">en riesgo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-2xl font-bold text-green-600">45</span>
              <span className="text-sm">excelentes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // RENDER INICIO
  const renderInicio = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Bienvenido, Prof. García</h2>
        <p>45 tareas por revisar • 3 exámenes programados • {mensajes.filter(m => !m.leido).length} mensajes nuevos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${card} rounded-lg shadow p-4 border-l-4 border-blue-500`}>
          <p className="text-sm text-gray-500">Estudiantes</p>
          <p className={`text-2xl font-bold ${text}`}>177</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border-l-4 border-orange-500`}>
          <p className="text-sm text-gray-500">Por Revisar</p>
          <p className={`text-2xl font-bold ${text}`}>45</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border-l-4 border-red-500`}>
          <p className="text-sm text-gray-500">Mensajes</p>
          <p className={`text-2xl font-bold ${text}`}>{mensajes.filter(m => !m.leido).length}</p>
        </div>
        <div className={`${card} rounded-lg shadow p-4 border-l-4 border-purple-500`}>
          <p className="text-sm text-gray-500">Promedio</p>
          <p className={`text-2xl font-bold ${text}`}>8.2</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className="text-xl font-semibold mb-4">Próximas Clases</h3>
          <div className="space-y-3">
            {clasesVirtuales.slice(0, 3).map(clase => (
              <div key={clase.id} className={`border-l-4 ${cursosDocente.find(c => c.nombre === clase.curso)?.color} p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`font-semibold ${text}`}>{clase.titulo}</p>
                <p className="text-sm text-gray-500">{clase.fecha} • {clase.hora}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className="text-xl font-semibold mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {notificaciones.slice(0, 4).map(n => (
              <div key={n.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${!n.leida ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className="flex-1">
                  <p className={`text-sm ${!n.leida ? 'font-semibold' : ''}`}>{n.titulo}</p>
                  <p className="text-xs text-gray-500">{n.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'inicio': return renderInicio();
      case 'cursos': return renderCursos();
      case 'estudiantes': return renderEstudiantes();
      case 'materiales': return renderMateriales();
      case 'tareas': return renderTareas();
      case 'examenes': return renderExamenes();
      case 'calificaciones': return renderCalificaciones();
      case 'asistencia': return renderAsistencia();
      case 'mensajes': return renderMensajes();
      case 'notificaciones': return renderNotificaciones();
      case 'clases': return renderClases();
      case 'calendario': return renderCalendario();
      case 'rubricas': return renderRubricas();
      case 'grupos': return renderGrupos();
      case 'reportes': return renderReportes();
      default: return renderInicio();
    }
  };

  return (
    <div className={`flex h-screen ${bg}`}>
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-700 text-white transition-all flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-600">
          {sidebarOpen && <h1 className="text-xl font-bold">UniVirtual Prof</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-600 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition relative ${activeSection === item.id ? 'bg-blue-600' : 'hover:bg-blue-800'}`}>
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
                {item.badge > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={`${card} shadow-sm p-4 flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${text}`}>{menuItems.find(i => i.id === activeSection)?.label || 'Dashboard'}</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 rounded-full">
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <div className="relative">
              <button onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)} className="relative p-2">
                <Bell size={24} />
                {notificaciones.filter(n => !n.leida).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificaciones.filter(n => !n.leida).length}
                  </span>
                )}
              </button>
              
              {notificacionesAbiertas && (
                <div className={`absolute right-0 mt-2 w-96 ${card} rounded-lg shadow-xl z-50 border ${border}`}>
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold">Notificaciones</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
                        }}
                        className="text-blue-600 hover:text-blue-700 text-xs"
                      >
                        Marcar todas
                      </button>
                      <button onClick={() => setNotificacionesAbiertas(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notificaciones.slice(0, 5).map(n => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${!n.leida ? `${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'}` : ''}`}
                        onClick={() => {
                          if (n.accion) {
                            setActiveSection(n.accion);
                            setNotificacionesAbiertas(false);
                            setNotificaciones(notificaciones.map(notif => 
                              notif.id === n.id ? { ...notif, leida: true } : notif
                            ));
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                            n.tipo === 'urgente' ? 'bg-red-500' :
                            n.tipo === 'mensaje' ? 'bg-blue-500' :
                            n.tipo === 'tarea' ? 'bg-orange-500' :
                            n.tipo === 'clase' ? 'bg-purple-500' :
                            'bg-green-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className={`text-sm ${!n.leida ? 'font-semibold' : ''}`}>{n.titulo}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.mensaje}</p>
                            <p className="text-xs text-gray-400 mt-1">{n.fecha}</p>
                          </div>
                          {!n.leida && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotificaciones(notificaciones.map(notif => 
                                  notif.id === n.id ? { ...notif, leida: true } : notif
                                ));
                              }}
                              className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                              title="Marcar como leída"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button 
                      onClick={() => {
                        setActiveSection('notificaciones');
                        setNotificacionesAbiertas(false);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      Ver todas las notificaciones →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">PG</div>
            </div>
          </div>
        </div>
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}