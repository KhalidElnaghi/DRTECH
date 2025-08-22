'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Grid,
  Dialog,
  Button,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import axiosInstance from 'src/utils/axios';
import { fTime, fFullDate } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';

interface AppointmentDetails {
  Id: number;
  PatientName: string;
  PatientId: number;
  DoctorId: number;
  DoctorName: string;
  AppointmentDate: string;
  Status: number;
  AppointmenStatusName: string;
  ClinicName: string;
  ClinicLocation: {
    lat: number;
    lng: number;
    location: string;
  };
  ServiceType: number;
  ServiceTypeName: string;
  Notes: string;
}

interface AppointmentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  appointmentId: number | null;
}

export default function AppointmentDetailsDialog({
  open,
  onClose,
  appointmentId,
}: AppointmentDetailsDialogProps) {
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAppointmentDetails = useCallback(async () => {
    if (!appointmentId) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/appointments/${appointmentId}`);

      if (response.data.IsSuccess) {
        setAppointmentDetails(response.data.Data);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (open && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [open, appointmentId, fetchAppointmentDetails]);

  const handleClose = () => {
    setAppointmentDetails(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid #DFE1E7',
        }}
      >
        <Typography variant="h6">Appointment Details</Typography>
        <IconButton onClick={handleClose} size="small">
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && appointmentDetails && (
          <Box sx={{ pt: 3 }}>
            {/* Appointment Information Grid */}
            <Grid container spacing={2}>
              {/* Date & Time */}
              <Grid item xs={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Iconify
                    icon="solar:calendar-bold-duotone"
                    width={20}
                    height={20}
                    color="primary.main"
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontSize: '12px' }}
                    >
                      Date & Time
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                      {fFullDate(appointmentDetails.AppointmentDate)} •{' '}
                      {fTime(appointmentDetails.AppointmentDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Doctor */}
              <Grid item xs={5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Iconify
                    icon="solar:user-bold-duotone"
                    width={20}
                    height={20}
                    color="primary.main"
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontSize: '12px' }}
                    >
                      Doctor
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                      {appointmentDetails.DoctorName || 'Not assigned'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Patient */}
              <Grid item xs={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Iconify icon="hugeicons:patient" width={20} height={20} color="primary.main" />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontSize: '12px' }}
                    >
                      Patient
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                      {appointmentDetails.PatientName || 'Not assigned'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Service Type */}
              <Grid item xs={5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Iconify
                    icon="solar:stethoscope-bold-duotone"
                    width={20}
                    height={20}
                    color="primary.main"
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontSize: '12px' }}
                    >
                      Service Type
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                      {appointmentDetails.ServiceTypeName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Appointment Status */}
              <Grid item xs={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Iconify
                    icon="fluent:status-20-regular"
                    width={20}
                    height={20}
                    color="primary.main"
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontSize: '12px' }}
                    >
                      Appointment Status
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                      {appointmentDetails.AppointmenStatusName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Clinic */}
              <Grid item xs={5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Iconify icon="hugeicons:clinic" width={20} height={20} color="primary.main" />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontSize: '12px' }}
                    >
                      Clinic
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                      {appointmentDetails.ClinicName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Location */}
              <Grid item xs={7}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Iconify
                    icon="solar:map-point-bold-duotone"
                    width={20}
                    height={20}
                    color="primary.main"
                    sx={{ mt: 0.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5, fontSize: '12px' }}
                    >
                      Location
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                      {appointmentDetails.ClinicLocation.location}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block', fontSize: '11px' }}
                    >
                      Coordinates: {appointmentDetails.ClinicLocation.lat},{' '}
                      {appointmentDetails.ClinicLocation.lng}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Notes */}
              {appointmentDetails.Notes && (
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Iconify
                      icon="solar:notes-bold-duotone"
                      width={20}
                      height={20}
                      color="primary.main"
                      sx={{ mt: 0.5 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5, fontSize: '12px' }}
                      >
                        Notes
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                        {appointmentDetails.Notes}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {!loading && !appointmentDetails && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No appointment details found
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
