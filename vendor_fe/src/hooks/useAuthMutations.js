import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import {
  loginVendor,
  logoutVendor,
  registerVendor,
  requestPasswordResetOtp,
  resendPasswordResetOtp,
  resendVendorOtp,
  resetPasswordWithOtp,
  verifyVendorOtp,
} from '../services/authService'
import { logout } from '../store/slices/authSlice'
import { persistor } from '../store/store'
import notify from '../lib/notify'

export function useRegisterVendorMutation({ suppressErrorToast = false } = {}) {
  return useMutation({
    mutationKey: ['vendor-auth', 'register'],
    mutationFn: registerVendor,
    onError: (error) => {
      if (!suppressErrorToast) {
        notify.fromError(error, 'Could not create vendor account')
      }
    },
  })
}

export function useLoginVendorMutation() {
  return useMutation({
    mutationKey: ['vendor-auth', 'login'],
    mutationFn: loginVendor,
    onError: (error) => notify.fromError(error, 'Invalid email or password'),
  })
}

export function useVerifyVendorOtpMutation() {
  return useMutation({
    mutationKey: ['vendor-auth', 'verify-otp'],
    mutationFn: verifyVendorOtp,
    onError: (error) => notify.fromError(error, 'Verification failed. Please check your code.'),
  })
}

export function useResendVendorOtpMutation() {
  return useMutation({
    mutationKey: ['vendor-auth', 'resend-otp'],
    mutationFn: resendVendorOtp,
    onError: (error) => notify.fromError(error, 'Could not resend verification code'),
  })
}

export function useRequestPasswordResetOtpMutation() {
  return useMutation({
    mutationKey: ['vendor-auth', 'forgot-password-request'],
    mutationFn: requestPasswordResetOtp,
    onError: (error) => notify.fromError(error, 'Could not send reset code'),
  })
}

export function useResetPasswordWithOtpMutation() {
  return useMutation({
    mutationKey: ['vendor-auth', 'reset-password'],
    mutationFn: resetPasswordWithOtp,
    onError: (error) => notify.fromError(error, 'Could not reset password. Check your code and try again.'),
  })
}

export function useResendPasswordResetOtpMutation() {
  return useMutation({
    mutationKey: ['vendor-auth', 'resend-password-reset-otp'],
    mutationFn: resendPasswordResetOtp,
    onError: (error) => notify.fromError(error, 'Could not resend reset code'),
  })
}

export function useLogoutVendorMutation() {
  const dispatch = useDispatch()

  return useMutation({
    mutationKey: ['vendor-auth', 'logout'],
    mutationFn: logoutVendor,
    onSuccess: () => notify.success('Signed out successfully'),
    onError: (error) => notify.fromError(error, 'Could not sign out'),
    onSettled: () => {
      dispatch(logout())
      persistor.persist()
    },
  })
}
