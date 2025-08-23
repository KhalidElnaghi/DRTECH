'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Paper, Avatar, Typography, IconButton } from '@mui/material';

import { useDashboardUpcomingAppointments } from 'src/hooks/use-dashboard-query';

import { fTime, fFullDate } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';

import AppointmentDetailsDialog from './appointment-details-dialog';
import UpcomingAppointmentsSkeleton from './skeletons/upcoming-appointments-skeleton';

type Props = { limit?: number };

export default function UpcomingAppointments({ limit = 5 }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useDashboardUpcomingAppointments({ limit });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const items = data?.Data?.Items || data?.Data || data?.items || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAppointmentClick = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAppointmentId(null);
  };

  if (isLoading) {
    return <UpcomingAppointmentsSkeleton />;
  }

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          maxHeight: '500px',
        }}
      >
        {/* Fixed Header */}
        <Box
          sx={{
            p: 2,
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="h6">{t('TITLE.UPCOMING_APPOINTMENTS')}</Typography>
          <IconButton
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Iconify
              icon="ci:arrow-reload-02"
              color="primary.main"
              sx={{
                animation: isRefreshing ? 'rotate 0.1s linear infinite' : 'none',
                '@keyframes rotate': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '25%': {
                    transform: 'rotate(90deg)',
                  },
                  '50%': {
                    transform: 'rotate(180deg)',
                  },
                  '75%': {
                    transform: 'rotate(270deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }}
            />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: items.length === 0 ? 'hidden' : 'auto',
            p: 2,
            pt: 1.5,
          }}
        >
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No upcoming appointments
            </Typography>
          ) : (
            <>
              {items.slice(0, 5).map((apt: any) => (
                <Box
                  key={apt.AppointmentId}
                  onClick={() => handleAppointmentClick(apt.AppointmentId)}
                  sx={{
                    px: 0,
                    my: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 2,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Avatar src={apt.PatientAvatar} sx={{ width: 40, height: 40 }} />
                  <Box>
                    <Typography variant="body2" color="initial">
                      {apt.DoctorName || apt.doctorName}
                    </Typography>
                    <Typography
                      color="#818898"
                      sx={{
                        fontSize: '14px',
                        fontWeight: '400',
                      }}
                    >
                      {fFullDate(apt.AppointmentDate)} • {fTime(apt.AppointmentDate)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Paper>

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        appointmentId={selectedAppointmentId}
      />
    </>
  );
}
