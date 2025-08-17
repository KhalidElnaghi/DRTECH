import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';

interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AppointmentDialog({ open, onClose }: AppointmentDialogProps) {
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    appointmentDate: '',
    notes: '',
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = () => {
    // TODO: Implement appointment creation logic
    onClose();
    // Reset form
    setFormData({
      patientName: '',
      doctorName: '',
      appointmentDate: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Add New Appointment
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Patient Name"
            value={formData.patientName}
            onChange={handleInputChange('patientName')}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Doctor Name"
            value={formData.doctorName}
            onChange={handleInputChange('doctorName')}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Appointment Date"
            type="datetime-local"
            value={formData.appointmentDate}
            onChange={handleInputChange('appointmentDate')}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleInputChange('notes')}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Create Appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
