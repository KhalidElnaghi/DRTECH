import { cookies } from 'next/headers';

import { USER_KEY } from '../auth/constants';

export interface User {
  data: Data
}

export interface Data {
  user: IUser
  access_token: string
}

export interface IUser {
  id: string
  username: any
  email: string
  email_verified_at: any
  phone: string
  phone_verified_at: string
  userStatus: string
  roles: string[]
}

export const useUser = (): User => {
  const cookieStore = cookies();
  const { value } = cookieStore.get(USER_KEY) as Record<string, string>;
  return JSON.parse(value) as User;
};
