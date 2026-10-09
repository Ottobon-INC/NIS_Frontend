import { useQuery } from '@tanstack/react-query';
import { capabilitiesApi } from '../services/api/capabilities.api';

export const useCapabilities = () => {
  return useQuery({
    queryKey: ['capabilities'],
    queryFn: () => capabilitiesApi.list()
  });
};

export const useCapability = (id: string) => {
  return useQuery({
    queryKey: ['capability', id],
    queryFn: () => capabilitiesApi.getById(id),
    enabled: !!id
  });
};
