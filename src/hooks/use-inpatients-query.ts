import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  newInpatientClient,
  type InpatientData,
  editInpatientClient,
  type InpatientParams,
  fetchInpatientsClient,
  deleteInpatientClient,
} from 'src/api/inpatients';

// Query keys for caching
export const inpatientKeys = {
  all: ['inpatients'] as const,
  lists: () => [...inpatientKeys.all, 'list'] as const,
  list: (params: InpatientParams) => [...inpatientKeys.lists(), params] as const,
  details: () => [...inpatientKeys.all, 'detail'] as const,
  detail: (id: number) => [...inpatientKeys.details(), id] as const,
};

export const useInpatients = (params: InpatientParams) =>
  useQuery({
    queryKey: inpatientKeys.list(params),
    queryFn: () => fetchInpatientsClient(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

export const useDeleteInpatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInpatientClient,
    onMutate: async (inpatientId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: inpatientKeys.lists() });

      // Snapshot the previous value
      const previousInpatients = queryClient.getQueriesData({
        queryKey: inpatientKeys.lists(),
      });

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: inpatientKeys.lists() }, (old: any) => {
        if (!old || !old.data || !old.data.items) return old;

        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((inpatient: any) => inpatient.id !== inpatientId),
            totalCount: Math.max(0, (old.data.totalCount || 0) - 1),
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousInpatients };
    },
    onError: (err, inpatientId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousInpatients) {
        context.previousInpatients.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: inpatientKeys.lists() });
    },
  });
};

export const useEditInpatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reqBody, id }: { reqBody: InpatientData; id: number }) => editInpatientClient(reqBody, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inpatientKeys.lists() });
    },
  });
};

export const useNewInpatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newInpatientClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inpatientKeys.lists() });
    },
  });
};

export const useCreateInpatient = useNewInpatient;
export const useUpdateInpatient = useEditInpatient;
