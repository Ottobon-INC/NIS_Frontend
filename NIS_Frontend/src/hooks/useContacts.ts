import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '../services/api/contacts.api';

export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.list
  });
};
