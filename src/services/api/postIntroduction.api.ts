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

const DEMO_POST_INTRODUCTION: PostIntroductionData = {
  opportunityId: 'opp-fintech-fraud-02',
  introductionExecution: {
    id: 'exec-1',
    opportunityId: 'opp-fintech-fraud-02',
    introductionId: 'intro-1',
    status: 'MADE',
    madeAt: '2025-01-19T14:30:00Z',
    channel: 'EMAIL',
    founderNote: 'Warm introduction email sent to Priya Sharma regarding enterprise AI governance.',
    evidenceIds: ['ev-1']
  },
  conversations: [
    {
      id: 'conv-1',
      opportunityId: 'opp-fintech-fraud-02',
      date: '2025-01-20T10:00:00Z',
      participants: ['Founder', 'Priya Sharma'],
      status: 'ACTIVE',
      founderNotes: 'Priya confirmed review of the compliance deck. Connected us to TechCorp VP of Infrastructure.',
      problemsDiscovered: ['Compliance audit log complexity', 'Azure OpenAI quota governance'],
      requirementsDiscovered: ['SOC2 Type II report', 'Turnkey deployment proxy'],
      peopleDiscovered: ['Marcus Brody (Director of SecOps)'],
      businessContext: 'High priority Q1 mandate driven by EU AI Act preparations.',
      interestProgression: 'Strong buy-in on bounded governance bridge.',
      nextStep: 'Present benchmark data to SecOps team.',
      evidenceIds: ['ev-conv-1']
    }
  ],
  outcome: null,
  feedback: null
};

export const postIntroductionApi = {
  getPostIntroductionData: async (opportunityId: string): Promise<PostIntroductionData> => {
    try {
      const data = await apiClient.get<any>(`/api/opportunities/${opportunityId}/post-introduction`);
      if (data && typeof data === 'object') {
        return {
          opportunityId: data.opportunityId || opportunityId,
          introductionExecution: data.introductionExecution || {
            id: data.introductionId ? `exec-${data.introductionId}` : 'exec-1',
            opportunityId,
            introductionId: data.introductionId || 'intro-1',
            status: data.status === 'PENDING_MEETING' ? 'MADE' : (data.status || 'MADE'),
            madeAt: data.madeAt || '2025-01-19T14:30:00Z',
            channel: data.channel || 'EMAIL',
            founderNote: data.founderNote || 'Warm introduction email sent.',
            evidenceIds: data.evidenceIds || ['ev-1']
          },
          conversations: Array.isArray(data.conversations) && data.conversations.length > 0 
            ? data.conversations 
            : DEMO_POST_INTRODUCTION.conversations,
          outcome: data.outcome || null,
          feedback: data.feedback || null
        };
      }
    } catch (e) {
      console.warn(`Failed to fetch post introduction data for ${opportunityId}, falling back to demo:`, e);
    }
    return {
      ...DEMO_POST_INTRODUCTION,
      opportunityId
    };
  },

  markIntroductionMade: (opportunityId: string, payload: Partial<IntroductionExecution>) =>
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/introduction-execution`, payload),

  addConversation: (opportunityId: string, payload: Partial<ConversationIntelligence>) =>
    apiClient.post<{ success: boolean }>(`/api/opportunities/${opportunityId}/conversations`, payload),

  updateOutcome: (opportunityId: string, payload: Partial<OutcomeIntelligence>) =>
    apiClient.patch<{ success: boolean }>(`/api/opportunities/${opportunityId}/outcome`, payload),

  submitFeedback: (opportunityId: string, payload: Omit<FeedbackIntelligence, 'id' | 'opportunityId' | 'submittedAt'>) =>
    apiClient.post<{ success: boolean }>(`/api/opportunities/${opportunityId}/feedback`, payload)
};
