import { Box, CircularProgress, Typography } from '@mui/material';

type LoadingOverlayProps = {
  message?: string;
  isVisible: boolean;
};

export default function LoadingOverlay({
  message = 'Refreshing data...',
  isVisible,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
