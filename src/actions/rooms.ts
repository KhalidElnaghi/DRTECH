'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  RoomNumber?: string;
  Floor?: string;
  Type?: number;
  Status?: number;
}

export const fetchRooms = async ({
  page = 1,
  RoomNumber = '',
  Floor = '',
  Type = 0,
  Status = 0,
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.rooms.fetch, {
      params: {
        page,
        limit: 10,
        RoomNumber,
        Floor,
        Type,
        Status,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    // throw new Error(error);
  }
};

export const newRoom = async (reqBody: any): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.post(endpoints.rooms.new, reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return { success: true };
  } catch (error: any) {
    // Handle the nested error structure from the API
    if (error && typeof error === 'object') {
      if (error.error && error.error.message) {
        return {
          error: error.error.message,
          success: false,
        };
      }
      if (error.message) {
        return {
          error: error.message,
          success: false,
        };
      }
    }

    return {
      error: getErrorMessage(error),
      success: false,
    };
  }
};

export const editRoom = async (reqBody: any, id: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.put(endpoints.rooms.edit(id), reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return { success: true };
  } catch (error: any) {
    // Handle the nested error structure from the API
    if (error && typeof error === 'object') {
      if (error.error && error.error.message) {
        return {
          error: error.error.message,
          success: false,
        };
      }
      if (error.message) {
        return {
          error: error.message,
          success: false,
        };
      }
    }

    return {
      error: getErrorMessage(error),
      success: false,
    };
  }
};

export const deleteRoom = async (id: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.delete(endpoints.rooms.delete(id), {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return { success: true };
  } catch (error: any) {
    return {
      error: getErrorMessage(error),
      success: false,
    };
  }
};

export const disableRoom = async (id: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.patch(
      endpoints.rooms.disable(id),
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
      }
    );
    return { success: true };
  } catch (error: any) {
    return {
      error: getErrorMessage(error),
      success: false,
    };
  }
};

export const archiveRoom = async (id: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.patch(
      endpoints.rooms.archive(id),
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
      }
    );
    return { success: true };
  } catch (error: any) {
    return {
      error: getErrorMessage(error),
      success: false,
    };
  }
};
