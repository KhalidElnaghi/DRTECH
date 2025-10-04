import axiosInstance, { endpoints } from 'src/utils/axios';

import {
  NotificationSettingsResponse,
  UpdateNotificationSettingsRequest,
} from 'src/types/settings';

// ----------------------------------------------------------------------

export const deleteAccountClient = async (): Promise<any> => {
  const response = await axiosInstance.delete(endpoints.settings.deleteAccount);
  return response.data;
};

export const getNotificationSettings = async (): Promise<NotificationSettingsResponse> => {
  const response = await axiosInstance.get(endpoints.settings.pushNotifications);
  return response.data;
};

export const updateNotificationSettings = async (
  data: UpdateNotificationSettingsRequest
): Promise<NotificationSettingsResponse> => {
  const response = await axiosInstance.put(endpoints.settings.pushNotifications, data);
  return response.data;
};
