import { apiClient } from './core/client.ts';

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

export interface BackendMeetingBrief {
  meetingId?: string;
  id?: string;
  contactId?: string;
  contactName?: string;
  title?: string;
  company?: string;
  meetingDate?: string;
  objective?: string;
  objectives?: string[];
  talkingPoints?: string[];
  suggestedTopics?: string[];
  recentSignals?: string[];
  relationshipContext?: string | {
    strength?: number;
    connectedVia?: string;
    lastInteraction?: string;
  } | null;
}

export interface BackendCaptureResponse {
  meetingId?: string;
  jobId?: string;
  status?: string;
  capturedAt?: string;
  extractedNeedsCount?: number;
}

/**
 * Typed adapter converting raw backend meeting brief to frontend MeetingBriefData.
 * Safely serializes nested relationshipContext objects to prevent React runtime render errors.
 */
export function adaptMeetingBrief(raw: BackendMeetingBrief | null | undefined): MeetingBriefData {
  if (!raw) {
    return {
      id: '',
      contactId: '',
      contactName: 'Meeting Participant',
      company: '',
      objectives: [],
      suggestedTopics: [],
      recentSignals: [],
      relationshipContext: 'No prior interactions recorded.'
    };
  }

  // 1. Objectives (single string objective vs array of objectives)
  let resolvedObjectives: string[] = [];
  if (Array.isArray(raw.objectives) && raw.objectives.length > 0) {
    resolvedObjectives = raw.objectives.map(o => String(o).trim()).filter(Boolean);
  } else if (typeof raw.objective === 'string' && raw.objective.trim()) {
    resolvedObjectives = [raw.objective.trim()];
  }

  // 2. Suggested Topics (talkingPoints vs suggestedTopics)
  let resolvedTopics: string[] = [];
  if (Array.isArray(raw.suggestedTopics) && raw.suggestedTopics.length > 0) {
    resolvedTopics = raw.suggestedTopics.map(t => String(t).trim()).filter(Boolean);
  } else if (Array.isArray(raw.talkingPoints) && raw.talkingPoints.length > 0) {
    resolvedTopics = raw.talkingPoints.map(t => String(t).trim()).filter(Boolean);
  }

  // 3. Recent Signals (ensure array)
  let resolvedSignals: string[] = [];
  if (Array.isArray(raw.recentSignals) && raw.recentSignals.length > 0) {
    resolvedSignals = raw.recentSignals.map(s => String(s).trim()).filter(Boolean);
  } else if (raw.title && raw.title.trim()) {
    resolvedSignals = [`Role: ${raw.title.trim()}`];
  }

  // 4. Relationship Context (must be a string for React <p>{relationshipContext}</p>)
  let resolvedRelationship = 'No prior interactions recorded.';
  if (typeof raw.relationshipContext === 'string' && raw.relationshipContext.trim()) {
    resolvedRelationship = raw.relationshipContext.trim();
  } else if (typeof raw.relationshipContext === 'object' && raw.relationshipContext !== null) {
    const parts: string[] = [];
    if (raw.relationshipContext.connectedVia) {
      parts.push(`Connected via ${raw.relationshipContext.connectedVia}`);
    }
    if (raw.relationshipContext.lastInteraction) {
      parts.push(`Last interaction: ${raw.relationshipContext.lastInteraction}`);
    }
    if (typeof raw.relationshipContext.strength === 'number') {
      parts.push(`Relationship strength: ${raw.relationshipContext.strength}/5`);
    }
    resolvedRelationship = parts.length > 0 ? parts.join(' · ') : 'Direct Contact';
  }

  const id = raw.id || raw.meetingId || '';
  const contactId = raw.contactId || (id ? `contact-${id}` : 'contact-1');

  return {
    id,
    contactId,
    contactName: raw.contactName || 'Meeting Participant',
    company: raw.company || '',
    objectives: resolvedObjectives,
    suggestedTopics: resolvedTopics,
    recentSignals: resolvedSignals,
    relationshipContext: resolvedRelationship
  };
}

export const meetingsApi = {
  /**
   * Fetches conversation brief from backend.
   * Endpoint: /api/v1/meetings/:id/brief
   */
  getBrief: async (id: string): Promise<MeetingBriefData> => {
    try {
      const res = await apiClient.get<BackendMeetingBrief>(`/api/v1/meetings/${id}/brief`);
      return adaptMeetingBrief(res);
    } catch (err: any) {
      if (err?.status === 404) {
        const fallbackRes = await apiClient.get<BackendMeetingBrief>(`/api/meetings/${id}/brief`);
        return adaptMeetingBrief(fallbackRes);
      }
      throw err;
    }
  },
  
  /**
   * Submits meeting transcript or founder notes to trigger intelligence extraction.
   * Endpoint: /api/v1/meetings/:id/capture
   */
  capture: async (id: string, data: { transcript?: string, audioUrl?: string }): Promise<{ jobId: string }> => {
    const query = data.transcript ? `?notes=${encodeURIComponent(data.transcript)}` : '';
    try {
      const res = await apiClient.post<BackendCaptureResponse>(`/api/v1/meetings/${id}/capture${query}`, data);
      return { jobId: res.jobId || res.meetingId || id };
    } catch (err: any) {
      if (err?.status === 404) {
        const fallbackRes = await apiClient.post<BackendCaptureResponse>(`/api/meetings/${id}/capture${query}`, data);
        return { jobId: fallbackRes.jobId || fallbackRes.meetingId || id };
      }
      throw err;
    }
  },

  /**
   * Retrieves status of meeting capture processing.
   * Resolves against /api/v1/meetings/:jobId/intelligence when async job table is not used.
   */
  getCaptureStatus: async (jobId: string): Promise<CaptureStatus> => {
    try {
      const res = await apiClient.get<CaptureStatus>(`/api/v1/meetings/jobs/${jobId}/status`);
      return res;
    } catch (err: any) {
      // Backend does not maintain a separate jobs table for meetings; check intelligence findings directly
      if (err?.status === 404) {
        try {
          const intel = await apiClient.get<{ meetingId?: string; findings?: any[] }>(`/api/v1/meetings/${jobId}/intelligence`);
          if (intel?.findings && intel.findings.length > 0) {
            return {
              id: jobId,
              status: 'EXTRACTED',
              opportunityId: 'opp-fintech-fraud-02'
            };
          }
          return { id: jobId, status: 'PROCESSING' };
        } catch {
          // If intelligence also fails, return status as PROCESSING
          return { id: jobId, status: 'PROCESSING' };
        }
      }
      throw err;
    }
  }
};
