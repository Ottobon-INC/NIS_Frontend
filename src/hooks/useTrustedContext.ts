import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trustedContextApi } from '../services/api/trustedContext.api';

import type { TrustedContextCreatePayload } from '../services/api/trustedContext.api';

export const useTrustedContext = (contactId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['trustedContext', contactId],
    queryFn: () => trustedContextApi.getForContact(contactId),
    enabled: !!contactId
  });

  const createContext = useMutation({
    mutationFn: (payload: TrustedContextCreatePayload) =>
      trustedContextApi.createForContact(contactId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trustedContext', contactId] });
    }
  });

  const updateContext = useMutation({
    mutationFn: ({ itemId, newContent }: { itemId: string, newContent: string }) => 
      trustedContextApi.updateContext(itemId, newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trustedContext', contactId] });
    }
  });

  const deleteContext = useMutation({
    mutationFn: (itemId: string) => trustedContextApi.deleteContext(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trustedContext', contactId] });
    }
  });

  return {
    ...query,
    createContext,
    updateContext,
    deleteContext,
  };
};
