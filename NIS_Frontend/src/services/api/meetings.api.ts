import { apiClient } from './core/client';

export interface MeetingBriefData {
  id: string;
  contactId: string;
  contactName: string;
  company: string;
  objectives: string[];
  suggestedTopics: string[];
  recentSignals: string[];
  relationshipContext: string;
}

export interface CaptureStatus {
  id: string;
  status: 'PROCESSING' | 'EXTRACTED' | 'FAILED';
  opportunityId?: string;
}

export const meetingsApi = {
  getBrief: (id: string) => apiClient.get<MeetingBriefData>(`/api/meetings/${id}/brief`),
  
  capture: async (id: string, data: { transcript?: string, audioUrl?: string }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${baseUrl}/api/meetings/${id}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to upload capture');
    return response.json() as Promise<{ jobId: string }>;
  },

  getCaptureStatus: (jobId: string) => apiClient.get<CaptureStatus>(`/api/meetings/jobs/${jobId}/status`),
};
