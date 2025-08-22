'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Box, Grid, Paper, Button, Typography, IconButton } from '@mui/material';

import { useDashboardSummary } from 'src/hooks/use-dashboard-query';

import { fDateTime } from 'src/utils/format-time';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import DashboardSummarySkeleton from './skeletons/dashboard-summary-skeleton';

export default function DashboardSummary() {
  const { user } = useAuthContext();
  const { data, isLoading, refetch } = useDashboardSummary();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box>
          <Typography
            variant="body1"
            color="initial"
            sx={{
              fontFamily: 'Inter Tight',
              fontWeight: 600,
              fontStyle: 'SemiBold',
              fontSize: 24,
              lineHeight: '130%',
              letterSpacing: '0%',
            }}
          >
            {' '}
            Welcome back, {user?.FirstName}!
          </Typography>
          <Typography
            variant="body1"
            color="#818898"
            sx={{
              fontFamily: 'Inter Tight',
              fontWeight: 400,
              fontStyle: 'Regular',
              fontSize: '14px',
              lineHeight: '130%',
              letterSpacing: '0%',
              mt: 1,
            }}
          >
            Here's a quick summary of hospital's performance this week.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'end', gap: 1 }}>
          {' '}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
              px: 1,
              border: '1px solid #DFE1E7',
              borderRadius: '10px',
            }}
          >
            <Iconify icon="solar:calendar-bold-duotone" />
            <Typography
              variant="body1"
              color="initial"
              sx={{
                fontFamily: 'Inter Tight',
                fontWeight: 600,
                fontStyle: 'SemiBold',
                fontSize: { xs: '10px', md: '12px', lg: '16px' },
                lineHeight: '150%',
                letterSpacing: '2%',
                textAlign: 'center',
                color: '#666D80',
              }}
            >
              Last updated: {fDateTime(data?.Data?.LastUpdated, 'dd MMM yyyy')}
            </Typography>
            <IconButton
              aria-label="Refresh dashboard data"
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderRadius: '10px',
                p: 1,
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
          <Button variant="contained" color="primary" sx={{ display: { sm: 'none', md: 'flex' } }}>
            <Iconify icon="tabler:file-download-filled" />
            <Typography
              variant="body1"
              sx={{
                mx: 1,
                py: { xs: '5px', md: '4px', lg: '1px' },
                fontFamily: 'Inter Tight',
                fontWeight: 600,
                fontStyle: 'SemiBold',
                fontSize: { xs: '10px', md: '12px', lg: '16px' },
                lineHeight: '150%',
                letterSpacing: '2%',
                textAlign: 'center',
              }}
            >
              Export CSV
            </Typography>
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <DashboardSummarySkeleton />
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid
            item
            xs={12}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            {/* Total Patients */}
            <Paper
              elevation={1}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
                  <Image
                    src="/assets/images/home/patient.svg"
                    alt="patients"
                    width={45}
                    height={45}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Inter Tight',
                      fontWeight: 400,
                      fontStyle: 'Regular',
                      fontSize: 14,
                      lineHeight: '150%',
                      letterSpacing: '2%',
                      color: '#666D80',
                      pt: 1.5,
                    }}
                  >
                    {' '}
                    Total Patient
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Inter Tight',
                      fontWeight: 600,
                      fontStyle: 'SemiBold',
                      fontSize: 18,
                      lineHeight: '135%',
                      letterSpacing: '0%',
                    }}
                  >
                    {data?.Data?.TotalPatients}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                    bgcolor: data?.Data?.TotalPatientsIsIncrease ? '#EFFEFA' : '#FEF3F2',
                    borderRadius: '10px',
                    p: 1,
                  }}
                >
                  {data?.Data?.TotalPatientsIsIncrease ? (
                    <Iconify icon="lucide:arrow-up" color="#40C4AA" width={16} height={16} />
                  ) : (
                    <Iconify icon="lucide:arrow-down" color="#D92C20" width={16} height={16} />
                  )}
                  <Typography
                    variant="caption"
                    color={data?.Data?.TotalPatientsIsIncrease ? '#40C4AA' : '#D92C20'}
                  >
                    {data?.Data?.TotalPatientsChangePercentage}%
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Total Doctors */}
            <Paper
              elevation={1}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
                  <Image
                    src="/assets/images/home/doctor.svg"
                    alt="doctors"
                    width={45}
                    height={45}
                  />
                  <Typography
                    sx={{
                      fontFamily: 'Inter Tight',
                      fontWeight: 400,
                      fontStyle: 'Regular',
                      fontSize: 14,
                      lineHeight: '150%',
                      letterSpacing: '2%',
                      color: '#666D80',
                      pt: 1.5,
                    }}
                  >
                    {' '}
                    Total Doctors
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Inter Tight',
                      fontWeight: 600,
                      fontStyle: 'SemiBold',
                      fontSize: 18,
                      lineHeight: '135%',
                      letterSpacing: '0%',
                    }}
                  >
                    {data?.Data?.TotalDoctors}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                    bgcolor: data?.Data?.TotalDoctorsIsIncrease ? '#EFFEFA' : '#FEF3F2',
                    borderRadius: '10px',
                    p: 1,
                  }}
                >
                  {data?.Data?.TotalDoctorsIsIncrease ? (
                    <Iconify icon="lucide:arrow-up" color="#40C4AA" width={16} height={16} />
                  ) : (
                    <Iconify icon="lucide:arrow-down" color="#D92C20" width={16} height={16} />
                  )}
                  <Typography
                    variant="caption"
                    color={data?.Data?.TotalDoctorsIsIncrease ? '#40C4AA' : '#D92C20'}
                  >
                    {data?.Data?.TotalDoctorsChangePercentage}%
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* New Appointments */}
            <Paper
              elevation={1}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
                  <Image
                    src="/assets/images/home/appointment.svg"
                    alt="appointments"
                    width={45}
                    height={45}
                  />
                  <Typography
                    sx={{
                      fontFamily: 'Inter Tight',
                      fontWeight: 400,
                      fontStyle: 'Regular',
                      fontSize: 14,
                      lineHeight: '150%',
                      letterSpacing: '2%',
                      color: '#666D80',
                      pt: 1.5,
                    }}
                  >
                    {' '}
                    New Appointments
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Inter Tight',
                      fontWeight: 600,
                      fontStyle: 'SemiBold',
                      fontSize: 18,
                      lineHeight: '135%',
                      letterSpacing: '0%',
                    }}
                  >
                    {data?.Data?.NewAppointments}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                    bgcolor: data?.Data?.NewAppointmentsIsIncrease ? '#EFFEFA' : '#FEF3F2',
                    borderRadius: '10px',
                    p: 1,
                  }}
                >
                  {data?.Data?.NewAppointmentsIsIncrease ? (
                    <Iconify icon="lucide:arrow-up" color="#40C4AA" width={16} height={16} />
                  ) : (
                    <Iconify icon="lucide:arrow-down" color="#D92C20" width={16} height={16} />
                  )}
                  <Typography
                    variant="caption"
                    color={data?.Data?.NewAppointmentsIsIncrease ? '#40C4AA' : '#D92C20'}
                  >
                    {data?.Data?.NewAppointmentsChangePercentage}%
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Rooms Available */}
            <Paper
              elevation={1}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
                  <Image src="/assets/images/home/room.svg" alt="rooms" width={45} height={45} />
                  <Typography
                    sx={{
                      fontFamily: 'Inter Tight',
                      fontWeight: 400,
                      fontStyle: 'Regular',
                      fontSize: 14,
                      lineHeight: '150%',
                      letterSpacing: '2%',
                      color: '#666D80',
                      pt: 1.5,
                    }}
                  >
                    Rooms Available
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'Inter Tight',
                      fontWeight: 600,
                      fontStyle: 'SemiBold',
                      fontSize: 18,
                      lineHeight: '135%',
                      letterSpacing: '0%',
                    }}
                  >
                    {data?.Data?.RoomsAvailable}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                    bgcolor: data?.Data?.RoomsAvailableIsIncrease ? '#EFFEFA' : '#FEF3F2',
                    borderRadius: '10px',
                    p: 1,
                  }}
                >
                  {data?.Data?.RoomsAvailableIsIncrease ? (
                    <Iconify icon="lucide:arrow-up" color="#40C4AA" width={16} height={16} />
                  ) : (
                    <Iconify icon="lucide:arrow-down" color="#D92C20" width={16} height={16} />
                  )}
                  <Typography
                    variant="caption"
                    color={data?.Data?.RoomsAvailableIsIncrease ? '#40C4AA' : '#D92C20'}
                  >
                    {data?.Data?.RoomsAvailableChangePercentage}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </>
  );
}
