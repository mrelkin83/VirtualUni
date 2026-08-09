import apiClient from '../client';
import { Tenant } from '../../types/api.types';

const TENANTS_BASE = '/api/v1/tenants';

export const tenantsApi = {
  /**
   * Get tenant by subdomain
   */
  async getBySubdomain(subdomain: string): Promise<Tenant> {
    const response = await apiClient.get<Tenant>(`${TENANTS_BASE}/by-subdomain/${subdomain}`);
    return response.data;
  },

  /**
   * Get current tenant (using tenant ID from headers)
   */
  async getCurrent(): Promise<Tenant> {
    const response = await apiClient.get<Tenant>(`${TENANTS_BASE}/current`);
    return response.data;
  },

  /**
   * Get tenant by ID
   */
  async getById(id: string): Promise<Tenant> {
    const response = await apiClient.get<Tenant>(`${TENANTS_BASE}/${id}`);
    return response.data;
  },

  /**
   * Update tenant
   */
  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const response = await apiClient.patch<Tenant>(`${TENANTS_BASE}/${id}`, data);
    return response.data;
  },
};
