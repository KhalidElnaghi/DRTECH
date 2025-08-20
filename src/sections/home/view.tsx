'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';

import DashboardSummary from './components/dashboard-summary';
import PatientsStatistics from './components/patients-statistics';
import UpcomingAppointments from './components/upcoming-appointments';
import DashboardPatientsTable from './components/dashboard-patients-table';

// ----------------------------------------------------------------------
// type IProps = {};

export default function MainPage() {
  const settings = useSettingsContext();
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ px: 1 }}>
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
    </Container>
  );
}
