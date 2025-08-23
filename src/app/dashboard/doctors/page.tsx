'use client';

import { useSearchParams } from 'next/navigation';

import { useLookups } from 'src/hooks/use-lookups-query';
import { useDoctors, useSpecializations } from 'src/hooks/use-doctors-query';

import { LoadingScreen } from 'src/components/loading-screen';

import DoctorsPage from '../../../sections/doctors/view';

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('SearchTerm') || '';
  const status = Number(searchParams.get('status')) || 0;
  const specializationId = Number(searchParams.get('specializationId')) || 0;

  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors({
    page,
    SearchTerm: search,
    Status: status,
    specializationId,
  });

  const { data: statusOptions, isLoading: statusLoading } = useLookups('availability-status');
  const { data: specializations, isLoading: specializationsLoading } = useSpecializations();

  const isLoading = doctorsLoading || statusLoading || specializationsLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <DoctorsPage
      doctors={doctorsData?.Data?.Items || []}
      totalCount={doctorsData?.Data?.TotalCount || 0}
      specializations={specializations.Data || []}
      statusOptions={statusOptions || []}
    />
  );
}
