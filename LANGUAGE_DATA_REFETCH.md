# Language-Aware Data Refetching System

This system automatically refetches data when the language changes, ensuring that all language-specific content is updated throughout the application.

## Overview

When a user changes the language in the application, the system automatically:

1. Changes the i18n language
2. Updates the UI direction (RTL/LTR)
3. Updates axios headers for API requests
4. **NEW**: Invalidates all React Query caches
5. **NEW**: Automatically refetches critical data with the new language

## How It Works

### 1. Language Change Flow

```
User clicks language → LanguagePopover → LanguageContext → invalidateAllQueries → Data refetched
```

### 2. Automatic Cache Invalidation

The system automatically invalidates these query key patterns:

- `['appointments']` - Appointment data
- `['doctors']` - Doctor data
- `['patients']` - Patient data
- `['rooms']` - Room data
- `['inpatients']` - Inpatient data
- `['payments']` - Payment data
- `['users']` - User data
- `['lookups']` - Lookup data (statuses, types, etc.)
- `['notifications']` - Notification data
- `['dashboard']` - Dashboard data
- `['settings']` - Settings data

### 3. Critical Queries Refetch

These queries are immediately refetched for better user experience:

- Lookups (status labels, service types)
- Dashboard summaries and statistics
- Appointment status names

## Usage

### For Components

#### Option 1: Use the Language Context (Recommended)

```tsx
import { useLanguageContext } from 'src/contexts/language-context';

function MyComponent() {
  const { currentLanguage, refetchAllData, isChangingLanguage } = useLanguageContext();

  useEffect(() => {
    // This will run whenever the language changes
    console.log(`Language changed to: ${currentLanguage}`);

    // Your component will automatically get fresh data
    // No manual action needed!
  }, [currentLanguage]);

  return (
    <div>
      <p>Current Language: {currentLanguage}</p>
      {isChangingLanguage && <p>Changing language...</p>}
    </div>
  );
}
```

#### Option 2: Use the Hook

```tsx
import { useLanguageChange } from 'src/hooks/use-language-change';

function MyComponent() {
  const { refetchAllData } = useLanguageChange();

  const handleManualRefresh = () => {
    refetchAllData();
  };

  return <button onClick={handleManualRefresh}>Refresh All Data</button>;
}
```

### For Custom Queries

If you have custom queries that need language-specific handling:

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useLanguageContext } from 'src/contexts/language-context';

function MyCustomComponent() {
  const queryClient = useQueryClient();
  const { currentLanguage } = useLanguageContext();

  const { data } = useQuery({
    queryKey: ['custom-data', currentLanguage], // Include language in query key
    queryFn: () => fetchCustomData(currentLanguage),
  });

  // This query will automatically refetch when language changes
  // because the query key includes the current language
}
```

## Configuration

### Query Keys

The system automatically detects and invalidates queries based on these patterns:

```typescript
const queryKeyPatterns = {
  appointments: ['appointments'],
  doctors: ['doctors'],
  patients: ['patients'],
  // ... etc
};
```

### Custom Query Types

To add support for new query types, update `src/utils/query-utils.ts`:

```typescript
export const queryKeyPatterns = {
  // ... existing patterns
  newFeature: ['new-feature'], // Add your new pattern here
} as const;
```

## Error Handling

The system includes robust error handling:

- If cache invalidation fails, the language change still proceeds
- All errors are logged to the console
- The UI shows loading states during language changes
- Components can handle language change failures gracefully

## Performance Considerations

- **Stale Time**: Queries use appropriate stale times (2-10 minutes) to avoid unnecessary refetching
- **Selective Invalidation**: Only relevant queries are invalidated
- **Critical Queries**: Important queries are refetched immediately
- **Background Refetching**: Non-critical queries are refetched in the background

## Debugging

### Console Logs

The system provides detailed logging:

```
Language changed to ar, all queries invalidated for refetch
Language changed to ar, refetching data...
```

### React Query DevTools

Use React Query DevTools to see:

- Which queries are being invalidated
- Query refetch status
- Cache state changes

### Manual Testing

1. Open browser dev tools
2. Change language in the UI
3. Watch console for logs
4. Check React Query DevTools for query invalidation
5. Verify data is refreshed in your components

## Migration Guide

### From Old System

If you were previously using `invalidateCaching()`:

```typescript
// OLD
import { invalidateCaching } from 'src/actions/cache-invalidation';

const handleChangeLang = (newLang: string) => {
  onChangeLang(newLang);
  invalidateCaching(); // This only revalidates Next.js paths
};

// NEW
import { useLanguageContext } from 'src/contexts/language-context';

const { onLanguageChange } = useLanguageContext();

const handleChangeLang = async (newLang: string) => {
  await onLanguageChange(newLang); // This invalidates React Query + changes language
};
```

### Benefits of New System

1. **Automatic**: No manual cache invalidation needed
2. **Comprehensive**: Covers all query types
3. **Performance**: Only invalidates relevant queries
4. **Error Handling**: Graceful fallbacks
5. **Type Safety**: Full TypeScript support
6. **Debugging**: Better logging and monitoring

## Troubleshooting

### Common Issues

1. **Data not refreshing**: Check if your component uses the language context
2. **Performance issues**: Verify query stale times are appropriate
3. **Error messages**: Check console for detailed error logs

### Debug Steps

1. Verify `LanguageProvider` is in the component tree
2. Check that queries use the correct key patterns
3. Ensure components are wrapped in the language context
4. Monitor React Query DevTools for query invalidation

## Support

For issues or questions:

1. Check the console logs
2. Review React Query DevTools
3. Verify component integration
4. Check the query key patterns
