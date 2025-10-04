import axiosInstance, { endpoints } from 'src/utils/axios';

import {
  AccountDataResponse,
  UpdateAccountDataRequest,
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

export const getAccountData = async (): Promise<AccountDataResponse> => {
  const response = await axiosInstance.get(endpoints.settings.account);
  return response.data;
};

export const uploadPhoto = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await axiosInstance.post(endpoints.settings.uploadPhoto, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateAccountData = async (
  data: UpdateAccountDataRequest
): Promise<AccountDataResponse> => {
  const response = await axiosInstance.put(endpoints.settings.account, data);
  return response.data;
};
