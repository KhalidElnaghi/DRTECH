'use client';

import { m } from 'framer-motion';
import { useRef, useState } from 'react';
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
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { deleteAccountClient } from 'src/api/settings';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';

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

export default function SettingsView() {
  const theme = useTheme();
  const { t } = useTranslate();
  const router = useRouter();
  const { logout } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentTab, setCurrentTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    NewsAndUpdates: true,
    OffersAndPromotions: false,
    AllRemindersAndActivity: true,
    ActiveOnly: false,
    ImportantRemindersOnly: true,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [accountData, setAccountData] = useState({
    firstName: 'Leen',
    lastName: 'Al Mutairi',
    phoneNumber: '+966 50 123 4567',
    email: 'leen.mutairi@example.com',
    dateOfBirth: new Date('1999-12-20'),
    password: '••••••••••',
  });

  // Delete account state
  const confirmDelete = useBoolean(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
    setHasChanges(true);
  };

  const handleAccountChange = (field: keyof typeof accountData, value: any) => {
    setAccountData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (1MB max)
      if (file.size > 1024 * 1024) {
        alert('File size must be less than 1MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    // Here you would typically save the settings to your backend
    console.log('Saving settings:', { notificationSettings, accountData });
    setHasChanges(false);
    // You could also show a success message here
  };

  const handleCancel = () => {
    // Reset to original values
    setNotificationSettings({
      NewsAndUpdates: true,
      OffersAndPromotions: false,
      AllRemindersAndActivity: true,
      ActiveOnly: false,
      ImportantRemindersOnly: true,
    });
    setAccountData({
      firstName: 'Leen',
      lastName: 'Al Mutairi',
      phoneNumber: '+966 50 123 4567',
      email: 'leen.mutairi@example.com',
      dateOfBirth: new Date('1999-12-20'),
      password: '1111111111',
    });
    setProfileImage(null);
    setHasChanges(false);
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
              onClick={handleImageClick}
              sx={{
                width: 80,
                height: 80,
                border: `2px solid ${theme.palette.divider}`,
                bgcolor: profileImage ? 'transparent' : 'primary.main',
                fontSize: '2rem',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              {!profileImage && <Iconify icon="solar:user-bold-duotone" width={40} />}
            </Avatar>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                onClick={handleImageClick}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                {t('SETTINGS.UPLOAD_IMAGE')}
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
              value={accountData.firstName}
              onChange={(e) => handleAccountChange('firstName', e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label={t('SETTINGS.LAST_NAME')}
              value={accountData.lastName}
              onChange={(e) => handleAccountChange('lastName', e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label={t('SETTINGS.PHONE_NUMBER')}
              value={accountData.phoneNumber}
              onChange={(e) => handleAccountChange('phoneNumber', e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label={t('SETTINGS.EMAIL_ADDRESS')}
              value={accountData.email}
              onChange={(e) => handleAccountChange('email', e.target.value)}
              fullWidth
              size="small"
              type="email"
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t('SETTINGS.DATE_OF_BIRTH')}
                value={accountData.dateOfBirth}
                onChange={(newValue) => handleAccountChange('dateOfBirth', newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
            <TextField
              label={t('SETTINGS.PASSWORD')}
              value={accountData.password}
              onChange={(e) => handleAccountChange('password', e.target.value)}
              fullWidth
              size="small"
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <Iconify
                        icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                        width={20}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
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
    </Card>
  );

  // const renderLanguageTab = (
  //   <Card sx={{ p: 3 }}>
  //     <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
  //       {t('SETTINGS.LANGUAGE')}
  //     </Typography>
  //     <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
  //       {t('SETTINGS.LANGUAGE_DESCRIPTION')}
  //     </Typography>

  //     <Stack spacing={2}>
  //       <Box>
  //         <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
  //           {t('SETTINGS.LANGUAGE_DIRECTION')}:{' '}
  //           {settings.themeDirection === 'rtl'
  //             ? t('SETTINGS.LANGUAGE_DIRECTION_RTL')
  //             : t('SETTINGS.LANGUAGE_DIRECTION_LTR')}
  //         </Typography>
  //         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
  //           {t('SETTINGS.LANGUAGE_DIRECTION_DESCRIPTION')}
  //         </Typography>
  //       </Box>
  //     </Stack>
  //   </Card>
  // );

  const renderNotificationsTab = (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {t('SETTINGS.NOTIFICATIONS')}
      </Typography>

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
                onChange={() => handleNotificationChange(item.key)}
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
        subheader="Customize until match to your workflows"
        buttonText={t('SETTINGS.SAVE') || 'Save'}
        seconButtonText={t('SETTINGS.CANCEL') || 'Cancel'}
        onButtonClick={handleSave}
        onSecondButtonClick={handleCancel}
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
