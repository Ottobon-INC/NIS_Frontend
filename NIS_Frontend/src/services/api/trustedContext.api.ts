import { apiClient } from './core/client';

export interface TrustedContextVersion {
  version: number;
  content: string;
  timestamp: string;
}

export interface TrustedContextItem {
  id: string;
  contactId: string;
  type: 'PROBLEM' | 'REQUIREMENT' | 'PERSON';
  currentVersion: number;
  content: string;
  evidence: string;
  sourceMeetingId: string;
  history: TrustedContextVersion[];
}

export const trustedContextApi = {
  getForContact: (contactId: string) => 
    apiClient.get<{ items: TrustedContextItem[] }>(`/api/contacts/${contactId}/trusted-context`),
    
  updateContext: (itemId: string, newContent: string) => 
    apiClient.patch<{ success: boolean }>(`/api/trusted-context/${itemId}`, { content: newContent })
};
