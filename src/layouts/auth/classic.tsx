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
  const mdUp = useResponsive('up', 'md');

  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        position: 'absolute',
        m: { xs: 2, md: 5 },
      }}
    />
  );

  const renderContent = (
    <Stack
      flexGrow={1}
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 480,
        px: { xs: 2, md: 8 },
        pt: { xs: 15, md: 20 },
        pb: { xs: 15, md: 0 },
      }}
    >
      {children}
    </Stack>
  );

  const renderSection = (
    <Box
      sx={{
        width: '50%',
        background: 'linear-gradient(140deg, #1B5455, #3CB8BB)',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
        position: 'relative',
      }}
    >
      <Image
        src="/assets/images/login/image-5.svg"
        alt="image"
        width={161}
        height={124}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      />
      <Image
        src="/assets/images/login/image-6.svg"
        alt="image"
        width={161}
        height={124}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      />

      <Box sx={{ position: 'relative', display: 'flex', gap: 3 }}>
        <Box
          sx={{
            backgroundImage: "url('/assets/images/login/image-1.jpeg')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            height: { md: '260px', lg: '350px' },
            width: { md: '127px', lg: '189px' },
            borderRadius: '13px',
            position: 'relative',
          }}
        >
          <Image
            src="/assets/images/login/image-4.svg"
            alt="image"
            width={75}
            height={62}
            style={{
              position: 'absolute',
              top: '-60px',
              left: '-60px',
            }}
          />
        </Box>
        <Box
          sx={{
            backgroundImage: "url('/assets/images/login/image-2.jpeg')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            height: { md: '260px', lg: '350px' },
            width: { md: '127px', lg: '189px' },
            borderRadius: '13px',
            position: 'relative',
            top: '-80px',
          }}
         />
        <Box
          sx={{
            backgroundImage: "url('/assets/images/login/image-3.jpeg')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            height: { md: '260px', lg: '350px' },
            width: { md: '127px', lg: '189px' },
            borderRadius: '13px',
            position: 'relative',
            top: '-50px',
          }}
         />
      </Box>
      <Box
        sx={{
          position: 'relative',
        }}
      >
        <Typography
          variant="body1"
          color="white"
          sx={{
            fontSize: { md: 24, lg: 32 },
            fontWeight: 500,
            position: 'absolute',
            top: '-50px',
            left: '-100px',
          }}
        >
          {t('LABEL.DASHBOARD')}
        </Typography>
        <Typography
          variant="h1"
          color="white"
          sx={{
            fontSize: { md: 50, lg: 80 },
            fontWeight: 700,
          }}
        >
          {t('LABEL.MAHARATONA')}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
        direction: theme.direction === 'rtl' ? 'rtl' : '',
        textAlign: theme.direction === 'rtl' ? 'left' : '',
      }}
    >
      {renderLogo}


      {renderContent}
      {mdUp && renderSection}
    </Stack>
  );
}
