import { useQuery } from '@tanstack/react-query';
import { fetchNotificationsClient } from 'src/api/notifications';
import { INotificationParams } from 'src/types/notification';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: INotificationParams) => [...notificationKeys.lists(), filters] as const,
};

export const useNotifications = (filters: INotificationParams = {}) =>
  useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => fetchNotificationsClient(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - notifications should be fresh
  });
