import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { introductionApi } from '../services/api/introduction.api';
import type { IntroductionStatus } from '../services/api/introduction.api';

export const useIntroductionRecommendation = (opportunityId: string) => {
  return useQuery({
    queryKey: ['introduction', opportunityId],
    queryFn: () => introductionApi.getRecommendation(opportunityId),
    enabled: !!opportunityId
  });
};

export const useUpdateIntroductionDraft = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ introId, messageDraft }: { introId: string, messageDraft: string }) => 
      introductionApi.updateDraft(opportunityId, introId, messageDraft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['introduction', opportunityId] });
    }
  });
};

export const useUpdateIntroductionStatus = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ introId, status }: { introId: string, status: IntroductionStatus }) => 
      introductionApi.updateStatus(opportunityId, introId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['introduction', opportunityId] });
    }
  });
};
