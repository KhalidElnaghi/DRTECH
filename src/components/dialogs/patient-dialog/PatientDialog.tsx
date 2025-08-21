'use client';

import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers';
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
          .matches(/^\+966[0-9]{9}$/, 'Phone number must be in format +966XXXXXXXXX'),
        EmergencyContact: yup
          .string()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Emergency contact is required')
          .matches(/^\+966[0-9]{9}$/, 'Phone number must be in format +966XXXXXXXXX'),
        Address: yup.string().required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Address is required'),
        DateOfBirth: yup
          .date()
          .nullable()
          .required(t('LABEL.THIS_FIELD_IS_REQUIRED') || 'Date of birth is required'),
      })
    ),
    defaultValues,
    mode: 'onBlur', // Changed from 'onChange' to 'onBlur' to prevent premature validation
  });

  const {
    handleSubmit,
    trigger,
    control,
    reset,

    formState: { isSubmitting, errors },
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
          py: 1,
          bgcolor: '#F6F8FA',
          borderBottom: '1px solid #DFE1E7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">{patient ? 'Edit Patient' : 'Add New Patient'}</Typography>
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
                  Full Name
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
                  Gender
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
                  Blood Type
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
                  Date of Birth
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
                  Phone Number
                </Typography>
                <RHFTextField
                  placeholder="+966XXXXXXXXX"
                  name="PhoneNumber"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                  inputProps={{
                    maxLength: 13,
                  }}
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
                  Emergency Contact
                </Typography>
                <RHFTextField
                  placeholder="+966XXXXXXXXX"
                  name="EmergencyContact"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                  inputProps={{
                    maxLength: 13,
                  }}
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
                Address
              </Typography>
              <RHFTextField
                placeholder={t('LABEL.ADDRESS') || 'Enter patient address'}
                name="Address"
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
                multiline
                rows={1}
              />
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
            {patient ? 'Update Patient' : 'Add Patient'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
