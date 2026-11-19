import { apiClient } from '../client';

// Debe calcar backend/src/modules/public-api (panel Integraciones, §13.6).

export interface ResumenIntegraciones {
  tenant: {
    slug: string; subdomain: string; customDomain?: string | null;
    enableEmbed: boolean; enablePublicApi: boolean;
  };
  embedAllowedOrigins: string[];
  siteMode: string;
  scopes: { publishable: string[]; secret: string[] };
  eventos: string[];
}

export interface LlaveApi {
  id: string; name: string; type: 'PUBLISHABLE' | 'SECRET'; prefix: string;
  testMode: boolean; scopes: string[]; allowedOrigins: string[];
  lastUsedAt?: string | null; revokedAt?: string | null; createdAt: string;
  /** Solo viene al CREAR o ROTAR: única vez que se ve completa. */
  llave?: string;
}

export interface WebhookFila {
  id: string; url: string; events: string[]; active: boolean; failureCount: number; createdAt: string;
  secreto?: string; // solo al crear
}

export interface EntregaWebhook {
  id: string; eventType: string; attempt: number; responseCode?: number | null;
  lastError?: string | null; deliveredAt?: string | null; nextAttemptAt?: string | null; createdAt: string;
}

const BASE = '/api/v1/integraciones';

export const integracionesApi = {
  resumen: async () => (await apiClient.get<ResumenIntegraciones>(BASE)).data,
  // llaves
  llaves: async () => (await apiClient.get<LlaveApi[]>(`${BASE}/llaves`)).data,
  crearLlave: async (data: { name: string; type: string; testMode?: boolean; allowedOrigins?: string[] }) =>
    (await apiClient.post<LlaveApi>(`${BASE}/llaves`, data)).data,
  rotarLlave: async (id: string) => (await apiClient.post<LlaveApi>(`${BASE}/llaves/${id}/rotar`, {})).data,
  revocarLlave: async (id: string) => (await apiClient.delete<LlaveApi[]>(`${BASE}/llaves/${id}`)).data,
  // webhooks
  webhooks: async () => (await apiClient.get<WebhookFila[]>(`${BASE}/webhooks`)).data,
  crearWebhook: async (data: { url: string; events: string[] }) =>
    (await apiClient.post<WebhookFila>(`${BASE}/webhooks`, data)).data,
  actualizarWebhook: async (id: string, data: { active?: boolean; events?: string[]; url?: string }) =>
    (await apiClient.patch<WebhookFila[]>(`${BASE}/webhooks/${id}`, data)).data,
  eliminarWebhook: async (id: string) => (await apiClient.delete<WebhookFila[]>(`${BASE}/webhooks/${id}`)).data,
  entregas: async (id: string) => (await apiClient.get<EntregaWebhook[]>(`${BASE}/webhooks/${id}/entregas`)).data,
  prueba: async (id: string) => (await apiClient.post<EntregaWebhook[]>(`${BASE}/webhooks/${id}/prueba`, {})).data,
  reenviar: async (deliveryId: string) =>
    (await apiClient.post<EntregaWebhook[]>(`${BASE}/entregas/${deliveryId}/reenviar`, {})).data,
  // widget
  embedOrigins: async (origins: string[]) =>
    (await apiClient.patch<ResumenIntegraciones>(`${BASE}/embed-origins`, { origins })).data,
};
