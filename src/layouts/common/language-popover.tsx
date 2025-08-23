import { m } from 'framer-motion';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { useLocales, useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
// ----------------------------------------------------------------------

// export const allLangs = [
//   {
//     label: 'English',
//     value: 'en',
//     icon: 'flagpack:gb-nir',
//   },
//   {
//     label: 'French',
//     value: 'fr',
//     icon: 'flagpack:fr',
//   },
//   {
//     label: 'Vietnamese',
//     value: 'vi',
//     icon: 'flagpack:vn',
//   },
//   {
//     label: 'Chinese',
//     value: 'cn',
//     icon: 'flagpack:cn',
//   },
//   {
//     label: 'Arabic',
//     value: 'ar',
//     icon: 'flagpack:sa',
//   },
// ];

export default function LanguagePopover() {
  const popover = usePopover();
  const queryClient = useQueryClient();

  const { t } = useTranslate();
  const { onChangeLang } = useTranslate();

  const { allLangs, currentLang } = useLocales();

  const handleChangeLang = useCallback(
    (newLang: string) => {
      onChangeLang(newLang);

      // Invalidate all React Query caches to refetch data with new language
      queryClient.invalidateQueries();

      popover.onClose();
    },
    [onChangeLang, popover, queryClient]
  );

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
          ...(popover.open && {
            bgcolor: 'action.selected',
          }),
        }}
      >
        <Iconify icon={currentLang.icon} sx={{ borderRadius: 0.65, width: 28 }} />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 160 }}>
        {allLangs.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLang.value}
            onClick={() => handleChangeLang(option.value)}
          >
            <Iconify icon={option.icon} sx={{ borderRadius: 0.65, width: 28 }} />

            {t(`LABEL.${option.label}`)}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
