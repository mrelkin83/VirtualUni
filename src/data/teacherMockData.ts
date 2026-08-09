import { Course, Student, Assignment, Exam, Question, EstudianteDetalle } from '../types/teacher.types';

export const cursosDocente: Course[] = [
  { id: 1, nombre: 'Programación Avanzada', codigo: 'CS301', estudiantes: 45, tareasPendientesRevision: 12, progresoGeneral: 68, color: 'bg-blue-500' },
  { id: 2, nombre: 'Base de Datos', codigo: 'CS302', estudiantes: 38, tareasPendientesRevision: 5, progresoGeneral: 75, color: 'bg-green-500' },
  { id: 3, nombre: 'Inteligencia Artificial', codigo: 'CS401', estudiantes: 52, tareasPendientesRevision: 18, progresoGeneral: 55, color: 'bg-orange-500' },
  { id: 4, nombre: 'Diseño de Interfaces', codigo: 'CS303', estudiantes: 42, tareasPendientesRevision: 10, progresoGeneral: 72, color: 'bg-purple-500' }
];

export const estudiantesData: Student[] = [
  { id: 1, nombre: 'Ana García', email: 'ana@univ.edu', curso: 'Programación Avanzada', progreso: 85, calificacionActual: 9.2, tareasPendientes: 1, ultimaActividad: 'Hace 2h' },
  { id: 2, nombre: 'Carlos López', email: 'carlos@univ.edu', curso: 'Programación Avanzada', progreso: 62, calificacionActual: 7.8, tareasPendientes: 3, ultimaActividad: 'Hace 1d' },
  { id: 3, nombre: 'María Rodríguez', email: 'maria@univ.edu', curso: 'Base de Datos', progreso: 78, calificacionActual: 8.5, tareasPendientes: 0, ultimaActividad: 'Hace 3h' },
  { id: 4, nombre: 'Juan Martínez', email: 'juan@univ.edu', curso: 'Inteligencia Artificial', progreso: 45, calificacionActual: 6.5, tareasPendientes: 5, ultimaActividad: 'Hace 2d' }
];

// Perfiles Detallados de Estudiantes
export const estudiantesDetalleData: EstudianteDetalle[] = [
  {
    id: 1,
    nombre: 'Ana García',
    email: 'ana@univ.edu',
    telefono: '+1 555-0101',
    curso: 'Programación Avanzada',
    progreso: 85,
    calificacionActual: 9.2,
    tareasPendientes: 1,
    ultimaActividad: 'Hace 2h',
    fechaInscripcion: '2025-01-15',
    promedioGeneral: 9.1,
    tareasEntregadas: 12,
    tareasRevisadas: 11,
    cursosInscritos: ['Programación Avanzada', 'Algoritmos y Estructuras de Datos'],
    asistencia: {
      total: 45,
      presente: 43,
      ausente: 2,
      porcentaje: 96
    },
    historialCalificaciones: [
      { tarea: 'Proyecto Final IA', calificacion: 9.5, fecha: '2025-10-01', curso: 'Programación Avanzada' },
      { tarea: 'Taller JavaScript', calificacion: 9.0, fecha: '2025-09-25', curso: 'Programación Avanzada' },
      { tarea: 'Ejercicio POO', calificacion: 9.2, fecha: '2025-09-18', curso: 'Programación Avanzada' },
      { tarea: 'Quiz Algoritmos', calificacion: 8.8, fecha: '2025-09-10', curso: 'Algoritmos y Estructuras de Datos' },
      { tarea: 'Práctica React', calificacion: 9.3, fecha: '2025-09-05', curso: 'Programación Avanzada' },
      { tarea: 'Análisis de Complejidad', calificacion: 9.0, fecha: '2025-08-28', curso: 'Algoritmos y Estructuras de Datos' }
    ],
    ultimasActividades: [
      { tipo: 'entrega', descripcion: 'Entregó el Proyecto Final IA', fecha: '2025-10-04 14:30' },
      { tipo: 'asistencia', descripcion: 'Asistió a la clase de Programación Avanzada', fecha: '2025-10-03 10:00' },
      { tipo: 'examen', descripcion: 'Completó el examen de Algoritmos', fecha: '2025-10-01 15:45' },
      { tipo: 'entrega', descripcion: 'Entregó el Taller JavaScript', fecha: '2025-09-28 18:20' },
      { tipo: 'mensaje', descripcion: 'Envió consulta sobre el proyecto final', fecha: '2025-09-27 09:15' }
    ]
  },
  {
    id: 2,
    nombre: 'Carlos López',
    email: 'carlos@univ.edu',
    telefono: '+1 555-0102',
    curso: 'Programación Avanzada',
    progreso: 62,
    calificacionActual: 7.8,
    tareasPendientes: 3,
    ultimaActividad: 'Hace 1d',
    fechaInscripcion: '2025-01-15',
    promedioGeneral: 7.5,
    tareasEntregadas: 9,
    tareasRevisadas: 8,
    cursosInscritos: ['Programación Avanzada', 'Base de Datos'],
    asistencia: {
      total: 45,
      presente: 38,
      ausente: 7,
      porcentaje: 84
    },
    historialCalificaciones: [
      { tarea: 'Taller JavaScript', calificacion: 8.0, fecha: '2025-09-26', curso: 'Programación Avanzada' },
      { tarea: 'Ejercicio POO', calificacion: 7.5, fecha: '2025-09-19', curso: 'Programación Avanzada' },
      { tarea: 'Quiz SQL', calificacion: 7.8, fecha: '2025-09-12', curso: 'Base de Datos' },
      { tarea: 'Práctica React', calificacion: 7.2, fecha: '2025-09-06', curso: 'Programación Avanzada' },
      { tarea: 'Normalización BD', calificacion: 8.1, fecha: '2025-08-30', curso: 'Base de Datos' },
      { tarea: 'Proyecto API REST', calificacion: 7.5, fecha: '2025-08-23', curso: 'Programación Avanzada' }
    ],
    ultimasActividades: [
      { tipo: 'asistencia', descripcion: 'Asistió a la clase de Programación Avanzada', fecha: '2025-10-02 10:00' },
      { tipo: 'entrega', descripcion: 'Entregó el Taller JavaScript', fecha: '2025-09-29 16:45' },
      { tipo: 'examen', descripcion: 'Completó el examen de Base de Datos', fecha: '2025-09-25 14:30' },
      { tipo: 'asistencia', descripcion: 'Asistió a la clase de Base de Datos', fecha: '2025-09-24 08:00' },
      { tipo: 'mensaje', descripcion: 'Solicitó prórroga para entrega', fecha: '2025-09-22 11:30' }
    ]
  },
  {
    id: 3,
    nombre: 'María Rodríguez',
    email: 'maria@univ.edu',
    telefono: '+1 555-0103',
    curso: 'Base de Datos',
    progreso: 78,
    calificacionActual: 8.5,
    tareasPendientes: 0,
    ultimaActividad: 'Hace 3h',
    fechaInscripcion: '2025-01-16',
    promedioGeneral: 8.6,
    tareasEntregadas: 14,
    tareasRevisadas: 14,
    cursosInscritos: ['Base de Datos', 'Arquitectura de Software'],
    asistencia: {
      total: 42,
      presente: 40,
      ausente: 2,
      porcentaje: 95
    },
    historialCalificaciones: [
      { tarea: 'Proyecto BD Avanzado', calificacion: 9.0, fecha: '2025-09-30', curso: 'Base de Datos' },
      { tarea: 'Quiz SQL', calificacion: 8.5, fecha: '2025-09-23', curso: 'Base de Datos' },
      { tarea: 'Normalización BD', calificacion: 8.8, fecha: '2025-09-16', curso: 'Base de Datos' },
      { tarea: 'Diseño Patrones', calificacion: 8.3, fecha: '2025-09-10', curso: 'Arquitectura de Software' },
      { tarea: 'Transacciones SQL', calificacion: 8.7, fecha: '2025-09-02', curso: 'Base de Datos' },
      { tarea: 'Microservicios', calificacion: 8.4, fecha: '2025-08-26', curso: 'Arquitectura de Software' }
    ],
    ultimasActividades: [
      { tipo: 'entrega', descripcion: 'Entregó el Proyecto BD Avanzado', fecha: '2025-10-04 11:15' },
      { tipo: 'asistencia', descripcion: 'Asistió a la clase de Base de Datos', fecha: '2025-10-03 08:00' },
      { tipo: 'examen', descripcion: 'Completó el examen de SQL Avanzado', fecha: '2025-10-01 13:20' },
      { tipo: 'entrega', descripcion: 'Entregó el Quiz SQL', fecha: '2025-09-28 17:30' },
      { tipo: 'asistencia', descripcion: 'Asistió a la clase de Arquitectura', fecha: '2025-09-26 10:00' }
    ]
  },
  {
    id: 4,
    nombre: 'Juan Martínez',
    email: 'juan@univ.edu',
    telefono: '+1 555-0104',
    curso: 'Inteligencia Artificial',
    progreso: 45,
    calificacionActual: 6.5,
    tareasPendientes: 5,
    ultimaActividad: 'Hace 2d',
    fechaInscripcion: '2025-01-20',
    promedioGeneral: 6.8,
    tareasEntregadas: 7,
    tareasRevisadas: 6,
    cursosInscritos: ['Inteligencia Artificial', 'Machine Learning'],
    asistencia: {
      total: 40,
      presente: 30,
      ausente: 10,
      porcentaje: 75
    },
    historialCalificaciones: [
      { tarea: 'Proyecto Final IA', calificacion: 7.0, fecha: '2025-10-01', curso: 'Inteligencia Artificial' },
      { tarea: 'Quiz Redes Neuronales', calificacion: 6.5, fecha: '2025-09-22', curso: 'Inteligencia Artificial' },
      { tarea: 'Algoritmo Genético', calificacion: 6.8, fecha: '2025-09-15', curso: 'Inteligencia Artificial' },
      { tarea: 'Regresión Lineal', calificacion: 7.2, fecha: '2025-09-08', curso: 'Machine Learning' },
      { tarea: 'Árbol de Decisión', calificacion: 6.3, fecha: '2025-08-31', curso: 'Machine Learning' },
      { tarea: 'K-Means Clustering', calificacion: 6.9, fecha: '2025-08-24', curso: 'Machine Learning' }
    ],
    ultimasActividades: [
      { tipo: 'entrega', descripcion: 'Entregó el Proyecto Final IA', fecha: '2025-10-02 23:45' },
      { tipo: 'asistencia', descripcion: 'Faltó a la clase de IA', fecha: '2025-10-01 14:00' },
      { tipo: 'mensaje', descripcion: 'Consultó sobre entrega pendiente', fecha: '2025-09-30 16:20' },
      { tipo: 'examen', descripcion: 'Completó el quiz de Redes Neuronales', fecha: '2025-09-28 12:15' },
      { tipo: 'asistencia', descripcion: 'Asistió a la clase de Machine Learning', fecha: '2025-09-25 09:00' }
    ]
  }
];

