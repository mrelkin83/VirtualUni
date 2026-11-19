import { apiClient } from '../client';

// Debe calcar backend/src/modules/public-site/dto/site-admin.dto.ts
// (ValidationPipe con forbidNonWhitelisted: un campo de más tumba el PUT).

export interface HeroSlide {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  overlay?: number;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
}

export interface SitioConfig {
  id: string;
  institutionType: string;
  published: boolean;
  siteMode: 'FULL' | 'ADMISSIONS_ONLY' | 'OFF';
  externalWebsiteUrl?: string | null;
  heroSlides: HeroSlide[];
  showHeroSearch: boolean;
  sections: { order: string[]; hidden: string[] };
  benefits?: { icon?: string; title: string; text: string }[] | null;
  stats?: { value: string; label: string }[] | null;
  featuredProgramIds: string[];
  levelLabels?: Record<string, { label?: string; hidden?: boolean }> | null;
  contact?: {
    direccion?: string; telefono?: string; email?: string; horario?: string; mapa?: string;
    redes?: { facebook?: string; instagram?: string; youtube?: string; tiktok?: string; x?: string; linkedin?: string };
  } | null;
  /** Banner superior tipo «Matrículas abiertas 2027». */
  announcement?: { text: string; link?: string; active?: boolean } | null;
  whatsappNumber?: string | null;
  whatsappMessage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  analytics?: { ga4?: string; gtm?: string; metaPixel?: string; adsConversion?: string } | null;
  paymentInstructions?: string | null;
  privacyPolicy?: string | null;
  privacyPolicyUrl?: string | null;
  privacyVersion: string;
  dataControllerName?: string | null;
}

export interface SitioRespuesta {
  site: SitioConfig;
  programas: { id: string; name: string; slug?: string | null; isPublished: boolean; educationLevel: string }[];
  diccionario: Record<string, { inscripciones: string; ofertaTitulo: string }>;
  categorias: Record<string, string>;
  previewToken: string;
}

const BASE = '/api/v1/admin/sitio-web';

export const sitioWebApi = {
  obtener: async () => (await apiClient.get<SitioRespuesta>(BASE)).data,
  guardar: async (data: Partial<SitioConfig>) =>
    (await apiClient.put<SitioConfig>(BASE, data)).data,
};

// ----- Páginas institucionales (Conócenos, Bienestar, Calidad…)

export interface PaginaSitio {
  id: string;
  slug: string;
  title: string;
  menuGroup: string;
  order: number;
  summary?: string | null;
  content: string;
  imageUrl?: string | null;
  isPublished: boolean;
  updatedAt: string;
}

export type GuardarPagina = Omit<PaginaSitio, 'id' | 'updatedAt'>;

export const paginasSitioApi = {
  listar: async () => (await apiClient.get<PaginaSitio[]>(`${BASE}/paginas`)).data,
  crear: async (data: GuardarPagina) => (await apiClient.post<PaginaSitio>(`${BASE}/paginas`, data)).data,
  actualizar: async (id: string, data: GuardarPagina) =>
    (await apiClient.put<PaginaSitio>(`${BASE}/paginas/${id}`, data)).data,
  eliminar: async (id: string) => (await apiClient.delete<PaginaSitio[]>(`${BASE}/paginas/${id}`)).data,
};

// ----- Wompi por institución (las llaves son write-only)

export interface WompiEstado {
  publicKey: string | null;
  integrityConfigurada: boolean;
  eventsConfigurada: boolean;
  testMode: boolean;
  active: boolean;
  urlWebhook: string;
}

const WOMPI = '/api/v1/admissions/pagos-wompi';

export const wompiTenantApi = {
  estado: async () => (await apiClient.get<WompiEstado>(WOMPI)).data,
  guardar: async (data: {
    publicKey?: string; integrityKey?: string; eventsKey?: string;
    testMode?: boolean; active?: boolean;
  }) => (await apiClient.put<WompiEstado>(WOMPI, data)).data,
};
