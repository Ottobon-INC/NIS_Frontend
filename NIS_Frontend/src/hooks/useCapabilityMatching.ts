import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { capabilityMatchingApi } from '../services/api/capabilities.api';
import type { CapabilityMatchStatus } from '../services/api/capabilities.api';

export const useCapabilityMatches = (opportunityId: string) => {
  return useQuery({
    queryKey: ['capabilityMatches', opportunityId],
    queryFn: () => capabilityMatchingApi.getMatches(opportunityId),
    enabled: !!opportunityId
  });
};

export const useUpdateMatchStatus = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, status }: { matchId: string, status: CapabilityMatchStatus }) => 
      capabilityMatchingApi.updateMatchStatus(opportunityId, matchId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capabilityMatches', opportunityId] });
    }
  });
};
