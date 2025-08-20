import axiosInstance, { endpoints } from 'src/utils/axios';
import { IDoctor, ICreateDoctor, IUpdateDoctor, ISpecialization } from 'src/types/doctors';

export const fetchDoctorsClient = async (params?: {
  page?: number;
  SearchTerm?: string;
  Status?: number;
  specializationId?: number;
}) => {

  const response = await axiosInstance.get(endpoints.doctors.fetch, {
    params: {
      page: params?.page,
      limit: 10,
      ...(params?.SearchTerm && { SearchTerm: params.SearchTerm }),
      ...(params?.Status && { Status: params.Status }),
      ...(params?.specializationId && { specializationId: params.specializationId }),
    },
  });
  return response.data;
};

export const createDoctorClient = async (data: ICreateDoctor) => {
  const response = await axiosInstance.post(endpoints.doctors.new, data);

  return response.data;
};

export const updateDoctorClient = async (id: string, data: IUpdateDoctor) => {
  const response = await axiosInstance.put(endpoints.doctors.edit(id), data);
  return response.data;
};

export const deleteDoctorClient = async (id: string) => {
  const response = await axiosInstance.delete(endpoints.doctors.delete(id));

  return response.data;
};

export const fetchSpecializationsClient = async () => {
  const response = await axiosInstance.get(endpoints.doctors.specializations);
  return response.data;
};
