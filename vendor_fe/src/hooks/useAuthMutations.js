import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import {
  loginVendor,
  logoutVendor,
  registerVendor,
  resendVendorOtp,
  verifyVendorOtp,
} from '../services/authService'
import { logout } from '../store/slices/authSlice'
import { persistor } from '../store/store'
import notify from '../lib/notify'

export function useRegisterVendorMutation() {
  return useMutation({
    mutationKey: ['vendor-auth', 'register'],
    mutationFn: registerVendor,
    onError: (error) => notify.fromError(error, 'Could not create vendor account'),
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
