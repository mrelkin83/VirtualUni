import { AdmissionCallStatus, InstitutionType, SiteMode } from '@prisma/client';
import { PublicTenantService } from './public-tenant.service';
import { PublicCatalogService } from './public-catalog.service';
import { textoDuracion, textoOtorga, rotuloIdentificador } from './textos-institucion';

/**
 * Fase 2 del sitio público. Lo que se protege aquí:
 *  - el tenant de las rutas públicas sale SOLO del Host (nada de X-Tenant-ID)
 *  - sitio despublicado = 404 genérico, salvo preview firmado y vigente
 *  - un programa ETDH jamás rotula "Título"
 *  - la ventana de una convocatoria (rolling / fechas / estado)
 */

const prismaMock = () => ({
  tenant: { findFirst: jest.fn() },
  tenantSite: { findUnique: jest.fn() },
  // La navegación del contexto (menú por categorías + páginas) consulta esto
  // en cada resolución de tenant.
  program: { findMany: jest.fn().mockResolvedValue([]) },
  sitePage: { findMany: jest.fn().mockResolvedValue([]) },
});

const TENANT = {
  id: 't1', name: 'Demo', slug: 'demo', subdomain: 'demo', customDomain: null,
  logo: null, primaryColor: '#111111', secondaryColor: '#222222', status: 'ACTIVE',
};

const SITE: { tenantId: string; published: boolean; siteMode: SiteMode; institutionType: InstitutionType } = {
  tenantId: 't1', published: true, siteMode: SiteMode.FULL,
  institutionType: InstitutionType.MIXTA,
};
const comoSite = (extra: Partial<typeof SITE> = {}) => ({ ...SITE, ...extra }) as never;

describe('PublicTenantService', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let servicio: PublicTenantService;

  beforeEach(() => {
    prisma = prismaMock();
    servicio = new PublicTenantService(prisma as never);
    process.env.JWT_SECRET = 'secreto-de-prueba';
  });

  it('resuelve el tenant por el subdominio del Host, y solo por ahí', async () => {
    prisma.tenant.findFirst.mockResolvedValue(TENANT);
    prisma.tenantSite.findUnique.mockResolvedValue(comoSite());

    const ctx = await servicio.contexto('demo.ejemplo.edu.co');
    expect(ctx?.tenant.id).toBe('t1');
    // La consulta nace del host: subdominio "demo"; no hay ningún parámetro
    // de cabecera ni de cuerpo en la firma del método.
    const where = prisma.tenant.findFirst.mock.calls[0][0].where;
    expect(JSON.stringify(where)).toContain('demo');
  });

  it('una IP desnuda no lleva subdominio: no hay sitio', async () => {
    prisma.tenant.findFirst.mockResolvedValue(null);
    const ctx = await servicio.contexto('169.58.249.64');
    expect(ctx).toBeNull();
  });

  it('sitio despublicado → null (404 genérico), sin filtrar si el tenant existe', async () => {
    prisma.tenant.findFirst.mockResolvedValue(TENANT);
    prisma.tenantSite.findUnique.mockResolvedValue(comoSite({ published: false }));
    expect(await servicio.contexto('demo.ejemplo.edu.co')).toBeNull();
  });

  it('sitio en modo OFF → null aunque esté publicado', async () => {
    prisma.tenant.findFirst.mockResolvedValue(TENANT);
    prisma.tenantSite.findUnique.mockResolvedValue(comoSite({ siteMode: SiteMode.OFF }));
    expect(await servicio.contexto('demo.ejemplo.edu.co')).toBeNull();
  });

  it('el preview firmado entra a un sitio despublicado; un token ajeno o vencido no', async () => {
    prisma.tenant.findFirst.mockResolvedValue(TENANT);
    prisma.tenantSite.findUnique.mockResolvedValue(comoSite({ published: false }));

    const token = servicio.firmarPreview('t1');
    const ctx = await servicio.contexto('demo.ejemplo.edu.co', token);
    expect(ctx?.esPreview).toBe(true);

    // Token de OTRO tenant: firma no coincide
    const ajeno = servicio.firmarPreview('otro-tenant');
    servicio.invalidar();
    expect(await servicio.contexto('demo.ejemplo.edu.co', ajeno)).toBeNull();

    // Vencido
    const [, firma] = token.split('.');
    servicio.invalidar();
    expect(await servicio.contexto('demo.ejemplo.edu.co', `1.${firma}`)).toBeNull();
  });
});

describe('PublicCatalogService.llamadaAbierta', () => {
  const servicio = new PublicCatalogService({} as never);
  const ayer = new Date(Date.now() - 86400_000);
  const maniana = new Date(Date.now() + 86400_000);

  it('abierta dentro de fechas', () => {
    expect(servicio.llamadaAbierta({ status: AdmissionCallStatus.ABIERTA, opensAt: ayer, closesAt: maniana, rolling: false })).toBe(true);
  });

  it('cerrada por fecha aunque el estado diga ABIERTA', () => {
    expect(servicio.llamadaAbierta({ status: AdmissionCallStatus.ABIERTA, opensAt: ayer, closesAt: ayer, rolling: false })).toBe(false);
  });

  it('rolling ignora el cierre', () => {
    expect(servicio.llamadaAbierta({ status: AdmissionCallStatus.ABIERTA, opensAt: ayer, closesAt: null, rolling: true })).toBe(true);
  });

  it('BORRADOR nunca está abierta', () => {
    expect(servicio.llamadaAbierta({ status: AdmissionCallStatus.BORRADOR, opensAt: ayer, closesAt: maniana, rolling: false })).toBe(false);
  });
});

describe('textos por nivel (§0.1)', () => {
  it('ETDH nunca rotula "Título", ni aunque el dato lo traiga', () => {
    expect(textoOtorga('TECNICO_LABORAL', 'Título de Técnico Laboral en X'))
      .toBe('Certificado de Técnico Laboral en X');
    expect(textoOtorga('TECNICO_LABORAL', null)).toMatch(/^Certificado/);
    expect(textoOtorga('TECNICO_LABORAL', 'Título de Técnico Laboral en X')).not.toMatch(/t[ií]tulo/i);
  });

  it('el identificador oficial se rotula según el nivel', () => {
    expect(rotuloIdentificador('TECNOLOGICO')).toBe('Código SNIES');
    expect(rotuloIdentificador('TECNICO_LABORAL')).toBe('Registro del programa');
    expect(rotuloIdentificador('BASICA_PRIMARIA')).toBe('Licencia de funcionamiento');
  });

  it('la duración sale en la unidad del programa', () => {
    expect(textoDuracion({ educationLevel: 'TECNOLOGICO', academicUnit: 'CREDITOS', periodStructure: 'SEMESTRAL', durationPeriods: 6, totalCredits: 96 }))
      .toBe('6 semestres · 96 créditos');
    expect(textoDuracion({ educationLevel: 'TECNICO_LABORAL', academicUnit: 'HORAS', periodStructure: 'MODULAR', durationPeriods: 4, totalHours: 620 }))
      .toBe('620 horas · 4 módulos');
    expect(textoDuracion({ educationLevel: 'BASICA_PRIMARIA', academicUnit: 'INTENSIDAD_HORARIA_SEMANAL', periodStructure: 'ANUAL', durationPeriods: 5 }))
      .toBe('5 grados');
  });
});
