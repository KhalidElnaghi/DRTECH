import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';


// import { useMockedUser } from 'src/hooks/use-mocked-user';

import { useAuthContext } from 'src/auth/hooks';

import { varHover } from 'src/components/animate';
import { usePopover } from 'src/components/custom-popover';


export default function AccountPopover() {

  const { user } = useAuthContext();
  const popover = usePopover();




  const getUserRole = (role: number) => {
    switch (role) {
      case 0:
        return 'Super Admin';
      case 1:
        return 'Admin';
      case 2:
        return 'Doctor';
      case 3:
        return 'Nurse';
      case 4:
        return 'Receptionist';
      case 5:
        return 'Pharmacist';
      default:
        return 'Patient';
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            src="/assets/images/nav/profile.svg"
            // alt={userData?.displayName}
            sx={{
              borderRadius: '0px',
              width: 36,
              height: 36,
            }}
          />
        </IconButton>
        <Box>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: 12,
              lineHeight: '150%',
              letterSpacing: '2%',
              color: '#0D0D12',
            }}
          >
            {user?.FullName}
          </Typography>
          <Typography
            variant="body1"
            color="initial"
            sx={{
              fontWeight: 400,
              fontSize: 11,
              lineHeight: '150%',
              letterSpacing: '2%',
              color: '#818898',
            }}
          >
            {getUserRole(user?.Role || 0)}
          </Typography>
        </Box>
      </Box>

      {/* <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}> */}
      {/* <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem sx={{color: 'primary.main', fontWeight: 'fontWeightBold'}} key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {t('TITLE.' + option.label)}
            </MenuItem>
          ))}
        </Stack> */}

      {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}

      {/* <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          {t('LABEL.LOGOUT')}
        </MenuItem>
      </CustomPopover> */}
    </>
  );
}
