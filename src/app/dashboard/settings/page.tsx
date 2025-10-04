'use client';

import { useNotificationsManagement } from 'src/hooks/use-notifications-management';

import SettingsView from 'src/sections/settings';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  // Enhanced notifications management logic
  const notificationsLogic = useNotificationsManagement({
    notificationParams: { page: 1, limit: 10 },
    autoFetchSettings: true,
  });

  return <SettingsView notificationsLogic={notificationsLogic} />;
}
