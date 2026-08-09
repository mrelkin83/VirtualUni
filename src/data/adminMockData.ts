import {
  Asset,
  InventoryItem,
  PayrollEmployee,
  PayrollPeriod,
  Employee,
  VacationRequest,
  LibraryBook,
  LibraryLoan,
  IDCard,
  InstitutionSettings,
  Role,
  ThemeSettings,
  PaymentSettings
} from '../types/admin.types';

// ==================== GESTIÓN DE ACTIVOS ====================
export const activos: Asset[] = [
  {
    id: 1,
    codigo: 'ACT-001',
    nombre: 'Computador HP ProBook 450',
    categoria: 'tecnologia',
    descripcion: 'Laptop para laboratorio de computación',
    valorCompra: 2500000,
    valorActual: 1800000,
    fechaCompra: '2023-01-15',
    estado: 'bueno',
    ubicacion: 'Laboratorio 1',
    responsable: 'Carlos Méndez',
    numeroSerie: 'HP-2023-001'
  },
  {
    id: 2,
    codigo: 'ACT-002',
    nombre: 'Proyector Epson',
    categoria: 'tecnologia',
    descripcion: 'Proyector para aulas',
    valorCompra: 1500000,
    valorActual: 1200000,
    fechaCompra: '2023-03-20',
    estado: 'excelente',
    ubicacion: 'Aula 201',
    responsable: 'María González'
  },
  {
    id: 3,
    codigo: 'ACT-003',
    nombre: 'Escritorio ejecutivo',
    categoria: 'mobiliario',
    descripcion: 'Escritorio de madera para oficinas',
    valorCompra: 800000,
    valorActual: 600000,
    fechaCompra: '2022-11-10',
    estado: 'bueno',
    ubicacion: 'Oficina Administrativos',
    responsable: 'Juan Pérez'
  }
];

// ==================== INVENTARIO ====================
export const inventario: InventoryItem[] = [
  {
    id: 1,
    codigo: 'INV-001',
    nombre: 'Papel Bond Carta',
    categoria: 'Papelería',
    cantidad: 150,
    cantidadMinima: 50,
    unidadMedida: 'Resmas',
    precioUnitario: 12000,
    ubicacion: 'Bodega Principal',
    proveedor: 'Papelería Nacional',
    fechaUltimaCompra: '2025-11-15',
    estado: 'disponible'
  },
  {
    id: 2,
    codigo: 'INV-002',
    nombre: 'Marcadores Borrables',
    categoria: 'Útiles',
    cantidad: 25,
    cantidadMinima: 30,
    unidadMedida: 'Cajas',
    precioUnitario: 18000,
    ubicacion: 'Bodega Principal',
    proveedor: 'Distribuidora Escolar',
    fechaUltimaCompra: '2025-10-20',
    estado: 'bajo'
  },
  {
    id: 3,
    codigo: 'INV-003',
    nombre: 'Tóner HP LaserJet',
    categoria: 'Tecnología',
    cantidad: 12,
    cantidadMinima: 5,
    unidadMedida: 'Unidades',
    precioUnitario: 85000,
    ubicacion: 'Bodega Principal',
    proveedor: 'TechSupply',
    fechaUltimaCompra: '2025-11-01',
    estado: 'disponible'
  }
];

// ==================== NÓMINA ====================
export const empleadosNomina: PayrollEmployee[] = [
  {
    id: 1,
    nombre: 'Ana María López',
    identificacion: '1023456789',
    cargo: 'Docente',
    departamento: 'Ingeniería',
    salarioBase: 4500000,
    bonificaciones: 500000,
    deducciones: 850000,
    salarioNeto: 4150000,
    fechaIngreso: '2020-02-15',
    cuentaBancaria: '123456789',
    banco: 'Bancolombia',
    estado: 'activo'
  },
  {
    id: 2,
    nombre: 'Carlos Rodríguez',
    identificacion: '1034567890',
    cargo: 'Administrativo',
    departamento: 'Finanzas',
    salarioBase: 3500000,
    bonificaciones: 300000,
    deducciones: 680000,
    salarioNeto: 3120000,
    fechaIngreso: '2019-06-01',
    cuentaBancaria: '987654321',
    banco: 'Davivienda',
    estado: 'activo'
  }
];

export const periodosNomina: PayrollPeriod[] = [
  {
    id: 1,
    periodo: 'Noviembre 2025',
    fechaInicio: '2025-11-01',
    fechaFin: '2025-11-30',
    fechaPago: '2025-12-05',
    totalPagar: 45500000,
    estado: 'procesado',
    empleados: 12
  },
  {
    id: 2,
    periodo: 'Diciembre 2025',
    fechaInicio: '2025-12-01',
    fechaFin: '2025-12-31',
    fechaPago: '2026-01-05',
    totalPagar: 47200000,
    estado: 'borrador',
    empleados: 12
  }
];

// ==================== RECURSOS HUMANOS ====================
export const empleados: Employee[] = [
  {
    id: 1,
    nombre: 'Ana María López Gómez',
    identificacion: '1023456789',
    email: 'ana.lopez@universidad.edu',
    telefono: '3201234567',
    cargo: 'Docente Tiempo Completo',
    departamento: 'Ingeniería de Sistemas',
    fechaIngreso: '2020-02-15',
    tipoContrato: 'indefinido',
    salario: 4500000,
    estado: 'activo',
    direccion: 'Calle 45 #23-15',
    fechaNacimiento: '1985-05-20',
    genero: 'femenino',
    estadoCivil: 'casado',
    contactoEmergencia: {
      nombre: 'Pedro López',
      telefono: '3109876543',
      relacion: 'Esposo'
    }
  },
  {
    id: 2,
    nombre: 'Carlos Andrés Rodríguez',
    identificacion: '1034567890',
    email: 'carlos.rodriguez@universidad.edu',
    telefono: '3159876543',
    cargo: 'Coordinador Financiero',
    departamento: 'Finanzas',
    fechaIngreso: '2019-06-01',
    tipoContrato: 'indefinido',
    salario: 3500000,
    estado: 'activo',
    direccion: 'Carrera 30 #12-40',
    fechaNacimiento: '1988-08-15',
    genero: 'masculino',
    estadoCivil: 'soltero',
    contactoEmergencia: {
      nombre: 'María Rodríguez',
      telefono: '3187654321',
      relacion: 'Madre'
    }
  }
];

