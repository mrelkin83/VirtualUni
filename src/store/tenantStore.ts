import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant } from '../types/api.types';
import { tenantsApi } from '../api/endpoints/tenants';

interface TenantState {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTenant: (tenant: Tenant) => void;
  loadTenantBySubdomain: (subdomain: string) => Promise<void>;
  loadCurrentTenant: () => Promise<void>;
  clearTenant: () => void;
  clearError: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenant: null,
      isLoading: false,
      error: null,

      setTenant: (tenant) => set({ tenant, error: null }),

      loadTenantBySubdomain: async (subdomain) => {
        set({ isLoading: true, error: null });
        try {
          const tenant = await tenantsApi.getBySubdomain(subdomain);
          set({ tenant, isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage =
            error.message || 'Error al cargar la información del tenant';
          set({ error: errorMessage, isLoading: false, tenant: null });
          throw error;
        }
      },

      loadCurrentTenant: async () => {
        set({ isLoading: true, error: null });
        try {
          const tenant = await tenantsApi.getCurrent();
          set({ tenant, isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage =
            error.message || 'Error al cargar la información del tenant';
          set({ error: errorMessage, isLoading: false, tenant: null });
          throw error;
        }
      },

      clearTenant: () => set({ tenant: null, error: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({
        tenant: state.tenant,
      }),
    }
  )
);
