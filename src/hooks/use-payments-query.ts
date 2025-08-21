import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPaymentClient,
  deletePaymentClient,
  fetchPaymentsClient,
  type CreatePaymentData,
  type PaymentParams,
} from 'src/api/payments';

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params: PaymentParams) => [...paymentKeys.lists(), params] as const,
};

export const usePayments = (params: PaymentParams) =>
  useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => fetchPaymentsClient(params),
    staleTime: 2 * 60 * 1000,
  });

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentData) => createPaymentClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePaymentClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};