// Datos de Entregas/Submissions de Estudiantes
export const submissionsData = [
  // Entregas para Proyecto Final IA (id: 1)
  { id: 1, tareaId: 1, estudianteId: 4, estudianteNombre: 'Juan Martínez', estudianteEmail: 'juan@univ.edu', fechaEntrega: '2025-10-04 14:30', contenido: 'He implementado un modelo de clasificación utilizando redes neuronales para predecir el precio de viviendas. El modelo incluye:\n\n1. Preprocesamiento de datos con normalización\n2. Arquitectura de red neuronal con 3 capas ocultas\n3. Función de activación ReLU\n4. Optimización con Adam\n\nEl modelo alcanzó una precisión del 87% en el conjunto de prueba.', archivoUrl: 'https://example.com/entregas/juan-proyecto-ia.zip', estado: 'pendiente' as const },
  { id: 2, tareaId: 1, estudianteId: 1, estudianteNombre: 'Ana García', estudianteEmail: 'ana@univ.edu', fechaEntrega: '2025-10-04 16:45', contenido: 'Proyecto de reconocimiento de imágenes usando CNN. Implementé un clasificador de imágenes con las siguientes características:\n\n- Dataset: 10,000 imágenes de entrenamiento\n- Arquitectura: Convolutional Neural Network\n- Precisión obtenida: 92.5%\n- Tiempo de entrenamiento: 3 horas\n\nIncluyo código completo y resultados experimentales.', archivoUrl: 'https://example.com/entregas/ana-proyecto-ia.zip', estado: 'pendiente' as const },
  { id: 3, tareaId: 1, estudianteId: 2, estudianteNombre: 'Carlos López', estudianteEmail: 'carlos@univ.edu', fechaEntrega: '2025-10-05 09:15', contenido: 'Sistema de recomendación basado en filtrado colaborativo. El sistema analiza preferencias de usuarios y recomienda productos similares.\n\nTécnicas utilizadas:\n- Similitud del coseno\n- Matrix Factorization\n- Validación cruzada\n\nPrecisión: 85%', archivoUrl: 'https://example.com/entregas/carlos-proyecto-ia.zip', estado: 'pendiente' as const },

  // Más entregas para Proyecto Final IA (algunas sin revisar)
  { id: 16, tareaId: 1, estudianteId: 5, estudianteNombre: 'Laura Méndez', estudianteEmail: 'laura@univ.edu', fechaEntrega: '2025-10-05 11:00', contenido: 'Chatbot conversacional usando procesamiento de lenguaje natural (NLP). Implementé un asistente virtual que puede responder preguntas frecuentes sobre el curso.', estado: 'pendiente' as const },
  { id: 17, tareaId: 1, estudianteId: 6, estudianteNombre: 'Pedro Sánchez', estudianteEmail: 'pedro@univ.edu', fechaEntrega: '2025-10-05 13:20', contenido: 'Modelo de predicción de series temporales usando LSTM para análisis de acciones en bolsa.', estado: 'pendiente' as const },

  // Entregas para Taller JavaScript (id: 2) - algunas ya revisadas
  { id: 4, tareaId: 2, estudianteId: 1, estudianteNombre: 'Ana García', estudianteEmail: 'ana@univ.edu', fechaEntrega: '2025-10-02 18:00', contenido: 'Implementé una aplicación web de lista de tareas (To-Do List) usando JavaScript vanilla. Características:\n\n- Agregar tareas\n- Marcar como completadas\n- Eliminar tareas\n- Persistencia con localStorage\n- Diseño responsive\n\nEl código está bien documentado y sigue las mejores prácticas.', estado: 'revisada' as const, calificacion: 9.5, feedback: 'Excelente trabajo, Ana. Tu código está muy bien organizado y las funcionalidades están completas. Me gustó especialmente cómo implementaste el localStorage. Sigue así!' },
  { id: 5, tareaId: 2, estudianteId: 2, estudianteNombre: 'Carlos López', estudianteEmail: 'carlos@univ.edu', fechaEntrega: '2025-10-02 20:30', contenido: 'Desarrollé un juego de memoria (Memory Game) con JavaScript. Incluye:\n- Grid de cartas\n- Lógica de emparejamiento\n- Contador de movimientos\n- Temporizador\n- Animaciones CSS', estado: 'revisada' as const, calificacion: 8.5, feedback: 'Buen trabajo, Carlos. El juego funciona correctamente. Para mejorar, considera optimizar el algoritmo de barajado y agregar niveles de dificultad.' },
  { id: 6, tareaId: 2, estudianteId: 3, estudianteNombre: 'María Rodríguez', estudianteEmail: 'maria@univ.edu', fechaEntrega: '2025-10-03 10:15', contenido: 'Creé una calculadora interactiva con funciones básicas y avanzadas. Soporta operaciones aritméticas, porcentajes y memoria.', estado: 'revisada' as const, calificacion: 7.8, feedback: 'Bien hecho, María. La calculadora funciona bien, pero hay algunos bugs al encadenar operaciones. Revisa la lógica del operador previo.' },
  { id: 7, tareaId: 2, estudianteId: 4, estudianteNombre: 'Juan Martínez', estudianteEmail: 'juan@univ.edu', fechaEntrega: '2025-10-03 14:20', contenido: 'Aplicación de galería de imágenes con filtros y búsqueda. Permite filtrar por categorías y buscar por nombre.', estado: 'pendiente' as const },

  // Más entregas para Taller JavaScript
  { id: 18, tareaId: 2, estudianteId: 7, estudianteNombre: 'Sofía Torres', estudianteEmail: 'sofia@univ.edu', fechaEntrega: '2025-10-03 08:00', contenido: 'Sistema de carrito de compras con funciones de agregar, eliminar y calcular total.', estado: 'revisada' as const, calificacion: 8.0, feedback: 'Buen trabajo. El carrito funciona correctamente, pero podrías mejorar la validación de cantidades negativas.' },
  { id: 19, tareaId: 2, estudianteId: 8, estudianteNombre: 'Diego Ramírez', estudianteEmail: 'diego@univ.edu', fechaEntrega: '2025-10-02 22:00', contenido: 'Reloj digital con alarma y temporizador.', estado: 'revisada' as const, calificacion: 7.5, feedback: 'Funcionalidad básica implementada correctamente. Considera agregar persistencia de alarmas.' },

  // Entregas para Consultas SQL (id: 3) - mayoría revisadas
  { id: 8, tareaId: 3, estudianteId: 3, estudianteNombre: 'María Rodríguez', estudianteEmail: 'maria@univ.edu', fechaEntrega: '2025-10-03 16:00', contenido: 'Resolví todas las consultas SQL solicitadas:\n\n1. SELECT con JOIN múltiples\n2. Subconsultas correlacionadas\n3. Funciones de agregación con GROUP BY\n4. Consultas con HAVING\n5. Optimización con índices\n\nTodas las consultas fueron probadas y devuelven los resultados correctos.', estado: 'revisada' as const, calificacion: 9.8, feedback: '¡Perfecto, María! Todas las consultas están correctas y bien optimizadas. Tu uso de índices muestra un excelente entendimiento. Felicitaciones!' },
  { id: 9, tareaId: 3, estudianteId: 1, estudianteNombre: 'Ana García', estudianteEmail: 'ana@univ.edu', fechaEntrega: '2025-10-03 19:30', contenido: 'Completé el ejercicio de consultas SQL. Implementé:\n- JOINs (INNER, LEFT, RIGHT)\n- Subconsultas\n- Window functions\n- CTEs (Common Table Expressions)\n\nIncluyo explicación de cada consulta.', estado: 'revisada' as const, calificacion: 9.2, feedback: 'Excelente trabajo, Ana. Las consultas están bien estructuradas y eficientes. Tu uso de CTEs hace el código muy legible.' },
  { id: 10, tareaId: 3, estudianteId: 2, estudianteNombre: 'Carlos López', estudianteEmail: 'carlos@univ.edu', fechaEntrega: '2025-10-04 08:00', contenido: 'Ejercicios de consultas SQL resueltos. Incluyo todas las queries solicitadas con comentarios explicativos.', estado: 'revisada' as const, calificacion: 8.3, feedback: 'Buen trabajo, Carlos. Las consultas funcionan, pero algunas pueden optimizarse. Revisa el uso de índices en la consulta 3.' },
  { id: 11, tareaId: 3, estudianteId: 4, estudianteNombre: 'Juan Martínez', estudianteEmail: 'juan@univ.edu', fechaEntrega: '2025-10-04 10:45', contenido: 'Resolución del taller de SQL. Todas las consultas retornan los resultados esperados.', estado: 'pendiente' as const },

  // Más entregas para Consultas SQL
  { id: 20, tareaId: 3, estudianteId: 9, estudianteNombre: 'Elena Vega', estudianteEmail: 'elena@univ.edu', fechaEntrega: '2025-10-03 21:00', contenido: 'Consultas SQL completadas con optimización de rendimiento.', estado: 'revisada' as const, calificacion: 8.7, feedback: 'Muy bien, Elena. Las consultas están correctas y bien optimizadas.' },
  { id: 21, tareaId: 3, estudianteId: 10, estudianteNombre: 'Roberto Castro', estudianteEmail: 'roberto@univ.edu', fechaEntrega: '2025-10-04 07:30', contenido: 'Ejercicios de SQL resueltos con análisis de planes de ejecución.', estado: 'revisada' as const, calificacion: 9.0, feedback: 'Excelente análisis de los planes de ejecución. Demuestra comprensión profunda.' }
];

