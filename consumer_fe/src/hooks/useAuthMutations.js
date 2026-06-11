import { useMutation } from '@tanstack/react-query'
import {
  registerUser,
  logoutUser,
  requestOtp,
  resendOtp,
  verifyOtp,
} from '../services/authService'

export function useRegisterUserMutation() {
  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: registerUser,
  })
}

export function useRequestOtpMutation() {
  return useMutation({
    mutationKey: ['auth', 'otp', 'request'],
    mutationFn: requestOtp,
  })
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationKey: ['auth', 'otp', 'verify'],
    mutationFn: verifyOtp,
  })
}

export function useResendOtpMutation() {
  return useMutation({
    mutationKey: ['auth', 'otp', 'resend'],
    mutationFn: resendOtp,
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: logoutUser,
  })
}
