import { enqueueSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import { useTranslate } from 'src/locales';
import { getNotificationSettings, updateNotificationSettings } from 'src/api/settings';

import { NotificationSettings } from 'src/types/settings';
import { INotificationParams } from 'src/types/notification';

import { useNotifications } from './use-notifications-query';

// ----------------------------------------------------------------------

export interface UseNotificationsManagementProps {
  notificationParams?: INotificationParams;
  autoFetchSettings?: boolean;
}

export interface UseNotificationsManagementReturn {
  // Notifications data
  notifications: any[];
  notificationsLoading: boolean;
  notificationsError: any;
  refetchNotifications: () => void;

  // Notification settings
  notificationSettings: NotificationSettings;
  originalNotificationSettings: NotificationSettings;
  isLoadingSettings: boolean;
  isSavingSettings: boolean;
  hasSettingsChanges: boolean;

  // Actions
  handleNotificationSettingChange: (setting: keyof NotificationSettings) => void;
  handleSaveSettings: () => Promise<void>;
  handleCancelSettings: () => void;
  refreshSettings: () => Promise<void>;
}

// ----------------------------------------------------------------------

export const useNotificationsManagement = ({
  notificationParams = {},
  autoFetchSettings = true,
}: UseNotificationsManagementProps = {}): UseNotificationsManagementReturn => {
  const queryClient = useQueryClient();
  const { t } = useTranslate();

  // Notifications data
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useNotifications(notificationParams);

  const notifications = notificationsData?.Data || [];

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    NewsAndUpdates: true,
    OffersAndPromotions: false,
    AllRemindersAndActivity: true,
    ActiveOnly: false,
    ImportantRemindersOnly: true,
  });

  const [originalNotificationSettings, setOriginalNotificationSettings] =
    useState<NotificationSettings>({
      NewsAndUpdates: true,
      OffersAndPromotions: false,
      AllRemindersAndActivity: true,
      ActiveOnly: false,
      ImportantRemindersOnly: true,
    });

  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [hasSettingsChanges, setHasSettingsChanges] = useState(false);

  // Fetch notification settings
  const fetchNotificationSettings = useCallback(async () => {
    try {
      setIsLoadingSettings(true);

      const response = await getNotificationSettings();

      if (response.IsSuccess && response.Data) {
        setNotificationSettings(response.Data);
        setOriginalNotificationSettings(response.Data);
        setHasSettingsChanges(false);
      } else {
        console.warn('useNotificationsManagement: API response not successful:', response);
        enqueueSnackbar(response.Error?.Message || t('MESSAGE.FAILED_TO_LOAD_SETTINGS'), {
          variant: 'error',
        });
      }
    } catch (error: any) {
      console.error('useNotificationsManagement: Failed to fetch notification settings:', error);
      enqueueSnackbar(
        error?.Error?.Message || error?.message || t('MESSAGE.FAILED_TO_LOAD_SETTINGS'),
        { variant: 'error' }
      );
    } finally {
      setIsLoadingSettings(false);
    }
  }, [t]);

  // Auto-fetch settings on mount if enabled
  useEffect(() => {
    if (autoFetchSettings) {
      fetchNotificationSettings();
    }
  }, [autoFetchSettings, fetchNotificationSettings]);

  // Handle notification setting change
  const handleNotificationSettingChange = useCallback((setting: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
    setHasSettingsChanges(true);
  }, []);

  // Save notification settings
  const handleSaveSettings = useCallback(async () => {
    try {
      setIsSavingSettings(true);
      const response = await updateNotificationSettings(notificationSettings);

      if (response.IsSuccess) {
        setOriginalNotificationSettings(notificationSettings);
        setHasSettingsChanges(false);
        enqueueSnackbar(t('MESSAGE.NOTIFICATION_SETTINGS_SAVED_SUCCESSFULLY'), {
          variant: 'success',
        });

        // Invalidate notifications query to refresh data
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } else {
        enqueueSnackbar(response.Error?.Message || t('MESSAGE.FAILED_TO_SAVE_SETTINGS'), {
          variant: 'error',
        });
      }
    } catch (error: any) {
      enqueueSnackbar(
        error?.Error?.Message || error?.message || t('MESSAGE.FAILED_TO_SAVE_SETTINGS'),
        { variant: 'error' }
      );
    } finally {
      setIsSavingSettings(false);
    }
  }, [notificationSettings, queryClient, t]);

  // Cancel settings changes
  const handleCancelSettings = useCallback(() => {
    setNotificationSettings(originalNotificationSettings);
    setHasSettingsChanges(false);
  }, [originalNotificationSettings]);

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    await fetchNotificationSettings();
  }, [fetchNotificationSettings]);

  return {
    // Notifications data
    notifications,
    notificationsLoading,
    notificationsError,
    refetchNotifications,

    // Notification settings
    notificationSettings,
    originalNotificationSettings,
    isLoadingSettings,
    isSavingSettings,
    hasSettingsChanges,

    // Actions
    handleNotificationSettingChange,
    handleSaveSettings,
    handleCancelSettings,
    refreshSettings,
  };
};
