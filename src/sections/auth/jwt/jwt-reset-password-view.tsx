'use client';

import * as Yup from 'yup';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { Card } from '@mui/material';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/app/auth/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
import AuthFooter from 'src/components/auth-footer';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function JwtResetPasswordView() {
  const { t } = useTranslate();
  // const { resetPassword } = useAuthContext(); // Commented out until implemented

  const router = useRouter();

  const password = useBoolean();
  const confirmPassword = useBoolean();

  const ResetPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const defaultValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      router.push(paths.auth.jwt.login);
    } catch (error) {
      console.error(error);
      reset();
    }
  });

  const renderHead = (
    <Stack spacing={1} sx={{ mb: 3, mx: 'auto', position: 'relative', textAlign: 'center' }}>
      <Box
        sx={{
          mx: 'auto',
          mb: 2,
        }}
      >
        <Image
          src="/assets/images/auth/reset-password.svg"
          alt="Reset Password Icon"
          width={100}
          height={100}
        />
      </Box>
      <Typography
        sx={{
          color: '#000000',
          fontFamily: 'Inter Tight',
          fontWeight: 600,
          fontStyle: 'normal',
          fontSize: '24px',
          lineHeight: '130%',
          letterSpacing: '0%',
          textAlign: 'center',
        }}
      >
        Create New Password
      </Typography>
      <Typography
        sx={{
          color: '#6B7280', // gray color
          fontFamily: 'Inter Tight',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '16px',
          lineHeight: '150%',
          letterSpacing: '2%',
          textAlign: 'center',
        }}
      >
        Enter new password
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5} sx={{ minWidth: '100%' }}>
      <RHFTextField
        name="newPassword"
        label="New Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle}>
                <Iconify
                  icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  color="primary"
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
        error={!!methods.formState.errors.newPassword}
        helperText={methods.formState.errors.newPassword?.message}
      />

      <RHFTextField
        name="confirmPassword"
        label="Confirm New Password"
        type={confirmPassword.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPassword.onToggle}>
                <Iconify
                  icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  color="primary"
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
        error={!!methods.formState.errors.confirmPassword}
        helperText={methods.formState.errors.confirmPassword?.message}
      />

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Reset Password
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.login}
        variant="subtitle2"
        color="primary"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
          justifyContent: 'center',
          textDecoration: 'none',
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: '8px',
          py: 1.5,
          '&:hover': {
            textDecoration: 'none',
          },
        }}
      >
        Back to Login
      </Link>
    </Stack>
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <Card
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '500px',
            minHeight: '55dvh',
            bgcolor: 'white',
            p: 4,
            mb: 8, // Add margin bottom to prevent overlap with footer
          }}
        >
          {renderHead}

          <FormProvider methods={methods} onSubmit={onSubmit}>
            {renderForm}
          </FormProvider>
        </Card>
      </Box>

      <AuthFooter />
    </>
  );
}
