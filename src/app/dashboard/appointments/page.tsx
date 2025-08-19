// ----------------------------------------------------------------------

import { fetchDoctors } from 'src/actions/doctors';
import { fetchLookups } from 'src/actions/lookups';
import { fetchPatients } from 'src/actions/patients';
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
  const AppointmentDate =
    typeof searchParams?.AppointmentDate === 'string' ? searchParams?.AppointmentDate : '';
  const Status = typeof searchParams?.Status === 'string' ? searchParams?.Status : '';

  const appointments = await fetchAppoinments({ page, DoctorName, AppointmentDate, Status });
  const doctors = await fetchDoctors({});
  const patients = await fetchPatients({});
  const services = await fetchLookups('service-types');
  const appointmentStatus = await fetchLookups('appointment-status');



  return (
    <AppointmentsPage
      appointments={appointments.data.items}
      totalCount={appointments.data.totalCount}
      doctors={doctors.data.items}
      patients={patients.data.items}
      services={services}
      appointmentStatus={appointmentStatus}
    />
  );
}
