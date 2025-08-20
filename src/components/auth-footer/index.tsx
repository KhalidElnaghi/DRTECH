import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AuthFooter() {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        py: 2,
        px: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: '#9CA3AF', // light grey
          fontSize: '12px',
        }}
      >
        © 2025 Dr.Tech all right reserved.
      </Typography>

      <Link
        href="#"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: '#9CA3AF', // light grey
          textDecoration: 'none',
          fontSize: '12px',
          '&:hover': {
            color: '#D1D5DB',
          },
        }}
      >
        <Iconify icon="eva:question-mark-circle-fill" width={16} height={16} />
        Get help
      </Link>
    </Box>
  );
}
