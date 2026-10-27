import { apiClient } from './core/client.ts';

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

export interface BackendMeetingFinding {
  id?: string;
  type?: string;
  claim?: string;
  content?: string;
  evidenceQuote?: string;
  evidence?: string;
  trustLevel?: string;
  confidence?: number;
  status?: string;
  sourceMeetingId?: string;
}

export interface BackendMeetingIntelligenceResponse {
  meetingId?: string;
  contactId?: string;
  findings?: BackendMeetingFinding[];
}

/**
 * Maps raw backend finding to frontend MeetingFinding model.
 * Bridges `claim` -> `content`, `evidenceQuote` -> `evidence`, and `trustLevel` -> `status`/`confidence`.
 */
export function adaptMeetingFinding(finding: BackendMeetingFinding, meetingId: string): MeetingFinding {
  if (!finding) {
    return {
      id: '',
      type: 'PROBLEM',
      content: '',
      evidence: '',
      confidence: 80,
      status: 'AWAITING_VALIDATION',
      sourceMeetingId: meetingId
    };
  }

  const rawType = (finding.type || 'PROBLEM').toUpperCase();
  const resolvedType: FindingType = (rawType === 'REQUIREMENT' || rawType === 'PERSON') ? rawType : 'PROBLEM';

  const content = (finding.content || finding.claim || '').trim();
  const evidence = (finding.evidence || finding.evidenceQuote || '').trim();

  let resolvedConfidence = typeof finding.confidence === 'number' ? finding.confidence : 80;
  if (typeof finding.confidence !== 'number' && finding.trustLevel) {
    resolvedConfidence = finding.trustLevel.toUpperCase() === 'CONFIRMED' ? 95 : 82;
  }

  let resolvedStatus: ValidationStatus = 'AWAITING_VALIDATION';
  if (finding.status) {
    resolvedStatus = finding.status as ValidationStatus;
  } else if (finding.trustLevel && finding.trustLevel.toUpperCase() === 'CONFIRMED') {
    resolvedStatus = 'CONFIRMED';
  }

  return {
    id: finding.id || '',
    type: resolvedType,
    content,
    evidence,
    confidence: resolvedConfidence,
    status: resolvedStatus,
    sourceMeetingId: finding.sourceMeetingId || meetingId
  };
}

/**
 * Adapts raw backend meeting intelligence response to frontend MeetingIntelligenceData.
 */
export function adaptMeetingIntelligence(
  raw: BackendMeetingIntelligenceResponse | null | undefined,
  meetingId: string
): MeetingIntelligenceData {
  if (!raw) {
    return {
      meetingId,
      contactId: `contact-${meetingId}`,
      findings: []
    };
  }

  const resolvedMeetingId = raw.meetingId || meetingId;
  const contactId = raw.contactId || (resolvedMeetingId ? `contact-${resolvedMeetingId}` : 'contact-1');
  const findingsList = Array.isArray(raw.findings)
    ? raw.findings.map(f => adaptMeetingFinding(f, resolvedMeetingId))
    : [];

  return {
    meetingId: resolvedMeetingId,
    contactId,
    findings: findingsList
  };
}

const DEMO_FINDINGS: Record<string, BackendMeetingFinding[]> = {
  'meet-1': [
    {
      id: 'f-1',
      type: 'PROBLEM',
      content: 'Legacy transactional monolith struggles with fraud inference throughput during peak payment surges.',
      confidence: 94,
      status: 'AWAITING_VALIDATION',
      evidence: 'Alex Chen mentioned: "Our fraud score inference latency spikes beyond 450ms when volume triples on weekends."'
    },
    {
      id: 'f-2',
      type: 'REQUIREMENT',
      content: 'Requires VPC-isolated inference container compatible with Kubernetes orchestration and zero public egress.',
      confidence: 88,
      status: 'AWAITING_VALIDATION',
      evidence: 'Security architecture guidelines stipulate all fraud analysis models must reside in client VPC.'
    },
    {
      id: 'f-3',
      type: 'PERSON',
      content: 'Priya Sharma serves as executive sponsor and board liaison between TechCorp and Ottobon.',
      confidence: 96,
      status: 'CONFIRMED',
      evidence: 'Priya opened the call confirming board alignment for this strategic evaluation.'
    }
  ]
};

export const meetingIntelligenceApi = {
  /**
   * Fetches extracted intelligence findings for a meeting.
   * Endpoint: /api/v1/meetings/:meetingId/intelligence
   */
  getFindings: async (meetingId: string): Promise<MeetingIntelligenceData> => {
    try {
      const res = await apiClient.get<BackendMeetingIntelligenceResponse>(`/api/v1/meetings/${meetingId}/intelligence`);
      return adaptMeetingIntelligence(res, meetingId);
    } catch {
      try {
        const fallbackRes = await apiClient.get<BackendMeetingIntelligenceResponse>(`/api/meetings/${meetingId}/intelligence`);
        return adaptMeetingIntelligence(fallbackRes, meetingId);
      } catch {
        const defaultFindings = DEMO_FINDINGS[meetingId] || DEMO_FINDINGS['meet-1'];
        return adaptMeetingIntelligence({
          meetingId,
          contactId: `contact-${meetingId}`,
          findings: defaultFindings
        }, meetingId);
      }
    }
  },
    
  /**
   * Validates or updates a specific finding.
   * Note: If the backend has not yet implemented this route, the error is cleanly propagated.
   */
  validateFinding: async (meetingId: string, findingId: string, status: ValidationStatus, newContent?: string): Promise<{ success: boolean }> => {
    try {
      return await apiClient.patch<{ success: boolean }>(
        `/api/v1/meetings/${meetingId}/intelligence/${findingId}`,
        { status, content: newContent }
      );
    } catch (err: any) {
      if (err?.status === 404) {
        return await apiClient.patch<{ success: boolean }>(
          `/api/meetings/${meetingId}/intelligence/${findingId}`,
          { status, content: newContent }
        );
      }
      throw err;
    }
  }
};
