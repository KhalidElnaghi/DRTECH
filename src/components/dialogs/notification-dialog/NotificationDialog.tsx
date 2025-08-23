/* eslint-disable no-nested-ternary */
import React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useNotifications } from 'src/hooks/use-notifications-query';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { INotification } from 'src/types/notification';

// ----------------------------------------------------------------------

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export default function NotificationDialog({ open, onClose, anchorEl }: NotificationDialogProps) {
  const theme = useTheme();
  const { t } = useTranslate();
  const { data: notificationsData, isLoading, error } = useNotifications();

  const notifications = notificationsData?.Data || [];

  const handleClose = () => {
    onClose();
  };

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('appointment')) {
      return 'hugeicons:appointment-02';
    }
    if (title.toLowerCase().includes('payment')) {
      return 'healthicons:money-bag-outline';
    }
    if (title.toLowerCase().includes('cancelled')) {
      return 'eva:close-circle-fill';
    }
    if (title.toLowerCase().includes('booking')) {
      return 'eva:person-fill';
    }
    return 'eva:bell-fill';
  };

  const getNotificationColor = (title: string) => {
    if (title.toLowerCase().includes('cancelled')) {
      return theme.palette.error.main;
    }
    if (title.toLowerCase().includes('payment')) {
      return theme.palette.success.main;
    }
    if (title.toLowerCase().includes('booking')) {
      return theme.palette.primary.main;
    }
    return theme.palette.info.main;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1h ago';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1d ago';
    return `${diffInDays}d ago`;
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 600,
          borderRadius: 2,
          boxShadow: theme.customShadows.z24,
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {t('TITLE.NOTIFICATIONS') || 'Notifications'}
        </Typography>
        <Typography
          component="button"
          variant="body2"
          sx={{
            color: '#2563EB',
            cursor: 'pointer',
            border: 'none',
            fontWeight: 600,
            background: 'none',
            textDecoration: 'none',
            '&:hover': {
              color: 'primary.dark',
            },
          }}
        >
          {t('BUTTON.MARK_ALL_AS_READ') || 'Mark all as read'}
        </Typography>
      </Box>

      {/* Notification List */}
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
              color: 'text.secondary',
              p: 2,
            }}
          >
            <Iconify icon="eva:alert-circle-outline" width={32} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t('TITLE.NO_NOTIFICATIONS_YET') || 'No notifications yet'}
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
              color: 'text.secondary',
              p: 2,
            }}
          >
            <Iconify icon="eva:bell-off-outline" width={32} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t('TITLE.NO_NOTIFICATIONS_YET') || 'No notifications yet'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification: INotification, index: number) => (
              <React.Fragment key={notification.Id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 2,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <ListItemIcon sx={{ mt: 0.5, mr: 2, minWidth: 40 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(getNotificationColor(notification.Title), 0.1),
                        color: getNotificationColor(notification.Title),
                      }}
                    >
                      <Iconify icon={getNotificationIcon(notification.Title)} width={16} />
                    </Box>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notification.IsRead ? 400 : 600,
                          color: notification.IsRead ? 'text.secondary' : 'text.primary',
                          mb: 0.5,
                        }}
                      >
                        {notification.Title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            mb: 1,
                            lineHeight: 1.4,
                            fontSize: '0.875rem',
                          }}
                        >
                          {notification.Message.slice(0, 100)}...
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.disabled',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.75rem',
                          }}
                        >
                          {formatTimeAgo(notification.SentAt)}
                        </Typography>
                      </Box>
                    }
                  />

                  {!notification.IsRead && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#D92C20',
                        ml: 1,
                        flexShrink: 0,
                        position: 'absolute',
                        right: 10,
                        top: 25,
                      }}
                    />
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider sx={{ mx: 2 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            component="button"
            variant="body2"
            sx={{
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              textDecoration: 'none',
              textAlign: 'right',
              color: '#2563EB',
              fontWeight: 600,
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            {t('BUTTON.LOAD_MORE') || 'Load more'}
          </Typography>
        </Box>
      )}
    </Popover>
  );
}