export const tareasData: Assignment[] = [
  {
    id: 1,
    titulo: 'Proyecto Final IA',
    curso: 'Inteligencia Artificial',
    fechaLimite: '2025-10-05',
    entregasTotales: 15,
    entregasRevisadas: 0,
    submissions: submissionsData.filter(s => s.tareaId === 1)
  },
  {
    id: 2,
    titulo: 'Taller JavaScript',
    curso: 'Programación Avanzada',
    fechaLimite: '2025-10-03',
    entregasTotales: 28,
    entregasRevisadas: 16,
    submissions: submissionsData.filter(s => s.tareaId === 2)
  },
  {
    id: 3,
    titulo: 'Consultas SQL',
    curso: 'Base de Datos',
    fechaLimite: '2025-10-04',
    entregasTotales: 35,
    entregasRevisadas: 30,
    submissions: submissionsData.filter(s => s.tareaId === 3)
  }
];

export const examenesData: Exam[] = [
  { id: 1, titulo: 'Parcial Programación', curso: 'Programación Avanzada', fecha: '2025-10-08', duracion: '2h', estado: 'programado', participantes: 42 },
  { id: 2, titulo: 'Final Base de Datos', curso: 'Base de Datos', fecha: '2025-10-15', duracion: '3h', estado: 'programado', participantes: 38 }
];

