import axiosInstance, { endpoints } from 'src/utils/axios';
import type { InpatientParams, InpatientData } from 'src/types/inpatient';

// Re-export types for use in hooks
export type { InpatientParams, InpatientData };

export const fetchInpatientsClient = async (params: InpatientParams) => {
  const response = await axiosInstance.get(endpoints.inpatients.fetch, {
    params: {
      page: params.page,
      limit: 10,
    },
  });
  return response.data;
};

export const newInpatientClient = async (data: InpatientData) => {
  const response = await axiosInstance.post(endpoints.inpatients.new, data);

  return response.data;
};

export const editInpatientClient = async (data: InpatientData, inpatientId: number) => {
  const response = await axiosInstance.put(endpoints.inpatients.edit(inpatientId), data);

  // Check if the API response indicates failure
  if (response.data && response.data.IsSuccess === false) {
    throw new Error(response.data.Error?.Message || 'Operation failed');
  }

  return response.data;
};

export const deleteInpatientClient = async (inpatientId: number) => {
  const response = await axiosInstance.delete(endpoints.inpatients.delete(inpatientId));
  return response.data;
};
