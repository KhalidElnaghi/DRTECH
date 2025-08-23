'use client';

import Image from 'next/image';
import { useSnackbar } from 'notistack';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import {
  Box,
  Chip,
  Grid,
  Stack,
  Paper,
  Button,
  Select,
  Popover,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDeleteDoctor } from 'src/hooks/use-doctors-query';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { cellAlignment } from 'src/CustomSharedComponents/SharedTable/types';

import Iconify from 'src/components/iconify';
import EmptyState from 'src/components/empty-state';
import { ConfirmDialog } from 'src/components/custom-dialog';
import DoctorDialog from 'src/components/dialogs/doctor-dialog';
import SharedHeader from 'src/components/shared-header/empty-state';

import { ILookup } from 'src/types/lookups';
import { IDoctor, ISpecialization } from 'src/types/doctors';

interface IProps {
  doctors: IDoctor[];
  totalCount: number;
  specializations: ISpecialization[] | undefined;
  statusOptions: ILookup[] | undefined;
}

interface FilterState {
  searchTerm: string;
  status: number;
  specializationId: number;
}

const TABLE_HEAD = [
  { id: 'FullName', label: 'Full Name', align: cellAlignment.left },
  { id: 'SpecializationName', label: 'Specialization', align: cellAlignment.left },
  { id: 'PhoneNumber', label: 'Phone Number', align: cellAlignment.left },
  { id: 'StatusName', label: 'Status', align: cellAlignment.left },
  { id: '', label: '', width: 80 },
];

