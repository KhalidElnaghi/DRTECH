'use client';

import Cookie from 'js-cookie';
import { useMemo, useEffect, useReducer, useCallback } from 'react';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { AuthContext } from './auth-context';
import { setSession, isValidToken } from './utils';
import { USER_KEY, ACCESS_TOKEN } from '../../constants';
import {
  AuthUserType,
  ActionMapType,
  AuthStateType,
  LoginResponse,
  RegisterResponse,
  User,
} from '../../types';

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
  VERIFY = 'VERIFY',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
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
  [Types.SET_ERROR]: {
    error: string;
  };
  [Types.CLEAR_ERROR]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
  phone: '',
  code: '',
  error: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
      phone: '',
      code: '',
      error: null,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user,
      error: null,
    };
  }
  if (action.type === Types.FORGOT) {
    return {
      ...state,
      phone: action.payload.phone,
      error: null,
    };
  }
  if (action.type === Types.VERIFY) {
    return {
      ...state,
      code: action.payload.code,
      error: null,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user,
      error: null,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
      error: null,
    };
  }
  if (action.type === Types.SET_ERROR) {
    return {
      ...state,
      error: action.payload.error,
    };
  }
  if (action.type === Types.CLEAR_ERROR) {
    return {
      ...state,
      error: null,
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
      const lang: string = Cookie.get('Language') || 'en';
      Cookie.set('Language', lang);
      const accessToken = Cookie.get(ACCESS_TOKEN);
      const userStr = Cookie.get(USER_KEY);
      const user = userStr ? (JSON.parse(userStr) as User) : null;

      if (accessToken && isValidToken(accessToken) && user) {
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
  const login = useCallback(async (email: string, password: string) => {
    try {
      const credentials = {
        email,
        password,
      };

      const res = await axiosInstance.post<LoginResponse>(endpoints.auth.login, credentials);

      const user = res.data.data;
      const { token: accessToken } = user;

      setSession(accessToken);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      Cookie.set(ACCESS_TOKEN, accessToken);
      Cookie.set(USER_KEY, JSON.stringify(user));

      dispatch({
        type: Types.LOGIN,
        payload: {
          user,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);

      // Extract error message from the error response
      let errorMessage = 'Login failed. Please try again.';

      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: Types.SET_ERROR,
        payload: {
          error: errorMessage,
        },
      });

      throw new Error(errorMessage);
    }
  }, []);

  const forgot = useCallback(async (phone: string) => {
    try {
      sessionStorage.setItem('verify_phone', JSON.stringify(phone));
      const credentials = {
        phone_or_email: phone,
        authType: 'PHONE',
      };

      const res = await axiosInstance.post(endpoints.auth.forgot, credentials);
    } catch (error: any) {
      console.error('Forgot password error:', error);

      // Extract error message from the error response
      let errorMessage = 'Failed to send verification code. Please try again.';

      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: Types.SET_ERROR,
        payload: {
          error: errorMessage,
        },
      });

      throw new Error(errorMessage);
    }
  }, []);
  const verify = useCallback(async (code: string) => {
    try {
      sessionStorage.setItem('verify_code', JSON.stringify(code));
    } catch (error: any) {
      console.error('Verify code error:', error);

      // Extract error message from the error response
      let errorMessage = 'Failed to verify code. Please try again.';

      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: Types.SET_ERROR,
        payload: {
          error: errorMessage,
        },
      });

      throw new Error(errorMessage);
    }
  }, []);
  const changePassword = useCallback(async (password: string) => {
    try {
      const savedPhone = JSON.parse(sessionStorage.getItem('verify_phone') as string);
      const savedCode = JSON.parse(sessionStorage.getItem('verify_code') as string);

      const credentials = {
        phone_or_email: savedPhone,
        authType: 'PHONE',
        newPassword: password,
        otp: savedCode,
      };
      const res = await axiosInstance.post(endpoints.auth.verify, credentials);
      sessionStorage.removeItem('verify_phone');
      sessionStorage.removeItem('verify_code');
    } catch (error: any) {
      console.error('Change password error:', error);

      // Extract error message from the error response
      let errorMessage = 'Password change failed. Please try again.';

      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: Types.SET_ERROR,
        payload: {
          error: errorMessage,
        },
      });

      throw new Error(errorMessage);
    }
  }, []);

  // REGISTER
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      try {
        const data = {
          email,
          password,
          firstName,
          lastName,
        };

        const res = await axiosInstance.post(endpoints.auth.register, data);

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
      } catch (error: any) {
        console.error('Register error:', error);

        // Extract error message from the error response
        let errorMessage = 'Registration failed. Please try again.';

        if (error?.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        dispatch({
          type: Types.SET_ERROR,
          payload: {
            error: errorMessage,
          },
        });

        throw new Error(errorMessage);
      }
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

  const clearError = useCallback(() => {
    dispatch({
      type: Types.CLEAR_ERROR,
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
      error: state.error,
      clearError,
      forgot,
      changePassword,
      verify,
      login,
      register,
      logout,
    }),
    [
      login,
      logout,
      forgot,
      verify,
      changePassword,
      register,
      clearError,
      state.user,
      state.error,
      status,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
