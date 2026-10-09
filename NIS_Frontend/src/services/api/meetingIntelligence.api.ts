import { apiClient } from './core/client';

export type ValidationStatus = 'AWAITING_VALIDATION' | 'CONFIRMED' | 'REJECTED' | 'EDITED';
export type FindingType = 'PROBLEM' | 'REQUIREMENT' | 'PERSON';

export interface MeetingFinding {
  id: string;
  type: FindingType;
  content: string;
  evidence: string;
  confidence: number;
  status: ValidationStatus;
  sourceMeetingId: string;
}

export interface MeetingIntelligenceData {
  meetingId: string;
  contactId: string;
  findings: MeetingFinding[];
}

export const meetingIntelligenceApi = {
  getFindings: (meetingId: string) => 
    apiClient.get<MeetingIntelligenceData>(`/api/meetings/${meetingId}/intelligence`),
    
  validateFinding: (meetingId: string, findingId: string, status: ValidationStatus, newContent?: string) => 
    apiClient.patch<{ success: boolean }>(`/api/meetings/${meetingId}/intelligence/${findingId}`, { status, content: newContent })
};
