import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { useAuthContext } from 'src/auth/hooks';

import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

const OPTIONS = [
  {
    label: 'CHANGE_PHONE',
    linkTo: '/dashboard/change-phone',
  },

];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter();

  const { userData } = useMockedUser();
  const { logout } = useAuthContext();
  const { t } = useTranslate();

  const popover = usePopover();

  const handleLogout = async () => {
    try {
      await logout();
      popover.onClose();
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickItem = (path: string) => {
    popover.onClose();
    router.push(path);
  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
          text: '#fff',
        }}
      >
        <Avatar
          src="/assets/images/popover/setting.png"
          alt={userData?.displayName}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        ></Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem sx={{color: 'primary.main', fontWeight: 'fontWeightBold'}} key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {t('TITLE.' + option.label)}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          {t('LABEL.LOGOUT')}
        </MenuItem>
      </CustomPopover>
    </>
  );
}
