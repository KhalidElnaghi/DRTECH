'use client';

import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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

import { usePatientsDropdown } from 'src/hooks/use-patients-query';
import { useCreateInpatient, useUpdateInpatient } from 'src/hooks/use-inpatients-query';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect } from 'src/components/hook-form';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { IRoom } from 'src/types/room';
import { ILookup } from 'src/types/lookups';
import { IPatient } from 'src/types/patient';
import { IInpatient } from 'src/types/inpatient';

interface InpatientDialogProps {
  open: boolean;
  onClose: () => void;
  patients: IPatient[];
  rooms: IRoom[];
  inpatient?: IInpatient | null;
}

export default function InpatientDialog({ open, onClose, rooms, inpatient }: InpatientDialogProps) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const createInpatientMutation = useCreateInpatient();
  const updateInpatientMutation = useUpdateInpatient();
  const { data: patientsData } = usePatientsDropdown();
  const patients = useMemo(() => patientsData?.Data || patientsData || [], [patientsData]);
  const defaultValues = useMemo(
    () => ({
      PatientId: inpatient?.PatientId || 0,
      RoomId: inpatient?.RoomId || 0,
      AdmissionDate: inpatient?.AdmissionDate ? new Date(inpatient.AdmissionDate) : new Date(),
      DischargeDate: inpatient?.DischargeDate ? new Date(inpatient.DischargeDate) : new Date(),
      Diagnosis: inpatient?.Diagnosis || '',
    }),
    [inpatient]
  );

  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        PatientId: yup
          .number()
          .required(t('INPATIENT.PATIENT_REQUIRED') || 'Patient is required')
          .min(1, t('INPATIENT.PATIENT_REQUIRED') || 'Patient is required'),
        RoomId: yup
          .number()
          .required(t('INPATIENT.ROOM_REQUIRED') || 'Room is required')
          .min(1, t('INPATIENT.ROOM_REQUIRED') || 'Room is required'),
        AdmissionDate: yup
          .date()
          .required(t('INPATIENT.ADMISSION_DATE_REQUIRED') || 'Admission date is required'),
        DischargeDate: yup
          .date()
          .required(t('INPATIENT.DISCHARGE_DATE_REQUIRED') || 'Discharge date is required')
          .min(
            yup.ref('AdmissionDate'),
            t('INPATIENT.DISCHARGE_DATE_MUST_BE_AFTER_ADMISSION_DATE') ||
              'Discharge date must be after admission date'
          ),
        Diagnosis: yup.string(),
      })
    ),
    defaultValues,
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = methods;

  // Reset form when inpatient changes (for edit mode) or when dialog opens
  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  // Helper function to format date as YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onSubmit = async (data: any) => {
    try {
      if (inpatient) {
        // Edit mode
        await updateInpatientMutation.mutateAsync({
          reqBody: {
            ...data,
            AdmissionDate: formatDateToString(data.AdmissionDate),
            DischargeDate: formatDateToString(data.DischargeDate),
          },
          id: inpatient.Id,
        });
        enqueueSnackbar(
          t('MESSAGE.INPATIENT_UPDATED_SUCCESSFULLY') || 'Inpatient updated successfully',
          { variant: 'success' }
        );
      } else {
        // Create mode
        await createInpatientMutation.mutateAsync({
          ...data,
          AdmissionDate: formatDateToString(data.AdmissionDate),
          DischargeDate: formatDateToString(data.DischargeDate),
        });
        enqueueSnackbar(
          t('MESSAGE.INPATIENT_CREATED_SUCCESSFULLY') || 'Inpatient created successfully',
          { variant: 'success' }
        );
      }
      onClose();
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = `Failed to ${inpatient ? 'update' : 'create'} inpatient`;
      if (error?.Error?.Message) {
        // API returned a specific error message
        errorMessage = error.Error.Message;
      } else if (error?.Message) {
        // Alternative error message format
        errorMessage = error.Message;
      } else if (error?.message) {
        // Generic error message
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
    }
  };

  const handleClose = () => {
    reset();
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
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          py: 2,
          bgcolor: '#F6F8FA',
          borderBottom: '1px solid #DFE1E7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {inpatient ? 'Edit Inpatient' : 'Add New Inpatient'}
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

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ borderBottom: '1px solid #DFE1E7', py: 3 }}>
          <Stack
            spacing={1}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 2 }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {' '}
              {/* Patient Selection */}
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
                  {t('INPATIENT.PATIENT_NAME') || 'Patient Name'}
                </Typography>
                <Controller
                  name="PatientId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <RHFSelect
                      {...field}
                      placeholder={t('INPATIENT.SELECT_PATIENT') || 'Select a patient'}
                      error={!!error}
                      helperText={error?.message}
                    >
                      {patients.map((patient: ILookup) => (
                        <MenuItem key={patient.Id} value={patient.Id}>
                          {patient.Name}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  )}
                />
              </Box>
              {/* Room Selection */}
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
                  {t('INPATIENT.ROOM_NUMBER') || 'Room Number'}
                </Typography>
                <Controller
                  name="RoomId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <RHFSelect
                      {...field}
                      placeholder={t('INPATIENT.SELECT_ROOM') || 'Select a room'}
                      error={!!error}
                      helperText={error?.message}
                    >
                      {rooms.map((room) => (
                        <MenuItem key={room.Id} value={room.Id}>
                          {room.RoomNumber} - {room.TypeName}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  )}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {' '}
              {/* Admission Date */}
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
                  {t('INPATIENT.ADMISSION_DATE') || 'Admission Date'}
                </Typography>
                <Controller
                  name="AdmissionDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                          InputLabelProps: { shrink: true },
                        },
                      }}
                    />
                  )}
                />
              </Box>
              {/* Discharge Date */}
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
                  {t('INPATIENT.DISCHARGE_DATE') || 'Discharge Date'}
                </Typography>
                <Controller
                  name="DischargeDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                          InputLabelProps: { shrink: true },
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Diagnosis */}
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
                {t('INPATIENT.DIAGNOSIS') || 'Diagnosis'}{' '}
                <span style={{ color: '#666D90', fontSize: '10px' }}>Optional</span>
              </Typography>
              <Controller
                name="Diagnosis"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <RHFTextField
                    {...field}
                    multiline
                    rows={3}
                    placeholder={t('INPATIENT.ENTER_DIAGNOSIS') || 'Enter patient diagnosis'}
                    error={!!error}
                    helperText={error?.message}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                )}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Add Inpatient
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
