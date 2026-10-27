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

const DEMO_RECOMMENDATION: IntroductionRecommendation = {
  id: 'intro-1',
  opportunityId: 'opp-fintech-fraud-02',
  selectedCapabilityId: 'cap-agent-gov-01',
  selectedNetworkMatchId: 'match-1',
  personId: 'recip-1',
  companyId: 'comp-1',
  trustedContextIds: ['tc-1', 'tc-2'],
  context: {
    personName: 'Priya Sharma',
    companyName: 'Horizon VC / TechCorp',
    opportunityTitle: 'Enterprise Agent Compliance Pilot',
    capabilityName: 'AI Governance Bridge',
    networkMatchName: 'Priya Sharma',
    networkMatchCompany: 'Horizon VC',
    relationshipRole: 'Strategic Syndicate Investor',
    relationshipStrength: 'Strong',
  },
  introductionReason: 'Strategic investor with deep ties to enterprise procurement leads and 10+ AI portfolio companies.',
  mutualValue: {
    howTheyHelpUs: 'Direct executive warm referral to Tier-1 CTO/CISO buying committees.',
    howWeHelpThem: 'Turnkey bounded governance bridge reducing enterprise AI compliance liabilities.'
  },
  messageDraft: 'Hi Priya,\n\nFollowing up on our exchange regarding autonomous agent governance, Ottobon has engineered a bounded, turnkey compliance bridge for enterprise AI agents on Azure and AWS.\n\nGiven Horizon VC\'s portfolio focus on mission-critical AI, we would love to connect for 15 minutes to share our 2-week pilot benchmarks.\n\nBest,\nNetworkOS Founder',
  status: 'DRAFT',
  evidenceIds: ['ev-intro-1'],
  confidence: 92,
  createdAt: '2026-03-20T10:00:00Z',
  updatedAt: '2026-03-20T10:00:00Z'
};

export const introductionApi = {
  getRecommendation: async (opportunityId: string): Promise<IntroductionRecommendation> => {
    try {
      const data = await apiClient.get<any>(`/api/opportunities/${opportunityId}/introduction`);
      if (data && typeof data === 'object') {
        return {
          id: data.id || 'intro-1',
          opportunityId: data.opportunityId || opportunityId,
          selectedCapabilityId: data.selectedCapabilityId || 'cap-1',
          selectedNetworkMatchId: data.selectedNetworkMatchId || 'match-1',
          personId: data.personId || data.recipientId || 'recip-1',
          companyId: data.companyId || 'comp-1',
          trustedContextIds: data.trustedContextIds || ['tc-1'],
          context: {
            personName: data.context?.personName || data.recipientName || 'Priya Sharma',
            companyName: data.context?.companyName || data.recipientCompany || 'Horizon VC / TechCorp',
            opportunityTitle: data.context?.opportunityTitle || 'Enterprise Agent Compliance Pilot',
            capabilityName: data.context?.capabilityName || 'AI Governance Bridge',
            networkMatchName: data.context?.networkMatchName || data.recipientName || 'Priya Sharma',
            networkMatchCompany: data.context?.networkMatchCompany || data.recipientCompany || 'Horizon VC',
            relationshipRole: data.context?.relationshipRole || 'Strategic Syndicate Investor',
            relationshipStrength: data.context?.relationshipStrength || 'Strong',
          },
          introductionReason: data.introductionReason || 'Strategic investor with deep ties to enterprise procurement leads and AI portfolio companies.',
          mutualValue: {
            howTheyHelpUs: data.mutualValue?.howTheyHelpUs || 'Direct executive warm referral to Tier-1 CTO/CISO buying committees.',
            howWeHelpThem: data.mutualValue?.howWeHelpThem || 'Turnkey bounded governance bridge reducing enterprise AI compliance liabilities.'
          },
          messageDraft: data.messageDraft || 'Hi Priya,\n\nFollowing up on our exchange regarding autonomous agent governance, we would welcome sharing our 2-week pilot benchmark.\n\nBest,\nFounder',
          status: data.status || 'DRAFT',
          evidenceIds: Array.isArray(data.evidenceIds) && data.evidenceIds.length > 0 ? data.evidenceIds : ['ev-intro-1'],
          confidence: data.confidence ?? 92,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn(`Failed to fetch introduction recommendation for ${opportunityId}, falling back to demo data:`, e);
    }
    return {
      ...DEMO_RECOMMENDATION,
      opportunityId
    };
  },
    
  updateDraft: (opportunityId: string, introId: string, messageDraft: string) => 
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/introduction/${introId}/draft`, { messageDraft }),

  updateStatus: (opportunityId: string, introId: string, status: IntroductionStatus) =>
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/introduction/${introId}/status`, { status })
};
