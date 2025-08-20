'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { ILookup } from 'src/types/lookups';

interface UserRoleDialogProps {
  open: boolean;
  onClose: () => void;
  roles: ILookup[];
  value: number;
  onChange: (roleId: number) => void;
  onSubmit: () => void | Promise<void>;
  submitting?: boolean;
}

export default function UserRoleDialog({
  open,
  onClose,
  roles,
  value,
  onChange,
  onSubmit,
  submitting,
}: UserRoleDialogProps) {
  const { t } = useTranslate();

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Update User Role</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ width: 1, mt: 1 }}>
          <TextField
            select
            fullWidth
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            size="small"
          >
            {roles.map((r) => (
              <MenuItem key={r.Id} value={r.Id}>
                {r.Name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
        >
          {t('BUTTON.CANCEL')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!!submitting}
          onClick={onSubmit}

        >
          {submitting ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