export const bancoPreguntasData: Question[] = [
  {
    id: 1,
    tipo: 'multiple',
    pregunta: '¿Qué es un patrón de diseño?',
    opciones: ['Una solución reutilizable a problemas comunes', 'Un tipo de variable', 'Una función matemática', 'Un algoritmo de ordenamiento'],
    respuestaCorrecta: 0,
    puntos: 2,
    categoria: 'Conceptos básicos',
    explicacion: 'Los patrones de diseño son soluciones probadas y reutilizables a problemas comunes en el desarrollo de software.'
  },
  {
    id: 2,
    tipo: 'verdadero-falso',
    pregunta: 'El patrón Singleton permite crear múltiples instancias de una clase',
    respuestaCorrecta: false,
    puntos: 1,
    categoria: 'Patrones creacionales',
    explicacion: 'El patrón Singleton garantiza que una clase tenga solo una instancia y proporciona un punto de acceso global a ella.'
  },
  {
    id: 3,
    tipo: 'multiple',
    pregunta: '¿Cuál de los siguientes NO es un patrón creacional?',
    opciones: ['Factory', 'Singleton', 'Observer', 'Builder'],
    respuestaCorrecta: 2,
    puntos: 2,
    categoria: 'Patrones creacionales',
    explicacion: 'Observer es un patrón de comportamiento, no creacional. Los patrones creacionales incluyen Factory, Singleton, Builder, Prototype y Abstract Factory.'
  },
  {
    id: 4,
    tipo: 'multiple',
    pregunta: 'En bases de datos, ¿qué significa ACID?',
    opciones: [
      'Atomicity, Consistency, Isolation, Durability',
      'Access, Control, Integration, Development',
      'Algorithm, Computation, Information, Data',
      'Application, Client, Interface, Database'
    ],
    respuestaCorrecta: 0,
    puntos: 2,
    categoria: 'Bases de Datos',
    explicacion: 'ACID son las propiedades que garantizan transacciones confiables en sistemas de bases de datos: Atomicidad, Consistencia, Aislamiento y Durabilidad.'
  },
  {
    id: 5,
    tipo: 'verdadero-falso',
    pregunta: 'En SQL, la cláusula INNER JOIN retorna solo las filas que tienen coincidencias en ambas tablas',
    respuestaCorrecta: true,
    puntos: 1,
    categoria: 'Bases de Datos',
    explicacion: 'INNER JOIN es un tipo de JOIN que retorna filas solo cuando existe una coincidencia en ambas tablas basada en la condición especificada.'
  },
  {
    id: 6,
    tipo: 'multiple',
    pregunta: '¿Cuál es la complejidad temporal del algoritmo QuickSort en el caso promedio?',
    opciones: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    respuestaCorrecta: 1,
    puntos: 3,
    categoria: 'Algoritmos',
    explicacion: 'QuickSort tiene una complejidad promedio de O(n log n), aunque en el peor caso puede ser O(n²).'
  },
  {
    id: 7,
    tipo: 'abierta',
    pregunta: 'Explica brevemente qué es el polimorfismo en programación orientada a objetos y proporciona un ejemplo.',
    puntos: 5,
    categoria: 'POO',
    explicacion: 'El polimorfismo permite que objetos de diferentes clases sean tratados como objetos de una clase común. Ejemplo: diferentes clases de formas (círculo, cuadrado) pueden implementar un método "calcularArea()" de manera diferente.'
  },
  {
    id: 8,
    tipo: 'multiple-imagen',
    pregunta: 'Observa el siguiente diagrama de clases UML. ¿Qué tipo de relación se muestra entre las clases?',
    imagenUrl: 'https://example.com/uml-diagram-inheritance.png',
    opciones: ['Herencia', 'Composición', 'Agregación', 'Asociación simple'],
    respuestaCorrecta: 0,
    puntos: 2,
    categoria: 'UML',
    explicacion: 'La flecha con triángulo vacío indica una relación de herencia (generalización) en UML.'
  },
  {
    id: 9,
    tipo: 'multiple',
    pregunta: '¿Qué estructura de datos utiliza el principio LIFO (Last In, First Out)?',
    opciones: ['Cola (Queue)', 'Pila (Stack)', 'Lista enlazada', 'Árbol binario'],
    respuestaCorrecta: 1,
    puntos: 2,
    categoria: 'Estructuras de datos',
    explicacion: 'La pila (Stack) es una estructura de datos que sigue el principio LIFO: el último elemento en entrar es el primero en salir.'
  },
  {
    id: 10,
    tipo: 'verdadero-falso',
    pregunta: 'Git y GitHub son la misma herramienta',
    respuestaCorrecta: false,
    puntos: 1,
    categoria: 'Control de versiones',
    explicacion: 'Git es un sistema de control de versiones distribuido, mientras que GitHub es una plataforma de hosting en la nube para repositorios Git.'
  },
  {
    id: 11,
    tipo: 'multiple',
    pregunta: 'En JavaScript, ¿qué método se utiliza para agregar un elemento al final de un array?',
    opciones: ['append()', 'push()', 'add()', 'insert()'],
    respuestaCorrecta: 1,
    puntos: 1,
    categoria: 'JavaScript',
    explicacion: 'El método push() agrega uno o más elementos al final de un array y retorna la nueva longitud del array.'
  },
  {
    id: 12,
    tipo: 'multiple',
    pregunta: '¿Cuál de las siguientes NO es una capa del modelo OSI?',
    opciones: ['Aplicación', 'Transporte', 'Seguridad', 'Física'],
    respuestaCorrecta: 2,
    puntos: 2,
    categoria: 'Redes',
    explicacion: 'El modelo OSI tiene 7 capas: Física, Enlace de datos, Red, Transporte, Sesión, Presentación y Aplicación. Seguridad no es una capa del modelo OSI.'
  },
  {
    id: 13,
    tipo: 'verdadero-falso',
    pregunta: 'En Python, las listas son inmutables',
    respuestaCorrecta: false,
    puntos: 1,
    categoria: 'Python',
    explicacion: 'Las listas en Python son mutables, lo que significa que pueden ser modificadas después de su creación. Las tuplas son inmutables.'
  },
  {
    id: 14,
    tipo: 'multiple',
    pregunta: '¿Qué protocolo se utiliza para transferir hipertexto de manera segura?',
    opciones: ['HTTP', 'HTTPS', 'FTP', 'SSH'],
    respuestaCorrecta: 1,
    puntos: 2,
    categoria: 'Seguridad Web',
    explicacion: 'HTTPS (HTTP Secure) es la versión segura de HTTP que utiliza encriptación SSL/TLS para proteger la comunicación.'
  },
  {
    id: 15,
    tipo: 'abierta',
    pregunta: 'Describe las diferencias principales entre una arquitectura monolítica y una arquitectura de microservicios.',
    puntos: 5,
    categoria: 'Arquitectura de software',
    explicacion: 'Monolítica: aplicación única y cohesiva. Microservicios: múltiples servicios independientes, cada uno con su propia responsabilidad, que se comunican entre sí.'
  },
  {
    id: 16,
    tipo: 'multiple',
    pregunta: '¿Cuál es el puerto por defecto para conexiones HTTP?',
    opciones: ['21', '22', '80', '443'],
    respuestaCorrecta: 2,
    puntos: 1,
    categoria: 'Redes',
    explicacion: 'El puerto 80 es el puerto estándar para HTTP. El 443 es para HTTPS, el 21 para FTP y el 22 para SSH.'
  },
  {
    id: 17,
    tipo: 'verdadero-falso',
    pregunta: 'En React, los hooks solo pueden ser llamados dentro de componentes funcionales o custom hooks',
    respuestaCorrecta: true,
    puntos: 1,
    categoria: 'React',
    explicacion: 'Los hooks de React tienen reglas estrictas: deben llamarse solo en el nivel superior de componentes funcionales o custom hooks, nunca en loops, condiciones o funciones anidadas.'
  },
  {
    id: 18,
    tipo: 'multiple-imagen',
    pregunta: 'Observa el siguiente código. ¿Cuál será el resultado de la ejecución?',
    imagenUrl: 'https://example.com/code-snippet.png',
    opciones: ['undefined', 'null', '0', 'Error'],
    respuestaCorrecta: 0,
    puntos: 3,
    categoria: 'JavaScript',
    explicacion: 'El código muestra un caso de hoisting en JavaScript donde la variable es declarada pero no inicializada, resultando en undefined.'
  },
  {
    id: 19,
    tipo: 'multiple',
    pregunta: '¿Qué significa REST en el contexto de APIs web?',
    opciones: [
      'Representational State Transfer',
      'Remote Execution Service Transfer',
      'Rapid Efficient Service Technology',
      'Relational External Service Template'
    ],
    respuestaCorrecta: 0,
    puntos: 2,
    categoria: 'APIs',
    explicacion: 'REST (Representational State Transfer) es un estilo arquitectónico para diseñar servicios web que utiliza HTTP y principios stateless.'
  },
  {
    id: 20,
    tipo: 'verdadero-falso',
    pregunta: 'El método POST en HTTP es idempotente',
    respuestaCorrecta: false,
    puntos: 2,
    categoria: 'APIs',
    explicacion: 'POST no es idempotente. Múltiples requests POST idénticos pueden crear múltiples recursos. GET, PUT y DELETE son idempotentes.'
  }
];

