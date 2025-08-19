import axiosInstance, { endpoints } from 'src/utils/axios';

export const fetchDoctorsClient = async () => {
  const response = await axiosInstance.get(endpoints.doctors.fetch);
  return response.data;
};
