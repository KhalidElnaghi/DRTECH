import axiosInstance, { endpoints } from 'src/utils/axios';

export interface AppointmentParams {
  page: number;
  DoctorName?: string;
  AppointmentDate?: string;
  Status?: string;
}

export interface AppointmentData {
  PatientId: number;
  DoctorId: number;
  AppointmentDate: string;
  ScheduledTime?: string;
  ServiceType?: number;
  Status: number;
  ClinicName: string;
  ClinicLocation: {
    lat: number;
    lng: number;
    location: string;
  };
  Notes?: string;
}

export const fetchAppointmentsClient = async (params: AppointmentParams) => {
  const response = await axiosInstance.get(endpoints.appointments.fetch, {
    params: {
      page: params.page,
      limit: 10,
      DoctorName: params.DoctorName || '',
      AppointmentDate: params.AppointmentDate || '',
      Status: params.Status || '',
    },
  });
  return response.data;
};

export const deleteAppointmentClient = async (appointmentId: number) => {
  const response = await axiosInstance.delete(
    endpoints.appointments.deleteAppointment(appointmentId)
  );
  return response.data;
};

export const editAppointmentClient = async (reqBody: AppointmentData, id: number) => {
  const response = await axiosInstance.put(endpoints.appointments.edit(id), reqBody);
  return response.data;
};

export const newAppointmentClient = async (reqBody: AppointmentData) => {
  const response = await axiosInstance.post(endpoints.appointments.new, reqBody);
  return response.data;
};

export const cancelAppointmentClient = async (appointmentId: number, reason: string) => {
  const response = await axiosInstance.put(`/appointments/${appointmentId}/cancel`, { reason });
  return response.data;
};
