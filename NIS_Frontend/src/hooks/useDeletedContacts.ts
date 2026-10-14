import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '../services/api/contacts.api';

export const useDeletedContacts = () => {
  return useQuery({
    queryKey: ['deleted-contacts'],
    queryFn: contactsApi.getDeleted
  });
};
