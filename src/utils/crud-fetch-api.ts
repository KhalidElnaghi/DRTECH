'use server';

import { cookies } from 'next/headers';

// import { defaultLocale } from 'src/i18n/config-locale';
import { HOST_API, COOKIES_KEYS } from 'src/config-global';

import { ApiResponse, RequestOptions, ApiErrorResponse } from 'src/types/crud-types';

// Base URL for the API
const API_BASE_URL = HOST_API;

function isFormData(value: unknown) {
  return value instanceof FormData;
}
const commonErrorMessages = new Map([
  ['404', 'not_found'],
  ['500', 'internal_server_error'],
  ['503', 'service_not_available'],
]);
const commonErrorStatus = new Set([500, 503, 404]);
// generic function to make API requests
async function apiRequest<TResponse, TBody = undefined>(
  endpoint: string,
  method: string,
  body?: TBody,
  options: RequestOptions = {}
): Promise<ApiResponse<TResponse>> {
  // const t = await getTranslations('Global.Server');
  const url = `${API_BASE_URL}${endpoint}`;
  const cookie = await cookies();

  const token = cookie.get(COOKIES_KEYS.access_token)?.value;
  const lang = cookie.get(COOKIES_KEYS.lang)?.value ;

  const headers = {
    ...(!isFormData(body) && {
      'Content-Type': 'application/json',
    }),
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
    'Accept-Language': "en",
    ...options.headers,
  };

  let reqBody;
  if (body) {
    reqBody = isFormData(body) ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: reqBody,
      cache: options.cache,
      next: { tags: options.tags },
    });

    // UN-AUTHORIZED
    if (response.status === 401) {
      return errorObject("unauthorized", response.status);
    }

    if (commonErrorStatus.has(response.status)) {
      const errMsg = commonErrorMessages.get(response.status.toString());
      return errorObject(errMsg, response.status);
    }

    // IF THE RETURN VALUR IS NOTHING BUT A SUCCESS REQUEST (ex: edit/delete requests);
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {
        success: true,
        data: {} as TResponse, // return an empty object or a default value
        meta: undefined,
        message: 'Success',
        status: response.status,
      };
    }

    const responseData = await response.json();

    // Response check after parsing so i can get the error message
    if (!response.ok) {
      const errMsg = Array.isArray(responseData?.message)
        ? responseData?.message.join(' | ')
        : responseData?.message;
      const resCode = responseData?.code || null;
      const resDetails = responseData?.details || null;
      const resData = responseData?.data || {};
      const resVErrors = responseData?.validationErrors || null;
      return errorObject(errMsg, response.status, resCode, resDetails, resData, resVErrors);
    }

    return {
      success: true,
      data: responseData,
      meta: responseData.meta,
      message: responseData.message || 'Success',
      status: response.status,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "unexpected error";
    return errorObject(errMsg, 500);
  }
}

// CRUD functions
export async function getData<TResponse>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> {
  return apiRequest<TResponse>(endpoint, 'GET', undefined, options);
}

export async function postData<TResponse, TBody>(
  endpoint: string,
  data: TBody,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> {
  return apiRequest<TResponse, TBody>(endpoint, 'POST', data, options);
}

export async function editData<TResponse, TBody>(
  endpoint: string,
  method: 'PUT' | 'PATCH',
  data: TBody,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> {
  return apiRequest<TResponse, TBody>(endpoint, method, data, options);
}

export async function deleteData<TResponse>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<TResponse>> {
  return apiRequest<TResponse>(endpoint, 'DELETE', undefined, options);
}

const errorObject = (
  error: string = '',
  status: string | number = '',
  code: unknown = null,
  details: unknown = null,
  data: unknown = {},
  validationErrors: unknown = null
): ApiErrorResponse => ({
  success: false,
  error,
  status,
  code,
  details,
  data,
  validationErrors,
});
