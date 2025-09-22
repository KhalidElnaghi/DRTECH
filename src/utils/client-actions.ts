'use client';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';
import { getAuthHeaders } from 'src/utils/auth-storage';
import { ICreateDoctor, IUpdateDoctor } from 'src/types/doctors';

/**
 * Client-side API functions that use the appropriate storage method
 * These functions can be used in client components when you need to make API calls
 * They will automatically get the token from cookies or sessionStorage
 */

interface IParams {
  page?: number;
  SearchTerm?: string;
  Status?: number;
  SpecializationId?: number;
}

// Doctors API functions
export const fetchDoctorsClient = async ({
  page = 1,
  SearchTerm = '',
  Status = 0,
  SpecializationId = 0,
}: IParams): Promise<any> => {
  try {
    const headers = getAuthHeaders();
    const res = await axiosInstance.get(endpoints.doctors.fetch, {
      params: {
        page,
        limit: 10,
        SearchTerm,
        Status,
        SpecializationId,
      },
      headers,
    });
    return res?.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createDoctorClient = async (reqBody: ICreateDoctor): Promise<any> => {
  try {
    const headers = getAuthHeaders();
    const res = await axiosInstance.post(endpoints.doctors.new, reqBody, {
      headers,
    });
    return { success: true, data: res.data };
  } catch (error: any) {
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

export const updateDoctorClient = async (reqBody: IUpdateDoctor, id: string): Promise<any> => {
  try {
    const headers = getAuthHeaders();
    const res = await axiosInstance.put(endpoints.doctors.edit(id), reqBody, {
      headers,
    });
    return { success: true, data: res.data };
  } catch (error: any) {
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

export const deleteDoctorClient = async (id: string): Promise<any> => {
  try {
    const headers = getAuthHeaders();
    const res = await axiosInstance.delete(endpoints.doctors.delete(id), {
      headers,
    });
    return { success: true, data: res.data };
  } catch (error: any) {
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
