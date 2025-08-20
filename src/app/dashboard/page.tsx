import MainPage from 'src/sections/home/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Main',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};
export default async function Page({ searchParams }: Readonly<props>) {
  return <MainPage />;
}
