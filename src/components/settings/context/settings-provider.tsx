'use client';

import isEqual from 'lodash/isEqual';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { useLocalStorage } from 'src/hooks/use-local-storage';

import { localStorageGetItem } from 'src/utils/storage-available';

import { SettingsValueProps } from '../types';
import { SettingsContext } from './settings-context';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'settings';

type SettingsProviderProps = {
  children: React.ReactNode;
  defaultSettings: SettingsValueProps;
};

export function SettingsProvider({ children, defaultSettings }: SettingsProviderProps) {
  const { state, update, reset } = useLocalStorage(STORAGE_KEY, defaultSettings);

  const [openDrawer, setOpenDrawer] = useState(false);

  const currentLang = localStorageGetItem('i18nextLng') || 'en';
  const isArabic = currentLang === 'ar';

  useEffect(() => {
    // Initialize theme direction based on current language
    const shouldBeRTL = currentLang === 'ar';
    const currentDirection = state.themeDirection;


    // Only update if the direction doesn't match the language
    if (
      (shouldBeRTL && currentDirection !== 'rtl') ||
      (!shouldBeRTL && currentDirection !== 'ltr')
    ) {
      onChangeDirectionByLang(currentLang);
    }
  }, [currentLang, state.themeDirection]);

  // Direction by lang
  const onChangeDirectionByLang = useCallback(
    (lang: string) => {
      update('themeDirection', lang === 'ar' ? 'rtl' : 'ltr');
    },
    [update]
  );

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(state, defaultSettings);

  const memoizedValue = useMemo(
    () => ({
      ...state,
      onUpdate: update,
      // Direction
      onChangeDirectionByLang,
      // Reset
      canReset,
      onReset: reset,
      // Drawer
      open: openDrawer,
      onToggle: onToggleDrawer,
      onClose: onCloseDrawer,
    }),
    [
      reset,
      update,
      state,
      canReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      onChangeDirectionByLang,
    ]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
