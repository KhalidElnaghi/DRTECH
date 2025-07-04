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
import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { t } from 'i18next';
import { Container, IconButton, InputAdornment } from '@mui/material';
import { countries } from 'src/assets/data';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';
import Grid from '@mui/material/Unstable_Grid2';
import { editPhoneNumber } from 'src/actions/profile-actions';
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export default function ChangePhoneView() {
  const ForgotPasswordSchema = Yup.object().shape({
    phone: Yup.string().required('phone number is required'),
    country: Yup.string().required(t('country_is_required')),
    password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  });
  const { logout } = useAuthContext();

  const defaultValues = {
    phone: '',
    country: 'Saudi Arabia',
    password:'',
  };
  const router = useRouter();
  const password = useBoolean();

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });
  const {user} = useAuthContext();
  const {
    handleSubmit,

    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {

    try {
      const code = countries?.find((item)=>item.label === data?.country)
      const phone =  code?.phone.concat(data?.phone) as string;
      const dataForm = {
        "password": data?.password,
        "currentPhone": user?.user?.phone,
        "newPhone": `+${phone}`,
        "currentEmail": "",
        "newEmail": "",
        "authType": "PHONE"
      };
      const res = await editPhoneNumber(dataForm);
      if (res?.error) {
        enqueueSnackbar(`${res?.error || t('MESSAGE.SOMETHING_WRONG')}`, { variant: 'error' });

      } else {
        enqueueSnackbar(t('MESSAGE.CHANGE_PHONE_SUCCESS'), {
          variant: 'success',
        });
       await logout();
       router.replace('/');
      }
    //  router.push(`${paths.auth.jwt.verify}`)
    } catch (error) {
      console.error(error);}
  });


  const renderForm = (
    <Grid container spacing={3} alignItems="flex-start" justifyContent="flex-start">
      <Grid xs={12} md={6.1}>

       <RHFAutocomplete
         name="country"
         type="country"
         fullWidth
         label={t("LABEL.COUNTRY_CODE")}
         placeholder={t("LABEL.COUNTRY_CODE")}
         options={countries.map((option) => option.label)}
         getOptionLabel={(option) => option}
            />
      </Grid>
      <Grid xs={12} md={6.1}>
      <RHFTextField
        sx={{
          color: 'red',
        }}
        name="phone"
        type="tel"
        label={t('LABEL.New_PHONE')}
        InputProps={{
          startAdornment: InputIcon('ic:round-phone-iphone'),
        }}
      />
    </Grid>
    <Grid xs={12} md={6.1}>
    <RHFTextField
        name="password"
        label="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Grid>
    <Grid xs={12} md={6.1} >
    <LoadingButton
        sx={{width: {md:'auto', xs:'100%'}}}
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        {t('BUTTON.CHANGE_PHONE')}
      </LoadingButton>

    </Grid>

    </Grid>
  );

  const renderHead = (
    <>
       <Iconify  color="secondary.main" icon="ic:baseline-phone-iphone" width={96}  />

      <Stack spacing={1} sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h5">  {t('LABEL.CHANGE_PHONE_NUMBER')}</Typography>


      </Stack>
    </>
  );

  return (
    <Container>

      {renderHead}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </Container>

  );
}


function InputIcon(icon: string = 'solar:pen-new-square-outline') {
  return (
    <InputAdornment position="start">
      <Iconify icon={icon} color={'secondary.main'} />
    </InputAdornment>
  );
}
