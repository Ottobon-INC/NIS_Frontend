import { useQuery } from '@tanstack/react-query';
import { matchingApi, type ProblemBoardItem } from '../services/api/matching.api';

export const useProblemsBoard = () => {
  return useQuery<ProblemBoardItem[]>({
    queryKey: ['problemsBoard'],
    queryFn: () => matchingApi.getProblemsBoard(),
    staleTime: 60 * 1000,
  });
};
