import { apiClient } from './core/client';

export interface DashboardStats {
  actionRequired: number;
  researched: number;
  conversations: number;
  openOpportunities: number;
  outcomes: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
}

export const dashboardApi = {
  get: () => apiClient.get<DashboardResponse>('/api/dashboard'),
};
