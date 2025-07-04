// ----------------------------------------------------------------------

import { ro, te } from 'date-fns/locale';

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      forgot: `${ROOTS.AUTH}/jwt/forgot-password`,
      register: `${ROOTS.AUTH}/jwt/register`,
      verify: `${ROOTS.AUTH}/jwt/verify`,
      changePassword: `${ROOTS.AUTH}/jwt/new-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    centers: `${ROOTS.DASHBOARD}/centers`,
    clients: `${ROOTS.DASHBOARD}/clients`,
    courses: `${ROOTS.DASHBOARD}/courses`,
    supportGroup: {
      root: `${ROOTS.DASHBOARD}/support`,
      calls_reasons: `${ROOTS.DASHBOARD}/support/calls-reasons`,
      technical_support: `${ROOTS.DASHBOARD}/support/technical-support`,
    },
    categories: `${ROOTS.DASHBOARD}/categories`,
    coupons: `${ROOTS.DASHBOARD}/coupons`,
    pages: {
      root: `${ROOTS.DASHBOARD}/pages`,
      about: `${ROOTS.DASHBOARD}/pages/about-app`,
      privacyPolicy: `${ROOTS.DASHBOARD}/pages/privacy-policy`,
      termsAndConditions: `${ROOTS.DASHBOARD}/pages/terms-and-conditions`,
      homeScreen: `${ROOTS.DASHBOARD}/pages/home-screen`,
    },
    faq: `${ROOTS.DASHBOARD}/faq`,
    citiesAndNeighborhoods: `${ROOTS.DASHBOARD}/cities-and-neighborhoods`,
    banners: `${ROOTS.DASHBOARD}/banners`,
  },
};
