import { apiClient } from './core/client';

export type IntroductionExecutionStatus = 'NOT_MADE' | 'MADE' | 'DECLINED' | 'NO_RESPONSE';
export type IntroChannel = 'EMAIL' | 'LINKEDIN' | 'PHONE' | 'IN_PERSON' | 'OTHER';

export interface IntroductionExecution {
  id: string;
  opportunityId: string;
  introductionId: string;
  status: IntroductionExecutionStatus;
  madeAt?: string;
  channel?: IntroChannel;
  founderNote?: string;
  evidenceIds: string[];
}

export type ConversationState = 'NOT_STARTED' | 'ACTIVE' | 'FOLLOW_UP_REQUIRED' | 'PROGRESSING' | 'STALLED' | 'CLOSED';

export interface ConversationIntelligence {
  id: string;
  opportunityId: string;
  date: string;
  participants: string[];
  status: ConversationState;
  founderNotes: string;
  problemsDiscovered: string[];
  requirementsDiscovered: string[];
  peopleDiscovered: string[];
  businessContext: string;
  interestProgression: string;
  nextStep: string;
  followUpDate?: string;
  evidenceIds: string[];
}

export type OutcomeType = 'PENDING' | 'WON' | 'LOST' | 'NO_OPPORTUNITY' | 'NO_RESPONSE' | 'DEFERRED' | 'REQUIRES_FOLLOW_UP';

export interface OutcomeIntelligence {
  id: string;
  opportunityId: string;
  outcomeType: OutcomeType;
  whatHappened: string;
  whyItHappened: string;
  wasCapabilityMatchUseful: boolean;
  wasNetworkMatchUseful: boolean;
  wasIntroductionUseful: boolean;
  founderLearning: string;
  evidenceIds: string[];
}

export type CapabilityFeedback = 'MATCH_ACCURATE' | 'MATCH_PARTIALLY_ACCURATE' | 'MATCH_INCORRECT';
export type NetworkFeedback = 'NETWORK_MATCH_STRONG' | 'NETWORK_MATCH_WEAK';
export type IntroFeedback = 'INTRODUCTION_USEFUL' | 'INTRODUCTION_NOT_USEFUL';
export type ContextFeedback = 'CONTEXT_ACCURATE' | 'CONTEXT_NEEDS_CORRECTION';

export interface FeedbackIntelligence {
  id: string;
  opportunityId: string;
  capabilityFeedback: CapabilityFeedback;
  networkFeedback: NetworkFeedback;
  introductionFeedback: IntroFeedback;
  trustedContextFeedback: ContextFeedback;
  founderLearning: string;
  submittedAt: string;
}

export interface PostIntroductionData {
  opportunityId: string;
  introductionExecution: IntroductionExecution;
  conversations: ConversationIntelligence[];
  outcome: OutcomeIntelligence | null;
  feedback: FeedbackIntelligence | null;
}

export const postIntroductionApi = {
  getPostIntroductionData: (opportunityId: string) => 
    apiClient.get<PostIntroductionData>(`/api/opportunities/${opportunityId}/post-introduction`),

  markIntroductionMade: (opportunityId: string, payload: Partial<IntroductionExecution>) =>
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/introduction-execution`, payload),

  addConversation: (opportunityId: string, payload: Partial<ConversationIntelligence>) =>
    apiClient.post<{ success: boolean }>(`/api/opportunities/${opportunityId}/conversations`, payload),

  updateOutcome: (opportunityId: string, payload: Partial<OutcomeIntelligence>) =>
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/outcome`, payload),

  submitFeedback: (opportunityId: string, payload: Omit<FeedbackIntelligence, 'id' | 'opportunityId' | 'submittedAt'>) =>
    apiClient.post<{ success: boolean }>(`/api/opportunities/${opportunityId}/feedback`, payload)
};
