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
  fullNav?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ enableText, disabledLink = false, fullNav = false, sx, ...other }, ref) => {
    const { t } = useTranslate();

    // OR using local (public folder)
    // -------------------------------------------------------
    const logo = (
      <Box
        component="div"
        sx={{
          width: 'auto',
          height: 'auto',
          cursor: 'pointer',
          p: 0,
          ...sx,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          component="img"
          src="/logo/logo.svg"
          sx={{ width: 32, height: 32, cursor: 'pointer', p: 0, ...sx }}
        />
        {fullNav && (
          <Typography variant="h6" color="initial">
            Dr.Tech
          </Typography>
        )}
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link
        component={RouterLink}
        href="/"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          mx: 2,
          justifyContent: 'start',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'none',
          },
          ...other,
        }}
      >
        {logo}
      </Link>
    );
  }
);

export default Logo;
