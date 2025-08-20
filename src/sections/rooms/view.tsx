'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  InputAdornment,
  IconButton,
  Popover,
  Grid,
  Paper,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDeleteRoom, useDisableRoom, useArchiveRoom } from 'src/hooks/use-rooms-query';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import RoomDialog from 'src/components/dialogs/room-dialog';
import { ConfirmDialog } from 'src/components/custom-dialog';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

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

const formatDateLocal = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

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
  const prevSearchTermRef = useRef<string>('');

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
      case 6:
        textColor = '#1F2937';
        bgColor = '#F3F4F6';
        borderColor = '#9CA3AF';
        break;
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

  const openFilter = Boolean(filterAnchorEl);

  // Check if any filters are currently applied
  const hasActiveFilters = filters.searchTerm || filters.status > 0;

  // Show no data message if no rooms, but keep header and search/filter functionality
  if (!rooms || rooms.length === 0) {
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
              src="/assets/images/rooms/icon.svg"
              alt="No data found"
              sx={{
                width: 144,
                height: 144,
                mb: 3,
              }}
            />
          )}

          <Typography variant="h5" sx={{ mb: 1, color: 'text.secondary' }}>
            {hasActiveFilters ? 'No rooms found' : 'No rooms yet'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', maxWidth: 400 }}>
            {hasActiveFilters
              ? 'No rooms match your current filters. Try adjusting your search criteria or clearing some filters.'
              : "You haven't added any rooms yet. Start by adding a new one."}
          </Typography>
          <Button
            variant="contained"
            onClick={hasActiveFilters ? handleFilterReset : handleOpenAddDialog}
            sx={{ mb: 2 }}
          >
            {hasActiveFilters ? 'Clear Filters' : 'Add New Room'}
          </Button>
        </Box>

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
              {t('ROOM.ROOMS') || 'Rooms'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Latest updates from the past 7 days.{' '}
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
            {t('ROOM.ADD_ROOM') || 'Add New Room'}
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
                {t('ROOM.ROOMS') || 'Rooms'}
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
                placeholder="Search room number, floor, or type..."
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Filter by Status
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Room Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Room Status"
                    onChange={(e) => handleFilterChange('status', Number(e.target.value))}
                    startAdornment={
                      <InputAdornment position="start">
                        <Iconify icon="eva:flag-fill" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value={0}>All Statuses</MenuItem>
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
                  Active filters:
                </Typography>
                {filters.status > 0 && (
                  <Chip
                    label={`Status: ${roomStatus?.find((status) => status.Id === filters.status)?.Name || ''}`}
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
              <Button variant="outlined" onClick={handleFilterReset} size="small">
                Reset
              </Button>
              <Button variant="contained" onClick={handleFilterApply} size="small">
                Apply
              </Button>
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
            sx={{ width: 175, height: 56, borderRadius: 2, padding: '8px 16px' }}
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
            sx={{ width: 175, height: 56, borderRadius: 2, padding: '8px 16px' }}
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
