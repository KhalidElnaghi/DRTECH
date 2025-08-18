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
import { newAppointment } from 'src/actions/appointments';

interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  doctors: IDoctor[];
  patients: IPatient[];
  services: ILookup[];
  appointment?: IAppointment;
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
        status: yup
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
        notes: yup.string(),
      })
    ),
    defaultValues: {
      patientId: appointment?.patientId || 0,
      doctorId: appointment?.doctorId || 0,
      appointmentDate: appointment?.appointmentDate
        ? new Date(appointment.appointmentDate)
        : new Date(),
      scheduledTime: appointment?.scheduledTime ? new Date(appointment.scheduledTime) : new Date(),
      status: appointment?.appointmenStatus || 0,
      serviceType: appointment?.serviceType || 0,
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
      const formData = {
        patientId: appointment.patientId || undefined,
        doctorId: appointment.doctorId || undefined,
        appointmentDate: appointment.appointmentDate
          ? new Date(appointment.appointmentDate)
          : new Date(),
        scheduledTime: appointment.scheduledTime ? new Date(appointment.scheduledTime) : new Date(),
        // Handle both status fields (there's a typo in the type)
        status: appointment.status || appointment.appointmenStatus || undefined,
        serviceType: appointment.serviceType || undefined,
        notes: appointment.notes || '',
      };
      reset(formData);
    } else {
      reset();
    }
  }, [appointment, methods, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Form submitted with data:', data);

      if (appointment) {
        // const res = await editAppointment(data);
        // console.log(res);
        // if (res?.error) {
        //   enqueueSnackbar(`${res?.error}`, { variant: 'error' });
        // } else {
        //   enqueueSnackbar(t('MESSAGE.COUPON_CREATED_SUCCESSFULLY'), {
        //     variant: 'success',
        //   });
        //   onClose();
        // }
      } else {
        // Serialize the data to prevent circular reference issues
        const serializedData = {
          ...data,
          appointmentDate:
            data.appointmentDate instanceof Date
              ? data.appointmentDate.toISOString()
              : data.appointmentDate,
          scheduledTime:
            data.scheduledTime instanceof Date
              ? data.scheduledTime.toISOString()
              : data.scheduledTime,
        };

        const res = await newAppointment(serializedData);

        if (res?.error) {
          enqueueSnackbar(`${res.error}`, { variant: 'error' });
        } else if (res?.success === false) {
          enqueueSnackbar(`${res.error}`, { variant: 'error' });
        } else {
          enqueueSnackbar(
            t('MESSAGE.APPOINTMENT_CREATED_SUCCESSFULLY') || 'Appointment created successfully',
            {
              variant: 'success',
            }
          );
          onClose();
          reset();
        }
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
                Status
              </Typography>
              <RHFSelect
                placeholder={t('LABEL.STATUS')}
                name="status"
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
