'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
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
import { useDeletePatient, useArchivePatient } from 'src/hooks/use-patients-query';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import PatientDialog from 'src/components/dialogs/patient-dialog';

import { ILookup } from 'src/types/lookups';
import { IPatient } from 'src/types/patient';

interface IProps {
  patients: IPatient[];
  totalCount: number;
  genders: ILookup[];
  bloodTypes: ILookup[];
}

interface FilterState {
  searchTerm: string;
  gender: number; // -1 means no filter, 0+ means specific value
  bloodType: number; // -1 means no filter, 0+ means specific value
}

const formatDateLocal = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatPhoneNumber = (phone: string) => {
  if (phone && phone.length === 10) {
    return `${phone.slice(0, 2)}-${phone.slice(2, 6)}-${phone.slice(6)}`;
  }
  return phone;
};

export default function PatientsPage({ patients, totalCount, genders, bloodTypes }: IProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    gender: -1,
    bloodType: -1,
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevSearchTermRef = useRef<string>('');

  const { t } = useTranslate();
  const [selectedPatient, setSelectedPatient] = useState<IPatient | undefined>();
  const [selectedId, setSelectedId] = useState<string>('');
  const confirmDelete = useBoolean();
  const [isDeleting, setIsDeleting] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);

  // React Query mutations
  const deletePatientMutation = useDeletePatient();
  const archivePatientMutation = useArchivePatient();

  // Utility function to check if filters match URL params
  const filtersMatchURL = useCallback(() => {
    const urlSearch = searchParams.get('SearchTerm') || '';
    const urlGender = searchParams.get('Gender') !== null ? Number(searchParams.get('Gender')) : -1;
    const urlBloodType =
      searchParams.get('BloodType') !== null ? Number(searchParams.get('BloodType')) : -1;

    return (
      filters.searchTerm === urlSearch &&
      filters.gender === urlGender &&
      filters.bloodType === urlBloodType
    );
  }, [filters, searchParams]);

  // Update URL params when filters change
  const updateURLParams = useCallback(
    (newFilters: FilterState) => {
      // Don't update if filters already match URL
      if (filtersMatchURL()) return;

      const params = new URLSearchParams(searchParams.toString());

      // Update search param
      if (newFilters.searchTerm) {
        params.set('SearchTerm', newFilters.searchTerm);
      } else {
        params.delete('SearchTerm');
      }

      // Update gender param - only set if it's a valid filter value (>= 0)
      if (newFilters.gender >= 0) {
        params.set('Gender', newFilters.gender.toString());
      } else {
        params.delete('Gender');
      }

      // Update blood type param - only set if it's a valid filter value (>= 0)
      if (newFilters.bloodType >= 0) {
        params.set('BloodType', newFilters.bloodType.toString());
      } else {
        params.delete('BloodType');
      }

      // Reset to page 1 when applying filters
      params.set('page', '1');

      // Update URL without page refresh
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router, filtersMatchURL]
  );

  // Initialize filters from URL params on component mount
  useEffect(() => {
    const search = searchParams.get('SearchTerm') || '';
    const genderParam = searchParams.get('Gender');
    const bloodTypeParam = searchParams.get('BloodType');

    // Handle the case where "0" is a valid filter value
    const gender = genderParam !== null ? Number(genderParam) : -1;
    const bloodType = bloodTypeParam !== null ? Number(bloodTypeParam) : -1;

    setFilters({
      searchTerm: search,
      gender,
      bloodType,
    });
  }, [searchParams]);

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      // This will trigger the above useEffect when URL changes
      // The filters will be updated automatically
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Debounced search effect - only trigger when search term actually changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only update URL if the search term has actually changed from what's in the URL
      const currentSearchTerm = searchParams.get('SearchTerm') || '';
      if (filters.searchTerm !== currentSearchTerm) {
        updateURLParams(filters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters, searchParams, updateURLParams]);

  const handleOpenAddDialog = () => {
    setSelectedPatient(undefined);
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedPatient(undefined);
  };

  const handleOpenArchiveDialog = (patientId: string) => {
    setSelectedId(patientId);
    setOpenArchiveDialog(true);
  };

  const handleCloseArchiveDialog = () => {
    setOpenArchiveDialog(false);
    setSelectedId('');
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Immediately update URL for select changes, search is handled by debounced effect
    if (key === 'gender' || key === 'bloodType') {
      updateURLParams(newFilters);
    }
    // For search term, let the debounced effect handle it
  };

  const handleFilterApply = () => {
    updateURLParams(filters);
    handleFilterClose();
  };

  const handleFilterReset = () => {
    const resetFilters = {
      searchTerm: '',
      gender: -1,
      bloodType: -1,
    };
    setFilters(resetFilters);
    updateURLParams(resetFilters);
    handleFilterClose();
  };

  const handleClearFilter = (key: keyof FilterState) => {
    let newValue: string | number;

    if (key === 'searchTerm') {
      newValue = '';
    } else {
      // For gender and blood type, use -1 to indicate "no filter"
      newValue = -1;
    }

    const newFilters = { ...filters, [key]: newValue };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const handleEditPatient = (patient: IPatient) => {
    setSelectedPatient(patient);
    setOpenAddDialog(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      setIsDeleting(true);
      await deletePatientMutation.mutateAsync(patientId);
      confirmDelete.onFalse();
      setIsDeleting(false);
    } catch (error) {
      console.error('Delete patient error:', error);
      setIsDeleting(false);
    }
  };

  const handleArchivePatient = async (patientId: string) => {
    try {
      await archivePatientMutation.mutateAsync(patientId);
      handleCloseArchiveDialog();
    } catch (error) {
      console.error('Archive patient error:', error);
    }
  };

  // Table configuration for SharedTable
  const TABLE_HEAD = [
    { id: 'FullName', label: 'Full Name' },
    { id: 'GenderName', label: 'Gender' },
    { id: 'DateOfBirth', label: 'Date of Birth' },
    { id: 'Address', label: 'Address' },
    { id: 'PhoneNumber', label: 'Phone Number' },
    { id: 'BloodTypeName', label: 'Blood Type' },
    { id: '', label: '', width: 80 },
  ];

  const openFilter = Boolean(filterAnchorEl);

  // Check if any filters are currently applied
  const hasActiveFilters = filters.searchTerm || filters.gender >= 0 || filters.bloodType >= 0;

  // Show no data message if no patients, but keep header and search/filter functionality
  if (!patients || patients.length === 0) {
    return (
      <>
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
              src="/assets/images/patients/icon.svg"
              alt="No data found"
              sx={{
                width: 144,
                height: 144,
                mb: 3,
              }}
            />
          )}

          <Typography variant="h5" sx={{ mb: 1, color: 'text.secondary' }}>
            {hasActiveFilters ? 'No patients found' : 'No patients yet'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', maxWidth: 400 }}>
            {hasActiveFilters
              ? 'No patients match your current filters. Try adjusting your search criteria or clearing some filters.'
              : "You haven't added any patients yet. Start by adding a new one."}
          </Typography>
          <Button
            variant="contained"
            onClick={hasActiveFilters ? handleFilterReset : handleOpenAddDialog}
            sx={{ mb: 2 }}
          >
            {hasActiveFilters ? 'Clear Filters' : 'Add New Patient'}
          </Button>
        </Box>

        {/* Patient Dialog */}
        <PatientDialog
          key={selectedPatient ? `edit-${selectedPatient.Id}` : 'new-patient'}
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          genders={genders}
          bloodTypes={bloodTypes}
          patient={null}
        />
      </>
    );
  }

  return (
    <>
      <Stack spacing={3}>
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
              Patients
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Latest updates from the past 7 days.
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
            Add New Patient
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
                Patients
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
                placeholder="Search patient name, phone, or address..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateURLParams(filters);
                  }
                }}
                sx={{ flexGrow: 1, maxWidth: 600, width: '100%' }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                  endAdornment: filters.searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleClearFilter('searchTerm')}
                        edge="end"
                      >
                        <Iconify icon="eva:close-fill" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Search Button */}
              <Button
                variant="contained"
                size="small"
                onClick={() => updateURLParams(filters)}
                disabled={!filters.searchTerm}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  height: 40,
                }}
              >
                Search
              </Button>

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
                Filter Patients
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={filters.gender}
                    label="Gender"
                    onChange={(e) => handleFilterChange('gender', Number(e.target.value))}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:person-fill" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value={-1}>All Genders</MenuItem>
                    {genders?.map((gender) => (
                      <MenuItem key={gender.Id} value={gender.Id}>
                        {gender.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Blood Type</InputLabel>
                  <Select
                    value={filters.bloodType}
                    label="Blood Type"
                    onChange={(e) => handleFilterChange('bloodType', Number(e.target.value))}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:droplet-fill" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value={-1}>All Blood Types</MenuItem>
                    {bloodTypes?.map((bloodType) => (
                      <MenuItem key={bloodType.Id} value={bloodType.Id}>
                        {bloodType.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(filters.gender >= 0 || filters.bloodType >= 0) && (
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ alignSelf: 'center', mr: 1 }}>
                  Active filters:
                </Typography>
                {filters.gender >= 0 && (
                  <Chip
                    label={`Gender: ${genders?.find((gender) => gender.Id === filters.gender)?.Name || ''}`}
                    onDelete={() => handleClearFilter('gender')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {filters.bloodType >= 0 && (
                  <Chip
                    label={`Blood Type: ${bloodTypes?.find((bloodType) => bloodType.Id === filters.bloodType)?.Name || ''}`}
                    onDelete={() => handleClearFilter('bloodType')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleFilterReset} size="small">
                Reset
              </Button>
              <Button variant="contained" onClick={handleFilterApply} size="small">
                Apply
              </Button>
            </Box>
          </Popover>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Active filters:
              </Typography>
              {filters.searchTerm && (
                <Chip
                  label={`Search: "${filters.searchTerm}"`}
                  onDelete={() => handleClearFilter('searchTerm')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {filters.gender >= 0 && (
                <Chip
                  label={`Gender: ${genders?.find((gender) => gender.Id === filters.gender)?.Name || ''}`}
                  onDelete={() => handleClearFilter('gender')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {filters.bloodType >= 0 && (
                <Chip
                  label={`Blood Type: ${bloodTypes?.find((bloodType) => bloodType.Id === filters.bloodType)?.Name || ''}`}
                  onDelete={() => handleClearFilter('bloodType')}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              <Button
                variant="text"
                size="small"
                onClick={handleFilterReset}
                sx={{ ml: 'auto', color: 'text.secondary' }}
              >
                Clear All
              </Button>
            </Box>
          )}

          {/* Patients Table using SharedTable */}
          <SharedTable
            count={totalCount}
            data={patients.map((patient) => ({
              id: patient.Id,
              ...patient,
            }))}
            tableHead={TABLE_HEAD}
            actions={[
              {
                sx: { color: 'primary.main' },
                label: 'Edit',
                icon: 'solar:pen-bold',
                onClick: (patient: IPatient) => handleEditPatient(patient),
              },
              {
                sx: { color: 'error.dark' },
                label: 'Delete',
                icon: 'material-symbols:delete-outline-rounded',
                onClick: (patient: IPatient) => {
                  setSelectedId(patient.Id);
                  confirmDelete.onTrue();
                },
              },
            ]}
            customRender={{
              PhoneNumber: ({ PhoneNumber }: IPatient) => (
                <Box>{formatPhoneNumber(PhoneNumber)}</Box>
              ),
              EmergencyContact: ({ EmergencyContact }: IPatient) => (
                <Box>{formatPhoneNumber(EmergencyContact)}</Box>
              ),
              DateOfBirth: ({ DateOfBirth }: IPatient) => <Box>{formatDateLocal(DateOfBirth)}</Box>,
              CreatedAt: ({ CreatedAt }: IPatient) => <Box>{formatDateLocal(CreatedAt)}</Box>,
            }}
          />
        </Paper>
      </Stack>

      {/* Patient Dialog */}
      <PatientDialog
        key={selectedPatient ? `edit-${selectedPatient.Id}` : 'new-patient'}
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        genders={genders}
        bloodTypes={bloodTypes}
        patient={selectedPatient}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete Patient"
        content="Are you sure you want to delete this patient?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeletePatient(selectedId)}
            disabled={isDeleting}
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
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />

      {/* Confirm Archive Dialog */}
    </>
  );
}
