import React, { useState, createContext, useContext } from 'react';
import { Menu, X, User, Settings, Bell, TrendingUp, Users, FileText, Award, BookOpen, ClipboardCheck, PieChart, DollarSign, Shield, Palette, Building2, Upload, Mail, Calendar, AlertCircle, CheckCircle, Clock, Search, Download, Edit, Trash2, Eye, Send, Plus, Save, Inbox, MessageSquare, Filter, BarChart3, TrendingDown, CreditCard } from 'lucide-react';

// Context para configuración global
const ConfigContext = createContext(null);

const useConfig = () => useContext(ConfigContext);

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  
  // Estado de configuración de la plataforma
  const [platformConfig, setPlatformConfig] = useState({
    platformName: 'UniVirtual',
    universityName: 'Universidad Virtual',
    logoUrl: '',
    primaryColor: '#1E40AF',
    secondaryColor: '#10B981',
    favicon: '',
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    allowRegistration: true,
    maxFileSize: 10,
    sessionTimeout: 30
  });

  // Estados para modales y datos
  const [editUserModal, setEditUserModal] = useState(null);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);
  const [generarCertificadoModal, setGenerarCertificadoModal] = useState(false);
  const [filtroUsuarios, setFiltroUsuarios] = useState('todos');
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [redactarMensaje, setRedactarMensaje] = useState(false);
  const [bandejaActiva, setBandejaActiva] = useState('recibidos');
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(5);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    rol: 'estudiante',
    estado: 'activo',
    carrera: '',
    departamento: '',
    posicion: ''
  });
  const [createCursoModal, setCreateCursoModal] = useState(false);
  const [editCursoModal, setEditCursoModal] = useState(null);
  const [verCursoModal, setVerCursoModal] = useState(null);
  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: '',
    codigo: '',
    estudiantes: 0,
    docente: '',
    estado: 'activo',
    descripcion: '',
    duracion: '',
    creditos: ''
  });
  const [verHistorialModal, setVerHistorialModal] = useState(null);
  const [comunicacionMasivaModal, setComunicacionMasivaModal] = useState(false);
  const [inscripcionModal, setInscripcionModal] = useState(false);
  const [logsAuditoriaModal, setLogsAuditoriaModal] = useState(false);
  const [historialQRModal, setHistorialQRModal] = useState(false);
  
  const [historialAcademico] = useState([
    { id: 1, estudiante: 'María González', curso: 'Programación Avanzada', semestre: '2024-2', nota: 4.5, estado: 'Aprobado' },
    { id: 2, estudiante: 'María González', curso: 'Base de Datos', semestre: '2024-1', nota: 4.2, estado: 'Aprobado' },
    { id: 3, estudiante: 'Luis Torres', curso: 'Diseño de Interfaces', semestre: '2024-2', nota: 3.8, estado: 'Aprobado' }
  ]);

  const [logsAuditoria] = useState([
    { id: 1, fecha: '2025-10-03 14:30:22', usuario: 'Admin Ana', accion: 'Creó usuario', detalle: 'Nuevo estudiante: Juan Pérez', ip: '192.168.1.100' },
    { id: 2, fecha: '2025-10-03 13:15:10', usuario: 'Admin Ana', accion: 'Modificó curso', detalle: 'Actualizó CS301', ip: '192.168.1.100' },
    { id: 3, fecha: '2025-10-03 12:00:45', usuario: 'Admin Ana', accion: 'Generó certificado', detalle: 'Certificado para María González', ip: '192.168.1.100' },
    { id: 4, fecha: '2025-10-03 11:30:00', usuario: 'Sistema', accion: 'Backup automático', detalle: 'Backup diario completado', ip: 'sistema' },
    { id: 5, fecha: '2025-10-03 10:15:30', usuario: 'Admin Ana', accion: 'Cambió configuración', detalle: 'Actualizó colores de plataforma', ip: '192.168.1.100' }
  ]);

  const [historialQR] = useState([
    { id: 1, documento: 'Certificado de Estudios - María González', codigo: 'QR-2025-001', fecha: '2025-10-03', verificaciones: 3 },
    { id: 2, documento: 'Diploma - Carlos Ruiz', codigo: 'QR-2025-002', fecha: '2025-10-02', verificaciones: 1 },
    { id: 3, documento: 'Constancia de Notas - Ana Torres', codigo: 'QR-2025-003', fecha: '2025-10-01', verificaciones: 5 }
  ]);

  // Sistema de plantillas de certificados
  const [plantillas, setPlantillas] = useState([
    {
      id: 1,
      nombre: 'Certificado de Aprobación',
      descripcion: 'Certificado estándar para cursos aprobados con firma y QR',
      estado: 'publicado',
      componentes: [
        { id: 1, tipo: 'texto', contenido: 'CERTIFICADO DE APROBACIÓN', estilos: { fontSize: '28px', fontWeight: 'bold', color: '#1E40AF', textAlign: 'center' }, posicion: { top: '50px' } },
        { id: 2, tipo: 'texto', contenido: 'Se certifica que', estilos: { fontSize: '16px', textAlign: 'center' }, posicion: { top: '120px' } },
        { id: 3, tipo: 'campo_dinamico', campo: '[nombre_estudiante]', estilos: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }, posicion: { top: '160px' } },
        { id: 4, tipo: 'texto', contenido: 'ha completado satisfactoriamente el curso', estilos: { fontSize: '16px', textAlign: 'center' }, posicion: { top: '210px' } },
        { id: 5, tipo: 'campo_dinamico', campo: '[nombre_curso]', estilos: { fontSize: '20px', fontWeight: 'bold', textAlign: 'center', color: '#10B981' }, posicion: { top: '250px' } },
        { id: 6, tipo: 'campo_dinamico', campo: '[fecha_emision]', estilos: { fontSize: '14px', textAlign: 'center' }, posicion: { top: '300px' } },
        { id: 7, tipo: 'firma', nombreFirmante: 'Dr. Carlos Rodríguez', cargo: 'Director Académico', posicion: { top: '400px', left: '100px' } },
        { id: 8, tipo: 'qr_code', posicion: { top: '450px', right: '50px' } }
      ],
      configuracion: { tamano: 'A4', orientacion: 'horizontal', margenes: { top: 20, right: 20, bottom: 20, left: 20 }, fondo: '#ffffff' }
    },
    {
      id: 2,
      nombre: 'Constancia de Estudios',
      descripcion: 'Constancia para documentar estudios en curso',
      estado: 'borrador',
      componentes: [
        { id: 1, tipo: 'texto', contenido: 'CONSTANCIA DE ESTUDIOS', estilos: { fontSize: '24px', fontWeight: 'bold', color: '#1E40AF', textAlign: 'center' }, posicion: { top: '60px' } }
      ],
      configuracion: { tamano: 'Carta', orientacion: 'vertical', margenes: { top: 30, right: 30, bottom: 30, left: 30 }, fondo: '#f9fafb' }
    }
  ]);

  const [crearPlantillaModal, setCrearPlantillaModal] = useState(false);
  const [editarPlantillaModal, setEditarPlantillaModal] = useState(null);
  const [vistaPreviewPlantilla, setVistaPreviewPlantilla] = useState(null);
  const [generarCertificadoPlantilla, setGenerarCertificadoPlantilla] = useState(null);
  
  const [nuevaPlantilla, setNuevaPlantilla] = useState({
    nombre: '',
    descripcion: '',
    estado: 'borrador',
    componentes: [],
    configuracion: { tamano: 'A4', orientacion: 'horizontal', margenes: { top: 20, right: 20, bottom: 20, left: 20 }, fondo: '#ffffff' }
  });

  const [nuevoComponente, setNuevoComponente] = useState({
    tipo: 'texto',
    contenido: '',
    campo: '',
    nombreFirmante: '',
    cargo: '',
    estilos: { fontSize: '16px', fontWeight: 'normal', color: '#000000', textAlign: 'left' },
    posicion: { top: '0px' }
  });

  const [historialQRState, setHistorialQRState] = useState([
    { id: 1, documento: 'Certificado de Estudios - María González', codigo: 'QR-2025-001', fecha: '2025-10-03', verificaciones: 3 },
    { id: 2, documento: 'Diploma - Carlos Ruiz', codigo: 'QR-2025-002', fecha: '2025-10-02', verificaciones: 1 },
    { id: 3, documento: 'Constancia de Notas - Ana Torres', codigo: 'QR-2025-003', fecha: '2025-10-01', verificaciones: 5 }
  ]);

  // Sistema de anuncios institucionales
  const [anuncios, setAnuncios] = useState([
    { id: 1, titulo: 'Inicio del período académico 2025-2', contenido: 'Informamos a toda la comunidad educativa que el período académico 2025-2 iniciará el próximo 20 de octubre...', fecha: '2025-10-03', autor: 'Admin Ana', estado: 'publicado', adjuntos: ['calendario_2025-2.pdf'], prioridad: 'alta' },
    { id: 2, titulo: 'Mantenimiento de la plataforma', contenido: 'Se realizará mantenimiento programado el día domingo 15 de octubre de 2:00 AM a 6:00 AM...', fecha: '2025-10-02', autor: 'Admin Ana', estado: 'publicado', adjuntos: [], prioridad: 'media' },
    { id: 3, titulo: 'Nuevo proceso de inscripciones', contenido: 'A partir de este semestre, las inscripciones se realizarán exclusivamente por la plataforma...', fecha: '2025-10-01', autor: 'Admin Ana', estado: 'borrador', adjuntos: ['guia_inscripcion.pdf'], prioridad: 'baja' }
  ]);

  const [crearAnuncioModal, setCrearAnuncioModal] = useState(false);
  const [editarAnuncioModal, setEditarAnuncioModal] = useState(null);
  const [verAnuncioModal, setVerAnuncioModal] = useState(null);
  const [nuevoAnuncio, setNuevoAnuncio] = useState({
    titulo: '',
    contenido: '',
    prioridad: 'media',
    estado: 'borrador',
    adjuntos: []
  });

  // Sistema de trámites
  const [tramites, setTramites] = useState([
    { id: 1, tipo: 'Certificado', solicitante: 'María González', descripcion: 'Solicitud de certificado de notas', estado: 'en_proceso', fechaSolicitud: '2025-10-03', asignadoA: 'Admin Ana', adjuntos: ['documento_identidad.pdf'], prioridad: 'alta' },
    { id: 2, tipo: 'Retiro', solicitante: 'Luis Torres', descripcion: 'Solicitud de retiro del semestre', estado: 'pendiente', fechaSolicitud: '2025-10-02', asignadoA: null, adjuntos: ['carta_retiro.pdf', 'justificacion.pdf'], prioridad: 'media' },
    { id: 3, tipo: 'Cambio de horario', solicitante: 'Carlos Ruiz', descripcion: 'Cambio de horario por trabajo', estado: 'completado', fechaSolicitud: '2025-09-30', asignadoA: 'Admin Ana', adjuntos: ['carta_trabajo.pdf'], prioridad: 'baja' }
  ]);

  const [crearTramiteModal, setCrearTramiteModal] = useState(false);
  const [editarTramiteModal, setEditarTramiteModal] = useState(null);
  const [verTramiteModal, setVerTramiteModal] = useState(null);
  const [nuevoTramite, setNuevoTramite] = useState({
    tipo: 'Certificado',
    solicitante: '',
    descripcion: '',
    prioridad: 'media',
    asignadoA: '',
    adjuntos: []
  });

  // Sistema de mensajes masivos
  const [mensajesMasivos, setMensajesMasivos] = useState([
    { id: 1, asunto: 'Bienvenida al semestre 2025-2', destinatarios: 'Todos los estudiantes', fecha: '2025-10-03', enviados: 2847, adjuntos: ['bienvenida.pdf'], estado: 'enviado' },
    { id: 2, asunto: 'Actualización de políticas académicas', destinatarios: 'Todos los docentes', fecha: '2025-10-02', enviados: 156, adjuntos: ['politicas.pdf', 'reglamento.pdf'], estado: 'enviado' },
    { id: 3, asunto: 'Recordatorio: Evaluaciones finales', destinatarios: 'Estudiantes activos', fecha: '2025-10-01', enviados: 0, adjuntos: [], estado: 'borrador' }
  ]);

  const [crearMensajeMasivoModal, setCrearMensajeMasivoModal] = useState(false);
  const [verMensajeMasivoModal, setVerMensajeMasivoModal] = useState(null);
  const [nuevoMensajeMasivo, setNuevoMensajeMasivo] = useState({
    asunto: '',
    mensaje: '',
    destinatarios: [],
    adjuntos: []
  });

  const agregarAdjunto = (setEstado, estado) => {
    const nombreArchivo = prompt('Ingrese el nombre del archivo (ej: documento.pdf):');
    if (nombreArchivo) {
      setEstado({
        ...estado,
        adjuntos: [...estado.adjuntos, nombreArchivo]
      });
    }
  };

  const eliminarAdjunto = (setEstado, estado, index) => {
    setEstado({
      ...estado,
      adjuntos: estado.adjuntos.filter((_, i) => i !== index)
    });
  };

  const generarCodigoQR = () => {
    return 'QR-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  };

  const generarQRVisual = (codigo) => {
    // Simulación de código QR usando SVG
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" style={{border: '2px solid #000'}}>
        <rect width="80" height="80" fill="white"/>
        <g fill="black">
          <rect x="10" y="10" width="8" height="8"/>
          <rect x="26" y="10" width="8" height="8"/>
          <rect x="42" y="10" width="8" height="8"/>
          <rect x="58" y="10" width="8" height="8"/>
          <rect x="10" y="26" width="8" height="8"/>
          <rect x="42" y="26" width="8" height="8"/>
          <rect x="58" y="26" width="8" height="8"/>
          <rect x="10" y="42" width="8" height="8"/>
          <rect x="26" y="42" width="8" height="8"/>
          <rect x="58" y="42" width="8" height="8"/>
          <rect x="10" y="58" width="8" height="8"/>
          <rect x="26" y="58" width="8" height="8"/>
          <rect x="42" y="58" width="8" height="8"/>
          <rect x="58" y="58" width="8" height="8"/>
        </g>
        <text x="40" y="75" fontSize="6" textAnchor="middle" fill="black">{codigo}</text>
      </svg>
    );
  };

  const generarFirmaVisual = (nombreFirmante, cargo) => {
    return (
      <div style={{ textAlign: 'center', width: '200px' }}>
        <div style={{ 
          height: '60px', 
          borderBottom: '2px solid #000', 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '5px'
        }}>
          <svg width="150" height="40" viewBox="0 0 150 40">
            <path 
              d="M 10 30 Q 30 10, 50 25 T 90 20 Q 110 15, 130 25" 
              stroke="#1E40AF" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
            />
            <path 
              d="M 20 28 Q 35 18, 45 30" 
              stroke="#1E40AF" 
              strokeWidth="1.5" 
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>
          {nombreFirmante}
        </div>
        <div style={{ fontSize: '10px', color: '#666' }}>
          {cargo}
        </div>
      </div>
    );
  };

  // Datos de ejemplo
  const [metricas] = useState({
    totalEstudiantes: 2847,
    totalDocentes: 156,
    solicitudesPendientes: 23,
    certificadosGenerados: 145,
    ingresosMensuales: 328500,
    cursosActivos: 87,
    usuariosActivos: 1234,
    satisfaccion: 4.6
  });

  const [mensajes, setMensajes] = useState([
    { id: 1, de: 'María González', asunto: 'Consulta sobre inscripción', mensaje: 'Buenos días, quisiera consultar sobre el proceso de inscripción para el próximo semestre...', fecha: '2025-10-03 09:30', leido: false, tipo: 'recibido' },
    { id: 2, de: 'Carlos Rodríguez', asunto: 'Reporte de calificaciones', mensaje: 'Estimado administrador, adjunto el reporte de calificaciones del curso CS301...', fecha: '2025-10-03 08:15', leido: false, tipo: 'recibido' },
    { id: 3, de: 'Ana Torres', asunto: 'Problema con acceso', mensaje: 'Hola, varios estudiantes reportan problemas para acceder a la plataforma...', fecha: '2025-10-02 16:45', leido: true, tipo: 'recibido' },
    { id: 4, de: 'Luis Martínez', asunto: 'Solicitud de certificado', mensaje: 'Necesito el certificado de estudios urgente para un trámite...', fecha: '2025-10-02 14:20', leido: false, tipo: 'recibido' },
    { id: 5, de: 'Elena Ramírez', asunto: 'Propuesta de nuevo curso', mensaje: 'Tengo una propuesta para un nuevo curso de IA avanzada...', fecha: '2025-10-01 11:00', leido: true, tipo: 'recibido' },
    { id: 6, para: 'María González', asunto: 'Re: Consulta sobre inscripción', mensaje: 'Hola María, el proceso de inscripción estará abierto del 15 al 30 de octubre...', fecha: '2025-10-03 10:00', tipo: 'enviado' },
    { id: 7, para: 'Todos los estudiantes', asunto: 'Actualización del sistema', mensaje: 'Estimados estudiantes, les informamos que realizaremos mantenimiento...', fecha: '2025-10-02 09:00', tipo: 'enviado' }
  ]);

  const [solicitudes] = useState([
    { id: 1, tipo: 'certificado', usuario: 'María González', asunto: 'Certificado de estudios', estado: 'pendiente', fecha: '2025-10-03', prioridad: 'alta' },
    { id: 2, tipo: 'inscripcion', usuario: 'Carlos Ruiz', asunto: 'Inscripción semestre 2025-2', estado: 'pendiente', fecha: '2025-10-03', prioridad: 'media' },
    { id: 3, tipo: 'tecnico', usuario: 'Ana Torres', asunto: 'Problema acceso plataforma', estado: 'en_proceso', fecha: '2025-10-02', prioridad: 'alta' },
    { id: 4, tipo: 'financiero', usuario: 'Luis Martínez', asunto: 'Consulta sobre beca', estado: 'pendiente', fecha: '2025-10-02', prioridad: 'baja' },
    { id: 5, tipo: 'certificado', usuario: 'Elena Ramírez', asunto: 'Constancia de notas', estado: 'completado', fecha: '2025-10-01', prioridad: 'media' }
  ]);

  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'María González', email: 'maria.g@university.edu', rol: 'estudiante', estado: 'activo', ultimoAcceso: '2025-10-03', carrera: 'Ingeniería' },
    { id: 2, nombre: 'Carlos Rodríguez', email: 'carlos.r@university.edu', rol: 'docente', estado: 'activo', ultimoAcceso: '2025-10-03', departamento: 'Sistemas' },
    { id: 3, nombre: 'Ana Martínez', email: 'ana.m@university.edu', rol: 'admin', estado: 'activo', ultimoAcceso: '2025-10-03', posicion: 'Coordinadora' },
    { id: 4, nombre: 'Luis Torres', email: 'luis.t@university.edu', rol: 'estudiante', estado: 'inactivo', ultimoAcceso: '2025-09-15', carrera: 'Diseño' },
    { id: 5, nombre: 'Elena Ramírez', email: 'elena.r@university.edu', rol: 'docente', estado: 'activo', ultimoAcceso: '2025-10-02', departamento: 'Matemáticas' }
  ]);

  const [cursos, setCursos] = useState([
    { id: 1, nombre: 'Programación Avanzada', codigo: 'CS301', estudiantes: 45, docente: 'Carlos Rodríguez', estado: 'activo', descripcion: 'Curso avanzado de programación orientada a objetos', duracion: '16 semanas', creditos: '4' },
    { id: 2, nombre: 'Base de Datos', codigo: 'CS302', estudiantes: 38, docente: 'Elena Ramírez', estado: 'activo', descripcion: 'Fundamentos de bases de datos relacionales', duracion: '16 semanas', creditos: '4' },
    { id: 3, nombre: 'Diseño de Interfaces', codigo: 'DG201', estudiantes: 52, docente: 'Ana Torres', estado: 'activo', descripcion: 'Principios de diseño UX/UI', duracion: '12 semanas', creditos: '3' },
    { id: 4, nombre: 'Inteligencia Artificial', codigo: 'CS401', estudiantes: 28, docente: 'Carlos Rodríguez', estado: 'inactivo', descripcion: 'Introducción a IA y Machine Learning', duracion: '16 semanas', creditos: '4' }
  ]);

  const [transacciones] = useState([
    { id: 1, estudiante: 'María González', concepto: 'Matrícula Semestre 2025-2', monto: 2500, fecha: '2025-10-03', estado: 'completado' },
    { id: 2, estudiante: 'Carlos Ruiz', concepto: 'Matrícula + Curso adicional', monto: 3200, fecha: '2025-10-03', estado: 'completado' },
    { id: 3, estudiante: 'Luis Torres', concepto: 'Certificado de estudios', monto: 150, fecha: '2025-10-02', estado: 'pendiente' },
    { id: 4, estudiante: 'Ana Martínez', concepto: 'Matrícula Semestre 2025-2', monto: 2500, fecha: '2025-10-01', estado: 'completado' },
    { id: 5, estudiante: 'Elena Ramírez', concepto: 'Curso de extensión', monto: 800, fecha: '2025-10-01', estado: 'completado' }
  ]);

  const menuItems = [
    { id: 'inicio', icon: TrendingUp, label: 'Dashboard', color: 'text-blue-600' },
    { id: 'mensajes', icon: Mail, label: 'Mensajes', badge: mensajesNoLeidos, color: 'text-blue-600' },
    { id: 'anuncios', icon: Bell, label: 'Anuncios', color: 'text-orange-600' },
    { id: 'tramites', icon: FileText, label: 'Trámites', color: 'text-purple-600' },
    { id: 'mensajes_masivos', icon: Send, label: 'Mensajes Masivos', color: 'text-green-600' },
    { id: 'solicitudes', icon: ClipboardCheck, label: 'Solicitudes', badge: metricas.solicitudesPendientes, color: 'text-orange-600' },
    { id: 'inscripcion', icon: Users, label: 'Inscripción', color: 'text-green-600' },
    { id: 'documentos', icon: FileText, label: 'Documentos', color: 'text-purple-600' },
    { id: 'plantillas', icon: Award, label: 'Plantillas Certificados', color: 'text-pink-600' },
    { id: 'usuarios', icon: Users, label: 'Usuarios', color: 'text-green-600' },
    { id: 'cursos', icon: BookOpen, label: 'Cursos', color: 'text-blue-600' },
    { id: 'finanzas', icon: DollarSign, label: 'Finanzas', color: 'text-green-600' },
    { id: 'reportes', icon: PieChart, label: 'Reportes', color: 'text-purple-600' },
    { id: 'configuracion', icon: Settings, label: 'Configuración', color: 'text-gray-600' },
    { id: 'personalizacion', icon: Palette, label: 'Personalización', color: 'text-pink-600' }
  ];

  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const card = darkMode ? 'bg-gray-800' : 'bg-white';
  const text = darkMode ? 'text-gray-100' : 'text-gray-800';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  const actualizarConfiguracion = (campo, valor) => {
    setPlatformConfig(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const crearUsuario = () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email) {
      alert('Por favor completa los campos obligatorios');
      return;
    }
    
    const usuario = {
      id: usuarios.length + 1,
      ...nuevoUsuario,
      ultimoAcceso: new Date().toISOString().split('T')[0]
    };
    
    setUsuarios([...usuarios, usuario]);
    setCreateUserModal(false);
    setNuevoUsuario({
      nombre: '',
      email: '',
      rol: 'estudiante',
      estado: 'activo',
      carrera: '',
      departamento: '',
      posicion: ''
    });
    alert('Usuario creado exitosamente');
  };

  const editarUsuario = () => {
    if (!editUserModal.nombre || !editUserModal.email) {
      alert('Por favor completa los campos obligatorios');
      return;
    }
    
    setUsuarios(usuarios.map(u => 
      u.id === editUserModal.id ? editUserModal : u
    ));
    setEditUserModal(null);
    alert('Usuario actualizado exitosamente');
  };

  const eliminarUsuario = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsuarios(usuarios.filter(u => u.id !== id));
      alert('Usuario eliminado exitosamente');
    }
  };

  const crearCurso = () => {
    if (!nuevoCurso.nombre || !nuevoCurso.codigo || !nuevoCurso.docente) {
      alert('Por favor completa los campos obligatorios');
      return;
    }
    
    const curso = {
      id: cursos.length + 1,
      ...nuevoCurso,
      estudiantes: parseInt(nuevoCurso.estudiantes) || 0
    };
    
    setCursos([...cursos, curso]);
    setCreateCursoModal(false);
    setNuevoCurso({
      nombre: '',
      codigo: '',
      estudiantes: 0,
      docente: '',
      estado: 'activo',
      descripcion: '',
      duracion: '',
      creditos: ''
    });
    alert('Curso creado exitosamente');
  };

  const editarCurso = () => {
    if (!editCursoModal.nombre || !editCursoModal.codigo || !editCursoModal.docente) {
      alert('Por favor completa los campos obligatorios');
      return;
    }
    
    setCursos(cursos.map(c => 
      c.id === editCursoModal.id ? {...editCursoModal, estudiantes: parseInt(editCursoModal.estudiantes) || 0} : c
    ));
    setEditCursoModal(null);
    alert('Curso actualizado exitosamente');
  };

  const eliminarCurso = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este curso?')) {
      setCursos(cursos.filter(c => c.id !== id));
      alert('Curso eliminado exitosamente');
    }
  };

  const crearPlantilla = () => {
    if (!nuevaPlantilla.nombre) {
      alert('Por favor ingresa un nombre para la plantilla');
      return;
    }
    
    const plantilla = {
      id: plantillas.length + 1,
      ...nuevaPlantilla
    };
    
    setPlantillas([...plantillas, plantilla]);
    setCrearPlantillaModal(false);
    setNuevaPlantilla({
      nombre: '',
      descripcion: '',
      estado: 'borrador',
      componentes: [],
      configuracion: { tamano: 'A4', orientacion: 'horizontal', margenes: { top: 20, right: 20, bottom: 20, left: 20 }, fondo: '#ffffff' }
    });
    alert('Plantilla creada exitosamente');
  };

  const actualizarPlantilla = () => {
    if (!editarPlantillaModal.nombre) {
      alert('Por favor ingresa un nombre para la plantilla');
      return;
    }
    
    setPlantillas(plantillas.map(p => 
      p.id === editarPlantillaModal.id ? editarPlantillaModal : p
    ));
    setEditarPlantillaModal(null);
    alert('Plantilla actualizada exitosamente');
  };

  const duplicarPlantilla = (plantilla) => {
    const nuevaPlantilla = {
      ...plantilla,
      id: plantillas.length + 1,
      nombre: `${plantilla.nombre} (Copia)`,
      estado: 'borrador'
    };
    setPlantillas([...plantillas, nuevaPlantilla]);
    alert('Plantilla duplicada exitosamente');
  };

  const eliminarPlantilla = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      setPlantillas(plantillas.filter(p => p.id !== id));
      alert('Plantilla eliminada exitosamente');
    }
  };

  const agregarComponenteAPlantilla = (plantilla, setPlantilla) => {
    // Validar firmas (máximo 3)
    if (nuevoComponente.tipo === 'firma') {
      const firmasActuales = (plantilla.componentes || []).filter(c => c.tipo === 'firma').length;
      if (firmasActuales >= 3) {
        alert('Solo se permiten hasta 3 firmas por certificado');
        return;
      }
      if (!nuevoComponente.nombreFirmante || !nuevoComponente.cargo) {
        alert('Por favor ingresa el nombre y cargo del firmante');
        return;
      }
    }
    
    if (!nuevoComponente.contenido && !nuevoComponente.campo && nuevoComponente.tipo !== 'qr_code' && nuevoComponente.tipo !== 'firma') {
      alert('Por favor ingresa el contenido del componente');
      return;
    }
    
    const componente = {
      id: (plantilla.componentes?.length || 0) + 1,
      ...nuevoComponente
    };
    
    setPlantilla({
      ...plantilla,
      componentes: [...(plantilla.componentes || []), componente]
    });
    
    setNuevoComponente({
      tipo: 'texto',
      contenido: '',
      campo: '',
      nombreFirmante: '',
      cargo: '',
      estilos: { fontSize: '16px', fontWeight: 'normal', color: '#000000', textAlign: 'left' },
      posicion: { top: '0px' }
    });
  };

  const eliminarComponente = (plantilla, setPlantilla, componenteId) => {
    setPlantilla({
      ...plantilla,
      componentes: plantilla.componentes.filter(c => c.id !== componenteId)
    });
  };

  const renderizarCertificado = (plantilla, datosEstudiante = {}) => {
    const codigoQR = datosEstudiante.codigoQR || generarCodigoQR();
    const datos = {
      '[nombre_estudiante]': datosEstudiante.nombre || 'Nombre del Estudiante',
      '[nombre_curso]': datosEstudiante.curso || 'Nombre del Curso',
      '[fecha_emision]': datosEstudiante.fecha || new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
      '[nota_final]': datosEstudiante.nota || '5.0',
      '[codigo_verificacion]': codigoQR
    };

    return (
      <div 
        className="relative bg-white shadow-2xl mx-auto"
        style={{
          width: plantilla.configuracion.orientacion === 'horizontal' ? '842px' : '595px',
          height: plantilla.configuracion.orientacion === 'horizontal' ? '595px' : '842px',
          backgroundColor: plantilla.configuracion.fondo,
          padding: `${plantilla.configuracion.margenes.top}px ${plantilla.configuracion.margenes.right}px ${plantilla.configuracion.margenes.bottom}px ${plantilla.configuracion.margenes.left}px`
        }}
      >
        {plantilla.componentes?.map(comp => {
          if (comp.tipo === 'qr_code') {
            return (
              <div
                key={comp.id}
                className="absolute"
                style={{
                  top: comp.posicion.top,
                  left: comp.posicion.left || 'auto',
                  right: comp.posicion.right || 'auto',
                  bottom: comp.posicion.bottom || 'auto'
                }}
              >
                {generarQRVisual(codigoQR)}
              </div>
            );
          }

          if (comp.tipo === 'firma') {
            return (
              <div
                key={comp.id}
                className="absolute"
                style={{
                  top: comp.posicion.top,
                  left: comp.posicion.left || 'auto',
                  right: comp.posicion.right || 'auto',
                  bottom: comp.posicion.bottom || 'auto'
                }}
              >
                {generarFirmaVisual(comp.nombreFirmante || 'Nombre Firmante', comp.cargo || 'Cargo')}
              </div>
            );
          }

          let contenido = comp.contenido;
          if (comp.tipo === 'campo_dinamico') {
            contenido = datos[comp.campo] || comp.campo;
          }
          
          return (
            <div
              key={comp.id}
              className="absolute"
              style={{
                top: comp.posicion.top,
                left: comp.posicion.left || '0',
                right: comp.posicion.right || '0',
                ...comp.estilos
              }}
            >
              {contenido}
            </div>
          );
        })}
      </div>
    );
  };

  const marcarComoLeido = (id) => {
    setMensajes(prev => prev.map(m => 
      m.id === id ? { ...m, leido: true } : m
    ));
    setMensajesNoLeidos(prev => Math.max(0, prev - 1));
  };

  const renderInicio = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Panel Administrativo - {platformConfig.universityName}</h2>
        <p className="opacity-90">Gestión integral de la plataforma {platformConfig.platformName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Estudiantes', value: metricas.totalEstudiantes.toLocaleString(), color: 'border-blue-500', icon: Users, trend: '+12%' },
          { label: 'Docentes', value: metricas.totalDocentes.toLocaleString(), color: 'border-green-500', icon: Award, trend: '+5%' },
          { label: 'Solicitudes', value: metricas.solicitudesPendientes, color: 'border-orange-500', icon: ClipboardCheck, trend: '-8%' },
          { label: 'Ingresos', value: `$${(metricas.ingresosMensuales / 1000).toFixed(0)}K`, color: 'border-purple-500', icon: DollarSign, trend: '+18%' }
        ].map((stat, i) => (
          <div key={i} className={`${card} rounded-lg shadow p-4 border-l-4 ${stat.color} cursor-pointer hover:shadow-lg transition`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${text}`}>{stat.value}</p>
              </div>
              <stat.icon className={stat.color.replace('border-', 'text-')} size={32} />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className={stat.trend.includes('+') ? 'text-green-600' : 'text-red-600'}>{stat.trend}</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Actividad Reciente</h3>
          <div className="space-y-3">
            {[
              { accion: 'Nuevo estudiante registrado', usuario: 'María González', tiempo: 'Hace 5 min', icono: Users, color: 'text-blue-600' },
              { accion: 'Certificado generado', usuario: 'Sistema', tiempo: 'Hace 15 min', icono: FileText, color: 'text-green-600' },
              { accion: 'Solicitud aprobada', usuario: 'Admin Ana', tiempo: 'Hace 1 hora', icono: CheckCircle, color: 'text-purple-600' },
              { accion: 'Pago procesado', usuario: 'Carlos Ruiz', tiempo: 'Hace 2 horas', icono: DollarSign, color: 'text-green-600' }
            ].map((actividad, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${border} hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition`}>
                <actividad.icono className={actividad.color} size={20} />
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${text}`}>{actividad.accion}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{actividad.usuario} • {actividad.tiempo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${card} rounded-lg shadow p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${text}`}>Alertas</h3>
            <div className="space-y-3">
              {[
                { mensaje: '12 pagos pendientes', tipo: 'warning' },
                { mensaje: '5 solicitudes urgentes', tipo: 'error' },
                { mensaje: 'Backup completado', tipo: 'success' }
              ].map((alerta, i) => (
                <div key={i} className={`p-3 rounded-lg ${
                  alerta.tipo === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
                  alerta.tipo === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                  'bg-green-50 border-l-4 border-green-500'
                }`}>
                  <p className={`text-sm font-semibold ${
                    alerta.tipo === 'error' ? 'text-red-800' :
                    alerta.tipo === 'warning' ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>{alerta.mensaje}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} rounded-lg shadow p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${text}`}>Accesos Rápidos</h3>
            <div className="space-y-2">
              {[
                { label: 'Generar Certificado', icon: FileText, action: () => setGenerarCertificadoModal(true) },
                { label: 'Crear Usuario', icon: Plus, action: () => setCreateUserModal(true) },
                { label: 'Ver Reportes', icon: PieChart, action: () => setActiveSection('reportes') }
              ].map((acceso, i) => (
                <button key={i} onClick={acceso.action} className={`w-full flex items-center gap-2 p-3 rounded-lg border ${border} hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition text-left`}>
                  <acceso.icon size={18} className="text-blue-600" />
                  <span className={`text-sm ${text}`}>{acceso.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMensajes = () => {
    const mensajesFiltrados = mensajes.filter(m => 
      bandejaActiva === 'recibidos' ? m.tipo === 'recibido' : m.tipo === 'enviado'
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${text}`}>Buzón de Mensajes</h2>
          <button onClick={() => setRedactarMensaje(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
            <Send size={18} />Nuevo Mensaje
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setBandejaActiva('recibidos')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              bandejaActiva === 'recibidos'
                ? 'bg-blue-600 text-white'
                : `border ${border} ${text}`
            }`}
          >
            <Inbox size={18} />Recibidos {mensajesNoLeidos > 0 && `(${mensajesNoLeidos})`}
          </button>
          <button
            onClick={() => setBandejaActiva('enviados')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              bandejaActiva === 'enviados'
                ? 'bg-blue-600 text-white'
                : `border ${border} ${text}`
            }`}
          >
            <Send size={18} />Enviados
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {mensajesFiltrados.map(mensaje => (
            <div 
              key={mensaje.id} 
              onClick={() => { setMensajeSeleccionado(mensaje); if (!mensaje.leido && mensaje.tipo === 'recibido') marcarComoLeido(mensaje.id); }}
              className={`${card} rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition ${
                !mensaje.leido && mensaje.tipo === 'recibido' ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-bold ${text}`}>
                      {mensaje.tipo === 'recibido' ? `De: ${mensaje.de}` : `Para: ${mensaje.para}`}
                    </p>
                    {!mensaje.leido && mensaje.tipo === 'recibido' && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Nuevo</span>
                    )}
                  </div>
                  <p className={`font-semibold text-sm ${text}`}>{mensaje.asunto}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
                    {mensaje.mensaje}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>{mensaje.fecha}</p>
                </div>
                <Eye size={18} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {mensajeSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setMensajeSeleccionado(null)}>
            <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${text} mb-2`}>{mensajeSeleccionado.asunto}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {mensajeSeleccionado.tipo === 'recibido' ? `De: ${mensajeSeleccionado.de}` : `Para: ${mensajeSeleccionado.para}`}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{mensajeSeleccionado.fecha}</p>
                </div>
                <button onClick={() => setMensajeSeleccionado(null)}><X size={24} /></button>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}>
                <p className={text}>{mensajeSeleccionado.mensaje}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setMensajeSeleccionado(null); setRedactarMensaje(true); }} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Responder
                </button>
                <button onClick={() => setMensajeSeleccionado(null)} className={`flex-1 border ${border} py-2 rounded`}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {redactarMensaje && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setRedactarMensaje(false)}>
            <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between mb-4">
                <h3 className={`text-xl font-bold ${text}`}>Nuevo Mensaje</h3>
                <button onClick={() => setRedactarMensaje(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Para</label>
                  <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                    <option value="">Seleccionar destinatario...</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Asunto</label>
                  <input 
                    type="text" 
                    placeholder="Asunto del mensaje"
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mensaje</label>
                  <textarea 
                    rows="8" 
                    placeholder="Escribe tu mensaje aquí..."
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { 
                      alert('Mensaje enviado exitosamente'); 
                      setRedactarMensaje(false); 
                    }} 
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Send size={18} />Enviar Mensaje
                  </button>
                  <button onClick={() => setRedactarMensaje(false)} className={`flex-1 border ${border} py-2 rounded`}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSolicitudes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Gestión de Solicitudes</h2>
        <div className="flex gap-2">
          <select className={`p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
            <option>Todas</option>
            <option>Pendientes</option>
            <option>En proceso</option>
            <option>Completadas</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {solicitudes.map(solicitud => (
          <div key={solicitud.id} className={`${card} rounded-lg shadow p-4`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    solicitud.estado === 'pendiente' ? 'bg-orange-100 text-orange-700' :
                    solicitud.estado === 'en_proceso' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {solicitud.estado === 'pendiente' ? 'Pendiente' :
                     solicitud.estado === 'en_proceso' ? 'En Proceso' :
                     'Completado'}
                  </span>
                  <span className={`px-3 py-1 rounded text-xs ${
                    solicitud.prioridad === 'alta' ? 'bg-red-100 text-red-700' :
                    solicitud.prioridad === 'media' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {solicitud.prioridad.toUpperCase()}
                  </span>
                </div>
                <h4 className={`font-bold ${text}`}>{solicitud.asunto}</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {solicitud.usuario} • {solicitud.tipo.charAt(0).toUpperCase() + solicitud.tipo.slice(1)} • {solicitud.fecha}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSolicitudDetalle(solicitud)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye size={18} />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                  <CheckCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {solicitudDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSolicitudDetalle(null)}>
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Detalle de Solicitud</h3>
              <button onClick={() => setSolicitudDetalle(null)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Tipo</label>
                <p className={text}>{solicitudDetalle.tipo}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Usuario</label>
                <p className={text}>{solicitudDetalle.usuario}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Asunto</label>
                <p className={text}>{solicitudDetalle.asunto}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Respuesta</label>
                <textarea className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`} rows="4" placeholder="Escribe tu respuesta..."></textarea>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Aprobar</button>
                <button className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700">Rechazar</button>
                <button onClick={() => setSolicitudDetalle(null)} className={`flex-1 border ${border} py-2 rounded`}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsuarios = () => {
    const usuariosFiltrados = filtroUsuarios === 'todos' ? usuarios : usuarios.filter(u => u.rol === filtroUsuarios);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${text}`}>Gestión de Usuarios</h2>
          <div className="flex gap-2">
            <button onClick={() => setComunicacionMasivaModal(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
              <Send size={18} />Comunicación Masiva
            </button>
            <button onClick={() => setCreateUserModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <Plus size={18} />Crear Usuario
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {['todos', 'estudiante', 'docente', 'admin'].map(filtro => (
            <button
              key={filtro}
              onClick={() => setFiltroUsuarios(filtro)}
              className={`px-4 py-2 rounded ${
                filtroUsuarios === filtro
                  ? 'bg-blue-600 text-white'
                  : `border ${border} ${text}`
              }`}
            >
              {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
            </button>
          ))}
        </div>

        <div className={`${card} rounded-lg shadow overflow-hidden`}>
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Usuario</th>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Rol</th>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Estado</th>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Último Acceso</th>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} className={`border-t ${border}`}>
                  <td className="p-3">
                    <div>
                      <p className={`font-semibold ${text}`}>{usuario.nombre}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{usuario.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded text-xs ${
                      usuario.rol === 'admin' ? 'bg-purple-100 text-purple-700' :
                      usuario.rol === 'docente' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded text-xs ${
                      usuario.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className={`p-3 text-sm ${text}`}>{usuario.ultimoAcceso}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {usuario.rol === 'estudiante' && (
                        <button onClick={() => setVerHistorialModal(usuario)} className="p-2 text-purple-600 hover:bg-purple-50 rounded" title="Ver historial académico">
                          <BookOpen size={16} />
                        </button>
                      )}
                      <button onClick={() => setEditUserModal(usuario)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => eliminarUsuario(usuario.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Historial Académico */}
        {verHistorialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setVerHistorialModal(null)}>
            <div className={`${card} rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${text}`}>Historial Académico</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{verHistorialModal.nombre}</p>
                </div>
                <button onClick={() => setVerHistorialModal(null)}><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Promedio General</p>
                    <p className={`text-2xl font-bold ${text}`}>4.2</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cursos Aprobados</p>
                    <p className={`text-2xl font-bold ${text}`}>12</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Créditos Acumulados</p>
                    <p className={`text-2xl font-bold ${text}`}>48</p>
                  </div>
                </div>

                <div>
                  <h4 className={`font-bold mb-3 ${text}`}>Cursos Cursados</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                          <th className={`p-3 text-left text-sm font-semibold ${text}`}>Curso</th>
                          <th className={`p-3 text-left text-sm font-semibold ${text}`}>Semestre</th>
                          <th className={`p-3 text-left text-sm font-semibold ${text}`}>Nota</th>
                          <th className={`p-3 text-left text-sm font-semibold ${text}`}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialAcademico.filter(h => h.estudiante === verHistorialModal.nombre).map(hist => (
                          <tr key={hist.id} className={`border-t ${border}`}>
                            <td className={`p-3 ${text}`}>{hist.curso}</td>
                            <td className={`p-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{hist.semestre}</td>
                            <td className={`p-3 font-semibold text-blue-600`}>{hist.nota}</td>
                            <td className="p-3">
                              <span className={`px-3 py-1 rounded text-xs ${
                                hist.estado === 'Aprobado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {hist.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setVerHistorialModal(null)} className={`px-6 py-2 border ${border} rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Comunicación Masiva */}
        {comunicacionMasivaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setComunicacionMasivaModal(false)}>
            <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between mb-4">
                <h3 className={`text-xl font-bold ${text}`}>Comunicación Masiva</h3>
                <button onClick={() => setComunicacionMasivaModal(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Destinatarios</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Todos', 'Estudiantes', 'Docentes', 'Administradores'].map(grupo => (
                      <button key={grupo} className={`px-4 py-2 rounded border ${border} hover:bg-blue-50 ${darkMode ? 'hover:bg-blue-900' : ''}`}>
                        {grupo}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Asunto</label>
                  <input 
                    type="text" 
                    placeholder="Asunto del mensaje"
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mensaje</label>
                  <textarea 
                    rows="8" 
                    placeholder="Escribe tu mensaje aquí..."
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { 
                      alert('Mensaje enviado a los destinatarios seleccionados'); 
                      setComunicacionMasivaModal(false); 
                    }} 
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Send size={18} />Enviar Mensaje
                  </button>
                  <button onClick={() => setComunicacionMasivaModal(false)} className={`flex-1 border ${border} py-2 rounded`}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear Usuario */}
        {createUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setCreateUserModal(false)}>
            <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${text}`}>Crear Nuevo Usuario</h3>
                <button onClick={() => setCreateUserModal(false)}><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nombre Completo *</label>
                    <input
                      type="text"
                      value={nuevoUsuario.nombre}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
                      placeholder="Juan Pérez"
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      value={nuevoUsuario.email}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                      placeholder="juan.perez@university.edu"
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Rol *</label>
                    <select
                      value={nuevoUsuario.rol}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    >
                      <option value="estudiante">Estudiante</option>
                      <option value="docente">Docente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Estado *</label>
                    <select
                      value={nuevoUsuario.estado}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, estado: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                {nuevoUsuario.rol === 'estudiante' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Carrera</label>
                    <input
                      type="text"
                      value={nuevoUsuario.carrera}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, carrera: e.target.value})}
                      placeholder="Ingeniería en Sistemas"
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                )}

                {nuevoUsuario.rol === 'docente' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Departamento</label>
                    <input
                      type="text"
                      value={nuevoUsuario.departamento}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, departamento: e.target.value})}
                      placeholder="Ciencias de la Computación"
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                )}

                {nuevoUsuario.rol === 'admin' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Posición</label>
                    <input
                      type="text"
                      value={nuevoUsuario.posicion}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, posicion: e.target.value})}
                      placeholder="Coordinador Académico"
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={crearUsuario}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Crear Usuario
                  </button>
                  <button 
                    onClick={() => setCreateUserModal(false)}
                    className={`flex-1 border ${border} py-2 rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Usuario */}
        {editUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEditUserModal(null)}>
            <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${text}`}>Editar Usuario</h3>
                <button onClick={() => setEditUserModal(null)}><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nombre Completo *</label>
                    <input
                      type="text"
                      value={editUserModal.nombre}
                      onChange={(e) => setEditUserModal({...editUserModal, nombre: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      value={editUserModal.email}
                      onChange={(e) => setEditUserModal({...editUserModal, email: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Rol *</label>
                    <select
                      value={editUserModal.rol}
                      onChange={(e) => setEditUserModal({...editUserModal, rol: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    >
                      <option value="estudiante">Estudiante</option>
                      <option value="docente">Docente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Estado *</label>
                    <select
                      value={editUserModal.estado}
                      onChange={(e) => setEditUserModal({...editUserModal, estado: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                {editUserModal.rol === 'estudiante' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Carrera</label>
                    <input
                      type="text"
                      value={editUserModal.carrera || ''}
                      onChange={(e) => setEditUserModal({...editUserModal, carrera: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                )}

                {editUserModal.rol === 'docente' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Departamento</label>
                    <input
                      type="text"
                      value={editUserModal.departamento || ''}
                      onChange={(e) => setEditUserModal({...editUserModal, departamento: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                )}

                {editUserModal.rol === 'admin' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Posición</label>
                    <input
                      type="text"
                      value={editUserModal.posicion || ''}
                      onChange={(e) => setEditUserModal({...editUserModal, posicion: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={editarUsuario}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Guardar Cambios
                  </button>
                  <button 
                    onClick={() => setEditUserModal(null)}
                    className={`flex-1 border ${border} py-2 rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}
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
  };

  const renderFinanzas = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Gestión Financiera</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Ingresos Totales', value: `$${metricas.ingresosMensuales.toLocaleString()}`, color: 'border-green-500', icon: DollarSign, change: '+18%' },
          { label: 'Pagos Pendientes', value: '$45,200', color: 'border-orange-500', icon: Clock, change: '-5%' },
          { label: 'Transacciones', value: transacciones.length, color: 'border-blue-500', icon: CreditCard, change: '+12%' }
        ].map((stat, i) => (
          <div key={i} className={`${card} rounded-lg shadow p-4 border-l-4 ${stat.color}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${text}`}>{stat.value}</p>
              </div>
              <stat.icon className={stat.color.replace('border-', 'text-')} size={32} />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className={stat.change.includes('+') ? 'text-green-600' : 'text-red-600'}>{stat.change}</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${text}`}>Transacciones Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Estudiante</th>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Concepto</th>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Monto</th>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Fecha</th>
                <th className={`p-3 text-left text-sm font-semibold ${text}`}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map(trans => (
                <tr key={trans.id} className={`border-t ${border}`}>
                  <td className={`p-3 ${text}`}>{trans.estudiante}</td>
                  <td className={`p-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{trans.concepto}</td>
                  <td className={`p-3 font-semibold text-green-600`}>${trans.monto.toLocaleString()}</td>
                  <td className={`p-3 text-sm ${text}`}>{trans.fecha}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded text-xs ${
                      trans.estado === 'completado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {trans.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Ingresos por Concepto</h3>
          <div className="space-y-3">
            {[
              { concepto: 'Matrículas', porcentaje: 65, monto: 213525 },
              { concepto: 'Certificados', porcentaje: 20, monto: 65700 },
              { concepto: 'Cursos Adicionales', porcentaje: 15, monto: 49275 }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm font-semibold ${text}`}>{item.concepto}</span>
                  <span className={`text-sm font-semibold text-green-600`}>${item.monto.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${item.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Acciones Rápidas</h3>
          <div className="space-y-2">
            {[
              { label: 'Generar Reporte Financiero', icon: Download },
              { label: 'Exportar Transacciones', icon: Upload },
              { label: 'Ver Gráficos Detallados', icon: BarChart3 }
            ].map((accion, i) => (
              <button key={i} className={`w-full flex items-center gap-2 p-3 rounded-lg border ${border} hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition text-left`}>
                <accion.icon size={18} className="text-blue-600" />
                <span className={`text-sm ${text}`}>{accion.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportes = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Centro de Reportes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { titulo: 'Reporte de Estudiantes', descripcion: 'Estadísticas completas de estudiantes', icon: Users, color: 'bg-blue-500' },
          { titulo: 'Reporte Académico', descripcion: 'Rendimiento y calificaciones', icon: BookOpen, color: 'bg-green-500' },
          { titulo: 'Reporte Financiero', descripcion: 'Ingresos y transacciones', icon: DollarSign, color: 'bg-purple-500' },
          { titulo: 'Reporte de Asistencia', descripcion: 'Asistencia y participación', icon: CheckCircle, color: 'bg-orange-500' },
          { titulo: 'Reporte de Certificados', descripcion: 'Certificados generados', icon: Award, color: 'bg-pink-500' },
          { titulo: 'Reporte de Actividad', descripcion: 'Actividad en la plataforma', icon: TrendingUp, color: 'bg-indigo-500' }
        ].map((reporte, i) => (
          <div key={i} className={`${card} rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition`}>
            <div className={`${reporte.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <reporte.icon size={24} className="text-white" />
            </div>
            <h4 className={`font-bold mb-2 ${text}`}>{reporte.titulo}</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{reporte.descripcion}</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download size={16} />Generar
            </button>
          </div>
        ))}
      </div>

      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${text}`}>Reportes Personalizados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Tipo de Reporte</label>
            <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
              <option>Seleccionar tipo...</option>
              <option>Académico</option>
              <option>Financiero</option>
              <option>Administrativo</option>
              <option>Estadístico</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Período</label>
            <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
              <option>Último mes</option>
              <option>Último trimestre</option>
              <option>Último semestre</option>
              <option>Último año</option>
              <option>Personalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Formato</label>
            <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download size={18} />Generar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfiguracion = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Configuración del Sistema</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Notificaciones</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${text}`}>Notificaciones por Email</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recibir alertas por correo electrónico</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={platformConfig.emailNotifications}
                  onChange={(e) => actualizarConfiguracion('emailNotifications', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${text}`}>Notificaciones SMS</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recibir alertas por mensaje de texto</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={platformConfig.smsNotifications}
                  onChange={(e) => actualizarConfiguracion('smsNotifications', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Seguridad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${text}`}>Modo Mantenimiento</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Desactivar acceso temporal a la plataforma</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={platformConfig.maintenanceMode}
                  onChange={(e) => actualizarConfiguracion('maintenanceMode', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${text}`}>Registro Abierto</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Permitir nuevos registros de usuarios</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={platformConfig.allowRegistration}
                  onChange={(e) => actualizarConfiguracion('allowRegistration', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Límites del Sistema</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Tamaño máximo de archivo (MB)</label>
              <input
                type="number"
                value={platformConfig.maxFileSize}
                onChange={(e) => actualizarConfiguracion('maxFileSize', parseInt(e.target.value))}
                className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Tiempo de sesión (minutos)</label>
              <input
                type="number"
                value={platformConfig.sessionTimeout}
                onChange={(e) => actualizarConfiguracion('sessionTimeout', parseInt(e.target.value))}
                className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
              />
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Copias de Seguridad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
              <div>
                <p className="text-sm font-semibold text-green-800">Última copia de seguridad</p>
                <p className="text-xs text-green-600">03 de Octubre, 2025 - 02:00 AM</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download size={18} />Crear Copia de Seguridad
            </button>
          </div>
        </div>
      </div>

      <div className={`${card} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${text}`}>Logs de Auditoría</h3>
          <button onClick={() => setLogsAuditoriaModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
            <Eye size={18} />Ver Todos los Logs
          </button>
        </div>
        <div className="space-y-2">
          {logsAuditoria.slice(0, 5).map(log => (
            <div key={log.id} className={`flex items-start gap-3 p-3 rounded-lg border ${border} hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition`}>
              <Clock size={16} className="text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-sm ${text}`}>{log.accion}</p>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{log.fecha}</span>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {log.usuario} • {log.detalle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Logs de Auditoría */}
      {logsAuditoriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setLogsAuditoriaModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Logs de Auditoría del Sistema</h3>
              <button onClick={() => setLogsAuditoriaModal(false)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar en logs..." 
                  className={`flex-1 p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  <Search size={18} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>Fecha/Hora</th>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>Usuario</th>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>Acción</th>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>Detalle</th>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsAuditoria.map(log => (
                      <tr key={log.id} className={`border-t ${border}`}>
                        <td className={`p-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{log.fecha}</td>
                        <td className={`p-3 ${text}`}>{log.usuario}</td>
                        <td className={`p-3`}>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {log.accion}
                          </span>
                        </td>
                        <td className={`p-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{log.detalle}</td>
                        <td className={`p-3 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
                <Download size={18} />Exportar Logs
              </button>
              <button onClick={() => setLogsAuditoriaModal(false)} className={`px-6 py-2 border ${border} rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button className={`px-6 py-2 border ${border} rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}>
          Restaurar Valores
        </button>
        <button 
          onClick={() => alert('Configuración guardada exitosamente!')}
          style={{ backgroundColor: platformConfig.primaryColor }}
          className="px-6 py-2 text-white rounded hover:opacity-90 flex items-center gap-2"
        >
          <Save size={18} />
          Guardar Configuración
        </button>
      </div>
    </div>
  );

  const renderPersonalizacion = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Personalización de Plataforma</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Configuración de Marca</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre de la Plataforma</label>
              <input
                type="text"
                value={platformConfig.platformName}
                onChange={(e) => actualizarConfiguracion('platformName', e.target.value)}
                className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre de la Universidad</label>
              <input
                type="text"
                value={platformConfig.universityName}
                onChange={(e) => actualizarConfiguracion('universityName', e.target.value)}
                className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Logo de la Plataforma</label>
              <div className={`border-2 border-dashed ${border} rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}>
                <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Arrastra tu logo aquí o haz clic para seleccionar
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${card} rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>Colores de la Plataforma</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Color Primario</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={platformConfig.primaryColor}
                  onChange={(e) => actualizarConfiguracion('primaryColor', e.target.value)}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={platformConfig.primaryColor}
                  onChange={(e) => actualizarConfiguracion('primaryColor', e.target.value)}
                  className={`flex-1 p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Color Secundario</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={platformConfig.secondaryColor}
                  onChange={(e) => actualizarConfiguracion('secondaryColor', e.target.value)}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={platformConfig.secondaryColor}
                  onChange={(e) => actualizarConfiguracion('secondaryColor', e.target.value)}
                  className={`flex-1 p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                />
              </div>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className="text-sm font-semibold mb-3">Vista Previa de Colores:</p>
              <div className="flex gap-2">
                <div style={{ backgroundColor: platformConfig.primaryColor }} className="w-20 h-20 rounded flex items-center justify-center text-white text-xs">
                  Primario
                </div>
                <div style={{ backgroundColor: platformConfig.secondaryColor }} className="w-20 h-20 rounded flex items-center justify-center text-white text-xs">
                  Secundario
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${text}`}>Vista Previa en Tiempo Real</h3>
        <div className="border-2 rounded-lg p-6" style={{ borderColor: platformConfig.primaryColor }}>
          <div className="flex items-center gap-4 mb-4">
            <div style={{ backgroundColor: platformConfig.primaryColor }} className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {platformConfig.platformName.charAt(0)}
            </div>
            <div>
              <h4 className={`text-2xl font-bold ${text}`}>{platformConfig.platformName}</h4>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{platformConfig.universityName}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button style={{ backgroundColor: platformConfig.primaryColor }} className="text-white px-6 py-2 rounded hover:opacity-90">
              Botón Primario
            </button>
            <button style={{ backgroundColor: platformConfig.secondaryColor }} className="text-white px-6 py-2 rounded hover:opacity-90">
              Botón Secundario
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className={`px-6 py-2 border ${border} rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}>
          Cancelar
        </button>
        <button 
          onClick={() => alert('Configuración guardada exitosamente!')}
          style={{ backgroundColor: platformConfig.primaryColor }}
          className="px-6 py-2 text-white rounded hover:opacity-90 flex items-center gap-2"
        >
          <Save size={18} />
          Guardar Cambios
        </button>
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Generación de Documentos</h2>
        <div className="flex gap-2">
          <button onClick={() => setHistorialQRModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2">
            <Eye size={18} />Historial QR
          </button>
          <button onClick={() => setGenerarCertificadoModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
            <Plus size={18} />Generar Documento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { titulo: 'Certificados de Estudio', cantidad: 145, icon: Award, color: 'bg-blue-500' },
          { titulo: 'Constancias de Notas', cantidad: 89, icon: FileText, color: 'bg-green-500' },
          { titulo: 'Códigos QR Generados', cantidad: historialQRState.length, icon: FileText, color: 'bg-purple-500' }
        ].map((tipo, i) => (
          <div key={i} className={`${card} rounded-lg shadow p-6`}>
            <div className={`${tipo.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <tipo.icon size={24} className="text-white" />
            </div>
            <h4 className={`font-bold mb-2 ${text}`}>{tipo.titulo}</h4>
            <p className="text-3xl font-bold text-blue-600">{tipo.cantidad}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
          </div>
        ))}
      </div>

      {/* Modal Historial de QR */}
      {historialQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setHistorialQRModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Historial de Códigos QR</h3>
              <button onClick={() => setHistorialQRModal(false)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>Documento</th>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>Código QR</th>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>Fecha</th>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>Verificaciones</th>
                      <th className={`p-3 text-left text-sm font-semibold ${text}`}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialQRState.map(qr => (
                      <tr key={qr.id} className={`border-t ${border}`}>
                        <td className={`p-3 ${text}`}>{qr.documento}</td>
                        <td className={`p-3`}>
                          <code className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {qr.codigo}
                          </code>
                        </td>
                        <td className={`p-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{qr.fecha}</td>
                        <td className={`p-3`}>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {qr.verificaciones} veces
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Ver QR">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded" title="Descargar">
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setHistorialQRModal(false)} className={`px-6 py-2 border ${border} rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {generarCertificadoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setGenerarCertificadoModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Generar Certificado</h3>
              <button onClick={() => setGenerarCertificadoModal(false)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de Documento</label>
                <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  <option>Certificado de Estudios</option>
                  <option>Constancia de Notas</option>
                  <option>Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Estudiante</label>
                <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  {usuarios.filter(u => u.rol === 'estudiante').map(est => (
                    <option key={est.id}>{est.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="generarQR" className="w-4 h-4" defaultChecked />
                <label htmlFor="generarQR" className="text-sm">Generar código QR de verificación</label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { 
                  const codigoQR = generarCodigoQR();
                  const nuevoQR = {
                    id: historialQRState.length + 1,
                    documento: 'Certificado de Estudios - Nuevo',
                    codigo: codigoQR,
                    fecha: new Date().toISOString().split('T')[0],
                    verificaciones: 0
                  };
                  setHistorialQRState([...historialQRState, nuevoQR]);
                  alert(`Certificado generado exitosamente con código QR: ${codigoQR}`); 
                  setGenerarCertificadoModal(false); 
                }} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Download size={18} />Generar PDF
                </button>
                <button onClick={() => setGenerarCertificadoModal(false)} className={`flex-1 border ${border} py-2 rounded`}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCursos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Gestión de Cursos</h2>
        <button onClick={() => setCreateCursoModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Crear Curso
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cursos.map(curso => (
          <div key={curso.id} className={`${card} rounded-lg shadow p-4`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-bold ${text}`}>{curso.nombre}</h4>
                  <span className={`px-3 py-1 rounded text-xs ${
                    curso.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {curso.estado}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Código: {curso.codigo} • Docente: {curso.docente} • {curso.estudiantes} estudiantes
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditCursoModal(curso)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit size={18} />
                </button>
                <button onClick={() => setVerCursoModal(curso)} className="p-2 text-green-600 hover:bg-green-50 rounded">
                  <Eye size={18} />
                </button>
                <button onClick={() => eliminarCurso(curso.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Curso */}
      {createCursoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setCreateCursoModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Crear Nuevo Curso</h3>
              <button onClick={() => setCreateCursoModal(false)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre del Curso *</label>
                  <input
                    type="text"
                    value={nuevoCurso.nombre}
                    onChange={(e) => setNuevoCurso({...nuevoCurso, nombre: e.target.value})}
                    placeholder="Programación Avanzada"
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Código del Curso *</label>
                  <input
                    type="text"
                    value={nuevoCurso.codigo}
                    onChange={(e) => setNuevoCurso({...nuevoCurso, codigo: e.target.value})}
                    placeholder="CS301"
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Docente *</label>
                  <select
                    value={nuevoCurso.docente}
                    onChange={(e) => setNuevoCurso({...nuevoCurso, docente: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  >
                    <option value="">Seleccionar docente...</option>
                    {usuarios.filter(u => u.rol === 'docente').map(doc => (
                      <option key={doc.id} value={doc.nombre}>{doc.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Estado *</label>
                  <select
                    value={nuevoCurso.estado}
                    onChange={(e) => setNuevoCurso({...nuevoCurso, estado: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Estudiantes Inscritos</label>
                  <input
                    type="number"
                    value={nuevoCurso.estudiantes}
                    onChange={(e) => setNuevoCurso({...nuevoCurso, estudiantes: e.target.value})}
                    placeholder="0"
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Duración</label>
                  <input
                    type="text"
                    value={nuevoCurso.duracion}
                    onChange={(e) => setNuevoCurso({...nuevoCurso, duracion: e.target.value})}
                    placeholder="16 semanas"
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Créditos</label>
                  <input
                    type="text"
                    value={nuevoCurso.creditos}
                    onChange={(e) => setNuevoCurso({...nuevoCurso, creditos: e.target.value})}
                    placeholder="4"
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Descripción del Curso</label>
                <textarea
                  value={nuevoCurso.descripcion}
                  onChange={(e) => setNuevoCurso({...nuevoCurso, descripcion: e.target.value})}
                  placeholder="Descripción detallada del curso..."
                  rows="4"
                  className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={crearCurso}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Crear Curso
                </button>
                <button 
                  onClick={() => setCreateCursoModal(false)}
                  className={`flex-1 border ${border} py-2 rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Curso */}
      {editCursoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEditCursoModal(null)}>
          <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Editar Curso</h3>
              <button onClick={() => setEditCursoModal(null)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre del Curso *</label>
                  <input
                    type="text"
                    value={editCursoModal.nombre}
                    onChange={(e) => setEditCursoModal({...editCursoModal, nombre: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Código del Curso *</label>
                  <input
                    type="text"
                    value={editCursoModal.codigo}
                    onChange={(e) => setEditCursoModal({...editCursoModal, codigo: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Docente *</label>
                  <select
                    value={editCursoModal.docente}
                    onChange={(e) => setEditCursoModal({...editCursoModal, docente: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  >
                    <option value="">Seleccionar docente...</option>
                    {usuarios.filter(u => u.rol === 'docente').map(doc => (
                      <option key={doc.id} value={doc.nombre}>{doc.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Estado *</label>
                  <select
                    value={editCursoModal.estado}
                    onChange={(e) => setEditCursoModal({...editCursoModal, estado: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Estudiantes Inscritos</label>
                  <input
                    type="number"
                    value={editCursoModal.estudiantes}
                    onChange={(e) => setEditCursoModal({...editCursoModal, estudiantes: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Duración</label>
                  <input
                    type="text"
                    value={editCursoModal.duracion || ''}
                    onChange={(e) => setEditCursoModal({...editCursoModal, duracion: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Créditos</label>
                  <input
                    type="text"
                    value={editCursoModal.creditos || ''}
                    onChange={(e) => setEditCursoModal({...editCursoModal, creditos: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Descripción del Curso</label>
                <textarea
                  value={editCursoModal.descripcion || ''}
                  onChange={(e) => setEditCursoModal({...editCursoModal, descripcion: e.target.value})}
                  rows="4"
                  className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={editarCurso}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Guardar Cambios
                </button>
                <button 
                  onClick={() => setEditCursoModal(null)}
                  className={`flex-1 border ${border} py-2 rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles del Curso */}
      {verCursoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setVerCursoModal(null)}>
          <div className={`${card} rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Detalles del Curso</h3>
              <button onClick={() => setVerCursoModal(null)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-2xl font-bold ${text}`}>{verCursoModal.nombre}</h4>
                  <span className={`px-4 py-2 rounded text-sm font-semibold ${
                    verCursoModal.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {verCursoModal.estado.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Código</p>
                    <p className={`font-semibold ${text}`}>{verCursoModal.codigo}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Docente</p>
                    <p className={`font-semibold ${text}`}>{verCursoModal.docente}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estudiantes</p>
                    <p className={`font-semibold ${text}`}>{verCursoModal.estudiantes}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Créditos</p>
                    <p className={`font-semibold ${text}`}>{verCursoModal.creditos || 'N/A'}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Duración</p>
                  <p className={`font-semibold ${text}`}>{verCursoModal.duracion || 'No especificada'}</p>
                </div>

                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Descripción</p>
                  <p className={text}>{verCursoModal.descripcion || 'No hay descripción disponible'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setVerCursoModal(null); setEditCursoModal(verCursoModal); }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Editar Curso
                </button>
                <button 
                  onClick={() => setVerCursoModal(null)}
                  className={`flex-1 border ${border} py-2 rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInscripcion = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Inscripción de Estudiantes</h2>
        <button onClick={() => setInscripcionModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Inscribir Estudiante
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cursos.filter(c => c.estado === 'activo').slice(0, 3).map(curso => (
          <div key={curso.id} className={`${card} rounded-lg shadow p-4`}>
            <h4 className={`font-bold mb-2 ${text}`}>{curso.nombre}</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              Código: {curso.codigo}
            </p>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Cupos ocupados</span>
                <span className="font-semibold">{curso.estudiantes}/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(curso.estudiantes / 50) * 100}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={() => setInscripcionModal(true)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
            >
              Inscribir Estudiante
            </button>
          </div>
        ))}
      </div>

      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${text}`}>Inscripciones Recientes</h3>
        <div className="space-y-3">
          {[
            { estudiante: 'María González', curso: 'Programación Avanzada', fecha: '2025-10-03', estado: 'Confirmada' },
            { estudiante: 'Luis Torres', curso: 'Diseño de Interfaces', fecha: '2025-10-02', estado: 'Pendiente' },
            { estudiante: 'Ana Martínez', curso: 'Base de Datos', fecha: '2025-10-02', estado: 'Confirmada' }
          ].map((inscripcion, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${border}`}>
              <div className="flex-1">
                <p className={`font-semibold ${text}`}>{inscripcion.estudiante}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {inscripcion.curso} • {inscripcion.fecha}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${
                inscripcion.estado === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {inscripcion.estado}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Inscripción */}
      {inscripcionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setInscripcionModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Inscribir Estudiante a Curso</h3>
              <button onClick={() => setInscripcionModal(false)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Estudiante *</label>
                <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  <option value="">Seleccionar estudiante...</option>
                  {usuarios.filter(u => u.rol === 'estudiante').map(est => (
                    <option key={est.id} value={est.id}>{est.nombre} - {est.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Curso *</label>
                <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  <option value="">Seleccionar curso...</option>
                  {cursos.filter(c => c.estado === 'activo').map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre} ({curso.codigo}) - {curso.estudiantes}/50 cupos
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Semestre</label>
                <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  <option>2025-2</option>
                  <option>2025-1</option>
                  <option>2024-2</option>
                </select>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className="text-sm font-semibold mb-2">Validación de Requisitos</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Estudiante activo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Sin deudas pendientes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Cupos disponibles en el curso</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { 
                    alert('Estudiante inscrito exitosamente'); 
                    setInscripcionModal(false); 
                  }} 
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Confirmar Inscripción
                </button>
                <button 
                  onClick={() => setInscripcionModal(false)}
                  className={`flex-1 border ${border} py-2 rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}
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

  const renderAnuncios = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Anuncios Institucionales</h2>
        <button onClick={() => setCrearAnuncioModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Crear Anuncio
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {anuncios.map(anuncio => (
          <div key={anuncio.id} className={`${card} rounded-lg shadow p-4`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-bold ${text}`}>{anuncio.titulo}</h4>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    anuncio.estado === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {anuncio.estado}
                  </span>
                  <span className={`px-3 py-1 rounded text-xs ${
                    anuncio.prioridad === 'alta' ? 'bg-red-100 text-red-700' :
                    anuncio.prioridad === 'media' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {anuncio.prioridad.toUpperCase()}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 line-clamp-2`}>
                  {anuncio.contenido}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span>{anuncio.autor}</span>
                  <span>•</span>
                  <span>{anuncio.fecha}</span>
                  {anuncio.adjuntos.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Upload size={12} />
                        {anuncio.adjuntos.length} archivo(s)
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setVerAnuncioModal(anuncio)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye size={18} />
                </button>
                <button onClick={() => setEditarAnuncioModal(anuncio)} className="p-2 text-green-600 hover:bg-green-50 rounded">
                  <Edit size={18} />
                </button>
                <button onClick={() => {
                  if (window.confirm('¿Eliminar este anuncio?')) {
                    setAnuncios(anuncios.filter(a => a.id !== anuncio.id));
                  }
                }} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Anuncio */}
      {crearAnuncioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setCrearAnuncioModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Crear Anuncio Institucional</h3>
              <button onClick={() => setCrearAnuncioModal(false)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Título *</label>
                <input
                  type="text"
                  value={nuevoAnuncio.titulo}
                  onChange={(e) => setNuevoAnuncio({...nuevoAnuncio, titulo: e.target.value})}
                  placeholder="Título del anuncio"
                  className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Contenido *</label>
                <textarea
                  value={nuevoAnuncio.contenido}
                  onChange={(e) => setNuevoAnuncio({...nuevoAnuncio, contenido: e.target.value})}
                  placeholder="Contenido del anuncio..."
                  rows="6"
                  className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Prioridad</label>
                  <select
                    value={nuevoAnuncio.prioridad}
                    onChange={(e) => setNuevoAnuncio({...nuevoAnuncio, prioridad: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Estado</label>
                  <select
                    value={nuevoAnuncio.estado}
                    onChange={(e) => setNuevoAnuncio({...nuevoAnuncio, estado: e.target.value})}
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  >
                    <option value="borrador">Borrador</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Archivos Adjuntos</label>
                <div className={`border-2 border-dashed ${border} rounded-lg p-4`}>
                  <button
                    onClick={() => agregarAdjunto(setNuevoAnuncio, nuevoAnuncio)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Upload size={18} />
                    Agregar Archivo
                  </button>
                  {nuevoAnuncio.adjuntos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {nuevoAnuncio.adjuntos.map((archivo, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{archivo}</span>
                          <button
                            onClick={() => eliminarAdjunto(setNuevoAnuncio, nuevoAnuncio, index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (!nuevoAnuncio.titulo || !nuevoAnuncio.contenido) {
                      alert('Por favor completa los campos obligatorios');
                      return;
                    }
                    setAnuncios([...anuncios, {
                      id: anuncios.length + 1,
                      ...nuevoAnuncio,
                      fecha: new Date().toISOString().split('T')[0],
                      autor: 'Admin Ana'
                    }]);
                    setNuevoAnuncio({ titulo: '', contenido: '', prioridad: 'media', estado: 'borrador', adjuntos: [] });
                    setCrearAnuncioModal(false);
                    alert('Anuncio creado exitosamente');
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Crear Anuncio
                </button>
                <button 
                  onClick={() => setCrearAnuncioModal(false)}
                  className={`flex-1 border ${border} py-2 rounded`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Anuncio */}
      {verAnuncioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setVerAnuncioModal(null)}>
          <div className={`${card} rounded-lg p-6 max-w-3xl w-full`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>{verAnuncioModal.titulo}</h3>
              <button onClick={() => setVerAnuncioModal(null)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={text}>{verAnuncioModal.contenido}</p>
              </div>
              {verAnuncioModal.adjuntos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Archivos Adjuntos:</p>
                  <div className="space-y-2">
                    {verAnuncioModal.adjuntos.map((archivo, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <FileText size={16} className="text-blue-600" />
                        <span className="text-sm">{archivo}</span>
                        <button className="ml-auto text-blue-600">
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button onClick={() => setVerAnuncioModal(null)} className={`px-6 py-2 border ${border} rounded`}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Inscripción de Estudiantes</h2>
        <button onClick={() => setInscripcionModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Inscribir Estudiante
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cursos.filter(c => c.estado === 'activo').slice(0, 3).map(curso => (
          <div key={curso.id} className={`${card} rounded-lg shadow p-4`}>
            <h4 className={`font-bold mb-2 ${text}`}>{curso.nombre}</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              Código: {curso.codigo}
            </p>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Cupos ocupados</span>
                <span className="font-semibold">{curso.estudiantes}/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(curso.estudiantes / 50) * 100}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={() => setInscripcionModal(true)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
            >
              Inscribir Estudiante
            </button>
          </div>
        ))}
      </div>

      <div className={`${card} rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-bold mb-4 ${text}`}>Inscripciones Recientes</h3>
        <div className="space-y-3">
          {[
            { estudiante: 'María González', curso: 'Programación Avanzada', fecha: '2025-10-03', estado: 'Confirmada' },
            { estudiante: 'Luis Torres', curso: 'Diseño de Interfaces', fecha: '2025-10-02', estado: 'Pendiente' },
            { estudiante: 'Ana Martínez', curso: 'Base de Datos', fecha: '2025-10-02', estado: 'Confirmada' }
          ].map((inscripcion, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${border}`}>
              <div className="flex-1">
                <p className={`font-semibold ${text}`}>{inscripcion.estudiante}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {inscripcion.curso} • {inscripcion.fecha}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${
                inscripcion.estado === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {inscripcion.estado}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Inscripción */}
      {inscripcionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setInscripcionModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Inscribir Estudiante a Curso</h3>
              <button onClick={() => setInscripcionModal(false)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Estudiante *</label>
                <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  <option value="">Seleccionar estudiante...</option>
                  {usuarios.filter(u => u.rol === 'estudiante').map(est => (
                    <option key={est.id} value={est.id}>{est.nombre} - {est.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Curso *</label>
                <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  <option value="">Seleccionar curso...</option>
                  {cursos.filter(c => c.estado === 'activo').map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre} ({curso.codigo}) - {curso.estudiantes}/50 cupos
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Semestre</label>
                <select className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  <option>2025-2</option>
                  <option>2025-1</option>
                  <option>2024-2</option>
                </select>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className="text-sm font-semibold mb-2">Validación de Requisitos</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Estudiante activo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Sin deudas pendientes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Cupos disponibles en el curso</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { 
                    alert('Estudiante inscrito exitosamente'); 
                    setInscripcionModal(false); 
                  }} 
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Confirmar Inscripción
                </button>
                <button 
                  onClick={() => setInscripcionModal(false)}
                  className={`flex-1 border ${border} py-2 rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}
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

  const renderPlantillas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Plantillas de Certificados</h2>
        <button onClick={() => setCrearPlantillaModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />Crear Plantilla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plantillas.map(plantilla => (
          <div key={plantilla.id} className={`${card} rounded-lg shadow overflow-hidden`}>
            <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
              <div className="text-center transform scale-50">
                {renderizarCertificado(plantilla)}
              </div>
              <span className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold ${
                plantilla.estado === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {plantilla.estado}
              </span>
            </div>
            <div className="p-4">
              <h4 className={`font-bold mb-2 ${text}`}>{plantilla.nombre}</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 line-clamp-2`}>
                {plantilla.descripcion}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setVistaPreviewPlantilla(plantilla)} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1">
                  <Eye size={16} />Vista Previa
                </button>
                <button onClick={() => setEditarPlantillaModal(plantilla)} className="p-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                  <Edit size={16} />
                </button>
                <button onClick={() => duplicarPlantilla(plantilla)} className="p-2 text-green-600 border border-green-600 rounded hover:bg-green-50">
                  <FileText size={16} />
                </button>
                <button onClick={() => eliminarPlantilla(plantilla.id)} className="p-2 text-red-600 border border-red-600 rounded hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
              <button onClick={() => setGenerarCertificadoPlantilla(plantilla)} className="w-full mt-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm flex items-center justify-center gap-1">
                <Download size={16} />Generar Certificado
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Plantilla */}
      {crearPlantillaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4" onClick={() => setCrearPlantillaModal(false)}>
          <div className={`${card} rounded-lg p-6 max-w-6xl w-full my-8`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Crear Nueva Plantilla</h3>
              <button onClick={() => setCrearPlantillaModal(false)}><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre de la Plantilla *</label>
                  <input
                    type="text"
                    value={nuevaPlantilla.nombre}
                    onChange={(e) => setNuevaPlantilla({...nuevaPlantilla, nombre: e.target.value})}
                    placeholder="Certificado de Aprobación"
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Descripción</label>
                  <textarea
                    value={nuevaPlantilla.descripcion}
                    onChange={(e) => setNuevaPlantilla({...nuevaPlantilla, descripcion: e.target.value})}
                    placeholder="Descripción de la plantilla..."
                    rows="2"
                    className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tamaño</label>
                    <select
                      value={nuevaPlantilla.configuracion.tamano}
                      onChange={(e) => setNuevaPlantilla({...nuevaPlantilla, configuracion: {...nuevaPlantilla.configuracion, tamano: e.target.value}})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    >
                      <option>A4</option>
                      <option>A3</option>
                      <option>Carta</option>
                      <option>Oficio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Orientación</label>
                    <select
                      value={nuevaPlantilla.configuracion.orientacion}
                      onChange={(e) => setNuevaPlantilla({...nuevaPlantilla, configuracion: {...nuevaPlantilla.configuracion, orientacion: e.target.value}})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}
                    >
                      <option value="horizontal">Horizontal</option>
                      <option value="vertical">Vertical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Color de Fondo</label>
                  <input
                    type="color"
                    value={nuevaPlantilla.configuracion.fondo}
                    onChange={(e) => setNuevaPlantilla({...nuevaPlantilla, configuracion: {...nuevaPlantilla.configuracion, fondo: e.target.value}})}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                  <h4 className="font-semibold mb-3">Agregar Componente</h4>
                  <div className="space-y-3">
                    <select
                      value={nuevoComponente.tipo}
                      onChange={(e) => setNuevoComponente({...nuevoComponente, tipo: e.target.value})}
                      className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-600' : ''}`}
                    >
                      <option value="texto">Texto</option>
                      <option value="campo_dinamico">Campo Dinámico</option>
                      <option value="qr_code">Código QR</option>
                      <option value="firma">Firma Digital</option>
                    </select>

                    {nuevoComponente.tipo === 'texto' ? (
                      <input
                        type="text"
                        placeholder="Contenido del texto"
                        value={nuevoComponente.contenido}
                        onChange={(e) => setNuevoComponente({...nuevoComponente, contenido: e.target.value})}
                        className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-600' : ''}`}
                      />
                    ) : nuevoComponente.tipo === 'campo_dinamico' ? (
                      <select
                        value={nuevoComponente.campo}
                        onChange={(e) => setNuevoComponente({...nuevoComponente, campo: e.target.value})}
                        className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-600' : ''}`}
                      >
                        <option value="">[nombre_estudiante]</option>
                        <option value="[nombre_estudiante]">[nombre_estudiante]</option>
                        <option value="[nombre_curso]">[nombre_curso]</option>
                        <option value="[fecha_emision]">[fecha_emision]</option>
                        <option value="[nota_final]">[nota_final]</option>
                        <option value="[codigo_verificacion]">[codigo_verificacion]</option>
                      </select>
                    ) : nuevoComponente.tipo === 'qr_code' ? (
                      <div className={`p-3 rounded ${darkMode ? 'bg-gray-600' : 'bg-blue-50'} text-sm`}>
                        <p className="font-semibold mb-1">Código QR de Verificación</p>
                        <p className="text-xs">Se generará automáticamente un código único para cada certificado</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className={`p-3 rounded ${darkMode ? 'bg-gray-600' : 'bg-purple-50'} text-sm mb-2`}>
                          <p className="font-semibold mb-1">Firma Digital</p>
                          <p className="text-xs">Máximo 3 firmas por certificado ({(nuevaPlantilla.componentes || []).filter(c => c.tipo === 'firma').length}/3)</p>
                        </div>
                        <input
                          type="text"
                          placeholder="Nombre del firmante"
                          value={nuevoComponente.nombreFirmante}
                          onChange={(e) => setNuevoComponente({...nuevoComponente, nombreFirmante: e.target.value})}
                          className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-600' : ''}`}
                        />
                        <input
                          type="text"
                          placeholder="Cargo o posición"
                          value={nuevoComponente.cargo}
                          onChange={(e) => setNuevoComponente({...nuevoComponente, cargo: e.target.value})}
                          className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-600' : ''}`}
                        />
                      </div>
                    )}

                    {nuevoComponente.tipo !== 'qr_code' && nuevoComponente.tipo !== 'firma' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Tamaño (px)"
                          value={parseInt(nuevoComponente.estilos.fontSize)}
                          onChange={(e) => setNuevoComponente({...nuevoComponente, estilos: {...nuevoComponente.estilos, fontSize: e.target.value + 'px'}})}
                          className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-600' : ''}`}
                        />
                        <select
                          value={nuevoComponente.estilos.fontWeight}
                          onChange={(e) => setNuevoComponente({...nuevoComponente, estilos: {...nuevoComponente.estilos, fontWeight: e.target.value}})}
                          className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-600' : ''}`}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Negrita</option>
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Top (ej: 100px)"
                        value={nuevoComponente.posicion.top}
                        onChange={(e) => setNuevoComponente({...nuevoComponente, posicion: {...nuevoComponente.posicion, top: e.target.value}})}
                        className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-600' : ''}`}
                      />
                      <input
                        type="text"
                        placeholder="Left/Right (ej: 50px)"
                        value={nuevoComponente.posicion.left || ''}
                        onChange={(e) => setNuevoComponente({...nuevoComponente, posicion: {...nuevoComponente.posicion, left: e.target.value}})}
                        className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-600' : ''}`}
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (nuevoComponente.tipo === 'qr_code' || nuevoComponente.tipo === 'firma') {
                          agregarComponenteAPlantilla({...nuevaPlantilla}, setNuevaPlantilla);
                        } else {
                          agregarComponenteAPlantilla(nuevaPlantilla, setNuevaPlantilla);
                        }
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Agregar Componente
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Vista Previa</h4>
                <div className="border rounded-lg p-4 overflow-auto" style={{maxHeight: '600px'}}>
                  {renderizarCertificado(nuevaPlantilla)}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={crearPlantilla}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={18} />Crear Plantilla
              </button>
              <button 
                onClick={() => setCrearPlantillaModal(false)}
                className={`flex-1 border ${border} py-2 rounded hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa */}
      {vistaPreviewPlantilla && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setVistaPreviewPlantilla(null)}>
          <div className={`${card} rounded-lg p-6 max-w-5xl w-full`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Vista Previa - {vistaPreviewPlantilla.nombre}</h3>
              <button onClick={() => setVistaPreviewPlantilla(null)}><X size={24} /></button>
            </div>
            <div className="overflow-auto" style={{maxHeight: '70vh'}}>
              {renderizarCertificado(vistaPreviewPlantilla, {
                nombre: 'Juan Pérez García',
                curso: 'Desarrollo Web Avanzado',
                fecha: '15 de Octubre, 2025',
                nota: '4.8'
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Generar Certificado */}
      {generarCertificadoPlantilla && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setGenerarCertificadoPlantilla(null)}>
          <div className={`${card} rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-xl font-bold ${text}`}>Generar Certificado</h3>
              <button onClick={() => setGenerarCertificadoPlantilla(null)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Plantilla Seleccionada</label>
                <input
                  type="text"
                  value={generarCertificadoPlantilla.nombre}
                  disabled
                  className={`w-full p-2 border ${border} rounded bg-gray-100`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Estudiante</label>
                <select id="estudiante-select" className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  {usuarios.filter(u => u.rol === 'estudiante').map(est => (
                    <option key={est.id} value={est.nombre}>{est.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Curso</label>
                <select id="curso-select" className={`w-full p-2 border ${border} rounded ${darkMode ? 'bg-gray-700' : ''}`}>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.nombre}>{curso.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-blue-600" />
                  <p className="font-semibold text-sm">Código QR de Verificación</p>
                </div>
                <p className="text-xs">
                  Se generará automáticamente un código QR único para verificación del certificado
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => {
                  const estudiante = document.getElementById('estudiante-select').value;
                  const curso = document.getElementById('curso-select').value;
                  const codigoQR = generarCodigoQR();
                  
                  // Registrar en historial de QR
                  const nuevoQR = {
                    id: historialQRState.length + 1,
                    documento: `${generarCertificadoPlantilla.nombre} - ${estudiante}`,
                    codigo: codigoQR,
                    fecha: new Date().toISOString().split('T')[0],
                    verificaciones: 0
                  };
                  setHistorialQRState([...historialQRState, nuevoQR]);
                  
                  alert(`Certificado generado exitosamente\n\nCódigo QR: ${codigoQR}\nEstudiante: ${estudiante}\nCurso: ${curso}\n\nEl código QR ha sido registrado en el historial.`);
                  setGenerarCertificadoPlantilla(null);
                }} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Download size={18} />Generar Certificado con QR
                </button>
                <button onClick={() => setGenerarCertificadoPlantilla(null)} className={`flex-1 border ${border} py-2 rounded`}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'inicio': return renderInicio();
      case 'mensajes': return renderMensajes();
      case 'solicitudes': return renderSolicitudes();
      case 'inscripcion': return renderInscripcion();
      case 'plantillas': return renderPlantillas();
      case 'usuarios': return renderUsuarios();
      case 'finanzas': return renderFinanzas();
      case 'reportes': return renderReportes();
      case 'configuracion': return renderConfiguracion();
      case 'personalizacion': return renderPersonalizacion();
      case 'documentos': return renderDocumentos();
      case 'cursos': return renderCursos();
      default: return renderInicio();
    }
  };

  return (
    <ConfigContext.Provider value={{ config: platformConfig, updateConfig: actualizarConfiguracion }}>
      <div className={`flex h-screen ${bg}`}>
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-700 text-white transition-all duration-300 flex flex-col`}>
          <div className="p-4 flex items-center justify-between border-b border-blue-600">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: platformConfig.primaryColor }} className="w-8 h-8 rounded flex items-center justify-center text-white font-bold">
                  {platformConfig.platformName.charAt(0)}
                </div>
                <h1 className="text-lg font-bold">{platformConfig.platformName}</h1>
              </div>
            )}
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
                    activeSection === item.id ? 'bg-blue-600' : 'hover:bg-blue-800'
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
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800">
              <User size={20} />
              {sidebarOpen && <span className="text-sm">Admin Panel</span>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className={`${card} shadow-sm p-4 flex justify-between items-center`}>
            <h2 className={`text-2xl font-bold ${text}`}>
              {menuItems.find(i => i.id === activeSection)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full`}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setActiveSection('mensajes')} className="relative p-2 hover:bg-gray-100 rounded-full">
                <Mail size={24} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                {mensajesNoLeidos > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {mensajesNoLeidos}
                  </span>
                )}
              </button>
              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell size={24} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {metricas.solicitudesPendientes}
                </span>
              </button>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: platformConfig.primaryColor }} className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-semibold ${text}`}>Admin Panel</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>admin@university.edu</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </ConfigContext.Provider>
  );
}