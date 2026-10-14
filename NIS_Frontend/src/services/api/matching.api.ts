import { apiClient } from './core/client';

export interface MatchReason {
  title: string;
  description: string;
  evidenceId?: string;
}

export interface NetworkMatchDetail {
  id: string;
  opportunityId: string;
  candidateName: string;
  candidateCompany: string;
  matchScore: number;
  relationshipStrength: 'STRONG' | 'MEDIUM' | 'WEAK';
  capabilityFit: 'HIGH' | 'MEDIUM' | 'LOW';
  strategicRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: MatchReason[];
  status: 'RECOMMENDED' | 'REVIEW_REQUIRED' | 'FOUNDER_APPROVED' | 'FOUNDER_REJECTED';
}

export interface ProductMatchItem {
  product_id: string;
  product_name: string;
  category: string;
  tagline: string;
  match_score: number;
  alignment_level: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
  addressed_problem: string;
  why_this_product_solves_it: string;
  relevant_features: string[];
  target_audience_fit: string;
  assumptions_or_prerequisites: string[];
  suggested_first_step: string;
}

export interface SemanticProductMatchResponse {
  connection_id?: string;
  connection_name?: string;
  connection_company?: string;
  connection_title?: string;
  identified_problem: string;
  problem_domain: string;
  matching_outcome: 'MATCH_FOUND' | 'NO_MATCH_FOUND' | 'INSUFFICIENT_INFORMATION' | 'NEEDS_VALIDATION';
  suggested_status: string; // e.g. "MATCH FOUND: JanmaSethu", "No matches found", "Insufficient Information", "Needs Validation"
  matches: ProductMatchItem[];
  rationale: string;
  relevant_evidence?: string[];
  supported_capabilities?: string[];
  missing_information?: string[];
  unverified_hypotheses?: string[];
  validation_questions?: string[];
  recommended_next_step?: string;
  capability_gap?: string;
}

export const matchingApi = {
  getMatchDetail: (id: string) => apiClient.get<NetworkMatchDetail>(`/api/network/matches/${id}`),

  approveMatch: async (id: string, action: 'APPROVE' | 'REJECT') => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}/api/network/matches/${id}/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!response.ok) throw new Error('Failed to approve match');
    return response.json();
  },

  semanticMatchConnection: (contactId: string) => 
    apiClient.get<SemanticProductMatchResponse>(`/api/v1/matching/connections/${contactId}/semantic-product-match`),

  semanticMatchProblem: (problemText: string, metadata?: { connection_name?: string; connection_company?: string; connection_title?: string; connection_id?: string }) =>
    apiClient.post<SemanticProductMatchResponse>('/api/v1/matching/semantic-product-match', {
      problem_text: problemText,
      ...metadata
    })
};

