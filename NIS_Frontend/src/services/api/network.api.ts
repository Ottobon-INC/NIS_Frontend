import { apiClient } from './core/client';

export interface NetworkNode {
  id: string;
  label: string;
  type: 'PERSON' | 'COMPANY' | 'OPPORTUNITY';
}

export interface NetworkEdge {
  source: string;
  target: string;
  label: string;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
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
  getGraph: () => apiClient.get<NetworkGraph>('/api/network/graph'),
  getEvents: () => apiClient.get<{ events: EcosystemEvent[] }>('/api/network/events'),
  getInsights: () => apiClient.get<{ insights: CrossClientInsight[] }>('/api/network/insights'),
};
