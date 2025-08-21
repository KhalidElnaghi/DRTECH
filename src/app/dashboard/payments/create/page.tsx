'use client';

import { useEffect } from 'react';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Grid, MenuItem, Paper, Stack, Typography } from '@mui/material';

import { useTranslate } from 'src/locales';

import FormProvider, { RHFSelect } from 'src/components/hook-form';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { useCreatePayment } from 'src/hooks/use-payments-query';
import { useLookups } from 'src/hooks/use-lookups-query';
import { useDoctorsDropdown } from 'src/hooks/use-doctors-query';
import { usePatientsDropdown } from 'src/hooks/use-patients-query';
import { useAppointments } from 'src/hooks/use-appointments-query';

const schema = yup.object().shape({
  patientId: yup.number().required('Patient is required').min(1),
  doctorId: yup.number().required('Doctor is required').min(1),
  paymentAmount: yup.number().required('Amount is required').min(0.01),
  paymentMethod: yup.number().required('Payment method is required').min(1),
  AppointmentId: yup.number().required('Appointment is required').min(1),
  status: yup.number().required('Status is required').min(1),
  description: yup.string().default(''),
});

export default function CreatePaymentPage() {
  const { t } = useTranslate();
  const router = useRouter();

  const { data: doctorsData } = useDoctorsDropdown();
  const { data: patientsData } = usePatientsDropdown();
  const { data: paymentMethods } = useLookups('payment-methods');
  const { data: paymentStatus } = useLookups('payment-status');
  const { data: appointmentsData } = useAppointments({ page: 1 });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      paymentAmount: 0,
      paymentMethod: 0,
      AppointmentId: 0,
      status: 0,
      description: '',
    },
  });

  const createMutation = useCreatePayment();

  const onSubmit = methods.handleSubmit(async (data) => {
    await createMutation.mutateAsync(data as any);
    router.push('/dashboard/payments');
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            New Payment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new payment record
          </Typography>
        </Box>
        <Button variant="text" onClick={() => router.back()}>
          Cancel
        </Button>
      </Stack>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <RHFSelect name="patientId" label="Patient">
                <MenuItem value={0}>Select Patient</MenuItem>
                {(patientsData?.Data || patientsData || []).map((p: any) => (
                  <MenuItem key={p.Id} value={p.Id}>
                    {p.FullName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSelect name="doctorId" label="Doctor">
                <MenuItem value={0}>Select Doctor</MenuItem>
                {(doctorsData?.Data || doctorsData || []).map((d: any) => (
                  <MenuItem key={d.Id} value={d.Id}>
                    {d.FullName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField name="paymentAmount" label="Amount" type="number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSelect name="paymentMethod" label="Payment Method">
                <MenuItem value={0}>Select Method</MenuItem>
                {paymentMethods?.map((m: any) => (
                  <MenuItem key={m.Id} value={m.Id}>
                    {m.Name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSelect name="AppointmentId" label="Appointment">
                <MenuItem value={0}>Select Appointment</MenuItem>
                {appointmentsData?.Data?.Items?.map((a: any) => (
                  <MenuItem key={a.Id} value={a.Id}>
                    {a.PatientName} - {a.DoctorName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSelect name="status" label="Status">
                <MenuItem value={0}>Select Status</MenuItem>
                {paymentStatus?.map((s: any) => (
                  <MenuItem key={s.Id} value={s.Id}>
                    {s.Name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="description" label="Description" multiline rows={3} />
            </Grid>
            <Grid item xs={12}>
              <LoadingButton loading={createMutation.isPending} type="submit" variant="contained">
                Create Payment
              </LoadingButton>
            </Grid>
          </Grid>
        </FormProvider>
      </Paper>
    </Box>
  );
}
