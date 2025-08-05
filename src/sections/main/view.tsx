'use client';

import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------
type props = {
  statistics: any;
  courses: any[];
  count: number;
  notifications: any[];
  priceProfit: number;
};

export default function MainPage() {
  const settings = useSettingsContext();
  return <Container maxWidth={settings.themeStretch ? false : 'xl'}>hh</Container>;
}
