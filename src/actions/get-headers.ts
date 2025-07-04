'use server';

import { cookies } from 'next/headers';

export const getHeaders = (): Record<'Authorization' | 'Accept-Language', string | undefined> => {
  const accessToken = cookies().get('access_token')?.value;
  const lang = cookies().get('Language')?.value;

  return {
    Authorization: `Bearer ${accessToken}`,
    'Accept-Language': lang,
  };
};
