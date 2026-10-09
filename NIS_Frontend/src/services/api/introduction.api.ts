import { apiClient } from './core/client';

export type IntroductionStatus = 'DRAFT' | 'FOUNDER_EDITED' | 'READY_FOR_APPROVAL' | 'APPROVED_FOR_INTRODUCTION' | 'REJECTED';

export interface IntroductionContext {
  personName: string;
  companyName: string;
  opportunityTitle: string;
  capabilityName: string;
  networkMatchName: string;
  networkMatchCompany: string;
  relationshipRole: string;
  relationshipStrength: string;
}

export interface MutualValue {
  howTheyHelpUs: string;
  howWeHelpThem: string;
}

export interface IntroductionRecommendation {
  id: string;
  opportunityId: string;
  selectedCapabilityId: string;
  selectedNetworkMatchId: string;
  personId: string;
  companyId: string;
  trustedContextIds: string[];
  
  context: IntroductionContext;
  
  introductionReason: string;
  mutualValue: MutualValue;
  
  messageDraft: string;
  status: IntroductionStatus;
  
  evidenceIds: string[];
  confidence: number;
  
  createdAt: string;
  updatedAt: string;
}

export const introductionApi = {
  getRecommendation: (opportunityId: string) => 
    apiClient.get<IntroductionRecommendation>(`/api/opportunities/${opportunityId}/introduction`),
    
  updateDraft: (opportunityId: string, introId: string, messageDraft: string) => 
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/introduction/${introId}/draft`, { messageDraft }),

  updateStatus: (opportunityId: string, introId: string, status: IntroductionStatus) =>
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/introduction/${introId}/status`, { status })
};
