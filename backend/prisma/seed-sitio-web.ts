/**
 * Seed del sitio web público e inscripciones — tres tenants demo, uno por mundo:
 *
 *   uniprueba   (MIXTA)   tecnólogo + especialización con SNIES + diplomado
 *   etdhdemo    (ETDH)    técnicos laborales en horas, registro SE, rolling
 *   colegiodemo (COLEGIO) preescolar a 11°, convocatoria por año lectivo con cupos por grado
 *
 * Aditivo e idempotente: todo va por upsert/find-or-create sobre llaves únicas.
 * Nada se borra. Ejecutar desde backend/:
 *
 *   npx ts-node prisma/seed-sitio-web.ts
 *
 * Credenciales demo (mismas claves que el seed principal):
 *   admin@etdhdemo.com    / Admin123!
 *   admin@colegiodemo.com / Admin123!
 */

import {
  PrismaClient,
  Prisma,
  UserRole,
  Plan,
  TenantStatus,
  EducationLevel,
  Modality,
  PeriodStructure,
  AcademicUnit,
  ProgramStatus,
  StudyPlanStatus,
  PeriodStatus,
  InstitutionType,
  SiteMode,
  AdmissionCallStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const log = (m: string) => console.log(`[seed-sitio-web] ${m}`);

// ---------------------------------------------------------------- utilidades

async function tenantDemo(opts: {
  slug: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  adminEmail: string;
}) {
  const tenant = await prisma.tenant.upsert({
    where: { slug: opts.slug },
    update: {},
    create: {
      slug: opts.slug,
      subdomain: opts.slug,
      name: opts.name,
      plan: Plan.BASIC,
      status: TenantStatus.ACTIVE,
      primaryColor: opts.primaryColor,
      secondaryColor: opts.secondaryColor,
      maxStudents: 200,
      maxTeachers: 20,
      maxCourses: 50,
    },
  });

  const existente = await prisma.user.findFirst({
    where: { tenantId: tenant.id, email: opts.adminEmail },
    select: { id: true },
  });
  if (!existente) {
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: opts.adminEmail,
        passwordHash: await bcrypt.hash('Admin123!', 10),
        firstName: 'Admin',
        lastName: opts.name,
        role: UserRole.TENANT_ADMIN,
        isActive: true,
      },
    });
    log(`usuario admin creado: ${opts.adminEmail}`);
  }
  return tenant;
}

async function programaPublicado(
  tenantId: string,
  data: {
    code: string;
    name: string;
    slug: string;
    educationLevel: EducationLevel;
    modality: Modality;
    periodStructure: PeriodStructure;
    academicUnit: AcademicUnit;
    durationPeriods?: number;
    totalHours?: number;
    totalCredits?: number;
    degreeTitle?: string;
    officialCode?: string;
    area?: string;
    schedule?: string;
    shortDescription: string;
    publicDescription?: string;
    occupationalProfile?: string;
    tuitionDisplay?: string;
    isNewUntil?: Date;
    faq?: Prisma.InputJsonValue;
  },
) {
  const { slug, shortDescription, publicDescription, occupationalProfile,
    area, schedule, tuitionDisplay, isNewUntil, faq, ...academico } = data;

  const publicos = {
    slug,
    isPublished: true,
    shortDescription,
    publicDescription,
    occupationalProfile,
    area,
    schedule,
    tuitionDisplay,
    isNewUntil,
    faq,
    status: ProgramStatus.ACTIVO,
  };

  let programa = await prisma.program.upsert({
    where: { tenantId_code: { tenantId, code: data.code } },
    // Si el programa ya existía (seed principal), solo se publica.
    update: publicos,
    create: { tenantId, ...academico, ...publicos },
  });

  // El identificador oficial se muestra en la ficha pública: si el programa
  // preexistente no lo tenía, se completa con el del demo (nunca se pisa).
  if (!programa.officialCode && academico.officialCode) {
    programa = await prisma.program.update({
      where: { id: programa.id },
      data: { officialCode: academico.officialCode, degreeTitle: programa.degreeTitle ?? academico.degreeTitle },
    });
  }

  const plan = await prisma.studyPlan.upsert({
    where: { programId_version: { programId: programa.id, version: '2027' } },
    update: {},
    create: {
      tenantId,
      programId: programa.id,
      version: '2027',
      status: StudyPlanStatus.VIGENTE,
      validFrom: new Date('2027-01-01'),
    },
  });

  return { programa, plan };
}

