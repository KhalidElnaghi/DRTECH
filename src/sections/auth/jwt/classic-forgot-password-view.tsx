'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useAuthContext } from 'src/auth/hooks';
import { PasswordIcon } from 'src/assets/icons';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { t } from 'i18next';
import { InputAdornment } from '@mui/material';
import { countries } from 'src/assets/data';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';

// ----------------------------------------------------------------------

export default function ClassicForgotPasswordView() {
  const ForgotPasswordSchema = Yup.object().shape({
    phone: Yup.string().required('phone number is required'),
    country: Yup.string().required(t('country_is_required')),
  });
  const { forgot } = useAuthContext();

  const defaultValues = {
    phone: '',
    country: 'Saudi Arabia',

  };
  const router = useRouter();

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,

    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const code = countries?.find((item)=>item.label === data?.country)
      const phone =  code?.phone.concat(data?.phone) as string;
       await forgot?.(`+${phone}`);
      router.push(`${paths.auth.jwt.verify}`)
    } catch (error) {
      console.error(error);
    }
  });


  const renderForm = (
    <Stack spacing={3} alignItems="center">
       <RHFAutocomplete
         name="country"
         type="country"
         fullWidth
         label={t("LABEL.COUNTRY_CODE")}
         placeholder={t("LABEL.COUNTRY_CODE")}
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

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        {t('MESSAGE.SEND_CODE')}
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        {t('MESSAGE.RETURN_TO_lOGIN')}
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h3">  {t('MESSAGE.FORGOT_PASSWORD')}</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {t('MESSAGE.FORGOT_PASSWORD_MESSAGE')}
        </Typography>
      </Stack>
    </>
  );

  return (
    <>
      {renderHead}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}


function InputIcon(icon: string = 'solar:pen-new-square-outline') {
  return (
    <InputAdornment position="start">
      <Iconify icon={icon} color={'secondary.main'} />
    </InputAdornment>
  );
}
