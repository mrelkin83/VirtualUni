// ==================== TYPES PARA PANEL ADMINISTRATIVO ====================

// Sección principal del admin
export type AdminSectionType =
  | 'dashboard'
  | 'estudiantes'
  | 'docentes'
  | 'cursos'
  | 'activos'
  | 'inventario'
  | 'nomina'
  | 'recursoshumanos'
  | 'biblioteca'
  | 'carnetizacion'
  | 'administrador';

// ==================== GESTIÓN DE ACTIVOS ====================
export interface Asset {
  id: number;
  codigo: string;
  nombre: string;
  categoria: 'tecnologia' | 'mobiliario' | 'equipamiento' | 'vehiculo' | 'otro';
  descripcion: string;
  valorCompra: number;
  valorActual: number;
  fechaCompra: string;
  estado: 'excelente' | 'bueno' | 'regular' | 'malo' | 'danado';
  ubicacion: string;
  responsable: string;
  imagenUrl?: string;
  numeroSerie?: string;
  proveedor?: string;
}

// ==================== INVENTARIO ====================
export interface InventoryItem {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  cantidadMinima: number;
  unidadMedida: string;
  precioUnitario: number;
  ubicacion: string;
  proveedor: string;
  fechaUltimaCompra: string;
  estado: 'disponible' | 'agotado' | 'bajo' | 'descontinuado';
}

// ==================== NÓMINA ====================
export interface PayrollEmployee {
  id: number;
  nombre: string;
  identificacion: string;
  cargo: string;
  departamento: string;
  salarioBase: number;
  bonificaciones: number;
  deducciones: number;
  salarioNeto: number;
  fechaIngreso: string;
  cuentaBancaria: string;
  banco: string;
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'incapacidad';
}

export interface PayrollPeriod {
  id: number;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  fechaPago: string;
  totalPagar: number;
  estado: 'borrador' | 'procesado' | 'pagado';
  empleados: number;
}

// ==================== RECURSOS HUMANOS ====================
export interface Employee {
  id: number;
  nombre: string;
  identificacion: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  fechaIngreso: string;
  tipoContrato: 'indefinido' | 'fijo' | 'prestacion' | 'pasantia';
  salario: number;
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'incapacidad';
  direccion: string;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  estadoCivil: 'soltero' | 'casado' | 'union_libre' | 'divorciado' | 'viudo';
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}

export interface VacationRequest {
  id: number;
  empleadoId: number;
  empleadoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  diasSolicitados: number;
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fechaSolicitud: string;
}

// ==================== BIBLIOTECA ====================
export interface LibraryBook {
  id: number;
  codigo: string;
  isbn: string;
  titulo: string;
  autor: string;
  editorial: string;
  anioPublicacion: number;
  categoria: string;
  cantidadTotal: number;
  cantidadDisponible: number;
  ubicacion: string;
  estado: 'disponible' | 'prestado' | 'reservado' | 'mantenimiento';
  portadaUrl?: string;
}

export interface LibraryLoan {
  id: number;
  libroId: number;
  libroTitulo: string;
  usuarioId: number;
  usuarioNombre: string;
  tipoUsuario: 'estudiante' | 'docente' | 'administrativo';
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal?: string;
  estado: 'activo' | 'devuelto' | 'vencido';
  multa?: number;
}

// ==================== CARNETIZACIÓN ====================
export interface IDCard {
  id: number;
  usuarioId: number;
  nombre: string;
  identificacion: string;
  tipoUsuario: 'estudiante' | 'docente' | 'administrativo';
  numeroCarnet: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'activo' | 'vencido' | 'bloqueado' | 'perdido';
  fotoUrl: string;
  qrCode?: string;
}

// ==================== ADMINISTRADOR - CONFIGURACIÓN ====================
export interface InstitutionSettings {
  nombre: string;
  nit: string;
  direccion: string;
  ciudad: string;
  pais: string;
  telefono: string;
  email: string;
  sitioWeb: string;
  logoUrl?: string;
  descripcion?: string;
}

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: Permission[];
  usuariosAsignados: number;
  color: string;
}

export interface Permission {
  id: string;
  modulo: string;
  accion: 'leer' | 'crear' | 'editar' | 'eliminar';
  descripcion: string;
}

export interface ThemeSettings {
  colorPrimario: string;
  colorSecundario: string;
  colorExito: string;
  colorAdvertencia: string;
  colorPeligro: string;
  colorInfo: string;
  fuentePrincipal: string;
  tamanoFuenteBase: number;
  modoOscuro: boolean;
}

export interface PaymentSettings {
  pasarelaPago: 'stripe' | 'paypal' | 'mercadopago' | 'wompi' | 'otro';
  clavePublica: string;
  clavePrivada: string;
  moneda: string;
  comision: number;
  activo: boolean;
}

// ==================== ANUNCIOS ====================
export interface Announcement {
  id: string;
  titulo: string;
  contenido: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estado: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';
  adjuntos: string[];
  targetRoles: string[];
  autor: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== MENSAJES MASIVOS ====================
export interface MassMessage {
  id: string;
  asunto: string;
  contenido: string;
  estado: 'BORRADOR' | 'PROGRAMADO' | 'ENVIADO' | 'FALLIDO';
  adjuntos: string[];
  targetRoles: string[];
  targetUsers: string[];
  programado?: string;
  remitente: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== TRÁMITES ====================
export interface Procedure {
  id: string;
  tipo: string;
  descripcion: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'RECHAZADO';
  adjuntos: string[];
  solicitante: string;
  solicitanteId: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== BÚSQUEDA RÁPIDA ====================
export interface QuickSearchResult {
  id: number;
  tipo: 'estudiante' | 'docente' | 'curso' | 'activo' | 'empleado' | 'libro';
  titulo: string;
  subtitulo: string;
  icono: string;
  url: string;
}
