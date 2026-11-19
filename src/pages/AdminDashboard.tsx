import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { X, User, Bell, TrendingUp, Users, FileText, Award, BookOpen, ClipboardCheck, PieChart, DollarSign, Building2, Upload, Mail, CheckCircle, Clock, Search, Download, Edit, Trash2, Eye, Send, Plus, Save, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTenantStore } from '../store/tenantStore';
import { tenantsApi } from '../api/endpoints/tenants';
import { messagesApi } from '../api/endpoints/student';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useSeccionEnUrl } from '../hooks/useSeccionEnUrl';
import { AppShell } from '../components/layout/AppShell';
import {
  NAV_ADMIN,
  esSeccionAdmin,
  type SeccionAdmin,
} from '../components/layout/navegacion';
import { Button, IconButton } from '../components/ui/Button';
import { Card, StatCard, StatusPill } from '../components/ui/Surface';
import { aHex, parsearHex, tintaSobre, useTheme } from '../theme';
import { coursesAdminApi } from '../api/endpoints/courses';
import { programasApi, inscripcionesApi, Programa } from '../api/endpoints/academico';
import { personasApi } from '../api/endpoints/personas';
import { plantillasCertificadoApi } from '../api/endpoints/certificate-templates';
import { comoArreglo } from '../utils/respuestaApi';
import { QuickSearchResult } from '../types/admin.types';
import {
  ActivosSection,
  InventarioSection,
  NominaSection,
  RecursosHumanosSection,
  FinanzasContabilidadSection,
  TramitesSection,
  MensajesAdminSection,
  BibliotecaSection,
  AnunciosSection,
  MensajesMasivosSection,
  AnalyticsSection,
  GestionAcademicaSection,
  InscripcionesProgramaSection
} from '../components/admin/sections';
import { CarnetizacionMejorada } from '../components/admin/carnetizacion/CarnetizacionMejorada';
import { SitioWebSection } from '../components/admin/sections/sitio-web/SitioWebSection';
import { AdmisionesSection } from '../components/admin/sections/admisiones/AdmisionesSection';
import { IntegracionesSection } from '../components/admin/sections/integraciones/IntegracionesSection';
import { avisar, confirmar } from '../components/ui';
import { tintaDeRelleno } from '../utils/tintas';
import { pulsable } from '../utils/pulsable';

// Context para configuración global
const ConfigContext = createContext(null);

const useConfig = () => useContext(ConfigContext);

/**
 * Texto legible encima de un color cualquiera. Los colores de marca vienen de
 * un selector, asi que no se puede dar por hecho que el blanco contraste: es
 * la misma cuenta que hace el tema para --pn-accent-ink.
 */
