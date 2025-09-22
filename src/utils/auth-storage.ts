'use client';

import Cookie from 'js-cookie';
import { getSessionStorage } from 'src/hooks/use-local-storage';
import { ACCESS_TOKEN, USER_KEY } from 'src/auth/constants';

/**
 * Get access token from either cookies or sessionStorage
 * This function checks both storage locations and returns the first one found
 */
export const getAccessToken = (): string | null => {
  // First try cookies (works for both remember me true/false)
  const cookieToken = Cookie.get(ACCESS_TOKEN);
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to sessionStorage (for remember me = false)
  const sessionToken = getSessionStorage(ACCESS_TOKEN);
  return sessionToken || null;
};

/**
 * Get user data from either cookies or sessionStorage
 * This function checks both storage locations and returns the first one found
 */
export const getUserData = (): any => {
  // First try cookies (works for both remember me true/false)
  const cookieUser = Cookie.get(USER_KEY);
  if (cookieUser) {
    try {
      return JSON.parse(cookieUser);
    } catch {
      return null;
    }
  }

  // Fallback to sessionStorage (for remember me = false)
  const sessionUser = getSessionStorage(USER_KEY);
  return sessionUser || null;
};

/**
 * Get authorization headers for API calls
 * This function returns the appropriate headers with the access token
 */
export const getAuthHeaders = (includeLanguage = true): Record<string, string> => {
  const accessToken = getAccessToken();
  const lang = Cookie.get('Language') || 'en';

  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (includeLanguage) {
    headers['Accept-Language'] = lang;
  }

  return headers;
};
