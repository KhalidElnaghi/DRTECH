'use client';

import * as Yup from 'yup';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Card, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/app/auth/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { countries } from 'src/assets/data';
import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField, RHFCheckbox } from 'src/components/hook-form';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';
import AuthFooter from 'src/components/auth-footer';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { t } = useTranslate();
  const { login, error, clearError } = useAuthContext();

  const router = useRouter();

  const theme = useTheme();

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required(t('phone_is_required')).email('Invalid email. Please try again.'),
    password: Yup.string().required(t('password_is_required')),
    keepMeLoggedIn: Yup.boolean().default(false),
  });

  const defaultValues = {
    email: 'prod-admin@drtech.com',
    password: 'SecureProductionPassword@456',
    keepMeLoggedIn: false,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      clearError();
      await login?.(data.email, data.password, data.keepMeLoggedIn);
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (loginError) {
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
        <Image src="/assets/icons/auth/login.svg" alt="Login Icon" width={100} height={100} />
      </Box>
      <Typography
        sx={{
          color: '#000000',
          fontFamily: '    ',
          fontWeight: 600,
          fontStyle: 'normal',
          fontSize: '24px',
          lineHeight: '130%',
          letterSpacing: '0%',
          textAlign: 'center',
        }}
      >
        {t('TITLE.WELCOME_BACK')}
      </Typography>
      <Typography
        sx={{
          color: '#6B7280', // gray color
          fontFamily: '    ',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '16px',
          lineHeight: '150%',
          letterSpacing: '2%',
          textAlign: 'center',
        }}
      >
        {t('TITLE.LOGIN_TO_MANAGE_YOUR_HOSPITAL_DASHBOARD')}
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5} sx={{ minWidth: '100%' }}>
      <RHFTextField
        name="email"
        label={t('LABEL.EMAIL')}
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

      <RHFTextField
        name="password"
        label={t('LABEL.PASSWORD')}
        // @ts-ignore
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
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {' '}
        <RHFCheckbox
          name="keepMeLoggedIn"
          label={t('LABEL.KEEP_ME_LOGGED_IN')}
          sx={{ alignSelf: 'flex-start' }}
        />
        <Link
          variant="body2"
          color="primary"
          underline="always"
          href={paths.auth.jwt.forgot}
          component={RouterLink}
        >
          {t('BUTTON.FORGOT_PASSWORD')}
        </Link>
      </Box>

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        {t('BUTTON.LOGIN')}
      </LoadingButton>
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
            {!!error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            {renderForm}
          </FormProvider>
        </Card>
      </Box>

      <AuthFooter />
    </>
  );
}

function InputIcon(icon: string = 'solar:pen-new-square-outline') {
  return (
    <InputAdornment position="start">
      <Iconify icon={icon} color="secondary.main" />
    </InputAdornment>
  );
}
