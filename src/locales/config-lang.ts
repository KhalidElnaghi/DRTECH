'use client';

import merge from 'lodash/merge';
// date fns
import { enUS as enUSAdapter, arSA as arSAAdapter } from 'date-fns/locale';

// date pickers (MUI)
import { enUS as enUSDate } from '@mui/x-date-pickers/locales';
// core (MUI)
import { enUS as enUSCore, arSA as arSACore } from '@mui/material/locale';
// data grid (MUI)
import { enUS as enUSDataGrid, arSD as arSDDataGrid } from '@mui/x-data-grid';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'English',
    value: 'en',
    systemValue: merge(enUSDate, enUSDataGrid, enUSCore),
    adapterLocale: enUSAdapter,
    icon: 'flagpack:gb-nir',
    numberFormat: {
      code: 'en-US',
      currency: 'USD',
    },
  },
  {
    label: 'Arabic',
    value: 'ar',
    systemValue: merge(arSDDataGrid, arSACore),
    adapterLocale: arSAAdapter,
    icon: 'flagpack:sa',
    numberFormat: {
      code: 'ar',
      currency: 'AED',
    },
  },
];

export const defaultLang = allLangs[1]; // Arabic

// GET MORE COUNTRY FLAGS
// https://icon-sets.iconify.design/flagpack/
// https://www.dropbox.com/sh/nec1vwswr9lqbh9/AAB9ufC8iccxvtWi3rzZvndLa?dl=0
