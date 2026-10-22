import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '../services/api/opportunities.api';
import type { 
  OpportunityCreatePayload, 
  OpportunityValidatePayload, 
  OpportunityListParams,
  OpportunitySearchParams,
} from '../services/api/opportunities.api';

export const useOpportunities = (params?: OpportunityListParams) => {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => opportunitiesApi.list(params)
  });
};

export const useOpportunitySearch = (params?: OpportunitySearchParams) => {
  return useQuery({
    queryKey: ['opportunities-search', params],
    queryFn: () => opportunitiesApi.search(params)
  });
};

export const useOpportunity = (id: string) => {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => opportunitiesApi.getById(id),
    enabled: !!id
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpportunityCreatePayload) => opportunitiesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });
};

export const useDeriveOpportunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => opportunitiesApi.deriveFromContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });
};

export const useValidateOpportunity = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: OpportunityValidatePayload) => opportunitiesApi.validate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });
};
