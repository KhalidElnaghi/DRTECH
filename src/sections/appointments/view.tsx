'use client';

import { useState, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
// import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useBoolean } from 'src/hooks/use-boolean';

import { fFullDate } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';
import { useDeleteAppointment, useCancelAppointment } from 'src/hooks/use-appointments-query';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import AppointmentDialog from 'src/components/dialogs/appointment-dialog';
import CancelAppointmentDialog from 'src/components/dialogs/cancel-appointment-dialog';

import { IDoctor } from 'src/types/doctors';
import { ILookup } from 'src/types/lookups';
import { IPatient } from 'src/types/patients';
import { IAppointment } from 'src/types/appointment';

// ----------------------------------------------------------------------
interface IProps {
  appointments: IAppointment[];
  totalCount: number;
  doctors: IDoctor[];
  patients: IPatient[];
  services: ILookup[];
  appointmentStatus: ILookup[];
}

interface FilterState {
  search: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
}

// Status mapping for display purposes
const STATUS_LABELS: Record<string, string> = {
  '1': 'Scheduled',
  '2': 'Completed',
  '3': 'Cancelled',
  '4': 'No Show',
  '5': 'Rescheduled',
};

// Helper function to get status label
const getStatusLabel = (statusValue: string): string => STATUS_LABELS[statusValue] || statusValue;

// Helper function to get status colors (matching table styling)
const getStatusColors = (status: string) => {
  let textColor = 'text.secondary';
  let bgColor = 'grey.100';
  let borderColor = 'grey.100';

  switch (status) {
    case 'Completed':
      textColor = '#28806F';
      bgColor = '#EFFEFA';
      borderColor = '#DDF3EF';
      break;
    case 'Scheduled':
      textColor = '#116B97';
      bgColor = '#F0FBFF';
      borderColor = '#D1F0FA';
      break;
    case 'Cancelled':
      textColor = '#B21634';
      bgColor = '#FEF3F2';
      borderColor = '#FECDCA';
      break;
    case 'Rescheduled':
      textColor = '#7C3AED';
      bgColor = '#F3F4F6';
      borderColor = '#C4B5FD';
      break;
    case 'No Show':
      textColor = '#6B7280';
      bgColor = '#F9FAFB';
      borderColor = '#E5E7EB';
      break;
    default:
      textColor = 'text.secondary';
      bgColor = 'grey.100';
      borderColor = '#DDF3EF';
  }

  return { textColor, bgColor, borderColor };
};

// Helper function to format date in local timezone (avoiding timezone offset issues)
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AppointmentsPage({
  appointments,
  totalCount,
  doctors,
  patients,
  services,
  appointmentStatus,
}: IProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    doctorName: '',
    appointmentDate: '',
    status: '',
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { t } = useTranslate();
  // const settings = useSettingsContext();
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | undefined>();
  const [selectedId, setSelectedId] = useState<number>(0);
  const confirmDelete = useBoolean();
  const [isDeleting, setIsDeleting] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  // React Query mutations
  const deleteAppointmentMutation = useDeleteAppointment();
  const cancelAppointmentMutation = useCancelAppointment();

  // Initialize filters from URL params on component mount
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const doctorName = searchParams.get('DoctorName') || '';
    const appointmentDate = searchParams.get('AppointmentDate') || '';
    const status = searchParams.get('Status') || '';

    setFilters({
      search,
      doctorName,
      appointmentDate,
      status,
    });
  }, [searchParams]);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedAppointment(undefined);
  };

  const handleOpenCancelDialog = (appointmentId: number) => {
    setSelectedId(appointmentId);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setSelectedId(0);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Update URL params when filters change
  const updateURLParams = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update search param
    if (newFilters.search) {
      params.set('search', newFilters.search);
    } else {
      params.delete('search');
    }

    // Update DoctorName param
    if (newFilters.doctorName) {
      params.set('DoctorName', newFilters.doctorName);
    } else {
      params.delete('DoctorName');
    }

    // Update AppointmentDate param
    if (newFilters.appointmentDate) {
      params.set('AppointmentDate', newFilters.appointmentDate);
    } else {
      params.delete('AppointmentDate');
    }

    // Update Status param
    if (newFilters.status) {
      params.set('Status', newFilters.status);
    } else {
      params.delete('Status');
    }

    // Update URL without page refresh
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };

    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      doctorName: '',
      appointmentDate: '',
      status: '',
    };

    setFilters(resetFilters);
    updateURLParams(resetFilters);
  };

  const openFilter = Boolean(filterAnchorEl);

  const TABLE_HEAD = [
    { id: 'patientName', label: 'LABEL.PATIENT_NAME' },
    { id: 'doctorName', label: 'LABEL.DOCTOR_NAME' },
    { id: 'appointmentDate', label: 'LABEL.APPOINTMENT_DATE' },
    { id: 'appointmenStatusName', label: 'LABEL.STATUS' },
    { id: 'notes', label: 'LABEL.NOTES' },
    { id: '', label: '', width: 80 },
  ];

  // Check if any filters are currently applied (either in state or URL params)
  const hasActiveFilters =
    filters.search ||
    filters.doctorName ||
    filters.appointmentDate ||
    filters.status ||
    searchParams.get('search') ||
    searchParams.get('DoctorName') ||
    searchParams.get('AppointmentDate') ||
    searchParams.get('Status');

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteAppointmentMutation.mutateAsync(selectedId);

      enqueueSnackbar(t('MESSAGE.DELETED_SUCCESS'), {
        variant: 'success',
      });
      confirmDelete.onFalse();
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to delete appointment', {
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Show no data message if no appointments, but keep header and search/filter functionality
  if (!appointments || appointments.length === 0) {
    return (
      <>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            mb: 3,
            pt: 1,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
              Appointments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here are all appointments updated in the last 7 days.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={handleOpenAddDialog}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 1,
              fontWeight: 500,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            New Appointment
          </Button>
        </Box>

        {/* Search and Filter Bar */}
        <Paper
          elevation={1}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 0,
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, color: 'text.secondary' }}>
                Appointments
              </Typography>
            </Box>

            {/* Search and Filter Bar */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              {/* Search Bar */}
              <TextField
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                sx={{ flexGrow: 1, maxWidth: 600, width: '100%' }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Filter Icon Button */}
              <IconButton
                onClick={handleFilterClick}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  boxShadow: '0 2px 12px rgba(25, 118, 210, 0.4), 0 0 20px rgba(25, 118, 210, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                    boxShadow:
                      '0 6px 24px rgba(25, 118, 210, 0.6), 0 0 30px rgba(25, 118, 210, 0.2)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <Iconify icon="majesticons:filter-line" width={20} height={20} />
              </IconButton>
            </Box>
          </Box>

          {/* Filter Popup */}
          <Popover
            open={openFilter}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                width: 400,
                p: 2,
                mt: 1,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                borderRadius: 2,
              },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Filter Appointments
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Doctor Name</InputLabel>
                  <Select
                    value={filters.doctorName}
                    onChange={(e) => handleFilterChange('doctorName', e.target.value)}
                    label="Doctor Name"
                    placeholder="Select doctor"
                    sx={{
                      '& .MuiInputLabel-root': {
                        backgroundColor: 'background.paper',
                        px: 0.5,
                      },
                    }}
                  >
                    <MenuItem value="">All Doctors</MenuItem>
                    <MenuItem value="Dr. Smith">Dr. Smith</MenuItem>
                    <MenuItem value="Dr. Johnson">Dr. Johnson</MenuItem>
                    <MenuItem value="Dr. Williams">Dr. Williams</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Appointment Date"
                    value={filters.appointmentDate ? new Date(filters.appointmentDate) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        handleFilterChange('appointmentDate', formatDateLocal(newValue));
                      } else {
                        handleFilterChange('appointmentDate', '');
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        placeholder: 'Select appointment date',
                        InputLabelProps: {
                          shrink: true,
                        },
                        sx: {
                          '& .MuiInputLabel-root': {
                            backgroundColor: 'background.paper',
                            px: 0.5,
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    displayEmpty
                    placeholder="Select status"
                  >
                    <MenuItem
                      value="1"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('Scheduled').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('Scheduled').bgColor,
                          color: getStatusColors('Scheduled').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('Scheduled').borderColor}`,
                        }}
                      >
                        Scheduled
                      </Box>
                    </MenuItem>
                    <MenuItem
                      value="2"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('Completed').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('Completed').bgColor,
                          color: getStatusColors('Completed').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('Completed').borderColor}`,
                        }}
                      >
                        Completed
                      </Box>
                    </MenuItem>
                    <MenuItem
                      value="3"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('Cancelled').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('Cancelled').bgColor,
                          color: getStatusColors('Cancelled').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('Cancelled').borderColor}`,
                        }}
                      >
                        Cancelled
                      </Box>
                    </MenuItem>
                    <MenuItem
                      value="4"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('No Show').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('No Show').bgColor,
                          color: getStatusColors('No Show').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('No Show').borderColor}`,
                        }}
                      >
                        No Show
                      </Box>
                    </MenuItem>
                    <MenuItem
                      value="5"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('Rescheduled').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('Rescheduled').bgColor,
                          color: getStatusColors('Rescheduled').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('Rescheduled').borderColor}`,
                        }}
                      >
                        Rescheduled
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(filters.doctorName || filters.appointmentDate || filters.status) && (
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ alignSelf: 'center', mr: 1 }}>
                  Active filters:
                </Typography>
                {filters.doctorName && (
                  <Chip
                    label={`Doctor: ${filters.doctorName}`}
                    onDelete={() => handleFilterChange('doctorName', '')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {filters.appointmentDate && (
                  <Chip
                    label={`Date: ${filters.appointmentDate}`}
                    onDelete={() => handleFilterChange('appointmentDate', '')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {filters.status && (
                  <Chip
                    label={`Status: ${getStatusLabel(filters.status)}`}
                    onDelete={() => handleFilterChange('status', '')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleResetFilters} size="small">
                Reset
              </Button>
              <Button variant="contained" onClick={handleFilterClose} size="small">
                Apply
              </Button>
            </Box>
          </Popover>
        </Paper>

        {/* No Data Found Message */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 2,
            textAlign: 'center',
          }}
        >
          {!hasActiveFilters && (
            <Box
              component="img"
              src="/assets/images/appointments/icon.svg"
              alt="No data found"
              sx={{
                width: 144,
                height: 144,
                mb: 3,
                opacity: 0.6,
              }}
            />
          )}

          <Typography variant="h5" sx={{ mb: 1, color: 'text.secondary' }}>
            {hasActiveFilters ? 'No appointments found' : 'No appointments yet'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', maxWidth: 400 }}>
            {hasActiveFilters
              ? 'No appointments match your current filters. Try adjusting your search criteria or clearing some filters.'
              : "You haven't scheduled any appointments yet. Start by adding a new one."}
          </Typography>
          <Button
            variant="contained"
            onClick={hasActiveFilters ? handleResetFilters : handleOpenAddDialog}
            sx={{ mb: 2 }}
          >
            {hasActiveFilters ? 'Clear Filters' : 'Add New Appointment'}
          </Button>
        </Box>

        {/* Appointment Dialog */}
        <AppointmentDialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          doctors={doctors}
          patients={patients}
          services={services}
          appointmentStatus={appointmentStatus}
          appointment={null}
        />
      </>
    );
  }

  return (
    <>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          mb: 3,
          pt: 1,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Appointments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here are all appointments updated in the last 7 days.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleOpenAddDialog}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 1,
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          New Appointment
        </Button>
      </Box>

      {/* Table Section */}
      <Paper
        elevation={1}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          px: 0,
          mb: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5, color: 'text.secondary' }}>
              Appointments
            </Typography>
          </Box>

          {/* Search and Filter Bar */}

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            {/* Search Bar */}
            <TextField
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              sx={{ flexGrow: 1, maxWidth: 600, width: '100%' }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Filter Icon Button */}
            <IconButton
              onClick={handleFilterClick}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                boxShadow: '0 2px 12px rgba(25, 118, 210, 0.4), 0 0 20px rgba(25, 118, 210, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                  boxShadow: '0 6px 24px rgba(25, 118, 210, 0.6), 0 0 30px rgba(25, 118, 210, 0.2)',
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <Iconify icon="majesticons:filter-line" width={20} height={20} />
            </IconButton>
          </Box>

          {/* Active Filters Display */}
          {/* {(filters.doctorName || filters.appointmentDate || filters.status) && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                Active filters:
              </Typography>
              {filters.doctorName && (
                <Chip
                  label={`Doctor: ${filters.doctorName}`}
                  onDelete={() => handleFilterChange('doctorName', '')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {filters.appointmentDate && (
                <Chip
                  label={`Date: ${filters.appointmentDate}`}
                  onDelete={() => handleFilterChange('appointmentDate', '')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {filters.status && (
                <Chip
                  label={`Status: ${filters.status}`}
                  onDelete={() => handleFilterChange('status', '')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          )} */}

          {/* Filter Popup */}
          <Popover
            open={openFilter}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                width: 400,
                p: 2,
                mt: 1,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filters
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleResetFilters}
                startIcon={<Iconify icon="eva:refresh-fill" />}
              >
                Reset
              </Button>
            </Box>

            <Grid container spacing={1.5}>
              {/* Doctor Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Doctor Name"
                  placeholder="Enter doctor name"
                  value={filters.doctorName}
                  onChange={(e) => handleFilterChange('doctorName', e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:person-fill" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Appointment Date */}
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Appointment Date"
                    value={filters.appointmentDate ? new Date(filters.appointmentDate) : null}
                    onChange={(date) => {
                      if (date) {
                        handleFilterChange('appointmentDate', formatDateLocal(date));
                      } else {
                        handleFilterChange('appointmentDate', '');
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        placeholder: 'Select appointment date',
                        InputLabelProps: {
                          shrink: true,
                        },
                        sx: {
                          '& .MuiInputLabel-root': {
                            backgroundColor: 'background.paper',
                            px: 0.5,
                          },
                        },
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:calendar-fill" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Status */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:flag-fill" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem
                      value="1"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('Scheduled').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('Scheduled').bgColor,
                          color: getStatusColors('Scheduled').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('Scheduled').borderColor}`,
                        }}
                      >
                        Scheduled
                      </Box>
                    </MenuItem>
                    <MenuItem
                      value="2"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('Completed').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('Completed').bgColor,
                          color: getStatusColors('Completed').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('Completed').borderColor}`,
                        }}
                      >
                        Completed
                      </Box>
                    </MenuItem>
                    <MenuItem
                      value="3"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('Cancelled').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('Cancelled').bgColor,
                          color: getStatusColors('Cancelled').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('Cancelled').borderColor}`,
                        }}
                      >
                        Cancelled
                      </Box>
                    </MenuItem>
                    <MenuItem
                      value="4"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('No Show').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('No Show').bgColor,
                          color: getStatusColors('No Show').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('No Show').borderColor}`,
                        }}
                      >
                        No Show
                      </Box>
                    </MenuItem>
                    <MenuItem
                      value="5"
                      sx={{
                        '&:hover': {
                          backgroundColor: getStatusColors('Rescheduled').bgColor,
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: getStatusColors('Rescheduled').bgColor,
                          color: getStatusColors('Rescheduled').textColor,
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          minWidth: 80,
                          border: `1px solid ${getStatusColors('Rescheduled').borderColor}`,
                        }}
                      >
                        Rescheduled
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(filters.doctorName || filters.appointmentDate || filters.status) && (
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ alignSelf: 'center', mr: 1 }}>
                  Active filters:
                </Typography>
                {filters.doctorName && (
                  <Chip
                    label={`Doctor: ${filters.doctorName}`}
                    onDelete={() => handleFilterChange('doctorName', '')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {filters.appointmentDate && (
                  <Chip
                    label={`Date: ${filters.appointmentDate}`}
                    onDelete={() => handleFilterChange('appointmentDate', '')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {filters.status && (
                  <Chip
                    label={`Status: ${getStatusLabel(filters.status)}`}
                    onDelete={() => handleFilterChange('status', '')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            )}
          </Popover>
        </Box>
        <SharedTable
          count={totalCount}
          data={appointments}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'primary.main' },
              label: t('LABEL.EDIT'),
              icon: 'solar:pen-bold',
              onClick: (item) => {
                setSelectedAppointment(item);
                handleOpenAddDialog();
              },
              hide: (item: IAppointment) =>
                item.appointmenStatusName === 'Cancelled' ||
                item.appointmenStatusName === 'Completed',
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.DELETE'),
              icon: 'material-symbols:delete-outline-rounded',
              onClick: (item: any) => {
                setSelectedId(item.id);
                confirmDelete.onTrue();
              },
            },
            {
              sx: { color: 'error.dark' },
              label: t('LABEL.CANCEL'),
              icon: 'line-md:cancel-twotone',
              onClick: (item: any) => {
                handleOpenCancelDialog(item.id);
              },
              hide: (item: IAppointment) =>
                item.appointmenStatusName === 'Cancelled' ||
                item.appointmenStatusName === 'Completed',
            },
            // {
            //   sx: { color: 'info.dark' },
            //   label: t('LABEL.UNBLOCK'),
            //   icon: 'gg:unblock',
            //   onClick: (item: any) => {
            //     setSelectedId(item.id);
            //     confirmUnblock.onTrue();
            //   },
            //   hide: (center) => center.userStatus === 'BlockedClient',
            // },
            // {
            //   sx: { color: 'info.dark' },
            //   label: t('LABEL.CLEAR_WALLET'),
            //   icon: 'mingcute:wallet-fill',
            //   onClick: (item) => {
            //     setSelectedId(item.id);
            //     confirmClearWallet.onTrue();
            //   },
            //   hide: (center) => center.walletBalance <= 0,
            // },
            // {
            //   sx: { color: 'info.dark' },
            //   label: t('LABEL.SEND_NOTIFICATION'),
            //   icon: 'mingcute:notification-fill',
            //   onClick: (item) => {
            //     // setShowSendNotification(true);
            //     // setSelectedCenter(item);
            //   },
            // },
          ]}
          customRender={{
            appointmentDate: (item: IAppointment) => <Box>{fFullDate(item?.appointmentDate)}</Box>,
            appointmenStatusName: (item: IAppointment) => {
              const status = item?.appointmenStatusName;
              const { textColor, bgColor, borderColor } = getStatusColors(status);

              return (
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: bgColor,
                    color: textColor,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    textAlign: 'center',
                    minWidth: 80,
                    border: `1px solid ${borderColor}`,
                    '&:hover': {
                      backgroundColor: bgColor,
                      opacity: 0.8,
                    },
                  }}
                >
                  {status}
                </Box>
              );
            },
          }}
        />
      </Paper>

      {/* Appointment Dialog */}
      <AppointmentDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        doctors={doctors}
        patients={patients}
        services={services}
        appointment={selectedAppointment}
        appointmentStatus={appointmentStatus}
      />

      {/* Cancel Appointment Dialog */}
      <CancelAppointmentDialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        appointmentId={selectedId}
        onSuccess={() => {
          // Close the dialog and let the parent component handle refresh
          // The appointment list will be updated via the API call
          handleCloseCancelDialog();
        }}
      />

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE')}
        content={t('MESSAGE.CONFIRM_DELETE_APPOINTMENT')}
        action={
          <LoadingButton
            sx={{
              width: 175,
              height: 56,
              borderRadius: 2,
              padding: '8px 16px',
              bgcolor: '#DF1C41',
              '&:hover': {
                bgcolor: '#DF1C60',
              },
            }}
            variant="contained"
            loading={isDeleting}
            onClick={() => {
              handleConfirmDelete();
            }}
          >
            {t('BUTTON.DELETE')}
          </LoadingButton>
        }
      />
    </>
  );
}