export const solicitudesVacaciones: VacationRequest[] = [
  {
    id: 1,
    empleadoId: 1,
    empleadoNombre: 'Ana María López',
    fechaInicio: '2025-12-20',
    fechaFin: '2026-01-05',
    diasSolicitados: 12,
    motivo: 'Vacaciones de fin de año',
    estado: 'pendiente',
    fechaSolicitud: '2025-11-25'
  }
];

// ==================== BIBLIOTECA ====================
export const libros: LibraryBook[] = [
  {
    id: 1,
    codigo: 'LIB-001',
    isbn: '978-3-16-148410-0',
    titulo: 'Fundamentos de Programación',
    autor: 'John Doe',
    editorial: 'Tech Books',
    anioPublicacion: 2022,
    categoria: 'Ingeniería',
    cantidadTotal: 10,
    cantidadDisponible: 7,
    ubicacion: 'Estante A-12',
    estado: 'disponible'
  },
  {
    id: 2,
    codigo: 'LIB-002',
    isbn: '978-0-13-468599-1',
    titulo: 'Estructuras de Datos',
    autor: 'Jane Smith',
    editorial: 'Academic Press',
    anioPublicacion: 2023,
    categoria: 'Ingeniería',
    cantidadTotal: 5,
    cantidadDisponible: 0,
    ubicacion: 'Estante A-15',
    estado: 'prestado'
  }
];

export const prestamos: LibraryLoan[] = [
  {
    id: 1,
    libroId: 2,
    libroTitulo: 'Estructuras de Datos',
    usuarioId: 101,
    usuarioNombre: 'María García',
    tipoUsuario: 'estudiante',
    fechaPrestamo: '2025-11-20',
    fechaDevolucionEsperada: '2025-12-05',
    estado: 'activo'
  }
];

// ==================== CARNETIZACIÓN ====================
export const carnets: IDCard[] = [
  {
    id: 1,
    usuarioId: 101,
    nombre: 'María García Pérez',
    identificacion: '1012345678',
    tipoUsuario: 'estudiante',
    numeroCarnet: 'EST-2025-001',
    fechaEmision: '2025-01-15',
    fechaVencimiento: '2026-01-15',
    estado: 'activo',
    fotoUrl: '/assets/fotos/maria-garcia.jpg'
  },
  {
    id: 2,
    usuarioId: 1,
    nombre: 'Ana María López',
    identificacion: '1023456789',
    tipoUsuario: 'docente',
    numeroCarnet: 'DOC-2025-001',
    fechaEmision: '2025-01-10',
    fechaVencimiento: '2030-01-10',
    estado: 'activo',
    fotoUrl: '/assets/fotos/ana-lopez.jpg'
  }
];

// ==================== CONFIGURACIÓN INSTITUCIÓN ====================
export const configuracionInstitucion: InstitutionSettings = {
  nombre: 'Universidad Virtual',
  nit: '900123456-7',
  direccion: 'Calle 100 #45-23',
  ciudad: 'Bogotá',
  pais: 'Colombia',
  telefono: '+57 (1) 234 5678',
  email: 'info@univirtual.edu.co',
  sitioWeb: 'https://www.univirtual.edu.co',
  descripcion: 'Universidad líder en educación virtual y presencial'
};

// ==================== ROLES Y PERMISOS ====================
export const roles: Role[] = [
  {
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema',
    permisos: [],
    usuariosAsignados: 3,
    color: 'bg-red-500'
  },
  {
    id: 2,
    nombre: 'Docente',
    descripcion: 'Gestión de cursos y estudiantes',
    permisos: [],
    usuariosAsignados: 25,
    color: 'bg-blue-500'
  },
  {
    id: 3,
    nombre: 'Estudiante',
    descripcion: 'Acceso a cursos y recursos',
    permisos: [],
    usuariosAsignados: 350,
    color: 'bg-green-500'
  },
  {
    id: 4,
    nombre: 'Coordinador',
    descripcion: 'Supervisión de programas académicos',
    permisos: [],
    usuariosAsignados: 8,
    color: 'bg-purple-500'
  }
];

// ==================== TEMAS ====================
export const temaActual: ThemeSettings = {
  colorPrimario: '#3B82F6',
  colorSecundario: '#8B5CF6',
  colorExito: '#10B981',
  colorAdvertencia: '#F59E0B',
  colorPeligro: '#EF4444',
  colorInfo: '#06B6D4',
  fuentePrincipal: 'Inter, sans-serif',
  tamanoFuenteBase: 16,
  modoOscuro: false
};

// ==================== CONFIGURACIÓN DE PAGO ====================
export const configuracionPago: PaymentSettings = {
  pasarelaPago: 'stripe',
  clavePublica: 'pk_test_xxxxxxxxxxxxx',
  clavePrivada: 'sk_test_xxxxxxxxxxxxx',
  moneda: 'COP',
  comision: 3.5,
  activo: true
};
