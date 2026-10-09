import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trustedContextApi } from '../services/api/trustedContext.api';

export const useTrustedContext = (contactId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['trustedContext', contactId],
    queryFn: () => trustedContextApi.getForContact(contactId),
    enabled: !!contactId
  });

  const updateContext = useMutation({
    mutationFn: ({ itemId, newContent }: { itemId: string, newContent: string }) => 
      trustedContextApi.updateContext(itemId, newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trustedContext', contactId] });
    }
  });

  return {
    ...query,
    updateContext
  };
};
