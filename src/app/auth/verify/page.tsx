import { ClassicVerifyView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Verify code',
};

export default function LoginPage() {
  return <ClassicVerifyView />;
}
