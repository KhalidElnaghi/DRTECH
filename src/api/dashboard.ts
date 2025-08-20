import axiosInstance, { endpoints } from 'src/utils/axios';

export const fetchDashboardSummaryClient = async () => {
  const response = await axiosInstance.get(endpoints.dashboard.summary);
  return response.data;
};

export const fetchDashboardUpcomingAppointmentsClient = async (params?: { limit?: number }) => {
  const response = await axiosInstance.get(endpoints.dashboard.upcomingAppointments, {
    params: { limit: params?.limit ?? 100 },
  });
  console.log(response);

  return response.data;
};

export const fetchDashboardPatientsStatisticsClient = async () => {
  const response = await axiosInstance.get(endpoints.dashboard.patientsStatistics);
  return response.data;
};

export const fetchDashboardPatientsClient = async (params?: { limit?: number; page?: number }) => {
  const response = await axiosInstance.get(endpoints.dashboard.patients, {
    params: { limit: params?.limit ?? 10, page: params?.page ?? 1 },
  });
  return response.data;
};
