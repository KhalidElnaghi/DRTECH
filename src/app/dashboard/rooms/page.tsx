'use client';

import { useSearchParams } from 'next/navigation';

import { useRooms } from 'src/hooks/use-rooms-query';
import { useLookups } from 'src/hooks/use-lookups-query';

import { LoadingScreen } from 'src/components/loading-screen';

import RoomsPage from '../../../sections/rooms/view';

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('SearchTerm') || '';
  const status = Number(searchParams.get('status')) || 0;

  const { data: roomsData, isLoading: roomsLoading } = useRooms({
    page,
    SearchTerm: search,
    Status: status,
  });
  const { data: roomTypes, isLoading: typesLoading } = useLookups('rooms-types');
  const { data: roomStatus, isLoading: statusLoading } = useLookups('room-status');

  const isLoading = roomsLoading || typesLoading || statusLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RoomsPage
      rooms={roomsData?.Data?.Items || []}
      totalCount={roomsData?.Data?.TotalCount || 0}
      roomTypes={roomTypes || []}
      roomStatus={roomStatus || []}
    />
  );
}
