'use client';

import * as Yup from 'yup';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Card, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
import AuthFooter from 'src/components/auth-footer';

// ----------------------------------------------------------------------

export default function JwtForgotPasswordView() {
  const { t } = useTranslate();
  const { forgot } = useAuthContext();

  const router = useRouter();

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().required(t('EMAIL_REQUIRED')).email('Invalid email. Please try again.'),
  });

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    router.push(paths.auth.jwt.resetPassword);
    // try {
    // Call the forgot password function with email
    // await forgot?.(data.email);
    // Redirect to reset password page
    // } catch (error) {
    // console.error(error);
    reset();
    // }
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
        Forgot Password
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
        Enter your registered email and we&apos;ll send you a reset link
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5} sx={{ minWidth: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {' '}
        <Typography
          sx={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            fontStyle: 'Medium',
            fontSize: 14,
            lineHeight: '150%',
            letterSpacing: '2%',
            color: '#666D80',
            mx: 0.5,
          }}
        >
          Email
        </Typography>
        <RHFTextField
          name="email"
          placeholder="example@domain.com"
          error={!!methods.formState.errors.email}
          helperText={methods.formState.errors.email?.message}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-error fieldset': {
                borderColor: 'red',
              },
            },
            '& .MuiFormHelperText-root.Mui-error': {
              color: 'red',
            },
          }}
        />
      </Box>

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Forgot Password
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
