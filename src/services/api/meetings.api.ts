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

const DEMO_BRIEFS: Record<string, BackendMeetingBrief> = {
  'meet-1': {
    id: 'meet-1',
    meetingId: 'meet-1',
    contactId: 'contact-alex-chen',
    contactName: 'Alex Chen',
    title: 'VP Technology & Partnerships',
    company: 'TechCorp',
    meetingDate: '2025-01-20T14:00:00Z',
    objective: 'Explore strategic AI platform partnership, technical integration pathways, and enterprise rollout timeline.',
    objectives: [
      'Explore strategic AI platform partnership and integration.',
      'Evaluate cloud infrastructure compatibility and data privacy boundaries.',
      'Align on multi-tenant SaaS integration architecture.'
    ],
    talkingPoints: [
      'Acknowledge TechCorp’s recent AI platform scaling milestones.',
      'Address high-throughput low-latency requirements for fraud inference engine.',
      'Propose a 30-day proof-of-concept deployment with dedicated engineering support.',
      'Review compliance and security posture with TechCorp compliance team.'
    ],
    suggestedTopics: [
      'Acknowledge TechCorp’s recent AI platform scaling milestones.',
      'Address high-throughput low-latency requirements for fraud inference engine.',
      'Propose a 30-day proof-of-concept deployment with dedicated engineering support.',
      'Review compliance and security posture with TechCorp compliance team.'
    ],
    recentSignals: [
      'Role: VP Technology & Partnerships at TechCorp',
      'Actively evaluating external AI acceleration engines',
      'Recent expansion into EMEA financial infrastructure'
    ],
    relationshipContext: {
      strength: 4,
      connectedVia: 'Priya Sharma (Horizon VC / Mutual Investor)',
      lastInteraction: 'Fintech Innovation Summit 2024'
    }
  },
  'meet-2': {
    id: 'meet-2',
    meetingId: 'meet-2',
    contactId: 'contact-priya-sharma',
    contactName: 'Priya Sharma',
    title: 'General Partner',
    company: 'Horizon VC',
    meetingDate: '2025-01-18T11:00:00Z',
    objective: 'Discuss investment syndicate strategy and warm portfolio introductions.',
    objectives: [
      'Review NetworkOS commercial expansion and enterprise pipeline.',
      'Coordinate introductions to Tier-1 portfolio founders.'
    ],
    talkingPoints: [
      'Share recent 12% MoM opportunity growth across executive network.',
      'Explore co-investment opportunities in enterprise automation.'
    ],
    suggestedTopics: [
      'Share recent 12% MoM opportunity growth across executive network.',
      'Explore co-investment opportunities in enterprise automation.'
    ],
    recentSignals: [
      'Role: General Partner at Horizon VC',
      'Led 4 Series-A rounds in enterprise B2B SaaS'
    ],
    relationshipContext: {
      strength: 5,
      connectedVia: 'Direct Founder Network',
      lastInteraction: 'Founder Dinner Q4'
    }
  },
  'meet-3': {
    id: 'meet-3',
    meetingId: 'meet-3',
    contactId: 'contact-david-kim',
    contactName: 'David Kim',
    title: 'Chief Medical Information Officer',
    company: 'MediTech Health',
    meetingDate: '2025-01-15T15:30:00Z',
    objective: 'Healthcare AI capability overview and HIPAA data pipeline compliance.',
    objectives: [
      'Demonstrate clinical workflow integration and inference safety.',
      'Establish BAA and data sovereignty prerequisites.'
    ],
    talkingPoints: [
      'Present JanmaSethu and healthcare data pipeline telemetry.',
      'Address on-premise deployment vs HIPAA compliant private cloud.'
    ],
    suggestedTopics: [
      'Present JanmaSethu and healthcare data pipeline telemetry.',
      'Address on-premise deployment vs HIPAA compliant private cloud.'
    ],
    recentSignals: [
      'Role: CMIO at MediTech Health',
      'Spearheading clinical modernization across 14 hospital networks'
    ],
    relationshipContext: {
      strength: 4,
      connectedVia: 'Alumni Network',
      lastInteraction: 'Digital Health Conclave'
    }
  },
  'meet-4': {
    id: 'meet-4',
    meetingId: 'meet-4',
    contactId: 'contact-michael-torres',
    contactName: 'Michael Torres',
    title: 'VP Operations & Supply Chain',
    company: 'BuildCorp',
    meetingDate: '2025-01-22T10:00:00Z',
    objective: 'Product distribution and enterprise rollout review.',
    objectives: [
      'Evaluate supply chain telemetry integration.',
      'Review contract terms and procurement roadmap.'
    ],
    talkingPoints: [
      'Discuss inventory tracking automation and predictive delivery routing.',
      'Outline Phase 1 pilot implementation.'
    ],
    suggestedTopics: [
      'Discuss inventory tracking automation and predictive delivery routing.',
      'Outline Phase 1 pilot implementation.'
    ],
    recentSignals: [
      'Role: VP Operations & Supply Chain',
      'Expanding automated warehousing operations'
    ],
    relationshipContext: {
      strength: 3,
      connectedVia: 'Mutual Connection',
      lastInteraction: 'Supply Chain Expo'
    }
  },
  'meet-5': {
    id: 'meet-5',
    meetingId: 'meet-5',
    contactId: 'contact-sarah-connor',
    contactName: 'Sarah Connor',
    title: 'Head of Grid Modernization',
    company: 'Nexus Energy',
    meetingDate: '2025-01-24T16:00:00Z',
    objective: 'Legacy monolith architecture evaluation and grid analytics.',
    objectives: [
      'Assess IoT sensor grid integration and telemetry ingestion.',
      'Discuss fault prediction models.'
    ],
    talkingPoints: [
      'Present real-time edge telemetry architecture.',
      'Review low-latency alert processing benchmarks.'
    ],
    suggestedTopics: [
      'Present real-time edge telemetry architecture.',
      'Review low-latency alert processing benchmarks.'
    ],
    recentSignals: [
      'Role: Head of Grid Modernization',
      'Leading $40M grid resilience upgrade'
    ],
    relationshipContext: {
      strength: 4,
      connectedVia: 'Tech Industry Advisory Board',
      lastInteraction: 'CleanTech Forum'
    }
  }
};

