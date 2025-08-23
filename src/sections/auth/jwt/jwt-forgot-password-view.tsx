'use client';

import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Card, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/app/auth/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
import TextField from '@mui/material/TextField';
import AuthFooter from 'src/components/auth-footer';
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

type Step = 'email' | 'otp' | 'password';

interface EmailFormData {
  email: string;
}

interface OtpFormData {
  otp: string;
}

interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export default function JwtForgotPasswordView() {
  const { t } = useTranslate();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [canResendOtp, setCanResendOtp] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      // Clear any existing timers
      setResendCountdown(0);
      setCanResendOtp(true);
    },
    []
  );

  // Step 1: Email validation schema
  const EmailSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Invalid email format'),
  });

  // Step 2: OTP validation schema
  const OtpSchema = Yup.object().shape({
    otp: Yup.string().required('OTP is required').length(6, 'OTP must be 6 digits'),
  });

  // Step 3: Password validation schema
  const PasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one special character'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const emailMethods = useForm<EmailFormData>({
    resolver: yupResolver(EmailSchema),
    defaultValues: { email: '' },
  });

  const otpMethods = useForm<OtpFormData>({
    resolver: yupResolver(OtpSchema),
    defaultValues: { otp: '' },
  });

  const passwordMethods = useForm<PasswordFormData>({
    resolver: yupResolver(PasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // Step 1: Send OTP
  const handleSendOtp = async (data: EmailFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(endpoints.auth.requestResetPassword, {
        Email: data.email,
      });

      if (response.data.IsSuccess) {
        setEmail(data.email);
        sessionStorage.setItem('reset_email', data.email);
        setCurrentStep('otp');

        // Start countdown for resend OTP
        setCanResendOtp(false);
        setResendCountdown(60);
        const timer = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              setCanResendOtp(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(
          response.data.Error?.Message || response.data.Error?.message || 'Failed to send OTP'
        );
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(
        err?.response?.data?.Error?.Message ||
          err?.response?.data?.Error?.message ||
          'Failed to send OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (data: OtpFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(endpoints.auth.verifyResetOtp, {
        Email: email,
        Otp: data.otp,
      });

      if (response.data.IsSuccess) {
        const responseToken = response.data.Data.Token;
        setToken(responseToken);
        sessionStorage.setItem('reset_token', responseToken);
        setCurrentStep('password');
      } else {
        setError(response.data.Error?.Message || response.data.Error?.message || 'Invalid OTP');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(
        err?.response?.data?.Error?.Message ||
          err?.Error?.Message ||
          'Failed to verify OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(endpoints.auth.resetPassword, {
        Email: email,
        Token: token,
        NewPassword: data.newPassword,
      });

      if (response.data.IsSuccess) {
        // Clear session storage
        sessionStorage.removeItem('reset_email');
        sessionStorage.removeItem('reset_token');

        // Show success message
        setSuccess('Password reset successfully! Redirecting to login...');

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push(paths.auth.jwt.login);
        }, 2000);
      } else {
        setError(
          response.data.Error?.Message || response.data.Error?.message || 'Failed to reset password'
        );
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(
        err?.response?.data?.Error?.Message ||
          err?.response?.data?.Error?.message ||
          'Failed to reset password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep('email');
    setError('');
    setSuccess('');
  };

  const handleBackToOtp = () => {
    setCurrentStep('otp');
    setError('');
    setSuccess('');
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(endpoints.auth.requestResetPassword, {
        Email: email,
      });

      if (response.data.IsSuccess) {
        setCanResendOtp(false);
        setResendCountdown(60);
        const timer = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              setCanResendOtp(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(
          response.data.Error?.Message || response.data.Error?.message || 'Failed to resend OTP'
        );
      }
    } catch (err: any) {
      setError(err?.Error?.Message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHead = (
    <Stack spacing={1} sx={{ mb: 3, mx: 'auto', position: 'relative', textAlign: 'center' }}>
      <Box
        sx={{
          mx: 'auto',
          mb: 2,
        }}
      >
        <Image
          src="/assets/images/auth/reset-password.svg"
          alt="Reset Password Icon"
          width={100}
          height={100}
        />
      </Box>
      <Typography
        sx={{
          color: '#000000',
          fontFamily: 'Inter Tight',
          fontWeight: 600,
          fontStyle: 'normal',
          fontSize: '24px',
          lineHeight: '130%',
          letterSpacing: '0%',
          textAlign: 'center',
        }}
      >
        Forgot Password
      </Typography>
      <Typography
        sx={{
          color: '#6B7280',
          fontFamily: 'Inter Tight',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '16px',
          lineHeight: '150%',
          letterSpacing: '2%',
          textAlign: 'center',
        }}
      >
        {currentStep === 'email' && "Enter your registered email and we'll send you a reset code"}
        {currentStep === 'otp' && 'Enter the 6-digit code sent to your email'}
        {currentStep === 'password' && 'Enter your new password'}
      </Typography>
    </Stack>
  );

  const renderStepIndicator = (
    <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: 'center' }}>
      {['email', 'otp', 'password'].map((step, index) => (
        <Box
          key={step}
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: currentStep === step ? 'primary.main' : 'grey.300',
            border: currentStep === step ? '2px solid' : 'none',
            borderColor: 'primary.main',
          }}
        />
      ))}
    </Stack>
  );

  const renderEmailStep = (
    <Stack spacing={2.5} sx={{ minWidth: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          sx={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            fontStyle: 'Medium',
            fontSize: 14,
            lineHeight: '150%',
            letterSpacing: '2%',
            color: '#666D80',
            mx: 0.5,
          }}
        >
          Email
        </Typography>
        <RHFTextField
          name="email"
          placeholder="example@domain.com"
          error={!!emailMethods.formState.errors.email}
          helperText={emailMethods.formState.errors.email?.message}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-error fieldset': {
                borderColor: 'red',
              },
            },
            '& .MuiFormHelperText-root.Mui-error': {
              color: 'red',
            },
          }}
        />
      </Box>

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isLoading}
      >
        Send OTP
      </LoadingButton>
    </Stack>
  );

  const renderOtpStep = (
    <Stack spacing={2.5} sx={{ minWidth: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          sx={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            fontStyle: 'Medium',
            fontSize: 14,
            lineHeight: '150%',
            letterSpacing: '2%',
            color: '#666D80',
            mx: 0.5,
          }}
        >
          OTP Code
        </Typography>
        <TextField
          fullWidth
          type="text"
          placeholder="Enter 6-digit code"
          value={otpMethods.watch('otp') || ''}
          onChange={(e) => otpMethods.setValue('otp', e.target.value)}
          error={!!otpMethods.formState.errors.otp}
          helperText={otpMethods.formState.errors.otp?.message}
          autoComplete="one-time-code"
          inputProps={{ maxLength: 6 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-error fieldset': {
                borderColor: 'red',
              },
            },
            '& .MuiFormHelperText-root.Mui-error': {
              color: 'red',
            },
          }}
        />
      </Box>

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isLoading}
      >
        Verify OTP
      </LoadingButton>

      {/* <LoadingButton
        fullWidth
        color="primary"
        size="large"
        variant="outlined"
        onClick={handleBackToEmail}
        disabled={isLoading}
      >
        Back to Email
      </LoadingButton> */}

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Didn&apos;t receive the code?
        </Typography>
        <LoadingButton
          variant="text"
          color="primary"
          onClick={handleResendOtp}
          disabled={!canResendOtp || isLoading}
          loading={isLoading}
        >
          {canResendOtp ? 'Resend OTP' : `Resend in ${resendCountdown}s`}
        </LoadingButton>
      </Box>
    </Stack>
  );

  const renderPasswordStep = (
    <Stack spacing={2.5} sx={{ minWidth: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          sx={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            fontStyle: 'Medium',
            fontSize: 14,
            lineHeight: '150%',
            letterSpacing: '2%',
            color: '#666D80',
            mx: 0.5,
          }}
        >
          New Password
        </Typography>
        <RHFTextField
          name="newPassword"
          type="password"
          placeholder="Enter new password"
          error={!!passwordMethods.formState.errors.newPassword}
          helperText={passwordMethods.formState.errors.newPassword?.message}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-error fieldset': {
                borderColor: 'red',
              },
            },
            '& .MuiFormHelperText-root.Mui-error': {
              color: 'red',
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          sx={{
            fontFamily: 'Inter Tight',
            fontWeight: 500,
            fontStyle: 'Medium',
            fontSize: 14,
            lineHeight: '150%',
            letterSpacing: '2%',
            color: '#666D80',
            mx: 0.5,
          }}
        >
          Confirm Password
        </Typography>
        <RHFTextField
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          error={!!passwordMethods.formState.errors.confirmPassword}
          helperText={passwordMethods.formState.errors.confirmPassword?.message}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-error fieldset': {
                borderColor: 'red',
              },
            },
            '& .MuiFormHelperText-root.Mui-error': {
              color: 'red',
            },
          }}
        />
      </Box>

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isLoading}
      >
        Reset Password
      </LoadingButton>

      {/* <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        variant="outlined"
        onClick={handleBackToOtp}
        disabled={isLoading}
      >
        Back to OTP
      </LoadingButton> */}
    </Stack>
  );

  const renderForm = () => {
    switch (currentStep) {
      case 'email':
        return (
          <FormProvider methods={emailMethods} onSubmit={emailMethods.handleSubmit(handleSendOtp)}>
            {renderEmailStep}
          </FormProvider>
        );
      case 'otp':
        return (
          <FormProvider methods={otpMethods} onSubmit={otpMethods.handleSubmit(handleVerifyOtp)}>
            {renderOtpStep}
          </FormProvider>
        );
      case 'password':
        return (
          <FormProvider
            methods={passwordMethods}
            onSubmit={passwordMethods.handleSubmit(handleResetPassword)}
          >
            {renderPasswordStep}
          </FormProvider>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        <Card
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '500px',
            minHeight: '55dvh',
            bgcolor: 'white',
            p: 4,
            mb: 8,
          }}
        >
          {renderHead}
          {/* {renderStepIndicator} */}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {renderForm()}

          <Link
            component={RouterLink}
            href={paths.auth.jwt.login}
            variant="subtitle2"
            color="primary"
            sx={{
              alignItems: 'center',
              display: 'inline-flex',
              justifyContent: 'center',
              textDecoration: 'none',
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: '8px',
              py: 1.5,
              mt: 2,
              '&:hover': {
                textDecoration: 'none',
              },
            }}
          >
            Back to Login
          </Link>
        </Card>
      </Box>

      <AuthFooter />
    </>
  );
}