// Exámenes con detalles completos (incluyendo preguntas)
export const examenesDetalladosData = [
  {
    id: 1,
    titulo: 'Parcial Programación',
    curso: 'Programación Avanzada',
    fecha: '2025-10-08',
    duracion: '2h',
    estado: 'programado',
    participantes: 42,
    instrucciones: 'Lee cuidadosamente cada pregunta antes de responder. Tienes 2 horas para completar el examen. No se permite consultar material externo. Asegúrate de guardar tus respuestas frecuentemente.',
    preguntas: [
      bancoPreguntasData[0], // Patrón de diseño
      bancoPreguntasData[1], // Singleton
      bancoPreguntasData[2], // Patrón creacional
      bancoPreguntasData[5], // QuickSort
      bancoPreguntasData[6], // Polimorfismo
      bancoPreguntasData[8], // LIFO/Pila
      bancoPreguntasData[10], // JavaScript array
      bancoPreguntasData[16], // React hooks
    ],
    puntajeTotal: 17, // Suma de puntos de las preguntas
    notaMinima: 6,
    intentosPermitidos: 1,
    mostrarResultados: true,
    mezclarPreguntas: true
  },
  {
    id: 2,
    titulo: 'Final Base de Datos',
    curso: 'Base de Datos',
    fecha: '2025-10-15',
    duracion: '3h',
    estado: 'activo',
    participantes: 38,
    instrucciones: 'Este examen final cubre todos los temas vistos durante el semestre. Lee cada pregunta con atención. Administra tu tiempo adecuadamente: tienes 3 horas. Las preguntas abiertas serán calificadas manualmente.',
    preguntas: [
      bancoPreguntasData[3], // ACID
      bancoPreguntasData[4], // INNER JOIN
      bancoPreguntasData[7], // UML
      bancoPreguntasData[9], // Git vs GitHub
      bancoPreguntasData[11], // Modelo OSI
      bancoPreguntasData[13], // HTTPS
      bancoPreguntasData[14], // Arquitectura monolítica vs microservicios
      bancoPreguntasData[15], // Puerto HTTP
      bancoPreguntasData[18], // REST API
      bancoPreguntasData[19], // POST idempotente
    ],
    puntajeTotal: 20, // Suma de puntos de las preguntas
    notaMinima: 7,
    intentosPermitidos: 1,
    mostrarResultados: false,
    mezclarPreguntas: false
  }
];

