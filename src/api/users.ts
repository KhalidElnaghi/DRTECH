import axiosInstance, { endpoints } from 'src/utils/axios';

import { CreateUserData, UpdateUserData } from 'src/types/users';

export interface UserFilters {
  page?: number;
  SearchTerm?: string;
}

export const fetchUsersClient = async (filters: UserFilters = {}) => {
  const response = await axiosInstance.get(endpoints.users.fetch, {
    params: {
      page: filters.page,
      limit: 10,
      ...(filters.SearchTerm ? { SearchTerm: filters.SearchTerm } : {}),
    },
  });
  return response.data;
};

export const createUserClient = async (data: CreateUserData) => {
  const response = await axiosInstance.post(endpoints.users.new, data);

  return response.data;
};

export const updateUserClient = async (id: string | number, data: UpdateUserData) => {
  const response = await axiosInstance.put(endpoints.users.edit(id), data);
  return response.data;
};

export const deleteUserClient = async (id: string | number) => {
  const response = await axiosInstance.delete(endpoints.users.delete(id));
  return response.data;
};

export const updateUserRoleClient = async (payload: {
  UserId: string | number;
  UserNewRole: number;
}) => {
  const response = await axiosInstance.post(endpoints.users.updateRole, payload);
  return response.data;
};

export const changeAccountStatusClient = async (payload: {
  UserId: string | number;
  AccountStatus: number;
}) => {
  const response = await axiosInstance.post(endpoints.users.changeAccountStatus, payload);
  return response.data;
};
