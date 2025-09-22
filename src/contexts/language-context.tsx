'use client';

import { createContext, useContext, useEffect, useCallback, ReactNode, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'src/locales';
import { invalidateAllQueries } from 'src/utils/query-utils';
import { LanguageContextType, LanguageChangeEvent } from 'src/types/language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const queryClient = useQueryClient();
  const { i18n, onChangeLang } = useTranslate();
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const onLanguageChange = useCallback(
    async (newLang: string): Promise<void> => {
      try {
        setIsChangingLanguage(true);

        // Change the language first
        onChangeLang(newLang);

        // Invalidate all queries and refetch critical ones
        invalidateAllQueries(queryClient, {
          refetchCritical: true,
          refetchType: 'all',
        });

      } catch (error) {
        console.error('Error during language change:', error);
        // Still try to change the language even if cache invalidation fails
        onChangeLang(newLang);
      } finally {
        setIsChangingLanguage(false);
      }
    },
    [onChangeLang, queryClient]
  );

  const refetchAllData = useCallback(() => {
    invalidateAllQueries(queryClient, {
      refetchCritical: true,
      refetchType: 'all',
    });
  }, [queryClient]);

  const invalidateQueries = useCallback(
    (type?: string) => {
      if (type) {
        // Invalidate specific query type
        queryClient.invalidateQueries({ queryKey: [type] });
      } else {
        // Invalidate all queries
        invalidateAllQueries(queryClient);
      }
    },
    [queryClient]
  );

  // Listen for language changes from other sources (like URL changes, etc.)
  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLang = i18n.language;

      // Refetch all data when language changes
      invalidateAllQueries(queryClient, {
        refetchCritical: true,
        refetchType: 'all',
      });
    };

    // Listen for i18n language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, queryClient]);

  const value = useMemo<LanguageContextType>(
    () => ({
      currentLanguage: i18n.language,
      onLanguageChange,
      refetchAllData,
      invalidateQueries,
      isChangingLanguage,
    }),
    [i18n.language, onLanguageChange, refetchAllData, invalidateQueries, isChangingLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
