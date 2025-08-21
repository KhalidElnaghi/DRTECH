import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  archivePatient,
  fetchPatientsDropdownClient,
} from 'src/api/patients';

import { PatientData, PatientParams } from 'src/types/patient';

export const usePatients = (params: PatientParams) =>
  useQuery({
    queryKey: ['patients', params],
    queryFn: () => fetchPatients(params),
  });

export const usePatientsDropdown = () =>
  useQuery({
    queryKey: ['patients', 'dropdown'],
    queryFn: fetchPatientsDropdownClient,
    staleTime: 10 * 60 * 1000,
  });

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      enqueueSnackbar('Patient created successfully', { variant: 'success' });
      router.push('/dashboard/patients');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || 'Failed to create patient', { variant: 'error' });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientData }) => updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      enqueueSnackbar('Patient updated successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || 'Failed to update patient', { variant: 'error' });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      enqueueSnackbar('Patient deleted successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || 'Failed to delete patient', { variant: 'error' });
    },
  });
};

export const useArchivePatient = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: archivePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      enqueueSnackbar('Patient archived successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || 'Failed to archive patient', { variant: 'error' });
    },
  });
};
