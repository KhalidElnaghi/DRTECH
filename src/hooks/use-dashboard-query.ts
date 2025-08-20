import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardSummaryClient,
  fetchDashboardUpcomingAppointmentsClient,
  fetchDashboardPatientsStatisticsClient,
  fetchDashboardPatientsClient,
} from 'src/api/dashboard';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  upcomingAppointments: (params?: { limit?: number }) =>
    [...dashboardKeys.all, 'upcoming-appointments', params] as const,
  patientsStatistics: () => [...dashboardKeys.all, 'patients-statistics'] as const,
  patients: (params?: { limit?: number }) => [...dashboardKeys.all, 'patients', params] as const,
};

export const useDashboardSummary = () =>
  useQuery({ queryKey: dashboardKeys.summary(), queryFn: fetchDashboardSummaryClient });

export const useDashboardUpcomingAppointments = (params?: { limit?: number }) =>
  useQuery({
    queryKey: dashboardKeys.upcomingAppointments(params),
    queryFn: () => fetchDashboardUpcomingAppointmentsClient(params),
    staleTime: 60 * 1000,
  });

export const useDashboardPatientsStatistics = () =>
  useQuery({
    queryKey: dashboardKeys.patientsStatistics(),
    queryFn: fetchDashboardPatientsStatisticsClient,
    staleTime: 5 * 60 * 1000,
  });

export const useDashboardPatients = (params?: { limit?: number; page?: number }) =>
  useQuery({
    queryKey: dashboardKeys.patients(params),
    queryFn: () => fetchDashboardPatientsClient(params),
    staleTime: 60 * 1000,
  });
