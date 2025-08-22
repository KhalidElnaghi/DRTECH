import { Box, Paper, Skeleton } from '@mui/material';

export default function PatientsStatisticsSkeleton() {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="text" width={150} height={24} />
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Skeleton variant="text" width={100} height={16} />
        <Skeleton variant="text" width={80} height={16} />
      </Box>

      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2 }} />
      </Box>
    </Paper>
  );
}
