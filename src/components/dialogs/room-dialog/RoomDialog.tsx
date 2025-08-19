'use client';

import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useMemo, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect } from 'src/components/hook-form';
import RHFTextField from 'src/components/hook-form/rhf-text-field-form';

import { ILookup } from 'src/types/lookups';
import { IRoom, RoomData } from 'src/types/room';
import { useEditRoom, useNewRoom } from 'src/hooks/use-rooms-query';

interface RoomDialogProps {
  open: boolean;
  onClose: () => void;
  roomTypes: ILookup[];
  roomStatus: ILookup[];
  room?: IRoom | null;
}

const roomSchema = yup.object().shape({
  RoomNumber: yup.string().required('Room number is required'),
  Floor: yup.string().required('Floor is required'),
  Type: yup.number().required('Room type is required').min(1, 'Room type is required'),
  Status: yup.number().required('Room status is required').min(1, 'Room status is required'),
});

export default function RoomDialog({
  open,
  onClose,
  roomTypes,
  roomStatus,
  room,
}: RoomDialogProps) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const editRoomMutation = useEditRoom();
  const newRoomMutation = useNewRoom();

  const methods = useForm<RoomData>({
    resolver: yupResolver(roomSchema),
    defaultValues: {
      RoomNumber: '',
      Floor: '',
      Type: 0,
      Status: 0,
    },
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    console.log('RoomDialog useEffect - room:', room);
    if (room) {
      console.log('Setting form for edit mode:', room);
      reset({
        RoomNumber: room.RoomNumber,
        Floor: room.Floor,
        Type: room.Type,
        Status: room.Status, 
      });
    } else {
      console.log('Setting form for new room mode');
      // Reset to default values for new room
      reset({
        RoomNumber: '',
        Floor: '',
        Type: 0,
        Status: 0,
      });
    }
  }, [room, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      if (room) {
        await editRoomMutation.mutateAsync({ reqBody: data, id: room.Id });

        enqueueSnackbar(t('MESSAGE.ROOM_UPDATED_SUCCESSFULLY') || 'Room updated successfully', {
          variant: 'success',
        });
        onClose();
        reset();
      } else {
        console.log('data', data);
        await newRoomMutation.mutateAsync(data);

        enqueueSnackbar(t('MESSAGE.ROOM_CREATED_SUCCESSFULLY') || 'Room created successfully', {
          variant: 'success',
        });
        onClose();
        reset();
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      console.log('Error object structure:', JSON.stringify(error, null, 2));

      // Handle API error responses
      let errorMessage = 'An unexpected error occurred';

      if (error?.error?.message) {
        // Handle the specific error from the API (when axios interceptor returns error.response.data)
        errorMessage = error.error.message;
      } else if (error?.response?.data?.error?.message) {
        // Handle the specific error from the API (fallback)
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        // Handle other error messages
        errorMessage = error.message;
      }

      // Check for specific error messages and provide user-friendly translations
      if (errorMessage.toLowerCase().includes('room with the same number already exists')) {
        errorMessage = t('ERROR.ROOM_DUPLICATE') || 'A room with the same number already exists';
      }

      console.log('Final error message:', errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          py: 1,
          bgcolor: '#F6F8FA',
          borderBottom: '1px solid #DFE1E7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">
          {room ? t('ROOM.EDIT_ROOM') || 'Edit Room' : t('ROOM.ADD_ROOM') || 'Add Room'}
        </Typography>
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
        <DialogContent sx={{ borderBottom: '1px solid #DFE1E7', py: 4 }}>
          <Stack
            spacing={1}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 2, mt: 1 }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                {t('ROOM.ROOM_NUMBER') || 'Room Number'}
              </Typography>
              <RHFTextField
                name="RoomNumber"
                placeholder={t('ROOM.ENTER_ROOM_NUMBER') || 'Enter room number'}
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                {t('ROOM.FLOOR') || 'Floor'}
              </Typography>
              <RHFTextField
                name="Floor"
                placeholder={t('ROOM.ENTER_FLOOR') || 'Enter floor'}
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                {t('ROOM.ROOM_TYPE') || 'Room Type'}
              </Typography>
              <Controller
                name="Type"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <RHFSelect
                    {...field}
                    placeholder={t('ROOM.SELECT_ROOM_TYPE') || 'Select room type'}
                    error={!!error}
                    helperText={error?.message}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flexGrow: 1 }}
                  >
                    {roomTypes.map((type) => (
                      <MenuItem key={type.Id} value={type.Id}>
                        {type.Name}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'Inter Tight',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '150%',
                  letterSpacing: '2%',
                  mb: 1,
                  color: '#666D80',
                }}
              >
                {t('ROOM.ROOM_STATUS') || 'Room Status'}
              </Typography>
              <Controller
                name="Status"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <RHFSelect
                    {...field}
                    placeholder={t('ROOM.SELECT_ROOM_STATUS') || 'Select room status'}
                    error={!!error}
                    helperText={error?.message}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flexGrow: 1 }}
                  >
                    {roomStatus.map((status) => (
                      <MenuItem key={status.Id} value={status.Id}>
                        {status.Name}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              onClose();
              reset();
            }}
          >
            {t('COMMON.CANCEL') || 'Cancel'}
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={isSubmitting}
            color="primary"
          >
            {room ? t('COMMON.UPDATE') || 'Update' : t('COMMON.CREATE') || 'Create'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
