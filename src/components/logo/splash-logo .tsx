import { forwardRef } from 'react';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box, { BoxProps } from '@mui/material/Box';

import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  enableText?: boolean;
  disabledLink?: boolean;
}

const SplashLogo = forwardRef<HTMLDivElement, LogoProps>(
  ({ enableText, disabledLink = false, sx, ...other }, ref) => {
    const { t } = useTranslate();

    // OR using local (public folder)
    // -------------------------------------------------------
    const logo = (
      <Box component="div" sx={{ width: 'auto', height: 'auto', cursor: 'pointer', p: 0, ...sx }}>
        <Box
          component="img"
          src="/logo/splash-logo.svg"
          sx={{ width: 148, height: 80, cursor: 'pointer', p: 0, ...sx }}
        />
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link
        component={RouterLink}
        href="/"
        sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', ...other }}
      >
        {logo}
      </Link>
    );
  }
);

export default SplashLogo;
