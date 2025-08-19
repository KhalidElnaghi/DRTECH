'use client';

import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useMemo, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Stack,
  Dialog,
  Button,
  MenuItem,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect } from 'src/components/hook-form';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { IDoctor } from 'src/types/doctors';
import { IPatient } from 'src/types/patients';
import { ILookup } from 'src/types/lookups';
import { IAppointment } from 'src/types/appointment';
import { useEditAppointment, useNewAppointment } from 'src/hooks/use-appointments-query';

interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  doctors: IDoctor[];
  patients: IPatient[];
  services: ILookup[];
  appointment?: IAppointment | null;
  appointmentStatus: ILookup[];
}

export default function AppointmentDialog({
  open,
  onClose,
  doctors,
  patients,
  services,
  appointment,
  appointmentStatus,
}: AppointmentDialogProps) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  // React Query mutations
  const editAppointmentMutation = useEditAppointment();
  const newAppointmentMutation = useNewAppointment();

  // Helper function to combine date and time
  const combineDateAndTime = (date: Date, time: Date): Date => {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
    return combined;
  };

  // Helper function to format datetime without timezone conversion
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        patientId: yup
          .number()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED'))
          .min(1, t('LABEL.THIS_FIELD_IS_REQUIRED')),
        doctorId: yup
          .number()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED'))
          .min(1, t('LABEL.THIS_FIELD_IS_REQUIRED')),
        Status: yup
          .number()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED'))
          .min(1, t('LABEL.THIS_FIELD_IS_REQUIRED')),
        serviceType: yup
          .number()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED'))
          .min(1, t('LABEL.THIS_FIELD_IS_REQUIRED')),
        appointmentDate: yup.date().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        // .min(yup.ref('startDate'), t('LABEL.END_DATE_MUST_BE_AFTER_START_DATE')),
        scheduledTime: yup.date().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        clinicName: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        clinicLocation: yup.object().shape({
          lat: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
          lng: yup.number().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
          location: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED')),
        }),
        notes: yup.string(),
      })
    ),
    defaultValues: {
      patientId: appointment?.patientId || 0,
      doctorId: appointment?.doctorId || 0,
      appointmentDate: appointment?.appointmentDate
        ? new Date(appointment.appointmentDate)
        : new Date(),
      scheduledTime: (() => {
        if (appointment?.appointmentDate) {
          const appointmentDate = new Date(appointment.appointmentDate);
          const scheduledTime = new Date();
          scheduledTime.setHours(appointmentDate.getHours());
          scheduledTime.setMinutes(appointmentDate.getMinutes());
          scheduledTime.setSeconds(appointmentDate.getSeconds());
          scheduledTime.setMilliseconds(appointmentDate.getMilliseconds());
          return scheduledTime;
        }
        return new Date();
      })(),
      Status: appointment?.status || 0,
      serviceType: appointment?.serviceType || 0,
      clinicName: appointment?.ClinicName || '',
      clinicLocation: appointment?.clinicLocation || {
        lat: 0,
        lng: 0,
        location: '',
      },
      notes: appointment?.notes || '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    trigger,
    control,
    reset,
    formState: { isSubmitting },
  } = methods;

  // // Reset form when appointment changes (for edit mode)
  useEffect(() => {
    if (appointment) {
      // Set appointmentDate from appointment.appointmentDate
      const appointmentDateTime = appointment.appointmentDate
        ? new Date(appointment.appointmentDate)
        : new Date();

      // Extract time from appointmentDate and set as scheduledTime default
      let scheduledTimeValue: Date;
      if (appointment.appointmentDate) {
        const appointmentDate = new Date(appointment.appointmentDate);
        // Create a new Date object with the time from appointmentDate
        scheduledTimeValue = new Date();
        scheduledTimeValue.setHours(appointmentDate.getHours());
        scheduledTimeValue.setMinutes(appointmentDate.getMinutes());
        scheduledTimeValue.setSeconds(appointmentDate.getSeconds());
        scheduledTimeValue.setMilliseconds(appointmentDate.getMilliseconds());
      } else {
        // Fallback to current time if no appointmentDate
        scheduledTimeValue = new Date();
      }

      const formData = {
        patientId: appointment.patientId || undefined,
        doctorId: appointment.doctorId || undefined,
        appointmentDate: appointmentDateTime,
        scheduledTime: scheduledTimeValue, // Use the actual scheduledTime, not extracted from appointmentDate
        // Handle both status fields (there's a typo in the type)
        Status: appointment.status || undefined,
        serviceType: appointment.serviceType || undefined,
        clinicName: appointment.ClinicName || '',
        clinicLocation: appointment.clinicLocation || {
          lat: 0,
          lng: 0,
          location: '',
        },
        notes: appointment.notes || '',
      };
      reset(formData);
    } else {
      reset();
    }
  }, [appointment, methods, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (appointment) {
        // Combine the user's selected date with their selected time
        const combinedDateTime = combineDateAndTime(data.appointmentDate, data.scheduledTime);

        const serializedData = {
          ...data,
          appointmentDate: formatDateTimeLocal(combinedDateTime), // Send as single variable without timezone conversion
          scheduledTime: formatDateTimeLocal(combinedDateTime), // Also send scheduledTime without timezone conversion
          Notes: data.notes || '',
        };
        delete serializedData.notes;
        await editAppointmentMutation.mutateAsync({ reqBody: serializedData, id: appointment.id });

        enqueueSnackbar(
          t('MESSAGE.APPOINTMENT_UPDATED_SUCCESSFULLY') || 'Appointment updated successfully',
          { variant: 'success' }
        );
        onClose();
        reset();
      } else {
        // Combine the user's selected date with their selected time
        const combinedDateTime = combineDateAndTime(data.appointmentDate, data.scheduledTime);

        // Serialize the data to prevent circular reference issues
        const serializedData = {
          ...data,
          appointmentDate: formatDateTimeLocal(combinedDateTime), // Send as single variable without timezone conversion
          scheduledTime: formatDateTimeLocal(combinedDateTime), // Also send scheduledTime without timezone conversion
        };

        await newAppointmentMutation.mutateAsync(serializedData);

        enqueueSnackbar(
          t('MESSAGE.APPOINTMENT_CREATED_SUCCESSFULLY') || 'Appointment created successfully',
          { variant: 'success' }
        );
        onClose();
        reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      enqueueSnackbar('An unexpected error occurred', { variant: 'error' });
    }
  });
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          py: 1,
          bgcolor: '#F6F8FA',
          borderBottom: '1px solid #DFE1E7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">
          {appointment ? t('LABEL.EDIT_APPOINTMENT') : t('LABEL.CREATE_APPOINTMENT')}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#666',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ borderBottom: '1px solid #DFE1E7', py: 4 }}>
          <Stack
            spacing={1}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 2, mt: 1 }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                Patient Name
              </Typography>
              <RHFSelect
                placeholder={t('LABEL.PATIENT_NAME')}
                name="patientId"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              >
                {patients.map((patient: any) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient?.fullName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                Doctor Name
              </Typography>
              <RHFSelect
                placeholder={t('LABEL.DOCTOR_NAME')}
                name="doctorId"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              >
                {doctors.map((doctor: any) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor?.fullName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                Service Type
              </Typography>
              <RHFSelect
                placeholder={t('LABEL.SERVICE_TYPE')}
                name="serviceType"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              >
                {services.map((service: any) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service?.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                Clinic Name
              </Typography>
              <RHFTextField
                name="clinicName"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                Clinic Location
              </Typography>
              <RHFTextField
                name="clinicLocation.location"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'Inter Tight',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  Latitude
                </Typography>
                <RHFTextField
                  name="clinicLocation.lat"
                  placeholder="0.0"
                  // type="number"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'Inter Tight',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  Longitude
                </Typography>
                <RHFTextField
                  name="clinicLocation.lng"
                  placeholder="0.0"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                Status
              </Typography>
              <RHFSelect
                placeholder={t('LABEL.STATUS')}
                name="Status"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              >
                {appointmentStatus.map((status: any) => (
                  <MenuItem key={status.id} value={status.id}>
                    {status?.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'Inter Tight',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  Appointment Date
                </Typography>
                <Controller
                  name="appointmentDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      format="dd-MM-yyyy"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                        trigger(['appointmentDate']);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                          placeholder: t('LABEL.APPOINTMENT_DATE'),
                        },
                      }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'Inter Tight',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  Appointment Time
                </Typography>
                <Controller
                  name="scheduledTime"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TimePicker
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                          placeholder: t('LABEL.APPOINTMENT_TIME'),
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                Notes <span style={{ color: '#666D90', fontSize: '9px' }}>Optional</span>
              </Typography>
              <RHFTextField multiline rows={4} name="notes" placeholder={t('LABEL.NOTES')} />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              onClose();
              reset();
            }}
          >
            {t('BUTTON.CANCEL')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} color="primary">
            {appointment ? t('BUTTON.UPDATE') : t('BUTTON.CREATE_APPOINTMENT')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