async function periodo(tenantId: string, code: string, name: string, start: string, end: string) {
  return prisma.academicPeriod.upsert({
    where: { tenantId_code: { tenantId, code } },
    update: {},
    create: {
      tenantId, code, name,
      startDate: new Date(start),
      endDate: new Date(end),
      status: PeriodStatus.PLANEADO,
    },
  });
}

async function convocatoria(
  tenantId: string,
  data: {
    programId: string;
    academicPeriodId: string;
    studyPlanId: string;
    name: string;
    slug: string;
    opensAt: Date;
    closesAt?: Date | null;
    rolling?: boolean;
    startsAt?: Date;
    capacity?: number;
    applicationFee?: number;
    schedule?: string;
    modality?: Modality;
    targetLevels?: Prisma.InputJsonValue;
    minAge?: number;
    minEducation?: string;
    documentos: { name: string; required?: boolean; acceptTypes?: string[] }[];
  },
) {
  const { documentos, ...resto } = data;
  const call = await prisma.admissionCall.upsert({
    where: { tenantId_slug: { tenantId, slug: data.slug } },
    update: { status: AdmissionCallStatus.ABIERTA },
    create: {
      tenantId,
      ...resto,
      closesAt: data.closesAt ?? null,
      rolling: data.rolling ?? false,
      applicationFee: data.applicationFee ?? 0,
      paymentMethods: (data.applicationFee ?? 0) > 0 ? ['MANUAL'] : [],
      status: AdmissionCallStatus.ABIERTA,
    },
  });

  for (const doc of documentos) {
    const ya = await prisma.admissionRequiredDocument.findFirst({
      where: { callId: call.id, name: doc.name },
      select: { id: true },
    });
    if (!ya) {
      await prisma.admissionRequiredDocument.create({
        data: {
          tenantId,
          callId: call.id,
          name: doc.name,
          required: doc.required ?? true,
          acceptTypes: doc.acceptTypes ?? ['application/pdf', 'image/jpeg', 'image/png'],
        },
      });
    }
  }
  return call;
}

function sitio(
  tenantId: string,
  institutionType: InstitutionType,
  hero: { title: string; subtitle: string },
  extras: Partial<Prisma.TenantSiteUncheckedCreateInput> = {},
) {
  const base: Prisma.TenantSiteUncheckedCreateInput = {
    tenantId,
    institutionType,
    published: true,
    siteMode: SiteMode.FULL,
    heroSlides: [
      {
        title: hero.title,
        subtitle: hero.subtitle,
        imageUrl: null,
        overlay: 0.5,
        ctaPrimary: { label: 'Inscríbete', href: '/programas' },
        ctaSecondary: { label: 'Habla con un asesor', href: 'whatsapp' },
      },
    ],
    sections: { order: ['featured', 'calls', 'benefits', 'stats', 'cta'], hidden: [] },
    benefits: [
      { icon: 'certificado', title: 'Formación certificada', text: 'Programas con registro oficial y docentes con experiencia real.' },
      { icon: 'horario', title: 'Horarios flexibles', text: 'Jornadas pensadas para quienes trabajan o estudian.' },
      { icon: 'virtual', title: 'Acompañamiento cercano', text: 'Grupos pequeños y seguimiento personalizado.' },
    ],
    stats: [
      { value: '15+', label: 'años formando' },
      { value: '2.500+', label: 'egresados' },
      { value: '94%', label: 'satisfacción' },
    ],
    featuredProgramIds: [],
    whatsappNumber: '573001112233',
    whatsappMessage: 'Hola, quiero información sobre sus programas.',
    privacyPolicy:
      'Política de tratamiento de datos personales (demo). La institución usa los datos del aspirante ' +
      'únicamente para el proceso de inscripción y matrícula, conforme a la Ley 1581 de 2012.',
    dataControllerName: 'Institución demo',
    ...extras,
  };
  return prisma.tenantSite.upsert({
    where: { tenantId },
    // En re-ejecuciones también se refrescan anuncio y contacto del demo
    // (si vienen), para que el sitio muestre el banner y las redes.
    update: {
      published: true,
      institutionType,
      ...(extras.announcement !== undefined ? { announcement: extras.announcement } : {}),
      ...(extras.contact !== undefined ? { contact: extras.contact } : {}),
      ...(extras.levelLabels !== undefined ? { levelLabels: extras.levelLabels } : {}),
    },
    create: base,
  });
}

