'use client';

import { Box, Card, Container, Pagination, Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useSettingsContext } from 'src/components/settings';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import NotificationItem from './notification-item';
import FormProvider from 'src/components/hook-form';
import CutomAutocompleteView from 'src/components/AutoComplete/CutomAutocompleteView';
import { useTranslate } from 'src/locales';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
type Props = {
  notifications: any;
};

const notification_types = [
  { name_en: 'New Courses', name_ar: 'الدورات الجديدة', value: 'ADMIN_CENTER_NEW_COURSE' },
  {
    name_en: 'Packages purchased',
    name_ar: 'الباقات المشتراة',
    value: 'ADMIN_CENTER_PACKAGE_PURCHASED',
  },
  { name_en: 'Registered centers', name_ar: 'المراكز المسجلة', value: 'ADMIN_CENTER_REGISTER' },
  { name_en: 'Registered clients', name_ar: 'العملاء المسجلين', value: 'ADMIN_CLIENT_REGISTER' },
  {
    name_en: 'Purchase course as a gift',
    name_ar: 'الدورات المرسلة ك هدية',
    value: 'ADMIN_CLIENT_SEND_GIFT',
  },
  {
    name_en: 'Courses purchased',
    name_ar: 'الدورات المشتراة',
    value: 'ADMIN_CLIENT_COURSE_PURCHASED',
  },
];
const NotificationView = ({ notifications }: Props) => {
  const settings = useSettingsContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslate();

  const formDefaultValues = {
    name: '',
    date: '',
  };

  const methods = useForm({
    defaultValues: formDefaultValues,
  });

  const { control } = methods;

  const count = (count: number) => {
    if (count / 6 > 1) {
      return Math.ceil(count / 6);
    } else return 1;
  };
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    createQueryString('notifications_page', value);
  };
  const createQueryString = useCallback(
    (name: string, value: number | Date | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        if (name === 'select_date') {
          params.set(name, format(value, 'yyyy-MM-dd'));
        } else {
          params.set(name, String(value));
        }
      } else {
        params.delete(name);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <Card sx={{ p: 2, mt: 3 }}>
      <Typography variant="h4" color="secondary">
        {t('LABEL.NOTIFICATIONS')}
      </Typography>
      <FormProvider methods={methods}>
        <Box
          rowGap={1}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(2 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
          sx={{ width: '50%', mx: 'auto' }}
        >
          <CutomAutocompleteView
            items={notification_types as any[]}
            label={t('LABEL.TYPE')}
            placeholder={t('LABEL.TYPE')}
            name="type"
            onCustomChange={(selectedType: any) =>
              createQueryString('notification_type', selectedType?.value ?? '')
            }
          />
          <Controller
            name="date"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                label={t('LABEL.DATE')}
                format="dd-MM-yyyy"
                value={field.value ? new Date(field.value) : null}
                onChange={(newValue) => {
                  field.onChange(newValue);
                  createQueryString('select_date', newValue);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message,
                  },
                  /* actionBar: { actions: ['clear'] }, */
                }}
              />
            )}
          />
        </Box>
      </FormProvider>
      {notifications.data.length === 0 ? (
        <Typography sx={{ textAlign: 'center', mt: 4 }} color="secondary">
          {' '}
          {t('LABEL.NO_NOTIFICATIONS')}
        </Typography>
      ) : (
        <Stack
          sx={{
            display: 'flex',
            py: 4,
            gap: 2,
          }}
        >
          {notifications.data.map((data: any) => (
            <NotificationItem key={data.id} data={data} />
          ))}
        </Stack>
      )}
      {notifications.data.length > 0 && (
        <Pagination
          sx={{ display: 'flex', justifyContent: 'center' }}
          count={count(notifications.meta.itemCount)}
          page={Number(searchParams.get('notifications_page')) || 1}
          color="secondary"
          onChange={handleChange}
        />
      )}
    </Card>
  );
};

export default NotificationView;
