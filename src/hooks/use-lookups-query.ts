import { useQuery } from '@tanstack/react-query';
import { fetchLookupsClient } from 'src/api/lookups';

export const lookupKeys = {
  all: ['lookups'] as const,
  lists: () => [...lookupKeys.all, 'list'] as const,
  list: (type: string) => [...lookupKeys.lists(), type] as const,
};

export const useLookups = (type: string) => {
  return useQuery({
    queryKey: lookupKeys.list(type),
    queryFn: () => fetchLookupsClient(type),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
