'use client';

import { useEffect } from 'react';
import { useLanguageContext } from 'src/contexts/language-context';

/**
 * Example component that demonstrates how to automatically refetch data
 * when the language changes. This component will automatically refetch
 * its data whenever the language changes.
 */
export function LanguageAwareData() {
  const { currentLanguage, refetchAllData } = useLanguageContext();

  // This effect will run whenever the language changes
  useEffect(() => {
    console.log(`Language changed to: ${currentLanguage}`);

    // You can add custom logic here to refetch specific data
    // For example, if you have a specific query that needs refreshing:
    // refetchSpecificData();

    // Or refetch all data:
    // refetchAllData();
  }, [currentLanguage, refetchAllData]);

  return (
    <div>
      <p>Current Language: {currentLanguage}</p>
      <p>This component automatically detects language changes and can refetch data as needed.</p>
    </div>
  );
}

/**
 * Hook that can be used in any component to automatically refetch data
 * when the language changes
 */
export function useLanguageAwareData() {
  const { currentLanguage, refetchAllData } = useLanguageContext();

  return {
    currentLanguage,
    refetchAllData,
    // You can add more utility functions here
  };
}
