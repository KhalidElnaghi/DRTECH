import { useState } from 'react';
import { m } from 'framer-motion';

import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { Box, Badge, Divider } from '@mui/material';

import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
import { useNotifications } from 'src/hooks/use-notifications-query';

import { bgBlur } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';
import NotificationDialog from 'src/components/dialogs/notification-dialog';

import { INotification } from 'src/types/notification';

import { NAV, HEADER } from '../config-layout';
import AccountPopover from '../common/account-popover';
import LanguagePopover from '../common/language-popover';

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const { data: notificationsData } = useNotifications();

  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo />}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      {/* <Searchbar /> */}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        <LanguagePopover />

        <Badge
          onClick={(event) => {
            setNotificationAnchorEl(event.currentTarget);
            setOpenNotifications(true);
          }}
          badgeContent={
            notificationsData?.Data?.filter((n: INotification) => !n.IsRead).length || 0
          }
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              top: 9,
              right: 9,
            },
            cursor: 'pointer',
          }}
        >
          <IconButton
            component={m.button}
            whileTap="tap"
            whileHover="hover"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <Iconify icon="famicons:notifications" width={24} />
          </IconButton>
        </Badge>

        {/* <ContactsPopover /> */}

        {/* <SettingsButton /> */}
        <Box sx={{ borderLeft: '1px solid #DFE1E7', width: '1px', height: '20px' }} />

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <>
      <AppBar
        sx={{
          height: HEADER.H_MOBILE,
          zIndex: theme.zIndex.appBar + 1,
          ...bgBlur({
            color: theme.palette.background.default,
          }),
          transition: theme.transitions.create(['height'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(lgUp && {
            width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
            height: HEADER.H_DESKTOP,
            ...(offsetTop && {
              height: HEADER.H_DESKTOP_OFFSET,
            }),
            ...(isNavHorizontal && {
              width: 1,
              bgcolor: 'background.default',
              height: HEADER.H_DESKTOP_OFFSET,
              borderBottom: `dashed 1px ${theme.palette.divider}`,
            }),
            ...(isNavMini && {
              width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
            }),
          }),
        }}
      >
        <Toolbar
          sx={{
            height: 1,
            px: { lg: 5 },
          }}
        >
          {renderContent}
        </Toolbar>
        <Divider sx={{ mx: 4.5 }} />
      </AppBar>

      <NotificationDialog
        open={openNotifications}
        onClose={() => {
          setOpenNotifications(false);
          setNotificationAnchorEl(null);
        }}
        anchorEl={notificationAnchorEl}
      />
    </>
  );
}