export const modulosCursoData = [
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
      },
      {
        id: 2,
        titulo: 'Tipos de Patrones',
        tipo: 'teoria',
        duracion: '60 min',
        completado: false,
        materiales: [
          { id: 3, nombre: 'Categorías - PDF', tipo: 'pdf', url: '#', tamaño: '1.8 MB' }
        ]
      }
    ]
  },
  {
    id: 2,
    cursoId: 1,
    titulo: 'Semana 2: Patrones Creacionales',
    descripcion: 'Factory, Singleton, Builder, Prototype',
    orden: 2,
    temas: [
      {
        id: 3,
        titulo: 'Patrón Factory',
        tipo: 'practica',
        duracion: '90 min',
        completado: false,
        materiales: [
          { id: 4, nombre: 'Ejercicio Factory', tipo: 'documento', url: '#', tamaño: '0.5 MB' }
        ]
      }
    ]
  }
];

export const mensajesData = [
  {
    id: 1,
    de: 'Ana García',
    asunto: 'Consulta sobre Proyecto Final IA',
    mensaje: 'Estimado Profesor,\n\nTengo algunas dudas sobre el proyecto final de Inteligencia Artificial:\n\n1. ¿Es necesario implementar validación cruzada en el modelo?\n2. ¿Qué formato de dataset prefiere para la entrega?\n3. ¿Podría extender la fecha límite por 2 días debido a problemas técnicos?\n\nGracias por su tiempo.\nSaludos,\nAna',
    fecha: '2025-10-04 10:30',
    leido: false,
    tipo: 'recibido' as const,
    adjuntos: ['borrador_proyecto.pdf', 'dataset_muestra.csv'],
    respuestas: [
      {
        id: 101,
        de: 'Profesor',
        mensaje: 'Hola Ana, respondiendo a tus preguntas:\n1. Sí, la validación cruzada es recomendable.\n2. CSV o JSON están bien.\n3. Puedes tener hasta el lunes.',
        fecha: '2025-10-04 14:15'
      }
    ]
  },
  {
    id: 2,
    de: 'Carlos López',
    asunto: 'Solicitud de prórroga - Taller JavaScript',
    mensaje: 'Buenos días Profesor,\n\nLe escribo para solicitarle una extensión de plazo para el Taller de JavaScript. He tenido algunos inconvenientes personales esta semana que han afectado mi tiempo de estudio.\n\n¿Sería posible entregar el trabajo el próximo martes en lugar del viernes?\n\nQuedo atento a su respuesta.\nGracias,\nCarlos López',
    fecha: '2025-10-03 16:45',
    leido: false,
    tipo: 'recibido' as const
  },
  {
    id: 3,
    de: 'María Rodríguez',
    asunto: 'Agradecimiento por la retroalimentación',
    mensaje: 'Estimado Profesor,\n\nQuiero agradecerle por los comentarios detallados en mi proyecto de Base de Datos. Sus sugerencias fueron muy útiles y me ayudaron a entender mejor los conceptos de normalización.\n\nYa implementé las mejoras que me sugirió y el proyecto quedó mucho más robusto.\n\n¡Muchas gracias!\nMaría',
    fecha: '2025-10-02 09:20',
    leido: true,
    tipo: 'recibido' as const
  },
  {
    id: 4,
    de: 'Juan Martínez',
    asunto: 'Problema con acceso a materiales del curso',
    mensaje: 'Hola Profesor,\n\nNo puedo acceder a los materiales del módulo 3 del curso de Inteligencia Artificial. Me aparece un error 404 cuando intento descargar los PDFs.\n\n¿Podría verificar los enlaces?\n\nGracias.',
    fecha: '2025-10-01 11:30',
    leido: true,
    tipo: 'recibido' as const,
    respuestas: [
      {
        id: 102,
        de: 'Profesor',
        mensaje: 'Hola Juan, ya corregí el problema. Los materiales ya están disponibles. Avísame si persiste el error.',
        fecha: '2025-10-01 12:15'
      },
      {
        id: 103,
        de: 'Juan Martínez',
        mensaje: 'Perfecto, ya pude descargarlos. Muchas gracias por la pronta respuesta!',
        fecha: '2025-10-01 13:00'
      }
    ]
  },
  {
    id: 5,
    para: 'Estudiantes de Programación Avanzada',
    asunto: 'Recordatorio: Examen Parcial este Viernes',
    mensaje: 'Estimados estudiantes,\n\nLes recuerdo que el examen parcial de Programación Avanzada será este viernes 6 de octubre a las 10:00 AM.\n\nTemas a evaluar:\n- Programación Orientada a Objetos\n- Patrones de Diseño\n- Estructuras de Datos Avanzadas\n- Algoritmos de Búsqueda y Ordenamiento\n\nEl examen tendrá una duración de 2 horas. Por favor lleguen 10 minutos antes.\n\nÉxitos a todos!',
    fecha: '2025-09-30 15:00',
    tipo: 'enviado' as const,
    destinatarios: 45
  },
  {
    id: 6,
    para: 'Ana García',
    asunto: 'Re: Consulta sobre Proyecto Final IA',
    mensaje: 'Hola Ana,\n\nRespondiendo a tus preguntas:\n\n1. Sí, es recomendable implementar validación cruzada (k-fold) para evaluar mejor tu modelo.\n2. El dataset puede estar en formato CSV o JSON, lo que te sea más cómodo.\n3. Considerando los problemas técnicos, puedes entregar hasta el lunes 7 de octubre.\n\nRevisa el borrador que me enviaste, tiene buena estructura.\n\nSaludos,\nProfesor',
    fecha: '2025-10-04 14:15',
    tipo: 'enviado' as const
  },
  {
    id: 7,
    de: 'Laura Méndez',
    asunto: 'Consulta sobre calificación del Quiz',
    mensaje: 'Profesor,\n\nRevisé mi calificación del último quiz y creo que hubo un error en la pregunta 5. Mi respuesta coincide con la clave de respuestas pero aparece como incorrecta.\n\n¿Podría revisar esto por favor?\n\nAdjunto captura de pantalla.\n\nGracias.',
    fecha: '2025-09-29 17:00',
    leido: true,
    tipo: 'recibido' as const,
    adjuntos: ['captura_quiz.png']
  },
  {
    id: 8,
    para: 'Estudiantes de Base de Datos',
    asunto: 'Nuevo material disponible - SQL Avanzado',
    mensaje: 'Estimados estudiantes,\n\nYa está disponible el nuevo material sobre SQL Avanzado en la sección de Materiales del curso.\n\nTemas incluidos:\n- Subconsultas complejas\n- Funciones de ventana\n- CTEs (Common Table Expressions)\n- Optimización de queries\n\nLes recomiendo revisar los ejemplos prácticos incluidos.\n\nSaludos!',
    fecha: '2025-09-28 10:00',
    tipo: 'enviado' as const,
    destinatarios: 38,
    adjuntos: ['SQL_Avanzado.pdf', 'Ejemplos_Practicos.sql']
  }
];

