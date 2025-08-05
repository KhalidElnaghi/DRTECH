import {
  fetchStatistics,
  fetchTopCourses,
  fetchPriceProfit,
  fetchNotifications,
} from 'src/actions/home';

import MainPage from 'src/sections/main/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard | Main',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};
export default async function Page({ searchParams }: Readonly<props>) {
  return <MainPage />;
}
