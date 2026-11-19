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
  } | null;
  whatsappNumber?: string | null;
  whatsappMessage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  analytics?: { ga4?: string; gtm?: string; metaPixel?: string; adsConversion?: string } | null;
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
