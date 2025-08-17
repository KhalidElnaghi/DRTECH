// ----------------------------------------------------------------------

import { fetchAppoinments } from 'src/actions/appointments';
import AppointmentsPage from '../../../sections/appointments/view';

export const metadata = {
  title: 'Appointments',
};

type props = {
  searchParams: { [key: string]: string | string[] | undefined };
};
export default async function Page({ searchParams }: Readonly<props>) {
  const page = typeof searchParams?.page === 'string' ? Number(searchParams?.page) : 1;
  const DoctorName = typeof searchParams?.DoctorName === 'string' ? searchParams?.DoctorName : '';
  const AppointmentDate = typeof searchParams?.AppointmentDate === 'string' ? searchParams?.AppointmentDate : '';
  const Status = typeof searchParams?.Status === 'string' ? searchParams?.Status : '';

  const appointments = await fetchAppoinments({ page, DoctorName, AppointmentDate, Status });

  return (
    <AppointmentsPage
      appointments={appointments.data.items}
      totalCount={appointments.data.totalCount}
    />
  );
}