export const notificacionesData = [
  { id: 1, tipo: 'tarea', titulo: 'Nueva entrega de tarea', mensaje: 'Ana García ha entregado "Proyecto Final IA"', fecha: '2025-10-01 09:30', leida: false },
  { id: 2, tipo: 'mensaje', titulo: 'Nuevo mensaje', mensaje: 'Carlos López te ha enviado un mensaje', fecha: '2025-10-01 08:15', leida: false },
  { id: 3, tipo: 'examen', titulo: 'Examen próximo', mensaje: 'El examen "Parcial Programación" es en 2 días', fecha: '2025-10-01 07:00', leida: false },
  { id: 4, tipo: 'sistema', titulo: 'Actualización de plataforma', mensaje: 'La plataforma se actualizará mañana a las 2 AM', fecha: '2025-09-30 18:00', leida: true }
];

// Datos de Materiales
export const materialesData = [
  {
    id: 1,
    nombre: 'Introducción a Patrones de Diseño',
    tipo: 'pdf' as const,
    url: 'https://example.com/materiales/patrones-diseno.pdf',
    tamaño: '2.5 MB',
    fechaSubida: '2025-09-15',
    curso: 'Programación Avanzada',
    modulo: 'Módulo 1',
    tema: 'Conceptos Fundamentales',
    descargas: 45,
    vistas: 98
  },
  {
    id: 2,
    nombre: 'Tutorial React Hooks',
    tipo: 'video' as const,
    url: 'https://example.com/videos/react-hooks.mp4',
    duracion: '1h 20min',
    tamaño: '450 MB',
    fechaSubida: '2025-09-20',
    curso: 'Programación Avanzada',
    modulo: 'Módulo 2',
    tema: 'React Avanzado',
    descargas: 32,
    vistas: 87
  },
  {
    id: 3,
    nombre: 'Normalización de Bases de Datos',
    tipo: 'presentacion' as const,
    url: 'https://example.com/presentaciones/normalizacion.pptx',
    tamaño: '5.2 MB',
    fechaSubida: '2025-09-18',
    curso: 'Base de Datos',
    modulo: 'Módulo 2',
    tema: 'Diseño de BD',
    descargas: 28,
    vistas: 65
  },
  {
    id: 4,
    nombre: 'Guía de SQL Avanzado',
    tipo: 'documento' as const,
    url: 'https://example.com/docs/sql-avanzado.docx',
    tamaño: '1.8 MB',
    fechaSubida: '2025-09-22',
    curso: 'Base de Datos',
    modulo: 'Módulo 3',
    descargas: 41,
    vistas: 76
  },
  {
    id: 5,
    nombre: 'Diagramas UML - Ejemplos',
    tipo: 'imagen' as const,
    url: 'https://example.com/imagenes/uml-ejemplos.png',
    tamaño: '3.2 MB',
    fechaSubida: '2025-09-25',
    curso: 'Programación Avanzada',
    modulo: 'Módulo 1',
    tema: 'UML',
    descargas: 19,
    vistas: 54
  },
  {
    id: 6,
    nombre: 'Recursos Externos - Machine Learning',
    tipo: 'enlace' as const,
    url: 'https://machinelearningmastery.com/start-here/',
    fechaSubida: '2025-09-28',
    curso: 'Inteligencia Artificial',
    modulo: 'Módulo 1',
    descargas: 15,
    vistas: 42
  },
  {
    id: 7,
    nombre: 'Ejercicios de Algoritmos',
    tipo: 'pdf' as const,
    url: 'https://example.com/ejercicios/algoritmos.pdf',
    tamaño: '1.5 MB',
    fechaSubida: '2025-09-30',
    curso: 'Programación Avanzada',
    modulo: 'Módulo 3',
    tema: 'Algoritmos',
    descargas: 38,
    vistas: 71
  },
  {
    id: 8,
    nombre: 'Tutorial Git y GitHub',
    tipo: 'video' as const,
    url: 'https://example.com/videos/git-tutorial.mp4',
    duracion: '45 min',
    tamaño: '280 MB',
    fechaSubida: '2025-10-01',
    curso: 'Programación Avanzada',
    modulo: 'Módulo 1',
    tema: 'Control de Versiones',
    descargas: 52,
    vistas: 103
  }
];

export const carpetasMaterialesData = [
  {
    id: 1,
    nombre: 'Material Semana 1',
    curso: 'Programación Avanzada',
    materiales: [1, 5]
  },
  {
    id: 2,
    nombre: 'Videos del Curso',
    curso: 'Programación Avanzada',
    materiales: [2, 8]
  },
  {
    id: 3,
    nombre: 'Módulo Base de Datos',
    curso: 'Base de Datos',
    materiales: [3, 4]
  }
];

