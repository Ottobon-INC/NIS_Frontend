import { apiClient } from './core/client';
import type { Capability } from './capabilities.api';

export type NetworkMatchType = 'INTERNAL' | 'NETWORK' | 'HYBRID';
export type MatchDimensionLevel = 'STRONG' | 'MODERATE' | 'WEAK' | 'UNKNOWN';
export type NetworkMatchStatus = 'CANDIDATE' | 'SELECTED' | 'REJECTED';
export type AvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'UNKNOWN';

export interface NetworkMatch {
  id: string;
  opportunityId: string;
  capabilityId: string;
  candidateId: string;
  candidateName: string;
  candidateTitle: string;
  candidateCompany: string;
  matchType: NetworkMatchType;
  status: NetworkMatchStatus;
  
  dimensions: {
    relevance: MatchDimensionLevel;
    expertise: MatchDimensionLevel;
    relationshipStrength: MatchDimensionLevel;
    industryFit: MatchDimensionLevel;
    geography: MatchDimensionLevel;
    availability: AvailabilityStatus;
  };
  
  reasoning: string;
  evidenceIds: string[]; // Ties back to Meeting, Contact, or specific intelligence
  confidence: number;
}

export const networkMatchingApi = {
  getMatches: (opportunityId: string) => 
    apiClient.get<{ matches: NetworkMatch[], selectedCapability?: Capability }>(`/api/opportunities/${opportunityId}/network-matches`),
    
  updateMatchStatus: (opportunityId: string, matchId: string, status: NetworkMatchStatus) => 
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/network-matches/${matchId}`, { status })
};