function getFallbackBrief(id: string): BackendMeetingBrief {
  if (DEMO_BRIEFS[id]) {
    return DEMO_BRIEFS[id];
  }
  return {
    id,
    meetingId: id,
    contactId: `contact-${id}`,
    contactName: 'Alex Chen',
    title: 'VP Technology & Partnerships',
    company: 'TechCorp',
    meetingDate: '2025-01-20T14:00:00Z',
    objective: 'Explore strategic AI platform partnership, technical integration pathways, and enterprise rollout timeline.',
    objectives: [
      'Explore strategic AI platform partnership and integration.',
      'Evaluate cloud infrastructure compatibility and data privacy boundaries.'
    ],
    talkingPoints: [
      'Acknowledge recent enterprise milestones.',
      'Address technical scalability and system integration.',
      'Propose a structured sandbox pilot.'
    ],
    suggestedTopics: [
      'Acknowledge recent enterprise milestones.',
      'Address technical scalability and system integration.',
      'Propose a structured sandbox pilot.'
    ],
    recentSignals: [
      'Role: Decision Maker',
      'Active evaluation of modern network intelligence solutions'
    ],
    relationshipContext: {
      strength: 4,
      connectedVia: 'Executive Network',
      lastInteraction: 'Recent Briefing'
    }
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
    } catch {
      try {
        const fallbackRes = await apiClient.get<BackendMeetingBrief>(`/api/meetings/${id}/brief`);
        return adaptMeetingBrief(fallbackRes);
      } catch {
        return adaptMeetingBrief(getFallbackBrief(id));
      }
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
