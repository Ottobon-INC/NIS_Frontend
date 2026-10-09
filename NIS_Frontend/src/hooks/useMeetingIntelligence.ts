import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingIntelligenceApi } from '../services/api/meetingIntelligence.api';
import type { ValidationStatus } from '../services/api/meetingIntelligence.api';

export const useMeetingIntelligence = (meetingId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['meetingIntelligence', meetingId],
    queryFn: () => meetingIntelligenceApi.getFindings(meetingId),
    enabled: !!meetingId
  });

  const validateFinding = useMutation({
    mutationFn: ({ findingId, status, newContent }: { findingId: string, status: ValidationStatus, newContent?: string }) => 
      meetingIntelligenceApi.validateFinding(meetingId, findingId, status, newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetingIntelligence', meetingId] });
      // Invalidate trusted context to refresh downstream
      queryClient.invalidateQueries({ queryKey: ['trustedContext'] });
    }
  });

  return {
    ...query,
    validateFinding
  };
};
