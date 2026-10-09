import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '../services/api/opportunities.api';

export const useOpportunities = () => {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: () => opportunitiesApi.list()
  });
};

export const useOpportunity = (id: string) => {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => opportunitiesApi.getById(id),
    enabled: !!id
  });
};

export const useValidateOpportunity = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => opportunitiesApi.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });
};
