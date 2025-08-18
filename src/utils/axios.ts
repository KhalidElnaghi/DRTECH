import { getCookie } from 'cookies-next';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

import { ACCESS_TOKEN } from '../auth/constants';

export interface Params {
  page: number;
  limit: number;
  status?: string;
  filters?: string;
  created_at?: string;
  headers?: { access_token: string };
}
const axiosInstance: AxiosInstance = axios.create({
  baseURL: HOST_API,

  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'en',
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    Authorization: `Bearer ${getCookie(ACCESS_TOKEN)}`,
  },
});
axiosInstance.interceptors.request.use(
  (config) =>
    /*     config.headers['Accept-Language'] = lang;
     */ config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

export const baseUrl = HOST_API;

export const fetcher = async ({ url, config }: { url: string; config?: AxiosRequestConfig }) => {
  // Use axiosInstance directly instead of creating a new instance
  const response = await axiosInstance.get(url, {
    ...config,
    headers: {
      Authorization: `Bearer ${getCookie(ACCESS_TOKEN)}`,
      /*       'Accept-Language': lang,
       */
    },
  });

  return response.data;
};
export const getErrorMessage = (error: unknown): string => {
  let message: string;
  if (error instanceof Error) {
    // eslint-disable-next-line prefer-destructuring
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong';
  }
  return message;
};

export const endpoints = {
  auth: {
    me: '/auth/me',
    login: '/auth/login',
    register: '/auth/register',
    forgot: `/auth/send-password-reset-otp`,
    verify: `/auth/verify-otp-and-reset-password`,
  },
  appointments: {
    fetch: '/appointments',
    new: '/appointments/create',
  },
  doctors: {
    fetch: '/doctors',
  },
  patients: {
    fetch: '/patients',
  },
  lookups: {
    fetch: (type: string) => `/lookups/${type}`,
  },
};
