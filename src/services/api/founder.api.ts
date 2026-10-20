import { apiClient } from './core/client.ts';
import type { DecisionItem, DecisionType } from '../../components/intelligence/FounderDecisionQueue.tsx';

/**
 * Raw data shape returned by backend cockpit queue endpoint:
 * GET /api/v1/cockpit/queue
 */
export interface BackendDecisionQueueItem {
  id: string;
  type?: string;
  priority?: string;
  title?: string;
  subtitle?: string;
  reason?: string;
  actionUrl?: string;
  createdAt?: string;
  // Legacy or explicit fields
  personId?: string;
  companyId?: string;
  opportunityId?: string;
  personName?: string;
  companyName?: string;
  relatedEntityName?: string;
  description?: string;
  whyItMatters?: string;
  evidenceSummary?: string;
  confidence?: number;
  status?: string;
  primaryActionLabel?: string;
}

export type BackendCockpitQueueResponse =
  | { queue?: BackendDecisionQueueItem[] }
  | BackendDecisionQueueItem[]
  | null
  | undefined;

/**
 * Maps backend decision type to frontend DecisionType union.
 */
export function mapBackendDecisionType(backendType?: string): DecisionType {
  const normalized = (backendType || '').toUpperCase().trim();
  switch (normalized) {
    case 'OPPORTUNITY_VALIDATION':
    case 'VALIDATION_REQUIRED':
      return 'VALIDATION_REQUIRED';
    case 'NETWORK_MATCH_APPROVAL':
    case 'MATCH_REVIEW_REQUIRED':
      return 'MATCH_REVIEW_REQUIRED';
    case 'INTRODUCTION_REVIEW':
    case 'INTRODUCTION_REVIEW_REQUIRED':
      return 'INTRODUCTION_REVIEW_REQUIRED';
    case 'OUTCOME_REVIEW':
    case 'OUTCOME_REVIEW_REQUIRED':
      return 'OUTCOME_REVIEW_REQUIRED';
    default:
      return 'VALIDATION_REQUIRED';
  }
}

/**
 * Typed adapter converting a raw backend queue item into frontend DecisionItem.
 */
export function adaptFounderDecisionItem(item: BackendDecisionQueueItem): DecisionItem {
  if (!item) {
    return {
      id: '',
      type: 'VALIDATION_REQUIRED',
      title: 'Pending Decision',
      description: '',
      personName: 'Key Contact',
      companyName: 'Target Account',
      whyItMatters: 'Strategic attention required.',
      evidenceSummary: 'Derived from intelligence signals',
      confidence: 80,
      status: 'PENDING',
      primaryActionLabel: 'Review'
    };
  }

  const resolvedType = mapBackendDecisionType(item.type);

  // Parse person and company from subtitle ("Name · Company") or fall back cleanly
  let personName = item.personName || '';
  let companyName = item.companyName || '';
  if (!personName || !companyName) {
    if (item.subtitle && item.subtitle.includes('·')) {
      const parts = item.subtitle.split('·');
      personName = personName || parts[0].trim();
      companyName = companyName || parts[1].trim();
    } else if (item.subtitle) {
      personName = personName || item.subtitle.trim();
      companyName = companyName || 'Target Organization';
    } else {
      personName = 'Executive Contact';
      companyName = 'Target Organization';
    }
  }

  // Derive default action label based on type
  let defaultActionLabel = 'Take Action';
  if (resolvedType === 'VALIDATION_REQUIRED') {
    defaultActionLabel = 'Review & Validate';
  } else if (resolvedType === 'MATCH_REVIEW_REQUIRED') {
    defaultActionLabel = 'Review Candidate Match';
  } else if (resolvedType === 'INTRODUCTION_REVIEW_REQUIRED') {
    defaultActionLabel = 'Review Introduction Draft';
  } else if (resolvedType === 'OUTCOME_REVIEW_REQUIRED') {
    defaultActionLabel = 'Review Outcome';
  }

  // Derive confidence from priority if not provided directly
  let resolvedConfidence = typeof item.confidence === 'number' ? item.confidence : 80;
  if (typeof item.confidence !== 'number' && item.priority) {
    const prio = item.priority.toUpperCase();
    if (prio === 'HIGH') resolvedConfidence = 92;
    else if (prio === 'MEDIUM') resolvedConfidence = 84;
    else if (prio === 'LOW') resolvedConfidence = 72;
  }

  const resolvedDescription = item.description || item.reason || item.title || 'Decision pending in inbox.';
  const resolvedWhyItMatters = item.whyItMatters || item.reason || (item.priority ? `${item.priority} priority founder review required.` : 'Strategic founder alignment required.');
  const resolvedEvidence = item.evidenceSummary || (item.actionUrl ? `Action target: ${item.actionUrl}` : 'Derived from intelligence signals');

  return {
    id: item.id || '',
    type: resolvedType,
    title: item.title || 'Founder Attention Item',
    description: resolvedDescription,
    personId: item.personId,
    companyId: item.companyId,
    opportunityId: item.opportunityId,
    personName,
    companyName,
    relatedEntityName: item.relatedEntityName || item.subtitle || companyName,
    whyItMatters: resolvedWhyItMatters,
    evidenceSummary: resolvedEvidence,
    confidence: resolvedConfidence,
    status: item.status || 'PENDING',
    primaryActionLabel: item.primaryActionLabel || defaultActionLabel,
    actionUrl: item.actionUrl
  };
}

/**
 * Normalizes both direct array and wrapped { queue: [...] } responses into DecisionItem[].
 */
export function adaptFounderDecisionQueue(raw: BackendCockpitQueueResponse): DecisionItem[] {
  if (!raw) return [];

  let list: BackendDecisionQueueItem[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (Array.isArray(raw.queue)) {
    list = raw.queue;
  }

  return list.map(adaptFounderDecisionItem);
}

export const founderApi = {
  /**
   * Fetches pending founder decision items from real backend cockpit queue.
   * Endpoint: /api/v1/cockpit/queue
   */
  getDecisions: async (): Promise<DecisionItem[]> => {
    try {
      const res = await apiClient.get<BackendCockpitQueueResponse>('/api/v1/cockpit/queue');
      return adaptFounderDecisionQueue(res);
    } catch (err: any) {
      if (err?.status === 404) {
        const fallbackRes = await apiClient.get<BackendCockpitQueueResponse>('/api/cockpit/queue');
        return adaptFounderDecisionQueue(fallbackRes);
      }
      throw err;
    }
  }
};
