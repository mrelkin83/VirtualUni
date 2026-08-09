/**
 * VirtualUni Database Seed Script
 *
 * This script populates the database with test data for development and testing.
 *
 * CREDENTIALS FOR TESTING:
 * ========================
 *
 * Admin:
 *   Email: admin@uniprueba.com
 *   Password: Admin123!
 *
 * Teachers:
 *   profesor1@uniprueba.com / Profesor123! (Carlos Martínez - Software)
 *   profesor2@uniprueba.com / Profesor123! (Ana Rodríguez - Databases)
 *   profesor3@uniprueba.com / Profesor123! (Luis García - Algorithms)
 *   profesor4@uniprueba.com / Profesor123! (María Fernández - Networks)
 *   profesor5@uniprueba.com / Profesor123! (Jorge López - AI)
 *   profesor6@uniprueba.com / Profesor123! (Carmen Torres - Math)
 *
 * Students (25 total):
 *   estudiante@uniprueba.com / Estudiante123! (María González - Main test student)
 *   estudiante2@uniprueba.com through estudiante25@uniprueba.com / Estudiante123!
 *
 * HOW TO RUN:
 * ===========
 * From the backend directory:
 *   npm run prisma:seed
 *
 * ACCESS:
 * =======
 * Frontend: http://uniprueba.localhost:3000
 * Backend API: http://localhost:4000
 *
 * NOTE: The seed script uses an ADDITIVE approach - it will not delete existing data.
 *       If data already exists, it will be skipped.
 */