/** Contacto demo con redes: alimenta la barra utilitaria y el pie. */
function contactoDemo(nombre: string) {
  return {
    direccion: 'Calle 45 # 13-20, Bogotá',
    telefono: '(601) 330 0000',
    email: `informacion@${nombre}.edu.co`,
    horario: 'Lunes a viernes, 7:00 a. m. – 6:00 p. m.',
    redes: {
      facebook: 'https://www.facebook.com/virtualuni.demo',
      instagram: 'https://www.instagram.com/virtualuni.demo',
      youtube: 'https://www.youtube.com/@virtualuni-demo',
    },
  };
}

/** Página institucional del demo: upsert por (tenant, slug). */
async function paginaInstitucional(
  tenantId: string,
  data: { slug: string; title: string; menuGroup: string; order: number; summary: string; content: string },
) {
  await prisma.sitePage.upsert({
    where: { tenantId_slug: { tenantId, slug: data.slug } },
    update: { isPublished: true },
    create: { tenantId, ...data, isPublished: true },
  });
}

// ------------------------------------------------------------------ 1. MIXTA

async function seedUniprueba() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'uniprueba' } });
  if (!tenant) {
    log('uniprueba no existe (corre primero el seed principal); se omite');
    return;
  }
  const t = tenant.id;

  const per = await periodo(t, '2027-1', 'Primer semestre 2027', '2027-01-20', '2027-06-15');

  const tec = await programaPublicado(t, {
    code: 'TEC-SOFT',
    name: 'Tecnólogo en Desarrollo de Software',
    slug: 'tecnologo-en-desarrollo-de-software',
    educationLevel: EducationLevel.TECNOLOGICO,
    modality: Modality.VIRTUAL,
    periodStructure: PeriodStructure.SEMESTRAL,
    academicUnit: AcademicUnit.CREDITOS,
    durationPeriods: 6,
    totalCredits: 96,
    degreeTitle: 'Tecnólogo en Desarrollo de Software',
    officialCode: 'SNIES 109876',
    area: 'Ingeniería y TIC',
    schedule: 'Virtual con encuentros sincrónicos',
    shortDescription: 'Aprende a construir software profesional con bases de datos, web y metodologías ágiles.',
    publicDescription:
      'Programa tecnológico orientado a la industria del software: programación, bases de datos, ' +
      'desarrollo web y de APIs, calidad y despliegue. Incluye proyecto integrador con empresas aliadas.',
    occupationalProfile: 'Desarrollador de software, analista de requerimientos, tester, administrador de bases de datos.',
    tuitionDisplay: 'Desde $1.850.000 por semestre',
    faq: [
      { q: '¿Necesito saber programar?', a: 'No. El primer semestre parte de cero.' },
      { q: '¿El título tiene validez oficial?', a: 'Sí, el programa cuenta con registro calificado (SNIES).' },
    ],
  });

  const esp = await programaPublicado(t, {
    code: 'ESP-GPROY',
    name: 'Especialización en Gerencia de Proyectos',
    slug: 'especializacion-en-gerencia-de-proyectos',
    educationLevel: EducationLevel.ESPECIALIZACION,
    modality: Modality.HIBRIDA,
    periodStructure: PeriodStructure.SEMESTRAL,
    academicUnit: AcademicUnit.CREDITOS,
    durationPeriods: 2,
    totalCredits: 26,
    degreeTitle: 'Especialista en Gerencia de Proyectos',
    officialCode: 'SNIES 110234',
    area: 'Administración y negocios',
    schedule: 'Viernes noche y sábados',
    shortDescription: 'Dirige proyectos con estándares internacionales y herramientas de gestión modernas.',
    occupationalProfile: 'Gerente de proyectos, PMO, líder de transformación.',
    tuitionDisplay: 'Desde $4.200.000 por semestre',
  });

  const dip = await programaPublicado(t, {
    code: 'DIP-ANDAT',
    name: 'Diplomado en Analítica de Datos',
    slug: 'diplomado-en-analitica-de-datos',
    educationLevel: EducationLevel.DIPLOMADO,
    modality: Modality.VIRTUAL,
    periodStructure: PeriodStructure.UNICO,
    academicUnit: AcademicUnit.HORAS,
    durationPeriods: 1,
    totalHours: 120,
    area: 'Ingeniería y TIC',
    schedule: 'Martes y jueves noche',
    shortDescription: 'Toma decisiones con datos: estadística aplicada, visualización y tableros.',
    isNewUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000),
    tuitionDisplay: '$980.000 pago único',
  });

  await convocatoria(t, {
    programId: tec.programa.id,
    academicPeriodId: per.id,
    studyPlanId: tec.plan.id,
    name: 'Inscripciones 2027-1 — Tecnólogo en Desarrollo de Software',
    slug: 'tec-software-2027-1',
    opensAt: new Date('2026-10-01'),
    closesAt: new Date('2027-01-15'),
    startsAt: new Date('2027-01-20'),
    capacity: 60,
    applicationFee: 85000,
    modality: Modality.VIRTUAL,
    minEducation: 'Bachiller',
    documentos: [
      { name: 'Documento de identidad' },
      { name: 'Diploma o acta de bachiller' },
      { name: 'Resultado Saber 11', required: false },
    ],
  });

  await convocatoria(t, {
    programId: esp.programa.id,
    academicPeriodId: per.id,
    studyPlanId: esp.plan.id,
    name: 'Inscripciones 2027-1 — Especialización en Gerencia de Proyectos',
    slug: 'esp-gproyectos-2027-1',
    opensAt: new Date('2026-10-01'),
    closesAt: new Date('2027-01-20'),
    startsAt: new Date('2027-01-27'),
    capacity: 35,
    applicationFee: 120000,
    minEducation: 'Profesional',
    documentos: [
      { name: 'Documento de identidad' },
      { name: 'Diploma o acta de pregrado' },
    ],
  });

  await convocatoria(t, {
    programId: dip.programa.id,
    academicPeriodId: per.id,
    studyPlanId: dip.plan.id,
    name: 'Diplomado en Analítica de Datos — inscripción permanente',
    slug: 'dip-analitica-permanente',
    opensAt: new Date('2026-10-01'),
    rolling: true,
    applicationFee: 0,
    documentos: [{ name: 'Documento de identidad' }],
  });

  await sitio(t, InstitutionType.MIXTA, {
    title: 'Tu futuro profesional empieza aquí',
    subtitle: 'Pregrado, posgrado y educación continua con registro oficial, en modalidad virtual e híbrida.',
  }, {
    featuredProgramIds: [tec.programa.id, esp.programa.id, dip.programa.id],
    seoTitle: 'Universidad de Prueba — Programas de pregrado, posgrado y educación continua',
    seoDescription: 'Oferta académica de la Universidad de Prueba: tecnólogo en software, especialización en gerencia de proyectos y diplomados.',
    dataControllerName: 'Universidad de Prueba',
    announcement: { text: 'Inscripciones abiertas 2027-1 — cupos limitados', link: '/admisiones', active: true },
    contact: contactoDemo('uniprueba'),
  });

  await paginaInstitucional(t, {
    slug: 'quienes-somos',
    title: 'Quiénes somos',
    menuGroup: 'Institucional',
    order: 1,
    summary: 'Historia, misión y visión de la Universidad de Prueba.',
    content:
      '## Nuestra historia\n\nDesde 2010 formamos profesionales con programas virtuales e híbridos centrados en la ' +
      'empleabilidad.\n\n## Misión\n\nFormar personas íntegras y competentes que transformen su entorno.\n\n' +
      '## Visión\n\nSer en 2030 la institución de referencia en educación virtual de calidad en la región.',
  });
  await paginaInstitucional(t, {
    slug: 'bienestar',
    title: 'Bienestar universitario',
    menuGroup: 'Vida universitaria',
    order: 1,
    summary: 'Acompañamiento psicosocial, deporte, cultura y bolsa de empleo.',
    content:
      '## Te acompañamos\n\n- Orientación psicosocial y académica\n- Clubes deportivos y culturales\n' +
      '- Bolsa de empleo y ferias laborales\n- Monitorías y tutorías entre pares\n\n' +
      'Escríbenos desde la página de [contacto](/contacto) para conocer la programación del semestre.',
  });

  log('uniprueba listo (3 programas publicados, 3 convocatorias)');
}

