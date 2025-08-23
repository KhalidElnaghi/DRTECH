'use client';

import Image from 'next/image';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import {
  Box,
  Grid,
  Chip,
  Paper,
  Stack,
  Button,
  Select,
  Popover,
  MenuItem,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDeletePayment } from 'src/hooks/use-payments-query';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import EmptyState from 'src/components/empty-state';
import { ConfirmDialog } from 'src/components/custom-dialog';
import SharedHeader from 'src/components/shared-header/empty-state';
import PaymentDialog from 'src/components/dialogs/payment-dialog/PaymentDialog';

import { ILookup } from 'src/types/lookups';
import { IPayment } from 'src/types/payments';

interface IProps {
  payments: IPayment[];
  totalCount: number;
  doctors: ILookup[];
  paymentMethods: ILookup[];
  paymentStatus: ILookup[];
  serviceTypes: ILookup[];
}

interface FilterState {
  DoctorId: number;
  Status: number;
}

export default function PaymentsPage({
  payments,
  totalCount,
  doctors,
  paymentMethods,
  paymentStatus,
  serviceTypes,
}: IProps) {
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ DoctorId: 0, Status: 0 });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevParamsRef = useRef<string>('');

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);
  const confirmDelete = useBoolean();
  const createDialog = useBoolean();
  const deletePaymentMutation = useDeletePayment();

  // Sync local filters state from URL params so the UI reflects current filters
  useEffect(() => {
    const doctorIdParam = Number(searchParams.get('DoctorId')) || 0;
    const statusIdParam = Number(searchParams.get('Status')) || 0;
    setFilters((prev) => {
      if (prev.DoctorId === doctorIdParam && prev.Status === statusIdParam) return prev;
      return { DoctorId: doctorIdParam, Status: statusIdParam };
    });
  }, [searchParams]);

  // Close filter popover when URL params change to prevent stale anchor positioning
  useEffect(() => {
    setIsFilterOpen(false);
  }, [searchParams]);

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'PatientName', label: 'Patient' },
      { id: 'DoctorName', label: 'Doctor' },
      { id: 'ServiceType', label: 'Service Type' },
      { id: 'PaymentMethodName', label: 'Method' },
      { id: 'PaymentAmount', label: 'Amount' },
      { id: 'StatusName', label: 'Status' },
      { id: '', label: '', width: 80 },
    ],
    []
  );

  const openFilter = Boolean(isFilterOpen && filterButtonRef.current);
  const hasActiveFilters = filters.DoctorId > 0 || filters.Status > 0;

  const activeDoctorName = useMemo(() => {
    if (!filters.DoctorId) return undefined;
    return doctors.find((d) => d.Id === filters.DoctorId)?.Name;
  }, [doctors, filters.DoctorId]);

  const activeStatusName = useMemo(() => {
    if (!filters.Status) return undefined;
    return paymentStatus.find((s) => s.Id === filters.Status)?.Name;
  }, [paymentStatus, filters.Status]);

  const updateURLParams = useCallback(
    (next: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.DoctorId > 0) params.set('DoctorId', String(next.DoctorId));
      else params.delete('DoctorId');
      if (next.Status > 0) params.set('Status', String(next.Status));
      else params.delete('Status');
      params.set('page', '1');
      const nextStr = params.toString();
      if (nextStr !== prevParamsRef.current) {
        prevParamsRef.current = nextStr;
        router.push(`${pathname}?${nextStr}`);
      }
    },
    [pathname, router, searchParams]
  );

  const handleFilterChange = (key: keyof FilterState, value: number) => {
    const next = { ...filters, [key]: value } as FilterState;
    setFilters(next);
    updateURLParams(next);
  };

  const handleFilterReset = () => {
    const reset = { DoctorId: 0, Status: 0 };
    setFilters(reset);
    updateURLParams(reset);
    // Ensure popover closes to avoid stale anchorEl and top-left positioning
    setIsFilterOpen(false);
  };

  const handleOpenFilter = () => setIsFilterOpen(true);
  const handleFilterClose = () => setIsFilterOpen(false);

  const onDelete = async () => {
    if (!selectedId) return;
    await deletePaymentMutation.mutateAsync(selectedId);
    confirmDelete.onFalse();
    setSelectedId(null);
  };
  const getStatusColors = (status: string) => {
    let textColor = 'text.secondary';
    let bgColor = 'grey.100';
    let borderColor = 'grey.100';

    switch (status) {
      case 'Paid':
        textColor = '#28806F';
        bgColor = '#EFFEFA';
        borderColor = '#DDF3EF';
        break;
      case 'Pending':
        textColor = '#A77B2E';
        bgColor = '#FFF6E0';
        borderColor = '#FAEDCC';
        break;
      case 'Partially Paid':
        textColor = '#116B97';
        bgColor = '#F0FBFF';
        borderColor = '#D1F0FA';
        break;
      case 'Cancelled':
        textColor = '#B21634';
        bgColor = '#FEF3F2';
        borderColor = '#FECDCA';
        break;
      case 'Failed':
        textColor = '#B21634';
        bgColor = '#FEF3F2';
        borderColor = '#FECDCA';
        break;
      case 'Refunded':
        textColor = '#7C3AED';
        bgColor = '#F3F4F6';
        borderColor = '#C4B5FD';
        break;

      default:
        textColor = 'text.secondary';
        bgColor = 'grey.100';
        borderColor = '#DDF3EF';
    }

    return { textColor, bgColor, borderColor };
  };
  // empty state
  if (!payments || (payments.length === 0 && !hasActiveFilters)) {
    return (
      <>
        <EmptyState
          icon="/assets/images/payments/icon.svg"
          header={hasActiveFilters ? 'No payments found' : 'No payments found'}
          subheader={
            hasActiveFilters
              ? 'Try changing the filters to find matching payments.'
              : 'Start tracking payments by creating one or linking it to an existing appointment'
          }
          buttonText={hasActiveFilters ? 'Clear Filters' : 'Add New Payment'}
          onButtonClick={hasActiveFilters ? handleFilterReset : createDialog.onTrue}
          iconSize={150}
        />

        <PaymentDialog
          open={createDialog.value}
          onClose={createDialog.onFalse}
          paymentMethods={paymentMethods}
          paymentStatus={paymentStatus}
          ServiceTypes={serviceTypes}
        />
      </>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <SharedHeader
          header="Payments"
          subheader="Manage and track all billing transactions from patients"
          buttonText="Add New Payment"
          onButtonClick={createDialog.onTrue}
        />
        <Paper
          elevation={1}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 0, mb: 1 }}
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
            {' '}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ mb: 0.5, color: 'text.secondary' }}>
                Payments
              </Typography>
              {activeDoctorName && (
                <Chip
                  size="small"
                  color="default"
                  label={`Doctor: ${activeDoctorName}`}
                  onDelete={() => handleFilterChange('DoctorId', 0)}
                  sx={{ height: 24 }}
                />
              )}
              {activeStatusName && (
                <Chip
                  size="small"
                  color="default"
                  label={`Status: ${activeStatusName}`}
                  onDelete={() => handleFilterChange('Status', 0)}
                  sx={{ height: 24 }}
                />
              )}
            </Box>
            <Box>
              <IconButton
                ref={filterButtonRef as any}
                onClick={handleOpenFilter}
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
              <Popover
                open={openFilter}
                anchorEl={filterButtonRef.current}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
                    Filter Payments
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" size="small" onClick={handleFilterReset}>
                      Reset
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Doctor</InputLabel>
                      <Select
                        value={filters.DoctorId}
                        onChange={(e) => handleFilterChange('DoctorId', Number(e.target.value))}
                        label="Doctor"
                        placeholder="Select doctor"
                        startAdornment={
                          <InputAdornment position="start">
                            <Iconify icon="eva:person-fill" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value={0}>All Doctors</MenuItem>
                        {doctors?.map((doctor) => (
                          <MenuItem key={doctor.Id} value={doctor.Id}>
                            {doctor.Name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.Status}
                        onChange={(e) => handleFilterChange('Status', Number(e.target.value))}
                        label="Status"
                        placeholder="Select status"
                        startAdornment={
                          <InputAdornment position="start">
                            <Iconify icon="mdi:clipboard-list" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value={0}>All Status</MenuItem>
                        {paymentStatus?.map((s) => (
                          <MenuItem key={s.Id} value={s.Id}>
                            {s.Name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Popover>
            </Box>
          </Box>

          <SharedTable
            count={totalCount}
            data={payments.map((p) => ({ id: p.Id, ...p }))}
            tableHead={TABLE_HEAD}
            actions={[
              {
                sx: { color: 'primary.main' },
                label: 'Edit',
                icon: 'solar:pen-bold',
                onClick: (row: IPayment) => {
                  setSelectedPayment(row);
                  createDialog.onTrue();
                },
              },
              {
                sx: { color: 'error.dark' },
                label: 'Delete',
                icon: 'material-symbols:delete-outline-rounded',
                onClick: (row: IPayment) => {
                  setSelectedId(row.Id);
                  confirmDelete.onTrue();
                },
              },
            ]}
            customRender={{
              PaymentAmount: (row: any) => (
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontFamily: '    ',
                    fontSize: '14px',
                  }}
                >
                  <Image
                    src="/assets/images/payments/Sar.svg"
                    alt="sar"
                    width={16}
                    height={16}
                    style={{ marginLeft: 4 }}
                  />{' '}
                  {Number(row?.PaymentAmount ?? 0).toFixed(2)}
                </Typography>
              ),
              StatusName: (row: any) => {
                const status = row?.StatusName;
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
                      fontWeight: 600,
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
              ServiceType: (row: any) => serviceTypes.find((s) => s.Id === row?.ServiceType)?.Name,
            }}
            emptyIcon="/assets/images/payments/icon.svg"
          />
        </Paper>
      </Stack>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete Payment"
        content="Are you sure you want to delete this payment?"
        icon={<Image src="/assets/images/global/delete.svg" alt="delete" width={84} height={84} />}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onDelete}
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
            Delete
          </Button>
        }
      />
      <PaymentDialog
        key={selectedPayment ? `edit-${selectedPayment.Id}` : 'new-payment'}
        open={createDialog.value}
        onClose={() => {
          createDialog.onFalse();
          setSelectedPayment(null);
        }}
        paymentMethods={paymentMethods}
        paymentStatus={paymentStatus}
        ServiceTypes={serviceTypes}
        payment={selectedPayment}
      />
    </>
  );
}
