'use client';

import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Box,
  Stack,
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useCreateDoctor, useUpdateDoctor } from 'src/hooks/use-doctors-query';

import { useTranslate } from 'src/locales';

import { ILookup } from 'src/types/lookups';
import { IDoctor, ICreateDoctor, IUpdateDoctor, ISpecialization } from 'src/types/doctors';

interface DoctorDialogProps {
  open: boolean;
  onClose: () => void;
  doctor?: IDoctor;
  specializations: ISpecialization[] | undefined;
  statusOptions: ILookup[] | undefined;
}

export const phoneRegex = /^\+966[0-9]{9}$/;

const DoctorDialog = ({
  open,
  onClose,
  doctor,
  specializations,
  statusOptions,
}: DoctorDialogProps) => {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const [isFormReady, setIsFormReady] = useState(false);

  const createDoctorMutation = useCreateDoctor();
  const updateDoctorMutation = useUpdateDoctor();

  const isEditing = !!doctor;

  const validationSchema = Yup.object().shape({
    FullName: Yup.string().required(t('DOCTOR.FULL_NAME_REQUIRED') || 'Full name is required'),
    SpecializationId: Yup.number()
      .min(1, t('DOCTOR.SPECIALIZATION_REQUIRED') || 'Specialization is required')
      .required(t('DOCTOR.SPECIALIZATION_REQUIRED') || 'Specialization is required'),
    PhoneNumber: Yup.string()
      .matches(
        phoneRegex,
        t('DOCTOR.PHONE_INVALID') || 'Phone number must be in format +966XXXXXXXXX'
      )
      .required(t('DOCTOR.PHONE_REQUIRED') || 'Phone number is required'),
    Status: Yup.number().required(t('DOCTOR.STATUS_REQUIRED') || 'Status is required'),
    email: isEditing
      ? Yup.string().optional()
      : Yup.string()
          .email(t('DOCTOR.EMAIL_INVALID') || 'Invalid email format')
          .required(t('DOCTOR.EMAIL_REQUIRED') || 'Email is required'),
    password: isEditing
      ? Yup.string().optional()
      : Yup.string()
          .min(6, t('DOCTOR.PASSWORD_MIN') || 'Password must be at least 6 characters')
          .required(t('DOCTOR.PASSWORD_REQUIRED') || 'Password is required'),
  });

  const methods = useForm<ICreateDoctor>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      FullName: '',
      SpecializationId: 0,
      PhoneNumber: '',
      Status: 0,
      email: '', // Ensure email starts empty
      password: '', // Ensure password starts empty
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      if (doctor) {
        // Editing existing doctor
        reset({
          FullName: doctor.FullName || '',
          SpecializationId: doctor.SpecializationId || 0,
          PhoneNumber: doctor.PhoneNumber || '',
          Status: doctor.Status || 0,
          email: doctor.email || '',
          password: '', // Always empty for security when editing
        });
      } else {
        // Creating new doctor - ensure email and password are completely empty
        // First reset with empty values
        reset({
          FullName: '',
          SpecializationId: 0,
          PhoneNumber: '',
          Status: 0,
          email: '',
          password: '',
        });

        // Force clear email and password fields specifically
        setTimeout(() => {
          setValue('email', '');
          setValue('password', '');
        }, 10);
      }
      setIsFormReady(true);
    }
  }, [open, doctor, reset, setValue]);

  const handleClose = () => {
    setIsFormReady(false);
    // Clear the form when closing
    reset({
      FullName: '',
      SpecializationId: 0,
      PhoneNumber: '',
      Status: 0,
      email: '',
      password: '',
    });
    onClose();
  };

  const onSubmit = async (data: ICreateDoctor) => {
    try {
      if (isEditing && doctor) {
        // Update existing doctor
        const updateData: IUpdateDoctor = { ...data };
        if (!updateData.password) {
          delete updateData.password;
        }

        await updateDoctorMutation.mutateAsync({ id: doctor.Id.toString(), data: updateData });

        enqueueSnackbar(t('MESSAGE.DOCTOR_UPDATED_SUCCESSFULLY') || 'Doctor updated successfully', {
          variant: 'success',
        });
      } else {
        // Create new doctor
        await createDoctorMutation.mutateAsync(data);

        enqueueSnackbar(t('MESSAGE.DOCTOR_CREATED_SUCCESSFULLY') || 'Doctor created successfully', {
          variant: 'success',
        });
      }

      onClose();
      reset();
    } catch (error: any) {
      console.error('Error saving doctor:', error);

      // Extract error message from API response
      let errorMessage = t('MESSAGE.ERROR_OCCURRED') || 'An error occurred while saving the doctor';

      // Since axios interceptor transforms error to error.response.data, we access it directly
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

  if (!isFormReady || !specializations || !statusOptions) {
    return null;
  }

  const getSubmitButtonText = () => {
    if (isSubmitting || createDoctorMutation.isPending || updateDoctorMutation.isPending) {
      return isEditing
        ? t('COMMON.UPDATING') || 'Updating...'
        : t('COMMON.CREATING') || 'Creating...';
    }
    return isEditing ? t('COMMON.UPDATE') || 'Update' : t('COMMON.CREATE') || 'Create';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing
          ? t('DOCTOR.EDIT_DOCTOR') || 'Edit Doctor'
          : t('DOCTOR.ADD_DOCTOR') || 'Add New Doctor'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit as any)}>
        <DialogContent>
          <Stack spacing={1} sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
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
                {t('DOCTOR.FULL_NAME') || 'Full Name'}
              </Typography>
              <Controller
                name="FullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Enter full name"
                    error={!!errors.FullName}
                    helperText={errors.FullName?.message}
                  />
                )}
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
                {t('DOCTOR.SPECIALIZATION') || 'Specialization'}
              </Typography>
              <Controller
                name="SpecializationId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.SpecializationId}>
                    <Select {...field}>
                      <MenuItem value={0}>
                        {t('DOCTOR.SELECT_SPECIALIZATION') || 'Select Specialization'}
                      </MenuItem>
                      {specializations?.map((spec) => (
                        <MenuItem key={spec.Id} value={spec.Id}>
                          {spec.Name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.SpecializationId && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {errors.SpecializationId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
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
                {t('DOCTOR.PHONE_NUMBER') || 'Phone Number'}
              </Typography>
              <Controller
                name="PhoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="+966XXXXXXXXX"
                    error={!!errors.PhoneNumber}
                    helperText={errors.PhoneNumber?.message}
                  />
                )}
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
                {t('AVAILABILITY_STATUS') || 'Availability Status'}
              </Typography>
              <Controller
                name="Status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.Status}>
                    <Select {...field}>
                      <MenuItem value={0}>{t('DOCTOR.SELECT_STATUS') || 'Select Status'}</MenuItem>
                      {statusOptions?.map((status) => (
                        <MenuItem key={status.Id} value={status.Id}>
                          {status.Name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.Status && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {errors.Status.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            {!isEditing && (
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
                  {t('DOCTOR.EMAIL') || 'Email'}
                </Typography>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Enter email address"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Box>
            )}

            {!isEditing && (
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
                  {t('DOCTOR.PASSWORD') || 'Password'}
                </Typography>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Enter password"
                      type="password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            {t('COMMON.CANCEL') || 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              isSubmitting || createDoctorMutation.isPending || updateDoctorMutation.isPending
            }
          >
            {getSubmitButtonText()}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DoctorDialog;
