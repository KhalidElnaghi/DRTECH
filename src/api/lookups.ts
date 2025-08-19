import axiosInstance, { endpoints } from 'src/utils/axios';

export const fetchLookupsClient = async (type: string) => {
  const response = await axiosInstance.get(endpoints.lookups.fetch(type));
  return response.data;
};
