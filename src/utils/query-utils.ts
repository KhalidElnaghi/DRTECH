import { QueryClient } from '@tanstack/react-query';

// Query key patterns for different data types
export const queryKeyPatterns = {
  appointments: ['appointments'],
  doctors: ['doctors'],
  patients: ['patients'],
  rooms: ['rooms'],
  inpatients: ['inpatients'],
  payments: ['payments'],
  users: ['users'],
  lookups: ['lookups'],
  notifications: ['notifications'],
  dashboard: ['dashboard'],
  settings: ['settings'],
} as const;

/**
 * Invalidate all queries related to a specific data type
 */
export const invalidateQueriesByType = (
  queryClient: QueryClient,
  type: keyof typeof queryKeyPatterns
) => {
  const pattern = queryKeyPatterns[type];
  if (pattern) {
    queryClient.invalidateQueries({ queryKey: pattern });
  }
};

/**
 * Invalidate all queries that might contain language-specific data
 */
export const invalidateLanguageSpecificQueries = (queryClient: QueryClient) => {
  // Invalidate all the main query patterns
  Object.values(queryKeyPatterns).forEach((pattern) => {
    queryClient.invalidateQueries({ queryKey: pattern });
  });

  // Invalidate any queries with language-related parameters
  queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey;
      return queryKey.some(
        (key) =>
          typeof key === 'string' &&
          (key.includes('lang') || key.includes('language') || key.includes('locale'))
      );
    },
  });
};

/**
 * Force immediate refetch of critical queries
 */
export const refetchCriticalQueries = (queryClient: QueryClient) => {
  const criticalQueries = [
    ['lookups'], // Status labels, service types, etc.
    ['dashboard'], // Dashboard summaries and statistics
    ['appointments'], // Appointment status names
  ];

  criticalQueries.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey, refetchType: 'all' });
  });
};

/**
 * Invalidate all queries and optionally refetch critical ones
 */
export const invalidateAllQueries = (
  queryClient: QueryClient,
  options?: {
    refetchCritical?: boolean;
    refetchType?: 'all' | 'active' | 'inactive' | 'none';
  }
) => {
  const { refetchCritical = true, refetchType = 'all' } = options || {};

  // Invalidate all queries
  queryClient.invalidateQueries({ refetchType });

  // Invalidate language-specific queries
  invalidateLanguageSpecificQueries(queryClient);

  // Optionally refetch critical queries
  if (refetchCritical) {
    refetchCriticalQueries(queryClient);
  }
};
