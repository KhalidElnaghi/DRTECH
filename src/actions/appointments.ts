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
    throw new Error(error);
  }
};

export const newAppointment = async (reqBody: any): Promise<any> => {
  try {
    const res = await axiosInstance.post(endpoints.appointments.new, reqBody, {});
    console.log('Appointment creation response:', res);
    revalidatePath('/dashboard/appointments');
    return res.status;
  } catch (error) {
    console.log(error);

    return {
      error: error.error.message,
      success: false,
    };
  }
};
