import { Box, Paper, Skeleton } from '@mui/material';

export default function UpcomingAppointmentsSkeleton() {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Skeleton variant="text" width={180} height={24} sx={{ mb: 1 }} />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
