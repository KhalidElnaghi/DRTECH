import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAccountData } from 'src/api/settings';
import { AccountData } from 'src/types/settings';

// ----------------------------------------------------------------------

export interface UseAccountDataReturn {
  accountData: AccountData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAccountData(): UseAccountDataReturn {
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['account-data'],
    queryFn: getAccountData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (response?.Data) {
      setAccountData(response.Data);
    }
  }, [response]);

  return {
    accountData,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
