import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postIntroductionApi } from '../services/api/postIntroduction.api';
import type { IntroductionExecution, ConversationIntelligence, OutcomeIntelligence, FeedbackIntelligence } from '../services/api/postIntroduction.api';

export const usePostIntroductionData = (opportunityId: string) => {
  return useQuery({
    queryKey: ['postIntroduction', opportunityId],
    queryFn: () => postIntroductionApi.getPostIntroductionData(opportunityId),
    enabled: !!opportunityId
  });
};

export const useMarkIntroductionMade = (opportunityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<IntroductionExecution>) => postIntroductionApi.markIntroductionMade(opportunityId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['postIntroduction', opportunityId] })
  });
};

export const useAddConversation = (opportunityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ConversationIntelligence>) => postIntroductionApi.addConversation(opportunityId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['postIntroduction', opportunityId] })
  });
};

export const useUpdateOutcome = (opportunityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<OutcomeIntelligence>) => postIntroductionApi.updateOutcome(opportunityId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['postIntroduction', opportunityId] })
  });
};

export const useSubmitFeedback = (opportunityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<FeedbackIntelligence, 'id' | 'opportunityId' | 'submittedAt'>) => postIntroductionApi.submitFeedback(opportunityId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['postIntroduction', opportunityId] })
  });
};
