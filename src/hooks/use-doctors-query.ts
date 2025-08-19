import { useQuery } from '@tanstack/react-query';
import { fetchDoctorsClient } from 'src/api/doctors';

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: () => [...doctorKeys.lists()] as const,
};

export const useDoctors = () => {
  return useQuery({
    queryKey: doctorKeys.list(),
    queryFn: fetchDoctorsClient,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
