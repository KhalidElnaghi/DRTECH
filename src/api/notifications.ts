import axiosInstance, { endpoints } from 'src/utils/axios';
import { INotificationResponse, INotificationParams } from 'src/types/notification';

export const fetchNotificationsClient = async (params: INotificationParams = {}) => {
  const response = await axiosInstance.get(endpoints.notifications.fetch, {
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
    },
  });
  return response.data as INotificationResponse;
};
