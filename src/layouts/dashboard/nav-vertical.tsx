import Image from 'next/image';
import React, { useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { useRouter, usePathname } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { NavSectionVertical } from 'src/components/nav-section';
import ConfirmDialog from 'src/components/custom-dialog/confirm-dialog';

import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import NavToggleButton from '../common/nav-toggle-button';

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const { logout } = useAuthContext();
  const { t } = useTranslate();
  const router = useRouter();
  const [openLogout, setOpenLogout] = React.useState(false);

  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Logo sx={{ my: 1 }} fullNav />
      <NavSectionVertical
        data={navData}
        // slotProps={{
        //   userModules: user?.modules,
        // }}
      />
      <Box />
      <Stack sx={{ p: 2 }}>
        <ListItemButton onClick={() => {}} sx={{ borderRadius: 1 }}>
          <Iconify icon="streamline:customer-support-1" width={20} color="#818898" />
          <Typography sx={{ ml: 1, fontWeight: 600, fontSize: '14px' }} color="#818898">
            {t('LABEL.HELP_CENTER')}
          </Typography>
        </ListItemButton>

        <ListItemButton
          onClick={() => setOpenLogout(true)}
          sx={{ borderRadius: 1, color: 'error.main' }}
        >
          <Iconify icon="solar:logout-outline" width={22} color="#D92C20" />
          <Typography sx={{ ml: 1, fontWeight: 600, color: '#D92C20', fontSize: '14px' }}>
            {t('LABEL.LOGOUT')}
          </Typography>
        </ListItemButton>
      </Stack>
      <ConfirmDialog
        open={openLogout}
        onClose={() => setOpenLogout(false)}
        title={t('TITLE.LOGOUT')}
        content={t('MESSAGE.ARE_YOU_SURE_LOGOUT')}
        icon={<Image src="/assets/images/auth/logout.svg" alt="logout" width={84} height={84} />}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              try {
                await logout();
                setOpenLogout(false);
                router.replace('/');
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
              }
            }}
            sx={{
              width: { xs: '100%', lg: 175 },
              height: 56,
              borderRadius: 2,
              padding: '8px 16px',
              bgcolor: '#DF1C41',
              '&:hover': {
                bgcolor: '#DF1C60',
              },
            }}
          >
            {t('BUTTON.YES_LOGOUT')}
          </Button>
        }
      />
    </Scrollbar>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
