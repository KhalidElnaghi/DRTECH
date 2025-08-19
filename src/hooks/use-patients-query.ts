import { useQuery } from '@tanstack/react-query';
import { fetchPatientsClient } from 'src/api/patients';

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: () => [...patientKeys.lists()] as const,
};

export const usePatients = () => {
  return useQuery({
    queryKey: patientKeys.list(),
    queryFn: fetchPatientsClient,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
