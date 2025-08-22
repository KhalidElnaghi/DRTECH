'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Skeleton } from '@mui/material';

import { useSettingsContext } from 'src/components/settings';
import {
  useDashboardSummary,
  useDashboardPatientsStatistics,
  useDashboardUpcomingAppointments,
  useDashboardPatients,
} from 'src/hooks/use-dashboard-query';

import DashboardSummary from './components/dashboard-summary';
import PatientsStatistics from './components/patients-statistics';
import UpcomingAppointments from './components/upcoming-appointments';
import DashboardPatientsTable from './components/dashboard-patients-table';
import LoadingOverlay from './components/loading-overlay';

// ----------------------------------------------------------------------
// type IProps = {};

export default function MainPage() {
  const settings = useSettingsContext();

  // Check if any of the dashboard data is loading
  const summaryQuery = useDashboardSummary();
  const patientsStatsQuery = useDashboardPatientsStatistics({ period: 'monthly' });
  const upcomingAppointmentsQuery = useDashboardUpcomingAppointments({ limit: 5 });
  const patientsQuery = useDashboardPatients({ page: 1, limit: 10 });

  const isAnyLoading =
    summaryQuery.isLoading ||
    patientsStatsQuery.isLoading ||
    upcomingAppointmentsQuery.isLoading ||
    patientsQuery.isLoading;

  // Check for revalidation states (refetching data)
  const isAnyRefetching =
    summaryQuery.isFetching ||
    patientsStatsQuery.isFetching ||
    upcomingAppointmentsQuery.isFetching ||
    patientsQuery.isFetching;

  return (
    <>
      <LoadingOverlay
        message="Refreshing dashboard data..."
        isVisible={isAnyRefetching && !isAnyLoading}
      />
      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ px: 1 }}>
        {isAnyLoading ? (
          // Show skeleton loading for the entire page
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width={300} height={32} />
              <Skeleton variant="text" width={400} height={20} sx={{ mt: 1 }} />
            </Box>

            {/* Summary cards skeleton */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
                mb: 3,
              }}
            >
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              ))}
            </Box>

            {/* Main content skeleton */}
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr', lg: '2fr 1fr' },
                gridAutoRows: 'minmax(180px, auto)',
              }}
            >
              <Box sx={{ gridRow: { lg: 'span 2' } }}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
              </Box>
              <Box sx={{ gridRow: { lg: 'span 2' } }}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1', lg: '1 / -1' } }}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            <DashboardSummary />
            <Box
              sx={{
                mt: 1,
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr', lg: '2fr 1fr' },
                gridAutoRows: 'minmax(180px, auto)',
              }}
            >
              <Box sx={{ gridRow: { lg: 'span 2' } }}>
                <PatientsStatistics />
              </Box>
              <Box sx={{ gridRow: { lg: 'span 2' } }}>
                <UpcomingAppointments limit={5} />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1', lg: '1 / -1' } }}>
                <DashboardPatientsTable />
              </Box>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