function tintaDe(color: string): string | undefined {
  const rgb = parsearHex(color);
  // Si el hex no es valido se devuelve undefined y React deja el color que
  // herede: mejor eso que forzar un blanco que a lo mejor no se lee.
  return rgb ? aHex(tintaSobre(rgb)) : undefined;
}

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const { resuelto, establecerTema } = useTheme();
  const [activeSection, setActiveSection] = useState<SeccionAdmin>('inicio');

  // Mantiene /admin/<seccion> en la barra de direcciones. La sección sigue
  // siendo useState; el hook solo la refleja, sin convertirla en <Route>.
  useSeccionEnUrl<SeccionAdmin>({
    base: '/admin',
    seccion: activeSection,
    setSeccion: setActiveSection,
    esValida: esSeccionAdmin,
  });

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
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    rol: 'estudiante',
    estado: 'activo',
    carrera: '',
    departamento: '',
    posicion: ''
  });
  const [verHistorialModal, setVerHistorialModal] = useState(null);
  const [comunicacionMasivaModal, setComunicacionMasivaModal] = useState(false);
  const [logsAuditoriaModal, setLogsAuditoriaModal] = useState(false);
  const [historialQRModal, setHistorialQRModal] = useState(false);

  // Estado para búsqueda rápida
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<QuickSearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
  const [plantillas, setPlantillas] = useState<any[]>([
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

  const { data: adminData, loading: adminLoading, error: adminError } = useAdminDashboard();

  // Métricas del dashboard (con fallback a datos de ejemplo mientras carga el backend)
  // Metricas reales, sin maquillaje: antes cada campo caia a una cifra
  // inventada (|| 2847, || 328500...) cuando el API devolvia 0, asi que una
  // institucion recien creada veia 2.847 estudiantes y $328.500 de ingresos.
  const metricas = {
    totalEstudiantes: adminData.metrics.totalEstudiantes ?? 0,
    totalDocentes: adminData.metrics.totalDocentes ?? 0,
    solicitudesPendientes: adminData.metrics.solicitudesPendientes ?? 0,
    certificadosGenerados: adminData.metrics.certificadosGenerados ?? 0,
    ingresosMensuales: adminData.metrics.ingresosMensuales ?? 0,
    cursosActivos: adminData.metrics.cursosActivos ?? 0,
    usuariosActivos: adminData.metrics.usuariosActivos ?? 0,
    satisfaccion: adminData.metrics.satisfaccion ?? 0
  };

  // Bandeja real: la lista venia escrita a mano (Maria Gonzalez y compania) y
  // el contador del sobre era un useState(5) fijo.
  const [mensajes, setMensajes] = useState<any[]>([]);

  // El menu "Solicitudes" duplicaba a "Tramites" con una tabla de datos
  // inventados y sin acciones; se retiro (TramitesSection es el modulo real).

  const [usuarios, setUsuarios] = useState<any[]>([]);

  const usuarioActual = useAuthStore((st) => st.user);
  const [cursos, setCursos] = useState<any[]>([]);
  // Programas reales para el alta de estudiantes (reemplaza el texto libre)
  const [programasAcademicos, setProgramasAcademicos] = useState<Programa[]>([]);


  // Función de búsqueda rápida
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const results: QuickSearchResult[] = [];
    const searchLower = query.toLowerCase();

    // Buscar en estudiantes
    usuarios.filter(u => u.rol === 'estudiante').forEach(estudiante => {
      if (estudiante.nombre.toLowerCase().includes(searchLower) ||
          estudiante.email.toLowerCase().includes(searchLower)) {
        results.push({
          id: estudiante.id,
          tipo: 'estudiante',
          titulo: estudiante.nombre,
          subtitulo: estudiante.email,
          icono: 'estudiante',
          url: `/admin/estudiantes/${estudiante.id}`
        });
      }
    });

    // Buscar en docentes
    usuarios.filter(u => u.rol === 'docente').forEach(docente => {
      if (docente.nombre.toLowerCase().includes(searchLower) ||
          docente.email.toLowerCase().includes(searchLower)) {
        results.push({
          id: docente.id,
          tipo: 'docente',
          titulo: docente.nombre,
          subtitulo: docente.email,
          icono: 'docente',
          url: `/admin/docentes/${docente.id}`
        });
      }
    });

    // Buscar en cursos
    cursos.forEach(curso => {
      if (curso.nombre.toLowerCase().includes(searchLower) ||
          curso.codigo.toLowerCase().includes(searchLower)) {
        results.push({
          id: curso.id,
          tipo: 'curso',
          titulo: curso.nombre,
          subtitulo: `Código: ${curso.codigo}`,
          icono: 'curso',
          url: `/admin/cursos/${curso.id}`
        });
      }
    });

    // Activos, empleados y libros salieron del buscador: iteraban los
    // *MockData, asi que devolvian resultados inventados con URLs inertes
    // mientras ignoraban los datos reales. Cuando sus secciones expongan
    // listas al nivel de pagina, se reincorporan buscando sobre esas.

    setSearchResults(results.slice(0, 8)); // Limitar a 8 resultados
    setSearchOpen(results.length > 0);
  };

  // Manejar clic en resultado de búsqueda
  const handleResultClick = (result: QuickSearchResult) => {
    // Navegar a la sección correspondiente
    switch (result.tipo) {
      case 'estudiante':
      case 'docente':
        setActiveSection('usuarios');
        break;
      case 'curso':
        setActiveSection('cursos');
        break;
      case 'activo':
        setActiveSection('activos');
        break;
      case 'empleado':
        setActiveSection('recursoshumanos');
        break;
      case 'libro':
        setActiveSection('biblioteca');
        break;
    }
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  /**
   * Cursos y docentes reales.
   *
   * La lista de cursos estaba escrita a mano en el propio archivo y los
   * botones de crear, editar y eliminar solo modificaban ese arreglo: el
   * administrador veía "Curso creado exitosamente" y al recargar la página no
   * quedaba nada. Tampoco había forma de elegir docente, porque el formulario
   * pedía su nombre en texto libre y la API necesita su identificador.
   */
  const cargarCursos = async () => {
    try {
      const cursosRes = await coursesAdminApi.getAll({ limit: 100 });

      setCursos(
        comoArreglo((cursosRes as any).data).map((c: any) => ({
          id: c.id,
          nombre: c.name,
          codigo: c.code,
          estudiantes: c._count?.enrollments ?? 0,
          docente:
            [c.teacher?.user?.firstName, c.teacher?.user?.lastName].filter(Boolean).join(' ') || '',
          teacherId: c.teacherId,
          estado: c.status === 'active' ? 'activo' : 'inactivo',
          descripcion: c.description ?? '',
          duracion: c.semester ?? '',
          creditos: String(c.credits ?? ''),
        })) as any,
      );
    } catch (err) {
      console.error('Error cargando cursos:', err);
    }
  };

  /**
   * Usuarios reales del tenant. La lista estaba escrita a mano con cuatro
   * personas inventadas (maria.g@university.edu y compañía), así que el
   * administrador gestionaba cuentas que no existían.
   */
  const cargarUsuarios = async () => {
    try {
      const res = await personasApi.listarUsuarios();
      setUsuarios(
        comoArreglo((res as any).data).map((u: any) => ({
          id: u.id,
          nombre: [u.firstName, u.lastName].filter(Boolean).join(' '),
          email: u.email,
          rol:
            u.role === 'STUDENT' ? 'estudiante'
            : u.role === 'TEACHER' ? 'docente'
            : 'admin',
          estado: u.isActive ? 'activo' : 'inactivo',
          ultimoAcceso: u.lastLoginAt
            ? new Date(u.lastLoginAt).toLocaleDateString('es-CO')
            : '—',
          carrera: u.student?.program ?? '',
          departamento: u.teacher?.department ?? '',
          posicion: '',
        })) as any,
      );
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  useEffect(() => {
    cargarCursos();
    cargarUsuarios();
    cargarPlantillas();
    // Programas para el selector del alta de estudiantes
    programasApi
      .getAll({ limit: 100 })
      .then((r) => setProgramasAcademicos(r.data))
      .catch((err) => console.error('Error cargando programas:', err));
    // Bandeja real para la seccion de mensajes y el contador del sobre.
    messagesApi
      .getInbox()
      .then((data: any) => {
        const lista = comoArreglo(data);
        setMensajes(lista);
        setMensajesNoLeidos(lista.filter((m: any) => !(m.leido ?? m.read)).length);
      })
      .catch(() => setMensajesNoLeidos(0));
  }, []);

  // La marca edita el tenant real: al cargar, el formulario parte de lo que
  // hay en la base (nombre y colores), no de valores de fabrica.
  const tenantActual = useTenantStore((st) => st.tenant);
  useEffect(() => {
    if (!tenantActual) return;
    setPlatformConfig((prev) => ({
      ...prev,
      universityName: tenantActual.name ?? prev.universityName,
      platformName: tenantActual.name ?? prev.platformName,
      logoUrl: (tenantActual as any).logo ?? prev.logoUrl,
      primaryColor: tenantActual.primaryColor ?? prev.primaryColor,
      secondaryColor: tenantActual.secondaryColor ?? prev.secondaryColor,
    }));
  }, [tenantActual]);

  /** Guarda la marca en el tenant (PATCH real; antes era un alert de utileria). */
  const guardarConfiguracion = async () => {
    if (!tenantActual?.id) {
      avisar.error('No se pudo identificar la institución actual.');
      return;
    }
    try {
      await tenantsApi.update(tenantActual.id, {
        name: platformConfig.universityName,
        logo: platformConfig.logoUrl || undefined,
        primaryColor: platformConfig.primaryColor,
        secondaryColor: platformConfig.secondaryColor,
      } as any);
      useTenantStore.getState().setTenant({
        ...(tenantActual as any),
        name: platformConfig.universityName,
        logo: platformConfig.logoUrl || (tenantActual as any).logo,
        primaryColor: platformConfig.primaryColor,
        secondaryColor: platformConfig.secondaryColor,
      });
      avisar.ok('Configuración guardada.');
    } catch (err: any) {
      avisar.error('No se pudo guardar: ' + (err?.message || 'error de conexión'));
    }
  };

  const restaurarConfiguracion = () => {
    if (!tenantActual) return;
    setPlatformConfig((prev) => ({
      ...prev,
      universityName: tenantActual.name ?? prev.universityName,
      logoUrl: (tenantActual as any).logo ?? '',
      primaryColor: tenantActual.primaryColor ?? prev.primaryColor,
      secondaryColor: tenantActual.secondaryColor ?? prev.secondaryColor,
    }));
  };

  // Cerrar búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // El menú vivía aquí, duplicado: 20 entradas planas con un color
  // arbitrario cada una. Ahora la única definición es NAV_ADMIN, agrupada
  // por lo que el administrador viene a hacer (ver components/layout).


  const actualizarConfiguracion = (campo, valor) => {
    setPlatformConfig(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const crearUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email) {
      avisar.error('Por favor completa los campos obligatorios');
      return;
    }

    // Antes esto solo añadía una fila a la lista en memoria: la cuenta no
    // existía, nadie podía entrar con ella y al recargar desaparecía.
    const partes = nuevoUsuario.nombre.trim().split(/\s+/);
    const firstName = partes[0];
    const lastName = partes.slice(1).join(' ') || partes[0];
    // Contraseña inicial; el usuario la cambia después. La API la exige.
    const password = 'Cambiar123!';

    try {
      if (nuevoUsuario.rol === 'estudiante') {
        const creado = await personasApi.crearEstudiante({
          firstName, lastName, email: nuevoUsuario.email, password,
        });
        // `carrera` guarda ahora el id del Programa elegido: la inscripción
        // real es un ProgramEnrollment (pensum vigente), no texto libre.
        const studentId = (creado as any)?.data?.id;
        if (nuevoUsuario.carrera && studentId) {
          await inscripcionesApi
            .create({ studentId, programId: nuevoUsuario.carrera })
            .catch((e: any) =>
              avisar.ok(
                'Usuario creado, pero la inscripción al programa falló: ' +
                  (e?.response?.data?.message ?? e?.message ?? 'error'),
              ),
            );
        }
      } else if (nuevoUsuario.rol === 'docente') {
        await personasApi.crearDocente({
          firstName, lastName, email: nuevoUsuario.email, password,
          department: nuevoUsuario.departamento || undefined,
        });
      } else {
        // No hay endpoint para crear administradores: el único camino era el
        // registro público, que aceptaba el rol sin autenticación y por eso se
        // restringió a alumnado. Se dice en claro en vez de fingir el alta.
        avisar.ok('Las cuentas de administración no se crean desde aquí. Pídelo a soporte de la plataforma.');
        return;
      }
      await cargarUsuarios();
      avisar.ok(`Usuario creado. Contraseña inicial: ${password}`);
    } catch (err: any) {
      avisar.error('No se pudo crear el usuario: ' + (err?.message || 'error de conexión'));
      return;
    }

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
  };

  const editarUsuario = async () => {
    if (!editUserModal.nombre || !editUserModal.email) {
      avisar.error('Por favor completa los campos obligatorios');
      return;
    }

    // Solo se editaba la fila en memoria. El correo no se toca aquí porque
    // identifica la cuenta, y el rol lo restringe el backend a la
    // administración por una vía propia.
    const partes = String(editUserModal.nombre).trim().split(/\s+/);
    try {
      await personasApi.actualizarUsuario(String(editUserModal.id), {
        firstName: partes[0],
        lastName: partes.slice(1).join(' ') || partes[0],
        isActive: editUserModal.estado === 'activo',
      });
      await cargarUsuarios();
      setEditUserModal(null);
      avisar.ok('Usuario actualizado exitosamente');
    } catch (err: any) {
      avisar.error('No se pudo actualizar: ' + (err?.message || 'error de conexión'));
    }
  };

  const eliminarUsuario = async (id) => {
    // El backend hace baja lógica: desactiva la cuenta y conserva su historial
    // académico, que es lo correcto — borrarla arrastraría notas y entregas.
    if (!await confirmar('¿Desactivar este usuario? Conservará su historial pero no podrá entrar.')) return;
    try {
      await personasApi.desactivarUsuario(String(id));
      await cargarUsuarios();
      avisar.error('Usuario desactivado');
    } catch (err: any) {
      avisar.error('No se pudo desactivar: ' + (err?.message || 'error de conexión'));
    }
  };

  /**
   * El compositor de certificados no tenía backend: crear, editar, duplicar y
   * eliminar solo tocaban este arreglo, así que al recargar reaparecían las
   * dos plantillas de ejemplo y se perdía todo el diseño. Ahora persisten.
   */
  const cargarPlantillas = async () => {
    try {
      const res = await plantillasCertificadoApi.getAll();
      setPlantillas(comoArreglo((res as any).data) as any);
    } catch (err) {
      console.error('Error cargando plantillas:', err);
    }
  };

  const crearPlantilla = async () => {
    if (!nuevaPlantilla.nombre) {
      avisar.info('Por favor ingresa un nombre para la plantilla');
      return;
    }

    try {
      await plantillasCertificadoApi.create(nuevaPlantilla as any);
      await cargarPlantillas();
    } catch (err: any) {
      avisar.error('No se pudo crear la plantilla: ' + (err?.message || 'error de conexión'));
      return;
    }

    setCrearPlantillaModal(false);
    setNuevaPlantilla({
      nombre: '',
      descripcion: '',
      estado: 'borrador',
      componentes: [],
      configuracion: { tamano: 'A4', orientacion: 'horizontal', margenes: { top: 20, right: 20, bottom: 20, left: 20 }, fondo: '#ffffff' }
    });
    avisar.ok('Plantilla creada exitosamente');
  };

  const actualizarPlantilla = async () => {
    if (!editarPlantillaModal.nombre) {
      avisar.info('Por favor ingresa un nombre para la plantilla');
      return;
    }

    try {
      await plantillasCertificadoApi.update(String(editarPlantillaModal.id), {
        nombre: editarPlantillaModal.nombre,
        descripcion: editarPlantillaModal.descripcion,
        estado: editarPlantillaModal.estado,
        componentes: editarPlantillaModal.componentes,
        configuracion: editarPlantillaModal.configuracion,
      });
      await cargarPlantillas();
      setEditarPlantillaModal(null);
      avisar.ok('Plantilla actualizada exitosamente');
    } catch (err: any) {
      avisar.error('No se pudo actualizar: ' + (err?.message || 'error de conexión'));
    }
  };

  const duplicarPlantilla = async (plantilla) => {
    try {
      await plantillasCertificadoApi.duplicate(String(plantilla.id));
      await cargarPlantillas();
      avisar.ok('Plantilla duplicada exitosamente');
    } catch (err: any) {
      avisar.error('No se pudo duplicar: ' + (err?.message || 'error de conexión'));
    }
  };

  const eliminarPlantilla = async (id) => {
    if (!await confirmar('¿Estás seguro de eliminar esta plantilla?')) return;
    try {
      await plantillasCertificadoApi.remove(String(id));
      await cargarPlantillas();
      avisar.ok('Plantilla eliminada exitosamente');
    } catch (err: any) {
      avisar.error('No se pudo eliminar: ' + (err?.message || 'error de conexión'));
    }
  };

  const agregarComponenteAPlantilla = (plantilla, setPlantilla) => {
    // Validar firmas (máximo 3)
    if (nuevoComponente.tipo === 'firma') {
      const firmasActuales = (plantilla.componentes || []).filter(c => c.tipo === 'firma').length;
      if (firmasActuales >= 3) {
        avisar.error('Solo se permiten hasta 3 firmas por certificado');
        return;
      }
      if (!nuevoComponente.nombreFirmante || !nuevoComponente.cargo) {
        avisar.info('Por favor ingresa el nombre y cargo del firmante');
        return;
      }
    }
    
    if (!nuevoComponente.contenido && !nuevoComponente.campo && nuevoComponente.tipo !== 'qr_code' && nuevoComponente.tipo !== 'firma') {
      avisar.info('Por favor ingresa el contenido del componente');
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

  const renderizarCertificado = (plantilla: any, datosEstudiante: any = {}) => {
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
        className="relative bg-pn-surface shadow-2xl mx-auto"
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

  const marcarComoLeido = (id: any) => {
    setMensajes(prev => prev.map(m => 
      m.id === id ? { ...m, leido: true } as any : m
    ));
    setMensajesNoLeidos(prev => Math.max(0, prev - 1));
  };

  const renderInicio = () => (
    <div className="space-y-5">
      {/* --- Franja de métricas ---
          Antes eran cuatro tarjetas con barra lateral de color e icono de
          32 px: cuatro colores arbitrarios que no codificaban nada. Ahora solo
          se destaca la que exige acción, que son las solicitudes pendientes.
          Y cayó el degradado azul→morado de bienvenida: ocupaba una franja
          entera para repetir el nombre que ya está en la cabecera. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          indice={0}
          etiqueta="Estudiantes"
          valor={metricas.totalEstudiantes.toLocaleString('es-CO')}
          icono={Users}
          delta={12}
          nota="vs mes anterior"
        />
        <StatCard
          indice={1}
          etiqueta="Docentes"
          valor={metricas.totalDocentes.toLocaleString('es-CO')}
          icono={Award}
          delta={5}
          nota="vs mes anterior"
        />
        <StatCard
          indice={2}
          etiqueta="Solicitudes"
          valor={metricas.solicitudesPendientes}
          icono={ClipboardCheck}
          nota={metricas.solicitudesPendientes === 1 ? 'pendiente' : 'pendientes'}
          destacada={metricas.solicitudesPendientes > 0}
        />
        <StatCard
          indice={3}
          etiqueta="Ingresos del mes"
          valor={`$${(metricas.ingresosMensuales / 1000).toFixed(0)}K`}
          icono={DollarSign}
          delta={18}
          nota="vs mes anterior"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* --- Actividad reciente --- */}
        <Card className="p-0 lg:col-span-2">
          <h3 className="border-b border-pn-line px-4 py-3.5 font-display text-base font-bold text-pn-ink">
            Actividad reciente
          </h3>
          <ul className="list-none p-0">
            {[
              { accion: 'Nuevo estudiante registrado', usuario: 'María González', tiempo: 'Hace 5 min', icono: Users },
              { accion: 'Certificado generado', usuario: 'Sistema', tiempo: 'Hace 15 min', icono: FileText },
              { accion: 'Solicitud aprobada', usuario: 'Admin Ana', tiempo: 'Hace 1 hora', icono: CheckCircle },
              { accion: 'Pago procesado', usuario: 'Carlos Ruiz', tiempo: 'Hace 2 horas', icono: DollarSign },
            ].map((actividad, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-b border-pn-line px-4 py-3 last:border-b-0"
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pn-accent-soft text-pn-accent-text">
                  <actividad.icono size={14} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-body text-sm font-medium text-pn-ink">
                    {actividad.accion}
                  </span>
                  <span className="block truncate font-body text-[12.5px] text-pn-muted">
                    {actividad.usuario} · {actividad.tiempo}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          {/* --- Alertas: el tono sale de la semántica, no de un color suelto --- */}
          <Card className="p-0">
            <h3 className="border-b border-pn-line px-4 py-3.5 font-display text-base font-bold text-pn-ink">
              Alertas
            </h3>
            <ul className="list-none space-y-2 p-4">
              {([
                { mensaje: '12 pagos pendientes', tono: 'warn' as const },
                { mensaje: '5 solicitudes urgentes', tono: 'danger' as const },
                { mensaje: 'Backup completado', tono: 'ok' as const },
              ]).map((alerta, i) => (
                <li key={i}>
                  <StatusPill tono={alerta.tono} className="w-full justify-start py-1.5">
                    {alerta.mensaje}
                  </StatusPill>
                </li>
              ))}
            </ul>
          </Card>

          {/* --- Accesos rápidos --- */}
          <Card className="p-0">
            <h3 className="border-b border-pn-line px-4 py-3.5 font-display text-base font-bold text-pn-ink">
              Accesos rápidos
            </h3>
            <div className="flex flex-col gap-2 p-4">
              {[
                { label: 'Generar certificado', icon: FileText, action: () => setGenerarCertificadoModal(true) },
                { label: 'Crear usuario', icon: Plus, action: () => setCreateUserModal(true) },
                { label: 'Ver reportes', icon: PieChart, action: () => setActiveSection('reportes') },
              ].map((acceso, i) => (
                <Button
                  key={i}
                  variante="secondary"
                  icono={acceso.icon}
                  onClick={acceso.action}
                  className="justify-start"
                >
                  {acceso.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderMensajes = () => <MensajesAdminSection />;

  const renderUsuarios = () => {
    const usuariosFiltrados = filtroUsuarios === 'todos' ? usuarios : usuarios.filter(u => u.rol === filtroUsuarios);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold text-pn-ink`}>Gestión de Usuarios</h2>
          <div className="flex gap-2">
            <button onClick={() => setComunicacionMasivaModal(true)} className="bg-pn-ok text-pn-surface px-4 py-2 rounded hover:bg-pn-ok flex items-center gap-2">
              <Send size={18} />Comunicación Masiva
            </button>
            <button onClick={() => setCreateUserModal(true)} className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2">
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
                  ? 'bg-pn-accent text-pn-accent-ink'
                  : `border border-pn-line text-pn-ink`
              }`}
            >
              {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
            </button>
          ))}
        </div>

        <div className={`bg-pn-surface rounded-lg shadow overflow-hidden`}>
          <table className="w-full">
            <thead className={`bg-pn-surface-2`}>
              <tr>
                <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Usuario</th>
                <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Rol</th>
                <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Estado</th>
                <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Último Acceso</th>
                <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} className={`border-t border-pn-line`}>
                  <td className="p-3">
                    <div>
                      <p className={`font-semibold text-pn-ink`}>{usuario.nombre}</p>
                      <p className={`text-sm text-pn-ink-2`}>{usuario.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded text-xs ${
                      usuario.rol === 'admin' ? 'bg-pn-accent-2-soft text-pn-accent-2-text' :
                      usuario.rol === 'docente' ? 'bg-pn-accent-soft text-pn-accent-text' :
                      'bg-pn-ok-soft text-pn-ok'
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded text-xs ${
                      usuario.estado === 'activo' ? 'bg-pn-ok-soft text-pn-ok' : 'bg-pn-surface-3 text-pn-ink-2'
                    }`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className={`p-3 text-sm text-pn-ink`}>{usuario.ultimoAcceso}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {usuario.rol === 'estudiante' && (
                        <button onClick={() => setVerHistorialModal(usuario)} className="p-2 text-pn-accent-2-text hover:bg-pn-accent-2-soft rounded" title="Ver historial académico">
                          <BookOpen size={16} />
                        </button>
                      )}
                      <button onClick={() => setEditUserModal(usuario)} className="p-2 text-pn-accent-text hover:bg-pn-accent-soft rounded">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => eliminarUsuario(usuario.id)} className="p-2 text-pn-danger hover:bg-pn-danger-soft rounded">
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
            <div role="dialog" aria-modal="true" aria-label="Historial" className={`bg-pn-surface rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className={`text-xl font-bold text-pn-ink`}>Historial Académico</h3>
                  <p className={`text-sm text-pn-ink-2`}>{verHistorialModal.nombre}</p>
                </div>
                <button onClick={() => setVerHistorialModal(null)}><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg bg-pn-accent-soft`}>
                    <p className={`text-sm text-pn-ink-2`}>Promedio General</p>
                    <p className={`text-2xl font-bold text-pn-ink`}>4.2</p>
                  </div>
                  <div className={`p-4 rounded-lg bg-pn-ok-soft`}>
                    <p className={`text-sm text-pn-ink-2`}>Cursos Aprobados</p>
                    <p className={`text-2xl font-bold text-pn-ink`}>12</p>
                  </div>
                  <div className={`p-4 rounded-lg bg-pn-info-soft`}>
                    <p className={`text-sm text-pn-ink-2`}>Créditos Acumulados</p>
                    <p className={`text-2xl font-bold text-pn-ink`}>48</p>
                  </div>
                </div>

                <div>
                  <h4 className={`font-bold mb-3 text-pn-ink`}>Cursos Cursados</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`bg-pn-surface-2`}>
                        <tr>
                          <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Curso</th>
                          <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Semestre</th>
                          <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Nota</th>
                          <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialAcademico.filter(h => h.estudiante === verHistorialModal.nombre).map(hist => (
                          <tr key={hist.id} className={`border-t border-pn-line`}>
                            <td className={`p-3 text-pn-ink`}>{hist.curso}</td>
                            <td className={`p-3 text-sm text-pn-ink-2`}>{hist.semestre}</td>
                            <td className={`p-3 font-semibold text-pn-accent-text`}>{hist.nota}</td>
                            <td className="p-3">
                              <span className={`px-3 py-1 rounded text-xs ${
                                hist.estado === 'Aprobado' ? 'bg-pn-ok-soft text-pn-ok' : 'bg-pn-danger-soft text-pn-danger'
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
                <button onClick={() => setVerHistorialModal(null)} className={`px-6 py-2 border border-pn-line rounded hover:bg-pn-surface-2 hover:bg-pn-surface-3`}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Comunicación Masiva */}
        {comunicacionMasivaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setComunicacionMasivaModal(false)}>
            <div role="dialog" aria-modal="true" aria-label="Comunicación masiva" className={`bg-pn-surface rounded-lg p-6 max-w-3xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between mb-4">
                <h3 className={`text-xl font-bold text-pn-ink`}>Comunicación Masiva</h3>
                <button onClick={() => setComunicacionMasivaModal(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Destinatarios</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Todos', 'Estudiantes', 'Docentes', 'Administradores'].map(grupo => (
                      <button key={grupo} className={`px-4 py-2 rounded border border-pn-line hover:bg-pn-accent-soft hover:bg-pn-accent-soft`}>
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
                    className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mensaje</label>
                  <textarea 
                    rows={8} 
                    placeholder="Escribe tu mensaje aquí..."
                    className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { 
                      avisar.ok('Mensaje enviado a los destinatarios seleccionados'); 
                      setComunicacionMasivaModal(false); 
                    }} 
                    className="flex-1 bg-pn-ok text-pn-surface py-2 rounded hover:bg-pn-ok flex items-center justify-center gap-2"
                  >
                    <Send size={18} />Enviar Mensaje
                  </button>
                  <button onClick={() => setComunicacionMasivaModal(false)} className={`flex-1 border border-pn-line py-2 rounded`}>
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
            <div className={`bg-pn-surface rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold text-pn-ink`}>Crear Nuevo Usuario</h3>
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      value={nuevoUsuario.email}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                      placeholder="juan.perez@university.edu"
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Rol *</label>
                    <select
                      value={nuevoUsuario.rol}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                {nuevoUsuario.rol === 'estudiante' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Programa académico</label>
                    <select
                      value={nuevoUsuario.carrera}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, carrera: e.target.value})}
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                    >
                      <option value="">Sin programa (inscribir después)</option>
                      {programasAcademicos.map((programa) => (
                        <option key={programa.id} value={programa.id}>{programa.name}</option>
                      ))}
                    </select>
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={crearUsuario}
                    className="flex-1 bg-pn-accent text-pn-accent-ink py-2 rounded hover:bg-pn-accent-hover flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Crear Usuario
                  </button>
                  <button 
                    onClick={() => setCreateUserModal(false)}
                    className={`flex-1 border border-pn-line py-2 rounded hover:bg-pn-surface-2 hover:bg-pn-surface-3`}
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
            <div className={`bg-pn-surface rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold text-pn-ink`}>Editar Usuario</h3>
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      value={editUserModal.email}
                      onChange={(e) => setEditUserModal({...editUserModal, email: e.target.value})}
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Rol *</label>
                    <select
                      value={editUserModal.rol}
                      onChange={(e) => setEditUserModal({...editUserModal, rol: e.target.value})}
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={editarUsuario}
                    className="flex-1 bg-pn-accent text-pn-accent-ink py-2 rounded hover:bg-pn-accent-hover flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Guardar Cambios
                  </button>
                  <button 
                    onClick={() => setEditUserModal(null)}
                    className={`flex-1 border border-pn-line py-2 rounded hover:bg-pn-surface-2 hover:bg-pn-surface-3`}
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

  const renderFinanzas = () => {
    return <FinanzasContabilidadSection />;
  };

  const renderReportes = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold text-pn-ink`}>Centro de Reportes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { titulo: 'Reporte de Estudiantes', descripcion: 'Estadísticas completas de estudiantes', icon: Users, color: 'bg-pn-accent' },
          { titulo: 'Reporte Académico', descripcion: 'Rendimiento y calificaciones', icon: BookOpen, color: 'bg-pn-ok' },
          { titulo: 'Reporte Financiero', descripcion: 'Ingresos y transacciones', icon: DollarSign, color: 'bg-pn-accent-2' },
          { titulo: 'Reporte de Asistencia', descripcion: 'Asistencia y participación', icon: CheckCircle, color: 'bg-pn-warn' },
          { titulo: 'Reporte de Certificados', descripcion: 'Certificados generados', icon: Award, color: 'bg-pn-accent-2' },
          { titulo: 'Reporte de Actividad', descripcion: 'Actividad en la plataforma', icon: TrendingUp, color: 'bg-pn-accent-2' }
        ].map((reporte, i) => (
          <div key={i} className={`bg-pn-surface rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition`}>
            <div className={`${reporte.color} ${tintaDeRelleno(reporte.color)} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <reporte.icon size={24} />
            </div>
            <h4 className={`font-bold mb-2 text-pn-ink`}>{reporte.titulo}</h4>
            <p className={`text-sm text-pn-ink-2 mb-4`}>{reporte.descripcion}</p>
            <button className="w-full bg-pn-accent text-pn-accent-ink py-2 rounded hover:bg-pn-accent-hover flex items-center justify-center gap-2">
              <Download size={16} />Generar
            </button>
          </div>
        ))}
      </div>

      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-bold mb-4 text-pn-ink`}>Reportes Personalizados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Tipo de Reporte</label>
            <select className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}>
              <option>Seleccionar tipo...</option>
              <option>Académico</option>
              <option>Financiero</option>
              <option>Administrativo</option>
              <option>Estadístico</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Período</label>
            <select className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}>
              <option>Último mes</option>
              <option>Último trimestre</option>
              <option>Último semestre</option>
              <option>Último año</option>
              <option>Personalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Formato</label>
            <select className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}>
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-pn-accent text-pn-accent-ink py-2 rounded hover:bg-pn-accent-hover flex items-center justify-center gap-2">
              <Download size={18} />Generar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfiguracion = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold text-pn-ink`}>Configuración del Sistema</h2>

      {/* Configuración de la Institución */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Configuración de la Institución</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium text-pn-ink-2 mb-2`}>
              Nombre de la Institución
            </label>
            <input
              type="text"
              value={tenantActual?.name ?? ''}
              className={`w-full px-3 py-2 border border-pn-line rounded-lg bg-pn-surface text-pn-ink`}
              readOnly
            />
            <p className={`mt-1 text-xs text-pn-muted`}>
              Se edita en «Configuración de Marca», más abajo. NIT, email y
              teléfono institucionales estarán disponibles cuando el backend
              los incorpore; antes esta tarjeta mostraba datos de ejemplo.
            </p>
          </div>
        </div>
      </div>

      {/* Personalización de Marca */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 text-pn-ink`}>Configuración de Marca</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre de la Plataforma</label>
              <input
                type="text"
                value={platformConfig.platformName}
                onChange={(e) => actualizarConfiguracion('platformName', e.target.value)}
                className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre de la Universidad</label>
              <input
                type="text"
                value={platformConfig.universityName}
                onChange={(e) => actualizarConfiguracion('universityName', e.target.value)}
                className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Logo de la Plataforma</label>
              <div className={`border-2 border-dashed border-pn-line rounded-lg p-6 text-center cursor-pointer hover:bg-pn-surface-2 hover:bg-pn-surface-3`}>
                <Upload size={48} className="mx-auto text-pn-muted mb-2" />
                <p className={`text-sm text-pn-ink-2`}>
                  Arrastra tu logo aquí o haz clic para seleccionar
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 text-pn-ink`}>Colores de la Plataforma</h3>
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
                  className={`flex-1 p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                  className={`flex-1 p-2 border border-pn-line rounded bg-pn-surface-2`}
                />
              </div>
            </div>
            <div className={`p-4 rounded-lg bg-pn-surface-2`}>
              <p className="text-sm font-semibold mb-3">Vista Previa de Colores:</p>
              <div className="flex gap-2">
                <div style={{ backgroundColor: platformConfig.primaryColor, color: tintaDe(platformConfig.primaryColor) }} className="w-20 h-20 rounded flex items-center justify-center text-xs">
                  Primario
                </div>
                <div style={{ backgroundColor: platformConfig.secondaryColor, color: tintaDe(platformConfig.secondaryColor) }} className="w-20 h-20 rounded flex items-center justify-center text-xs">
                  Secundario
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista Previa de Marca */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-bold mb-4 text-pn-ink`}>Vista Previa en Tiempo Real</h3>
        <div className="border-2 rounded-lg p-6" style={{ borderColor: platformConfig.primaryColor }}>
          <div className="flex items-center gap-4 mb-4">
            <div style={{ backgroundColor: platformConfig.primaryColor, color: tintaDe(platformConfig.primaryColor) }} className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl">
              {platformConfig.platformName.charAt(0)}
            </div>
            <div>
              <h4 className={`text-2xl font-bold text-pn-ink`}>{platformConfig.platformName}</h4>
              <p className={'text-pn-ink-2'}>{platformConfig.universityName}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button style={{ backgroundColor: platformConfig.primaryColor, color: tintaDe(platformConfig.primaryColor) }} className="px-6 py-2 rounded hover:opacity-90">
              Botón Primario
            </button>
            <button style={{ backgroundColor: platformConfig.secondaryColor, color: tintaDe(platformConfig.secondaryColor) }} className="px-6 py-2 rounded hover:opacity-90">
              Botón Secundario
            </button>
          </div>
        </div>
      </div>

      {/* Roles y Permisos */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Roles y Permisos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Los cuatro roles REALES del sistema (enum UserRole del backend).
              Antes esta tarjeta pintaba roles inventados del mock, con cupos
              de usuarios que no existian. */}
          {[
            { id: 'SUPER_ADMIN', nombre: 'Super Admin', descripcion: 'Operador de la plataforma: planes, estados y cupos de todas las instituciones.', color: 'bg-pn-accent-2' },
            { id: 'TENANT_ADMIN', nombre: 'Administrador', descripcion: 'Gestiona su institución: usuarios, cursos, finanzas y configuración.', color: 'bg-pn-accent' },
            { id: 'TEACHER', nombre: 'Docente', descripcion: 'Cursos a su cargo: contenidos, tareas, exámenes y calificaciones.', color: 'bg-pn-ok' },
            { id: 'STUDENT', nombre: 'Estudiante', descripcion: 'Accede a sus cursos, entregas, notas y trámites.', color: 'bg-pn-warn' },
          ].map(rol => (
            <div key={rol.id} className={`p-4 border border-pn-line rounded-lg`}>
              <div className={`w-12 h-12 ${rol.color} ${tintaDeRelleno(rol.color)} rounded-full flex items-center justify-center font-bold mb-3`}>
                {rol.nombre.charAt(0)}
              </div>
              <h4 className={`font-bold text-pn-ink`}>{rol.nombre}</h4>
              <p className={`text-sm text-pn-ink-2 mb-2`}>{rol.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Configuración de Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 text-pn-ink`}>Notificaciones</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-pn-ink`}>Notificaciones por Email</p>
                <p className={`text-sm text-pn-ink-2`}>Recibir alertas por correo electrónico</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformConfig.emailNotifications}
                  onChange={(e) => actualizarConfiguracion('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-pn-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-pn-surface after:border-pn-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pn-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-pn-ink`}>Notificaciones SMS</p>
                <p className={`text-sm text-pn-ink-2`}>Recibir alertas por mensaje de texto</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformConfig.smsNotifications}
                  onChange={(e) => actualizarConfiguracion('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-pn-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-pn-surface after:border-pn-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pn-accent"></div>
              </label>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 text-pn-ink`}>Seguridad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-pn-ink`}>Modo Mantenimiento</p>
                <p className={`text-sm text-pn-ink-2`}>Desactivar acceso temporal a la plataforma</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformConfig.maintenanceMode}
                  onChange={(e) => actualizarConfiguracion('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-pn-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-pn-surface after:border-pn-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pn-danger"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-pn-ink`}>Registro Abierto</p>
                <p className={`text-sm text-pn-ink-2`}>Permitir nuevos registros de usuarios</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={platformConfig.allowRegistration}
                  onChange={(e) => actualizarConfiguracion('allowRegistration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-pn-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-pn-surface after:border-pn-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pn-accent"></div>
              </label>
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 text-pn-ink`}>Límites del Sistema</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Tamaño máximo de archivo (MB)</label>
              <input
                type="number"
                value={platformConfig.maxFileSize}
                onChange={(e) => actualizarConfiguracion('maxFileSize', parseInt(e.target.value))}
                className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Tiempo de sesión (minutos)</label>
              <input
                type="number"
                value={platformConfig.sessionTimeout}
                onChange={(e) => actualizarConfiguracion('sessionTimeout', parseInt(e.target.value))}
                className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
              />
            </div>
          </div>
        </div>

        <div className={`bg-pn-surface rounded-lg shadow p-6`}>
          <h3 className={`text-xl font-bold mb-4 text-pn-ink`}>Copias de Seguridad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-pn-ok-soft border-l-4 border-pn-ok">
              <div>
                <p className="text-sm font-semibold text-pn-ok">Última copia de seguridad</p>
                <p className="text-xs text-pn-ok">03 de Octubre, 2025 - 02:00 AM</p>
              </div>
              <CheckCircle className="text-pn-ok" size={24} />
            </div>
            <button className="w-full bg-pn-accent text-pn-accent-ink py-2 rounded hover:bg-pn-accent-hover flex items-center justify-center gap-2">
              <Download size={18} />Crear Copia de Seguridad
            </button>
          </div>
        </div>
      </div>

      {/* Configuración de Pago */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <h3 className={`text-lg font-bold text-pn-ink mb-4`}>Configuración de Pago</h3>
        {/* Antes esta tarjeta mostraba el mock de Stripe con claves pk_test_
            inventadas; la pasarela real del proyecto es Wompi y sus claves
            viven en el servidor, nunca en el navegador. */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={'text-pn-ink-2'}>Pasarela de Pago:</span>
            <span className={`font-semibold text-pn-ink`}>Wompi</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={'text-pn-ink-2'}>Moneda:</span>
            <span className={`font-semibold text-pn-ink`}>COP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={'text-pn-ink-2'}>Pagos en línea del plan:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              tenantActual?.enablePayments ? 'bg-pn-ok-soft text-pn-ok' : 'bg-pn-warn-soft text-pn-warn'
            }`}>
              {tenantActual?.enablePayments ? 'Habilitados' : 'No incluidos en el plan actual'}
            </span>
          </div>
          <p className={`text-xs text-pn-muted`}>
            Las claves de Wompi se configuran en el servidor (variables WOMPI_*) y no se muestran aquí.
          </p>
        </div>
      </div>

      {/* Logs de Auditoría */}
      <div className={`bg-pn-surface rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold text-pn-ink`}>Logs de Auditoría</h3>
          <button onClick={() => setLogsAuditoriaModal(true)} className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2">
            <Eye size={18} />Ver Todos los Logs
          </button>
        </div>
        <div className="space-y-2">
          {logsAuditoria.slice(0, 5).map(log => (
            <div key={log.id} className={`flex items-start gap-3 p-3 rounded-lg border border-pn-line hover:bg-pn-surface-2 hover:bg-pn-surface-3 transition`}>
              <Clock size={16} className="text-pn-accent-text mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-sm text-pn-ink`}>{log.accion}</p>
                  <span className={`text-xs text-pn-muted`}>{log.fecha}</span>
                </div>
                <p className={`text-xs text-pn-ink-2`}>
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
          <div className={`bg-pn-surface rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Logs de Auditoría del Sistema</h3>
              <button onClick={() => setLogsAuditoriaModal(false)}><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar en logs..."
                  className={`flex-1 p-2 border border-pn-line rounded bg-pn-surface-2`}
                />
                <button className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover">
                  <Search size={18} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`bg-pn-surface-2`}>
                    <tr>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Fecha/Hora</th>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Usuario</th>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Acción</th>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Detalle</th>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsAuditoria.map(log => (
                      <tr key={log.id} className={`border-t border-pn-line`}>
                        <td className={`p-3 text-sm text-pn-ink-2`}>{log.fecha}</td>
                        <td className={`p-3 text-pn-ink`}>{log.usuario}</td>
                        <td className={`p-3`}>
                          <span className="px-3 py-1 bg-pn-accent-soft text-pn-accent-text rounded text-xs font-semibold">
                            {log.accion}
                          </span>
                        </td>
                        <td className={`p-3 text-sm text-pn-ink-2`}>{log.detalle}</td>
                        <td className={`p-3 text-xs text-pn-muted`}>{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button className="bg-pn-ok text-pn-surface px-4 py-2 rounded hover:bg-pn-ok flex items-center gap-2">
                <Download size={18} />Exportar Logs
              </button>
              <button onClick={() => setLogsAuditoriaModal(false)} className={`px-6 py-2 border border-pn-line rounded hover:bg-pn-surface-2 hover:bg-pn-surface-3`}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={restaurarConfiguracion}
          className={`px-6 py-2 border border-pn-line rounded hover:bg-pn-surface-2 hover:bg-pn-surface-3`}
        >
          Restaurar Valores
        </button>
        <button
          onClick={guardarConfiguracion}
          style={{ backgroundColor: platformConfig.primaryColor, color: tintaDe(platformConfig.primaryColor) }}
          className="px-6 py-2 rounded hover:opacity-90 flex items-center gap-2"
        >
          <Save size={18} />
          Guardar Configuración
        </button>
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Generación de Documentos</h2>
        <div className="flex gap-2">
          <button onClick={() => setHistorialQRModal(true)} className="bg-pn-accent-2 text-pn-accent-2-ink px-4 py-2 rounded hover:bg-pn-accent-2 flex items-center gap-2">
            <Eye size={18} />Historial QR
          </button>
          <button onClick={() => setGenerarCertificadoModal(true)} className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2">
            <Plus size={18} />Generar Documento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { titulo: 'Certificados de Estudio', cantidad: 145, icon: Award, color: 'bg-pn-accent' },
          { titulo: 'Constancias de Notas', cantidad: 89, icon: FileText, color: 'bg-pn-ok' },
          { titulo: 'Códigos QR Generados', cantidad: historialQRState.length, icon: FileText, color: 'bg-pn-accent-2' }
        ].map((tipo, i) => (
          <div key={i} className={`bg-pn-surface rounded-lg shadow p-6`}>
            <div className={`${tipo.color} ${tintaDeRelleno(tipo.color)} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <tipo.icon size={24} />
            </div>
            <h4 className={`font-bold mb-2 text-pn-ink`}>{tipo.titulo}</h4>
            <p className="text-3xl font-bold text-pn-accent-text">{tipo.cantidad}</p>
            <p className={`text-sm text-pn-ink-2`}>Total</p>
          </div>
        ))}
      </div>

      {/* Modal Historial de QR */}
      {historialQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setHistorialQRModal(false)}>
          <div className={`bg-pn-surface rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Historial de Códigos QR</h3>
              <button onClick={() => setHistorialQRModal(false)}><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`bg-pn-surface-2`}>
                    <tr>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Documento</th>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Código QR</th>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Fecha</th>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Verificaciones</th>
                      <th className={`p-3 text-left text-sm font-semibold text-pn-ink`}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialQRState.map(qr => (
                      <tr key={qr.id} className={`border-t border-pn-line`}>
                        <td className={`p-3 text-pn-ink`}>{qr.documento}</td>
                        <td className={`p-3`}>
                          <code className={`px-2 py-1 rounded text-xs bg-pn-surface-3`}>
                            {qr.codigo}
                          </code>
                        </td>
                        <td className={`p-3 text-sm text-pn-ink-2`}>{qr.fecha}</td>
                        <td className={`p-3`}>
                          <span className="px-3 py-1 bg-pn-accent-soft text-pn-accent-text rounded text-xs font-semibold">
                            {qr.verificaciones} veces
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button className="p-2 text-pn-accent-text hover:bg-pn-accent-soft rounded" title="Ver QR">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 text-pn-ok hover:bg-pn-ok-soft rounded" title="Descargar">
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
              <button onClick={() => setHistorialQRModal(false)} className={`px-6 py-2 border border-pn-line rounded hover:bg-pn-surface-2 hover:bg-pn-surface-3`}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {generarCertificadoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setGenerarCertificadoModal(false)}>
          <div className={`bg-pn-surface rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Generar Certificado</h3>
              <button onClick={() => setGenerarCertificadoModal(false)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de Documento</label>
                <select className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}>
                  <option>Certificado de Estudios</option>
                  <option>Constancia de Notas</option>
                  <option>Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Estudiante</label>
                <select className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}>
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
                  avisar.ok(`Certificado generado exitosamente con código QR: ${codigoQR}`); 
                  setGenerarCertificadoModal(false); 
                }} className="flex-1 bg-pn-accent text-pn-accent-ink py-2 rounded hover:bg-pn-accent-hover flex items-center justify-center gap-2">
                  <Download size={18} />Generar PDF
                </button>
                <button onClick={() => setGenerarCertificadoModal(false)} className={`flex-1 border border-pn-line py-2 rounded`}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  const renderTramites = () => <TramitesSection />;


  const renderPlantillas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-pn-ink`}>Plantillas de Certificados</h2>
        <button onClick={() => setCrearPlantillaModal(true)} className="bg-pn-accent text-pn-accent-ink px-4 py-2 rounded hover:bg-pn-accent-hover flex items-center gap-2">
          <Plus size={18} />Crear Plantilla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plantillas.map(plantilla => (
          <div key={plantilla.id} className={`bg-pn-surface rounded-lg shadow overflow-hidden`}>
            <div className="h-48 bg-pn-accent-soft flex items-center justify-center relative overflow-hidden">
              <div className="text-center transform scale-50">
                {renderizarCertificado(plantilla)}
              </div>
              <span className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold ${
                plantilla.estado === 'publicado' ? 'bg-pn-ok-soft text-pn-ok' : 'bg-pn-warn-soft text-pn-warn'
              }`}>
                {plantilla.estado}
              </span>
            </div>
            <div className="p-4">
              <h4 className={`font-bold mb-2 text-pn-ink`}>{plantilla.nombre}</h4>
              <p className={`text-sm text-pn-ink-2 mb-4 line-clamp-2`}>
                {plantilla.descripcion}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setVistaPreviewPlantilla(plantilla)} className="flex-1 bg-pn-accent text-pn-accent-ink py-2 rounded hover:bg-pn-accent-hover text-sm flex items-center justify-center gap-1">
                  <Eye size={16} />Vista Previa
                </button>
                <button onClick={() => setEditarPlantillaModal(plantilla)} className="p-2 text-pn-accent-text border border-pn-accent-line rounded hover:bg-pn-accent-soft">
                  <Edit size={16} />
                </button>
                <button onClick={() => duplicarPlantilla(plantilla)} className="p-2 text-pn-ok border border-pn-ok rounded hover:bg-pn-ok-soft">
                  <FileText size={16} />
                </button>
                <button onClick={() => eliminarPlantilla(plantilla.id)} className="p-2 text-pn-danger border border-pn-danger rounded hover:bg-pn-danger-soft">
                  <Trash2 size={16} />
                </button>
              </div>
              <button onClick={() => setGenerarCertificadoPlantilla(plantilla)} className="w-full mt-2 bg-pn-ok text-pn-surface py-2 rounded hover:bg-pn-ok text-sm flex items-center justify-center gap-1">
                <Download size={16} />Generar Certificado
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Plantilla */}
      {crearPlantillaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4" onClick={() => setCrearPlantillaModal(false)}>
          <div className={`bg-pn-surface rounded-lg p-6 max-w-6xl w-full my-8`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Crear Nueva Plantilla</h3>
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
                    className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Descripción</label>
                  <textarea
                    value={nuevaPlantilla.descripcion}
                    onChange={(e) => setNuevaPlantilla({...nuevaPlantilla, descripcion: e.target.value})}
                    placeholder="Descripción de la plantilla..."
                    rows={2}
                    className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tamaño</label>
                    <select
                      value={nuevaPlantilla.configuracion.tamano}
                      onChange={(e) => setNuevaPlantilla({...nuevaPlantilla, configuracion: {...nuevaPlantilla.configuracion, tamano: e.target.value}})}
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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

                <div className={`bg-pn-surface-2 p-4 rounded-lg`}>
                  <h4 className="font-semibold mb-3">Agregar Componente</h4>
                  <div className="space-y-3">
                    <select
                      value={nuevoComponente.tipo}
                      onChange={(e) => setNuevoComponente({...nuevoComponente, tipo: e.target.value})}
                      className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                        className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                      />
                    ) : nuevoComponente.tipo === 'campo_dinamico' ? (
                      <select
                        value={nuevoComponente.campo}
                        onChange={(e) => setNuevoComponente({...nuevoComponente, campo: e.target.value})}
                        className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                      >
                        <option value="">[nombre_estudiante]</option>
                        <option value="[nombre_estudiante]">[nombre_estudiante]</option>
                        <option value="[nombre_curso]">[nombre_curso]</option>
                        <option value="[fecha_emision]">[fecha_emision]</option>
                        <option value="[nota_final]">[nota_final]</option>
                        <option value="[codigo_verificacion]">[codigo_verificacion]</option>
                      </select>
                    ) : nuevoComponente.tipo === 'qr_code' ? (
                      <div className={`p-3 rounded bg-pn-accent-soft text-sm`}>
                        <p className="font-semibold mb-1">Código QR de Verificación</p>
                        <p className="text-xs">Se generará automáticamente un código único para cada certificado</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className={`p-3 rounded bg-pn-info-soft text-sm mb-2`}>
                          <p className="font-semibold mb-1">Firma Digital</p>
                          <p className="text-xs">Máximo 3 firmas por certificado ({(nuevaPlantilla.componentes || []).filter(c => c.tipo === 'firma').length}/3)</p>
                        </div>
                        <input
                          type="text"
                          placeholder="Nombre del firmante"
                          value={nuevoComponente.nombreFirmante}
                          onChange={(e) => setNuevoComponente({...nuevoComponente, nombreFirmante: e.target.value})}
                          className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                        />
                        <input
                          type="text"
                          placeholder="Cargo o posición"
                          value={nuevoComponente.cargo}
                          onChange={(e) => setNuevoComponente({...nuevoComponente, cargo: e.target.value})}
                          className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                        />
                      </div>
                    )}

                    {nuevoComponente.tipo !== 'qr_code' && nuevoComponente.tipo !== 'firma' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Tamaño (px)"
                          value={parseInt(nuevoComponente.estilos.fontSize)}
                          onChange={(e) => setNuevoComponente({...nuevoComponente, estilos: {...nuevoComponente.estilos, fontSize: e.target.value + 'px'}})}
                          className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                        />
                        <select
                          value={nuevoComponente.estilos.fontWeight}
                          onChange={(e) => setNuevoComponente({...nuevoComponente, estilos: {...nuevoComponente.estilos, fontWeight: e.target.value}})}
                          className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Negrita</option>
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Top (ej: 100px)"
                        value={nuevoComponente.posicion.top}
                        onChange={(e) => setNuevoComponente({...nuevoComponente, posicion: {...nuevoComponente.posicion, top: e.target.value}})}
                        className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
                      />
                      <input
                        type="text"
                        placeholder="Left/Right (ej: 50px)"
                        value={(nuevoComponente.posicion as any).left || ''}
                        onChange={(e) => setNuevoComponente({...nuevoComponente, posicion: {...(nuevoComponente.posicion as any), left: e.target.value}})}
                        className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}
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
                      className="w-full bg-pn-ok text-pn-surface py-2 rounded hover:bg-pn-ok"
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
                className="flex-1 bg-pn-accent text-pn-accent-ink py-2 rounded hover:bg-pn-accent-hover flex items-center justify-center gap-2"
              >
                <Save size={18} />Crear Plantilla
              </button>
              <button 
                onClick={() => setCrearPlantillaModal(false)}
                className={`flex-1 border border-pn-line py-2 rounded hover:bg-pn-surface-2 hover:bg-pn-surface-3`}
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
          <div className={`bg-pn-surface rounded-lg p-6 max-w-5xl w-full`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Vista Previa - {vistaPreviewPlantilla.nombre}</h3>
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
          <div className={`bg-pn-surface rounded-lg p-6 max-w-2xl w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className={`text-xl font-bold text-pn-ink`}>Generar Certificado</h3>
              <button onClick={() => setGenerarCertificadoPlantilla(null)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Plantilla Seleccionada</label>
                <input
                  type="text"
                  value={generarCertificadoPlantilla.nombre}
                  disabled
                  className={`w-full p-2 border border-pn-line rounded bg-pn-surface-3`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Estudiante</label>
                <select id="estudiante-select" className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}>
                  {usuarios.filter(u => u.rol === 'estudiante').map(est => (
                    <option key={est.id} value={est.nombre}>{est.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Curso</label>
                <select id="curso-select" className={`w-full p-2 border border-pn-line rounded bg-pn-surface-2`}>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.nombre}>{curso.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div className={`p-4 rounded-lg bg-pn-accent-soft border-l-4 border-pn-accent-line`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-pn-accent-text" />
                  <p className="font-semibold text-sm">Código QR de Verificación</p>
                </div>
                <p className="text-xs">
                  Se generará automáticamente un código QR único para verificación del certificado
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => {
                  const estudiante = (document.getElementById('estudiante-select') as HTMLInputElement).value;
                  const curso = (document.getElementById('curso-select') as HTMLInputElement).value;
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
                  
                  avisar.ok(`Certificado generado exitosamente\n\nCódigo QR: ${codigoQR}\nEstudiante: ${estudiante}\nCurso: ${curso}\n\nEl código QR ha sido registrado en el historial.`);
                  setGenerarCertificadoPlantilla(null);
                }} className="flex-1 bg-pn-accent text-pn-accent-ink py-2 rounded hover:bg-pn-accent-hover flex items-center justify-center gap-2">
                  <Download size={18} />Generar Certificado con QR
                </button>
                <button onClick={() => setGenerarCertificadoPlantilla(null)} className={`flex-1 border border-pn-line py-2 rounded`}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== NUEVAS SECCIONES ====================

  const renderActivos = () => <ActivosSection />;

  const renderInventario = () => <InventarioSection />;

  const renderNomina = () => <NominaSection />;

  const renderRecursosHumanos = () => <RecursosHumanosSection />;

  const renderCarnetizacion = () => <CarnetizacionMejorada />;

  const renderBiblioteca = () => <BibliotecaSection />;

  const renderContent = () => {
    switch(activeSection) {
      case 'inicio': return renderInicio();
      case 'mensajes': return renderMensajes();
      case 'inscripcion': return <InscripcionesProgramaSection />;
      case 'plantillas': return renderPlantillas();
      case 'usuarios': return renderUsuarios();
      case 'academico': return <GestionAcademicaSection />;
      case 'sitioweb': return <SitioWebSection />;
      case 'admisiones': return <AdmisionesSection />;
      case 'integraciones': return <IntegracionesSection />;
      // Enlaces viejos (búsqueda global) siguen llegando a 'cursos': ahora es
      // la pestaña Grupos de la gestión académica.
      case 'cursos': return <GestionAcademicaSection pestanaInicial="grupos" />;
      case 'activos': return renderActivos();
      case 'inventario': return renderInventario();
      case 'nomina': return renderNomina();
      case 'recursoshumanos': return renderRecursosHumanos();
      case 'carnetizacion': return renderCarnetizacion();
      case 'tramites': return renderTramites();
      case 'anuncios': return <AnunciosSection />;
      case 'mensajesmasivos': return <MensajesMasivosSection />;
      case 'analiticas': return <AnalyticsSection />;
      case 'biblioteca': return renderBiblioteca();
      case 'finanzas': return renderFinanzas();
      case 'reportes': return renderReportes();
      case 'configuracion': return renderConfiguracion();
      case 'documentos': return renderDocumentos();
      default: return renderInicio();
    }
  };

  // Etiqueta de la pantalla actual. Sale de NAV_ADMIN, que ahora es la única
  // definición del menú; 'cursos' es el alias heredado de la búsqueda global y
  // no figura en el menú, así que se nombra aparte.
  const tituloSeccion =
    activeSection === 'cursos'
      ? 'Gestión académica'
      : (NAV_ADMIN.flatMap((g) => g.entradas).find((e) => e.id === activeSection)
          ?.etiqueta ?? 'Dashboard');

  const alternarTema = () => establecerTema(resuelto === 'dark' ? 'light' : 'dark');

  return (
    <ConfigContext.Provider value={{ config: platformConfig, updateConfig: actualizarConfiguracion }}>
      <AppShell<SeccionAdmin>
        grupos={NAV_ADMIN}
        seccionActiva={activeSection}
        onCambiarSeccion={setActiveSection}
        titulo={tituloSeccion}
        marca={platformConfig.platformName}
        subtitulo="Panel de administración"
        contadores={{
          mensajes: mensajesNoLeidos,
          tramites: metricas.solicitudesPendientes,
        }}
        onSalir={() => logout()}
        centroCabecera={
          <>
            {/* Búsqueda Rápida */}
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-pn-muted`} size={20} />
                <input
                  type="text"
                  placeholder="Buscar estudiantes, docentes, cursos, activos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    'bg-pn-surface border-pn-line-strong text-pn-ink placeholder:text-pn-muted'
                  } focus:outline-none focus:ring-2 focus:ring-pn-accent`}
                />
              </div>

              {/* Resultados de búsqueda */}
              {searchOpen && searchResults.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 bg-pn-surface rounded-lg shadow-lg border ${
                  'border-pn-line'
                } max-h-96 overflow-y-auto z-50`}>
                  {searchResults.map((result) => (
                    <div
                      key={`${result.tipo}-${result.id}`}
                      {...pulsable(() => handleResultClick(result))}
                      className={`p-3 cursor-pointer hover:bg-pn-surface-2 border-b ${
                        'border-pn-line'
                      } last:border-b-0 transition`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          result.tipo === 'estudiante' ? 'bg-pn-accent-soft text-pn-accent-text' :
                          result.tipo === 'docente' ? 'bg-pn-ok-soft text-pn-ok' :
                          result.tipo === 'curso' ? 'bg-pn-accent-2-soft text-pn-accent-2-text' :
                          result.tipo === 'activo' ? 'bg-pn-warn-soft text-pn-warn' :
                          result.tipo === 'empleado' ? 'bg-pn-accent-2-soft text-pn-accent-2-text' :
                          'bg-pn-warn-soft text-pn-warn'
                        }`}>
                          {result.tipo === 'estudiante' && <Users size={20} />}
                          {result.tipo === 'docente' && <Award size={20} />}
                          {result.tipo === 'curso' && <BookOpen size={20} />}
                          {result.tipo === 'activo' && <Building2 size={20} />}
                          {result.tipo === 'empleado' && <User size={20} />}
                          {result.tipo === 'libro' && <BookOpen size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-pn-ink truncate`}>{result.titulo}</p>
                          <p className={`text-sm text-pn-ink-2 truncate`}>{result.subtitulo}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          result.tipo === 'estudiante' ? 'bg-pn-accent-soft text-pn-accent-text' :
                          result.tipo === 'docente' ? 'bg-pn-ok-soft text-pn-ok' :
                          result.tipo === 'curso' ? 'bg-pn-accent-2-soft text-pn-accent-2-text' :
                          result.tipo === 'activo' ? 'bg-pn-warn-soft text-pn-warn' :
                          result.tipo === 'empleado' ? 'bg-pn-accent-2-soft text-pn-accent-2-text' :
                          'bg-pn-warn-soft text-pn-warn'
                        }`}>
                          {result.tipo.charAt(0).toUpperCase() + result.tipo.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        }
        accionesCabecera={
          <>
            <IconButton
              icono={resuelto === 'dark' ? Sun : Moon}
              etiqueta={resuelto === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
              onClick={alternarTema}
            />

            <span className="relative inline-flex">
              <IconButton
                icono={Mail}
                etiqueta="Mensajes"
                onClick={() => setActiveSection('mensajes')}
              />
              {mensajesNoLeidos > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-[17px] rounded-full bg-pn-accent-2 px-1 text-center font-mono text-[10px] font-semibold leading-[17px] text-pn-accent-2-ink">
                  {mensajesNoLeidos > 99 ? '99+' : mensajesNoLeidos}
                  <span className="sr-only"> mensajes sin leer</span>
                </span>
              )}
            </span>

            <span className="relative inline-flex">
              <IconButton
                icono={Bell}
                etiqueta="Solicitudes pendientes"
                onClick={() => setActiveSection('tramites')}
              />
              {metricas.solicitudesPendientes > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-[17px] rounded-full bg-pn-danger px-1 text-center font-mono text-[10px] font-semibold leading-[17px] text-pn-surface">
                  {metricas.solicitudesPendientes > 99
                    ? '99+'
                    : metricas.solicitudesPendientes}
                  <span className="sr-only"> solicitudes pendientes</span>
                </span>
              )}
            </span>

            {/* El nombre y el correo estaban escritos a mano
                ("admin@university.edu"): cualquier administrador veía la
                identidad de otra persona en su propia cabecera. */}
            <span className="ml-1 flex items-center gap-2">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pn-accent font-display text-sm font-bold text-pn-accent-ink"
                aria-hidden="true"
              >
                {(usuarioActual?.firstName?.[0] ?? 'A').toUpperCase()}
              </span>
              <span className="hidden min-w-0 md:block">
                <span className="block truncate font-body text-[13px] font-semibold text-pn-ink">
                  {[usuarioActual?.firstName, usuarioActual?.lastName]
                    .filter(Boolean)
                    .join(' ') || 'Panel de administración'}
                </span>
                <span className="block truncate font-mono text-[10.5px] text-pn-muted">
                  {usuarioActual?.email ?? ''}
                </span>
              </span>
            </span>
          </>
        }
      >
        {renderContent()}
      </AppShell>
    </ConfigContext.Provider>
  );
}
