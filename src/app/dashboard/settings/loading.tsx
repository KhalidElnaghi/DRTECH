import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------

export default function SettingsLoading() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width={80} height={36} />
          <Skeleton variant="rectangular" width={80} height={36} />
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ width: 320, flexShrink: 0 }}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />

            <Stack spacing={1}>
              {[1, 2, 3].map((item) => (
                <Box key={item} sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width="70%" height={24} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 3 }} />

            <Stack spacing={2}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Box key={item}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ py: 2 }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="80%" height={16} />
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      width={44}
                      height={24}
                      sx={{ borderRadius: 12 }}
                    />
                  </Stack>
                  {item < 5 && <Skeleton variant="rectangular" width="100%" height={1} />}
                </Box>
              ))}
            </Stack>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
