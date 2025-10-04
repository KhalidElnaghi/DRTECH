'use client';

import { m } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useBoolean } from 'src/hooks/use-boolean';
import { useAccountData } from 'src/hooks/use-account-data';
import { UseNotificationsManagementReturn } from 'src/hooks/use-notifications-management';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { deleteAccountClient, updateAccountData, uploadPhoto } from 'src/api/settings';

import Iconify from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import SharedHeader from 'src/components/shared-header/empty-state';
import ConfirmDialog from 'src/components/custom-dialog/confirm-dialog';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'account',
    labelKey: 'SETTINGS.ACCOUNT',
    icon: 'solar:user-id-bold-duotone',
  },
  // {
  //   value: 'language',
  //   labelKey: 'SETTINGS.LANGUAGE',
  //   icon: 'solar:translate-bold-duotone',
  // },
  {
    value: 'notifications',
    labelKey: 'SETTINGS.PUSH_NOTIFICATIONS',
    icon: 'solar:bell-bold-duotone',
  },
];

// ----------------------------------------------------------------------

interface SettingsViewProps {
  notificationsLogic: UseNotificationsManagementReturn;
}

export default function SettingsView({ notificationsLogic }: SettingsViewProps) {
  const theme = useTheme();
  const { t } = useTranslate();
  const router = useRouter();
  const { logout } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentTab, setCurrentTab] = useState('account');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Fetch account data from API
  const { accountData, isLoading: isLoadingAccount, error: accountError } = useAccountData();

  // Extract notification logic from props
  const {
    notificationSettings,
    isLoadingSettings: isLoadingNotifications,
    isSavingSettings: isSavingNotifications,
    hasSettingsChanges,
    handleNotificationSettingChange,
    handleSaveSettings,
    handleCancelSettings,
  } = notificationsLogic;
  const [localAccountData, setLocalAccountData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: new Date(),
  });

  // Delete account state
  const confirmDelete = useBoolean(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update local state when account data is loaded from API
  useEffect(() => {
    if (accountData) {
      setLocalAccountData({
        firstName: accountData.FirstName || '',
        lastName: accountData.LastName || '',
        phoneNumber: accountData.PhoneNumber || '',
        email: accountData.Email || '',
        dateOfBirth: accountData.DateOfBirth ? new Date(accountData.DateOfBirth) : new Date(),
      });

      // Set profile image if available
      if (accountData.ProfileTempImagePath) {
        setProfileImage(accountData.ProfileTempImagePath);
      }
    }
  }, [accountData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleAccountChange = (field: keyof typeof localAccountData, value: any) => {
    setLocalAccountData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (1MB max)
      if (file.size > 1024 * 1024) {
        enqueueSnackbar('File size must be less than 1MB', { variant: 'error' });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        enqueueSnackbar('Please select an image file', { variant: 'error' });
        return;
      }

      try {
        setIsUploadingImage(true);

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        const response = await uploadPhoto(file);

        if (response.IsSuccess) {
          enqueueSnackbar('Profile image uploaded successfully', { variant: 'success' });
          setHasChanges(true);

          // Update profile image with server response if available
          if (response.Data?.ProfileTempImagePath) {
            setProfileImage(response.Data.ProfileTempImagePath);
          }
        } else {
          enqueueSnackbar(response.Error?.Message || 'Failed to upload image', {
            variant: 'error',
          });
          // Revert to original image on error
          if (accountData?.ProfileTempImagePath) {
            setProfileImage(accountData.ProfileTempImagePath);
          } else {
            setProfileImage(null);
          }
        }
      } catch (error: any) {
        console.error('Image upload error:', error);
        enqueueSnackbar('Failed to upload image. Please try again.', { variant: 'error' });

        // Revert to original image on error
        if (accountData?.ProfileTempImagePath) {
          setProfileImage(accountData.ProfileTempImagePath);
        } else {
          setProfileImage(null);
        }
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (currentTab === 'notifications') {
      await handleSaveSettings();
    } else if (currentTab === 'account') {
      try {
        setIsSavingAccount(true);

        // Prepare the data for the API request
        const updateData = {
          FirstName: localAccountData.firstName,
          LastName: localAccountData.lastName,
          PhoneNumber: localAccountData.phoneNumber,
          Email: localAccountData.email,
          DateOfBirth: localAccountData.dateOfBirth.toISOString().split('T')[0], // Format as YYYY-MM-DD
          ProfileTempImagePath: profileImage || undefined,
        };

        const response = await updateAccountData(updateData);

        if (response.IsSuccess) {
          enqueueSnackbar('Account information updated successfully', { variant: 'success' });
          setHasChanges(false);

          // Optionally refetch account data to get the latest from server
          // This ensures we have the most up-to-date data
          // You could add a refetch function to the useAccountData hook if needed
        } else {
          enqueueSnackbar(response.Error?.Message || 'Failed to update account information', {
            variant: 'error',
          });
        }
      } catch (error: any) {
        console.error('Account update error:', error);
        enqueueSnackbar('Failed to update account information. Please try again.', {
          variant: 'error',
        });
      } finally {
        setIsSavingAccount(false);
      }
    }
  };

  const handleCancel = () => {
    if (currentTab === 'notifications') {
      handleCancelSettings();
    } else {
      // Reset account data to original API values
      if (accountData) {
        setLocalAccountData({
          firstName: accountData.FirstName || '',
          lastName: accountData.LastName || '',
          phoneNumber: accountData.PhoneNumber || '',
          email: accountData.Email || '',
          dateOfBirth: accountData.DateOfBirth ? new Date(accountData.DateOfBirth) : new Date(),
        });
        setProfileImage(accountData.ProfileTempImagePath || null);
      }
      setHasChanges(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccountClient();
      // Handle successful deletion - redirect to login or show success message
      enqueueSnackbar(t('SETTINGS.ACCOUNT_DELETED_SUCCESS') || 'Account deleted successfully', {
        variant: 'success',
      });
      // Close dialog first, then logout
      confirmDelete.onFalse();
      localStorage.removeItem('access_token');
      await logout();
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      // Handle error - show error message
      let errorMessage = 'Failed to delete account';

      if (error?.Error?.Message) {
        errorMessage = error.Error.Message;
      } else if (error?.Message) {
        errorMessage = error.Message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderTabs = (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack spacing={1}>
        {TABS.map((tab) => (
          <Box
            key={tab.value}
            component={m.div}
            whileHover="hover"
            variants={varHover(1.02)}
            sx={{
              p: 1.2,
              borderRadius: 1,
              cursor: 'pointer',
              transition: theme.transitions.create('all'),
              ...(currentTab === tab.value && {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                // border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              }),
            }}
            onClick={(e) => handleTabChange(e, tab.value)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* <Iconify
                icon={tab.icon}
                width={24}
                sx={{
                  color: currentTab === tab.value ? 'primary.main' : 'text.secondary',
                }}
              /> */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: currentTab === tab.value ? 600 : 500,
                  color: currentTab === tab.value ? 'primary.main' : 'text.primary',
                  fontSize: '14px',
                }}
              >
                {t(tab.labelKey)}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Card>
  );

  const renderAccountTab = (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {t('SETTINGS.ACCOUNT')}
      </Typography>

      {isLoadingAccount && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loading account data...
          </Typography>
        </Box>
      )}

      {accountError && !isLoadingAccount && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'error.main' }}>
            Failed to load account data. Please try again.
          </Typography>
        </Box>
      )}

      {!isLoadingAccount && !accountError && (
        <Stack spacing={4}>
          {/* Your Photo Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              {t('SETTINGS.YOUR_PHOTO')}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                src={
                  profileImage ||
                  'https://t4.ftcdn.net/jpg/03/59/58/91/360_F_359589186_JDLl8dIWoBNf1iqEkHxhUeeOulx0wOC5.jpg'
                }
                onClick={!isUploadingImage ? handleImageClick : undefined}
                sx={{
                  width: 80,
                  height: 80,
                  border: `2px solid ${theme.palette.divider}`,
                  bgcolor: profileImage ? 'transparent' : 'primary.main',
                  fontSize: '2rem',
                  cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                  opacity: isUploadingImage ? 0.7 : 1,
                  '&:hover': {
                    opacity: isUploadingImage ? 0.7 : 0.8,
                    transform: isUploadingImage ? 'none' : 'scale(1.05)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                {isUploadingImage && (
                  <Iconify icon="eos-icons:loading" width={40} sx={{ color: 'primary.main' }} />
                )}
                {!isUploadingImage && !profileImage && (
                  <Iconify icon="solar:user-bold-duotone" width={40} />
                )}
              </Avatar>
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  onClick={handleImageClick}
                  disabled={isUploadingImage}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '&:disabled': {
                      borderColor: 'text.disabled',
                      color: 'text.disabled',
                    },
                  }}
                >
                  {isUploadingImage ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="eos-icons:loading" width={16} />
                      <span>Uploading...</span>
                    </Stack>
                  ) : (
                    t('SETTINGS.UPLOAD_IMAGE')
                  )}
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('SETTINGS.PHOTO_REQUIREMENTS')}
                </Typography>
              </Stack>
            </Stack>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploadingImage}
              style={{ display: 'none' }}
            />
          </Box>

          {/* Personal Information Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              {t('SETTINGS.PERSONAL_INFORMATION')}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
              }}
            >
              <TextField
                label={t('SETTINGS.FIRST_NAME')}
                value={localAccountData.firstName}
                onChange={(e) => handleAccountChange('firstName', e.target.value)}
                fullWidth
                size="small"
                disabled={isLoadingAccount || isSavingAccount}
              />
              <TextField
                label={t('SETTINGS.LAST_NAME')}
                value={localAccountData.lastName}
                onChange={(e) => handleAccountChange('lastName', e.target.value)}
                fullWidth
                size="small"
                disabled={isLoadingAccount || isSavingAccount}
              />
              <TextField
                label={t('SETTINGS.PHONE_NUMBER')}
                value={localAccountData.phoneNumber}
                onChange={(e) => handleAccountChange('phoneNumber', e.target.value)}
                fullWidth
                size="small"
                disabled={isLoadingAccount || isSavingAccount}
              />
              <TextField
                label={t('SETTINGS.EMAIL_ADDRESS')}
                value={localAccountData.email}
                onChange={(e) => handleAccountChange('email', e.target.value)}
                fullWidth
                size="small"
                type="email"
                disabled={isLoadingAccount || isSavingAccount}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('SETTINGS.DATE_OF_BIRTH')}
                  value={localAccountData.dateOfBirth}
                  onChange={(newValue) => handleAccountChange('dateOfBirth', newValue)}
                  disabled={isLoadingAccount || isSavingAccount}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          {/* Delete Account Section */}
          <Card
            sx={{
              p: 3,
              bgcolor: 'grey.50',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#D92C20' }}>
              {t('SETTINGS.DELETE_ACCOUNT')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              {t('SETTINGS.DELETE_ACCOUNT_DESCRIPTION')}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="error"
                onClick={confirmDelete.onTrue}
                sx={{
                  bgcolor: '#D92C20',
                }}
              >
                {t('SETTINGS.DELETE_ACCOUNT')}
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                {t('SETTINGS.LEARN_MORE')}
              </Button>
            </Stack>
          </Card>
        </Stack>
      )}
    </Card>
  );

  const renderNotificationsTab = (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {t('SETTINGS.NOTIFICATIONS')}
      </Typography>

      {isLoadingNotifications ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loading notification settings...
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {[
            {
              key: 'NewsAndUpdates' as keyof typeof notificationSettings,
              titleKey: 'SETTINGS.NEWS_UPDATES',
              descriptionKey: 'SETTINGS.NEWS_UPDATES_DESCRIPTION',
            },
            {
              key: 'OffersAndPromotions' as keyof typeof notificationSettings,
              titleKey: 'SETTINGS.OFFERS_PROMOTIONS',
              descriptionKey: 'SETTINGS.OFFERS_PROMOTIONS_DESCRIPTION',
            },
            {
              key: 'AllRemindersAndActivity' as keyof typeof notificationSettings,
              titleKey: 'SETTINGS.ALL_REMINDERS',
              descriptionKey: 'SETTINGS.ALL_REMINDERS_DESCRIPTION',
            },
            {
              key: 'ActiveOnly' as keyof typeof notificationSettings,
              titleKey: 'SETTINGS.ACTIVE_ONLY',
              descriptionKey: 'SETTINGS.ACTIVE_ONLY_DESCRIPTION',
            },
            {
              key: 'ImportantRemindersOnly' as keyof typeof notificationSettings,
              titleKey: 'SETTINGS.IMPORTANT_REMINDERS',
              descriptionKey: 'SETTINGS.IMPORTANT_REMINDERS_DESCRIPTION',
            },
          ].map((item, index) => (
            <Box key={item.key}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 2 }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    {t(item.titleKey)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t(item.descriptionKey)}
                  </Typography>
                </Box>
                <Switch
                  checked={notificationSettings[item.key]}
                  onChange={() => handleNotificationSettingChange(item.key)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              </Stack>
              {index < 4 && <Divider />}
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'account':
        return renderAccountTab;
      // case 'language':
      //   return renderLanguageTab;
      case 'notifications':
        return renderNotificationsTab;
      default:
        return renderAccountTab;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <SharedHeader
        header={t('SETTINGS.TITLE') || 'Settings'}
        subheader={t('SETTINGS.SUBHEADER')}
        buttonText={
          isSavingNotifications || isSavingAccount
            ? t('MESSAGE.SAVING') || 'Saving...'
            : t('SETTINGS.SAVE') || 'Save'
        }
        seconButtonText={t('SETTINGS.CANCEL') || 'Cancel'}
        onButtonClick={handleSave}
        onSecondButtonClick={handleCancel}
        buttonDisabled={
          isSavingNotifications ||
          isSavingAccount ||
          (currentTab === 'notifications' ? !hasSettingsChanges : !hasChanges)
        }
      />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        <Box sx={{ width: 320, flexShrink: 0 }}>{renderTabs}</Box>

        <Box sx={{ flex: 1 }}>{renderContent()}</Box>
      </Box>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('SETTINGS.DELETE_ACCOUNT') || 'Delete Account'}
        content={
          t('SETTINGS.DELETE_ACCOUNT_DESCRIPTION') ||
          'When you delete your account, you lose access to Front account services, and we permanently delete your personal data.'
        }
        icon={
          <Iconify
            icon="solar:trash-bin-trash-bold-duotone"
            width={84}
            height={84}
            sx={{ color: '#D92C20' }}
          />
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            sx={{
              width: { xs: '100%', lg: 175 },
              height: 56,
              borderRadius: 2,
              padding: '8px 16px',
              bgcolor: '#D92C20',
              '&:hover': {
                bgcolor: '#DF1C60',
              },
            }}
          >
            {isDeleting ? t('COMMON.DELETING') : t('COMMON.DELETE')}
          </Button>
        }
      />
    </Box>
  );
}
