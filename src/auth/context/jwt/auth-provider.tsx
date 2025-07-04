'use client';

import Cookie from 'js-cookie';
import { useMemo, useEffect, useReducer, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';


import { AuthContext } from './auth-context';
import { setSession, isValidToken } from './utils';
import { USER_KEY, ACCESS_TOKEN } from '../../constants';
import { AuthUserType, ActionMapType, AuthStateType } from '../../types';
import { User } from 'src/types/user';


// ----------------------------------------------------------------------
/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */
// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
  FORGOT = 'FORGOT',
  VERIFY = 'VERIFY'
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.FORGOT]: {
    phone: string;
  };
  [Types.VERIFY]: {
    code: string;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
  phone: '',
  code: ''
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
      phone:'',
      code: ''

    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.FORGOT) {
    return {
      ...state,
      phone: action.payload.phone,
    };
  }
  if (action.type === Types.VERIFY) {
    return {
      ...state,
      code: action.payload.code,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Readonly<Props>) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const lang: string = Cookie.get('Language') || 'ar';
      Cookie.set('Language', lang);
      const accessToken = Cookie.get(ACCESS_TOKEN);
      const user: User | {} = JSON.parse(Cookie.get(USER_KEY) ?? '');

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        dispatch({
          type: Types.INITIAL,
          payload: {
            user,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (phone: string, password: string) => {
    const credentials = {
      phone,
      email: '',
      authType: 'PHONE',
      password,
    };

    const res = await axios.post(endpoints.auth.login, credentials);

    const { data: user } = res.data;
    const { access_token: accessToken } = user;

    setSession(accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    Cookie.set(ACCESS_TOKEN, accessToken);
    Cookie.set(USER_KEY, JSON.stringify(user));

    dispatch({
      type: Types.LOGIN,
      payload: {
        user,
      },
    });
  }, []);

  const forgot = useCallback(async (phone: string) => {
    sessionStorage.setItem('verify_phone', JSON.stringify(phone))
    const credentials = {
        "phone_or_email": phone,
        "authType": "PHONE"
    };

   const res = await axios.post(endpoints.auth.forgot,credentials );

  }, []);
  const verify = useCallback(async (code:string) => {
    sessionStorage.setItem('verify_code', JSON.stringify(code));

  }, []);
  const changePassword = useCallback(async ( password: string) => {
    const savedPhone = JSON.parse(sessionStorage.getItem('verify_phone') as string);
    const savedCode = JSON.parse(sessionStorage.getItem('verify_code') as string)

    const credentials = {
      "phone_or_email": savedPhone,
      "authType": "PHONE",
      "newPassword": password,
      "otp": savedCode
    };
    const res = await axios.post(endpoints.auth.verify,credentials );
     sessionStorage.removeItem('verify_phone');
     sessionStorage.removeItem('verify_code');

  }, []);

  // REGISTER
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const data = {
        email,
        password,
        firstName,
        lastName,
      };

      const res = await axios.post(endpoints.auth.register, data);

      const { access_token, user } = res.data;

      // sessionStorage.setItem(ACCESS_TOKEN, accessToken);

      dispatch({
        type: Types.REGISTER,
        payload: {
          user: {
            ...user,
            access_token,
          },
        },
      });
    },
    []
  );

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    Cookie.remove(ACCESS_TOKEN);
    Cookie.remove(USER_KEY);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      forgot,
      changePassword,
      verify,
      login,
      register,
      logout,
    }),
    [login, logout,forgot, verify,changePassword, register, state.user,state.code, state.phone, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
