import axiosInstance, { endpoints } from 'src/utils/axios';

export type PaymentParams = {
  page?: number;
  DoctorId?: number;
  Status?: number;
};

export type CreatePaymentData = {
  patientId: number;
  doctorId: number;
  paymentAmount: number;
  paymentMethod: number;
  AppointmentId: number;
  status: number;
  description: string;
};

export const fetchPaymentsClient = async (params: PaymentParams) => {
  const response = await axiosInstance.get(endpoints.payments.fetch, {
    params: {
      page: params?.page,
      limit: 10,
      ...(params?.DoctorId ? { DoctorId: params.DoctorId } : {}),
      ...(params?.Status ? { Status: params.Status } : {}),
    },
  });
  return response.data;
};

export const createPaymentClient = async (data: CreatePaymentData) => {
  const response = await axiosInstance.post(endpoints.payments.new, data);
  return response.data;
};

export const deletePaymentClient = async (paymentId: number) => {
  const response = await axiosInstance.delete(endpoints.payments.delete(paymentId));
  return response.data;
};
