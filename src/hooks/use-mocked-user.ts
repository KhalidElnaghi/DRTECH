import { _mock } from 'src/_mock';
import { useAuthContext } from 'src/auth/hooks';

// TO GET THE USER FROM THE AUTHCONTEXT, YOU CAN USE

// CHANGE:
// import { useMockedUser } from 'src/hooks/use-mocked-user';
// const { user } = useMockedUser();

// TO:
// import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------
export type USERDATA = {
  id: string;
  displayName: string;
  email: string;
  password?: string;
  photoURL: string;
  phoneNumber: string;
  country?: string;
  address?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  about?: string;
  role?: string;
  isPublic?: boolean;
};
export function useMockedUser() {
  const { user } = useAuthContext();

  let userData: USERDATA;
  if (user) {
    userData = {
      id: user?.user?.id,
      displayName: user?.user?.username,
      email: user?.user?.email,
      photoURL: '/assets/images/avatar.png',
      phoneNumber: user?.user?.phone,
      role: 'admin',
    };
  } else {
    userData = {
      id: '1',
      displayName: 'Jaydon Frankie',
      email: 'demo@minimals.cc',
      password: 'demo1234',
      photoURL: '/assets/images/avatar.png',
      phoneNumber: '+40 777666555',
      country: 'United States',
      address: '90210 Broadway Blvd',
      state: 'California',
      city: 'San Francisco',
      zipCode: '94116',
      about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
      role: 'admin',
      isPublic: true,
    };
  }

  return { userData };
}
