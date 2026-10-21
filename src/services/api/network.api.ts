import { apiClient } from './core/client';

export interface NetworkNode {
  id: string;
  label: string;
  type: 'PERSON' | 'COMPANY' | 'OPPORTUNITY';
  contactId?: string;
  role?: string;
  company?: string;
  hasResearch?: boolean;
  researchStatus?: string;
  relationshipStrength?: number;
  reachability?: string;
  connectedSince?: string;
  isScored?: boolean;
  origin?: 'FOUNDER' | 'TARGET' | 'BHANU_CONNECTION' | string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  label: string;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  total_people?: number;
  total_companies?: number;
  total_connections?: number;
}

export interface EcosystemEvent {
  id: string;
  title: string;
  description: string;
  contactId: string;
  contactName: string;
  date: string;
  signalStrength: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CrossClientInsight {
  id: string;
  title: string;
  description: string;
  patternStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  isConfirmed: boolean;
  relatedNodesCount: number;
}

export const networkApi = {
  getGraph: (q?: string) => apiClient.get<NetworkGraph>(q ? `/api/network/graph?q=${encodeURIComponent(q)}` : '/api/network/graph'),
  getEvents: () => apiClient.get<{ events: EcosystemEvent[] }>('/api/network/events'),
  getInsights: () => apiClient.get<{ insights: CrossClientInsight[] }>('/api/network/insights'),
  triggerDeepResearch: (contactId: string) => apiClient.post<{ job_id: string; contact_id: string; status: string }>(`/api/v1/research/jobs/contact/${contactId}`, {}),
};
