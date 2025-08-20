'use client';

import { useSearchParams } from 'next/navigation';

import { usePatients } from 'src/hooks/use-patients-query';
import { useLookups } from 'src/hooks/use-lookups-query';

import { LoadingScreen } from 'src/components/loading-screen';

import PatientsPage from '../../../sections/patients/view';

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('SearchTerm') || '';
  const gender = Number(searchParams.get('Gender')) || 0;
  const bloodType = Number(searchParams.get('BloodType')) || 0;

  const { data: patientsData, isLoading: patientsLoading } = usePatients({
    page,
    SearchTerm: search,
    Gender: gender,
    BloodType: bloodType,
  });
  const { data: genders, isLoading: gendersLoading } = useLookups('genders');
  const { data: bloodTypes, isLoading: bloodTypesLoading } = useLookups('blood-types');

  const isLoading = patientsLoading || gendersLoading || bloodTypesLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }
  console.log(patientsData);

  return (
    <PatientsPage
      patients={patientsData?.Data?.Items || []}
      totalCount={patientsData?.Data?.TotalCount || 0}
      genders={genders || []}
      bloodTypes={bloodTypes || []}
    />
  );
}
