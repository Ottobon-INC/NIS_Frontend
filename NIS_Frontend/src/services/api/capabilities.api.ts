import { apiClient } from './core/client';

export type CapabilityCategory = 'PRODUCT' | 'SERVICE' | 'EXPERTISE' | 'SOLUTION';
export type MatchAlignment = 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
export type CapabilityMatchStatus = 'CANDIDATE' | 'SELECTED' | 'REJECTED';

export interface Capability {
  id: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  relevantExpertise: string[];
  evidenceSource: string;
}

export interface CapabilityMatch {
  id: string;
  opportunityId: string;
  capabilityId: string;
  capability: Capability;
  status: CapabilityMatchStatus;
  reasoning: {
    problemAlignment: MatchAlignment;
    requirementAlignment: MatchAlignment;
    technologyAlignment: MatchAlignment;
    industryAlignment: MatchAlignment;
    overallExplanation: string;
  };
  evidenceIds: string[]; // typically referencing trusted context
  confidence: number;
}

export const capabilitiesApi = {
  list: () => apiClient.get<{ capabilities: Capability[] }>('/api/capabilities'),
  getById: (id: string) => apiClient.get<Capability>(`/api/capabilities/${id}`)
};

export const capabilityMatchingApi = {
  getMatches: (opportunityId: string) => apiClient.get<{ matches: CapabilityMatch[] }>(`/api/opportunities/${opportunityId}/capability-matches`),
  updateMatchStatus: (opportunityId: string, matchId: string, status: CapabilityMatchStatus) => 
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/capability-matches/${matchId}`, { status })
};
