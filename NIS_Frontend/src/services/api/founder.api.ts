import { apiClient } from './core/client';
import type { DecisionItem } from '../../components/intelligence/FounderDecisionQueue';

export const founderApi = {
  getDecisions: () => apiClient.get<DecisionItem[]>('/api/founder/decisions')
};
