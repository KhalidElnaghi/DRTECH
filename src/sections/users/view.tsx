'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { Box, Paper, Button, TextField, Typography, InputAdornment } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDeleteUser, useUpdateUserRole } from 'src/hooks/use-users-query';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import { cellAlignment } from 'src/CustomSharedComponents/SharedTable/types';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import UserDialog from 'src/components/dialogs/user-dialog/UserDialog';
import UserRoleDialog from 'src/components/dialogs/user-role-dialog/UserRoleDialog';

import { ILookup } from 'src/types/lookups';
import { TableUser } from 'src/types/users';
import { enqueueSnackbar } from 'notistack';

interface IProps {
  users: TableUser[];
  totalCount: number;
  roles: ILookup[];
  statuses: ILookup[];
  specializations: { Id: number; Name: string }[];
}

interface FilterState {
  searchTerm: string;
}

const TABLE_HEAD = [
  { id: 'FullName', label: 'Full Name', align: cellAlignment.left },
  { id: 'Email', label: 'Email', align: cellAlignment.left },
  { id: 'RoleName', label: 'Role', align: cellAlignment.left },
  { id: 'CreatedAt', label: 'Created At', align: cellAlignment.left },
  { id: '', label: '', width: 80 },
];

export default function UsersPage({ users, totalCount, roles, statuses, specializations }: IProps) {
  const [openDialog, setOpenDialog] = useState(false);
  // const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState<FilterState>({ searchTerm: '' });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevSearch = useRef<string>('');

  const { t } = useTranslate();
  const [selectedUser, setSelectedUser] = useState<TableUser | undefined>();
  const [selectedId, setSelectedId] = useState<number | string>('');
  const confirmDelete = useBoolean();
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user?: TableUser }>({
    open: false,
  });
  const [newRoleId, setNewRoleId] = useState<number>(0);

  const deleteUserMutation = useDeleteUser();
  const updateUserRoleMutation = useUpdateUserRole();

  useEffect(() => {
    const searchTerm = searchParams.get('SearchTerm') || '';
    setFilters({ searchTerm });
  }, [searchParams]);

  const updateURLParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newFilters.searchTerm) params.set('SearchTerm', newFilters.searchTerm);
      else params.delete('SearchTerm');
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFilters((prev) => ({ ...prev, searchTerm: value }));
    if (prevSearch.current !== value) {
      prevSearch.current = value;
      setTimeout(() => updateURLParams({ ...filters, searchTerm: value }), 500);
    }
  };

  const handleOpenDialog = () => {
    setSelectedUser(undefined);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(undefined);
  };

  const handleEditUser = (user: TableUser) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      await deleteUserMutation.mutateAsync(selectedId);
      confirmDelete.onFalse();
      setSelectedId('');
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = ``;
      if (error?.Error?.Message) {
        // API returned a specific error message
        errorMessage = error.Error.Message;
      } else if (error?.Message) {
        // Alternative error message format
        errorMessage = error.Message;
      } else if (error?.message) {
        // Generic error message
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const getStatusColor = (status: string) => {
    let textColor = 'text.secondary';
    let bgColor = 'grey.100';
    let borderColor = 'grey.100';
    switch (status) {
      case 'Super Admin':
        textColor = '#FFFFFF';
        bgColor = 'linear-gradient(90deg, #000000 0%, #434343 100%)';
        borderColor = '#1F1F1F';
        break;
      case 'Admin':
        textColor = '#003768';
        bgColor = '#F0F8FF';
        borderColor = '#B3D9FF';
        break;
      case 'Doctor':
        textColor = '#28806F';
        bgColor = '#EFFEFA';
        borderColor = '#DDF3EF';
        break;
      case 'Nurse':
        textColor = '#A77B2E';
        bgColor = '#FFF6E0';
        borderColor = '#FAEDCC';
        break;
      case 'Receptionist':
        textColor = '#003768';
        bgColor = '#F0F8FF';
        borderColor = '#B3D9FF';
        break;
      case 'Pharmacist':
        textColor = '#A52A2A';
        bgColor = '#FFF0F0';
        borderColor = '#FF8080';
        break;
      default:
        textColor = 'text.secondary';
        bgColor = 'grey.100';
        borderColor = '#DDF3EF';
    }
    return { textColor, bgColor, borderColor };
  };

  return (
    <>
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
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage roles and access for all users in the system.{' '}
          </Typography>
        </Box>
        <Button variant="contained" size="medium" color="primary" onClick={handleOpenDialog}>
          Add New User
        </Button>
      </Box>

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
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5, color: 'text.secondary' }}>
              Users
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              placeholder="Search by name or email..."
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
          </Box>
        </Box>

        <SharedTable
          count={totalCount}
          data={users.map((u) => ({ id: u.Id, ...u }))}
          tableHead={TABLE_HEAD}
          actions={[
            {
              sx: { color: 'primary.main' },
              label: t('COMMON.EDIT') || 'Edit',
              icon: 'solar:pen-bold',
              onClick: (user: TableUser) => handleEditUser(user),
            },
            {
              sx: { color: 'info.main' },
              label: 'Update Role',
              icon: 'mdi:account-switch-outline',
              onClick: (user: TableUser) => {
                setRoleDialog({ open: true, user });
                setNewRoleId(user.Role);
              },
            },
            {
              sx: { color: 'error.dark' },
              label: t('COMMON.DELETE') || 'Delete',
              icon: 'material-symbols:delete-outline-rounded',
              onClick: (user: TableUser) => {
                setSelectedId(user.Id);
                confirmDelete.onTrue();
              },
            },
          ]}
          customRender={{
            RoleName: ({ RoleName }: TableUser) => (
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
                  color: getStatusColor(RoleName).textColor,
                  background: getStatusColor(RoleName).bgColor,
                  borderColor: getStatusColor(RoleName).borderColor,
                  border: `1px solid ${getStatusColor(RoleName).borderColor}`,
                }}
              >
                {RoleName}
              </Box>
            ),
            // SpecializationName: (user: IUser) => (
            //   <Box>{user.Doctor?.SpecializationName || '-'}</Box>
            // ),
            // StatusName: (user: IUser) => <Box>{user.Doctor?.StatusName || '-'}</Box>,
          }}
        />
      </Paper>

      <UserDialog
        open={openDialog}
        onClose={handleCloseDialog}
        user={selectedUser}
        roles={roles}
        statuses={statuses}
        specializations={specializations}
      />

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete User"
        content="Are you sure you want to delete this user?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
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
            {isDeleting ? t('COMMON.DELETING') || 'Deleting...' : t('COMMON.DELETE') || 'Delete'}
          </Button>
        }
      />

      <UserRoleDialog
        open={roleDialog.open}
        onClose={() => setRoleDialog({ open: false })}
        roles={roles}
        value={newRoleId}
        onChange={setNewRoleId}
        submitting={updateUserRoleMutation.isPending || !roleDialog.user}
        onSubmit={async () => {
          if (!roleDialog.user) return;
          await updateUserRoleMutation.mutateAsync({
            UserId: roleDialog.user.Id,
            UserNewRole: newRoleId,
          });
          setRoleDialog({ open: false });
        }}
      />
    </>
  );
}
