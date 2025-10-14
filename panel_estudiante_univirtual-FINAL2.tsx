import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Video, FileText, Bell, Award, DollarSign, MessageSquare, Clock, TrendingUp, User, Menu, X, Play, CheckCircle, AlertCircle, Download, Moon, Sun, Users, FileCheck, Home, ClipboardList, Send, ChevronLeft, ChevronRight, Eye, Mail, Circle } from 'lucide-react';

export default function UniversityDashboard() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [nuevoMensajeModal, setNuevoMensajeModal] = useState(false);
  
  const [examenActivo, setExamenActivo] = useState(null);
  const [respuestasExamen, setRespuestasExamen] = useState({});
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  
  const [modalTarea, setModalTarea] = useState(null);
  const [archivoTarea, setArchivoTarea] = useState(null);
  const [cursoDetalle, setCursoDetalle] = useState(null);
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [bloqueActivo, setBloqueActivo] = useState(1);
  const [expandirIdeasClave, setExpandirIdeasClave] = useState(false);
  const [claseActiva, setClaseActiva] = useState(null);
  const [tipoClase, setTipoClase] = useState('vivo');
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [tipoSolicitud, setTipoSolicitud] = useState('');
  const [modalTramite, setModalTramite] = useState(false);
  const [tipoTramite, setTipoTramite] = useState('');
  const [observacionesTramite, setObservacionesTramite] = useState('');
  const [tramiteDetalle, setTramiteDetalle] = useState(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  
  const [datosPerfil, setDatosPerfil] = useState({
    primerNombre: 'Dayla',
    segundoNombre: 'Melanie',
    primerApellido: 'Otalvaro',
    segundoApellido: 'Rodriguez',
    tipoIdentificacion: 'C.C.',
    numeroIdentificacion: '1007379958',
    sexo: 'Femenino',
    email: 'RODRIGUEZMELAÑ2102@GMAIL.COM',
    telefono: '3182862583',
    celular: '3182862583',
    fechaNacimiento: '1999-02-21',
    lugarNacimiento: 'Arauca (Arauca)',
    direccion: 'CALLE 27 S # 7 - 39',
    lugarResidencia: 'Bogotá, D.C. (Bogotá D.C)',
    barrio: '20 De Julio',
    zona: 'Urbana',
    estrato: '3',
    medioTransporte: 'Seleccione',
    grupoSisben: 'Seleccione',
    subgrupoSisben: 'Seleccione',
    fechaExpedicionDoc: '2017-03-28',
    expedicionDocumento: 'Arauca (Arauca)',
    tipoSangre: 'O+',
    estadoCivil: 'Unión libre',
    numeroHijos: '1',
    eps: '36) Sanitas EPS',
    ars: 'Seleccione',
    aseguradora: 'Seleccione',
    numeroLibretaMilitar: '',
    nivelFormacion: 'Seleccione',
    ocupacion: 'Seleccione',
    discapacidad: 'No Aplica',
    capacidadExcepcional: 'No aplica',
    grupoEtnico: 'No Informa',
    puebloIndigena: 'No informa',
    comunidadNegra: 'No Aplica',
    codigoPruebaSaber: 'AC201711270966',
    colegio: '',
    programa: 'Ingeniería de Sistemas',
    semestre: '7mo Semestre',
    codigo: '2018123456'
  });

  const [mensajes] = useState([
    { id: 1, remitente: 'Prof. García', asunto: 'Retroalimentación Proyecto Final', preview: 'Tu proyecto muestra un excelente dominio de los conceptos...', fecha: '2025-10-03 11:20', leido: false, tipo: 'recibido', avatar: 'PG' },
    { id: 2, remitente: 'Coordinación Académica', asunto: 'Inscripción próximo semestre', preview: 'Recordatorio: El período de inscripción inicia el 15 de octubre...', fecha: '2025-10-02 09:15', leido: false, tipo: 'recibido', avatar: 'CA' },
    { id: 3, remitente: 'Prof. Martínez', asunto: 'Material adicional disponible', preview: 'He subido material complementario sobre redes neuronales...', fecha: '2025-10-01 16:30', leido: true, tipo: 'recibido', avatar: 'PM' }
  ]);

  const [cursos] = useState([
    { 
      id: 1, nombre: 'Programación Avanzada', progreso: 75, color: 'bg-blue-500', tareasPendientes: 2, proximaClase: 'Hoy 14:00', profesor: 'Prof. García',
      temas: [
        { 
          id: 1, 
          titulo: 'Patrones de Diseño', 
          completado: true, 
          materiales: ['Video: Singleton', 'PDF: Factory Pattern', 'Ejercicios prácticos'],
          bloques: [
            {
              id: 1,
              titulo: 'INTRODUCCIÓN A PATRONES DE DISEÑO',
              objetivos: [
                'Analizar las características más relevantes de los patrones de diseño',
                'Comprender la importancia de los patrones en el desarrollo de software',
                'Aplicar y llevar a la práctica patrones de diseño comunes',
                'Detectar los principales factores para seleccionar un patrón apropiado'
              ],
              temas: [
                { titulo: 'Introducción y objetivos', tipo: 'lectura' },
                { titulo: '¿Qué son los patrones de diseño?', tipo: 'lectura' },
                { titulo: 'Tipos de patrones de diseño', tipo: 'lectura' },
                { titulo: 'Patrones creacionales', tipo: 'video' }
              ],
              ideasClave: [
                { numero: 1, texto: 'Introducción y objetivos' },
                { numero: 2, texto: '¿Qué son los patrones de diseño?' },
                { numero: 3, texto: 'Clasificación de patrones' },
                { numero: 4, texto: 'Singleton Pattern' },
                { numero: 5, texto: 'Factory Pattern' },
                { numero: 6, texto: 'Referencias bibliográficas' },
                { numero: 7, texto: 'Bibliografía complementaria' }
              ]
            },
            {
              id: 2,
              titulo: 'PATRONES ESTRUCTURALES Y DE COMPORTAMIENTO',
              objetivos: [
                'Comprender los patrones estructurales más utilizados',
                'Aplicar patrones de comportamiento en situaciones reales',
                'Comparar diferentes patrones para seleccionar el más apropiado'
              ],
              temas: [
                { titulo: 'Patrones estructurales', tipo: 'lectura' },
                { titulo: 'Adapter y Decorator', tipo: 'video' },
                { titulo: 'Patrones de comportamiento', tipo: 'lectura' },
                { titulo: 'Observer y Strategy', tipo: 'video' }
              ],
              ideasClave: [
                { numero: 1, texto: 'Patrones estructurales: Adapter' },
                { numero: 2, texto: 'Patrones estructurales: Decorator' },
                { numero: 3, texto: 'Patrones de comportamiento: Observer' },
                { numero: 4, texto: 'Patrones de comportamiento: Strategy' }
              ]
            }
          ]
        },
        { 
          id: 2, 
          titulo: 'Estructuras de Datos', 
          completado: true, 
          materiales: ['Video: Árboles', 'Quiz: Grafos'],
          bloques: []
        },
        { 
          id: 3, 
          titulo: 'Algoritmos de Ordenamiento', 
          completado: false, 
          materiales: ['Video: QuickSort', 'Taller práctico'],
          bloques: []
        }
      ]
    },
    { 
      id: 2, nombre: 'Diseño de Interfaces', progreso: 60, color: 'bg-purple-500', tareasPendientes: 1, proximaClase: 'Mañana 10:00', profesor: 'Prof. López',
      temas: [
        { id: 1, titulo: 'Principios de Diseño', completado: true, materiales: ['PDF: UX Basics'], bloques: [] },
        { id: 2, titulo: 'Prototipado', completado: false, materiales: ['Video: Figma Tutorial'], bloques: [] }
      ]
    },
    { 
      id: 3, nombre: 'Base de Datos', progreso: 85, color: 'bg-green-500', tareasPendientes: 0, proximaClase: 'Vie 16:00', profesor: 'Prof. Rodríguez',
      temas: [{ id: 1, titulo: 'SQL Avanzado', completado: true, materiales: ['Video: Joins', 'Ejercicios SQL'], bloques: [] }]
    },
    { 
      id: 4, nombre: 'Inteligencia Artificial', progreso: 45, color: 'bg-orange-500', tareasPendientes: 3, proximaClase: 'Hoy 18:00', profesor: 'Prof. Martínez',
      temas: [{ id: 1, titulo: 'Machine Learning', completado: false, materiales: ['Video: Intro ML'], bloques: [] }]
    }
  ]);

  const [clasesVivo] = useState([
    { id: 1, curso: 'Programación Avanzada', titulo: 'Patrones de Diseño - Singleton', profesor: 'Prof. García', hora: 'Hoy 14:00 - 16:00', link: 'https://zoom.us/j/123', participantes: 28, estado: 'próxima' },
    { id: 2, curso: 'Inteligencia Artificial', titulo: 'Redes Neuronales Profundas', profesor: 'Prof. Martínez', hora: 'Hoy 18:00 - 20:00', link: 'https://zoom.us/j/456', participantes: 32, estado: 'próxima' }
  ]);

  const [clasesGrabadas] = useState([
    { id: 1, curso: 'Programación Avanzada', titulo: 'Introducción a Patrones de Diseño', profesor: 'Prof. García', duracion: '1:45:30', fecha: '2025-09-28', vistas: 142, link: '#' },
    { id: 2, curso: 'Base de Datos', titulo: 'Normalización de Bases de Datos', profesor: 'Prof. Rodríguez', duracion: '2:10:15', fecha: '2025-09-25', vistas: 98, link: '#' }
  ]);

  const [tareas, setTareas] = useState([
    { id: 1, titulo: 'Proyecto Final IA', curso: 'Inteligencia Artificial', fecha: '2025-10-05', estado: 'pendiente', descripcion: 'Implementar una red neuronal para clasificación de imágenes' },
    { id: 2, titulo: 'Taller JavaScript', curso: 'Programación Avanzada', fecha: '2025-10-03', estado: 'pendiente', descripcion: 'Resolver 10 ejercicios de programación funcional' },
    { id: 3, titulo: 'Diseño Mockup App', curso: 'Diseño de Interfaces', fecha: '2025-10-06', estado: 'entregada', descripcion: 'Crear mockup de aplicación móvil en Figma' }
  ]);

  const [examenes, setExamenes] = useState([
    { id: 1, titulo: 'Examen Parcial 2', curso: 'Programación Avanzada', duracion: 90, preguntas: [
        { id: 1, pregunta: '¿Qué es un patrón de diseño Singleton?', opciones: ['Un patrón que permite una sola instancia', 'Un patrón para múltiples objetos', 'Un patrón de herencia', 'Ninguna de las anteriores'], respuestaCorrecta: 0 },
        { id: 2, pregunta: '¿Cuál es la complejidad de búsqueda binaria?', opciones: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], respuestaCorrecta: 1 }
      ], fechaLimite: '2025-10-04 23:59', intentos: 1, estado: 'disponible' },
    { id: 2, titulo: 'Examen Parcial 1', curso: 'Programación Avanzada', estado: 'completado', calificacion: 9.2, fecha: '2025-09-20' }
  ]);

  const [calificaciones] = useState([
    { curso: 'Programación Avanzada', parcial1: 9.2, parcial2: 8.5, talleres: 9.0, proyecto: null, promedio: 8.9 },
    { curso: 'Diseño de Interfaces', parcial1: 8.8, parcial2: null, talleres: 9.2, proyecto: 8.5, promedio: 8.8 },
    { curso: 'Base de Datos', parcial1: 9.5, parcial2: 9.0, talleres: 8.8, proyecto: 9.2, promedio: 9.1 },
    { curso: 'Inteligencia Artificial', parcial1: 8.0, parcial2: null, talleres: 8.5, proyecto: null, promedio: 8.2 }
  ]);

  const [libros] = useState([
    { id: 1, titulo: 'Clean Code', autor: 'Robert C. Martin', categoria: 'Programación', disponible: true },
    { id: 2, titulo: 'Design Patterns', autor: 'Gang of Four', categoria: 'Programación', disponible: true },
    { id: 3, titulo: 'Deep Learning', autor: 'Ian Goodfellow', categoria: 'IA', disponible: false }
  ]);

  const [solicitudes, setSolicitudes] = useState([
    { id: 1, tipo: 'Certificado de Estudios', fecha: '2025-09-28', estado: 'Completado', respuesta: 'Descargable' },
    { id: 2, tipo: 'Homologación', fecha: '2025-09-20', estado: 'En proceso', respuesta: 'Pendiente' }
  ]);

  const [tramites, setTramites] = useState([
    { id: 1, tipo: 'Constancia de Estudios', fecha: '2025-10-01', estado: 'Completado', observaciones: 'Certificado para empresa', descripcion: 'Certificado de estudiante activo' },
    { id: 2, tipo: 'Retiro de Materia', fecha: '2025-09-25', estado: 'En proceso', observaciones: 'Motivos personales', descripcion: 'Solicitud para retirarse de una materia' },
    { id: 3, tipo: 'Solicitud de Beca', fecha: '2025-09-15', estado: 'Pendiente', observaciones: 'Documentación adjunta', descripcion: 'Gestiona tu solicitud de beca' }
  ]);

  const [tramitesDisponibles] = useState([
    { id: 1, nombre: 'Constancia de Estudios', descripcion: 'Certificado de estudiante activo' },
    { id: 2, nombre: 'Retiro de Materia', descripcion: 'Solicitud para retirarse de una materia' },
    { id: 3, nombre: 'Cambio de Horario', descripcion: 'Modificación de horario académico' },
    { id: 4, nombre: 'Solicitud de Beca', descripcion: 'Gestiona tu solicitud de beca' },
    { id: 5, nombre: 'Validación de Estudios', descripcion: 'Validación de estudios previos' },
    { id: 6, nombre: 'Reintegro', descripcion: 'Solicitud de reintegro financiero' },
    { id: 7, nombre: 'Homologación', descripcion: 'Homologación de materias' },
    { id: 8, nombre: 'Carta de Presentación', descripción: 'Carta institucional de presentación' }
  ]);

  const [anuncios] = useState([
    { id: 1, titulo: 'Inscripciones abiertas', descripcion: 'Proceso abierto del 15 al 30 de octubre', fecha: '2025-10-01', icono: '📢', color: 'border-red-500' },
    { id: 2, titulo: 'Hackathon 2025', descripcion: 'Premios hasta $5,000 USD', fecha: '2025-10-02', icono: '🏆', color: 'border-orange-500' },
    { id: 3, titulo: 'Nueva biblioteca digital', descripcion: 'Más de 10,000 recursos', fecha: '2025-10-03', icono: '📚', color: 'border-blue-500' }
  ]);

  const menuItems = [
    { id: 'inicio', icon: Home, label: 'Inicio' },
    { id: 'cursos', icon: BookOpen, label: 'Mis Cursos' },
    { id: 'clases', icon: Video, label: 'Clases' },
    { id: 'tareas', icon: FileText, label: 'Tareas' },
    { id: 'examenes', icon: ClipboardList, label: 'Exámenes' },
    { id: 'calificaciones', icon: Award, label: 'Calificaciones' },
    { id: 'mensajes', icon: Mail, label: 'Mensajes', badge: mensajes.filter(m => !m.leido).length },
    { id: 'foros', icon: MessageSquare, label: 'Foros' },
    { id: 'biblioteca', icon: BookOpen, label: 'Biblioteca' },
    { id: 'horarios', icon: Calendar, label: 'Horarios' },
    { id: 'finanzas', icon: DollarSign, label: 'Estado de Cuenta' },
    { id: 'solicitudes', icon: Send, label: 'Solicitudes' },
    { id: 'tramites', icon: FileCheck, label: 'Trámites' },
    { id: 'comunidad', icon: Users, label: 'Comunidad' },
    { id: 'certificados', icon: Award, label: 'Certificados' },
    { id: 'perfil', icon: User, label: 'Mi Perfil' }
  ];

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    if (tiempoRestante && tiempoRestante > 0) {
      const timer = setTimeout(() => setTiempoRestante(tiempoRestante - 1), 1000);
      return () => clearTimeout(timer);
    } else if (tiempoRestante === 0) {
      finalizarExamen();
    }
  }, [tiempoRestante]);

  const iniciarExamen = (examen) => {
    setExamenActivo(examen);
    setTiempoRestante(examen.duracion * 60);
    setRespuestasExamen({});
    setPreguntaActual(0);
  };

  const finalizarExamen = () => {
    if (!examenActivo) return;
    let correctas = 0;
    examenActivo.preguntas.forEach(pregunta => {
      if (respuestasExamen[pregunta.id] === pregunta.respuestaCorrecta) correctas++;
    });
    const calificacion = (correctas / examenActivo.preguntas.length * 10).toFixed(1);
    setExamenes(examenes.map(e => e.id === examenActivo.id ? { ...e, estado: 'completado', calificacion: parseFloat(calificacion), fecha: new Date().toISOString().split('T')[0] } : e));
    alert(`Examen finalizado!\nCalificación: ${calificacion}\nRespuestas correctas: ${correctas}/${examenActivo.preguntas.length}`);
    setExamenActivo(null);
    setRespuestasExamen({});
    setTiempoRestante(null);
  };

  const entregarTarea = (tareaId) => {
    if (!archivoTarea) {
      alert('Por favor selecciona un archivo');
      return;
    }
    setTareas(tareas.map(t => t.id === tareaId ? { ...t, estado: 'entregada' } : t));
    alert('Tarea entregada exitosamente!');
    setModalTarea(null);
    setArchivoTarea(null);
  };

  const enviarSolicitud = (datos) => {
    const nuevaSolicitud = {
      id: solicitudes.length + 1,
      tipo: tipoSolicitud,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'En proceso',
      respuesta: 'Pendiente'
    };
    setSolicitudes([nuevaSolicitud, ...solicitudes]);
    alert('Solicitud enviada exitosamente!');
    setModalSolicitud(false);
    setTipoSolicitud('');
  };

  const actualizarPerfil = () => {
    alert('Perfil actualizado!');
    setEditandoPerfil(false);
  };

  const enviarTramite = () => {
    if (!tipoTramite) {
      alert('Por favor selecciona un tipo de trámite');
      return;
    }
    
    const nuevoTramite = {
      id: tramites.length + 1,
      tipo: tipoTramite,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      observaciones: observacionesTramite || 'Sin observaciones',
      descripcion: tramitesDisponibles.find(t => t.nombre === tipoTramite)?.descripcion || ''
    };
    
    setTramites([nuevoTramite, ...tramites]);
    alert('Trámite enviado exitosamente!');
    setModalTramite(false);
    setTipoTramite('');
    setObservacionesTramite('');
  };

  const cancelarTramite = (tramiteId) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar este trámite?')) {
      setTramites(tramites.filter(t => t.id !== tramiteId));
      alert('Trámite cancelado');
    }
  };

  const renderCursos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${textColor}`}>Mis Cursos</h2>
      </div>
      
      {cursoDetalle ? (
        <div>
          <button onClick={() => { setCursoDetalle(null); setTemaSeleccionado(null); }} className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2">
            <ChevronLeft size={20} /> Volver a cursos
          </button>
          
          <div className={`${cardBg} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className={`text-2xl font-bold ${textColor}`}>{cursoDetalle.nombre}</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{cursoDetalle.profesor}</p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${textColor}`}>{cursoDetalle.progreso}%</p>
                <p className="text-sm text-gray-500">Completado</p>
              </div>
            </div>

            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 mb-6`}>
              <div className={`${cursoDetalle.color} h-3 rounded-full`} style={{ width: `${cursoDetalle.progreso}%` }}></div>
            </div>

            {!temaSeleccionado ? (
              <>
                <h4 className={`text-xl font-bold mb-4 ${textColor}`}>Temas del Curso</h4>
                <div className="space-y-3">
                  {cursoDetalle.temas.map(tema => (
                    <div key={tema.id} className={`border ${borderColor} rounded-lg p-4 cursor-pointer hover:shadow-md transition`} onClick={() => { setTemaSeleccionado(tema); setBloqueActivo(1); }}>
                      <div className="flex items-start gap-3">
                        {tema.completado ? (
                          <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                        ) : (
                          <Circle className="text-gray-400 flex-shrink-0" size={24} />
                        )}
                        <div className="flex-1">
                          <h5 className={`font-semibold ${textColor}`}>{tema.titulo}</h5>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {tema.bloques?.length || 0} bloques • {tema.materiales.length} materiales
                          </p>
                        </div>
                        <ChevronRight className="text-gray-400" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <button onClick={() => setTemaSeleccionado(null)} className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                  <ChevronLeft size={20} /> Volver a temas
                </button>

                <div className={`${cardBg} rounded-lg border ${borderColor} overflow-hidden`}>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <h3 className="text-2xl font-bold">{temaSeleccionado.titulo}</h3>
                  </div>

                  {temaSeleccionado.bloques && temaSeleccionado.bloques.length > 0 ? (
                    <>
                      <div className={`border-b ${borderColor} flex overflow-x-auto`}>
                        {temaSeleccionado.bloques.map((bloque, idx) => (
                          <button
                            key={bloque.id}
                            onClick={() => setBloqueActivo(bloque.id)}
                            className={`px-6 py-3 font-semibold whitespace-nowrap transition ${
                              bloqueActivo === bloque.id
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : `${darkMode ? 'text-gray-400' : 'text-gray-600'} hover:text-blue-600`
                            }`}
                          >
                            Bloque {idx + 1}
                          </button>
                        ))}
                      </div>

                      {temaSeleccionado.bloques.map(bloque => bloqueActivo === bloque.id && (
                        <div key={bloque.id} className="p-6 space-y-6">
                          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                            <h4 className="text-lg font-bold text-blue-900">{bloque.titulo}</h4>
                          </div>

                          <div>
                            <h5 className={`text-lg font-bold mb-3 ${textColor}`}>¿Qué vamos a aprender a hacer?</h5>
                            <ul className="space-y-2">
                              {bloque.objetivos.map((objetivo, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="text-blue-600 font-bold flex-shrink-0">▸</span>
                                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{objetivo}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-t pt-6">
                            <div className="flex justify-between items-center mb-4">
                              <h5 className={`text-xl font-bold ${textColor}`}>{bloque.titulo}</h5>
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-blue-50 rounded-full transition">
                                  <FileText size={20} className="text-blue-600" />
                                </button>
                                <button className="p-2 hover:bg-blue-50 rounded-full transition">
                                  <Download size={20} className="text-blue-600" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {bloque.temas.map((subtema, idx) => (
                                <div key={idx} className={`border ${borderColor} rounded-lg p-4 hover:shadow-md transition cursor-pointer group`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                        {idx + 1}
                                      </span>
                                      <span className={`font-semibold ${textColor}`}>{subtema.titulo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {subtema.tipo === 'video' && (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                          Video
                                        </span>
                                      )}
                                      {subtema.tipo === 'lectura' && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                          Lectura
                                        </span>
                                      )}
                                      <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 transition" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={`border-t ${borderColor} pt-6`}>
                            <button 
                              onClick={() => setExpandirIdeasClave(!expandirIdeasClave)}
                              className={`w-full flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg hover:shadow-md transition`}
                            >
                              <h5 className={`text-lg font-bold ${textColor}`}>IDEAS CLAVE</h5>
                              <ChevronRight size={24} className={`transition-transform ${expandirIdeasClave ? 'rotate-90' : ''}`} />
                            </button>
                            
                            {expandirIdeasClave && (
                              <div className="mt-4 space-y-2">
                                {bloque.ideasClave.map((idea) => (
                                  <div key={idea.numero} className={`border ${borderColor} rounded-lg p-3 hover:bg-blue-50 transition cursor-pointer`}>
                                    <div className="flex items-center gap-3">
                                      <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                        {idea.numero}
                                      </span>
                                      <span className={`font-medium ${textColor}`}>{idea.texto}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className={`border-t ${borderColor} pt-6`}>
                            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
                              <h5 className={`text-lg font-bold mb-3 ${textColor}`}>TEST</h5>
                              <button 
                                onClick={() => { setActiveSection('examenes'); setTemaSeleccionado(null); }}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                              >
                                <FileCheck size={20} />
                                Realizar el test
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-6">
                      <p className="text-gray-500 mb-4">Este tema aún no tiene bloques de contenido estructurados.</p>
                      
                      {temaSeleccionado.materiales && temaSeleccionado.materiales.length > 0 && (
                        <div>
                          <h5 className={`text-lg font-bold mb-3 ${textColor}`}>Materiales disponibles</h5>
                          <div className="space-y-2">
                            {temaSeleccionado.materiales.map((material, idx) => (
                              <div key={idx} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded flex items-center justify-between gap-3`}>
                                <div className="flex items-center gap-3">
                                  <FileText size={20} className="text-blue-600" />
                                  <span className={textColor}>{material}</span>
                                </div>
                                <button className="text-blue-600 hover:text-blue-700">
                                  <Download size={20} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cursos.map(curso => (
            <div key={curso.id} className={`${cardBg} rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition`} onClick={() => setCursoDetalle(curso)}>
              <h3 className={`text-xl font-bold mb-2 ${textColor}`}>{curso.nombre}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{curso.profesor}</p>
              <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mb-3`}>
                <div className={`${curso.color} h-2 rounded-full`} style={{ width: `${curso.progreso}%` }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Progreso: {curso.progreso}%</span>
                <span className="text-blue-600">{curso.temas.length} temas</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderClases = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${textColor}`}>Clases</h2>
        <div className="flex gap-2">
          <button onClick={() => setTipoClase('vivo')} className={`px-4 py-2 rounded ${tipoClase === 'vivo' ? 'bg-red-600 text-white' : `border ${borderColor}`}`}>
            <span className="flex items-center gap-2"><Circle className="fill-current" size={12} /> En Vivo</span>
          </button>
          <button onClick={() => setTipoClase('grabadas')} className={`px-4 py-2 rounded ${tipoClase === 'grabadas' ? 'bg-blue-600 text-white' : `border ${borderColor}`}`}>
            <span className="flex items-center gap-2"><Play size={16} /> Grabadas</span>
          </button>
        </div>
      </div>

      {tipoClase === 'vivo' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clasesVivo.map(clase => (
            <div key={clase.id} className={`${cardBg} rounded-lg shadow p-6`}>
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  🔴 Próxima
                </span>
                <Users size={16} className="text-gray-500" />
              </div>
              <h3 className={`font-bold mb-2 ${textColor}`}>{clase.titulo}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{clase.curso}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{clase.profesor}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Clock size={16} />
                <span>{clase.hora}</span>
              </div>
              <button onClick={() => alert(`Conectando a: ${clase.titulo}`)} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                <Video size={18} /> Unirse a la clase
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clasesGrabadas.map(clase => (
            <div key={clase.id} className={`${cardBg} rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer`}>
              <div className="flex gap-4">
                <div className="w-40 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                  <Play size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold mb-1 ${textColor}`}>{clase.titulo}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{clase.curso}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{clase.profesor}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={14} />{clase.duracion}</span>
                    <span className="flex items-center gap-1"><Eye size={14} />{clase.vistas} vistas</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTareas = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${textColor}`}>Tareas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tareas.map(tarea => (
          <div key={tarea.id} className={`${cardBg} rounded-lg shadow p-6 border-l-4 ${tarea.estado === 'pendiente' ? 'border-orange-500' : 'border-green-500'}`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className={`text-lg font-bold ${textColor}`}>{tarea.titulo}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tarea.estado === 'pendiente' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                {tarea.estado === 'pendiente' ? 'Pendiente' : 'Entregada'}
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{tarea.curso}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>{tarea.descripcion}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Vence: {tarea.fecha}</span>
              {tarea.estado === 'pendiente' && (
                <button onClick={() => setModalTarea(tarea)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                  Entregar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalTarea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setModalTarea(null)}>
          <div className={`${cardBg} rounded-lg p-6 max-w-lg w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 ${textColor}`}>Entregar Tarea</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{modalTarea.titulo}</p>
            <input type="file" onChange={(e) => setArchivoTarea(e.target.files[0])} className="mb-4 w-full" />
            <div className="flex gap-3">
              <button onClick={() => entregarTarea(modalTarea.id)} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Enviar
              </button>
              <button onClick={() => setModalTarea(null)} className={`flex-1 border ${borderColor} py-2 rounded`}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderExamenes = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${textColor}`}>Exámenes</h2>
      
      {examenActivo ? (
        <div className={`${cardBg} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${textColor}`}>{examenActivo.titulo}</h3>
            <div className="text-2xl font-bold text-red-600">
              {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Pregunta {preguntaActual + 1} de {examenActivo.preguntas.length}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((preguntaActual + 1) / examenActivo.preguntas.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className={`text-lg font-semibold ${textColor}`}>{examenActivo.preguntas[preguntaActual].pregunta}</h4>
            <div className="space-y-2">
              {examenActivo.preguntas[preguntaActual].opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  onClick={() => setRespuestasExamen({ ...respuestasExamen, [examenActivo.preguntas[preguntaActual].id]: idx })}
                  className={`w-full p-3 rounded border-2 transition ${
                    respuestasExamen[examenActivo.preguntas[preguntaActual].id] === idx
                      ? 'border-blue-600 bg-blue-50'
                      : `${borderColor} hover:border-blue-300`
                  }`}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setPreguntaActual(Math.max(0, preguntaActual - 1))}
              disabled={preguntaActual === 0}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            {preguntaActual < examenActivo.preguntas.length - 1 ? (
              <button onClick={() => setPreguntaActual(preguntaActual + 1)} className="px-4 py-2 bg-blue-600 text-white rounded">
                Siguiente
              </button>
            ) : (
              <button onClick={finalizarExamen} className="px-4 py-2 bg-green-600 text-white rounded">
                Finalizar Examen
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {examenes.map(examen => (
            <div key={examen.id} className={`${cardBg} rounded-lg shadow p-6`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className={`text-lg font-bold ${textColor}`}>{examen.titulo}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  examen.estado === 'disponible' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {examen.estado === 'disponible' ? 'Disponible' : 'Completado'}
                </span>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{examen.curso}</p>
              {examen.estado === 'disponible' ? (
                <>
                  <div className="flex gap-4 text-sm text-gray-500 mb-4">
                    <span>⏱️ {examen.duracion} min</span>
                    <span>📝 {examen.preguntas?.length} preguntas</span>
                  </div>
                  <button onClick={() => iniciarExamen(examen)} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Iniciar Examen
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <p className={`text-3xl font-bold mb-2 ${textColor}`}>{examen.calificacion}</p>
                  <p className="text-sm text-gray-500">Realizado: {examen.fecha}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCalificaciones = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${textColor}`}>Calificaciones</h2>
      
      <div className={`${cardBg} rounded-lg shadow overflow-hidden`}>
        <table className="w-full">
          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Curso</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase">Parcial 1</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase">Parcial 2</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase">Talleres</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase">Promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {calificaciones.map((cal, idx) => (
              <tr key={idx} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 font-semibold ${textColor}`}>{cal.curso}</td>
                <td className="px-6 py-4 text-center">{cal.parcial1 || '-'}</td>
                <td className="px-6 py-4 text-center">{cal.parcial2 || '-'}</td>
                <td className="px-6 py-4 text-center">{cal.talleres || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-bold ${cal.promedio >= 9 ? 'text-green-600' : 'text-blue-600'}`}>
                    {cal.promedio}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${cardBg} rounded-lg shadow p-6 text-center`}>
        <h3 className={`text-xl font-bold mb-4 ${textColor}`}>Promedio General</h3>
        <p className="text-5xl font-bold text-blue-600">8.7</p>
      </div>
    </div>
  );

  const renderBiblioteca = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${textColor}`}>Biblioteca Virtual</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {libros.map(libro => (
          <div key={libro.id} className={`${cardBg} rounded-lg shadow p-6`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <BookOpen className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <h3 className={`font-bold mb-1 ${textColor}`}>{libro.titulo}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{libro.autor}</p>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{libro.categoria}</span>
              </div>
            </div>
            <button
              disabled={!libro.disponible}
              className={`w-full py-2 rounded ${libro.disponible ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {libro.disponible ? 'Descargar' : 'No disponible'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHorarios = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${textColor}`}>Mi Horario</h2>
      
      <div className={`${cardBg} rounded-lg shadow overflow-hidden`}>
        <table className="w-full">
          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className="px-4 py-3 text-left">Hora</th>
              <th className="px-4 py-3 text-center">Lunes</th>
              <th className="px-4 py-3 text-center">Martes</th>
              <th className="px-4 py-3 text-center">Miércoles</th>
              <th className="px-4 py-3 text-center">Jueves</th>
              <th className="px-4 py-3 text-center">Viernes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 font-semibold">14:00 - 16:00</td>
              <td className="px-4 py-3 text-center"><div className="bg-blue-100 text-blue-700 p-2 rounded text-sm">Prog. Avanzada</div></td>
              <td></td>
              <td className="px-4 py-3 text-center"><div className="bg-blue-100 text-blue-700 p-2 rounded text-sm">Prog. Avanzada</div></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">18:00 - 20:00</td>
              <td className="px-4 py-3 text-center"><div className="bg-orange-100 text-orange-700 p-2 rounded text-sm">IA</div></td>
              <td></td>
              <td className="px-4 py-3 text-center"><div className="bg-orange-100 text-orange-700 p-2 rounded text-sm">IA</div></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFinanzas = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${textColor}`}>Estado de Cuenta</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardBg} rounded-lg shadow p-6 border-l-4 border-green-500`}>
          <p className="text-sm text-gray-500">Pagos Realizados</p>
          <p className={`text-3xl font-bold ${textColor}`}>$3,500</p>
        </div>
        <div className={`${cardBg} rounded-lg shadow p-6 border-l-4 border-orange-500`}>
          <p className="text-sm text-gray-500">Saldo Pendiente</p>
          <p className={`text-3xl font-bold ${textColor}`}>$1,200</p>
        </div>
        <div className={`${cardBg} rounded-lg shadow p-6 border-l-4 border-blue-500`}>
          <p className="text-sm text-gray-500">Próximo Vencimiento</p>
          <p className={`text-3xl font-bold ${textColor}`}>Oct 10</p>
        </div>
      </div>
    </div>
  );

  const renderSolicitudes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${textColor}`}>Mis Solicitudes</h2>
        <button onClick={() => setModalSolicitud(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Nueva Solicitud
        </button>
      </div>

      <div className="space-y-4">
        {solicitudes.map(sol => (
          <div key={sol.id} className={`${cardBg} rounded-lg shadow p-6 border-l-4 ${sol.estado === 'Completado' ? 'border-green-500' : 'border-orange-500'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-bold ${textColor}`}>{sol.tipo}</h3>
                <p className="text-sm text-gray-500">Fecha: {sol.fecha}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sol.estado === 'Completado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {sol.estado}
              </span>
            </div>
            {sol.estado === 'Completado' && (
              <button className="mt-3 text-blue-600 hover:text-blue-700 flex items-center gap-2">
                <Download size={16} /> Descargar
              </button>
            )}
          </div>
        ))}
      </div>

      {modalSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setModalSolicitud(false)}>
          <div className={`${cardBg} rounded-lg p-6 max-w-lg w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 ${textColor}`}>Nueva Solicitud</h3>
            <select value={tipoSolicitud} onChange={(e) => setTipoSolicitud(e.target.value)} className={`w-full p-2 border ${borderColor} rounded mb-4`}>
              <option value="">Selecciona tipo...</option>
              <option>Certificado de Estudios</option>
              <option>Constancia de Notas</option>
              <option>Homologación</option>
            </select>
            <textarea placeholder="Detalles..." rows="4" className={`w-full p-2 border ${borderColor} rounded mb-4`}></textarea>
            <div className="flex gap-3">
              <button onClick={enviarSolicitud} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Enviar
              </button>
              <button onClick={() => setModalSolicitud(false)} className={`flex-1 border ${borderColor} py-2 rounded`}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderForos = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${textColor}`}>Foros de Discusión</h2>
      
      {cursos.map(curso => (
        <div key={curso.id} className={`${cardBg} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${textColor}`}>{curso.nombre} - Foro</h3>
          <div className="space-y-3 mb-4">
            <div className={`border ${borderColor} rounded p-3`}>
              <p className="font-semibold text-sm">Estudiante 1</p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>¿Alguien puede explicar el patrón Observer?</p>
              <span className="text-xs text-gray-500">Hace 2 horas</span>
            </div>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Escribe tu mensaje..." className={`flex-1 p-2 border ${borderColor} rounded`} />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <Send size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderComunidad = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${textColor}`}>Comunidad Estudiantil</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${cardBg} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${textColor}`}>Grupos de Estudio</h3>
          <div className="space-y-3">
            {['Grupo IA y ML', 'Club de Programación'].map((grupo, idx) => (
              <div key={idx} className={`border ${borderColor} rounded p-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={20} />
                  <div>
                    <p className={`font-semibold ${textColor}`}>{grupo}</p>
                    <p className="text-xs text-gray-500">{15 + idx * 5} miembros</p>
                  </div>
                </div>
                <button className="text-blue-600 text-sm">Unirse</button>
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardBg} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${textColor}`}>Eventos Próximos</h3>
          <div className="space-y-3">
            {[
              { evento: 'Hackathon 2025', fecha: '15 Oct' },
              { evento: 'Conferencia IA', fecha: '20 Oct' }
            ].map((evento, idx) => (
              <div key={idx} className={`border ${borderColor} rounded p-3`}>
                <p className={`font-semibold ${textColor}`}>{evento.evento}</p>
                <p className="text-sm text-gray-500">{evento.fecha}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCertificados = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${textColor}`}>Mis Certificados</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cursos.filter(c => c.progreso >= 85).map(curso => (
          <div key={curso.id} className={`${cardBg} rounded-lg shadow p-6 border-l-4 ${curso.color}`}>
            <Award className="text-blue-600 mb-3" size={32} />
            <h3 className={`font-bold mb-2 ${textColor}`}>{curso.nombre}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Curso completado al {curso.progreso}%</p>
            <button onClick={() => alert(`Descargando certificado de ${curso.nombre}`)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <Download size={16} /> Descargar Certificado
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTramites = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${textColor}`}>Mis Trámites</h2>
        <button 
          onClick={() => setModalTramite(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Send size={18} />
          Nuevo Trámite
        </button>
      </div>

      <div className="space-y-4">
        {tramites.map(tramite => (
          <div 
            key={tramite.id} 
            className={`${cardBg} rounded-lg shadow p-6 border-l-4 ${
              tramite.estado === 'Completado' ? 'border-green-500' : 
              tramite.estado === 'En proceso' ? 'border-orange-500' : 
              'border-gray-500'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${textColor} mb-1`}>{tramite.tipo}</h3>
                <p className="text-sm text-gray-500 mb-2">Fecha de solicitud: {tramite.fecha}</p>
                {tramite.observaciones && (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    <span className="font-semibold">Observaciones:</span> {tramite.observaciones}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                tramite.estado === 'Completado' ? 'bg-green-100 text-green-700' : 
                tramite.estado === 'En proceso' ? 'bg-orange-100 text-orange-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {tramite.estado}
              </span>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setTramiteDetalle(tramite)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <Eye size={16} />
                Ver detalles
              </button>
              {tramite.estado === 'En proceso' && (
                <button 
                  onClick={() => cancelarTramite(tramite.id)}
                  className={`border ${borderColor} px-4 py-2 rounded hover:bg-gray-50 text-sm`}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}

        {tramites.length === 0 && (
          <div className={`${cardBg} rounded-lg shadow p-12 text-center`}>
            <FileCheck size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No tienes trámites registrados</p>
            <button 
              onClick={() => setModalTramite(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Crear primer trámite
            </button>
          </div>
        )}
      </div>

      {modalTramite && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={() => setModalTramite(false)}
        >
          <div 
            className={`${cardBg} rounded-lg p-6 max-w-lg w-full mx-4`} 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-xl font-bold mb-4 ${textColor}`}>Nueva Solicitud de Trámite</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold">Tipo de trámite *</label>
                <select 
                  value={tipoTramite} 
                  onChange={(e) => setTipoTramite(e.target.value)} 
                  className={`w-full p-2 border ${borderColor} rounded`}
                >
                  <option value="">Selecciona un trámite...</option>
                  {tramitesDisponibles.map(t => (
                    <option key={t.id} value={t.nombre}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold">Observaciones</label>
                <textarea 
                  value={observacionesTramite}
                  onChange={(e) => setObservacionesTramite(e.target.value)}
                  placeholder="Escribe comentarios o detalles adicionales sobre tu solicitud..."
                  rows="4" 
                  className={`w-full p-2 border ${borderColor} rounded`}
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={enviarTramite}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
              >
                Enviar
              </button>
              <button 
                onClick={() => {
                  setModalTramite(false);
                  setTipoTramite('');
                  setObservacionesTramite('');
                }}
                className={`flex-1 border ${borderColor} py-2 rounded hover:bg-gray-50 font-semibold`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {tramiteDetalle && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={() => setTramiteDetalle(null)}
        >
          <div 
            className={`${cardBg} rounded-lg p-6 max-w-2xl w-full mx-4`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-2xl font-bold ${textColor}`}>Detalle del Trámite</h3>
              <button onClick={() => setTramiteDetalle(null)}>
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tipo de trámite</p>
                <p className={`font-bold text-lg ${textColor}`}>{tramiteDetalle.tipo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fecha de solicitud</p>
                  <p className={`font-semibold ${textColor}`}>{tramiteDetalle.fecha}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estado</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    tramiteDetalle.estado === 'Completado' ? 'bg-green-100 text-green-700' : 
                    tramiteDetalle.estado === 'En proceso' ? 'bg-orange-100 text-orange-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {tramiteDetalle.estado}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Descripción</p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {tramiteDetalle.descripcion}
                </p>
              </div>

              {tramiteDetalle.observaciones && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Observaciones</p>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded`}>
                    <p className={textColor}>{tramiteDetalle.observaciones}</p>
                  </div>
                </div>
              )}

              <div className={`border-t ${borderColor} pt-4 mt-4`}>
                <p className="text-sm text-gray-500 mb-2">Historial de seguimiento</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className={`text-sm ${textColor}`}>Trámite recibido</p>
                      <p className="text-xs text-gray-500">{tramiteDetalle.fecha}</p>
                    </div>
                  </div>
                  {tramiteDetalle.estado !== 'Pendiente' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className={`text-sm ${textColor}`}>En revisión</p>
                        <p className="text-xs text-gray-500">En proceso</p>
                      </div>
                    </div>
                  )}
                  {tramiteDetalle.estado === 'Completado' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className={`text-sm ${textColor}`}>Completado</p>
                        <p className="text-xs text-gray-500">Trámite finalizado</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setTramiteDetalle(null)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMensajes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${textColor}`}>Mensajes</h2>
        <button onClick={() => setNuevoMensajeModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Nuevo Mensaje
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardBg} rounded-lg shadow p-4`}>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {mensajes.map(mensaje => (
              <div 
                key={mensaje.id} 
                className={`p-3 rounded cursor-pointer transition ${
                  conversacionActiva?.id === mensaje.id ? 'bg-blue-100' : mensaje.leido ? 'hover:bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-600'
                }`}
                onClick={() => setConversacionActiva(mensaje)}
              >
                <p className="font-semibold text-sm">{mensaje.remitente}</p>
                <p className="text-sm text-blue-600 truncate">{mensaje.asunto}</p>
                <p className="text-xs text-gray-500 truncate">{mensaje.preview}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 ${cardBg} rounded-lg shadow p-6`}>
          {conversacionActiva ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className={`text-xl font-bold ${textColor}`}>{conversacionActiva.remitente}</h3>
                <h4 className={`text-lg font-semibold ${textColor}`}>{conversacionActiva.asunto}</h4>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p>{conversacionActiva.preview}</p>
              </div>
              <div className="pt-4 border-t">
                <textarea placeholder="Escribe tu respuesta..." rows="4" className={`w-full p-3 border ${borderColor} rounded`}></textarea>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Enviar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Selecciona un mensaje para ver su contenido</p>
            </div>
          )}
        </div>
      </div>

      {nuevoMensajeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setNuevoMensajeModal(false)}>
          <div className={`${cardBg} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-2xl font-bold ${textColor}`}>Nuevo Mensaje</h3>
              <button onClick={() => setNuevoMensajeModal(false)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <select className={`w-full p-2 border ${borderColor} rounded`}>
                <option>Seleccionar destinatario...</option>
                {cursos.map(c => <option key={c.id}>{c.profesor}</option>)}
              </select>
              <input type="text" placeholder="Asunto" className={`w-full p-2 border ${borderColor} rounded`} />
              <textarea rows="8" placeholder="Mensaje..." className={`w-full p-2 border ${borderColor} rounded`}></textarea>
              <button onClick={() => { alert('Mensaje enviado'); setNuevoMensajeModal(false); }} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInicio = () => (
    <div className="space-y-6">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">¡Bienvenido, Estudiante!</h2>
        <p className="opacity-90">
          Tienes {tareas.filter(t => t.estado === 'pendiente').length} tareas pendientes, {clasesVivo.length} clases hoy y {mensajes.filter(m => !m.leido).length} mensajes nuevos
        </p>
      </div>

      {/* Anuncios */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={20} className={textColor} />
          <h3 className={`text-lg font-bold ${textColor}`}>Anuncios</h3>
        </div>
        <div className="space-y-3">
          {anuncios.map(anuncio => (
            <div key={anuncio.id} className={`${cardBg} rounded-lg shadow-sm p-4 border-l-4 ${anuncio.color} hover:shadow-md transition cursor-pointer`}>
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{anuncio.icono}</div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold ${textColor} mb-1`}>{anuncio.titulo}</h4>
                  <p className="text-xs text-gray-500 mb-2">{anuncio.fecha}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{anuncio.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas - 4 tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Promedio General */}
        <div className={`${cardBg} rounded-lg shadow-sm p-5 border-l-4 border-blue-500 hover:shadow-md transition cursor-pointer`} onClick={() => setActiveSection('calificaciones')}>
          <p className="text-sm text-gray-500 mb-2">Promedio General</p>
          <div className="flex items-center justify-between">
            <p className={`text-4xl font-bold ${textColor}`}>8.7</p>
            <TrendingUp className="text-blue-500" size={36} />
          </div>
        </div>

        {/* Cursos Activos */}
        <div className={`${cardBg} rounded-lg shadow-sm p-5 border-l-4 border-green-500 hover:shadow-md transition cursor-pointer`} onClick={() => setActiveSection('cursos')}>
          <p className="text-sm text-gray-500 mb-2">Cursos Activos</p>
          <div className="flex items-center justify-between">
            <p className={`text-4xl font-bold ${textColor}`}>{cursos.length}</p>
            <BookOpen className="text-green-500" size={36} />
          </div>
        </div>

        {/* Mensajes */}
        <div className={`${cardBg} rounded-lg shadow-sm p-5 border-l-4 border-red-500 hover:shadow-md transition cursor-pointer`} onClick={() => setActiveSection('mensajes')}>
          <p className="text-sm text-gray-500 mb-2">Mensajes</p>
          <div className="flex items-center justify-between">
            <p className={`text-4xl font-bold ${textColor}`}>{mensajes.filter(m => !m.leido).length}</p>
            <Mail className="text-red-500" size={36} />
          </div>
        </div>

        {/* Clases Hoy */}
        <div className={`${cardBg} rounded-lg shadow-sm p-5 border-l-4 border-purple-500 hover:shadow-md transition cursor-pointer`} onClick={() => setActiveSection('clases')}>
          <p className="text-sm text-gray-500 mb-2">Clases Hoy</p>
          <div className="flex items-center justify-between">
            <p className={`text-4xl font-bold ${textColor}`}>{clasesVivo.length}</p>
            <Video className="text-purple-500" size={36} />
          </div>
        </div>
      </div>

      {/* Mis Cursos */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={20} className={textColor} />
          <h3 className={`text-lg font-bold ${textColor}`}>Mis Cursos</h3>
        </div>
        <div className={`${cardBg} rounded-lg shadow-sm overflow-hidden`}>
          {cursos.map((curso, index) => (
            <div 
              key={curso.id} 
              className={`p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${index !== cursos.length - 1 ? `border-b ${borderColor}` : ''}`}
              onClick={() => { setCursoDetalle(curso); setActiveSection('cursos'); }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className={`font-bold ${textColor}`}>{curso.nombre}</h4>
                <span className="text-sm font-semibold text-gray-500">{curso.progreso}%</span>
              </div>
              
              <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mb-3`}>
                <div className={`${curso.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${curso.progreso}%` }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>{curso.proximaClase}</span>
                </div>
                {curso.tareasPendientes > 0 && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                    {curso.tareasPendientes} {curso.tareasPendientes === 1 ? 'tarea' : 'tareas'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mensajes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail size={20} className={textColor} />
            <h3 className={`text-lg font-bold ${textColor}`}>Mensajes</h3>
          </div>
          {mensajes.filter(m => !m.leido).length > 0 && (
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
              {mensajes.filter(m => !m.leido).length} nuevos
            </span>
          )}
        </div>
        <div className={`${cardBg} rounded-lg shadow-sm overflow-hidden`}>
          {mensajes.filter(m => !m.leido).length > 0 ? (
            mensajes.filter(m => !m.leido).slice(0, 3).map((mensaje, index) => (
              <div 
                key={mensaje.id} 
                className={`border-l-4 border-blue-500 p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition ${index !== mensajes.filter(m => !m.leido).length - 1 && index !== 2 ? `border-b ${borderColor}` : ''}`}
                onClick={() => setActiveSection('mensajes')}
              >
                <p className={`font-bold ${textColor} text-sm mb-1`}>{mensaje.remitente}</p>
                <p className="text-blue-600 text-xs font-medium mb-1">{mensaje.asunto}</p>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <Mail size={40} className="mx-auto mb-3 text-gray-400 opacity-50" />
              <p className="text-gray-500 text-sm">No tienes mensajes nuevos</p>
            </div>
          )}
        </div>
      </div>

      {/* Tareas */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className={textColor} />
          <h3 className={`text-lg font-bold ${textColor}`}>Tareas</h3>
        </div>
        <div className={`${cardBg} rounded-lg shadow-sm overflow-hidden`}>
          {tareas.filter(t => t.estado === 'pendiente').length > 0 ? (
            tareas.filter(t => t.estado === 'pendiente').slice(0, 3).map((tarea, index) => (
              <div 
                key={tarea.id} 
                className={`border-l-4 border-orange-500 p-4 cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-700 transition ${index !== tareas.filter(t => t.estado === 'pendiente').length - 1 && index !== 2 ? `border-b ${borderColor}` : ''}`}
                onClick={() => setActiveSection('tareas')}
              >
                <p className={`font-bold ${textColor} text-sm mb-1`}>{tarea.titulo}</p>
                <p className="text-orange-600 text-xs font-medium">Vence: {tarea.fecha}</p>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <CheckCircle size={40} className="mx-auto mb-3 text-green-500 opacity-50" />
              <p className="text-gray-500 text-sm">¡Excelente! No tienes tareas pendientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${textColor}`}>Mi Perfil</h2>
        <div className="text-sm text-gray-500">Última actualización: 12/07/2025</div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className={`${cardBg} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${textColor}`}>Información personal</h3>
            {!editandoPerfil && (
              <button 
                onClick={() => setEditandoPerfil(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <User size={18} />
                Editar Perfil
              </button>
            )}
          </div>
          
          {editandoPerfil ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold">Primer nombre *</label>
                <input 
                  type="text" 
                  value={datosPerfil.primerNombre}
                  onChange={(e) => setDatosPerfil({...datosPerfil, primerNombre: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Segundo nombre</label>
                <input 
                  type="text" 
                  value={datosPerfil.segundoNombre}
                  onChange={(e) => setDatosPerfil({...datosPerfil, segundoNombre: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Primer apellido *</label>
                <input 
                  type="text" 
                  value={datosPerfil.primerApellido}
                  onChange={(e) => setDatosPerfil({...datosPerfil, primerApellido: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Segundo apellido</label>
                <input 
                  type="text" 
                  value={datosPerfil.segundoApellido}
                  onChange={(e) => setDatosPerfil({...datosPerfil, segundoApellido: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Tipo de identificación *</label>
                <select 
                  value={datosPerfil.tipoIdentificacion}
                  onChange={(e) => setDatosPerfil({...datosPerfil, tipoIdentificacion: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <option>C.C.</option>
                  <option>T.I.</option>
                  <option>C.E.</option>
                  <option>Pasaporte</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Número de identificación *</label>
                <input 
                  type="text" 
                  value={datosPerfil.numeroIdentificacion}
                  onChange={(e) => setDatosPerfil({...datosPerfil, numeroIdentificacion: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Sexo *</label>
                <select 
                  value={datosPerfil.sexo}
                  onChange={(e) => setDatosPerfil({...datosPerfil, sexo: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <option>Masculino</option>
                  <option>Femenino</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Correo electrónico *</label>
                <input 
                  type="email" 
                  value={datosPerfil.email}
                  onChange={(e) => setDatosPerfil({...datosPerfil, email: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Teléfono *</label>
                <input 
                  type="tel" 
                  value={datosPerfil.telefono}
                  onChange={(e) => setDatosPerfil({...datosPerfil, telefono: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Celular *</label>
                <input 
                  type="tel" 
                  value={datosPerfil.celular}
                  onChange={(e) => setDatosPerfil({...datosPerfil, celular: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Fecha de nacimiento *</label>
                <input 
                  type="date" 
                  value={datosPerfil.fechaNacimiento}
                  onChange={(e) => setDatosPerfil({...datosPerfil, fechaNacimiento: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Lugar de nacimiento</label>
                <input 
                  type="text" 
                  value={datosPerfil.lugarNacimiento}
                  onChange={(e) => setDatosPerfil({...datosPerfil, lugarNacimiento: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Dirección</label>
                <input 
                  type="text" 
                  value={datosPerfil.direccion}
                  onChange={(e) => setDatosPerfil({...datosPerfil, direccion: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Lugar de residencia</label>
                <input 
                  type="text" 
                  value={datosPerfil.lugarResidencia}
                  onChange={(e) => setDatosPerfil({...datosPerfil, lugarResidencia: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Barrio</label>
                <input 
                  type="text" 
                  value={datosPerfil.barrio}
                  onChange={(e) => setDatosPerfil({...datosPerfil, barrio: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><p className="text-sm text-gray-500 mb-1">Primer nombre *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.primerNombre}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Segundo nombre</p><p className={`font-semibold ${textColor}`}>{datosPerfil.segundoNombre}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Primer apellido *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.primerApellido}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Segundo apellido</p><p className={`font-semibold ${textColor}`}>{datosPerfil.segundoApellido}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Tipo de identificación *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.tipoIdentificacion}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Número de identificación *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.numeroIdentificacion}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Sexo *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.sexo}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Correo electrónico *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.email}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Teléfono *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.telefono}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Celular *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.celular}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Fecha de nacimiento *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.fechaNacimiento}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Lugar de nacimiento</p><p className={`font-semibold ${textColor}`}>{datosPerfil.lugarNacimiento}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Dirección</p><p className={`font-semibold ${textColor}`}>{datosPerfil.direccion}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Lugar de residencia</p><p className={`font-semibold ${textColor}`}>{datosPerfil.lugarResidencia}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Barrio</p><p className={`font-semibold ${textColor}`}>{datosPerfil.barrio}</p></div>
            </div>
          )}
        </div>

        <div className={`${cardBg} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-6 ${textColor}`}>Información adicional (SNIES)</h3>
          
          {editandoPerfil ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold">Zona</label>
                <select value={datosPerfil.zona} onChange={(e) => setDatosPerfil({...datosPerfil, zona: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>Urbana</option>
                  <option>Rural</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Estrato</label>
                <select value={datosPerfil.estrato} onChange={(e) => setDatosPerfil({...datosPerfil, estrato: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Medio de transporte</label>
                <select value={datosPerfil.medioTransporte} onChange={(e) => setDatosPerfil({...datosPerfil, medioTransporte: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>Seleccione</option>
                  <option>Transporte público</option>
                  <option>Vehículo particular</option>
                  <option>Bicicleta</option>
                  <option>A pie</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Grupo Sisbén</label>
                <select value={datosPerfil.grupoSisben} onChange={(e) => setDatosPerfil({...datosPerfil, grupoSisben: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>Seleccione</option>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Subgrupo Sisbén</label>
                <select value={datosPerfil.subgrupoSisben} onChange={(e) => setDatosPerfil({...datosPerfil, subgrupoSisben: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>Seleccione</option>
                  <option>A1</option>
                  <option>A2</option>
                  <option>B1</option>
                  <option>B2</option>
                  <option>C1</option>
                  <option>C2</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Fecha de expedición de documento *</label>
                <input 
                  type="date" 
                  value={datosPerfil.fechaExpedicionDoc}
                  onChange={(e) => setDatosPerfil({...datosPerfil, fechaExpedicionDoc: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Expedición documento</label>
                <input 
                  type="text" 
                  value={datosPerfil.expedicionDocumento}
                  onChange={(e) => setDatosPerfil({...datosPerfil, expedicionDocumento: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Tipo de sangre</label>
                <select value={datosPerfil.tipoSangre} onChange={(e) => setDatosPerfil({...datosPerfil, tipoSangre: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Estado civil</label>
                <select value={datosPerfil.estadoCivil} onChange={(e) => setDatosPerfil({...datosPerfil, estadoCivil: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>Unión libre</option>
                  <option>Soltero(a)</option>
                  <option>Casado(a)</option>
                  <option>Divorciado(a)</option>
                  <option>Viudo(a)</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Número de hijos</label>
                <input 
                  type="number" 
                  value={datosPerfil.numeroHijos}
                  onChange={(e) => setDatosPerfil({...datosPerfil, numeroHijos: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">EPS</label>
                <select value={datosPerfil.eps} onChange={(e) => setDatosPerfil({...datosPerfil, eps: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>36) Sanitas EPS</option>
                  <option>Sura</option>
                  <option>Compensar</option>
                  <option>Salud Total</option>
                  <option>Nueva EPS</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">ARS</label>
                <select value={datosPerfil.ars} onChange={(e) => setDatosPerfil({...datosPerfil, ars: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>Seleccione</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Aseguradora</label>
                <select value={datosPerfil.aseguradora} onChange={(e) => setDatosPerfil({...datosPerfil, aseguradora: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>Seleccione</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Número libreta militar</label>
                <input 
                  type="text" 
                  value={datosPerfil.numeroLibretaMilitar}
                  onChange={(e) => setDatosPerfil({...datosPerfil, numeroLibretaMilitar: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Nivel de formación</label>
                <select value={datosPerfil.nivelFormacion} onChange={(e) => setDatosPerfil({...datosPerfil, nivelFormacion: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>Seleccione</option>
                  <option>Pregrado</option>
                  <option>Posgrado</option>
                  <option>Maestría</option>
                  <option>Doctorado</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Ocupación</label>
                <select value={datosPerfil.ocupacion} onChange={(e) => setDatosPerfil({...datosPerfil, ocupacion: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>Seleccione</option>
                  <option>Estudiante</option>
                  <option>Empleado</option>
                  <option>Independiente</option>
                  <option>Desempleado</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Discapacidad</label>
                <select value={datosPerfil.discapacidad} onChange={(e) => setDatosPerfil({...datosPerfil, discapacidad: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>No Aplica</option>
                  <option>Visual</option>
                  <option>Auditiva</option>
                  <option>Motriz</option>
                  <option>Cognitiva</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Capacidad excepcional</label>
                <select value={datosPerfil.capacidadExcepcional} onChange={(e) => setDatosPerfil({...datosPerfil, capacidadExcepcional: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>No aplica</option>
                  <option>Sí aplica</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Grupo étnico</label>
                <select value={datosPerfil.grupoEtnico} onChange={(e) => setDatosPerfil({...datosPerfil, grupoEtnico: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>No Informa</option>
                  <option>Indígena</option>
                  <option>Afrodescendiente</option>
                  <option>Raizal</option>
                  <option>ROM</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Pueblo indígena</label>
                <select value={datosPerfil.puebloIndigena} onChange={(e) => setDatosPerfil({...datosPerfil, puebloIndigena: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>No informa</option>
                  <option>Wayúu</option>
                  <option>Emberá</option>
                  <option>Nasa</option>
                  <option>Zenú</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Comunidad negra</label>
                <select value={datosPerfil.comunidadNegra} onChange={(e) => setDatosPerfil({...datosPerfil, comunidadNegra: e.target.value})} className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>No Aplica</option>
                  <option>Sí Aplica</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Código PRUEBA SABER 11</label>
                <input 
                  type="text" 
                  value={datosPerfil.codigoPruebaSaber}
                  onChange={(e) => setDatosPerfil({...datosPerfil, codigoPruebaSaber: e.target.value})}
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Colegio</label>
                <input 
                  type="text" 
                  value={datosPerfil.colegio}
                  onChange={(e) => setDatosPerfil({...datosPerfil, colegio: e.target.value})}
                  placeholder="Seleccione colegio"
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><p className="text-sm text-gray-500 mb-1">Zona</p><p className={`font-semibold ${textColor}`}>{datosPerfil.zona}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Estrato</p><p className={`font-semibold ${textColor}`}>{datosPerfil.estrato}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Medio de transporte</p><p className={`font-semibold ${textColor}`}>{datosPerfil.medioTransporte}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Grupo Sisbén</p><p className={`font-semibold ${textColor}`}>{datosPerfil.grupoSisben}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Subgrupo Sisbén</p><p className={`font-semibold ${textColor}`}>{datosPerfil.subgrupoSisben}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Fecha de expedición de documento *</p><p className={`font-semibold ${textColor}`}>{datosPerfil.fechaExpedicionDoc}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Expedición documento</p><p className={`font-semibold ${textColor}`}>{datosPerfil.expedicionDocumento}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Tipo de sangre</p><p className={`font-semibold ${textColor}`}>{datosPerfil.tipoSangre}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Estado civil</p><p className={`font-semibold ${textColor}`}>{datosPerfil.estadoCivil}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Número de hijos</p><p className={`font-semibold ${textColor}`}>{datosPerfil.numeroHijos}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">EPS</p><p className={`font-semibold ${textColor}`}>{datosPerfil.eps}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">ARS</p><p className={`font-semibold ${textColor}`}>{datosPerfil.ars}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Aseguradora</p><p className={`font-semibold ${textColor}`}>{datosPerfil.aseguradora}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Número libreta militar</p><p className={`font-semibold ${textColor}`}>{datosPerfil.numeroLibretaMilitar || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Nivel de formación</p><p className={`font-semibold ${textColor}`}>{datosPerfil.nivelFormacion}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Ocupación</p><p className={`font-semibold ${textColor}`}>{datosPerfil.ocupacion}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Discapacidad</p><p className={`font-semibold ${textColor}`}>{datosPerfil.discapacidad}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Capacidad excepcional</p><p className={`font-semibold ${textColor}`}>{datosPerfil.capacidadExcepcional}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Grupo étnico</p><p className={`font-semibold ${textColor}`}>{datosPerfil.grupoEtnico}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Pueblo indígena</p><p className={`font-semibold ${textColor}`}>{datosPerfil.puebloIndigena}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Comunidad negra</p><p className={`font-semibold ${textColor}`}>{datosPerfil.comunidadNegra}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Código PRUEBA SABER 11</p><p className={`font-semibold ${textColor}`}>{datosPerfil.codigoPruebaSaber}</p></div>
              <div><p className="text-sm text-gray-500 mb-1">Colegio</p><p className={`font-semibold ${textColor}`}>{datosPerfil.colegio || 'No especificado'}</p></div>
            </div>
          )}
        </div>

        {editandoPerfil && (
          <div className="flex gap-3">
            <button 
              onClick={actualizarPerfil}
              className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold"
            >
              Guardar Cambios
            </button>
            <button 
              onClick={() => setEditandoPerfil(false)}
              className={`flex-1 border ${borderColor} py-3 rounded hover:bg-gray-50 font-semibold`}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'inicio': return renderInicio();
      case 'cursos': return renderCursos();
      case 'clases': return renderClases();
      case 'tareas': return renderTareas();
      case 'examenes': return renderExamenes();
      case 'calificaciones': return renderCalificaciones();
      case 'mensajes': return renderMensajes();
      case 'foros': return renderForos();
      case 'biblioteca': return renderBiblioteca();
      case 'horarios': return renderHorarios();
      case 'finanzas': return renderFinanzas();
      case 'solicitudes': return renderSolicitudes();
      case 'tramites': return renderTramites();
      case 'comunidad': return renderComunidad();
      case 'certificados': return renderCertificados();
      case 'perfil': return renderPerfil();
      default: return renderInicio();
    }
  };

  return (
    <div className={`flex h-screen ${bgColor}`}>
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-700 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-600">
          {sidebarOpen && <h1 className="text-xl font-bold">UniVirtual</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-600 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition relative ${activeSection === item.id ? 'bg-blue-600 text-white' : 'hover:bg-blue-800 text-blue-100'}`}
              >
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
        <div className={`${cardBg} shadow-sm p-4 flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${textColor}`}>
            {menuItems.find(item => item.id === activeSection)?.label || 'Inicio'}
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 rounded-full">
              {darkMode ? <Sun size={24} className="text-gray-300" /> : <Moon size={24} className="text-gray-600" />}
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell size={24} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              {notificaciones.filter(n => !n.leida).length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificaciones.filter(n => !n.leida).length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">E</div>
              <div className="hidden md:block">
                <p className={`text-sm font-semibold ${textColor}`}>Estudiante Demo</p>
                <p className="text-xs text-gray-500">estudiante@univirtual.edu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}