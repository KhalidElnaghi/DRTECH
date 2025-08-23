'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Button,
  Select,
  Popover,
  MenuItem,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDeleteRoom, useDisableRoom, useArchiveRoom } from 'src/hooks/use-rooms-query';

import { formatDateLocal } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import Iconify from 'src/components/iconify';
import EmptyState from 'src/components/empty-state';
import RoomDialog from 'src/components/dialogs/room-dialog';
import { ConfirmDialog } from 'src/components/custom-dialog';
import SharedHeader from 'src/components/shared-header/empty-state';

import { IRoom } from 'src/types/room';
import { ILookup } from 'src/types/lookups';

interface IProps {
  rooms: IRoom[];
  totalCount: number;
  roomTypes: ILookup[];
  roomStatus: ILookup[];
}

interface FilterState {
  searchTerm: string;
  status: number;
}

export default function RoomsPage({ rooms, totalCount, roomTypes, roomStatus }: IProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 0,
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { t } = useTranslate();
  const [selectedRoom, setSelectedRoom] = useState<IRoom | undefined>();
  const [selectedId, setSelectedId] = useState<string>('');
  const confirmDelete = useBoolean();
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDisableDialog, setOpenDisableDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);

  // React Query mutations
  const deleteRoomMutation = useDeleteRoom();
  const disableRoomMutation = useDisableRoom();
  const archiveRoomMutation = useArchiveRoom();

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

      // Reset to page 1 when applying filters
      params.set('page', '1');

      // Update URL without page refresh
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  // Initialize filters from URL params on component mount
  useEffect(() => {
    const search = searchParams.get('SearchTerm') || '';
    const status = Number(searchParams.get('status')) || 0;

    setFilters({
      searchTerm: search,
      status,
    });
  }, [searchParams]);

  // Close filter popover when URL params change to prevent stale anchor positioning
  useEffect(() => {
    setFilterAnchorEl(null);
  }, [searchParams]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentSearchTerm = searchParams.get('SearchTerm') || '';
      if (filters.searchTerm !== currentSearchTerm) {
        updateURLParams(filters);
      }
    }, 500); // eslint-disable-line react-hooks/exhaustive-deps

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenAddDialog = () => {
    setSelectedRoom(undefined); // Clear any previously selected room
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedRoom(undefined);
  };

  const handleOpenDisableDialog = (roomId: string) => {
    setSelectedId(roomId);
    setOpenDisableDialog(true);
  };

  const handleCloseDisableDialog = () => {
    setOpenDisableDialog(false);
    setSelectedId('');
  };

  const handleOpenArchiveDialog = (roomId: string) => {
    setSelectedId(roomId);
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

    // Immediately update URL for status changes, search is handled by debounced effect
    if (key === 'status') {
      updateURLParams(newFilters);
    }
  };

  const handleFilterApply = () => {
    updateURLParams(filters);
    handleFilterClose();
  };

  const handleFilterReset = () => {
    const resetFilters = {
      searchTerm: '',
      status: 0,
    };
    setFilters(resetFilters);
    updateURLParams(resetFilters);
    handleFilterClose();
  };

  const handleEditRoom = (room: IRoom) => {
    setSelectedRoom(room);
    setOpenAddDialog(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      setIsDeleting(true);
      await deleteRoomMutation.mutateAsync(roomId);
      confirmDelete.onFalse();
      setIsDeleting(false);
    } catch (error) {
      console.error('Delete room error:', error);
      setIsDeleting(false);
    }
  };

  const handleDisableRoom = async (roomId: string) => {
    try {
      await disableRoomMutation.mutateAsync(roomId);
      handleCloseDisableDialog();
    } catch (error) {
      console.error('Disable room error:', error);
    }
  };

  const handleArchiveRoom = async (roomId: string) => {
    try {
      await archiveRoomMutation.mutateAsync(roomId);
      handleCloseArchiveDialog();
    } catch (error) {
      console.error('Archive room error:', error);
    }
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
        textColor = '#A77B2E';
        bgColor = '#FFF6E0';
        borderColor = '#FAEDCC';
        break;
      case 3:
      case 6:
        textColor = '#B21634';
        bgColor = '#FEF3F2';
        borderColor = '#FECDCA';
        break;
      case 4:
        textColor = '#003768';
        bgColor = '#F0F8FF';
        borderColor = '#B3D9FF';
        break;
      case 5:
        textColor = '#A52A2A';
        bgColor = '#FFF0F0';
        borderColor = '#FF8080';
        break;

      // textColor = '#1F2937';
      // bgColor = '#F3F4F6';
      // borderColor = '#9CA3AF';
      // break;
      case 7:
        textColor = '#006C9C';
        bgColor = '#CAFDF5';
        borderColor = '#B3D9FF';
        break;
      default:
        textColor = 'text.secondary';
        bgColor = 'grey.100';
        borderColor = '#DDF3EF';
    }
    return { textColor, bgColor, borderColor };
  };

  // Table configuration for SharedTable
  const TABLE_HEAD = [
    { id: 'RoomNumber', label: t('ROOM.ROOM_NUMBER') || 'Room Number' },
    { id: 'Floor', label: t('ROOM.FLOOR') || 'Floor' },
    { id: 'TypeName', label: t('ROOM.ROOM_TYPE') || 'Room Type' },
    { id: 'StatusName', label: t('ROOM.ROOM_STATUS') || 'Room Status' },
    { id: 'CreatedAt', label: t('COMMON.CREATED_AT') || 'Created At' },
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
  const hasActiveFilters = filters.searchTerm || filters.status > 0;

  // Derive active filter names to display next to title
  const activeStatusName =
    filters.status > 0 ? roomStatus?.find((s) => s.Id === filters.status)?.Name : undefined;

  // Show no data message if no rooms, but keep header and search/filter functionality
  if (!rooms || (rooms.length === 0 && !hasActiveFilters)) {
    return (
      <>
        {/* No Data Found Message */}

        <EmptyState
          icon="/assets/images/rooms/icon.svg"
          header={hasActiveFilters ? t('TITLE.NO_ROOMS_FOUND') : t('TITLE.NO_ROOMS_YET')}
          subheader={
            hasActiveFilters
              ? t('TITLE.NO_ROOMS_MATCH_FILTERS')
              : t('TITLE.NO_ROOMS_YET_START_BY_ADDING_NEW_ONE')
          }
          buttonText={hasActiveFilters ? t('BUTTON.CLEAR_FILTERS') : t('BUTTON.ADD_NEW_ROOM')}
          onButtonClick={hasActiveFilters ? handleFilterReset : handleOpenAddDialog}
          iconSize={150}
        />
        {/* Room Dialog */}
        <RoomDialog
          key={selectedRoom ? `edit-${selectedRoom.Id}` : 'new-room'}
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          roomTypes={roomTypes}
          roomStatus={roomStatus}
          room={null}
        />
      </>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        {/* Header Section */}

        <SharedHeader
          header={t('ROOM.ROOMS') || 'Rooms'}
          subheader={t('ROOM.ROOMS_SUBHEADER') || 'Latest updates from the past 7 days.'}
          buttonText={t('BUTTON.ADD_NEW_ROOM') || 'Add New Room'}
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
                {t('ROOM.ROOMS') || 'Rooms'}
              </Typography>
              {activeStatusName && (
                <Chip
                  size="small"
                  color="default"
                  label={`${t('ROOM.STATUS')}: ${activeStatusName}`}
                  onDelete={() => handleFilterChange('status', 0)}
                  sx={{ height: 24 }}
                />
              )}
              {filters.searchTerm && (
                <Chip
                  size="small"
                  color="default"
                  label={`${t('ROOM.SEARCH')}: ${filters.searchTerm}`}
                  onDelete={() => {
                    const next = { ...filters, searchTerm: '' };
                    setFilters(next);
                    updateURLParams(next);
                  }}
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
                placeholder={t('ROOM.SEARCH_ROOM_NUMBER') || 'Search by room number'}
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
                {t('ROOM.FILTER_BY_STATUS') || 'Filter by Status'}
              </Typography>
              <Button variant="outlined" color="primary" onClick={handleFilterReset} size="small">
                {t('COMMON.RESET') || 'Reset'}
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('ROOM.ROOM_STATUS') || 'Room Status'}</InputLabel>
                  <Select
                    value={filters.status}
                    label={t('ROOM.ROOM_STATUS') || 'Room Status'}
                    onChange={(e) => handleFilterChange('status', Number(e.target.value))}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:flag-fill" />
                      </InputAdornment>
                    }
                  >
                    {roomStatus?.map((status) => (
                      <MenuItem key={status.Id} value={status.Id}>
                        {status.Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {filters.status > 0 && (
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ alignSelf: 'center', mr: 1 }}>
                  {t('ROOM.ACTIVE_FILTERS') || 'Active filters:'}
                </Typography>

                {filters.status > 0 && (
                  <Chip
                    label={`${t('ROOM.STATUS')}: ${roomStatus?.find((status) => status.Id === filters.status)?.Name || ''}`}
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
              {/* <Button variant="contained" onClick={handleFilterApply} size="small">
                {t('COMMON.APPLY') || 'Apply'}
              </Button> */}
            </Box>
          </Popover>

          {/* Rooms Table using SharedTable */}

          <SharedTable
            count={totalCount}
            data={rooms.map((room) => ({
              id: room.Id,
              ...room,
            }))}
            tableHead={TABLE_HEAD}
            actions={[
              {
                sx: { color: 'primary.main' },
                label: t('COMMON.EDIT') || 'Edit',
                icon: 'solar:pen-bold',
                onClick: (room: IRoom) => handleEditRoom(room),
              },
              {
                sx: { color: 'error.dark' },
                label: t('COMMON.DISABLE') || 'Disable',
                icon: 'eva:slash-fill',
                onClick: (room: IRoom) => handleOpenDisableDialog(room.Id),
                hide: (room: IRoom) => room.Status === 6, // Hide if already disabled
              },
              {
                sx: { color: 'warning.main' },
                label: t('COMMON.ARCHIVE') || 'Archive',
                icon: 'eva:archive-fill',
                onClick: (room: IRoom) => handleOpenArchiveDialog(room.Id),
                hide: (room: IRoom) => room.Status === 7, // Hide if already archived
              },
              // {
              //   sx: { color: 'error.dark' },
              //   label: t('COMMON.DELETE') || 'Delete',
              //   icon: 'material-symbols:delete-outline-rounded',
              //   onClick: (room: IRoom) => {
              //     setSelectedId(room.Id);
              //     confirmDelete.onTrue();
              //   },
              // },
            ]}
            customRender={{
              StatusName: ({ StatusName, Status }: IRoom) => (
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    fontWeight: 500,
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
              CreatedAt: ({ CreatedAt }: IRoom) => <Box>{formatDateLocal(CreatedAt)}</Box>,
            }}
            emptyIcon="/assets/images/rooms/icon.svg"
          />
        </Paper>
      </Stack>

      {/* Room Dialog */}
      <RoomDialog
        key={selectedRoom ? `edit-${selectedRoom.Id}` : 'new-room'}
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        roomTypes={roomTypes}
        roomStatus={roomStatus}
        room={selectedRoom}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('ROOM.DELETE_ROOM') || 'Delete Room'}
        content={t('ROOM.DELETE_ROOM_CONFIRMATION') || 'Are you sure you want to delete this room?'}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteRoom(selectedId)}
            disabled={isDeleting}
          >
            {isDeleting ? t('COMMON.DELETING') || 'Deleting...' : t('COMMON.DELETE') || 'Delete'}
          </Button>
        }
      />

      {/* Confirm Disable Dialog */}
      <ConfirmDialog
        open={openDisableDialog}
        onClose={handleCloseDisableDialog}
        title={t('ROOM.DISABLE_ROOM') || 'Disable Room'}
        content={
          t('ROOM.DISABLE_ROOM_CONFIRMATION') || 'Are you sure you want to disable this room?'
        }
        action={
          <Button
            variant="contained"
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
            onClick={() => handleDisableRoom(selectedId)}
          >
            {t('COMMON.DISABLE') || 'Disable'}
          </Button>
        }
      />

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        open={openArchiveDialog}
        onClose={handleCloseArchiveDialog}
        title={t('ROOM.ARCHIVE_ROOM') || 'Archive Room'}
        content={
          t('ROOM.ARCHIVE_ROOM_CONFIRMATION') || 'Are you sure you want to archive this room?'
        }
        action={
          <Button
            variant="contained"
            sx={{
              width: { xs: '100%', lg: 175 },
              height: 56,
              borderRadius: 2,
              padding: '8px 16px',
            }}
            color="info"
            onClick={() => handleArchiveRoom(selectedId)}
          >
            {t('COMMON.ARCHIVE') || 'Archive'}
          </Button>
        }
      />
    </>
  );
}
