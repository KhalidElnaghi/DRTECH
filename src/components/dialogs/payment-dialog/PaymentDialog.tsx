'use client';

import * as yup from 'yup';
import { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Stack,
  Dialog,
  Button,
  MenuItem,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import FormProvider, { RHFSelect } from 'src/components/hook-form';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { ILookup } from 'src/types/lookups';
import { useCreatePayment } from 'src/hooks/use-payments-query';
import { useDoctorsDropdown } from 'src/hooks/use-doctors-query';
import { usePatientsDropdown } from 'src/hooks/use-patients-query';
import { useAppointments } from 'src/hooks/use-appointments-query';
import Iconify from 'src/components/iconify';

type Props = {
  open: boolean;
  onClose: () => void;
  paymentMethods: ILookup[];
  paymentStatus: ILookup[];
};

const schema = yup.object().shape({
  patientId: yup.number().required('Patient is required').min(1, 'Patient is required'),
  doctorId: yup.number().required('Doctor is required').min(1, 'Doctor is required'),
  paymentAmount: yup.number().required('Amount is required').min(0.01, 'Amount is required'),
  paymentMethod: yup
    .number()
    .required('Payment method is required')
    .min(1, 'Payment method is required'),
  AppointmentId: yup.number().required('Appointment is required').min(1, 'Appointment is required'),
  status: yup.number().required('Status is required').min(1, 'Status is required'),
  description: yup.string().default(''),
});

export default function PaymentDialog({ open, onClose, paymentMethods, paymentStatus }: Props) {
  const { t } = useTranslate();
  const { data: doctorsData } = useDoctorsDropdown();
  const { data: patientsData } = usePatientsDropdown();
  const { data: appointmentsData } = useAppointments({ page: 1 });

  const doctors = useMemo(() => doctorsData?.Data || doctorsData || [], [doctorsData]);
  const patients = useMemo(() => patientsData?.Data || patientsData || [], [patientsData]);
  const appointments = useMemo(
    () => appointmentsData?.Data?.Items || appointmentsData?.Items || [],
    [appointmentsData]
  );

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
        <Typography variant="h6">New Payment</Typography>

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
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>Patient</Typography>
              <RHFSelect name="patientId" placeholder="Select Patient">
                {patients.map((p: any) => (
                  <MenuItem key={p.Id} value={p.Id}>
                    {p.Name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>Doctor</Typography>
              <RHFSelect name="doctorId" placeholder="Select Doctor">
                {doctors.map((d: any) => (
                  <MenuItem key={d.Id} value={d.Id}>
                    {d.Name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>Amount</Typography>
              <RHFTextField name="paymentAmount" placeholder="0.00" />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>
                Payment Method
              </Typography>
              <RHFSelect name="paymentMethod" placeholder="Select Method">
                {paymentMethods.map((m) => (
                  <MenuItem key={m.Id} value={m.Id}>
                    {m.Name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>
                Appointment
              </Typography>
              <RHFSelect name="AppointmentId" placeholder="Select Appointment">
                {appointments.map((a: any) => (
                  <MenuItem key={a.Id} value={a.Id}>
                    {a.PatientName} - {a.DoctorName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', mb: 1, color: '#666D80' }}>Status</Typography>
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
                Description
                <span style={{ color: '#666D90', fontSize: '9px', marginLeft: 2 }}>Optional</span>
              </Typography>
              <RHFTextField name="description" placeholder="Optional" multiline rows={3} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={onClose} color="primary">
            Cancel
          </Button>
          <LoadingButton
            loading={createMutation.isPending}
            type="submit"
            variant="contained"
            color="primary"
          >
            Create Payment
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
