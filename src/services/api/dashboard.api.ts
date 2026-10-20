import { apiClient } from './core/client.ts';

/**
 * Backend raw cockpit stats shape from:
 * GET /api/v1/cockpit/stats
 */
export interface BackendCockpitStats {
  pendingDecisions?: number;
  activeOpportunities?: number;
  networkNodes?: number;
  validatedNeeds?: number;
  introductionsSent?: number;
  // Legacy / alternative fields
  actionRequired?: number;
  researched?: number;
  conversations?: number;
  openOpportunities?: number;
  outcomes?: number;
}

export interface DashboardStats {
  actionRequired: number;
  researched: number;
  conversations: number;
  openOpportunities: number;
  outcomes: number;
  // Direct backend field aliases
  pendingDecisions?: number;
  activeOpportunities?: number;
  networkNodes?: number;
  validatedNeeds?: number;
  introductionsSent?: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
}

/**
 * Adapts raw backend cockpit/stats into frontend DashboardResponse.
 */
export function adaptDashboardStats(raw: BackendCockpitStats | { stats?: BackendCockpitStats } | null | undefined): DashboardResponse {
  if (!raw) {
    return {
      stats: {
        actionRequired: 0,
        researched: 0,
        conversations: 0,
        openOpportunities: 0,
        outcomes: 0,
        pendingDecisions: 0,
        activeOpportunities: 0,
        networkNodes: 0,
        validatedNeeds: 0,
        introductionsSent: 0
      }
    };
  }

  const data: BackendCockpitStats = ('stats' in raw && raw.stats) ? raw.stats : (raw as BackendCockpitStats);

  const actionRequired = data.pendingDecisions ?? data.actionRequired ?? 0;
  const openOpportunities = data.activeOpportunities ?? data.openOpportunities ?? 0;
  const researched = data.networkNodes ?? data.researched ?? 0;
  const conversations = data.introductionsSent ?? data.conversations ?? 0;
  const outcomes = data.validatedNeeds ?? data.outcomes ?? 0;

  return {
    stats: {
      actionRequired,
      researched,
      conversations,
      openOpportunities,
      outcomes,
      pendingDecisions: data.pendingDecisions ?? actionRequired,
      activeOpportunities: data.activeOpportunities ?? openOpportunities,
      networkNodes: data.networkNodes ?? researched,
      validatedNeeds: data.validatedNeeds ?? outcomes,
      introductionsSent: data.introductionsSent ?? conversations
    }
  };
}

export const dashboardApi = {
  /**
   * Fetches dashboard & cockpit metrics from the backend.
   * Primary route: /api/v1/cockpit/stats
   * Fallback route: /api/cockpit/stats
   */
  get: async (): Promise<DashboardResponse> => {
    try {
      const res = await apiClient.get<BackendCockpitStats | { stats: BackendCockpitStats }>('/api/v1/cockpit/stats');
      return adaptDashboardStats(res);
    } catch (err: any) {
      if (err?.status === 404) {
        try {
          const fallbackRes = await apiClient.get<BackendCockpitStats | { stats: BackendCockpitStats }>('/api/cockpit/stats');
          return adaptDashboardStats(fallbackRes);
        } catch (innerErr: any) {
          if (innerErr?.status === 404) {
            const legacyRes = await apiClient.get<BackendCockpitStats | { stats: BackendCockpitStats }>('/api/dashboard');
            return adaptDashboardStats(legacyRes);
          }
          throw innerErr;
        }
      }
      throw err;
    }
  }
};
