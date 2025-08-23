'use client';

import { useSearchParams } from 'next/navigation';

import { usePayments } from 'src/hooks/use-payments-query';
import { useLookups } from 'src/hooks/use-lookups-query';
import { useDoctorsDropdown } from 'src/hooks/use-doctors-query';

import { LoadingScreen } from 'src/components/loading-screen';

import PaymentsPage from 'src/sections/payments/view';

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const DoctorId = Number(searchParams.get('DoctorId')) || 0;
  const Status = Number(searchParams.get('Status')) || 0;

  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
    page,
    DoctorId: DoctorId || undefined,
    Status: Status || undefined,
  });

  const { data: doctorsData, isLoading: doctorsLoading } = useDoctorsDropdown();
  const { data: paymentMethods, isLoading: methodsLoading } = useLookups('payment-methods');
  const { data: paymentStatus, isLoading: statusLoading } = useLookups('payment-status');
  const { data: serviceTypes, isLoading: serviceTypesLoading } = useLookups('service-types');

  const isLoading =
    paymentsLoading || doctorsLoading || methodsLoading || statusLoading || serviceTypesLoading;

  if (isLoading) return <LoadingScreen />;

  return (
    <PaymentsPage
      payments={paymentsData?.Data?.Items || []}
      totalCount={paymentsData?.Data?.TotalCount || 0}
      doctors={doctorsData?.Data || doctorsData?.Items || doctorsData || []}
      paymentMethods={paymentMethods || []}
      paymentStatus={paymentStatus || []}
      serviceTypes={serviceTypes || []}
    />
  );
}
