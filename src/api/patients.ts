import axiosInstance, { endpoints } from 'src/utils/axios';

export const fetchPatientsClient = async () => {
  const response = await axiosInstance.get(endpoints.patients.fetch);
  return response.data;
};