// ------------------------------------------------------------------- 2. ETDH

async function seedEtdh() {
  const tenant = await tenantDemo({
    slug: 'etdhdemo',
    name: 'Centro de Formación Laboral Demo',
    primaryColor: '#0F766E',
    secondaryColor: '#F59E0B',
    adminEmail: 'admin@etdhdemo.com',
  });
  const t = tenant.id;

  const per = await periodo(t, 'COHORTES-2027', 'Cohortes 2027', '2027-01-01', '2027-12-31');

  const contable = await programaPublicado(t, {
    code: 'TL-AUXCONT',
    name: 'Técnico Laboral en Auxiliar Contable y Financiero',
    slug: 'auxiliar-contable-y-financiero',
    educationLevel: EducationLevel.TECNICO_LABORAL,
    modality: Modality.PRESENCIAL,
    periodStructure: PeriodStructure.MODULAR,
    academicUnit: AcademicUnit.HORAS,
    durationPeriods: 4,
    totalHours: 620,
    degreeTitle: 'Técnico laboral por competencias en Auxiliar Contable y Financiero',
    officialCode: 'Registro SE Bogotá No. 1234 de 2026',
    area: 'Contable y financiera',
    schedule: 'Diurna y nocturna',
    shortDescription: 'Maneja contabilidad, nómina y facturación en 620 horas, con práctica real desde el primer módulo.',
    publicDescription:
      'Formación por competencias para el mundo laboral: contabilidad básica y de costos, nómina y seguridad ' +
      'social, facturación electrónica y herramientas ofimáticas contables. Certificado de técnico laboral por ' +
      'competencias con registro ante la Secretaría de Educación.',
    occupationalProfile: 'Auxiliar contable, auxiliar de nómina, auxiliar de facturación, asistente administrativo.',
    tuitionDisplay: '$390.000 por módulo',
    faq: [
      { q: '¿Qué certificado recibo?', a: 'Certificado de técnico laboral por competencias en Auxiliar Contable y Financiero.' },
      { q: '¿Cuál es el requisito mínimo?', a: 'Tener 9° aprobado y 15 años o más.' },
    ],
  });

  // Pensum mínimo creíble del técnico contable: 4 módulos en horas
  const modulos = [
    { code: 'ETDH-CONT1', name: 'Contabilidad básica', hours: 160 },
    { code: 'ETDH-NOMI', name: 'Nómina y seguridad social', hours: 160 },
    { code: 'ETDH-FACT', name: 'Facturación y documentos electrónicos', hours: 140 },
    { code: 'ETDH-OFIM', name: 'Ofimática contable', hours: 160 },
  ];
  let nivel = 1;
  for (const m of modulos) {
    const subj = await prisma.subject.upsert({
      where: { tenantId_code: { tenantId: t, code: m.code } },
      update: {},
      create: { tenantId: t, code: m.code, name: m.name, hours: m.hours, area: 'Contable y financiera' },
    });
    await prisma.studyPlanSubject.upsert({
      where: { studyPlanId_subjectId: { studyPlanId: contable.plan.id, subjectId: subj.id } },
      update: {},
      create: {
        tenantId: t,
        studyPlanId: contable.plan.id,
        subjectId: subj.id,
        level: nivel++,
        hours: m.hours,
      },
    });
  }

  const sistemas = await programaPublicado(t, {
    code: 'TL-SIST',
    name: 'Técnico Laboral en Sistemas e Informática',
    slug: 'tecnico-laboral-en-sistemas',
    educationLevel: EducationLevel.TECNICO_LABORAL,
    modality: Modality.PRESENCIAL,
    periodStructure: PeriodStructure.MODULAR,
    academicUnit: AcademicUnit.HORAS,
    durationPeriods: 4,
    totalHours: 600,
    degreeTitle: 'Técnico laboral por competencias en Sistemas e Informática',
    officialCode: 'Registro SE Bogotá No. 1310 de 2026',
    area: 'Tecnología',
    schedule: 'Nocturna',
    shortDescription: 'Soporte técnico, redes y herramientas digitales para trabajar en TI.',
    isNewUntil: new Date(Date.now() + 60 * 24 * 3600 * 1000),
    tuitionDisplay: '$370.000 por módulo',
  });

  const infancia = await programaPublicado(t, {
    code: 'TL-INFAN',
    name: 'Técnico Laboral en Atención a la Primera Infancia',
    slug: 'atencion-a-la-primera-infancia',
    educationLevel: EducationLevel.TECNICO_LABORAL,
    modality: Modality.PRESENCIAL,
    periodStructure: PeriodStructure.MODULAR,
    academicUnit: AcademicUnit.HORAS,
    durationPeriods: 4,
    totalHours: 640,
    degreeTitle: 'Técnico laboral por competencias en Atención Integral a la Primera Infancia',
    officialCode: 'Registro SE Bogotá No. 1288 de 2026',
    area: 'Primera infancia',
    schedule: 'Diurna',
    shortDescription: 'Cuida, educa y acompaña el desarrollo de niños y niñas de 0 a 6 años.',
    tuitionDisplay: '$360.000 por módulo',
  });

  await convocatoria(t, {
    programId: contable.programa.id,
    academicPeriodId: per.id,
    studyPlanId: contable.plan.id,
    name: 'Auxiliar Contable y Financiero — inscripción permanente',
    slug: 'auxiliar-contable-permanente',
    opensAt: new Date('2026-11-01'),
    rolling: true,
    startsAt: new Date('2026-12-01'),
    applicationFee: 50000,
    schedule: 'Diurna y nocturna',
    minAge: 15,
    minEducation: '9° aprobado',
    documentos: [
      { name: 'Documento de identidad' },
      { name: 'Certificado del último grado aprobado' },
    ],
  });

  await convocatoria(t, {
    programId: sistemas.programa.id,
    academicPeriodId: per.id,
    studyPlanId: sistemas.plan.id,
    name: 'Sistemas e Informática — cohorte enero 2027',
    slug: 'sistemas-enero-2027',
    opensAt: new Date('2026-11-01'),
    closesAt: new Date('2027-01-20'),
    startsAt: new Date('2027-01-25'),
    capacity: 30,
    applicationFee: 0,
    minAge: 15,
    minEducation: '9° aprobado',
    documentos: [
      { name: 'Documento de identidad' },
      { name: 'Certificado del último grado aprobado' },
    ],
  });

  await convocatoria(t, {
    programId: infancia.programa.id,
    academicPeriodId: per.id,
    studyPlanId: infancia.plan.id,
    name: 'Primera Infancia — cohorte febrero 2027',
    slug: 'infancia-febrero-2027',
    opensAt: new Date('2026-11-15'),
    closesAt: new Date('2027-02-10'),
    startsAt: new Date('2027-02-15'),
    capacity: 25,
    applicationFee: 0,
    minAge: 16,
    minEducation: 'Bachiller',
    documentos: [
      { name: 'Documento de identidad' },
      { name: 'Diploma o acta de bachiller' },
    ],
  });

  // Sección bachillerato: el caso real del instituto MIXTO (técnicos +
  // bachillerato por ciclos para adultos bajo el mismo techo). En la portada
  // y el menú aparece como categoría propia, derivada del nivel del programa.
  const bachillerato = await programaPublicado(t, {
    code: 'BACH-CICLOS',
    name: 'Bachillerato Académico por Ciclos',
    slug: 'bachillerato-por-ciclos',
    educationLevel: EducationLevel.BACHILLERATO_POR_CICLOS,
    modality: Modality.PRESENCIAL,
    periodStructure: PeriodStructure.MODULAR,
    academicUnit: AcademicUnit.HORAS,
    durationPeriods: 6,
    totalHours: 1200,
    degreeTitle: 'Bachiller académico',
    officialCode: 'Resolución SE Bogotá No. 2210 de 2026',
    area: 'Educación formal de adultos',
    schedule: 'Nocturna y fines de semana',
    shortDescription: 'Termina tu bachillerato en ciclos semestrales, de noche o los sábados, y sigue de una con un técnico laboral.',
    publicDescription:
      'Educación formal de adultos por ciclos lectivos especiales integrados (Decreto 3011): dos grados por ciclo, ' +
      'horarios nocturnos y de fin de semana, y articulación directa con nuestros técnicos laborales al graduarte.',
    tuitionDisplay: '$280.000 por ciclo',
    faq: [
      { q: '¿Desde qué edad puedo ingresar?', a: 'Desde los 15 años para ciclo 3 en adelante, según tu último grado aprobado.' },
      { q: '¿El título es válido?', a: 'Sí: otorgamos el título de bachiller académico con resolución oficial.' },
    ],
  });

  await convocatoria(t, {
    programId: bachillerato.programa.id,
    academicPeriodId: per.id,
    studyPlanId: bachillerato.plan.id,
    name: 'Bachillerato por ciclos — inscripción permanente',
    slug: 'bachillerato-permanente',
    opensAt: new Date('2026-11-01'),
    rolling: true,
    startsAt: new Date('2027-02-01'),
    applicationFee: 0,
    minAge: 15,
    documentos: [
      { name: 'Documento de identidad' },
      { name: 'Certificado del último grado aprobado' },
    ],
  });

  await sitio(t, InstitutionType.ETDH, {
    title: 'Fórmate para trabajar',
    subtitle: 'Técnicos laborales por competencias y bachillerato por ciclos, con registro oficial.',
  }, {
    featuredProgramIds: [contable.programa.id, sistemas.programa.id, infancia.programa.id],
    seoTitle: 'Centro de Formación Laboral Demo — Técnicos y bachillerato',
    seoDescription: 'Técnico laboral en auxiliar contable, sistemas y primera infancia, y bachillerato académico por ciclos. Registro oficial ante la Secretaría de Educación.',
    dataControllerName: 'Centro de Formación Laboral Demo',
    announcement: { text: 'Matrículas abiertas 2027 — técnicos y bachillerato por ciclos', link: '/admisiones', active: true },
    contact: contactoDemo('formacionlaboraldemo'),
    // En un instituto la categoría escolar se llama «Bachillerato», no
    // «Colegio»: el renombre público vive en levelLabels.
    levelLabels: { colegio: { label: 'Bachillerato' } },
  });

  await paginaInstitucional(t, {
    slug: 'conocenos',
    title: 'Conócenos',
    menuGroup: 'Institucional',
    order: 1,
    summary: 'Quiénes somos, qué nos mueve y por qué formamos para el trabajo.',
    content:
      '## Quiénes somos\n\nSomos una institución de educación para el trabajo y el desarrollo humano con más de 15 años ' +
      'formando auxiliares y técnicos que las empresas de la región realmente contratan.\n\n' +
      '## Lo que nos diferencia\n\n- Formación por competencias con práctica desde el primer módulo\n' +
      '- Horarios diurnos, nocturnos y de fin de semana\n- Sección de bachillerato por ciclos para terminar el colegio y seguir con un técnico\n\n' +
      '## Registro oficial\n\nTodos nuestros programas cuentan con registro ante la Secretaría de Educación.',
  });
  await paginaInstitucional(t, {
    slug: 'seccion-bachillerato',
    title: 'Sección bachillerato',
    menuGroup: 'Institucional',
    order: 2,
    summary: 'Bachillerato académico por ciclos para jóvenes y adultos, de noche o los sábados.',
    content:
      '## Termina tu bachillerato\n\nCon los **ciclos lectivos especiales integrados** (Decreto 3011) apruebas dos grados por ' +
      'ciclo semestral, en jornada nocturna o de fin de semana.\n\n## Articulación con los técnicos\n\nAl graduarte puedes ' +
      'continuar con cualquiera de nuestros técnicos laborales: tu ruta completa, en una sola institución.\n\n' +
      '[Ver el programa](/programas/bachillerato-por-ciclos)',
  });

  log('etdhdemo listo (3 técnicos + bachillerato por ciclos, 2 rolling, anuncio y páginas)');
}

