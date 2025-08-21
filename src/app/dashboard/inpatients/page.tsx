'use client';

import { useSearchParams } from 'next/navigation';

import { useRooms } from 'src/hooks/use-rooms-query';
import { usePatients } from 'src/hooks/use-patients-query';
import { useInpatients } from 'src/hooks/use-inpatients-query';

import { LoadingScreen } from 'src/components/loading-screen';

import InpatientsPage from '../../../sections/inpatients/view';

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('SearchTerm') || '';
  const patientId = Number(searchParams.get('PatientId')) || 0;
  const roomId = Number(searchParams.get('RoomId')) || 0;

  const { data: inpatientsData, isLoading: inpatientsLoading } = useInpatients({
    page,
    SearchTerm: search,
    PatientId: patientId > 0 ? patientId : undefined,
    RoomId: roomId > 0 ? roomId : undefined,
  });

  const { data: patientsData, isLoading: patientsLoading } = usePatients({ page: 1 });
  const { data: roomsData, isLoading: roomsLoading } = useRooms({ page: 1 });

  const isLoading = inpatientsLoading || patientsLoading || roomsLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <InpatientsPage
      inpatients={inpatientsData?.Data?.Items || []}
      totalCount={inpatientsData?.Data?.TotalCount || 0}
      patients={patientsData?.Data?.Items || []}
      rooms={roomsData?.Data?.Items || []}
    />
  );
}
