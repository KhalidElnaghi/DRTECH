'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page?: number;
}
export const fetchDoctors = async ({ page = 1 }: IParams): Promise<any> => {
  try {
    const res = await axiosInstance.get(endpoints.doctors.fetch, {
      params: {
        page: 1,
        limit: 100,
      },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};
