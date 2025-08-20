'use client';

import { useSearchParams } from 'next/navigation';

import { useUsers } from 'src/hooks/use-users-query';
import { useLookups } from 'src/hooks/use-lookups-query';
import { useSpecializations } from 'src/hooks/use-doctors-query';

import { LoadingScreen } from 'src/components/loading-screen';

import UsersPage from 'src/sections/users/view';

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const SearchTerm = searchParams.get('SearchTerm') || '';

  const { data: usersData, isLoading: usersLoading } = useUsers({ page, SearchTerm });
  const { data: roles, isLoading: rolesLoading } = useLookups('user-roles');
  const { data: statuses, isLoading: statusesLoading } = useLookups('availability-status');
  const { data: specs, isLoading: specsLoading } = useSpecializations();

  const isLoading = usersLoading || rolesLoading || statusesLoading || specsLoading;

  if (isLoading) return <LoadingScreen />;

  return (
    <UsersPage
      users={usersData?.Data?.Items || []}
      totalCount={usersData?.Data?.TotalCount || 0}
      roles={roles || []}
      statuses={statuses || []}
      specializations={specs?.Data || []}
    />
  );
}
