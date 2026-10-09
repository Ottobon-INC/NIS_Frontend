import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '../services/api/contacts.api';

export const useContact360 = (id: string) => {
  return useQuery({
    queryKey: ['contact360', id],
    queryFn: () => contactsApi.get360(id),
    enabled: !!id
  });
};
