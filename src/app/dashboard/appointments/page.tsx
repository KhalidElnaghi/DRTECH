'use client';

import { useSearchParams } from 'next/navigation';

import { useDoctors } from 'src/hooks/use-doctors-query';
import { useLookups } from 'src/hooks/use-lookups-query';
import { usePatients } from 'src/hooks/use-patients-query';
import { useAppointments } from 'src/hooks/use-appointments-query';

import { LoadingScreen } from 'src/components/loading-screen';

import AppointmentsPage from '../../../sections/appointments/view';

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const DoctorName = searchParams.get('DoctorName') || '';
  const AppointmentDate = searchParams.get('AppointmentDate') || '';
  const Status = searchParams.get('Status') || '';

  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments({
    page,
    DoctorName,
    AppointmentDate,
    Status,
  });

  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const { data: patientsData, isLoading: patientsLoading } = usePatients({ page: 1 });
  const { data: services, isLoading: servicesLoading } = useLookups('service-types');
  const { data: clinics, isLoading: clinicsLoading } = useLookups('clinics');
  const { data: appointmentStatus, isLoading: statusLoading } = useLookups('appointment-status');
  const isLoading =
    appointmentsLoading ||
    doctorsLoading ||
    patientsLoading ||
    servicesLoading ||
    statusLoading ||
    clinicsLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppointmentsPage
      appointments={appointmentsData?.Data?.Items || []}
      totalCount={appointmentsData?.Data?.TotalCount || 0}
      doctors={doctorsData?.Data?.Items || []}
      patients={patientsData?.Data?.Items || []}
      services={services || []}
      clinics={clinics.Data || []}
      appointmentStatus={appointmentStatus || []}
    />
  );
}
