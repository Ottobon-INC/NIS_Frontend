import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '../services/api/contacts.api';

export const useContact360 = (id: string) => {
  return useQuery({
    queryKey: ['contact360', id],
    queryFn: () => contactsApi.get360(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // If full_markdown_report is not yet ready, poll every 2.5s until ready
      if (query.state.data && !query.state.data.full_markdown_report) {
        return 2500;
      }
      return false;
    }
  });
};
