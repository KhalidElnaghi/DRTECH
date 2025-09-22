'use client';

import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';
import { useAuthContext } from 'src/auth/hooks';

import { PATH_AFTER_LOGIN } from 'src/config-global';

// ----------------------------------------------------------------------

export default function HomePage() {
  const router = useRouter();
  const { authenticated } = useAuthContext();

  useEffect(() => {
    if (authenticated) {
      router.push(PATH_AFTER_LOGIN);
    } else {
      router.push('/auth/login');
    }
  }, [router, authenticated]);

  return null;
}
