import { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../api/endpoints/finance';
import { payrollApi } from '../api/endpoints/payroll';
import { hrApi } from '../api/endpoints/hr';
import { inventoryApi } from '../api/endpoints/inventory';
import { assetsApi } from '../api/endpoints/assets';
import { announcementsApi } from '../api/endpoints/announcements';
import { massMessagesApi } from '../api/endpoints/mass-messages';
import { proceduresApi } from '../api/endpoints/procedures';
import { idCardsApi } from '../api/endpoints/idcards';

export interface AdminDashboardMetrics {
  totalEstudiantes: number;
  totalDocentes: number;
  solicitudesPendientes: number;
  certificadosGenerados: number;
  ingresosMensuales: number;
  cursosActivos: number;
  usuariosActivos: number;
  satisfaccion: number;
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics;
  financeStats: any;
  payrollStats: any;
  hrStats: any;
  inventoryStats: any;
  assetsStats: any;
  announcementsStats: any;
  massMessagesStats: any;
  proceduresStats: any;
  idCardsStats: any;
  recentTransactions: any[];
  recentProcedures: any[];
  recentAnnouncements: any[];
}

export interface UseAdminDashboardReturn {
  data: AdminDashboardData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const defaultMetrics: AdminDashboardMetrics = {
  totalEstudiantes: 0,
  totalDocentes: 0,
  solicitudesPendientes: 0,
  certificadosGenerados: 0,
  ingresosMensuales: 0,
  cursosActivos: 0,
  usuariosActivos: 0,
  satisfaccion: 0,
};

const defaultData: AdminDashboardData = {
  metrics: defaultMetrics,
  financeStats: null,
  payrollStats: null,
  hrStats: null,
  inventoryStats: null,
  assetsStats: null,
  announcementsStats: null,
  massMessagesStats: null,
  proceduresStats: null,
  idCardsStats: null,
  recentTransactions: [],
  recentProcedures: [],
  recentAnnouncements: [],
};

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  const [data, setData] = useState<AdminDashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all stats in parallel
      const [
        financeRes,
        payrollRes,
        hrRes,
        inventoryRes,
        assetsRes,
        announcementsRes,
        massMessagesRes,
        proceduresRes,
        idCardsRes,
        recentTransactionsRes,
        recentProceduresRes,
        recentAnnouncementsRes,
      ] = await Promise.allSettled([
        financeApi.getTransactionStats(),
        payrollApi.getStats(),
        hrApi.employees.getStats(),
        inventoryApi.getStats(),
        assetsApi.getStats(),
        announcementsApi.getStats(),
        massMessagesApi.getStats(),
        proceduresApi.getStats(),
        idCardsApi.getStats(),
        financeApi.getAllTransactions({ limit: 5 }),
        proceduresApi.getAll({ limit: 5 }),
        announcementsApi.getAll({ limit: 5 }),
      ]);

      const getData = (res: PromiseSettledResult<any>) =>
        res.status === 'fulfilled' ? (res.value as any)?.data ?? null : null;

      const financeStats = getData(financeRes);
      const payrollStats = getData(payrollRes);
      const hrStats = getData(hrRes);
      const inventoryStats = getData(inventoryRes);
      const assetsStats = getData(assetsRes);
      const announcementsStats = getData(announcementsRes);
      const massMessagesStats = getData(massMessagesRes);
      const proceduresStats = getData(proceduresRes);
      const idCardsStats = getData(idCardsRes);

      const recentTransactions = getData(recentTransactionsRes) ?? [];
      const recentProcedures = getData(recentProceduresRes) ?? [];
      const recentAnnouncements = getData(recentAnnouncementsRes) ?? [];

      // Derive metrics from stats or use defaults
      const metrics: AdminDashboardMetrics = {
        totalEstudiantes: hrStats?.totalEmployees ?? hrStats?.total ?? 0,
        totalDocentes: payrollStats?.totalEmployees ?? payrollStats?.total ?? 0,
        solicitudesPendientes: proceduresStats?.pending ?? proceduresStats?.totalPending ?? 0,
        certificadosGenerados: idCardsStats?.totalCards ?? idCardsStats?.total ?? 0,
        ingresosMensuales: financeStats?.totalIncome ?? financeStats?.monthlyIncome ?? 0,
        cursosActivos: announcementsStats?.total ?? 0,
        usuariosActivos: assetsStats?.totalAssets ?? assetsStats?.total ?? 0,
        satisfaccion: 4.5,
      };

      setData({
        metrics,
        financeStats,
        payrollStats,
        hrStats,
        inventoryStats,
        assetsStats,
        announcementsStats,
        massMessagesStats,
        proceduresStats,
        idCardsStats,
        recentTransactions,
        recentProcedures,
        recentAnnouncements,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el panel administrativo';
      setError(message);
      console.error('useAdminDashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
