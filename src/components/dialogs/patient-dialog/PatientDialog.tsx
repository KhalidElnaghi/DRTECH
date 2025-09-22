'use client';

import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { DatePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Stack,
  Dialog,
  Button,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { useCreatePatient, useUpdatePatient } from 'src/hooks/use-patients-query';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect } from 'src/components/hook-form';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { ILookup } from 'src/types/lookups';
import { IPatient, PatientData } from 'src/types/patient';

interface PatientDialogProps {
  open: boolean;
  onClose: () => void;
  genders: ILookup[];
  bloodTypes: ILookup[];
  patient?: IPatient | null;
}

export default function PatientDialog({
  open,
  onClose,
  genders,
  bloodTypes,
  patient,
}: PatientDialogProps) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  // React Query mutations
  const editPatientMutation = useUpdatePatient();
  const newPatientMutation = useCreatePatient();

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues = useMemo(
    () => ({
      FullName: patient?.FullName || '',
      Gender: patient?.Gender ?? 0,
      BloodType: patient?.BloodType ?? 0,
      PhoneNumber: patient?.PhoneNumber || '',
      EmergencyContact: patient?.EmergencyContact || '',
      Address: patient?.Address || '',
      DateOfBirth: patient?.DateOfBirth ? new Date(patient.DateOfBirth) : new Date(),
      NationalID: patient?.NationalID || '',
    }),
    [patient]
  );

  const methods = useForm({
    resolver: yupResolver(
      yup.object().shape({
        FullName: yup
          .string()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Full name is required'),
        Gender: yup
          .number()
          .nullable()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Gender is required')
          .min(1, t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Gender is required'),
        BloodType: yup
          .number()
          .nullable()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Blood type is required')
          .min(1, t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Blood type is required'),
        PhoneNumber: yup
          .string()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Phone number is required')
          .matches(
            /^\+966[0-9]{9}$/,
            t('LABEL.PHONE_INVALID') || 'Phone number must be in format +966XXXXXXXXX'
          ),
        EmergencyContact: yup
          .string()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Emergency contact is required')
          .matches(
            /^\+966[0-9]{9}$/,
            t('LABEL.PHONE_INVALID') || 'Phone number must be in format +966XXXXXXXXX'
          ),
        NationalID: yup
          .string()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'National ID is required')
          .matches(
            /^[12]\d{8}$/,
            t('LABEL.NATIONAL_ID_INVALID') ||
              'National ID must start with 1 or 2 and contain exactly 9 digits'
          ),
        Address: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Address is required'),
        DateOfBirth: yup
          .date()
          .nullable()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Date of birth is required'),
      })
    ),
    defaultValues,
  });

  const {
    handleSubmit,
    trigger,
    control,
    reset,

    formState: { isSubmitting },
  } = methods;

  // Reset form when patient changes (for edit mode) or when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the form is properly mounted
      const timer = setTimeout(() => {
        if (patient) {
          // For edit mode, set the form values with the patient data
          const formData = {
            FullName: patient.FullName || '',
            Gender: patient.Gender ?? undefined,
            BloodType: patient.BloodType ?? undefined,
            PhoneNumber: patient.PhoneNumber || '',
            EmergencyContact: patient.EmergencyContact || '',
            Address: patient.Address || '',
            DateOfBirth: patient.DateOfBirth ? new Date(patient.DateOfBirth) : new Date(),
          };
          reset(formData, { keepDefaultValues: false, keepErrors: false, keepDirty: false });
        } else {
          // For create mode, reset to empty form
          reset(defaultValues, { keepDefaultValues: false, keepErrors: false, keepDirty: false });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
    // Return empty cleanup function when open is false
    return () => {};
  }, [patient, open, reset, defaultValues]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset(defaultValues, { keepDefaultValues: false });
    }
  }, [open, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (patient) {
        // Convert form data to PatientData type (Date to string)
        const patientData: PatientData = {
          ...data,
          Gender: data.Gender ?? 0,
          DateOfBirth: data.DateOfBirth ? data.DateOfBirth.toISOString().split('T')[0] : '',
        };

        await editPatientMutation.mutateAsync({ id: patient.Id, data: patientData });

        onClose();
      } else {
        // Convert form data to PatientData type (Date to string)
        const patientData: PatientData = {
          ...data,
          Gender: data.Gender ?? 0,
          DateOfBirth: data.DateOfBirth ? data.DateOfBirth.toISOString().split('T')[0] : '',
        };

        await newPatientMutation.mutateAsync(patientData);
        onClose();
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
          py: 2,
          bgcolor: '#F6F8FA',
          borderBottom: '1px solid #DFE1E7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">
          {patient
            ? t('BUTTON.UPDATE_PATIENT') || 'Edit Patient'
            : t('BUTTON.ADD_PATIENT') || 'Add New Patient'}
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
        <DialogContent sx={{ borderBottom: '1px solid #DFE1E7', py: 3 }}>
          <Stack
            spacing={1}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 2 }}
          >
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
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  {t('LABEL.FULL_NAME') || 'Full Name'}
                </Typography>
                <RHFTextField
                  placeholder={t('LABEL.FULL_NAME') || 'Enter patient full name'}
                  name="FullName"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  {t('LABEL.GENDER') || 'Gender'}
                </Typography>
                <RHFSelect
                  placeholder={t('LABEL.GENDER') || 'Select gender'}
                  name="Gender"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                >
                  {genders?.map((gender) => (
                    <MenuItem key={gender.Id} value={gender.Id}>
                      {gender?.Name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Box>
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
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  {t('LABEL.BLOOD_TYPE') || 'Blood Type'}
                </Typography>
                <RHFSelect
                  placeholder={t('LABEL.BLOOD_TYPE') || 'Select blood type'}
                  name="BloodType"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                >
                  {bloodTypes?.map((bloodType) => (
                    <MenuItem key={bloodType.Id} value={bloodType.Id}>
                      {bloodType?.Name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  {t('LABEL.DATE_OF_BIRTH') || 'Date of Birth'}
                </Typography>
                <Controller
                  name="DateOfBirth"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      format="dd-MM-yyyy"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                        trigger(['DateOfBirth']);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                          placeholder: t('LABEL.DATE_OF_BIRTH') || 'Select date of birth',
                        },
                      }}
                    />
                  )}
                />
              </Box>
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
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  {t('LABEL.PHONE_NUMBER') || 'Phone Number'}
                </Typography>
                <Controller
                  name="PhoneNumber"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flexDirection: 'row',
                              }}
                            >
                              <Box
                                component="img"
                                src="/assets/images/flag.png"
                                alt="Saudi Arabia Flag"
                                sx={{
                                  width: 20,
                                  height: 15,
                                  objectFit: 'cover',
                                  borderRadius: '2px',
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: '#333',
                                  fontFamily: 'monospace',
                                }}
                              >
                                966+
                              </Typography>
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      value={field.value?.replace('+966', '') || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        field.onChange(`+966${value}`);
                      }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  {t('LABEL.EMERGENCY_CONTACT') || 'Emergency Contact'}
                </Typography>
                <Controller
                  name="EmergencyContact"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flexDirection: 'row',
                              }}
                            >
                              <Box
                                component="img"
                                src="/assets/images/flag.png"
                                alt="Saudi Arabia Flag"
                                sx={{
                                  width: 20,
                                  height: 15,
                                  objectFit: 'cover',
                                  borderRadius: '2px',
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: '#333',
                                  fontFamily: 'monospace',
                                }}
                              >
                                966+
                              </Typography>
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      value={field.value?.replace('+966', '') || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        field.onChange(`+966${value}`);
                      }}
                    />
                  )}
                />
              </Box>
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
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  {t('LABEL.ADDRESS') || 'Address'}
                </Typography>
                <RHFTextField
                  placeholder={t('LABEL.ADDRESS') || 'Enter patient address'}
                  name="Address"
                  InputLabelProps={{ shrink: true }}
                  multiline
                  rows={1}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '150%',
                    letterSpacing: '2%',
                    mb: 1,
                    color: '#666D80',
                  }}
                >
                  {t('LABEL.NATIONAL_ID') || 'National ID'}
                </Typography>
                <RHFTextField
                  placeholder={t('LABEL.NATIONAL_ID') || 'Enter patient national ID'}
                  name="NationalID"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="primary" onClick={onClose} disabled={isSubmitting}>
            {t('BUTTON.CANCEL') || 'Cancel'}
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            color="primary"
            disabled={isSubmitting}
          >
            {patient
              ? t('BUTTON.UPDATE_PATIENT') || 'Update Patient'
              : t('BUTTON.ADD_PATIENT') || 'Add Patient'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