// ---------------------------------------------------------------- 3. COLEGIO

async function seedColegio() {
  const tenant = await tenantDemo({
    slug: 'colegiodemo',
    name: 'Colegio Demo Bilingüe',
    primaryColor: '#1D4ED8',
    secondaryColor: '#DC2626',
    adminEmail: 'admin@colegiodemo.com',
  });
  const t = tenant.id;

  const per = await periodo(t, '2027', 'Año lectivo 2027', '2027-01-25', '2027-11-26');

  const niveles = [
    {
      code: 'COL-PREESC', name: 'Preescolar', slug: 'preescolar',
      level: EducationLevel.PREESCOLAR, duration: 1,
      short: 'Transición: juego, lenguaje y primeros pasos en inglés para niños de 5 años.',
      grados: [{ level: 0, label: 'Transición', capacity: 25 }],
    },
    {
      code: 'COL-PRIM', name: 'Básica primaria', slug: 'basica-primaria',
      level: EducationLevel.BASICA_PRIMARIA, duration: 5,
      short: 'De 1° a 5°: bases sólidas en lectura, matemáticas, ciencias e inglés intensivo.',
      grados: [1, 2, 3, 4, 5].map((g) => ({ level: g, label: `${g}°`, capacity: 30 })),
    },
    {
      code: 'COL-SECU', name: 'Básica secundaria', slug: 'basica-secundaria',
      level: EducationLevel.BASICA_SECUNDARIA, duration: 4,
      short: 'De 6° a 9°: pensamiento crítico, laboratorios y formación en valores.',
      grados: [6, 7, 8, 9].map((g) => ({ level: g, label: `${g}°`, capacity: 35 })),
    },
    {
      code: 'COL-MEDIA', name: 'Media académica', slug: 'media-academica',
      level: EducationLevel.MEDIA_BACHILLERATO, duration: 2,
      degree: 'Bachiller académico',
      short: '10° y 11°: profundización, preparación Saber 11 y orientación vocacional.',
      grados: [10, 11].map((g) => ({ level: g, label: `${g}°`, capacity: 35 })),
    },
  ];

  const programas: { id: string }[] = [];
  for (const n of niveles) {
    const { programa, plan } = await programaPublicado(t, {
      code: n.code,
      name: n.name,
      slug: n.slug,
      educationLevel: n.level,
      modality: Modality.PRESENCIAL,
      periodStructure: PeriodStructure.ANUAL,
      academicUnit: AcademicUnit.INTENSIDAD_HORARIA_SEMANAL,
      durationPeriods: n.duration,
      degreeTitle: (n as { degree?: string }).degree,
      officialCode: 'Licencia de funcionamiento Res. 4567 de 2019 — DANE 311001099999',
      area: 'Colegio',
      schedule: 'Jornada única 7:00 a.m. – 2:30 p.m.',
      shortDescription: n.short,
      tuitionDisplay: 'Pensión desde $520.000/mes',
    });
    programas.push(programa);

    await convocatoria(t, {
      programId: programa.id,
      academicPeriodId: per.id,
      studyPlanId: plan.id,
      name: `Admisiones ${n.name} — año lectivo 2027`,
      slug: `admisiones-2027-${n.slug}`,
      opensAt: new Date('2026-09-01'),
      closesAt: new Date('2027-01-15'),
      startsAt: new Date('2027-01-25'),
      applicationFee: 0,
      targetLevels: n.grados,
      documentos: [
        { name: 'Registro civil o tarjeta de identidad' },
        { name: 'Documento de identidad del acudiente' },
        { name: 'Último boletín de calificaciones', required: n.level !== EducationLevel.PREESCOLAR },
        { name: 'Paz y salvo del colegio anterior', required: n.level !== EducationLevel.PREESCOLAR },
      ],
    });
  }

  await sitio(t, InstitutionType.COLEGIO, {
    title: 'Un colegio donde tu hijo quiere estar',
    subtitle: 'Jornada única, inglés intensivo y cupos abiertos de preescolar a 11° para el año lectivo 2027.',
  }, {
    featuredProgramIds: programas.map((p) => p.id),
    seoTitle: 'Colegio Demo Bilingüe — Admisiones año lectivo 2027',
    seoDescription: 'Colegio bilingüe en jornada única: preescolar, primaria, secundaria y media. Admisiones abiertas para 2027.',
    dataControllerName: 'Colegio Demo Bilingüe',
    stats: [
      { value: '30', label: 'años de historia' },
      { value: 'A+', label: 'nivel ICFES' },
      { value: '100%', label: 'jornada única' },
    ],
    announcement: { text: 'Admisiones abiertas — año lectivo 2027', link: '/admisiones', active: true },
    contact: contactoDemo('colegiodemo'),
  });

  await paginaInstitucional(t, {
    slug: 'nuestro-colegio',
    title: 'Nuestro colegio',
    menuGroup: 'Institucional',
    order: 1,
    summary: 'Proyecto educativo, valores y comunidad del Colegio Demo Bilingüe.',
    content:
      '## Proyecto educativo\n\nFormamos niños y jóvenes bilingües, autónomos y felices, en jornada única y con ' +
      'grupos pequeños.\n\n## Nuestros pilares\n\n- Inglés intensivo desde preescolar\n- Formación socioemocional\n' +
      '- Deporte y artes todos los días\n- Acompañamiento cercano a las familias',
  });
  await paginaInstitucional(t, {
    slug: 'modelo-pedagogico',
    title: 'Modelo pedagógico',
    menuGroup: 'Institucional',
    order: 2,
    summary: 'Aprendizaje activo por proyectos con evaluación formativa.',
    content:
      '## Aprender haciendo\n\nTrabajamos por **proyectos interdisciplinarios** donde cada estudiante investiga, ' +
      'crea y presenta.\n\n## Evaluación formativa\n\nRetroalimentación continua en lugar de exámenes de memoria: ' +
      'el error es parte del aprendizaje.',
  });

  log('colegiodemo listo (4 niveles, convocatoria 2027 con cupos por grado)');
}

// --------------------------------------------------------------------- main

export async function seedSitioWeb() {
  await seedUniprueba();
  await seedEtdh();
  await seedColegio();
}

if (require.main === module) {
  seedSitioWeb()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
