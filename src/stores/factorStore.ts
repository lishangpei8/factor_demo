import { create } from 'zustand';
import type { Factor, FactorListResponse, FactorPerformance, DashboardSummary, FactorListParams } from '@/types/factor';

interface FactorState {
  // Factor list
  factors: Factor[];
  total: number;
  loading: boolean;
  params: FactorListParams;
  setParams: (params: Partial<FactorListParams>) => void;
  fetchFactors: () => Promise<void>;

  // Factor detail
  currentFactor: Factor | null;
  performance: FactorPerformance[];
  detailLoading: boolean;
  fetchFactorDetail: (id: string) => Promise<void>;
  fetchPerformance: (id: string) => Promise<void>;

  // Dashboard
  dashboard: DashboardSummary | null;
  dashboardLoading: boolean;
  fetchDashboard: () => Promise<void>;

  // Register
  registerLoading: boolean;
  registerFactor: (data: Record<string, unknown>) => Promise<boolean>;
}

export const useFactorStore = create<FactorState>((set, get) => ({
  factors: [],
  total: 0,
  loading: false,
  params: { page: 1, pageSize: 20, search: '', type: '', status: '', sortField: '', sortOrder: undefined },

  setParams: (newParams) => {
    set((state) => ({ params: { ...state.params, ...newParams } }));
  },

  fetchFactors: async () => {
    set({ loading: true });
    try {
      const { params } = get();
      const query = new URLSearchParams();
      query.set('page', String(params.page));
      query.set('pageSize', String(params.pageSize));
      if (params.search) query.set('search', params.search);
      if (params.type) query.set('type', params.type);
      if (params.status) query.set('status', params.status);
      if (params.sortField) query.set('sortField', params.sortField);
      if (params.sortOrder) query.set('sortOrder', params.sortOrder);

      const res = await fetch(`/api/factors?${query.toString()}`);
      const data: FactorListResponse = await res.json();
      set({ factors: data.data, total: data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  currentFactor: null,
  performance: [],
  detailLoading: false,

  fetchFactorDetail: async (id: string) => {
    set({ detailLoading: true, currentFactor: null });
    try {
      const res = await fetch(`/api/factors/${id}`);
      const data: Factor = await res.json();
      set({ currentFactor: data, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  fetchPerformance: async (id: string) => {
    try {
      const res = await fetch(`/api/factors/${id}/performance`);
      const data: FactorPerformance[] = await res.json();
      set({ performance: data });
    } catch {
      // ignore
    }
  },

  dashboard: null,
  dashboardLoading: false,

  fetchDashboard: async () => {
    set({ dashboardLoading: true });
    try {
      const res = await fetch('/api/dashboard/summary');
      const data: DashboardSummary = await res.json();
      set({ dashboard: data, dashboardLoading: false });
    } catch {
      set({ dashboardLoading: false });
    }
  },

  registerLoading: false,

  registerFactor: async (data) => {
    set({ registerLoading: true });
    try {
      const res = await fetch('/api/factors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      set({ registerLoading: false });
      return res.ok;
    } catch {
      set({ registerLoading: false });
      return false;
    }
  },
}));
