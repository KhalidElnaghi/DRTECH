'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  type: string;
}
export const fetchLookups = async (type: string) => {
  try {
    const res = await axiosInstance.get(endpoints.lookups.fetch(type), {
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
