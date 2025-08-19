import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  newRoomClient,
  type RoomData,
  editRoomClient,
  type RoomParams,
  fetchRoomsClient,
  deleteRoomClient,
  disableRoomClient,
  archiveRoomClient,
} from 'src/api/rooms';

// Query keys for caching
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (params: RoomParams) => [...roomKeys.lists(), params] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
};

export const useRooms = (params: RoomParams) =>
  useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => fetchRoomsClient(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRoomClient,
    onMutate: async (roomId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: roomKeys.lists() });

      // Snapshot the previous value
      const previousRooms = queryClient.getQueriesData({
        queryKey: roomKeys.lists(),
      });

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: roomKeys.lists() }, (old: any) => {
        if (!old || !old.data || !old.data.items) return old;

        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((room: any) => room.id !== roomId),
            totalCount: Math.max(0, (old.data.totalCount || 0) - 1),
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousRooms };
    },
    onError: (err, roomId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRooms) {
        context.previousRooms.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
};

export const useEditRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reqBody, id }: { reqBody: RoomData; id: string }) => editRoomClient(reqBody, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
};

export const useNewRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newRoomClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
};

export const useDisableRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableRoomClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
};

export const useArchiveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveRoomClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
};
