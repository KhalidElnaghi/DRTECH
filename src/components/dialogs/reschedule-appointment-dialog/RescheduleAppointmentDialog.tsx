'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';

import { useRescheduleAppointment } from 'src/hooks/use-appointments-query';
import { useTranslate } from 'src/locales';
import { IAppointment } from 'src/types/appointment';

interface RescheduleAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  appointmentId: number;
  appointment?: IAppointment | null;
  onSuccess?: () => void;
}

const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const formatDateAtMidnight = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
};

export default function RescheduleAppointmentDialog({
  open,
  onClose,
  appointmentId,
  appointment,
  onSuccess,
}: RescheduleAppointmentDialogProps) {
  const { t } = useTranslate();
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rescheduleMutation = useRescheduleAppointment();

  useEffect(() => {
    if (open) {
      if (appointment?.AppointmentDate) {
        const current = new Date(appointment.AppointmentDate);
        setNewDate(current);
        const time = new Date();
        time.setHours(current.getHours(), current.getMinutes(), current.getSeconds(), 0);
        setNewTime(time);
      } else {
        const now = new Date();
        setNewDate(now);
        setNewTime(now);
      }
    }
  }, [open, appointment]);

  const handleSubmit = async () => {
    if (!newDate || !newTime) {
      enqueueSnackbar('Please select both date and time', { variant: 'error' });
      return;
    }

    const combined = new Date(newDate);
    combined.setHours(newTime.getHours(), newTime.getMinutes(), newTime.getSeconds(), 0);

    const NewAppointmentDate = formatDateAtMidnight(newDate);
    const NewScheduledTime = formatDateTimeLocal(combined);

    setIsSubmitting(true);
    try {
      await rescheduleMutation.mutateAsync({ appointmentId, NewAppointmentDate, NewScheduledTime });
      enqueueSnackbar(t('MESSAGE.APPOINTMENT_RESCHEDULED_SUCCESSFULLY'), {
        variant: 'success',
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to reschedule appointment', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('LABEL.RESCHEDULE_APPOINTMENT')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <div>
            <Typography sx={{ mb: 1, color: '#666D80', fontSize: 12 }}>
              {t('LABEL.NEW_APPOINTMENT_DATE')}
            </Typography>
            <DatePicker
              value={newDate}
              format="dd-MM-yyyy"
              onChange={(val) => setNewDate(val as Date | null)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </div>
          <div>
            <Typography sx={{ mb: 1, color: '#666D80', fontSize: 12 }}>
              {t('LABEL.NEW_SCHEDULED_TIME')}
            </Typography>
            <TimePicker
              value={newTime}
              onChange={(val) => setNewTime(val as Date | null)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {t('BUTTON.CANCEL')}
        </Button>
        <LoadingButton
          onClick={handleSubmit}
          loading={isSubmitting}
          variant="contained"
          color="primary"
        >
          {t('BUTTON.RESCHEDULE')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
