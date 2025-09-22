import { paths } from 'src/app/auth/paths';

// ----------------------------------------------------------------------

export const HOST_API = process.env.NEXT_PUBLIC_HOST_API;
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;
export const LANGUAGE = process.env.NEXT_PUBLIC_LANGUAGE;
// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'

export const COOKIES_KEYS = {
  access_token: 'access_token',
  lang: 'lang',
};
