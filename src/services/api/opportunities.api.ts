import { apiClient } from './core/client';

export type OpportunityStatus = 
  | 'CANDIDATE' 
  | 'VALIDATED' 
  | 'SOLUTION_MATCHING' 
  | 'PATH_DEFINED' 
  | 'PIPELINE' 
  | 'OUTCOME'
  | 'REJECTED'
  | 'ON_HOLD'
  | 'EXPIRED';

export interface Opportunity {
  id: string;
  title: string;
  personId: string;
  personName: string;
  companyId: string;
  companyName: string;
  relationshipId?: string | null;
  sourceMeetingId?: string | null;
  trustedContextIds: string[];
  problem: string;
  requirement: string;
  timeline?: string | null;
  budgetSignal?: string | null;
  opportunityType: string;
  confidence: number;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  lifecycleStatus?: string;

  // Detail fields
  description?: string | null;
  organizationId?: string;
  ownerUserId?: string | null;
  matchedProductId?: string | null;
  matchedProductName?: string | null;
  matchScore?: number | null;
  matchRationale?: string | null;
  supportingEvidenceIds?: string[];
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  validUntil?: string | null;
}

export interface OpportunityCreatePayload {
  title: string;
  company_name: string;
  problem: string;
  requirement: string;
  opportunity_type?: string;
  contact_id?: string;
  company_id?: string;
  description?: string;
  timeline?: string;
  budget_signal?: string;
  confidence?: number;
  status?: string;
  matched_product_id?: string;
  matched_product_name?: string;
  match_score?: number;
  match_rationale?: string;
  supporting_evidence_ids?: string[];
  trusted_context_ids?: string[];
}

export interface OpportunityValidatePayload {
  status?: 'VALIDATED' | 'QUALIFIED' | 'REJECTED' | 'ON_HOLD' | string;
  review_notes?: string;
  confirmed_problem?: string;
  confirmed_solution?: string;
}

export interface OpportunityValidationResponse {
  success: boolean;
  opportunity_id: string;
  status: string;
  message?: string;
  opportunity?: Opportunity;
}

export interface OpportunityListParams {
  status?: string;
  contact_id?: string;
  limit?: number;
  offset?: number;
}

// Downstream placeholder interfaces to prevent build errors in deferred Phase 7/8 components
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

export interface OpportunitySearchResult extends Opportunity {
  relevanceScore: number;
  matchReasons: string[];
}

export interface OpportunitySearchParams {
  q?: string;
  status?: string;
  min_confidence?: number;
  opportunity_type?: string;
  limit?: number;
  offset?: number;
}

export interface OpportunitySearchResponse {
  query: string;
  total: number;
  results: OpportunitySearchResult[];
}

export const opportunitiesApi = {
  list: (params?: OpportunityListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') {
      searchParams.set('status', params.status);
    }
    if (params?.contact_id) {
      searchParams.set('contact_id', params.contact_id);
    }
    if (params?.limit) {
      searchParams.set('limit', String(params.limit));
    }
    if (params?.offset) {
      searchParams.set('offset', String(params.offset));
    }
    const query = searchParams.toString();
    return apiClient.get<{ opportunities: Opportunity[]; total: number }>(`/api/v1/opportunities${query ? `?${query}` : ''}`);
  },

  search: (params?: OpportunitySearchParams) => {
    const searchParams = new URLSearchParams();
    if (params?.q) {
      searchParams.set('q', params.q);
    }
    if (params?.status && params.status !== 'ALL') {
      searchParams.set('status', params.status);
    }
    if (params?.min_confidence !== undefined && params.min_confidence > 0) {
      searchParams.set('min_confidence', String(params.min_confidence));
    }
    if (params?.opportunity_type && params.opportunity_type !== 'ALL') {
      searchParams.set('opportunity_type', params.opportunity_type);
    }
    if (params?.limit) {
      searchParams.set('limit', String(params.limit));
    }
    if (params?.offset) {
      searchParams.set('offset', String(params.offset));
    }
    const query = searchParams.toString();
    return apiClient.get<OpportunitySearchResponse>(`/api/v1/opportunities/search${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => apiClient.get<Opportunity>(`/api/v1/opportunities/${id}`),

  create: (payload: OpportunityCreatePayload) => apiClient.post<Opportunity>('/api/v1/opportunities', payload),

  deriveFromContact: (contactId: string) => apiClient.post<Opportunity>(`/api/v1/opportunities/derive/${contactId}`, {}),

  validate: (id: string, payload?: OpportunityValidatePayload) => 
    apiClient.patch<OpportunityValidationResponse>(`/api/v1/opportunities/${id}/validate`, payload || { status: 'VALIDATED' }),

  // Job scraping pipeline trigger & status
  triggerJobScraping: () => apiClient.post<{ success: boolean; message: string; result: any }>('/api/v1/opportunities/scrape-jobs/trigger', {}),
  getJobScrapingStatus: () => apiClient.get<{ scheduler_configured: string; is_running: boolean; last_run_at: string | null; last_summary: any; database_metrics: any }>('/api/v1/opportunities/scrape-jobs/status'),

  // Downstream legacy methods preserved
  getSolutions: (id: string) => apiClient.get<{ solutions: SolutionCandidate[] }>(`/api/opportunities/${id}/solutions`),
  setPath: (id: string, path: string) => apiClient.patch<{ success: boolean }>(`/api/opportunities/${id}/path`, { path }),
  getPipeline: () => apiClient.get<{ pipeline: OpportunityPipelineItem[] }>(`/api/opportunities/pipeline`),
  postOutcome: (id: string, outcome: string, notes: string) => apiClient.post<{ success: boolean }>(`/api/opportunities/${id}/outcome`, { outcome, notes }),
};

