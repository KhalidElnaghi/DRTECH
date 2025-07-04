'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import axiosInstance, { endpoints, getErrorMessage } from 'src/utils/axios';

export const editPhoneNumber = async (data: any): Promise<any> => {
  try {
    const accessToken = cookies().get('access_token')?.value;
    const res = await axiosInstance.put(
      endpoints.profile.changePhone,data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    revalidatePath(`/dashboard/change-phone`);
    return res.data;
  } catch (error) {
    return {
      error: getErrorMessage(error),
    };
  }
};