// Datos de Clases en Vivo
export const clasesVivoData = [
  {
    id: 1,
    titulo: 'Introducción a React Hooks',
    curso: 'Programación Avanzada',
    tipo: 'en_curso' as const,
    fecha: '2025-10-01',
    horaInicio: '14:00',
    horaFin: '16:00',
    duracion: '2 horas',
    enlaceReunion: 'https://meet.google.com/abc-defg-hij',
    plataforma: 'Google Meet' as const,
    descripcion: 'Clase práctica sobre useState, useEffect y custom hooks',
    participantes: [
      { id: 1, nombre: 'Ana García', asistio: true, minutosConectado: 98 },
      { id: 2, nombre: 'Carlos López', asistio: true, minutosConectado: 115 },
      { id: 3, nombre: 'María Rodríguez', asistio: false }
    ],
    materialesCompartidos: ['Presentación React Hooks.pdf', 'Código ejemplos.zip'],
    grabacionDisponible: false
  },
  {
    id: 2,
    titulo: 'Normalización de Bases de Datos',
    curso: 'Base de Datos',
    tipo: 'programada' as const,
    fecha: '2025-10-05',
    horaInicio: '10:00',
    horaFin: '11:30',
    duracion: '1.5 horas',
    enlaceReunion: 'https://zoom.us/j/123456789',
    plataforma: 'Zoom' as const,
    descripcion: 'Formas normales y diseño de esquemas relacionales',
    materialesCompartidos: ['Guía de normalización.pdf']
  },
  {
    id: 3,
    titulo: 'Patrones de Diseño - Parte 1',
    curso: 'Programación Avanzada',
    tipo: 'finalizada' as const,
    fecha: '2025-09-28',
    horaInicio: '15:00',
    horaFin: '17:00',
    duracion: '2 horas',
    enlaceReunion: 'https://meet.google.com/xyz-uvwx-rst',
    plataforma: 'Google Meet' as const,
    descripcion: 'Patrones creacionales: Singleton, Factory, Builder',
    grabacionUrl: 'https://example.com/grabaciones/patrones-1.mp4',
    participantes: [
      { id: 1, nombre: 'Ana García', asistio: true, minutosConectado: 120 },
      { id: 2, nombre: 'Carlos López', asistio: true, minutosConectado: 105 },
      { id: 3, nombre: 'María Rodríguez', asistio: true, minutosConectado: 118 },
      { id: 4, nombre: 'Juan Martínez', asistio: false }
    ],
    materialesCompartidos: ['Patrones Creacionales.pptx', 'Código ejemplos.zip'],
    grabacionDisponible: true
  },
  {
    id: 4,
    titulo: 'Introducción a Machine Learning',
    curso: 'Inteligencia Artificial',
    tipo: 'pregrabada' as const,
    fecha: '2025-09-25',
    horaInicio: '00:00',
    horaFin: '00:00',
    duracion: '1h 45min',
    plataforma: 'Otra' as const,
    descripcion: 'Conceptos fundamentales de aprendizaje automático',
    grabacionUrl: 'https://example.com/videos/ml-intro.mp4',
    materialesCompartidos: ['Slides ML.pdf', 'Dataset ejemplo.csv'],
    grabacionDisponible: true
  },
  {
    id: 5,
    titulo: 'SQL Avanzado y Optimización',
    curso: 'Base de Datos',
    tipo: 'programada' as const,
    fecha: '2025-10-08',
    horaInicio: '16:00',
    horaFin: '18:00',
    duracion: '2 horas',
    enlaceReunion: 'https://teams.microsoft.com/l/meetup-join/abc123',
    plataforma: 'Microsoft Teams' as const,
    descripcion: 'Consultas complejas, índices y optimización de queries'
  },
  {
    id: 6,
    titulo: 'Workshop: Desarrollo de API REST',
    curso: 'Programación Avanzada',
    tipo: 'programada' as const,
    fecha: '2025-10-10',
    horaInicio: '14:00',
    horaFin: '17:00',
    duracion: '3 horas',
    enlaceReunion: 'https://meet.google.com/workshop-api-rest',
    plataforma: 'Google Meet' as const,
    descripcion: 'Workshop práctico de desarrollo de APIs con Node.js y Express'
  }
];

export const gruposData = [
  {
    id: 1,
    nombre: 'Grupo A - Mañana',
    curso: 'Programación Avanzada',
    codigo: 'CS301-A',
    estudiantesActivos: 22,
    estudiantesTotales: 25,
    progreso: 68,
    horario: 'Lun-Mié 8:00-10:00',
    aula: 'Lab 301',
    color: 'bg-blue-500',
    proximaClase: 'Lunes 8:00 AM'
  },
  {
    id: 2,
    nombre: 'Grupo B - Tarde',
    curso: 'Programación Avanzada',
    codigo: 'CS301-B',
    estudiantesActivos: 18,
    estudiantesTotales: 20,
    progreso: 72,
    horario: 'Lun-Mié 14:00-16:00',
    aula: 'Lab 302',
    color: 'bg-blue-600',
    proximaClase: 'Lunes 2:00 PM'
  },
  {
    id: 3,
    nombre: 'Grupo A - Mañana',
    curso: 'Base de Datos',
    codigo: 'CS302-A',
    estudiantesActivos: 20,
    estudiantesTotales: 22,
    progreso: 75,
    horario: 'Mar-Jue 9:00-11:00',
    aula: 'Aula 205',
    color: 'bg-green-500',
    proximaClase: 'Martes 9:00 AM'
  },
  {
    id: 4,
    nombre: 'Grupo B - Noche',
    curso: 'Base de Datos',
    codigo: 'CS302-B',
    estudiantesActivos: 15,
    estudiantesTotales: 16,
    progreso: 70,
    horario: 'Mar-Jue 18:00-20:00',
    aula: 'Aula 206',
    color: 'bg-green-600',
    proximaClase: 'Martes 6:00 PM'
  },
  {
    id: 5,
    nombre: 'Grupo Único',
    curso: 'Inteligencia Artificial',
    codigo: 'CS401-A',
    estudiantesActivos: 45,
    estudiantesTotales: 52,
    progreso: 55,
    horario: 'Vie 10:00-14:00',
    aula: 'Auditorio 101',
    color: 'bg-orange-500',
    proximaClase: 'Viernes 10:00 AM'
  },
  {
    id: 6,
    nombre: 'Grupo A - Mañana',
    curso: 'Diseño de Interfaces',
    codigo: 'CS303-A',
    estudiantesActivos: 28,
    estudiantesTotales: 30,
    progreso: 72,
    horario: 'Lun-Vie 7:00-9:00',
    aula: 'Lab Diseño 1',
    color: 'bg-purple-500',
    proximaClase: 'Lunes 7:00 AM'
  },
  {
    id: 7,
    nombre: 'Grupo B - Tarde',
    curso: 'Diseño de Interfaces',
    codigo: 'CS303-B',
    estudiantesActivos: 10,
    estudiantesTotales: 12,
    progreso: 68,
    horario: 'Lun-Vie 15:00-17:00',
    aula: 'Lab Diseño 2',
    color: 'bg-purple-600',
    proximaClase: 'Lunes 3:00 PM'
  }
];
