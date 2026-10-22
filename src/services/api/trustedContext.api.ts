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

export interface TrustedContextCreatePayload {
  contact_id?: string;
  type?: 'PROBLEM' | 'REQUIREMENT' | 'PERSON' | 'SIGNAL';
  content: string;
  evidence?: string;
  source_meeting_id?: string;
  confidence?: number;
}

export const trustedContextApi = {
  getForContact: (contactId: string) => 
    apiClient.get<{ items: TrustedContextItem[] }>(`/api/contacts/${contactId}/trusted-context`),
    
  createForContact: (contactId: string, payload: TrustedContextCreatePayload) =>
    apiClient.post<TrustedContextItem>(`/api/contacts/${contactId}/trusted-context`, payload),

  updateContext: (itemId: string, newContent: string) => 
    apiClient.patch<{ success: boolean; item?: TrustedContextItem }>(`/api/trusted-context/${itemId}`, { content: newContent }),

  deleteContext: (itemId: string) =>
    apiClient.delete<{ success: boolean }>(`/api/trusted-context/${itemId}`),
};
