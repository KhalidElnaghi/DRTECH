'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import {
  Box,
  Grid,
  Paper,
  Stack,
  Button,
  Select,
  Popover,
  MenuItem,
  InputLabel,
  Typography,
  FormControl,
  InputAdornment,
  IconButton,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDeletePayment } from 'src/hooks/use-payments-query';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import EmptyState from 'src/components/empty-state';
import { ConfirmDialog } from 'src/components/custom-dialog';
import PaymentDialog from 'src/components/dialogs/payment-dialog/PaymentDialog';

import { ILookup } from 'src/types/lookups';
import { IPayment } from 'src/types/payments';
import SharedHeader from 'src/components/shared-header/empty-state';
import Image from 'next/image';

interface IProps {
  payments: IPayment[];
  totalCount: number;
  doctors: ILookup[];
  paymentMethods: ILookup[];
  paymentStatus: ILookup[];
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
}: IProps) {
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ DoctorId: 0, Status: 0 });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevParamsRef = useRef<string>('');

  const [selectedId, setSelectedId] = useState<number | null>(null);
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
      { id: 'PaymentAmount', label: 'Amount' },
      { id: 'PaymentMethodName', label: 'Method' },
      { id: 'StatusName', label: 'Status' },
      { id: 'CreatedAt', label: 'Created At' },
      { id: '', label: '', width: 80 },
    ],
    []
  );

  const openFilter = Boolean(isFilterOpen && filterButtonRef.current);
  const hasActiveFilters = filters.DoctorId > 0 || filters.Status > 0;

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
  console.log(payments);
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
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, color: 'text.secondary' }}>
                Payments
              </Typography>
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
                <Typography sx={{ fontWeight: 600 }}>
                  ${Number(row?.PaymentAmount ?? 0).toFixed(2)}
                </Typography>
              ),
              CreatedAt: ({ CreatedAt }: any) => (
                <Typography>{CreatedAt ? new Date(CreatedAt).toLocaleString() : '-'}</Typography>
              ),
              PaymentMethodName: (row: any) => {
                const name =
                  row?.PaymentMethodName ||
                  paymentMethods.find((m) => m.Id === row?.PaymentMethod)?.Name;
                return <Typography>{name || '-'}</Typography>;
              },
              StatusName: (row: any) => {
                const name =
                  row?.StatusName || paymentStatus.find((s) => s.Id === row?.Status)?.Name;
                return <Typography>{name || '-'}</Typography>;
              },
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
            Delete
          </Button>
        }
      />
      <PaymentDialog
        open={createDialog.value}
        onClose={createDialog.onFalse}
        paymentMethods={paymentMethods}
        paymentStatus={paymentStatus}
      />
    </>
  );
}
