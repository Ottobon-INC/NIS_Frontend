import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { networkMatchingApi } from '../services/api/networkMatching.api';
import type { NetworkMatchStatus } from '../services/api/networkMatching.api';

export const useNetworkMatches = (opportunityId: string) => {
  return useQuery({
    queryKey: ['networkMatches', opportunityId],
    queryFn: () => networkMatchingApi.getMatches(opportunityId),
    enabled: !!opportunityId
  });
};

export const useUpdateNetworkMatchStatus = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, status }: { matchId: string, status: NetworkMatchStatus }) => 
      networkMatchingApi.updateMatchStatus(opportunityId, matchId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networkMatches', opportunityId] });
    }
  });
};
