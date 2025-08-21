'use client';

import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Stack,
  Dialog,
  Button,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useNewRoom, useEditRoom } from 'src/hooks/use-rooms-query';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect } from 'src/components/hook-form';

import { ILookup } from 'src/types/lookups';
import { IRoom, RoomData } from 'src/types/room';

// Partial type for editing room status only
type PartialRoomData = Partial<RoomData>;

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
  const [isFormReady, setIsFormReady] = useState(false);

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
    mode: 'onSubmit', // Change to onSubmit to prevent premature validation
  });

  const { handleSubmit, reset, control, watch } = methods;

  // Monitor dialog open state
  useEffect(() => {
    if (open && room) {
      // Force set the Floor value if it's not set correctly
      if (room.Floor && !methods.getValues().Floor) {
        methods.setValue('Floor', room.Floor);
      }

      // Also check other fields
      if (room.RoomNumber && !methods.getValues().RoomNumber) {
        methods.setValue('RoomNumber', room.RoomNumber);
      }

      // Check Type and Status fields
      if (room.Type && !methods.getValues().Type) {
        methods.setValue('Type', room.Type);
      }

      if (room.Status && !methods.getValues().Status) {
        methods.setValue('Status', room.Status);
      }
    }
  }, [open, room, methods]);

  useEffect(() => {
    if (room) {
      const formData = {
        RoomNumber: room.RoomNumber || '',
        Floor: room.Floor || '',
        Type: room.Type || 0,
        Status: room.Status || 0,
      };

      // Reset form with the room data
      reset(formData);

      setIsFormReady(true);
    } else {
      // Reset to default values for new room
      reset({
        RoomNumber: '',
        Floor: '',
        Type: 0,
        Status: 0,
      });
      setIsFormReady(true);
    }
  }, [room, reset, methods]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      if (room) {
        // When editing, only send the Status field since others are read-only
        const editData: PartialRoomData = { Status: data.Status };
        await editRoomMutation.mutateAsync({ reqBody: editData as RoomData, id: room.Id });

        enqueueSnackbar(t('MESSAGE.ROOM_UPDATED_SUCCESSFULLY') || 'Room updated successfully', {
          variant: 'success',
        });
        onClose();
        reset();
      } else {
        // For new rooms, validate all required fields
        if (!data.RoomNumber || !data.Floor || !data.Type || !data.Status) {
          enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
          return;
        }

        await newRoomMutation.mutateAsync(data);

        enqueueSnackbar(t('MESSAGE.ROOM_CREATED_SUCCESSFULLY') || 'Room created successfully', {
          variant: 'success',
        });
        onClose();
        reset();
      }
    } catch (error: any) {
      // Handle API error responses
      let errorMessage = 'An unexpected error occurred';

      // Handle the specific error from the API (when axios interceptor returns error.response.data)
      if (error?.Error?.Message) {
        errorMessage = error.Error.Message;
      } else if (error?.error?.message) {
        // Fallback for different error structures
        errorMessage = error.error.message;
      } else if (error?.response?.data?.Error?.Message) {
        // Another fallback for error structure
        errorMessage = error.response.data.Error.Message;
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

      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
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
        <Typography variant="h6">
          {room
            ? t('ROOM.EDIT_ROOM_STATUS') || 'Edit Room Status'
            : t('ROOM.ADD_ROOM') || 'Add Room'}
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
        <DialogContent sx={{ borderBottom: '1px solid #DFE1E7', py: 3 }}>
          <Stack
            spacing={1}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}
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
                {t('ROOM.ROOM_NUMBER') || 'Room Number'} {room && '(Read Only)'}
              </Typography>

              <Controller
                key={room?.Id || 'new-room'}
                name="RoomNumber"
                control={control}
                defaultValue={room?.RoomNumber || ''}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    placeholder={t('ROOM.ENTER_ROOM_NUMBER') || 'Enter room number'}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flexGrow: 1, width: '100%' }}
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                    disabled={!!room} // Disable when editing existing room
                  />
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
                {t('ROOM.FLOOR') || 'Floor'} {room && '(Read Only)'}
              </Typography>
              <Controller
                key={room?.Id || 'new-room'}
                name="Floor"
                control={control}
                defaultValue={room?.Floor || ''}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    placeholder={t('ROOM.ENTER_FLOOR') || 'Enter floor'}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flexGrow: 1, width: '100%' }}
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                    disabled={!!room} // Disable when editing existing room
                  />
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
                {t('ROOM.ROOM_TYPE') || 'Room Type'} {room && '(Read Only)'}
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
                    disabled={!!room} // Disable when editing existing room
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
            disabled={isSubmitting || !isFormReady}
            color="primary"
          >
            {room ? 'Update Status' : 'Add Room'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
