import { Box, Paper, Skeleton } from '@mui/material';

export default function DashboardPatientsTableSkeleton() {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 0,
        width: '100%',
        maxWidth: '95vw',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Skeleton variant="text" width={120} height={24} />
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="text" width="20%" height={20} />
            <Skeleton variant="text" width="15%" height={20} />
            <Skeleton variant="text" width="20%" height={20} />
            <Skeleton variant="text" width="25%" height={20} />
            <Skeleton variant="text" width="15%" height={20} />
            <Skeleton variant="text" width="15%" height={20} />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
