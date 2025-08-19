import axiosInstance, { endpoints } from 'src/utils/axios';
import type { RoomParams, RoomData } from 'src/types/room';

// Re-export types for use in hooks
export type { RoomParams, RoomData };

export const fetchRoomsClient = async (params: RoomParams) => {
  console.log(params.SearchTerm);

  const response = await axiosInstance.get(endpoints.rooms.fetch, {
    params: {
      page: params.page,
      limit: 10,
      SearchTerm: params.SearchTerm || '',
      Status: params.Status || '',
    },
  });
  return response.data;
};

export const newRoomClient = async (data: RoomData) => {
  const response = await axiosInstance.post(endpoints.rooms.new, data);
  console.log(data);

  console.log('response', response);
  return response.data;
};

export const editRoomClient = async (data: RoomData, roomId: string) => {
  const response = await axiosInstance.put(endpoints.rooms.edit(roomId), data);
  return response.data;
};

export const deleteRoomClient = async (roomId: string) => {
  const response = await axiosInstance.delete(endpoints.rooms.delete(roomId));
  return response.data;
};

export const disableRoomClient = async (roomId: string) => {
  const response = await axiosInstance.patch(endpoints.rooms.disable(roomId));
  return response.data;
};

export const archiveRoomClient = async (roomId: string) => {
  const response = await axiosInstance.patch(endpoints.rooms.archive(roomId));
  return response.data;
};
