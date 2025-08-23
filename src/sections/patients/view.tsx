'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
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
import { useDeletePatient } from 'src/hooks/use-patients-query';

import { useLocales, useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import EmptyState from 'src/components/empty-state';
import { ConfirmDialog } from 'src/components/custom-dialog';
import PatientDialog from 'src/components/dialogs/patient-dialog';
import SharedHeader from 'src/components/shared-header/empty-state';

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
  gender: number; // 0 means no filter, >0 means specific value
  bloodType: number; // 0 means no filter, >0 means specific value
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
    gender: 0,
    bloodType: 0,
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslate();
  const { currentLang } = useLocales();
  const [selectedPatient, setSelectedPatient] = useState<IPatient | undefined>();
  const [selectedId, setSelectedId] = useState<string>('');
  const confirmDelete = useBoolean();
  const [isDeleting, setIsDeleting] = useState(false);

  // React Query mutations
  const deletePatientMutation = useDeletePatient();

  // Utility function to check if given filters match URL params
  const filtersMatchURL = useCallback(
    (compare: FilterState) => {
      const urlSearch = searchParams.get('SearchTerm') || '';
      const urlGender = Number(searchParams.get('Gender')) || 0;
      const urlBloodType = Number(searchParams.get('BloodType')) || 0;

      return (
        compare.searchTerm === urlSearch &&
        compare.gender === urlGender &&
        compare.bloodType === urlBloodType
      );
    },
    [searchParams]
  );

  // Update URL params when filters change
  const updateURLParams = useCallback(
    (newFilters: FilterState) => {
      // Don't update if provided filters already match URL
      if (filtersMatchURL(newFilters)) return;

      const params = new URLSearchParams(searchParams.toString());

      // Update search param
      if (newFilters.searchTerm) {
        params.set('SearchTerm', newFilters.searchTerm);
      } else {
        params.delete('SearchTerm');
      }

      // Update gender param - only set if it's a valid filter value (> 0)
      if (newFilters.gender > 0) {
        params.set('Gender', newFilters.gender.toString());
      } else {
        params.delete('Gender');
      }

      // Update blood type param - only set if it's a valid filter value (> 0)
      if (newFilters.bloodType > 0) {
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
    const gender = Number(searchParams.get('Gender')) || 0;
    const bloodType = Number(searchParams.get('BloodType')) || 0;

    setFilters({
      searchTerm: search,
      gender,
      bloodType,
    });
  }, [searchParams]);

  // Close filter popover when URL params change to prevent stale anchor positioning
  useEffect(() => {
    setFilterAnchorEl(null);
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

  // removed archive dialog handlers to match current actions

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
      gender: 0,
      bloodType: 0,
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
      // For gender and blood type, use 0 to indicate "no filter"
      newValue = 0;
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

  // removed archive action handler as it's not used in this view

  // Table configuration for SharedTable
  const TABLE_HEAD = [
    { id: 'FullName', label: t('LABEL.FULL_NAME') || 'Full Name' },
    { id: 'GenderName', label: t('LABEL.GENDER') || 'Gender' },
    { id: 'DateOfBirth', label: t('LABEL.DATE_OF_BIRTH') || 'Date of Birth' },
    { id: 'Address', label: t('LABEL.ADDRESS') || 'Address' },
    { id: 'PhoneNumber', label: t('LABEL.PHONE_NUMBER') || 'Phone Number' },
    { id: 'BloodTypeName', label: t('LABEL.BLOOD_TYPE') || 'Blood Type' },
    { id: '', label: '', width: 80 },
  ];

  const isAnchorValid =
    typeof document !== 'undefined' &&
    filterAnchorEl &&
    (filterAnchorEl as any).ownerDocument?.body.contains(filterAnchorEl);
  const openFilter = Boolean(isAnchorValid);

  // Auto-close if anchor element unmounts
  useEffect(() => {
    if (
      typeof document !== 'undefined' &&
      filterAnchorEl &&
      !(filterAnchorEl as any).ownerDocument?.body.contains(filterAnchorEl)
    ) {
      setFilterAnchorEl(null);
    }
  }, [filterAnchorEl]);

  // Check if any filters are currently applied
  const hasActiveFilters =
    Boolean(filters.searchTerm) || filters.gender > 0 || filters.bloodType > 0;

  // Show no data message if no patients, but keep header and search/filter functionality
  if (!patients || (patients.length === 0 && !hasActiveFilters)) {
    return (
      <>
        {/* No Data Found Message */}
        <EmptyState
          icon="/assets/images/patients/icon.svg"
          header={hasActiveFilters ? t('TITLE.NO_PATIENTS_FOUND') : t('TITLE.NO_PATIENTS_YET')}
          subheader={
            hasActiveFilters
              ? t('TITLE.NO_PATIENTS_MATCH_FILTERS')
              : t('TITLE.NO_PATIENTS_YET_START_BY_ADDING_NEW_ONE')
          }
          buttonText={hasActiveFilters ? t('BUTTON.CLEAR_FILTERS') : t('BUTTON.ADD_NEW_PATIENT')}
          onButtonClick={hasActiveFilters ? handleFilterReset : handleOpenAddDialog}
          iconSize={150}
        />

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

        <SharedHeader
          header={t('TITLE.PATIENTS')}
          subheader={t('TITLE.LATEST_UPDATES_FROM_THE_PAST_7_DAYS')}
          buttonText={t('BUTTON.ADD_NEW_PATIENT')}
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
                {t('TITLE.PATIENTS')}
              </Typography>
              {filters.gender > 0 && (
                <Chip
                  size="small"
                  color="default"
                  label={`${t('LABEL.GENDER')}: ${genders?.find((gender) => gender.Id === filters.gender)?.Name || ''}`}
                  onDelete={() => handleClearFilter('gender')}
                  sx={{ height: 24 }}
                />
              )}
              {filters.bloodType > 0 && (
                <Chip
                  size="small"
                  color="default"
                  label={`${t('LABEL.BLOOD_TYPE')}: ${bloodTypes?.find((bloodType) => bloodType.Id === filters.bloodType)?.Name || ''}`}
                  onDelete={() => handleClearFilter('bloodType')}
                  sx={{ height: 24 }}
                />
              )}
              {filters.searchTerm && (
                <Chip
                  size="small"
                  color="default"
                  label={`${t('LABEL.SEARCH')}: ${filters.searchTerm}`}
                  onDelete={() => handleClearFilter('searchTerm')}
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
                placeholder={t('LABEL.SEARCH_PATIENT_NAME') || 'Search patient name'}
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
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

              {/* Search Button */}
              {/* <Button
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
              </Button> */}

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
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {t('LABEL.FILTERS')}
              </Typography>
              <Button variant="outlined" onClick={handleFilterReset} size="small" color="primary">
                {t('BUTTON.RESET')}
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('LABEL.GENDER')}</InputLabel>
                  <Select
                    value={filters.gender}
                    label={t('LABEL.GENDER')}
                    onChange={(e) => handleFilterChange('gender', Number(e.target.value))}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:person-fill" />
                      </InputAdornment>
                    }
                  >
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
                  <InputLabel>{t('LABEL.BLOOD_TYPE')}</InputLabel>
                  <Select
                    value={filters.bloodType}
                    label={t('LABEL.BLOOD_TYPE')}
                    onChange={(e) => handleFilterChange('bloodType', Number(e.target.value))}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:droplet-fill" />
                      </InputAdornment>
                    }
                  >
                    {bloodTypes?.map((bloodType) => (
                      <MenuItem key={bloodType.Id} value={bloodType.Id}>
                        {bloodType.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Popover>

          {/* Active filters inline with header; removed bottom bar to match Rooms */}

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
                label: t('BUTTON.EDIT') || 'Edit',
                icon: 'solar:pen-bold',
                onClick: (patient: IPatient) => handleEditPatient(patient),
              },
              {
                sx: { color: 'error.dark' },
                label: t('BUTTON.DELETE') || 'Delete',
                icon: 'material-symbols:delete-outline-rounded',
                onClick: (patient: IPatient) => {
                  setSelectedId(patient.Id);
                  confirmDelete.onTrue();
                },
              },
            ]}
            customRender={{
              PhoneNumber: ({ PhoneNumber }: IPatient) => (
                <Box sx={{ direction: currentLang.value === 'ar' ? 'rtl' : 'ltr' }}>
                  {formatPhoneNumber(PhoneNumber)}
                </Box>
              ),
              EmergencyContact: ({ EmergencyContact }: IPatient) => (
                <Box>{formatPhoneNumber(EmergencyContact)}</Box>
              ),
              DateOfBirth: ({ DateOfBirth }: IPatient) => <Box>{formatDateLocal(DateOfBirth)}</Box>,
              CreatedAt: ({ CreatedAt }: IPatient) => <Box>{formatDateLocal(CreatedAt)}</Box>,
            }}
            emptyIcon="/assets/images/patients/icon.svg"
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
        title={t('TITLE.DELETE_PATIENT') || 'Delete Patient'}
        content={t('TITLE.DELETE_PATIENT_CONFIRMATION') || 'Are you sure you want to delete this patient?'}
        icon={<Image src="/assets/images/global/delete.svg" alt="delete" width={84} height={84} />}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeletePatient(selectedId)}
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
            {isDeleting ? t('BUTTON.DELETING') || 'Deleting...' : t('BUTTON.DELETE') || 'Delete'}
          </Button>
        }
      />

      {/* Confirm Archive Dialog */}
    </>
  );
}
