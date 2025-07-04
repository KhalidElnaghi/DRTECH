'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

interface IParams {
  page: number;
  limit: number;
  filters?: string;
  city_id?: string;
  neighborhood_id?: string;

  sort?: 'order_by' | 'new';
}

export async function sendMessage(reqBody: any): Promise<any> {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;
  try {
    const res = await axiosInstance.post(`${endpoints.notifications.send}`, reqBody, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },

    });
    return res?.status;
  } catch (error) {
    throw new Error(error);
  }
}
