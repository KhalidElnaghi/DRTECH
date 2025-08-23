import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'src/locales';
import { invalidateAllQueries, invalidateQueriesByType } from 'src/utils/query-utils';

export const useLanguageChange = () => {
  const queryClient = useQueryClient();
  const { onChangeLang } = useTranslate();

  const changeLanguage = useCallback(
    (newLang: string) => {
      try {
        // Change the language first
        onChangeLang(newLang);

        // Invalidate all queries and refetch critical ones
        invalidateAllQueries(queryClient, {
          refetchCritical: true,
          refetchType: 'all',
        });

        console.log(`Language changed to ${newLang}, all queries invalidated for refetch`);
      } catch (error) {
        console.error('Error during language change:', error);
        // Still try to change the language even if cache invalidation fails
        onChangeLang(newLang);
      }
    },
    [onChangeLang, queryClient]
  );

  // Utility function to manually invalidate specific query types
  const invalidateQueries = useCallback(
    (type?: keyof typeof import('src/utils/query-utils').queryKeyPatterns) => {
      if (type) {
        invalidateQueriesByType(queryClient, type);
      } else {
        invalidateAllQueries(queryClient);
      }
    },
    [queryClient]
  );

  // Utility function to force refetch all data
  const refetchAllData = useCallback(() => {
    invalidateAllQueries(queryClient, {
      refetchCritical: true,
      refetchType: 'all',
    });
  }, [queryClient]);

  return {
    changeLanguage,
    invalidateQueries,
    refetchAllData,
  };
};
