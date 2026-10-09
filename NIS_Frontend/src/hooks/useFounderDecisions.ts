import { useQuery } from '@tanstack/react-query';
import { founderApi } from '../services/api/founder.api';

export const useFounderDecisions = () => {
  return useQuery({
    queryKey: ['founder-decisions'],
    queryFn: founderApi.getDecisions
  });
};
