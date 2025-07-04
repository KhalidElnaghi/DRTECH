'use client';

import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import Statistics from './home/statistics';
import TopCoursesTableView from './home/top-corses';
import NotificationView from './home/notifications';

// ----------------------------------------------------------------------
type props = {
  statistics: any;
  courses: any[];
  count: number;
  notifications: any[];
  priceProfit: number;
};

export default function MainPage({
  statistics,
  courses,
  notifications,
  count,
  priceProfit,
}: Readonly<props>) {
  const settings = useSettingsContext();
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {/* <Statistics statistics={statistics} priceProfit={priceProfit} />
      <TopCoursesTableView count={count} courses={courses} />
      <NotificationView notifications={notifications} /> */}
    </Container>
  );
}
