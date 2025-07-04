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
import { useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { countries } from 'src/assets/data';
import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { t } = useTranslate();
  const { login } = useAuthContext();

  const router = useRouter();

  const theme = useTheme();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    phone: Yup.string().required(t('phone_is_required')),
    country: Yup.string().required(t('country_is_required')),
    password: Yup.string().required(t('password_is_required')),
  });

  const defaultValues = {
    phone: '',
    country: 'Saudi Arabia',
    password: '',
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
      const code = countries?.find((item) => item.label === data?.country);
      const phone = code?.phone.concat(data?.phone) as string;
      await login?.(`+${phone}`, data.password);
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 2, mx: 'auto', position: 'relative' }}>
      <Typography variant="h2" textTransform="capitalize" color="secondary">
        {t('TITLE.SIGN_IN')}
      </Typography>
      <Image
        src="/assets/images/login/image-7.svg"
        alt="image"
        width={75}
        height={62}
        style={{
          position: 'absolute',
          top: '-20px',
          left: '-40px',
        }}
      />
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5} sx={{ minWidth: '100%' }}>
      <RHFAutocomplete
        name="country"
        type="country"
        fullWidth
        label={t('LABEL.COUNTRY_CODE')}
        placeholder={t('LABEL.COUNTRY_CODE')}
        options={countries.map((option) => option.label)}
        getOptionLabel={(option) => option}
      />
      <RHFTextField
        sx={{
          color: 'red',
        }}
        name="phone"
        type="tel"
        label={t('LABEL.PHONE')}
        InputProps={{
          startAdornment: InputIcon('ic:round-phone-iphone'),
        }}
      />

      <RHFTextField
        name="password"
        label={t('LABEL.PASSWORD')}
        // @ts-ignore
        type={password.value ? 'text' : 'password'}
        InputProps={{
          startAdornment: InputIcon('solar:lock-password-bold'),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle}>
                <Iconify
                  icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  color="secondary.main"
                />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            paddingLeft: theme.direction === 'rtl' ? 0 : '14px', // Adjust padding for no extra space
            paddingRight: theme.direction === 'rtl' ? 0 : '5px',
            '& .MuiInputBase-input': {
              paddingInline: theme.direction === 'ltr' ? 0 : '14px', // Adjust this value to increase/decrease padding
            },
          },
        }}
      />

      <Link
        variant="body2"
        color="secondary"
        underline="always"
        href={paths.auth.jwt.forgot}
        component={RouterLink}
      >
        {t('BUTTON.FORGOT_PASSWORD')}
      </Link>

      <LoadingButton
        fullWidth
        color="secondary"
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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 14,
        minWidth: '100%',
        minHeight: '55dvh',
      }}
    >
      {renderHead}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
        )}
        {renderForm}
      </FormProvider>
    </Box>
  );
}

function InputIcon(icon: string = 'solar:pen-new-square-outline') {
  return (
    <InputAdornment position="start">
      <Iconify icon={icon} color="secondary.main" />
    </InputAdornment>
  );
}
