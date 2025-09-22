# Authentication Storage Solution

## Overview

This solution implements a "Remember Me" functionality that stores authentication data appropriately based on user preference while ensuring compatibility with both client-side and server-side operations.

## How It Works

### Storage Strategy

1. **Remember Me Checked**:
   - Stores in cookies with 7-day expiration (persistent)
   - Server actions can access these cookies

2. **Remember Me Unchecked**:
   - Stores ONLY in sessionStorage (not in cookies)
   - Server actions won't be able to access these tokens
   - Use client-side functions for API calls in this case

### Key Files Modified

#### 1. `src/auth/context/jwt/auth-provider.tsx`

- Updated login function to handle storage based on rememberMe parameter
- When Remember Me is checked: stores in persistent cookies (7 days)
- When Remember Me is unchecked: stores ONLY in sessionStorage

#### 2. `src/utils/auth-storage.ts` (NEW)

- Utility functions to get tokens from appropriate storage
- `getAccessToken()`: Gets token from cookies or sessionStorage
- `getUserData()`: Gets user data from cookies or sessionStorage
- `getAuthHeaders()`: Returns authorization headers for API calls

#### 3. `src/utils/client-actions.ts` (NEW)

- Client-side API functions that use the storage utilities
- Can be used in client components when you need to make API calls
- Automatically gets tokens from the appropriate storage location

## Usage

### ⚠️ Important Limitation

**Server Actions Limitation**: When "Remember Me" is unchecked, tokens are stored only in sessionStorage, which server actions cannot access. In this case:

- Server actions will not have access to the authentication token
- You must use client-side API functions instead
- Consider showing appropriate UI feedback when server actions fail due to missing tokens

### For Server Actions (Works only when Remember Me is checked)

Server actions work when Remember Me was checked during login:

```typescript
// src/actions/doctors.ts
const accessToken = cookies().get('access_token')?.value;
// This will be null if user logged in without "Remember Me"
```

### For Client Components

Use the new utility functions or client actions:

```typescript
import { getAccessToken, getAuthHeaders } from 'src/utils/auth-storage';
import { fetchDoctorsClient } from 'src/utils/client-actions';

// Get token directly
const token = getAccessToken();

// Get headers for API calls
const headers = getAuthHeaders();

// Use client-side API functions
const doctors = await fetchDoctorsClient({ page: 1 });
```

### In React Query Hooks

Update your existing hooks to use the new utilities:

```typescript
import { getAuthHeaders } from 'src/utils/auth-storage';

export const useDoctors = (params: DoctorParams) =>
  useQuery({
    queryKey: ['doctors', params],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const response = await axiosInstance.get(endpoints.doctors.fetch, {
        params,
        headers,
      });
      return response.data;
    },
  });
```

## Benefits

1. **Server Action Compatibility**: Server actions continue to work without changes
2. **Flexible Storage**: Tokens stored appropriately based on user preference
3. **Consistent API**: Same interface for getting tokens regardless of storage location
4. **Future-Proof**: Easy to extend or modify storage strategy
5. **Type Safety**: Full TypeScript support

## Migration Guide

### Existing Server Actions

No changes needed - they continue to work with cookies.

### Existing Client-Side API Calls

Replace direct cookie access with utility functions:

```typescript
// Before
const token = Cookie.get('access_token');

// After
import { getAccessToken } from 'src/utils/auth-storage';
const token = getAccessToken();
```

### React Query Hooks

Update to use `getAuthHeaders()` for consistent header generation:

```typescript
// Before
const token = Cookie.get('access_token');
const lang = Cookie.get('Language');
const headers = {
  Authorization: `Bearer ${token}`,
  'Accept-Language': lang,
};

// After
import { getAuthHeaders } from 'src/utils/auth-storage';
const headers = getAuthHeaders();
```
