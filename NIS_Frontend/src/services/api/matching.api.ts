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
  }
};
