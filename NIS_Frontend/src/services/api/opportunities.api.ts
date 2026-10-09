import { apiClient } from './core/client';

export type OpportunityStatus = 'CANDIDATE' | 'VALIDATED' | 'SOLUTION_MATCHING' | 'PATH_DEFINED' | 'PIPELINE' | 'OUTCOME';

export interface Opportunity {
  id: string;
  title: string;
  personId: string;
  personName: string;
  companyId: string;
  companyName: string;
  relationshipId?: string;
  sourceMeetingId?: string;
  trustedContextIds: string[];
  problem: string;
  requirement: string;
  timeline?: string;
  budgetSignal?: string;
  opportunityType: string;
  confidence: number;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
}

// Legacy interfaces to prevent build errors in deferred Phase 7/8 components
export interface SolutionCandidate {
  id: string;
  name: string;
  description: string;
  type: 'INTERNAL' | 'NETWORK' | 'HYBRID';
  matchScore: number;
  evidenceId?: string;
  trustLevel: 'FACT' | 'INFERENCE' | 'HYPOTHESIS';
}

export interface OpportunityPipelineItem {
  id: string;
  contactName: string;
  company: string;
  validatedProblem: string;
  status: string;
  nextAction: string;
}

export const opportunitiesApi = {
  list: () => apiClient.get<{ opportunities: Opportunity[] }>('/api/opportunities'),
  
  getById: (id: string) => apiClient.get<Opportunity>(`/api/opportunities/${id}`),

  validate: (id: string) => apiClient.patch<{ success: boolean }>(`/api/opportunities/${id}/validate`, { status: 'VALIDATED' }),

  // Legacy methods
  getSolutions: (id: string) => apiClient.get<{ solutions: SolutionCandidate[] }>(`/api/opportunities/${id}/solutions`),
  setPath: (id: string, path: string) => apiClient.patch<{ success: boolean }>(`/api/opportunities/${id}/path`, { path }),
  getPipeline: () => apiClient.get<{ pipeline: OpportunityPipelineItem[] }>(`/api/opportunities/pipeline`),
  postOutcome: (id: string, outcome: string, notes: string) => apiClient.post<{ success: boolean }>(`/api/opportunities/${id}/outcome`, { outcome, notes }),
};
