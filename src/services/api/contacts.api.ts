import { apiClient } from './core/client';

export interface ContactOverview {
  id: string;
  name: string;
  title: string;
  company: string;
  status: 'PROCESSING' | 'IDENTIFIED' | 'INTELLIGENCE_READY';
  lastUpdated: string;
}

export interface IdentifyData {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  linkedinUrl: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Signal {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  confidence: number;
  evidenceId?: string;
  level: 'SIGNAL' | 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED' | 'FACT';
}

export interface Contact360Data {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  linkedinUrl: string;
  tier: string;
  personIntelligence: {
    background: string;
    expertise: string[];
    decisionInfluence: string;
  };
  companyIntelligence: {
    industry: string;
    context: string;
    growthSignals: string;
  };
  signals: Signal[];
  howTheyHelpUs: {
    role: string;
    reasoning: string;
    level: 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED';
  }[];
  howWeHelpThem: {
    need: string;
    capability: string;
    level: 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED';
  }[];
  relationship: {
    strength: string;
    type: string;
    previousInteractions: number;
    notes: string;
  };
  currentContext: {
    recentMeetings: string[];
    activeOpportunities: string[];
  };
  // Cumulative Intelligence
  currentTrustedContext?: string[];
  whatWeKnewBefore?: {
    personBackground: string;
    companyContext: string;
  };
  whatWeLearned?: {
    insights: string[];
    rawInputs: {
      id: string;
      sourceType: string;
      content: string;
      date: string;
    }[];
  };
  intelligenceHistory?: {
    id: string;
    content: string;
    sourceType: 'EXTERNAL_RESEARCH' | 'FOUNDER_CONVERSATION' | 'MEETING' | 'FOUNDER_NOTE' | 'SYSTEM_SIGNAL';
    timestamp: string;
  }[];
  evidenceList?: {
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }[];
  
  // Legacy fields for backward compatibility
  primaryRole?: string;
  relationshipStrength?: string;
  recentSignal?: string;
  full_markdown_report?: string;
  commercialIntelligence?: {
    provenanceStatus: string;
    domainName: string;
    provenDomainExpertise: string;
    isDomainSme: string;
    opportunityCategory: string;
    broadBusinessProblem: string;
    smallestSolvableProblem: string;
    whyNow: string;
    ottobonCapabilityMatch: string;
    deliveryRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    estimatedEffortHours: string;
    costPricingEstimate: string;
    proposedFirstEngagement: string;
    relationshipPath: string;
    pipelineStage: string;
    nextActionStep: string;
    sourcesUsed?: {
      source_id: string;
      reference: string;
      status: string;
    }[];
  };
}

export const contactsApi = {
  list: () => apiClient.get<ContactOverview[]>('/api/v1/contacts'),
  
  create: async (data: { linkedinUrl: string }) => {
    // 1. Create the contact
    const contact = await apiClient.post<{ id: string }>('/api/v1/contacts', {
      linkedin_url: data.linkedinUrl
    });
    
    // 2. Trigger research for the contact
    const researchRes = await apiClient.post<{ success: boolean, research_run_id: string }>(
      `/api/v1/contacts/${contact.id}/research`,
      {}
    );
    
    return { id: researchRes.research_run_id, status: 'QUEUED' };
  },

  getStatus: async (run_id: string) => {
    // Map backend research run progress to frontend expectations
    const res = await apiClient.get<{ status: string, progress: any }>(`/api/v1/research/runs/${run_id}`);
    return { id: run_id, status: res.status };
  },
  
  getIdentify: (id: string) => apiClient.get<IdentifyData>(`/api/v1/contacts/${id}/identify`),
  
  confirmIdentify: async (id: string) => {
    return apiClient.patch(`/api/v1/contacts/${id}/identify`, { status: 'CONFIRMED' });
  },

  get360: (id: string) => apiClient.get<Contact360Data>(`/api/v1/contacts/${id}/360`),

  delete: (id: string) => apiClient.delete<{ success: boolean; deleted_id?: string }>(`/api/v1/contacts/${id}`),
};
