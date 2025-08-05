import Image from 'next/image';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useResponsive } from 'src/hooks/use-responsive';

import { useTranslate } from 'src/locales';

import Logo from 'src/components/logo';
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthClassicLayout({ children }: Props) {
  const { t } = useTranslate();
  const theme = useTheme();

  const renderLogo = (
    <Box
      sx={{
        zIndex: 9,
        position: 'absolute',
        top: { xs: 16, md: 40 },
        left: { xs: 16, md: 40 },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box component="img" src="/logo/logo.svg" sx={{ width: 32, height: 32 }} />
      <Typography variant="h6" color="initial">
        Dr.Tech
      </Typography>
    </Box>
  );

  const renderContent = (
    <Stack
      flexGrow={1}
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: '600px',
      }}
    >
      {children}
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
        direction: theme.direction === 'rtl' ? 'rtl' : '',
        textAlign: theme.direction === 'rtl' ? 'left' : '',
        bgcolor: '#F6F8FA',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {renderLogo}

      {renderContent}
    </Stack>
  );
}
