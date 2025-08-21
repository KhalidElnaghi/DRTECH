import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  newAppointmentClient,
  type AppointmentData,
  editAppointmentClient,
  type AppointmentParams,
  fetchAppointmentsClient,
  deleteAppointmentClient,
  cancelAppointmentClient,
  rescheduleAppointmentClient,
} from 'src/api/appointments';

// Query keys for caching
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (params: AppointmentParams) => [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...appointmentKeys.details(), id] as const,
};

export const useAppointments = (params: AppointmentParams) =>
  useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => fetchAppointmentsClient(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAppointmentClient,
    onMutate: async (appointmentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: appointmentKeys.lists() });

      // Snapshot the previous value
      const previousAppointments = queryClient.getQueriesData({
        queryKey: appointmentKeys.lists(),
      });

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: appointmentKeys.lists() }, (old: any) => {
        if (!old || !old.data || !old.data.items) return old;

        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((apt: any) => apt.id !== appointmentId),
            totalCount: Math.max(0, (old.data.totalCount || 0) - 1),
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousAppointments };
    },
    onError: (err, appointmentId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAppointments) {
        context.previousAppointments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};

export const useEditAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reqBody, id }: { reqBody: AppointmentData; id: number }) =>
      editAppointmentClient(reqBody, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};

export const useNewAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newAppointmentClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: number; reason: string }) =>
      cancelAppointmentClient(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      NewAppointmentDate,
      NewScheduledTime,
    }: {
      appointmentId: number;
      NewAppointmentDate: string;
      NewScheduledTime: string;
    }) => rescheduleAppointmentClient(appointmentId, NewAppointmentDate, NewScheduledTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
};
