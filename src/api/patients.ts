import axiosInstance, { endpoints } from 'src/utils/axios';
import { IPatient, PatientData, PatientParams } from 'src/types/patient';

export const fetchPatients = async (params: PatientParams) => {
  const response = await axiosInstance.get(endpoints.patients.fetch, {
    params: {
      page: params.page,
      limit: 10,
      ...(params.SearchTerm && { SearchTerm: params.SearchTerm }),
      ...(params.Gender && { Gender: params.Gender }),
      ...(params.BloodType && { BloodType: params.BloodType }),
    },
  });
  return response.data;
};

export const createPatient = async (data: PatientData) => {
  const response = await axiosInstance.post(endpoints.patients.new, data);
  return response.data;
};

export const updatePatient = async (id: string, data: PatientData) => {
  const response = await axiosInstance.put(endpoints.patients.edit(id), data);
  return response.data;
};

export const deletePatient = async (id: string) => {
  const response = await axiosInstance.delete(endpoints.patients.delete(id));
  return response.data;
};

export const archivePatient = async (id: string) => {
  const response = await axiosInstance.patch(endpoints.patients.archive(id));
  return response.data;
};

export const fetchPatientsDropdownClient = async () => {
  const response = await axiosInstance.get(endpoints.patients.dropdown);
  return response.data;
};
