'use client';

import { Box, Paper, List, ListItem, ListItemText, Typography } from '@mui/material';

import { useDashboardUpcomingAppointments } from 'src/hooks/use-dashboard-query';
import UpcomingAppointmentsSkeleton from './skeletons/upcoming-appointments-skeleton';

type Props = { limit?: number };

export default function UpcomingAppointments({ limit = 5 }: Props) {
  const { data, isLoading } = useDashboardUpcomingAppointments({ limit });

  const items = data?.Data?.Items || data?.Data || data?.items || [];

  if (isLoading) {
    return <UpcomingAppointmentsSkeleton />;
  }

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
        Upcoming Appointments
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No upcoming appointments
          </Typography>
        ) : (
          <List dense sx={{ maxHeight: '100%', overflow: 'auto' }}>
            {items.slice(0, limit).map((apt: any) => (
              <ListItem key={apt.Id || apt.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={`${apt.PatientName || apt.patientName} → Dr. ${apt.DoctorName || apt.doctorName}`}
                  secondary={`${apt.AppointmentDate || apt.date} ${apt.ScheduledTime || ''}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}
