'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';
import { ICreateDoctor, IUpdateDoctor } from 'src/types/doctors';

interface IParams {
  page?: number;
  SearchTerm?: string;
  Status?: number;
  SpecializationId?: number;
}

export const fetchDoctors = async ({
  page = 1,
  SearchTerm = '',
  Status = 0,
  SpecializationId = 0,
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.doctors.fetch, {
      params: {
        page,
        limit: 10,
        SearchTerm,
        Status,
        SpecializationId,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    // throw new Error(error);
  }
};

export const createDoctor = async (reqBody: ICreateDoctor): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.post(endpoints.doctors.new, reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    revalidatePath('/dashboard/doctors');
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

export const updateDoctor = async (reqBody: IUpdateDoctor, id: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.put(endpoints.doctors.edit(id), reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    revalidatePath('/dashboard/doctors');
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

export const deleteDoctor = async (id: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.delete(endpoints.doctors.delete(id), {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    revalidatePath('/dashboard/doctors');
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
