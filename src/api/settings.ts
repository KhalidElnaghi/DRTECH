import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export const deleteAccountClient = async (): Promise<any> => {
  const response = await axiosInstance.delete(endpoints.settings.deleteAccount);
  return response.data;
};
