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
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
      changePassword: `${ROOTS.AUTH}/jwt/new-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    appointments: `${ROOTS.DASHBOARD}/appointments`,
    rooms: `${ROOTS.DASHBOARD}/rooms`,
    doctors: `${ROOTS.DASHBOARD}/doctors`,
    patients: `${ROOTS.DASHBOARD}/patients`,
    inpatients: `${ROOTS.DASHBOARD}/inpatients`,
    users: `${ROOTS.DASHBOARD}/users`,
    settings: `${ROOTS.DASHBOARD}/settings`,
  },
};
