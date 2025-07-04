'use client';

import { Box, Divider, Typography } from '@mui/material';
import Image from 'next/image';
import i18n from 'src/locales/i18n';
import { arabicDate, englishDate } from 'src/utils/format-time';

type props = {
  data?: any;
};

const NotificationItem = ({ data }: props) => {

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Image
            src="/assets/images/home/notification.svg"
            alt="notification logo"
            width={40}
            height={40}
          />
          <Box>
            <Typography variant="body1" color="info.dark">
              {data?.title}
            </Typography>
            <Typography variant="body2" color="info.dark">
              {data?.message}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" color="info.dark">
          {i18n.language === 'ar' ? arabicDate(data?.created_at) : englishDate(data?.created_at)}
        </Typography>
      </Box>
      <Divider sx={{ mx: 4, bgcolor: 'info.dark', borderBottomWidth: 1 }} />
    </>
  );
};

export default NotificationItem;