export default function DoctorsPage({
  doctors,
  totalCount,
  specializations,
  statusOptions,
}: IProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 0,
    specializationId: 0,
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevSearchTermRef = useRef<string>('');

  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | undefined>();
  const [selectedId, setSelectedId] = useState<string>('');
  const confirmDelete = useBoolean();
  const [isDeleting, setIsDeleting] = useState(false);

  // React Query mutations
  const deleteDoctorMutation = useDeleteDoctor();
  // Update URL params when filters change
  const updateURLParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update search param
      if (newFilters.searchTerm) {
        params.set('SearchTerm', newFilters.searchTerm);
      } else {
        params.delete('SearchTerm');
      }

      // Update status param
      if (newFilters.status > 0) {
        params.set('status', newFilters.status.toString());
      } else {
        params.delete('status');
      }

      // Update specialization param
      if (newFilters.specializationId > 0) {
        params.set('specializationId', newFilters.specializationId.toString());
      } else {
        params.delete('specializationId');
      }

      // Reset to page 1 when applying filters
      params.set('page', '1');

      // Update URL without page refresh
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  // Initialize filters from URL params on component mount
  useEffect(() => {
    const searchTerm = searchParams.get('SearchTerm') || '';
    const status = Number(searchParams.get('status')) || 0;
    const specializationId = Number(searchParams.get('specializationId')) || 0;

    setFilters({
      searchTerm,
      status,
      specializationId,
    });
  }, [searchParams]);

  // Close filter popover on URL param change to avoid stale anchor positioning
  useEffect(() => {
    setFilterAnchorEl(null);
  }, [searchParams]);

  // Auto-close if anchor element unmounts
  useEffect(() => {
    if (filterAnchorEl && !(filterAnchorEl as any).isConnected) {
      setFilterAnchorEl(null);
    }
  }, [filterAnchorEl]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Immediately update URL for status and specialization changes, search is handled by debounced effect
    if (key !== 'searchTerm') {
      updateURLParams(newFilters);
    }
  };

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFilters((prev) => ({ ...prev, searchTerm: value }));

    // Debounce search updates
    if (prevSearchTermRef.current !== value) {
      prevSearchTermRef.current = value;
      setTimeout(() => {
        updateURLParams({ ...filters, searchTerm: value });
      }, 500);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    const newFilters = { searchTerm: '', status: 0, specializationId: 0 };
    setFilters(newFilters);
    updateURLParams(newFilters);
    setFilterAnchorEl(null);
  };

  // Open filter popover
  const handleOpenFilterPopover = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Close filter popover
  const handleCloseFilterPopover = () => {
    setFilterAnchorEl(null);
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setSelectedDoctor(undefined);
    setOpenAddDialog(true);
  };

  // Close add dialog
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedDoctor(undefined);
  };

  // Handle edit doctor
  const handleEditDoctor = (doctor: IDoctor) => {
    setSelectedDoctor(doctor);
    setOpenAddDialog(true);
  };

  // Handle delete doctor
  const handleDeleteDoctor = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteDoctorMutation.mutateAsync(selectedId);

      // Check if the operation was successful and display the message
      if (result?.IsSuccess) {
        // Show success message from API response
        enqueueSnackbar(result.Data || 'Doctor deleted successfully', {
          variant: 'success',
        });

        confirmDelete.onFalse();
        setSelectedId('');
      } else {
        // Handle error case when IsSuccess is false
        const errorMessage = result?.Error?.Message || 'Failed to delete doctor';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
        });
      }
    } catch (error: any) {
      console.error('Error deleting doctor:', error);

      // Handle unexpected errors
      let errorMessage = 'An unexpected error occurred while deleting the doctor';

      // Try to extract error message from different possible structures
      if (error?.Error?.Message) {
        errorMessage = error.Error.Message;
      } else if (error?.Message) {
        errorMessage = error.Message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (id: string) => {
    setSelectedId(id);
    confirmDelete.onTrue();
  };
  const getStatusColor = (status: number) => {
    let textColor = 'text.secondary';
    let bgColor = 'grey.100';
    let borderColor = 'grey.100';
    switch (status) {
      case 1:
        textColor = '#28806F';
        bgColor = '#EFFEFA';
        borderColor = '#DDF3EF';
        break;
      case 2:
        textColor = '#A52A2A';
        bgColor = '#FFF0F0';
        borderColor = '#FF8080';
        break;
      case 3:
        textColor = '#B21634';
        bgColor = '#FEF3F2';
        borderColor = '#FECDCA';
        break;
      case 4:
        textColor = '#A77B2E';
        bgColor = '#FFF6E0';
        borderColor = '#FAEDCC';
        break;
      case 5:
        textColor = '#003768';
        bgColor = '#F0F8FF';
        borderColor = '#B3D9FF';
        break;
      default:
        textColor = 'text.secondary';
        bgColor = 'grey.100';
        borderColor = '#DDF3EF';
    }
    return { textColor, bgColor, borderColor };
  };

  // Check if any filters are active
  const hasActiveFilters = filters.searchTerm || filters.status > 0 || filters.specializationId > 0;

  const activeSpecializationName = useMemo(() => {
    if (!filters.specializationId) return undefined;
    return specializations?.find((s) => s.Id === filters.specializationId)?.Name;
  }, [specializations, filters.specializationId]);

  const activeStatusName = useMemo(() => {
    if (!filters.status) return undefined;
    return statusOptions?.find((s) => s.Id === filters.status)?.Name;
  }, [statusOptions, filters.status]);

  // Show no data message if no doctors, but keep header and search/filter functionality
  if (!doctors || (doctors.length === 0 && !hasActiveFilters)) {
    return (
      <>
        {/* No Data Found Message */}

        <EmptyState
          icon="/assets/images/doctors/icon.svg"
          header={hasActiveFilters ? 'No appointments found' : 'No appointments yet'}
          subheader={
            hasActiveFilters
              ? 'No appointments match your current filters. Try adjusting your search criteria or clearing some filters.'
              : "You haven't scheduled any appointments yet. Start by adding a new one."
          }
          buttonText="Add New Doctor"
          onButtonClick={hasActiveFilters ? handleResetFilters : handleOpenAddDialog}
          iconSize={150}
        />
        {/* Doctor Dialog */}
        <DoctorDialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          doctor={selectedDoctor}
          specializations={specializations}
          statusOptions={statusOptions}
        />
      </>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        {/* Header Section */}

        <SharedHeader
          header={t('DOCTOR.DOCTORS') || 'Doctors'}
          subheader="Manage all doctors, their specializations, and availability status."
          buttonText={t('DOCTOR.ADD_DOCTOR') || 'Add New Doctor'}
          onButtonClick={handleOpenAddDialog}
        />
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ mb: 0.5, color: 'text.secondary' }}>
                {t('DOCTOR.DOCTORS') || 'Doctors'}
              </Typography>
              {!!filters.searchTerm && (
                <Chip
                  size="small"
                  color="default"
                  label={`Search: ${filters.searchTerm}`}
                  onDelete={() => {
                    const next = { ...filters, searchTerm: '' };
                    setFilters(next);
                    updateURLParams(next);
                  }}
                  sx={{ height: 24 }}
                />
              )}
              {activeSpecializationName && (
                <Chip
                  size="small"
                  color="default"
                  label={`Specialization: ${activeSpecializationName}`}
                  onDelete={() => handleFilterChange('specializationId' as const, 0)}
                  sx={{ height: 24 }}
                />
              )}
              {activeStatusName && (
                <Chip
                  size="small"
                  color="default"
                  label={`Status: ${activeStatusName}`}
                  onDelete={() => handleFilterChange('status' as const, 0)}
                  sx={{ height: 24 }}
                />
              )}
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
                placeholder="Search doctors by name, specialization, or phone..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
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
                onClick={handleOpenFilterPopover}
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
            open={Boolean(filterAnchorEl && (filterAnchorEl as any).isConnected)}
            anchorEl={filterAnchorEl}
            onClose={handleCloseFilterPopover}
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
                Filter Options
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    value={filters.specializationId}
                    label="Specialization"
                    onChange={(e) => handleFilterChange('specializationId', Number(e.target.value))}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:briefcase-fill" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value={0}>All Specializations</MenuItem>
                    {specializations?.map((spec: ISpecialization) => (
                      <MenuItem key={spec.Id} value={spec.Id}>
                        {spec.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', Number(e.target.value))}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:flag-fill" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value={0}>All Statuses</MenuItem>
                    {statusOptions?.map((status) => (
                      <MenuItem key={status.Id} value={status.Id}>
                        {status.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ alignSelf: 'center', mr: 1 }}>
                  Active filters:
                </Typography>
                {filters.specializationId > 0 && (
                  <Chip
                    label={`Specialization: ${specializations?.find((s) => s.Id === filters.specializationId)?.Name || ''}`}
                    onDelete={() => handleFilterChange('specializationId', 0)}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {filters.status > 0 && (
                  <Chip
                    label={`Status: ${statusOptions?.find((s) => s.Id === filters.status)?.Name || ''}`}
                    onDelete={() => handleFilterChange('status', 0)}
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
              <Button variant="contained" onClick={handleCloseFilterPopover} size="small">
                Apply
              </Button>
            </Box>
          </Popover>

          {/* Auto-close popover when URL params change or anchor unmounts */}
          {null}

          {/* Doctors Table using SharedTable */}
          <SharedTable
            count={totalCount}
            data={doctors.map((doctor) => ({
              id: doctor.Id,
              ...doctor,
            }))}
            tableHead={TABLE_HEAD}
            actions={[
              {
                sx: { color: 'primary.main' },
                label: t('COMMON.EDIT') || 'Edit',
                icon: 'solar:pen-bold',
                onClick: (doctor: IDoctor) => handleEditDoctor(doctor),
              },
              {
                sx: { color: 'error.dark' },
                label: t('COMMON.DELETE') || 'Delete',
                icon: 'material-symbols:delete-outline-rounded',
                onClick: (doctor: IDoctor) => handleOpenDeleteDialog(doctor.Id.toString()),
              },
            ]}
            customRender={{
              StatusName: ({ StatusName, Status }: IDoctor) => (
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    minWidth: 80,
                    color: getStatusColor(Status).textColor,
                    backgroundColor: getStatusColor(Status).bgColor,
                    borderColor: getStatusColor(Status).borderColor,
                    border: `1px solid ${getStatusColor(Status).borderColor}`,
                  }}
                >
                  {StatusName}
                </Box>
              ),
            }}
            emptyIcon="/assets/images/doctors/icon.svg"
          />
        </Paper>
      </Stack>

      {/* Doctor Dialog */}
      <DoctorDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        doctor={selectedDoctor}
        specializations={specializations}
        statusOptions={statusOptions}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('DOCTOR.DELETE_DOCTOR') || 'Delete Doctor'}
        icon={<Image src="/assets/images/global/delete.svg" alt="delete" width={84} height={84} />}
        content={
          t('DOCTOR.DELETE_DOCTOR_CONFIRMATION') || 'Are you sure you want to delete this doctor?'
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteDoctor}
            disabled={isDeleting}
            sx={{
              width: { xs: '100%', lg: 175 },
              height: 56,
              borderRadius: 2,
              padding: '8px 16px',
              bgcolor: '#DF1C41',
              '&:hover': {
                bgcolor: '#DF1C60',
              },
            }}
          >
            {isDeleting ? t('COMMON.DELETING') || 'Deleting...' : t('COMMON.DELETE') || 'Delete'}
          </Button>
        }
      />
    </>
  );
}
