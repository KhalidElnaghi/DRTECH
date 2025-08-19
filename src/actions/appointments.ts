'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  DoctorName?: string;
  AppointmentDate?: string;
  Status?: string;
}
export const fetchAppoinments = async ({
  page = 1,
  DoctorName = '',
  AppointmentDate = '',
  Status = '',
}: IParams): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.appointments.fetch, {
      params: {
        page,
        limit: 10,
        DoctorName,
        AppointmentDate,
        Status,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    console.log('Appointment fetch error:', error);
    // throw new Error(error);
  }
};

export const newAppointment = async (reqBody: any): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  console.log('New appointment request:', reqBody);
  try {
    const res = await axiosInstance.post(endpoints.appointments.new, reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    console.log('Appointment creation response:', res);
    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    console.log('Appointment creation error:', error);

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
export const editAppointment = async (reqBody: any, id: number): Promise<any> => {
  console.log('Edit appointment request:', reqBody, id);
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  console.log('Edit appointment request:', reqBody, id);

  try {
    const res = await axiosInstance.put(endpoints.appointments.edit(id), reqBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': lang,
        'Content-Type': 'application/json',
      },
    });
    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error) {
    console.log('Delete appointment error:', error);

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

export const deleteAppointment = async (appointmentId: number): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.delete(
      endpoints.appointments.deleteAppointment(appointmentId),
      {
        headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
      }
    );
    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    console.log('Delete appointment error:', error);

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
