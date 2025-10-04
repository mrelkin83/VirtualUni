import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Video, FileText, Bell, Award, DollarSign, MessageSquare, Clock, TrendingUp, User, Menu, X, Play, CheckCircle, AlertCircle, Download, Search, Moon, Sun, Users, HelpCircle, FileCheck, Home, ClipboardList, Send, ChevronLeft, ChevronRight, ExternalLink, Eye, Mail } from 'lucide-react';

export default function UniversityDashboard() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Estados para mensajería
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [nuevoMensajeModal, setNuevoMensajeModal] = useState(false);
  
  // Estados para exámenes
  const [examenActivo, setExamenActivo] = useState(null);
  const [respuestasExamen, setRespuestasExamen] = useState({});
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  
  // Estados para otros componentes
  const [modalTarea, setModalTarea] = useState(null);
  const [archivoTarea, setArchivoTarea] = useState(null);
  const [cursoDetalle, setCursoDetalle] = useState(null);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [mensajesChat, setMensajesChat] = useState([
    { id: 1, remitente: 'Soporte', mensaje: '¡Hola! ¿En qué puedo ayudarte?', hora: '10:30' }
  ]);
  const [mensajeChat, setMensajeChat] = useState('');
  const [tutoriaModal, setTutoriaModal] = useState(null);
  const [fechaTutoria, setFechaTutoria] = useState('');
  const [horaTutoria, setHoraTutoria] = useState('');
  const [recursoViewer, setRecursoViewer] = useState(null);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [centroAyudaAbierto, setCentroAyudaAbierto] = useState(false);
  const [mensajesForo, setMensajesForo] = useState({});

  const [mensajes] = useState([
    { 
      id: 1, 
      remitente: 'Prof. García', 
      asunto: 'Retroalimentación Proyecto Final', 
      preview: 'Tu proyecto muestra un excelente dominio de los conceptos...', 
      fecha: '2025-10-03 11:20', 
      leido: false,
      tipo: 'recibido',
      avatar: 'PG'
    },
    { 
      id: 2, 
      remitente: 'Coordinación Académica', 
      asunto: 'Inscripción próximo semestre', 
      preview: 'Recordatorio: El período de inscripción inicia el 15 de octubre...', 
      fecha: '2025-10-02 09:15', 
      leido: false,
      tipo: 'recibido',
      avatar: 'CA'
    },
    { 
      id: 3, 
      remitente: 'Prof. Martínez', 
      asunto: 'Material adicional disponible', 
      preview: 'He subido material complementario sobre redes neuronales...', 
      fecha: '2025-10-01 16:30', 
      leido: true,
      tipo: 'recibido',
      avatar: 'PM'
    },
    { 
      id: 4, 
      remitente: 'Biblioteca Virtual', 
      asunto: 'Nuevos recursos disponibles', 
      preview: 'Hemos agregado 50 nuevos libros de programación a la biblioteca...', 
      fecha: '2025-09-30 14:00', 
      leido: true,
      tipo: 'recibido',
      avatar: 'BV'
    },
    { 
      id: 5, 
      remitente: 'Prof. López', 
      asunto: 'Respuesta a tu consulta', 
      preview: 'Sobre tu pregunta del foro, te comento que el prototipado...', 
      fecha: '2025-09-29 10:45', 
      leido: true,
      tipo: 'recibido',
      avatar: 'PL'
    }
  ]);

  const [cursos, setCursos] = useState([
    { 
      id: 1, 
      nombre: 'Programación Avanzada', 
      progreso: 75, 
      color: 'bg-blue-500', 
      tareasPendientes: 2, 
      proximaClase: 'Hoy 14:00', 
      profesor: 'Prof. García',
      temas: [
        { id: 1, titulo: 'Patrones de Diseño', completado: true, materiales: ['Video: Singleton', 'PDF: Factory Pattern', 'Ejercicios prácticos'] },
        { id: 2, titulo: 'Estructuras de Datos', completado: true, materiales: ['Video: Árboles', 'Quiz: Grafos'] },
        { id: 3, titulo: 'Algoritmos de Ordenamiento', completado: false, materiales: ['Video: QuickSort', 'Taller práctico'] }
      ]
    },
    { 
      id: 2, 
      nombre: 'Diseño de Interfaces', 
      progreso: 60, 
      color: 'bg-purple-500', 
      tareasPendientes: 1, 
      proximaClase: 'Mañana 10:00', 
      profesor: 'Prof. López',
      temas: [
        { id: 1, titulo: 'Principios de Diseño', completado: true, materiales: ['PDF: UX Basics'] },
        { id: 2, titulo: 'Prototipado', completado: false, materiales: ['Video: Figma Tutorial'] }
      ]
    },
    { 
      id: 3, 
      nombre: 'Base de Datos', 
      progreso: 85, 
      color: 'bg-green-500', 
      tareasPendientes: 0, 
      proximaClase: 'Vie 16:00', 
      profesor: 'Prof. Rodríguez',
      temas: [
        { id: 1, titulo: 'SQL Avanzado', completado: true, materiales: ['Video: Joins', 'Ejercicios SQL'] }
      ]
    },
    { 
      id: 4, 
      nombre: 'Inteligencia Artificial', 
      progreso: 45, 
      color: 'bg-orange-500', 
      tareasPendientes: 3, 
      proximaClase: 'Hoy 18:00', 
      profesor: 'Prof. Martínez',
      temas: [
        { id: 1, titulo: 'Machine Learning', completado: false, materiales: ['Video: Intro ML'] }
      ]
    }
  ]);

  const [tareas, setTareas] = useState([
    { id: 1, titulo: 'Proyecto Final IA', curso: 'Inteligencia Artificial', fecha: '2025-10-05', estado: 'pendiente' },
    { id: 2, titulo: 'Taller JavaScript', curso: 'Programación Avanzada', fecha: '2025-10-03', estado: 'pendiente' },
    { id: 3, titulo: 'Diseño Mockup App', curso: 'Diseño de Interfaces', fecha: '2025-10-06', estado: 'entregada' }
  ]);

  const [examenes, setExamenes] = useState([
    { 
      id: 1, 
      titulo: 'Examen Parcial 2', 
      curso: 'Programación Avanzada', 
      duracion: 90, 
      preguntas: [
        { id: 1, pregunta: '¿Qué es un patrón de diseño Singleton?', opciones: ['Un patrón que permite una sola instancia', 'Un patrón para múltiples objetos', 'Un patrón de herencia', 'Ninguna de las anteriores'], respuestaCorrecta: 0 },
        { id: 2, pregunta: '¿Cuál es la complejidad de búsqueda binaria?', opciones: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], respuestaCorrecta: 1 },
        { id: 3, pregunta: '¿Qué estructura de datos usa LIFO?', opciones: ['Cola', 'Pila', 'Árbol', 'Grafo'], respuestaCorrecta: 1 }
      ],
      fechaLimite: '2025-10-04 23:59', 
      intentos: 1,
      estado: 'disponible'
    },
    { 
      id: 2, 
      titulo: 'Quiz Redes Neuronales', 
      curso: 'Inteligencia Artificial', 
      duracion: 45, 
      preguntas: [
        { id: 1, pregunta: '¿Qué es una neurona artificial?', opciones: ['Unidad básica de procesamiento', 'Un algoritmo', 'Un lenguaje', 'Una base de datos'], respuestaCorrecta: 0 },
        { id: 2, pregunta: '¿Qué significa backpropagation?', opciones: ['Ir hacia adelante', 'Propagar el error hacia atrás', 'Eliminar datos', 'Crear capas'], respuestaCorrecta: 1 }
      ],
      fechaLimite: '2025-10-05 20:00', 
      intentos: 2,
      estado: 'disponible'
    },
    { id: 3, titulo: 'Examen Parcial 1', curso: 'Programación Avanzada', estado: 'completado', calificacion: 9.2, fecha: '2025-09-20' },
    { id: 4, titulo: 'Quiz SQL', curso: 'Base de Datos', estado: 'completado', calificacion: 8.8, fecha: '2025-09-25' }
  ]);

  const [notificaciones, setNotificaciones] = useState([
    { id: 1, titulo: 'Nuevo material disponible', tipo: 'info', fecha: 'Hace 2 horas', leida: false },
    { id: 2, titulo: 'Pago pendiente - Vence 10 Oct', tipo: 'urgente', fecha: 'Hace 1 día', leida: false },
    { id: 3, titulo: 'Foro abierto: Debate IA', tipo: 'info', fecha: 'Hace 3 días', leida: true }
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
    { id: 'tramites', icon: FileCheck, label: 'Trámites' },
    { id: 'comunidad', icon: Users, label: 'Comunidad' },
    { id: 'certificados', icon: Award, label: 'Certificados' }
  ];

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  // Temporizador de examen
  useEffect(() => {
    if (tiempoRestante && tiempoRestante > 0) {
      const timer = setTimeout(() => {
        setTiempoRestante(tiempoRestante - 1);
      }, 1000);
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

  const seleccionarRespuesta = (preguntaId, opcionIndex) => {
    setRespuestasExamen({
      ...respuestasExamen,
      [preguntaId]: opcionIndex
    });
  };

  const finalizarExamen = () => {
    if (!examenActivo) return;
    
    let correctas = 0;
    examenActivo.preguntas.forEach(pregunta => {
      if (respuestasExamen[pregunta.id] === pregunta.respuestaCorrecta) {
        correctas++;
      }
    });
    
    const calificacion = (correctas / examenActivo.preguntas.length * 10).toFixed(1);
    
    setExamenes(examenes.map(e => 
      e.id === examenActivo.id 
        ? { ...e, estado: 'completado', calificacion: parseFloat(calificacion), fecha: new Date().toISOString().split('T')[0] }
        : e
    ));
    
    alert(`Examen finalizado!\nCalificación: ${calificacion}\nRespuestas correctas: ${correctas}/${examenActivo.preguntas.length}`);
    
    setExamenActivo(null);
    setRespuestasExamen({});
    setTiempoRestante(null);
    setPreguntaActual(0);
  };

  const entregarTarea = (tareaId) => {
    if (!archivoTarea) {
      alert('Por favor selecciona un archivo');
      return;
    }
    
    setTareas(tareas.map(t => 
      t.id === tareaId ? { ...t, estado: 'entregada' } : t
    ));
    
    alert('Tarea entregada exitosamente!');
    setModalTarea(null);
    setArchivoTarea(null);
  };

  const unirseClase = (clase) => {
    alert(`Conectando a la clase de ${clase}...\nAbriendo Zoom en nueva ventana`);
  };

  const enviarMensajeForo = (cursoId) => {
    if (!mensajesForo[cursoId]?.trim()) return;
    
    alert(`Mensaje publicado en el foro exitosamente!`);
    setMensajesForo({ ...mensajesForo, [cursoId]: '' });
  };

  const enviarMensajeChat = () => {
    if (!mensajeChat.trim()) return;
    
    const nuevoMensaje = {
      id: mensajesChat.length + 1,
      remitente: 'Tú',
      mensaje: mensajeChat,
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMensajesChat([...mensajesChat, nuevoMensaje]);
    setMensajeChat('');
    
    setTimeout(() => {
      setMensajesChat(prev => [...prev, {
        id: prev.length + 1,
        remitente: 'Soporte',
        mensaje: 'Gracias por tu mensaje. Un agente te atenderá pronto.',
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const agendarTutoria = () => {
    if (!fechaTutoria || !horaTutoria) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    alert(`Tutoría agendada exitosamente!\nProfesor: ${tutoriaModal.profesor}\nFecha: ${fechaTutoria}\nHora: ${horaTutoria}`);
    setTutoriaModal(null);
    setFechaTutoria('');
    setHoraTutoria('');
  };

  const descargarCertificado = (curso) => {
    alert(`Descargando certificado de ${curso}...`);
  };

  const solicitarTramite = (datos) => {
    alert(`Solicitud enviada exitosamente!\n\nTipo: ${tramiteSeleccionado}\nDetalles: ${datos.detalles || 'N/A'}\n\nRecibirás una notificación cuando esté lista.`);
    setTramiteSeleccionado(null);
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMensajes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${textColor}`}>Mensajes</h2>
        <button onClick={() => setNuevoMensajeModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Send size={18} />Nuevo Mensaje
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 ${cardBg} rounded-lg shadow p-4`}>
          <div className="flex gap-2 mb-4">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">
              Recibidos ({mensajes.filter(m => !m.leido).length})
            </button>
            <button className={`flex-1 border ${borderColor} py-2 rounded text-sm`}>
              Enviados
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {mensajes.map(mensaje => (
              <div 
                key={mensaje.id} 
                className={`p-3 rounded-lg cursor-pointer transition ${
                  conversacionActiva?.id === mensaje.id 
                    ? 'bg-blue-100 border-l-4 border-blue-600' 
                    : mensaje.leido 
                      ? `border ${borderColor} hover:bg-gray-50` 
                      : `${darkMode ? 'bg-blue-900' : 'bg-blue-50'} border-l-4 border-blue-600`
                }`}
                onClick={() => setConversacionActiva(mensaje)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                    {mensaje.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`font-semibold text-sm truncate ${!mensaje.leido ? 'font-bold' : ''}`}>
                        {mensaje.remitente}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {new Date(mensaje.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${!mensaje.leido ? 'font-semibold' : ''} truncate`}>
                      {mensaje.asunto}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{mensaje.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 ${cardBg} rounded-lg shadow p-6`}>
          {conversacionActiva ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {conversacionActiva.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${textColor}`}>{conversacionActiva.remitente}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conversacionActiva.fecha}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                    <Send size={16} />Responder
                  </button>
                </div>
                <h4 className={`text-lg font-semibold ${textColor}`}>{conversacionActiva.asunto}</h4>
              </div>

              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <p className={textColor}>
                  {conversacionActiva.preview}
                  <br /><br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  <br /><br />
                  Quedo atento a tus comentarios. Saludos cordiales.
                </p>
              </div>

              <div className="pt-4 border-t">
                <textarea 
                  placeholder="Escribe tu respuesta..." 
                  rows="4" 
                  className={`w-full p-3 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                ></textarea>
                <div className="flex justify-end gap-2 mt-3">
                  <button className={`px-4 py-2 border ${borderColor} rounded hover:bg-gray-50`}>
                    Cancelar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                    <Send size={16} />Enviar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
                <p>Selecciona un mensaje para ver su contenido</p>
              </div>
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
              <div>
                <label className="block mb-2 text-sm font-semibold">Destinatario</label>
                <select className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  <option>Seleccionar profesor o coordinación...</option>
                  <option>Prof. García - Programación Avanzada</option>
                  <option>Prof. López - Diseño de Interfaces</option>
                  <option>Prof. Martínez - Inteligencia Artificial</option>
                  <option>Prof. Rodríguez - Base de Datos</option>
                  <option>Coordinación Académica</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Asunto</label>
                <input 
                  type="text" 
                  placeholder="Asunto del mensaje" 
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">Mensaje</label>
                <textarea 
                  rows="8" 
                  placeholder="Escribe tu mensaje aquí..." 
                  className={`w-full p-2 border ${borderColor} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { alert('Mensaje enviado'); setNuevoMensajeModal(false); }} 
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Send size={18} />Enviar
                </button>
                <button 
                  onClick={() => setNuevoMensajeModal(false)} 
                  className={`flex-1 border ${borderColor} py-2 rounded`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInicio = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">¡Bienvenido, Estudiante!</h2>
        <p className="opacity-90">Tienes {tareas.filter(t => t.estado === 'pendiente').length} tareas pendientes, 2 clases hoy y {mensajes.filter(m => !m.leido).length} mensajes nuevos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardBg} rounded-lg shadow p-4 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition`} onClick={() => setActiveSection('calificaciones')}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Promedio General</p>
              <p className={`text-2xl font-bold ${textColor}`}>8.7</p>
            </div>
            <TrendingUp className="text-blue-500" size={32} />
          </div>
        </div>
        <div className={`${cardBg} rounded-lg shadow p-4 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition`} onClick={() => setActiveSection('cursos')}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Cursos Activos</p>
              <p className={`text-2xl font-bold ${textColor}`}>{cursos.length}</p>
            </div>
            <BookOpen className="text-green-500" size={32} />
          </div>
        </div>
        <div className={`${cardBg} rounded-lg shadow p-4 border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition`} onClick={() => setActiveSection('mensajes')}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Mensajes</p>
              <p className={`text-2xl font-bold ${textColor}`}>{mensajes.filter(m => !m.leido).length}</p>
            </div>
            <Mail className="text-red-500" size={32} />
          </div>
        </div>
        <div className={`${cardBg} rounded-lg shadow p-4 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition`} onClick={() => setActiveSection('clases')}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Clases Hoy</p>
              <p className={`text-2xl font-bold ${textColor}`}>2</p>
            </div>
            <Video className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${cardBg} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${textColor}`}>
            <BookOpen size={24} className="text-blue-600" />
            Mis Cursos
          </h3>
          <div className="space-y-4">
            {cursos.map(curso => (
              <div key={curso.id} className={`border ${borderColor} rounded-lg p-4 hover:shadow-md transition cursor-pointer`} onClick={() => setCursoDetalle(curso)}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-semibold ${textColor}`}>{curso.nombre}</h4>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{curso.progreso}%</span>
                </div>
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mb-3`}>
                  <div className={`${curso.color} h-2 rounded-full`} style={{ width: `${curso.progreso}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1`}>
                    <Clock size={16} />
                    {curso.proximaClase}
                  </span>
                  {curso.tareasPendientes > 0 && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {curso.tareasPendientes} tareas pendientes
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${cardBg} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${textColor}`}>Mensajes</h3>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {mensajes.filter(m => !m.leido).length} nuevos
              </span>
            </div>
            <div className="space-y-2">
              {mensajes.filter(m => !m.leido).slice(0, 3).map(mensaje => (
                <div 
                  key={mensaje.id} 
                  className={`border-l-4 border-blue-500 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-3 rounded cursor-pointer hover:shadow-md transition`}
                  onClick={() => setActiveSection('mensajes')}
                >
                  <p className={`font-semibold text-sm ${darkMode ? 'text-blue-100' : 'text-gray-800'}`}>{mensaje.remitente}</p>
                  <p className="text-xs text-blue-600 truncate">{mensaje.asunto}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveSection('mensajes')} 
              className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Ver todos los mensajes →
            </button>
          </div>

          <div className={`${cardBg} rounded-lg shadow p-6`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${textColor}`}>
              <FileText size={24} className="text-orange-600" />
              Próximas Tareas
            </h3>
            <div className="space-y-3">
              {tareas.filter(t => t.estado === 'pendiente').map(tarea => (
                <div 
                  key={tarea.id} 
                  className={`border-l-4 border-orange-500 ${darkMode ? 'bg-orange-900' : 'bg-orange-50'} p-3 rounded cursor-pointer hover:shadow-md transition`}
                  onClick={() => setModalTarea(tarea)}
                >
                  <p className={`font-semibold text-sm ${darkMode ? 'text-orange-100' : 'text-gray-800'}`}>{tarea.titulo}</p>
                  <p className={`text-xs ${darkMode ? 'text-orange-200' : 'text-gray-600'}`}>{tarea.curso}</p>
                  <p className="text-xs text-orange-600 mt-1">Vence: {tarea.fecha}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'inicio': return renderInicio();
      case 'mensajes': return renderMensajes();
      default: return (
        <div className={`${cardBg} rounded-lg shadow p-8 text-center`}>
          <h3 className={`text-xl font-bold mb-2 ${textColor}`}>Sección en desarrollo</h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Esta sección estará disponible próximamente
          </p>
        </div>
      );
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
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition relative ${
                  activeSection === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-blue-800 text-blue-100'
                }`}
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

        <div className="p-4 border-t border-blue-600">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 text-blue-100">
            <User size={20} />
            {sidebarOpen && <span className="text-sm">Mi Perfil</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={`${cardBg} shadow-sm p-4 flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${textColor}`}>
            {menuItems.find(item => item.id === activeSection)?.label || 'Inicio'}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full`}
            >
              {darkMode ? <Sun size={24} className="text-gray-300" /> : <Moon size={24} className="text-gray-600" />}
            </button>
            <button 
              className={`relative p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full`}
              onClick={() => setActiveSection('inicio')}
            >
              <Bell size={24} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              {notificaciones.filter(n => !n.leida).length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificaciones.filter(n => !n.leida).length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                E
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-semibold ${textColor}`}>Estudiante Demo</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>estudiante@univirtual.edu</p>
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