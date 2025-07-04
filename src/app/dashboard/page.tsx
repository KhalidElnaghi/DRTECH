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
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams?.limit) : 5;
  const notifications_page =
    typeof searchParams?.notifications_page === 'string'
      ? Number(searchParams?.notifications_page)
      : 1;
  const notifications_limit =
    typeof searchParams?.notifications_limit === 'string'
      ? Number(searchParams?.notifications_limit)
      : 5;
  const notification_type =
    typeof searchParams?.notification_type === 'string' ? searchParams?.notification_type : null;
  const select_date =
    typeof searchParams?.select_date === 'string' ? searchParams?.select_date : null;

  const profitPercentage = await fetchPriceProfit();

  const courses = await fetchTopCourses({
    limit,
    page,
  });
  const notifications = await fetchNotifications({
    notifications_page,
    notifications_limit,
    notification_type,
    select_date,
  });
  const statistics = await fetchStatistics();

  const filteredProducts: any[] = courses?.data;

  return (
    <MainPage
      priceProfit={Number(profitPercentage?.data)}
      courses={filteredProducts}
      count={courses?.meta?.itemCount}
      statistics={statistics}
      notifications={notifications}
    />
  );
}
