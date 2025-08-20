'use client';

import { Box, Paper, Typography, Grid, Stack } from '@mui/material';
import { useDashboardPatientsStatistics } from 'src/hooks/use-dashboard-query';

export default function PatientsStatistics() {
  const { data, isLoading } = useDashboardPatientsStatistics();

  const stats = data?.Data || data || {};

  const items = [
    { label: 'Total Patients', value: stats.TotalPatients ?? stats.totalPatients },
    { label: 'New This Week', value: stats.NewThisWeek ?? stats.newThisWeek },
    { label: 'Male', value: stats.MaleCount ?? stats.male },
    { label: 'Female', value: stats.FemaleCount ?? stats.female },
  ];

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        Patients Statistics
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {items.map((it) => (
              <Grid item xs={6} md={3} key={it.label}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {it.label}
                  </Typography>
                  <Typography variant="h5">{it.value ?? '-'}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Paper>
  );
}
