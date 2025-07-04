'use client';
import { useTranslate } from 'src/locales';
import { Box, Typography } from '@mui/material';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';

import Image from 'next/image';
import { editPercentage } from 'src/actions/courses';
import { getErrorMessage } from 'src/utils/axios';

type props = {
  statistics: any;
  priceProfit: number;
};

const Statistics = ({ statistics, priceProfit }: Readonly<props>) => {
  const formDefaultPrice = {
    price_profit: priceProfit,
  };
  const methods2 = useForm({
    defaultValues: formDefaultPrice,
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods2;
  const { t } = useTranslate();
  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await editPercentage(data);

      if (res?.error) {
        enqueueSnackbar(`${res?.error}`, { variant: 'error' });
      } else {
        enqueueSnackbar(t('MESSAGE.UPDATED_SUCCESSFULLY'));
      }
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  });
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr 1fr' },
          paddingInline: 4,
          gap: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex ',
            borderRadius: '10px',
            bgcolor: '#D5F3E6',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" color="#004B50">
              {t('LABEL.CLIENTS_NUMBER')}
            </Typography>
            <Typography variant="h3" color="#004B50" fontWeight={700}>
              {statistics?.clients}
            </Typography>
          </Box>
          <Image src="/assets/images/home/clients.svg" alt="image" width={50} height={50} />
        </Box>
        <Box
          sx={{
            display: 'flex ',
            borderRadius: '10px',
            bgcolor: '#FFF3D7',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" color="#7A4100">
              {t('LABEL.CLIENTS_WHO_BOOKED_COURSES')}
            </Typography>
            <Typography variant="h4" color="#7A4100" sx={{ textOverflow: 'truncate' }}>
              {statistics?.clientsAndCourses}
            </Typography>
          </Box>
          <Image src="/assets/images/home/booked.svg" alt="image" width={50} height={50} />
        </Box>
        <Box
          sx={{
            display: 'flex ',
            borderRadius: '10px',
            bgcolor: '#FDD9F7',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" color="#7A0068">
              {t('LABEL.CENTERS_NUMBER')}
            </Typography>
            <Typography variant="h4" color="#7A0068">
              {statistics?.centers}
            </Typography>
          </Box>
          <Image src="/assets/images/home/centers.svg" alt="image" width={50} height={50} />
        </Box>
      </Box>
      <FormProvider methods={methods2} onSubmit={onSubmit}>
        <Box
          sx={{
            p: 6,
            bgcolor: (theme) => theme.palette.grey[100],
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
            <RHFTextField
              fullWidth
              name="price_profit"
              label={t('LABEL.PERCENTAGE_OF_PROFITS')}
              inputMode="search"
              InputProps={{ sx: { borderBottomRightRadius: 0, borderTopRightRadius: 0 } }}
              type="number"
            />
            <LoadingButton
              color="secondary"
              sx={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {t('LABEL.APPLY')}
            </LoadingButton>
          </Box>
        </Box>
      </FormProvider>
    </>
  );
};

export default Statistics;
