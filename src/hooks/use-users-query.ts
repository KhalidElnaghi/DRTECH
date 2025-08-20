import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  fetchUsersClient,
  createUserClient,
  updateUserClient,
  deleteUserClient,
  type UserFilters,
  updateUserRoleClient,
} from 'src/api/users';

import { CreateUserData, UpdateUserData } from 'src/types/users';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...userKeys.details(), id] as const,
};

export const useUsers = (filters: UserFilters) =>
  useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsersClient(filters),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserData) => createUserClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: UpdateUserData }) =>
      updateUserClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteUserClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { UserId: string | number; UserNewRole: number }) =>
      updateUserRoleClient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
