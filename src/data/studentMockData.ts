// Datos mock para el Panel de Estudiante

import {
  StudentCourse,
  StudentTask,
  StudentExam,
  StudentMessage,
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

export const studentMensajes: StudentMessage[] = [
  { id: 1, remitente: 'Prof. García', asunto: 'Retroalimentación Proyecto Final', preview: 'Tu proyecto muestra un excelente dominio de los conceptos...', fecha: '2025-10-03 11:20', leido: false, tipo: 'recibido', avatar: 'PG' },
  { id: 2, remitente: 'Coordinación Académica', asunto: 'Inscripción próximo semestre', preview: 'Recordatorio: El período de inscripción inicia el 15 de octubre...', fecha: '2025-10-02 09:15', leido: false, tipo: 'recibido', avatar: 'CA' },
  { id: 3, remitente: 'Prof. Martínez', asunto: 'Material adicional disponible', preview: 'He subido material complementario sobre redes neuronales...', fecha: '2025-10-01 16:30', leido: true, tipo: 'recibido', avatar: 'PM' }
];

export const studentCursos: StudentCourse[] = [
  {
    id: 1,
    nombre: 'Programación Avanzada',
    progreso: 75,
    color: 'bg-blue-500',
    tareasPendientes: 2,
    proximaClase: 'Hoy 14:00',
    profesor: 'Prof. García',
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
            ideasClave: [
              'Introducción y objetivos',
              '¿Qué son los patrones de diseño?',
              'Clasificación de patrones',
              'Singleton Pattern',
              'Factory Pattern',
              'Referencias bibliográficas',
              'Bibliografía complementaria'
            ],
            contenido: 'Los patrones de diseño son soluciones reutilizables a problemas comunes en el desarrollo de software...'
          },
          {
            id: 2,
            titulo: 'PATRONES ESTRUCTURALES Y DE COMPORTAMIENTO',
            objetivos: [
              'Comprender los patrones estructurales más utilizados',
              'Aplicar patrones de comportamiento en situaciones reales',
              'Comparar diferentes patrones para seleccionar el más apropiado'
            ],
            ideasClave: [
              'Patrones estructurales: Adapter',
              'Patrones estructurales: Decorator',
              'Patrones de comportamiento: Observer',
              'Patrones de comportamiento: Strategy'
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
    id: 2,
    nombre: 'Diseño de Interfaces',
    progreso: 60,
    color: 'bg-purple-500',
    tareasPendientes: 1,
    proximaClase: 'Mañana 10:00',
    profesor: 'Prof. López',
    temas: [
      { id: 1, titulo: 'Principios de Diseño', completado: true, materiales: ['PDF: UX Basics'], bloques: [] },
      { id: 2, titulo: 'Prototipado', completado: false, materiales: ['Video: Figma Tutorial'], bloques: [] }
    ]
  },
  {
    id: 3,
    nombre: 'Base de Datos',
    progreso: 100,
    color: 'bg-green-500',
    tareasPendientes: 0,
    proximaClase: 'Curso Completado',
    profesor: 'Prof. Rodríguez',
    temas: [{ id: 1, titulo: 'SQL Avanzado', completado: true, materiales: ['Video: Joins', 'Ejercicios SQL'], bloques: [] }]
  },
  {
    id: 4,
    nombre: 'Inteligencia Artificial',
    progreso: 45,
    color: 'bg-orange-500',
    tareasPendientes: 3,
    proximaClase: 'Hoy 18:00',
    profesor: 'Prof. Martínez',
    temas: [{ id: 1, titulo: 'Machine Learning', completado: false, materiales: ['Video: Intro ML'], bloques: [] }]
  }
];

export const clasesVivo = [
  { id: 1, curso: 'Programación Avanzada', titulo: 'Patrones de Diseño - Singleton', profesor: 'Prof. García', hora: 'Hoy 14:00 - 16:00', link: 'https://zoom.us/j/123', participantes: 28, estado: 'próxima' },
  { id: 2, curso: 'Inteligencia Artificial', titulo: 'Redes Neuronales Profundas', profesor: 'Prof. Martínez', hora: 'Hoy 18:00 - 20:00', link: 'https://zoom.us/j/456', participantes: 32, estado: 'próxima' }
];

export const clasesGrabadas = [
  { id: 1, curso: 'Programación Avanzada', titulo: 'Introducción a Patrones de Diseño', profesor: 'Prof. García', duracion: '1:45:30', fecha: '2025-09-28', vistas: 142, link: '#' },
  { id: 2, curso: 'Base de Datos', titulo: 'Normalización de Bases de Datos', profesor: 'Prof. Rodríguez', duracion: '2:10:15', fecha: '2025-09-25', vistas: 98, link: '#' }
];

export const studentTareas: StudentTask[] = [
  { id: 1, titulo: 'Proyecto Final IA', curso: 'Inteligencia Artificial', fechaLimite: '2025-10-05', estado: 'pendiente', descripcion: 'Implementar una red neuronal para clasificación de imágenes' },
  { id: 2, titulo: 'Taller JavaScript', curso: 'Programación Avanzada', fechaLimite: '2025-10-03', estado: 'pendiente', descripcion: 'Resolver 10 ejercicios de programación funcional' },
  { id: 3, titulo: 'Diseño Mockup App', curso: 'Diseño de Interfaces', fechaLimite: '2025-10-06', fechaEntrega: '2025-10-05 10:30 AM', estado: 'entregada', descripcion: 'Crear mockup de aplicación móvil en Figma' },
  { id: 4, titulo: 'Ensayo Ética', curso: 'Ética Profesional', fechaLimite: '2025-09-28', fechaEntrega: '2025-09-27 03:45 PM', estado: 'calificada', calificacion: 4.5, descripcion: 'Ensayo sobre dilemas éticos en tecnología' },
  { id: 5, titulo: 'Laboratorio SQL', curso: 'Bases de Datos', fechaLimite: '2025-09-25', fechaEntrega: '2025-09-24 11:20 AM', estado: 'calificada', calificacion: 4.8, descripcion: 'Ejercicios de consultas SQL avanzadas' }
];

export const studentExamenes: StudentExam[] = [
  {
    id: 1,
    titulo: 'Examen Parcial 2',
    curso: 'Programación Avanzada',
    fecha: '2025-10-04 23:59',
    duracion: '90 min',
    estado: 'disponible',
    preguntas: [
      {
        id: 1,
        pregunta: '¿Qué es un patrón de diseño Singleton?',
        tipo: 'multiple',
        opciones: ['Un patrón que permite una sola instancia', 'Un patrón para múltiples objetos', 'Un patrón de herencia', 'Ninguna de las anteriores'],
        respuestaCorrecta: 0
      },
      {
        id: 2,
        pregunta: '¿Cuál es la complejidad de búsqueda binaria?',
        tipo: 'multiple',
        opciones: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        respuestaCorrecta: 1
      }
    ]
  },
  {
    id: 2,
    titulo: 'Examen Parcial 1',
    curso: 'Programación Avanzada',
    fecha: '2025-09-20',
    duracion: '90 min',
    estado: 'completado',
    calificacion: 9.2
  }
];

export const calificaciones = [
  { curso: 'Programación Avanzada', parcial1: 9.2, parcial2: 8.5, talleres: 9.0, proyecto: null, promedio: 8.9 },
  { curso: 'Diseño de Interfaces', parcial1: 8.8, parcial2: null, talleres: 9.2, proyecto: 8.5, promedio: 8.8 },
  { curso: 'Base de Datos', parcial1: 9.5, parcial2: 9.0, talleres: 8.8, proyecto: 9.2, promedio: 9.1 },
  { curso: 'Inteligencia Artificial', parcial1: 8.0, parcial2: null, talleres: 8.5, proyecto: null, promedio: 8.2 }
];

export const libros: Book[] = [
  {
    id: 1,
    titulo: 'Clean Code',
    autor: 'Robert C. Martin',
    categoria: 'Programación',
    disponible: true,
    descripcion: 'Una guía completa sobre cómo escribir código limpio y mantenible',
    isbn: '978-0132350884',
    editorial: 'Prentice Hall',
    anioPublicacion: 2008,
    copias: 3,
    copiasDisponibles: 2
  },
  {
    id: 2,
    titulo: 'Design Patterns',
    autor: 'Gang of Four',
    categoria: 'Programación',
    disponible: true,
    descripcion: 'Patrones de diseño fundamentales en programación orientada a objetos',
    isbn: '978-0201633610',
    editorial: 'Addison-Wesley',
    anioPublicacion: 1994,
    copias: 2,
    copiasDisponibles: 1
  },
  {
    id: 3,
    titulo: 'Deep Learning',
    autor: 'Ian Goodfellow',
    categoria: 'IA',
    disponible: false,
    descripcion: 'Introducción completa al aprendizaje profundo y redes neuronales',
    isbn: '978-0262035613',
    editorial: 'MIT Press',
    anioPublicacion: 2016,
    copias: 2,
    copiasDisponibles: 0
  },
  {
    id: 4,
    titulo: 'Introduction to Algorithms',
    autor: 'Thomas H. Cormen',
    categoria: 'Algoritmos',
    disponible: true,
    descripcion: 'Referencia definitiva sobre algoritmos y estructuras de datos',
    isbn: '978-0262033844',
    editorial: 'MIT Press',
    anioPublicacion: 2009,
    copias: 4,
    copiasDisponibles: 3
  },
  {
    id: 5,
    titulo: 'The Pragmatic Programmer',
    autor: 'Andrew Hunt',
    categoria: 'Programación',
    disponible: true,
    descripcion: 'Consejos prácticos para convertirse en un mejor programador',
    isbn: '978-0135957059',
    editorial: 'Addison-Wesley',
    anioPublicacion: 2019,
    copias: 3,
    copiasDisponibles: 3
  },
  {
    id: 6,
    titulo: 'Database System Concepts',
    autor: 'Abraham Silberschatz',
    categoria: 'Base de Datos',
    disponible: true,
    descripcion: 'Conceptos fundamentales de sistemas de bases de datos',
    isbn: '978-0078022159',
    editorial: 'McGraw-Hill',
    anioPublicacion: 2019,
    copias: 3,
    copiasDisponibles: 2
  },
  {
    id: 7,
    titulo: 'Artificial Intelligence: A Modern Approach',
    autor: 'Stuart Russell',
    categoria: 'IA',
    disponible: true,
    descripcion: 'Texto completo sobre inteligencia artificial moderna',
    isbn: '978-0134610993',
    editorial: 'Pearson',
    anioPublicacion: 2020,
    copias: 2,
    copiasDisponibles: 1
  },
  {
    id: 8,
    titulo: 'Refactoring',
    autor: 'Martin Fowler',
    categoria: 'Programación',
    disponible: true,
    descripcion: 'Mejora del diseño de código existente',
    isbn: '978-0134757599',
    editorial: 'Addison-Wesley',
    anioPublicacion: 2018,
    copias: 2,
    copiasDisponibles: 2
  }
];

export const prestamosActivos: LibraryLoan[] = [
  {
    id: 1,
    libroId: 3,
    libroTitulo: 'Deep Learning',
    libroAutor: 'Ian Goodfellow',
    fechaPrestamo: '2025-10-01',
    fechaDevolucion: '2025-10-15',
    estado: 'activo',
    diasRestantes: 12
  }
];

export const reservasLibros: LibraryReservation[] = [
  {
    id: 1,
    libroId: 3,
    libroTitulo: 'Deep Learning',
    fechaReserva: '2025-10-03',
    estado: 'pendiente'
  }
];

export const solicitudes = [
  { id: 1, tipo: 'Certificado de Estudios', fecha: '2025-09-28', estado: 'Completado', respuesta: 'Descargable' },
  { id: 2, tipo: 'Homologación', fecha: '2025-09-20', estado: 'En proceso', respuesta: 'Pendiente' }
];

export const tramites = [
  { id: 1, tipo: 'Constancia de Estudios', fecha: '2025-10-01', estado: 'Completado', observaciones: 'Certificado para empresa', descripcion: 'Certificado de estudiante activo' },
  { id: 2, tipo: 'Retiro de Materia', fecha: '2025-09-25', estado: 'En proceso', observaciones: 'Motivos personales', descripcion: 'Solicitud para retirarse de una materia' },
  { id: 3, tipo: 'Solicitud de Beca', fecha: '2025-09-15', estado: 'Pendiente', observaciones: 'Documentación adjunta', descripcion: 'Gestiona tu solicitud de beca' }
];

export const tramitesDisponibles = [
  { id: 1, nombre: 'Constancia de Estudios', descripcion: 'Certificado de estudiante activo' },
  { id: 2, nombre: 'Retiro de Materia', descripcion: 'Solicitud para retirarse de una materia' },
  { id: 3, nombre: 'Cambio de Horario', descripcion: 'Modificación de horario académico' },
  { id: 4, nombre: 'Solicitud de Beca', descripcion: 'Gestiona tu solicitud de beca' },
  { id: 5, nombre: 'Validación de Estudios', descripcion: 'Validación de estudios previos' },
  { id: 6, nombre: 'Reintegro', descripcion: 'Solicitud de reintegro financiero' },
  { id: 7, nombre: 'Homologación', descripcion: 'Homologación de materias' },
  { id: 8, nombre: 'Carta de Presentación', descripcion: 'Carta institucional de presentación' }
];

export const anuncios = [
  {
    id: 1,
    titulo: 'Inscripciones abiertas',
    descripcion: 'Proceso abierto del 15 al 30 de octubre',
    contenido: 'Queridos estudiantes, les informamos que el proceso de inscripciones para el próximo semestre estará abierto desde el 15 hasta el 30 de octubre. Durante este período podrán inscribir sus materias a través del portal estudiantil. Recuerden revisar los prerequisitos de cada materia y consultar con su asesor académico en caso de dudas. ¡No dejen las inscripciones para el último día!',
    fecha: '2025-10-01',
    icono: '📢',
    color: 'border-red-500'
  },
  {
    id: 2,
    titulo: 'Hackathon 2025',
    descripcion: 'Premios hasta $5,000 USD',
    contenido: 'La universidad convoca al Hackathon 2025, un evento de 48 horas donde equipos de estudiantes competirán para desarrollar soluciones innovadoras a problemas reales. Los mejores proyectos recibirán premios de hasta $5,000 USD. Las inscripciones están abiertas para equipos de 3 a 5 personas. Fecha del evento: 15-17 de noviembre. ¡No te pierdas esta oportunidad de demostrar tus habilidades!',
    fecha: '2025-10-02',
    icono: '🏆',
    color: 'border-orange-500'
  },
  {
    id: 3,
    titulo: 'Nueva biblioteca digital',
    descripcion: 'Más de 10,000 recursos',
    contenido: 'Nos complace anunciar el lanzamiento de nuestra nueva biblioteca digital con más de 10,000 recursos académicos incluyendo libros electrónicos, revistas científicas, bases de datos especializadas y contenido multimedia. Todos los estudiantes tienen acceso gratuito mediante sus credenciales institucionales. Explora recursos en múltiples idiomas y disciplinas. Accede ahora desde el portal de la biblioteca.',
    fecha: '2025-10-03',
    icono: '📚',
    color: 'border-blue-500'
  }
];

export const datosPerfil = {
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
};

// Datos financieros
export const historialPagos = [
  { id: 1, concepto: 'Matrícula 2025-1', monto: 1500000, fecha: '2025-01-15', metodoPago: 'Tarjeta de Crédito', estado: 'completado' as const, comprobante: 'MAT-2025-001' },
  { id: 2, concepto: 'Pensión Febrero', monto: 500000, fecha: '2025-02-10', metodoPago: 'PSE', estado: 'completado' as const, comprobante: 'PENS-2025-002' },
  { id: 3, concepto: 'Pensión Marzo', monto: 500000, fecha: '2025-03-12', metodoPago: 'PSE', estado: 'completado' as const, comprobante: 'PENS-2025-003' },
  { id: 4, concepto: 'Pensión Abril', monto: 500000, fecha: '2025-04-08', metodoPago: 'Transferencia Bancaria', estado: 'completado' as const, comprobante: 'PENS-2025-004' },
  { id: 5, concepto: 'Material Didáctico', monto: 150000, fecha: '2025-02-20', metodoPago: 'Efectivo', estado: 'completado' as const, comprobante: 'MAT-2025-005' },
  { id: 6, concepto: 'Seguro Estudiantil', monto: 180000, fecha: '2025-01-20', metodoPago: 'Tarjeta de Crédito', estado: 'completado' as const, comprobante: 'SEG-2025-006' }
];

export const deudasPendientes = [
  { id: 1, concepto: 'Pensión Mayo', monto: 500000, fechaVencimiento: '2025-05-10', estado: 'pendiente' as const },
  { id: 2, concepto: 'Pensión Junio', monto: 500000, fechaVencimiento: '2025-06-10', estado: 'pendiente' as const },
  { id: 3, concepto: 'Certificados Académicos', monto: 50000, fechaVencimiento: '2025-05-15', estado: 'pendiente' as const }
];

export const resumenFinanciero = {
  totalPagado: 3330000,
  saldoPendiente: 1050000,
  proximoVencimiento: '10 de Mayo',
  ultimoPago: 500000
};

// Datos de Foros
export const forosTopicos: ForumTopic[] = [
  {
    id: 1,
    titulo: '¿Cómo implementar el patrón Singleton en JavaScript?',
    descripcion: 'Tengo dudas sobre la implementación correcta del patrón Singleton en JavaScript moderno. ¿Alguien puede ayudarme?',
    autor: 'Dayla Otalvaro',
    curso: 'Programación Avanzada',
    fechaCreacion: '2025-10-03 10:30',
    respuestas: 5,
    vistas: 42,
    ultimaActividad: '2025-10-03 15:20',
    estado: 'abierto',
    categoria: 'dudas'
  },
  {
    id: 2,
    titulo: 'Proyecto Final - Ideas y Propuestas',
    descripcion: 'Espacio para compartir ideas sobre el proyecto final del curso',
    autor: 'Prof. García',
    curso: 'Programación Avanzada',
    fechaCreacion: '2025-10-01 09:00',
    respuestas: 15,
    vistas: 128,
    ultimaActividad: '2025-10-03 18:45',
    estado: 'destacado',
    categoria: 'proyectos'
  },
  {
    id: 3,
    titulo: 'Recursos adicionales sobre Deep Learning',
    descripcion: 'Comparto algunos recursos útiles que encontré sobre redes neuronales profundas',
    autor: 'Carlos Mendez',
    curso: 'Inteligencia Artificial',
    fechaCreacion: '2025-10-02 14:15',
    respuestas: 8,
    vistas: 67,
    ultimaActividad: '2025-10-03 12:30',
    estado: 'abierto',
    categoria: 'academico'
  },
  {
    id: 4,
    titulo: 'Normalización de bases de datos - Dudas',
    descripcion: '¿Cuándo es necesario normalizar hasta la 5ta forma normal?',
    autor: 'María López',
    curso: 'Base de Datos',
    fechaCreacion: '2025-09-30 11:00',
    respuestas: 12,
    vistas: 95,
    ultimaActividad: '2025-10-01 16:20',
    estado: 'cerrado',
    categoria: 'dudas'
  },
  {
    id: 5,
    titulo: 'Anuncio: Hackathon Universidad 2025',
    descripcion: 'Información importante sobre el hackathon del próximo mes',
    autor: 'Coordinación Académica',
    curso: 'General',
    fechaCreacion: '2025-10-03 08:00',
    respuestas: 23,
    vistas: 210,
    ultimaActividad: '2025-10-03 19:00',
    estado: 'destacado',
    categoria: 'general'
  }
];

export const forosRespuestas: ForumReply[] = [
  {
    id: 1,
    topicoId: 1,
    autor: 'Prof. García',
    contenido: 'El patrón Singleton en JavaScript se puede implementar de varias formas. Una forma moderna es usar módulos ES6 que son singleton por naturaleza. También puedes usar clases con una instancia privada.',
    fecha: '2025-10-03 11:00',
    likes: 8,
    esRespuestaProfesor: true
  },
  {
    id: 2,
    topicoId: 1,
    autor: 'Juan Pérez',
    contenido: 'Yo lo implementé usando Symbol para hacer la instancia verdaderamente privada. Te comparto mi código...',
    fecha: '2025-10-03 12:15',
    likes: 3,
    esRespuestaProfesor: false
  }
];

// Datos de Horarios
export const horarioClases: ScheduleClass[] = [
  {
    id: 1,
    curso: 'Programación Avanzada',
    profesor: 'Prof. García',
    dia: 'Lunes',
    horaInicio: '14:00',
    horaFin: '16:00',
    aula: 'Aula 302',
    tipo: 'presencial',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    curso: 'Programación Avanzada',
    profesor: 'Prof. García',
    dia: 'Jueves',
    horaInicio: '14:00',
    horaFin: '16:00',
    aula: 'Aula 302',
    tipo: 'presencial',
    color: 'bg-blue-500'
  },
  {
    id: 3,
    curso: 'Inteligencia Artificial',
    profesor: 'Prof. Martínez',
    dia: 'Martes',
    horaInicio: '18:00',
    horaFin: '20:00',
    aula: 'Virtual',
    tipo: 'virtual',
    enlaceVirtual: 'https://zoom.us/j/123456789',
    color: 'bg-orange-500'
  },
  {
    id: 4,
    curso: 'Inteligencia Artificial',
    profesor: 'Prof. Martínez',
    dia: 'Viernes',
    horaInicio: '18:00',
    horaFin: '20:00',
    aula: 'Virtual',
    tipo: 'virtual',
    enlaceVirtual: 'https://zoom.us/j/123456789',
    color: 'bg-orange-500'
  },
  {
    id: 5,
    curso: 'Diseño de Interfaces',
    profesor: 'Prof. López',
    dia: 'Miércoles',
    horaInicio: '10:00',
    horaFin: '12:00',
    aula: 'Lab 101',
    tipo: 'hibrido',
    enlaceVirtual: 'https://meet.google.com/abc-defg-hij',
    color: 'bg-purple-500'
  },
  {
    id: 6,
    curso: 'Base de Datos',
    profesor: 'Prof. Rodríguez',
    dia: 'Viernes',
    horaInicio: '16:00',
    horaFin: '18:00',
    aula: 'Aula 205',
    tipo: 'presencial',
    color: 'bg-green-500'
  }
];

export const horarioEventos: ScheduleEvent[] = [
  {
    id: 1,
    titulo: 'Examen Parcial 2 - Programación Avanzada',
    descripcion: 'Segundo examen parcial del curso',
    fecha: '2025-10-10',
    hora: '14:00',
    tipo: 'examen',
    curso: 'Programación Avanzada',
    prioridad: 'alta'
  },
  {
    id: 2,
    titulo: 'Entrega Proyecto Final IA',
    descripcion: 'Fecha límite para entregar el proyecto final',
    fecha: '2025-10-15',
    hora: '23:59',
    tipo: 'entrega',
    curso: 'Inteligencia Artificial',
    prioridad: 'alta'
  },
  {
    id: 3,
    titulo: 'Hackathon Universidad 2025',
    descripcion: 'Competencia de programación',
    fecha: '2025-10-20',
    hora: '08:00',
    tipo: 'evento',
    prioridad: 'media'
  },
  {
    id: 4,
    titulo: 'Reunión con Asesor Académico',
    descripcion: 'Seguimiento del plan de estudios',
    fecha: '2025-10-08',
    hora: '15:00',
    tipo: 'reunion',
    prioridad: 'media'
  }
];

// Datos de Certificados
export const certificadosDisponibles: Certificate[] = [
  {
    id: 1,
    tipo: 'Certificado de Estudios',
    descripcion: 'Certificado que acredita tu condición de estudiante activo',
    estado: 'disponible',
    costo: 0,
    requiereAprobacion: false,
    tiempoEstimado: 'Inmediato'
  },
  {
    id: 2,
    tipo: 'Certificado de Notas',
    descripcion: 'Certificado con el historial completo de calificaciones',
    estado: 'disponible',
    costo: 15000,
    requiereAprobacion: true,
    tiempoEstimado: '2-3 días hábiles'
  },
  {
    id: 3,
    tipo: 'Constancia de Matrícula',
    descripcion: 'Documento que certifica tu matrícula vigente',
    estado: 'disponible',
    costo: 0,
    requiereAprobacion: false,
    tiempoEstimado: 'Inmediato'
  },
  {
    id: 4,
    tipo: 'Certificado de Contenidos',
    descripcion: 'Certificado detallado de contenidos programáticos por asignatura',
    estado: 'disponible',
    costo: 25000,
    requiereAprobacion: true,
    tiempoEstimado: '3-5 días hábiles'
  },
  {
    id: 5,
    tipo: 'Certificado de Graduación',
    descripcion: 'Certificado oficial de grado (solo para graduados)',
    estado: 'en_proceso',
    costo: 50000,
    requiereAprobacion: true,
    tiempoEstimado: '5-7 días hábiles'
  },
  {
    id: 6,
    tipo: 'Carta de Presentación',
    descripcion: 'Carta institucional de presentación',
    estado: 'disponible',
    costo: 10000,
    requiereAprobacion: true,
    tiempoEstimado: '1-2 días hábiles'
  }
];

export const solicitudesCertificados: CertificateRequest[] = [
  {
    id: 1,
    tipoCertificado: 'Certificado de Notas',
    fechaSolicitud: '2025-09-28',
    estado: 'completado',
    observaciones: 'Para solicitud de beca',
    fechaEstimada: '2025-09-30',
    archivoUrl: '/certificados/notas_2025.pdf'
  },
  {
    id: 2,
    tipoCertificado: 'Carta de Presentación',
    fechaSolicitud: '2025-10-01',
    estado: 'aprobado',
    observaciones: 'Para proceso de prácticas profesionales',
    fechaEstimada: '2025-10-03'
  },
  {
    id: 3,
    tipoCertificado: 'Certificado de Contenidos',
    fechaSolicitud: '2025-10-02',
    estado: 'pendiente',
    observaciones: 'Necesario para homologación',
    fechaEstimada: '2025-10-07'
  }
];

// Datos de Clases
export const clasesData: Clase[] = [
  {
    id: 1,
    titulo: 'Introducción a React Hooks',
    curso: 'Programación Avanzada',
    profesor: 'Prof. García',
    tipo: 'en_vivo',
    fecha: 'Hoy 14:00',
    duracion: '2 horas',
    estado: 'en_curso',
    enlace: 'https://meet.google.com/abc-defg-hij',
    descripcion: 'Aprenderemos los fundamentos de React Hooks incluyendo useState, useEffect y custom hooks',
    asistentes: 45,
    materialesAdjuntos: ['Presentación.pdf', 'Código de ejemplo']
  },
  {
    id: 2,
    titulo: 'Bases de Datos Relacionales',
    curso: 'Base de Datos',
    profesor: 'Prof. Rodríguez',
    tipo: 'en_vivo',
    fecha: 'Mañana 10:00',
    duracion: '1.5 horas',
    estado: 'programada',
    enlace: 'https://meet.google.com/xyz-uvwx-rst',
    descripcion: 'Modelado de datos y diseño de esquemas relacionales',
    materialesAdjuntos: ['Diagrama ER.pdf']
  },
  {
    id: 3,
    titulo: 'Algoritmos de Ordenamiento',
    curso: 'Estructura de Datos',
    profesor: 'Prof. Martínez',
    tipo: 'grabada',
    fecha: '2025-10-01',
    duracion: '1 hora 30 min',
    estado: 'disponible',
    descripcion: 'Análisis de algoritmos de ordenamiento: QuickSort, MergeSort, HeapSort',
    grabacionUrl: 'https://videos.example.com/ordenamiento',
    materialesAdjuntos: ['Notas de clase.pdf', 'Ejercicios.zip']
  },
  {
    id: 4,
    titulo: 'Introducción a Machine Learning',
    curso: 'Inteligencia Artificial',
    profesor: 'Prof. López',
    tipo: 'en_vivo',
    fecha: 'Viernes 16:00',
    duracion: '2 horas',
    estado: 'programada',
    enlace: 'https://meet.google.com/ml-intro-2025',
    descripcion: 'Conceptos básicos de ML, tipos de aprendizaje y primeros modelos',
    materialesAdjuntos: ['Slides ML.pdf', 'Dataset ejemplo.csv']
  },
  {
    id: 5,
    titulo: 'Patrones de Diseño - Parte 1',
    curso: 'Programación Avanzada',
    profesor: 'Prof. García',
    tipo: 'grabada',
    fecha: '2025-09-28',
    duracion: '1 hora 45 min',
    estado: 'disponible',
    descripcion: 'Patrones creacionales: Singleton, Factory, Builder',
    grabacionUrl: 'https://videos.example.com/patrones-1',
    materialesAdjuntos: ['Patrones.pdf', 'Código ejemplos.zip']
  },
  {
    id: 6,
    titulo: 'SQL Avanzado y Optimización',
    curso: 'Base de Datos',
    profesor: 'Prof. Rodríguez',
    tipo: 'grabada',
    fecha: '2025-09-30',
    duracion: '2 horas',
    estado: 'finalizada',
    descripcion: 'Consultas complejas, índices, y optimización de queries',
    grabacionUrl: 'https://videos.example.com/sql-avanzado',
    asistentes: 42,
    materialesAdjuntos: ['Scripts SQL.sql', 'Guía optimización.pdf']
  }
];

// Datos de Exámenes (StudentExam)
export const examenesData: StudentExam[] = [
  {
    id: 1,
    titulo: 'Examen Parcial 2 - Programación',
    curso: 'Programación Avanzada',
    fecha: '2025-10-10',
    duracion: '2 horas',
    estado: 'pendiente',
    preguntas: [
      { id: 1, pregunta: '¿Qué es un closure en JavaScript?', tipo: 'abierta' },
      { id: 2, pregunta: 'El patrón Singleton garantiza:', tipo: 'multiple', opciones: ['Una sola instancia', 'Múltiples instancias', 'Ninguna instancia'] }
    ]
  },
  {
    id: 2,
    titulo: 'Quiz - Bases de Datos',
    curso: 'Base de Datos',
    fecha: '2025-10-05',
    duracion: '45 minutos',
    estado: 'calificado',
    calificacion: 85,
    preguntas: [
      { id: 1, pregunta: 'La normalización elimina redundancia', tipo: 'verdadero-falso' },
      { id: 2, pregunta: 'SQL es un lenguaje:', tipo: 'multiple', opciones: ['Declarativo', 'Imperativo', 'Funcional'] }
    ]
  },
  {
    id: 3,
    titulo: 'Examen Final - Estructura de Datos',
    curso: 'Estructura de Datos',
    fecha: '2025-10-20',
    duracion: '3 horas',
    estado: 'pendiente',
    preguntas: []
  },
  {
    id: 4,
    titulo: 'Parcial 1 - Inteligencia Artificial',
    curso: 'Inteligencia Artificial',
    fecha: '2025-09-25',
    duracion: '1 hora 30 min',
    estado: 'calificado',
    calificacion: 92
  }
];

// Datos de Comunidad
export const comunidadPosts: ComunidadPost[] = [
  {
    id: 1,
    autor: 'Prof. García',
    avatarAutor: 'PG',
    contenido: '¡Felicitaciones a todos por el excelente trabajo en el proyecto final! Los resultados superaron mis expectativas. Sigan así 🎉',
    fecha: 'Hace 2 horas',
    likes: 45,
    comentarios: 12,
    compartidos: 3,
    esProfesor: true,
    curso: 'Programación Avanzada'
  },
  {
    id: 2,
    autor: 'María González',
    avatarAutor: 'MG',
    contenido: 'Busco compañeros para formar grupo de estudio para el examen de Bases de Datos. ¿Alguien interesado? 📚',
    fecha: 'Hace 4 horas',
    likes: 18,
    comentarios: 7,
    compartidos: 1,
    esProfesor: false,
    curso: 'Base de Datos'
  },
  {
    id: 3,
    autor: 'Juan Pérez',
    avatarAutor: 'JP',
    contenido: 'Acabo de terminar mi proyecto de IA usando TensorFlow. ¡Fue todo un reto pero lo logré! 🚀\n\n¿Alguien más trabajando con deep learning?',
    fecha: 'Hace 6 horas',
    likes: 32,
    comentarios: 15,
    compartidos: 5,
    esProfesor: false,
    curso: 'Inteligencia Artificial',
    imagenes: ['proyecto-ia-1.png']
  },
  {
    id: 4,
    autor: 'Prof. Rodríguez',
    avatarAutor: 'PR',
    contenido: 'Recordatorio: La clase de mañana será virtual debido a las condiciones climáticas. El enlace está disponible en el calendario.',
    fecha: 'Hace 8 horas',
    likes: 56,
    comentarios: 4,
    compartidos: 8,
    esProfesor: true,
    curso: 'Base de Datos'
  },
  {
    id: 5,
    autor: 'Laura Ramírez',
    avatarAutor: 'LR',
    contenido: '¿Alguien tiene recursos sobre algoritmos de grafos? Necesito preparar mejor el tema para el examen 🤔',
    fecha: 'Hace 10 horas',
    likes: 12,
    comentarios: 9,
    compartidos: 0,
    esProfesor: false,
    curso: 'Estructura de Datos'
  },
  {
    id: 6,
    autor: 'Prof. Martínez',
    avatarAutor: 'PM',
    contenido: 'He subido nuevo material sobre complejidad algoritmica en la plataforma. Incluye ejemplos prácticos y ejercicios resueltos. ¡A estudiar! 📖',
    fecha: 'Hace 12 horas',
    likes: 38,
    comentarios: 6,
    compartidos: 12,
    esProfesor: true,
    curso: 'Estructura de Datos'
  }
];
