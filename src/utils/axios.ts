import Cookies from 'js-cookie';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { HOST_API, LANGUAGE } from 'src/config-global';

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
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    // Remove static Authorization header
  },
});

// Add request interceptor to dynamically set Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from cookies first, then from sessionStorage
    let token = Cookies.get('access_token');

    // If not in cookies, try sessionStorage (for remember me = false)
    if (!token && typeof window !== 'undefined') {
      try {
        const sessionToken = window.sessionStorage.getItem('access_token');
        if (sessionToken) {
          token = JSON.parse(sessionToken);
        }
      } catch (error) {
        console.error('Error getting token from sessionStorage:', error);
      }
    }

    const lang = Cookies.get('Language');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Accept-Language'] = lang;
    }
    return config;
  },
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
      // Authorization header is now handled by the request interceptor
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
  dashboard: {
    summary: '/dashboard/summary',
    upcomingAppointments: '/dashboard/upcoming-appointments',
    patientsStatistics: '/dashboard/patients-statistics',
    patients: '/dashboard/patients',
  },
  auth: {
    me: '/auth/me',
    login: '/auth/login',
    register: '/auth/register',
    forgot: `/auth/send-password-reset-otp`,
    verify: `/auth/verify-otp-and-reset-password`,
    requestResetPassword: '/auth/request-reset-password',
    verifyResetOtp: '/auth/verify-reset-otp',
    resetPassword: '/auth/reset-password',
  },
  appointments: {
    fetch: '/appointments',
    new: '/appointments/create',
    edit: (appointmentId: number) => `/appointments/${appointmentId}`,
    deleteAppointment: (appointmentId: number) => `/appointments/${appointmentId}`,
    cancel: (appointmentId: number) => `/appointments/${appointmentId}/cancel`,
    reschedule: (appointmentId: number) => `/appointments/${appointmentId}/reschedule`,
  },
  users: {
    fetch: '/users',
    new: '/users/create',
    edit: (userId: string | number) => `/users/${userId}`,
    delete: (userId: string | number) => `/users/remove-user/${userId}`,
    updateRole: '/users/update-user-role',
    changeAccountStatus: '/users/change-account-status',
  },
  rooms: {
    fetch: '/rooms',
    new: '/rooms/create',
    edit: (roomId: string) => `/rooms/${roomId}`,
    delete: (roomId: string) => `/rooms/${roomId}`,
    disable: (roomId: string) => `/rooms/${roomId}/disable`,
    archive: (roomId: string) => `/rooms/${roomId}/archive`,
  },
  doctors: {
    fetch: '/doctors',
    new: '/doctors/create',
    edit: (doctorId: string) => `/doctors/${doctorId}`,
    delete: (doctorId: string) => `/doctors/${doctorId}`,
    specializations: '/doctors/dropdown-specializations',
    dropdown: '/doctors/dropdown',
  },
  patients: {
    fetch: '/patients',
    new: '/patients/create',
    edit: (patientId: string) => `/patients/${patientId}`,
    delete: (patientId: string) => `/patients/${patientId}`,
    archive: (patientId: string) => `/patients/${patientId}/archive`,
    dropdown: '/patients/dropdown',
  },
  inpatients: {
    fetch: '/inpatients',
    new: '/inpatients/create',
    edit: (inpatientId: number) => `/inpatients/${inpatientId}`,
    delete: (inpatientId: number) => `/inpatients/${inpatientId}`,
  },
  lookups: {
    fetch: (type: string) => `/lookups/${type}`,
  },
  payments: {
    fetch: '/payments',
    new: '/payments/create',
    edit: (paymentId: number) => `/payments/${paymentId}`,
    delete: (paymentId: number) => `/payments/${paymentId}`,
  },
  notifications: {
    fetch: '/notification',
  },
  settings: {
    deleteAccount: '/settings/account',
    pushNotifications: '/settings/push-notifications',
  },
};
