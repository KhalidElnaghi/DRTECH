'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';
import { StaticPageReqBody } from 'src/types/static-pages';

export const fetchStaticPage = async (type: string): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  try {
    const res = await axiosInstance.get(endpoints.staticPage.fetch(type), {
      params: { static_page_type: type },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data?.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const editStaticPage = async (data: FormData): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;
  try {
  const res=   await axiosInstance.patch(endpoints.staticPage.edit, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    throw new Error(error);
  }
};
