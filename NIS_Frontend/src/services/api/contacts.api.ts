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
}

export const contactsApi = {
  list: () => apiClient.get<ContactOverview[]>('/api/contacts'),
  
  create: async (data: { linkedinUrl: string }) => {
    // using fetch wrapper logic
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create');
    return response.json() as Promise<{ id: string, status: string }>;
  },

  getStatus: (id: string) => apiClient.get<{ id: string, status: string }>(`/api/contacts/${id}/status`),
  
  getIdentify: (id: string) => apiClient.get<IdentifyData>(`/api/contacts/${id}/identify`),
  
  confirmIdentify: async (id: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}/api/contacts/${id}/identify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' })
    });
    if (!response.ok) throw new Error('Failed to confirm');
    return response.json();
  },

  get360: (id: string) => apiClient.get<Contact360Data>(`/api/contacts/${id}/360`),
};
