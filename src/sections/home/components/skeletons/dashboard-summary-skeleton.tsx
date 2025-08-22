import { Box, Grid, Paper, Skeleton } from '@mui/material';

export default function DashboardSummarySkeleton() {
  return (
    <Grid container spacing={2}>
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
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
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
            <Skeleton variant="text" width={80} height={32} />
            <Skeleton variant="text" width={100} height={16} sx={{ mt: 1 }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
