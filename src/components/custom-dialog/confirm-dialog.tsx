import Image from 'next/image';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';

import { ConfirmDialogProps } from './types';

// ----------------------------------------------------------------------

export default function ConfirmDialog({
  title,
  content,
  action,
  open,
  onClose,
  ...other
}: ConfirmDialogProps) {
  const { t } = useTranslate();
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={onClose}
      {...other}
      sx={{
        '& .MuiDialog-paper': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        },
      }}
    >
      {typeof content === 'string' && content.includes('delete') && (
        <Image src="/assets/images/global/delete.svg" alt="delete" width={84} height={84} />
      )}

      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      {content && (
        <DialogContent sx={{ typography: 'body2', minHeight: '50px' }}> {content} </DialogContent>
      )}

      <DialogActions>
        {' '}
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          sx={{ width: 175, height: 56, borderRadius: 2, padding: '8px 16px' }}
        >
          {t('BUTTON.CANCEL')}
        </Button>
        {action}
      </DialogActions>
    </Dialog>
  );
}
