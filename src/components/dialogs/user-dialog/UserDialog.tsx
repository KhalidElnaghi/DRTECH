'use client';

import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Box,
  Stack,
  Dialog,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useCreateUser, useUpdateUser } from 'src/hooks/use-users-query';

import { useTranslate } from 'src/locales';

import FormProvider, { RHFSelect } from 'src/components/hook-form';

import { ILookup } from 'src/types/lookups';
import { TableUser, CreateUserData, UpdateUserData } from 'src/types/users';

import { phoneRegex } from '../doctor-dialog/DoctorDialog';

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user?: TableUser;
  roles: ILookup[];
  statuses: ILookup[];
  specializations: { Id: number; Name: string }[];
}

// Build schema dynamically: password required only on create (not on edit)

export default function UserDialog({
  open,
  onClose,
  user,
  roles,
  statuses,
  specializations,
}: UserDialogProps) {
  const { t } = useTranslate();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const defaultValues: CreateUserData = useMemo(
    () => ({
      fullName: user?.FullName || '',
      email: user?.Email || '',
      password: '',
      userRole: user?.Role ?? 0,
      // phoneNumber: '',
    }),
    [user]
  );

  const doctorRoleId = roles.find((r) => r.Name?.toLowerCase?.() === 'doctor')?.Id;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

  const getSchema = (isEditing: boolean) =>
    Yup.object().shape({
      fullName: Yup.string().required('Full name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: isEditing
        ? Yup.string()
            .trim()
            .nullable()
            .notRequired()
            .test(
              'password-optional',
              'At least 8 characters, one lowercase, one uppercase, and one non-alphanumeric',
              (value) => !value || passwordRegex.test(value || '')
            )
        : Yup.string()
            .matches(
              passwordRegex,
              'At least 8 characters, one lowercase, one uppercase, and one non-alphanumeric'
            )
            .required('Required'),
      userRole: Yup.number().required('Role is required').min(0, 'Role is required'),
      // phoneNumber: Yup.string().matches(phoneRegex, 'Phone number must be in format +966XXXXXXXXX'),

      doctor: Yup.object({
        phoneNumber: Yup.string()
          .matches(phoneRegex, 'Phone number must be in format +966XXXXXXXXX')
          .required('Phone number is required'),
        specializationId: Yup.number()
          .typeError('Specialization is required')
          .required('Specialization is required')
          .min(1, 'Specialization is required'),
        status: Yup.number()
          .typeError('Status is required')
          .required('Status is required')
          .min(0, 'Status is required'),
      }).when('userRole', {
        is: (role: number) => (doctorRoleId ? role === doctorRoleId : false),
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.strip(),
      }),
    });

  const methods = useForm<CreateUserData>({
    resolver: yupResolver(getSchema(!!user)) as any,
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, watch, reset, control, formState } = methods;
  const { isSubmitting } = formState;

  const selectedRole = watch('userRole');

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const isEmpty = (val: unknown) => val === undefined || val === null || val === '' || val === 0;
    const stripEmptyDoctor = (payload: Partial<CreateUserData> | Partial<UpdateUserData>) => {
      const d: any = (payload as any).doctor;
      if (!d) return;
      ['phoneNumber', 'specializationId', 'status'].forEach((k) => {
        if (isEmpty(d[k])) delete d[k];
      });
      if (!d || Object.keys(d).length === 0) delete (payload as any).doctor;
    };

    if (user) {
      const updatePayload: UpdateUserData = { ...data };
      if (!updatePayload.password) delete updatePayload.password;
      stripEmptyDoctor(updatePayload);
      try {
        await updateUser.mutateAsync({ id: user.Id, data: updatePayload });
        onClose();
      } catch (error: any) {
        // Extract error message from API response
        let errorMessage = ``;
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
    } else {
      const createPayload: CreateUserData = { ...data } as CreateUserData;
      stripEmptyDoctor(createPayload);
      try {
        await createUser.mutateAsync(createPayload);
        onClose();
      } catch (error: any) {
        // Extract error message from API response
        let errorMessage = ``;
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
    }
  });

  const isDoctorRole = () => {
    const doctorRole = roles.find((r) => r.Name?.toLowerCase?.() === 'doctor');
    return doctorRole ? selectedRole === doctorRole.Id : false;
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ borderBottom: '1px solid #DFE1E7', py: 3 }}>
          <Stack spacing={2} sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <Box>
              <Typography sx={{ mb: 0.5, color: '#666D80', fontSize: '14px' }}>
                Full Name
              </Typography>
              <Controller
                name="fullName"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="e.g. Yazeed Al Harbi"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>
            {!user && (
              <Box>
                <Typography sx={{ mb: 0.5, color: '#666D80', fontSize: '14px' }}>Role</Typography>
                <Controller
                  name="userRole"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <RHFSelect
                      {...field}
                      placeholder="Select a role"
                      error={!!error}
                      helperText={error?.message}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.Id} value={role.Id}>
                          {role.Name}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  )}
                />
              </Box>
            )}
            <Box>
              <Typography sx={{ mb: 0.5, color: '#666D80', fontSize: '14px' }}>Email</Typography>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    type="email"
                    fullWidth
                    placeholder="e.g. yazeedalharbi@example.com"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>
            {!user && (
              <Box>
                <Typography sx={{ mb: 0.5, color: '#666D80', fontSize: '14px' }}>
                  Password
                </Typography>
                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      type="password"
                      fullWidth
                      placeholder="e.g. At least 8 characters one lowercase and one uppercase and one non alphanumeric character"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Box>
            )}
            {isDoctorRole() && (
              <>
                <Box>
                  <Typography sx={{ mb: 0.5, color: '#666D80', fontSize: '14px' }}>
                    Specialization
                  </Typography>
                  <Controller
                    name="doctor.specializationId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <RHFSelect
                        {...field}
                        placeholder="Select specialization"
                        error={!!error}
                        helperText={error?.message}
                      >
                        {specializations.map((s) => (
                          <MenuItem key={s.Id} value={s.Id}>
                            {s.Name}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    )}
                  />
                </Box>
                <Box>
                  <Typography sx={{ mb: 0.5, color: '#666D80', fontSize: '14px' }}>
                    Status
                  </Typography>
                  <Controller
                    name="doctor.status"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <RHFSelect
                        {...field}
                        placeholder="Select status"
                        error={!!error}
                        helperText={error?.message}
                      >
                        {statuses.map((status) => (
                          <MenuItem key={status.Id} value={status.Id}>
                            {status.Name}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    )}
                  />
                </Box>
                <Box>
                  <Typography sx={{ mb: 0.5, color: '#666D80', fontSize: '12px' }}>
                    Phone Number
                  </Typography>
                  <Controller
                    name="doctor.phoneNumber"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="+966XXXXXXXXX"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            {t('COMMON.CANCEL') || 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || createUser.isPending || updateUser.isPending}
          >
            {user ? t('COMMON.UPDATE') || 'Update' : t('COMMON.CREATE') || 'Create'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