import { PrismaClient, UserRole, Plan, TenantStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Track what was created vs skipped
const stats = {
  created: {
    tenants: 0,
    users: 0,
    teachers: 0,
    students: 0,
    courses: 0,
    topics: 0,
    blocks: 0,
    enrollments: 0,
    assignments: 0,
    submissions: 0,
    grades: 0,
    messages: 0,
    exams: 0,
    examQuestions: 0,
  },
  skipped: {
    tenants: 0,
    users: 0,
    courses: 0,
  },
  errors: [] as string[],
};

/**
 * Log helper with timestamp
 */
function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Helper to hash passwords consistently
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Generate random date within range
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate random grade between min and max
 */
function randomGrade(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

/**
 * Main seed function
 */
async function main() {
  log('🌱 Starting database seed...\n');

  // ============================================
  // 1. CREATE TENANT
  // ============================================
  log('📦 Creating tenant...');

  const tenantSubdomain = 'uniprueba';
  let tenant = await prisma.tenant.findUnique({
    where: { subdomain: tenantSubdomain },
  });

  if (tenant) {
    log(`   ⏭️  Tenant "${tenantSubdomain}" already exists, skipping...`);
    stats.skipped.tenants++;
  } else {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30); // 30 days trial

    tenant = await prisma.tenant.create({
      data: {
        slug: 'uniprueba',
        name: 'Universidad de Prueba',
        subdomain: tenantSubdomain,
        plan: Plan.PROFESSIONAL,
        status: TenantStatus.ACTIVE,
        logo: null,
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        enableMessaging: true,
        enableVideoConf: true,
        enablePayments: true,
        enableCertificates: true,
        maxStudents: 100,
        maxTeachers: 20,
        maxCourses: 50,
        storageGB: 10,
        trialEndsAt,
      },
    });
    stats.created.tenants++;
    log(`   ✅ Created tenant: ${tenant.name}`);
  }

  const tenantId = tenant.id;

  // ============================================
  // 2. CREATE USERS
  // ============================================
  log('\n👥 Creating users...');

  // Admin user
  const adminEmail = 'admin@uniprueba.com';
  let adminUser = await prisma.user.findFirst({
    where: { email: adminEmail, tenantId },
  });

  if (adminUser) {
    log(`   ⏭️  Admin user already exists, skipping...`);
    stats.skipped.users++;
  } else {
    adminUser = await prisma.user.create({
      data: {
        tenantId,
        email: adminEmail,
        passwordHash: await hashPassword('Admin123!'),
        firstName: 'Admin',
        lastName: 'Usuario',
        role: UserRole.TENANT_ADMIN,
      },
    });
    stats.created.users++;
    log(`   ✅ Created admin: ${adminUser.email}`);
  }

  // Teachers
  const teachersData = [
    { firstName: 'Carlos', lastName: 'Martínez', email: 'profesor1@uniprueba.com', dept: 'Ingeniería de Software', spec: 'Desarrollo Web' },
    { firstName: 'Ana', lastName: 'Rodríguez', email: 'profesor2@uniprueba.com', dept: 'Bases de Datos', spec: 'SQL y NoSQL' },
    { firstName: 'Luis', lastName: 'García', email: 'profesor3@uniprueba.com', dept: 'Algoritmos', spec: 'Estructuras de Datos' },
    { firstName: 'María', lastName: 'Fernández', email: 'profesor4@uniprueba.com', dept: 'Redes', spec: 'Seguridad Informática' },
    { firstName: 'Jorge', lastName: 'López', email: 'profesor5@uniprueba.com', dept: 'Inteligencia Artificial', spec: 'Machine Learning' },
    { firstName: 'Carmen', lastName: 'Torres', email: 'profesor6@uniprueba.com', dept: 'Matemáticas', spec: 'Cálculo y Álgebra' },
  ];

  const teachers = [];
  for (const td of teachersData) {
    let user = await prisma.user.findFirst({
      where: { email: td.email, tenantId },
      include: { teacher: true },
    });

    if (user) {
      log(`   ⏭️  Teacher ${td.email} already exists, skipping...`);
      stats.skipped.users++;
      teachers.push(user.teacher!);
    } else {
      const teacherCode = `TCH${String(teachersData.indexOf(td) + 1).padStart(3, '0')}`;

      user = await prisma.user.create({
        data: {
          tenantId,
          email: td.email,
          passwordHash: await hashPassword('Profesor123!'),
          firstName: td.firstName,
          lastName: td.lastName,
          role: UserRole.TEACHER,
          teacher: {
            create: {
              tenantId,
              employeeCode: teacherCode,
              department: td.dept,
              specialization: td.spec,
              hireDate: randomDate(new Date(2018, 0, 1), new Date(2023, 0, 1)),
            },
          },
        },
        include: { teacher: true },
      });

      await prisma.tenant.update({
        where: { id: tenantId },
        data: { currentTeachers: { increment: 1 } },
      });

      stats.created.users++;
      stats.created.teachers++;
      teachers.push(user.teacher!);
      log(`   ✅ Created teacher: ${user.email} (${teacherCode})`);
    }
  }

  // Students
  const studentsData = [
    { firstName: 'María', lastName: 'González', email: 'estudiante@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '5to' },
    { firstName: 'Juan', lastName: 'Pérez', email: 'estudiante2@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '3ro' },
    { firstName: 'Laura', lastName: 'Ramírez', email: 'estudiante3@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '4to' },
    { firstName: 'Pedro', lastName: 'Sánchez', email: 'estudiante4@uniprueba.com', program: 'Ingeniería de Software', semester: '6to' },
    { firstName: 'Ana', lastName: 'Torres', email: 'estudiante5@uniprueba.com', program: 'Ingeniería de Software', semester: '5to' },
    { firstName: 'Diego', lastName: 'Morales', email: 'estudiante6@uniprueba.com', program: 'Ciencias de la Computación', semester: '7mo' },
    { firstName: 'Sofía', lastName: 'Castro', email: 'estudiante7@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '4to' },
    { firstName: 'Miguel', lastName: 'Vargas', email: 'estudiante8@uniprueba.com', program: 'Ingeniería de Software', semester: '3ro' },
    { firstName: 'Carolina', lastName: 'Ruiz', email: 'estudiante9@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '5to' },
    { firstName: 'Andrés', lastName: 'Mendoza', email: 'estudiante10@uniprueba.com', program: 'Ciencias de la Computación', semester: '6to' },
    { firstName: 'Valentina', lastName: 'Ortiz', email: 'estudiante11@uniprueba.com', program: 'Ingeniería de Software', semester: '4to' },
    { firstName: 'Santiago', lastName: 'Silva', email: 'estudiante12@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '3ro' },
    { firstName: 'Camila', lastName: 'Rojas', email: 'estudiante13@uniprueba.com', program: 'Ingeniería de Software', semester: '5to' },
    { firstName: 'Sebastián', lastName: 'Herrera', email: 'estudiante14@uniprueba.com', program: 'Ciencias de la Computación', semester: '7mo' },
    { firstName: 'Isabella', lastName: 'Gutiérrez', email: 'estudiante15@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '6to' },
    { firstName: 'Mateo', lastName: 'Jiménez', email: 'estudiante16@uniprueba.com', program: 'Ingeniería de Software', semester: '4to' },
    { firstName: 'Lucía', lastName: 'Paredes', email: 'estudiante17@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '3ro' },
    { firstName: 'Nicolás', lastName: 'Navarro', email: 'estudiante18@uniprueba.com', program: 'Ciencias de la Computación', semester: '5to' },
    { firstName: 'Emma', lastName: 'Campos', email: 'estudiante19@uniprueba.com', program: 'Ingeniería de Software', semester: '6to' },
    { firstName: 'Tomás', lastName: 'Ríos', email: 'estudiante20@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '4to' },
    { firstName: 'Martina', lastName: 'Cruz', email: 'estudiante21@uniprueba.com', program: 'Ingeniería de Software', semester: '3ro' },
    { firstName: 'Daniel', lastName: 'Flores', email: 'estudiante22@uniprueba.com', program: 'Ciencias de la Computación', semester: '7mo' },
    { firstName: 'Gabriela', lastName: 'Vega', email: 'estudiante23@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '5to' },
    { firstName: 'Felipe', lastName: 'Molina', email: 'estudiante24@uniprueba.com', program: 'Ingeniería de Software', semester: '6to' },
    { firstName: 'Mariana', lastName: 'Reyes', email: 'estudiante25@uniprueba.com', program: 'Ingeniería de Sistemas', semester: '4to' },
  ];

  const students = [];
  for (const sd of studentsData) {
    let user = await prisma.user.findFirst({
      where: { email: sd.email, tenantId },
      include: { student: true },
    });

    if (user) {
      log(`   ⏭️  Student ${sd.email} already exists, skipping...`);
      stats.skipped.users++;
      students.push(user.student!);
    } else {
      const studentCode = `EST${String(studentsData.indexOf(sd) + 1).padStart(3, '0')}`;

      user = await prisma.user.create({
        data: {
          tenantId,
          email: sd.email,
          passwordHash: await hashPassword('Estudiante123!'),
          firstName: sd.firstName,
          lastName: sd.lastName,
          role: UserRole.STUDENT,
          student: {
            create: {
              tenantId,
              studentCode,
              program: sd.program,
              semester: sd.semester,
              enrollmentDate: randomDate(new Date(2020, 0, 1), new Date(2023, 0, 1)),
              status: 'active',
            },
          },
        },
        include: { student: true },
      });

      await prisma.tenant.update({
        where: { id: tenantId },
        data: { currentStudents: { increment: 1 } },
      });

      stats.created.users++;
      stats.created.students++;
      students.push(user.student!);
      log(`   ✅ Created student: ${user.email} (${studentCode})`);
    }
  }

  log(`\n   Total users: ${stats.created.users} created, ${stats.skipped.users} skipped`);

  // ============================================
  // 3. CREATE COURSES
  // ============================================
  log('\n📚 Creating courses...');

  const coursesData = [
    { code: 'CS301', name: 'Desarrollo Web Avanzado', teacherIdx: 0, credits: 4, semester: '2024-1', color: 'bg-blue-500', desc: 'Aprende React, Node.js y desarrollo full-stack moderno' },
    { code: 'DB201', name: 'Bases de Datos I', teacherIdx: 1, credits: 3, semester: '2024-1', color: 'bg-green-500', desc: 'Fundamentos de bases de datos relacionales y SQL' },
    { code: 'DB302', name: 'Bases de Datos II', teacherIdx: 1, credits: 4, semester: '2024-1', color: 'bg-emerald-500', desc: 'Bases de datos NoSQL y optimización de consultas' },
    { code: 'ALG201', name: 'Algoritmos y Estructuras de Datos', teacherIdx: 2, credits: 4, semester: '2024-1', color: 'bg-purple-500', desc: 'Algoritmos de ordenamiento, búsqueda y estructuras de datos' },
    { code: 'CS202', name: 'Programación Orientada a Objetos', teacherIdx: 0, credits: 3, semester: '2024-1', color: 'bg-indigo-500', desc: 'Principios de OOP con Java y TypeScript' },
    { code: 'NET301', name: 'Redes de Computadoras', teacherIdx: 3, credits: 4, semester: '2024-1', color: 'bg-orange-500', desc: 'Protocolos de red, TCP/IP y arquitecturas de red' },
    { code: 'SEC401', name: 'Seguridad Informática', teacherIdx: 3, credits: 3, semester: '2024-1', color: 'bg-red-500', desc: 'Criptografía, seguridad de redes y ethical hacking' },
    { code: 'AI301', name: 'Inteligencia Artificial', teacherIdx: 4, credits: 4, semester: '2024-1', color: 'bg-pink-500', desc: 'Fundamentos de IA, búsqueda y razonamiento' },
    { code: 'ML401', name: 'Machine Learning', teacherIdx: 4, credits: 4, semester: '2024-1', color: 'bg-rose-500', desc: 'Algoritmos de aprendizaje supervisado y no supervisado' },
    { code: 'MAT201', name: 'Cálculo Diferencial', teacherIdx: 5, credits: 4, semester: '2024-1', color: 'bg-yellow-500', desc: 'Límites, derivadas y aplicaciones del cálculo' },
    { code: 'MAT202', name: 'Álgebra Lineal', teacherIdx: 5, credits: 3, semester: '2024-1', color: 'bg-amber-500', desc: 'Matrices, vectores y transformaciones lineales' },
    { code: 'MAT301', name: 'Matemáticas Discretas', teacherIdx: 5, credits: 3, semester: '2024-1', color: 'bg-lime-500', desc: 'Lógica, teoría de conjuntos y teoría de grafos' },
  ];

  const courses = [];
  for (const cd of coursesData) {
    let course = await prisma.course.findFirst({
      where: { code: cd.code, tenantId },
    });

    if (course) {
      log(`   ⏭️  Course ${cd.code} already exists, skipping...`);
      stats.skipped.courses++;
      courses.push(course);
    } else {
      course = await prisma.course.create({
        data: {
          tenantId,
          teacherId: teachers[cd.teacherIdx].id,
          code: cd.code,
          name: cd.name,
          description: cd.desc,
          credits: cd.credits,
          semester: cd.semester,
          color: cd.color,
          status: 'active',
        },
      });

      await prisma.tenant.update({
        where: { id: tenantId },
        data: { currentCourses: { increment: 1 } },
      });

      stats.created.courses++;
      courses.push(course);
      log(`   ✅ Created course: ${course.code} - ${course.name}`);
    }
  }

  log(`\n   Total courses: ${stats.created.courses} created, ${stats.skipped.courses} skipped`);

  // ============================================
  // 4. CREATE COURSE TOPICS AND BLOCKS
  // ============================================
  log('\n📖 Creating course topics and blocks...');

  const topicsData = [
    // Desarrollo Web Avanzado
    { courseIdx: 0, topics: [
      { title: 'Fundamentos de React', desc: 'Componentes, props y state', blocks: [
        { title: 'Componentes y Props', content: 'Los componentes son la base de React. Aprende a crear componentes funcionales y de clase, y cómo pasar datos mediante props.', objectives: ['Crear componentes funcionales', 'Entender props y su flujo', 'Aplicar composición de componentes'], keyIdeas: ['Los componentes son reutilizables', 'Props son inmutables', 'Composición sobre herencia'] },
        { title: 'Estado y Ciclo de Vida', content: 'El estado permite que los componentes sean dinámicos. Entiende cómo gestionar el estado y el ciclo de vida de componentes.', objectives: ['Gestionar estado local', 'Entender ciclo de vida', 'Actualizar componentes'], keyIdeas: ['Estado es mutable y privado', 'Ciclo de vida tiene fases', 'setState es asíncrono'] },
      ]},
      { title: 'Hooks y Context API', desc: 'Gestión de estado moderno', blocks: [
        { title: 'useState y useEffect', content: 'Los hooks permiten usar estado y efectos en componentes funcionales. Domina los hooks fundamentales.', objectives: ['Usar useState correctamente', 'Implementar useEffect', 'Evitar dependencias innecesarias'], keyIdeas: ['Hooks siguen reglas estrictas', 'useEffect maneja efectos secundarios', 'Limpieza de efectos es importante'] },
        { title: 'Context para gestión de estado', content: 'Context API permite compartir estado globalmente sin prop drilling.', objectives: ['Crear contextos', 'Proveer y consumir contextos', 'Optimizar re-renders'], keyIdeas: ['Context evita prop drilling', 'useContext consume contextos', 'Divide contextos lógicamente'] },
      ]},
      { title: 'Optimización y Mejores Prácticas', desc: 'Rendimiento y patrones', blocks: [
        { title: 'Memoización y React.memo', content: 'Optimiza el rendimiento de tu aplicación usando memoización inteligente.', objectives: ['Aplicar React.memo', 'Usar useMemo y useCallback', 'Medir rendimiento'], keyIdeas: ['Memoización previene re-renders', 'useMemo cachea valores', 'Optimiza solo cuando sea necesario'] },
      ]},
    ]},
    // Bases de Datos I
    { courseIdx: 1, topics: [
      { title: 'Introducción a Bases de Datos', desc: 'Conceptos fundamentales', blocks: [
        { title: 'Modelos de Datos', content: 'Conoce los diferentes modelos de datos: relacional, jerárquico, de red y orientado a objetos.', objectives: ['Identificar modelos de datos', 'Comparar características', 'Elegir modelo apropiado'], keyIdeas: ['Modelo relacional usa tablas', 'Normalización elimina redundancia', 'Integridad referencial mantiene consistencia'] },
      ]},
      { title: 'SQL Básico', desc: 'Consultas y manipulación', blocks: [
        { title: 'SELECT, INSERT, UPDATE, DELETE', content: 'Domina las operaciones CRUD en SQL.', objectives: ['Escribir consultas SELECT', 'Insertar y actualizar datos', 'Eliminar datos de forma segura'], keyIdeas: ['SELECT recupera datos', 'WHERE filtra resultados', 'JOIN combina tablas'] },
        { title: 'Funciones Agregadas y GROUP BY', content: 'Aprende a resumir y agrupar datos.', objectives: ['Usar COUNT, SUM, AVG', 'Agrupar con GROUP BY', 'Filtrar grupos con HAVING'], keyIdeas: ['Agregadas resumen datos', 'GROUP BY agrupa filas', 'HAVING filtra grupos'] },
      ]},
    ]},
    // Add more topics for other courses...
  ];

  // Create topics and blocks for the first few courses
  for (const td of topicsData) {
    for (let topicIdx = 0; topicIdx < td.topics.length; topicIdx++) {
      const topicInfo = td.topics[topicIdx];

      // Sin esta comprobación cada reejecución añadía otra copia del temario
      // completo al mismo curso.
      const temaExistente = await prisma.courseTopic.findFirst({
        where: {
          tenantId,
          courseId: courses[td.courseIdx].id,
          title: topicInfo.title,
        },
        select: { id: true },
      });
      if (temaExistente) continue;

      const topic = await prisma.courseTopic.create({
        data: {
          tenantId,
          courseId: courses[td.courseIdx].id,
          title: topicInfo.title,
          description: topicInfo.desc,
          orderIndex: topicIdx,
          completed: false,
        },
      });
      stats.created.topics++;

      for (let blockIdx = 0; blockIdx < topicInfo.blocks.length; blockIdx++) {
        const blockInfo = topicInfo.blocks[blockIdx];

        await prisma.topicBlock.create({
          data: {
            tenantId,
            topicId: topic.id,
            title: blockInfo.title,
            content: blockInfo.content,
            objectives: blockInfo.objectives,
            keyIdeas: blockInfo.keyIdeas,
            orderIndex: blockIdx,
          },
        });
        stats.created.blocks++;
      }
    }
  }

  log(`   ✅ Created ${stats.created.topics} topics and ${stats.created.blocks} blocks`);

  // ============================================
  // 5. CREATE ENROLLMENTS
  // ============================================
  log('\n🎓 Creating enrollments...');

  // Main test student (María González) enrolls in first 6 courses
  //
  // La cabecera de este archivo promete un comportamiento aditivo -- "if data
  // already exists, it will be skipped" --, pero estos `create` reventaban con
  // P2002 al reejecutar sobre una base ya sembrada, abortando todo lo que
  // viene después. Se usa `createMany` con `skipDuplicates`, que respeta la
  // restricción única (student_id, course_id) sin romper.
  const mainStudent = students[0];
  const matriculaPrincipal = await prisma.enrollment.createMany({
    data: courses.slice(0, 6).map((c) => ({
      tenantId,
      studentId: mainStudent.id,
      courseId: c.id,
      enrolledAt: randomDate(new Date(2024, 0, 1), new Date(2024, 1, 1)),
      status: 'active',
    })),
    skipDuplicates: true,
  });
  stats.created.enrollments += matriculaPrincipal.count;

  // Distribute other students across courses (10-20 per course)
  for (let courseIdx = 0; courseIdx < courses.length; courseIdx++) {
    // El `try/catch` de más abajo solo evita el choque con una matrícula ya
    // existente, pero como los estudiantes se barajan al azar cada ejecución
    // añadía parejas nuevas: en una reejecución las matrículas pasaron de 157
    // a 242 y, arrastradas por ellas, las notas de 628 a 968. Si el curso ya
    // tiene alumnado, se deja como está.
    const yaMatriculados = await prisma.enrollment.count({
      where: { tenantId, courseId: courses[courseIdx].id },
    });
    if (yaMatriculados > 0) continue;

    const numEnrollments = Math.floor(Math.random() * 11) + 10; // 10-20
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

    for (let i = 1; i < Math.min(numEnrollments, students.length); i++) {
      try {
        await prisma.enrollment.create({
          data: {
            tenantId,
            studentId: shuffledStudents[i].id,
            courseId: courses[courseIdx].id,
            enrolledAt: randomDate(new Date(2024, 0, 1), new Date(2024, 1, 1)),
            status: 'active',
          },
        });
        stats.created.enrollments++;
      } catch (error) {
        // Skip if already enrolled (duplicate)
      }
    }
  }

  log(`   ✅ Created ${stats.created.enrollments} enrollments`);

  // ============================================
  // 6. CREATE ASSIGNMENTS
  // ============================================
  log('\n📝 Creating assignments...');

  const assignmentTypes = [
    { title: 'Taller Práctico 1', desc: 'Implementa los conceptos vistos en clase', points: 100 },
    { title: 'Proyecto Parcial', desc: 'Desarrolla un proyecto que integre los temas del módulo', points: 150 },
    { title: 'Quiz Teórico', desc: 'Evaluación de conceptos fundamentales', points: 50 },
    { title: 'Trabajo Final', desc: 'Proyecto final integrando todos los conocimientos del curso', points: 200 },
  ];

  const assignments = [];
  for (let courseIdx = 0; courseIdx < courses.length; courseIdx++) {
    // El número de tareas por curso es aleatorio (3 o 4), así que comprobar
    // solo por título hacía que una reejecución con un número mayor añadiera
    // la tarea que faltaba. Si el curso ya tiene tareas, se deja como está.
    const tareasDelCurso = await prisma.assignment.count({
      where: { tenantId, courseId: courses[courseIdx].id },
    });
    if (tareasDelCurso > 0) continue;

    const numAssignments = Math.floor(Math.random() * 2) + 3; // 3-4 assignments

    for (let i = 0; i < numAssignments; i++) {
      const assignType = assignmentTypes[i % assignmentTypes.length];
      const daysOffset = (i - 2) * 14; // Some past, some future
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysOffset);

      // Sin esta comprobación, cada reejecución duplicaba las tareas -- y con
      // ellas sus entregas y notas, que se derivan de las recién creadas --
      // pese a que la cabecera promete que lo existente se omite.
      const tituloTarea = `${assignType.title} - ${courses[courseIdx].name}`;
      const tareaExistente = await prisma.assignment.findFirst({
        where: { tenantId, courseId: courses[courseIdx].id, title: tituloTarea },
        select: { id: true },
      });
      if (tareaExistente) continue;

      const assignment = await prisma.assignment.create({
        data: {
          tenantId,
          courseId: courses[courseIdx].id,
          title: tituloTarea,
          description: assignType.desc,
          dueDate,
          totalPoints: assignType.points,
        },
      });
      stats.created.assignments++;
      assignments.push(assignment);
    }
  }

  log(`   ✅ Created ${stats.created.assignments} assignments`);

  // ============================================
  // 7. CREATE SUBMISSIONS
  // ============================================
  log('\n📤 Creating submissions...');

  // Get enrollments for creating realistic submissions
  const enrollments = await prisma.enrollment.findMany({
    where: { tenantId },
    include: { student: true, course: true },
  });

  for (const assignment of assignments) {
    // Find students enrolled in this course
    const enrolledInCourse = enrollments.filter(e => e.courseId === assignment.courseId);

    // 50-80% of students submit
    const submissionRate = Math.random() * 0.3 + 0.5;
    const numSubmissions = Math.floor(enrolledInCourse.length * submissionRate);

    const shuffled = [...enrolledInCourse].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numSubmissions; i++) {
      const enrollment = shuffled[i];
      const submittedAt = randomDate(
        new Date(assignment.dueDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        assignment.dueDate
      );

      // 70% of submissions are graded
      const isGraded = Math.random() < 0.7;
      const grade = isGraded ? randomGrade(60, 100) : null;
      const gradedAt = isGraded ? new Date(submittedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null;

      await prisma.submission.create({
        data: {
          tenantId,
          assignmentId: assignment.id,
          studentId: enrollment.studentId,
          content: `Entrega del estudiante ${enrollment.student.studentCode}`,
          submittedAt,
          grade: grade,
          feedback: isGraded ? 'Buen trabajo, sigue así.' : null,
          gradedAt: gradedAt,
        },
      });
      stats.created.submissions++;
    }
  }

  log(`   ✅ Created ${stats.created.submissions} submissions`);

  // ============================================
  // 8. CREATE GRADES
  // ============================================
  log('\n📊 Creating grades...');

  const gradeTypes = ['parcial1', 'parcial2', 'talleres', 'proyecto'];
  const weights = [0.25, 0.25, 0.25, 0.25];

  for (const enrollment of enrollments) {
    const course = await prisma.course.findUnique({
      where: { id: enrollment.courseId },
    });

    for (let i = 0; i < gradeTypes.length; i++) {
      // Igual que con las tareas: sin comprobar, cada reejecución añadía otras
      // 628 notas sobre las mismas matrículas y falseaba todos los promedios.
      const notaExistente = await prisma.grade.findFirst({
        where: {
          tenantId,
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          gradeType: gradeTypes[i],
        },
        select: { id: true },
      });
      if (notaExistente) continue;

      await prisma.grade.create({
        data: {
          tenantId,
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          teacherId: course!.teacherId,
          gradeType: gradeTypes[i],
          grade: randomGrade(65, 95),
          weight: weights[i],
          gradedAt: randomDate(new Date(2024, 1, 1), new Date()),
        },
      });
      stats.created.grades++;
    }
  }

  log(`   ✅ Created ${stats.created.grades} grades`);

  // ============================================
  // 8b. CREATE EXAMS
  // ============================================
  // El módulo de exámenes estaba completo en el backend pero la siembra no
  // creaba ninguno: la tabla quedaba vacía, el panel del estudiante caía a los
  // exámenes de ejemplo --con identificadores numéricos-- y al pulsar "Iniciar
  // examen" tomaba la rama local, que anuncia "¡Buena suerte!" sin abrir nada.
  // Sin datos, la funcionalidad nunca se podía ejercitar.
  log('\n🧪 Creating exams...');

  const plantillasExamen = [
    {
      titulo: 'Parcial 1',
      instrucciones: 'Responde todas las preguntas. Solo hay una opción correcta por pregunta.',
      duracion: 60,
      preguntas: [
        {
          pregunta: '¿Cuál es el objetivo principal de esta asignatura?',
          opciones: ['Memorizar definiciones', 'Aplicar los conceptos a problemas reales', 'Aprobar el examen', 'Ninguna de las anteriores'],
          respuestaCorrecta: 1,
        },
        {
          pregunta: 'Ante un enunciado ambiguo, lo correcto es:',
          opciones: ['Adivinar', 'Dejarlo en blanco', 'Declarar los supuestos y resolver', 'Copiar al compañero'],
          respuestaCorrecta: 2,
        },
        {
          pregunta: 'La evaluación continua sirve para:',
          opciones: ['Detectar dificultades a tiempo', 'Sancionar al estudiante', 'Rellenar el calendario', 'Nada en concreto'],
          respuestaCorrecta: 0,
        },
      ],
    },
    {
      titulo: 'Parcial 2',
      instrucciones: 'Examen de mitad de periodo. Duración estricta.',
      duracion: 45,
      preguntas: [
        {
          pregunta: 'El trabajo en equipo dentro del curso se evalúa por:',
          opciones: ['El resultado únicamente', 'El proceso y el resultado', 'La asistencia', 'El azar'],
          respuestaCorrecta: 1,
        },
        {
          pregunta: 'Una entrega fuera de plazo:',
          opciones: ['Se ignora', 'Se penaliza según el reglamento', 'Vale doble', 'Se borra'],
          respuestaCorrecta: 1,
        },
      ],
    },
  ];

  for (const course of courses.slice(0, 6)) {
    for (const [idx, plantilla] of plantillasExamen.entries()) {
      const yaExiste = await prisma.exam.findFirst({
        where: { courseId: course.id, titulo: plantilla.titulo, tenantId: course.tenantId },
        select: { id: true },
      });
      if (yaExiste) continue;

      const puntajeTotal = plantilla.preguntas.length * 10;
      const examen = await prisma.exam.create({
        data: {
          tenantId: course.tenantId,
          courseId: course.id,
          titulo: `${plantilla.titulo} - ${course.name}`,
          instrucciones: plantilla.instrucciones,
          // El primero ya disponible, el segundo programado más adelante.
          fecha: new Date(Date.now() + (idx === 0 ? -2 : 20) * 24 * 60 * 60 * 1000),
          duracion: plantilla.duracion,
          estado: idx === 0 ? 'ACTIVO' : 'PROGRAMADO',
          puntajeTotal,
          notaMinima: 60,
          intentosPermitidos: 1,
          mostrarResultados: true,
        },
      });
      stats.created.exams++;

      for (const [orden, p] of plantilla.preguntas.entries()) {
        await prisma.examQuestion.create({
          data: {
            tenantId: course.tenantId,
            examId: examen.id,
            pregunta: p.pregunta,
            opciones: p.opciones,
            respuestaCorrecta: p.respuestaCorrecta,
            puntaje: 10,
            orderIndex: orden,
          },
        });
        stats.created.examQuestions++;
      }
    }
  }

  log(`   ✅ Created ${stats.created.exams} exams with ${stats.created.examQuestions} questions`);

  // ============================================
  // 9. CREATE MESSAGES
  // ============================================
  log('\n💬 Creating messages...');

  const messageTemplates = [
    { subject: 'Consulta sobre tarea', body: 'Hola profesor, tengo una duda sobre la tarea asignada. ¿Podrías aclararme el punto 3?' },
    { subject: 'Solicitud de tutoría', body: 'Estimado profesor, me gustaría agendar una tutoría para repasar los conceptos del último parcial.' },
    { subject: 'Entrega tardía', body: 'Profesor, tuve un problema técnico y no pude entregar a tiempo. ¿Es posible una extensión?' },
    { subject: 'Felicitaciones por la clase', body: 'Excelente clase de hoy, los ejemplos fueron muy claros. Gracias!' },
    { subject: 'Pregunta sobre calificación', body: 'Hola, revisé mi calificación del parcial y tengo una pregunta sobre un punto específico.' },
    { subject: 'Material de estudio', body: '¿Podría compartir material adicional sobre el tema que vimos hoy?' },
  ];

  // Los mensajes son de relleno y no tienen clave natural por la que
  // reconocerlos, así que se omiten en bloque si el tenant ya tiene
  // correspondencia: de lo contrario cada reejecución añadía otros 30.
  const mensajesExistentes = await prisma.message.count({ where: { tenantId } });
  if (mensajesExistentes > 0) {
    log(`   ↷ Ya hay ${mensajesExistentes} mensajes; se omite este paso`);
  }

  // Messages from students to teachers
  for (let i = 0; mensajesExistentes === 0 && i < 20; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const teacher = teachers[Math.floor(Math.random() * teachers.length)];
    const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];

    const studentUser = await prisma.user.findFirst({
      where: { student: { id: student.id } },
    });
    const teacherUser = await prisma.user.findFirst({
      where: { teacher: { id: teacher.id } },
    });

    const isRead = Math.random() < 0.7; // 70% read
    const createdAt = randomDate(new Date(2024, 2, 1), new Date());
    const readAt = isRead ? new Date(createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000) : null;

    await prisma.message.create({
      data: {
        tenantId,
        senderId: studentUser!.id,
        recipientId: teacherUser!.id,
        subject: template.subject,
        body: template.body,
        createdAt,
        readAt,
      },
    });
    stats.created.messages++;
  }

  // Messages from teachers to students
  for (let i = 0; mensajesExistentes === 0 && i < 10; i++) {
    const teacher = teachers[Math.floor(Math.random() * teachers.length)];
    const student = students[Math.floor(Math.random() * students.length)];

    const studentUser = await prisma.user.findFirst({
      where: { student: { id: student.id } },
    });
    const teacherUser = await prisma.user.findFirst({
      where: { teacher: { id: teacher.id } },
    });

    const isRead = Math.random() < 0.5; // 50% read
    const createdAt = randomDate(new Date(2024, 2, 1), new Date());
    const readAt = isRead ? new Date(createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000) : null;

    await prisma.message.create({
      data: {
        tenantId,
        senderId: teacherUser!.id,
        recipientId: studentUser!.id,
        subject: 'Retroalimentación de tu trabajo',
        body: 'Hola, he revisado tu último trabajo y me gustaría felicitarte por el esfuerzo. Aquí te dejo algunos comentarios para mejorar.',
        createdAt,
        readAt,
      },
    });
    stats.created.messages++;
  }

  log(`   ✅ Created ${stats.created.messages} messages`);

  // ============================================
  // SUMMARY
  // ============================================
  log('\n' + '='.repeat(50));
  log('✨ Seed completed successfully!\n');
  log('📊 Summary:');
  log(`   Tenants: ${stats.created.tenants} created, ${stats.skipped.tenants} skipped`);
  log(`   Users: ${stats.created.users} created, ${stats.skipped.users} skipped`);
  log(`     - Teachers: ${stats.created.teachers}`);
  log(`     - Students: ${stats.created.students}`);
  log(`   Courses: ${stats.created.courses} created, ${stats.skipped.courses} skipped`);
  log(`   Topics: ${stats.created.topics}`);
  log(`   Blocks: ${stats.created.blocks}`);
  log(`   Enrollments: ${stats.created.enrollments}`);
  log(`   Assignments: ${stats.created.assignments}`);
  log(`   Submissions: ${stats.created.submissions}`);
  log(`   Grades: ${stats.created.grades}`);
  log(`   Exams: ${stats.created.exams} (${stats.created.examQuestions} questions)`);
  log(`   Messages: ${stats.created.messages}`);

  if (stats.errors.length > 0) {
    log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach(err => log(`   - ${err}`));
  }

  // Recolecta estadísticas para el planificador. Sin esto, las tablas pequeñas
  // sembradas de golpe (courses: 13 filas, assignments: 44) nunca alcanzan el
  // umbral de autoanalyze (50 cambios + 10%), así que quedan con reltuples=-1
  // y el planificador estima a ciegas: en un join de dashboard llegó a calcular
  // 3 filas donde salían 32.088. ANALYZE no modifica datos.
  log('\n📊 Recolectando estadísticas del planificador (ANALYZE)...');
  await prisma.$executeRawUnsafe('ANALYZE');

  log('\n🌐 Access the application at:');
  log('   Frontend: http://uniprueba.localhost:3000');
  log('   Backend API: http://localhost:4000');

  log('\n🔑 Test credentials:');
  log('   Admin: admin@uniprueba.com / Admin123!');
  log('   Teacher: profesor1@uniprueba.com / Profesor123!');
  log('   Student: estudiante@uniprueba.com / Estudiante123!');
  log('='.repeat(50) + '\n');
}

// Execute seed
main()
  .catch((e) => {
    console.error('❌ Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
