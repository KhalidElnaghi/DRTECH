# Forgot Password Flow Implementation

This document describes the implementation of the three-step forgot password flow in the DRTECH application.

## Overview

The forgot password flow consists of three sequential steps:

1. **Email Input** - User enters their email address
2. **OTP Verification** - User enters the 6-digit OTP sent to their email
3. **Password Reset** - User sets a new password

## API Endpoints

### Step 1: Request Reset Password

- **Endpoint**: `POST /auth/request-reset-password`
- **Body**:
  ```json
  {
    "Email": "user@example.com"
  }
  ```
- **Purpose**: Sends a 6-digit OTP to the user's email address

### Step 2: Verify Reset OTP

- **Endpoint**: `POST /auth/verify-reset-otp`
- **Body**:
  ```json
  {
    "Email": "user@example.com",
    "Otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "Data": {
      "Token": "CfDJ8FTC4hl9WI1HrQpMrc4XGBsjhBGQ2+FHDar7ZDECtMf0DxV2EEyh36FAlEKypsfXsC2YPZiNcYN7Xyt1nU9agIjsCc0cg/j2VNy+mEvKoblsvJSYhOPGQUw0VTHteKJGZ8O3qCU+zmcteopOJmgh+k0h5jjk/fLsptZY/ecyqziXRtN2/PMbzcHUpt1g53gEjQ=="
    },
    "IsSuccess": true,
    "StatusCode": 200,
    "Error": {
      "Message": ""
    }
  }
  ```
- **Purpose**: Verifies the OTP and returns a token for password reset

### Step 3: Reset Password

- **Endpoint**: `POST /auth/reset-password`
- **Body**:
  ```json
  {
    "Email": "user@example.com",
    "Token": "CfDJ8FTC4hl9WI1HrQpMrc4XGBsjhBGQ2+FHDar7ZDECtMf0DxV2EEyh36FAlEKypsfXsC2YPZiNcYN7Xyt1nU9agIjsCc0cg/j2VNy+mEvKoblsvJSYhOPGQUw0VTHteKJGZ8O3qCU+zmcteopOJmgh+k0h5jjk/fLsptZY/ecyqziXRtN2YPZiNcYN7Xyt1nU9agIjsCc0cg/j2VNy+mEvKoblsvJSYhOPGQUw0VTHteKJGZ8O3qCU+zmcteopOJmgh+k0h5jjk/fLsptZY/ecyqziXRtN2/PMbzcHUpt1g53gEjQ==",
    "NewPassword": "newPassword123"
  }
  ```
- **Purpose**: Resets the user's password using the verified token

## State Management

### Session Storage

The flow uses `sessionStorage` to persist data between steps:

- `reset_email`: Stores the user's email address
- `reset_token`: Stores the verification token from step 2

### Component State

- `currentStep`: Tracks the current step ('email', 'otp', 'password')
- `email`: Stores the email address for use in subsequent steps
- `token`: Stores the verification token
- `isLoading`: Manages loading states during API calls
- `error`: Displays error messages to the user

## User Experience Features

### Step Indicators

- Visual progress indicators show the user's current position in the flow
- Each step is represented by a circular indicator

### Navigation

- Users can navigate back to previous steps
- Back buttons are available in steps 2 and 3
- Users can return to login at any time

### Validation

- **Email**: Required field with email format validation
- **OTP**: Required 6-digit code validation
- **Password**: Minimum 8 characters with confirmation matching

### Error Handling

- Comprehensive error handling for all API calls
- User-friendly error messages displayed in alert components
- Error state clearing when navigating between steps

## Security Considerations

1. **Token Storage**: Verification tokens are stored in sessionStorage (cleared after use)
2. **Email Persistence**: Email is stored in sessionStorage for the duration of the flow
3. **Session Cleanup**: All stored data is cleared after successful password reset
4. **Input Validation**: Client-side validation prevents invalid data submission

## File Structure

- **Component**: `src/sections/auth/jwt/jwt-forgot-password-view.tsx`
- **Endpoints**: `src/utils/axios.ts` (endpoints.auth.\*)
- **Routes**: `src/routes/paths.ts` (paths.auth.jwt.forgot)

## Usage

The forgot password flow is accessible via the route `/auth/jwt/forgot-password` and integrates seamlessly with the existing authentication system.

## Dependencies

- React Hook Form for form management
- Yup for validation schemas
- Material-UI components for the interface
- Axios for API communication
- Next.js routing for navigation
