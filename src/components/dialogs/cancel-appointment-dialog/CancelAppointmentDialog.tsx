'use client';

import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { useTranslate } from 'src/locales';
import { cancelAppointment } from 'src/actions/appointments';

// ----------------------------------------------------------------------

interface CancelAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  appointmentId: number;
  onSuccess?: () => void;
}

export default function CancelAppointmentDialog({
  open,
  onClose,
  appointmentId,
  onSuccess,
}: CancelAppointmentDialogProps) {
  const { t } = useTranslate();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmCancellation, setConfirmCancellation] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      enqueueSnackbar(t('MESSAGE.CANCELLATION_REASON_REQUIRED'), { variant: 'error' });
      return;
    }

    if (reason.trim().length < 10) {
      enqueueSnackbar(t('MESSAGE.CANCELLATION_REASON_TOO_SHORT'), { variant: 'error' });
      return;
    }

    if (!confirmCancellation) {
      enqueueSnackbar(t('MESSAGE.CONFIRMATION_REQUIRED'), { variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await cancelAppointment(appointmentId, reason.trim());

      if (result?.error) {
        enqueueSnackbar(result.error, { variant: 'error' });
      } else {
        enqueueSnackbar(t('MESSAGE.APPOINTMENT_CANCELLED_SUCCESS'), { variant: 'success' });
        setReason('');
        setConfirmCancellation(false);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      enqueueSnackbar(t('MESSAGE.CANCELLATION_FAILED'), { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setConfirmCancellation(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          {t('TITLE.CANCEL_APPOINTMENT')}
          {isSubmitting && (
            <Box
              component="span"
              sx={{
                width: 16,
                height: 16,
                border: '2px solid',
                borderColor: 'primary.main',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          )}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('MESSAGE.CANCELLATION_DESCRIPTION')}
        </Typography>

        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          label={t('LABEL.REASON_FOR_CANCELLATION')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('PLACEHOLDER.CANCELLATION_REASON')}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
          inputProps={{
            maxLength: 500,
          }}
          helperText={`${reason.length}/500 characters`}
          error={reason.length > 0 && reason.length < 10}
        />

        <Box sx={{  display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmCancellation}
                onChange={(e) => setConfirmCancellation(e.target.checked)}
                disabled={isSubmitting}
                color="error"
              />
            }
            label={t('MESSAGE.CONFIRMATION_CHECKBOX_LABEL')}

          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={handleClose} disabled={isSubmitting} sx={{ color: 'text.secondary' }}>
          {t('BUTTON.CANCEL')}
        </Button>
        <LoadingButton
          loading={isSubmitting}
          onClick={handleSubmit}
          variant="contained"
          disabled={!reason.trim() || reason.trim().length < 10 || !confirmCancellation}
          sx={{
            bgcolor: 'error.main',
            '&:hover': {
              bgcolor: 'error.dark',
            },
            '&:disabled': {
              bgcolor: 'grey.400',
            },
          }}
        >
          {t('BUTTON.CONFIRM_CANCELLATION')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
