'use client';

import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Stack,
  Dialog,
  Button,
  MenuItem,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useDoctorsDropdown } from 'src/hooks/use-doctors-query';
import { usePatientsDropdown } from 'src/hooks/use-patients-query';
import { useAppointments } from 'src/hooks/use-appointments-query';
import { useCreatePayment, useUpdatePayment } from 'src/hooks/use-payments-query';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect } from 'src/components/hook-form';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { ILookup } from 'src/types/lookups';

type Props = {
  open: boolean;
  onClose: () => void;
  paymentMethods: ILookup[];
  paymentStatus: ILookup[];
  ServiceTypes: ILookup[];
  payment?: import('src/types/payments').IPayment | null;
};

const getSchema = (isEditing: boolean) =>
  yup.object().shape({
    patientId: yup.number().required('Patient is required').min(1, 'Patient is required'),
    doctorId: yup.number().required('Doctor is required').min(1, 'Doctor is required'),
    PaymentAmount: isEditing
      ? yup.number().optional()
      : yup
          .number()
          .required('Payment amount is required')
          .min(0.01, 'Payment amount must be greater than 0'),
    paymentMethod: isEditing
      ? yup.number().optional()
      : yup.number().required('Payment method is required').min(1, 'Payment method is required'),
    AppointmentId: isEditing
      ? yup.number().optional()
      : yup.number().required('Appointment is required').min(1, 'Appointment is required'),

    status: yup.number().required('Status is required').min(1, 'Status is required'),
    description: yup.string().default(''),
  });

export default function PaymentDialog({
  open,
  onClose,
  paymentMethods,
  paymentStatus,
  ServiceTypes,
  payment,
}: Props) {
  const { data: doctorsData } = useDoctorsDropdown();
  const { data: patientsData } = usePatientsDropdown();
  const { data: appointmentsData } = useAppointments({ page: 1 });
  const { t } = useTranslate();
  const doctors = useMemo(() => doctorsData?.Data || doctorsData || [], [doctorsData]);
  const patients = useMemo(() => patientsData?.Data || patientsData || [], [patientsData]);
  const appointments = useMemo(
    () => appointmentsData?.Data?.Items || appointmentsData?.Items || [],
    [appointmentsData]
  );

  const isEditing = !!payment;

  const methods = useForm({
    resolver: yupResolver(getSchema(isEditing)),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      PaymentAmount: 0,
      paymentMethod: 0,
      AppointmentId: 0,
      status: 0,
      description: '',
    },
  });

  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();

  useEffect(() => {
    if (!open) return;
    if (payment) {
      methods.reset({
        patientId: payment.PatientId || 0,
        doctorId: payment.DoctorId || 0,
        PaymentAmount: payment.PaymentAmount || 0,
        paymentMethod: payment.PaymentMethod || 0,
        AppointmentId: payment.AppointmentId || 0,
        description: payment.Description || '',
      });
    } else {
      methods.reset({
        patientId: 0,
        doctorId: 0,
        PaymentAmount: 0,
        paymentMethod: 0,
        AppointmentId: 0,
        status: 0,
        description: '',
      });
    }
  }, [open, payment, methods]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (isEditing && payment) {
      await updateMutation.mutateAsync({
        id: payment.Id,
        data: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          PaymentAmount: Number(data.PaymentAmount),
          status: data.status,
          description: data.description || '',
        },
      });
    } else {
      await createMutation.mutateAsync(data as any);
    }
    onClose();
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          py: 2,
          bgcolor: '#F6F8FA',
          borderBottom: '1px solid #DFE1E7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">{isEditing ? 'Edit Payment' : 'New Payment'}</Typography>

        <IconButton
          onClick={onClose}
          sx={{
            color: '#666',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ borderBottom: '1px solid #DFE1E7', py: 3 }}>
          <Stack sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>
                {t('LABEL.PATIENT')}
              </Typography>
              <RHFSelect name="patientId" placeholder="Select Patient">
                {patients.map((p: any) => (
                  <MenuItem key={p.Id} value={p.Id}>
                    {p.Name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>
                {t('LABEL.DOCTOR')}
              </Typography>
              <RHFSelect name="doctorId" placeholder="Select Doctor">
                {doctors.map((d: any) => (
                  <MenuItem key={d.Id} value={d.Id}>
                    {d.Name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>
                {t('LABEL.AMOUNT')}
              </Typography>
              <RHFTextField name="PaymentAmount" placeholder="0.00" />
            </Box>

            {!isEditing && (
              <Box>
                <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>
                  {t('LABEL.PAYMENT_METHOD')}
                </Typography>
                <RHFSelect name="paymentMethod" placeholder="Select Method">
                  {paymentMethods.map((m) => (
                    <MenuItem key={m.Id} value={m.Id}>
                      {m.Name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Box>
            )}

            {!isEditing && (
              <Box>
                <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>
                  {t('LABEL.APPOINTMENT')}
                </Typography>
                <RHFSelect name="AppointmentId" placeholder="Select Appointment">
                  {appointments.map((a: any) => (
                    <MenuItem key={a.Id} value={a.Id}>
                      {a.PatientName} - {a.DoctorName}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Box>
            )}

            <Box>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>
                {t('LABEL.STATUS')}
              </Typography>
              <RHFSelect name="status" placeholder="Select Status">
                {paymentStatus.map((s) => (
                  <MenuItem key={s.Id} value={s.Id}>
                    {s.Name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>
                {t('LABEL.DESCRIPTION')}
                <span style={{ color: '#666D90', fontSize: '9px', marginLeft: 2 }}>
                  {' '}
                  {t('LABEL.OPTIONAL')}
                </span>
              </Typography>
              <RHFTextField name="description" multiline rows={3} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={onClose} color="primary">
            {t('BUTTON.CANCEL') || 'Cancel'}
          </Button>
          <LoadingButton
            loading={createMutation.isPending || updateMutation.isPending}
            type="submit"
            variant="contained"
            color="primary"
          >
            {isEditing
              ? t('BUTTON.UPDATE_PAYMENT') || 'Update Payment'
              : t('BUTTON.CREATE_PAYMENT') || 'Create Payment'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
