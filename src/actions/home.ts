'use server';

/* eslint-disable consistent-return */

import { cookies } from 'next/headers';
import { getCookie } from 'cookies-next';

import axiosInstance, { endpoints } from 'src/utils/axios';

export const fetchPriceProfit = async (): Promise<any> => {
  const accessToken = getCookie('access_token', { cookies });
  const lang = getCookie('Language', { cookies });

  try {
    const res = await axiosInstance.get(endpoints.home.priceProfit, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    console.log(error);
    // throw new Error(error);
  }
};

interface IParams {
  page?: number;
  limit?: number;
  notifications_page?: number;
  notifications_limit?: number;
  notification_type?: string | null;
  select_date?: string | null;
}
export const fetchTopCourses = async ({ page = 1, limit = 50 }: IParams): Promise<any> => {
  const accessToken = getCookie('access_token', { cookies });
  const lang = getCookie('Language', { cookies });

  try {
    const res = await axiosInstance.get(endpoints.home.topCourses, {
      params: {
        page,
        limit,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const fetchStatistics = async (): Promise<any> => {
  const accessToken = cookies().get('access_token')?.value;

  try {
    const res = await axiosInstance.get(endpoints.home.statistics, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchNotifications = async ({
  notifications_page = 1,
  notifications_limit = 50,
  notification_type = null,
  select_date = null,
}: IParams): Promise<any> => {
  const accessToken = getCookie('access_token', { cookies });
  const lang = getCookie('Language', { cookies });

  try {
    const res = await axiosInstance.get(endpoints.home.notifications, {
      params: {
        page: notifications_page,
        limit: notifications_limit,
        notification_type,
        select_date,
      },
      headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': lang },
    });
    return res?.data;
  } catch (error) {
    throw new Error(error);
  }
};
