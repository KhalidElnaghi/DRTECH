import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDoctorsClient,
  createDoctorClient,
  updateDoctorClient,
  deleteDoctorClient,
  fetchSpecializationsClient,
} from 'src/api/doctors';
import { ICreateDoctor, IUpdateDoctor } from 'src/types/doctors';

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (filters: any) => [...doctorKeys.lists(), filters] as const,
  specializations: () => [...doctorKeys.all, 'specializations'] as const,
};

export const useDoctors = (
  filters: {
    page?: number;
    SearchTerm?: string;
    Status?: number;
    specializationId?: number;
  } = {}
) =>
  useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => fetchDoctorsClient(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useSpecializations = () =>
  useQuery({
    queryKey: doctorKeys.specializations(),
    queryFn: fetchSpecializationsClient,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateDoctor) => createDoctorClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Create doctor mutation error:', error);
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateDoctor }) => updateDoctorClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Update doctor mutation error:', error);
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDoctorClient(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });

      // Return the success data for use in components
      return data;
    },
    onError: (error: any) => {
      console.error('Delete doctor mutation error:', error);
    },
  });
};
