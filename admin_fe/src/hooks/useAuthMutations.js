import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import {
  loginAdmin,
  logoutAdmin,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from '../services/authService'
import { logout } from '../store/slices/authSlice'
import { persistor } from '../store/store'
import { queryClient } from '../lib/queryClient'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'

function getLoginErrorMessage(error) {
  const { message } = parseApiError(error, '')
  const normalized = String(message).toLowerCase()

  if (normalized.includes('resource not found')) {
    return 'No operator account found with this email.'
  }

  if (normalized.includes('invalid') || normalized.includes('credentials') || normalized.includes('unauthor')) {
    return 'Email or password is incorrect.'
  }

  return message || null
}

export function useLoginAdminMutation() {
  return useMutation({
    mutationKey: ['admin-auth', 'login'],
    mutationFn: loginAdmin,
    onError: (error) => {
      const friendlyMessage = getLoginErrorMessage(error)
      notify.error(friendlyMessage || 'Unable to sign in. Please try again.')
    },
  })
}

function getResetOtpErrorMessage(error) {
  const { message } = parseApiError(error, '')
  const normalized = String(message).toLowerCase()

  if (normalized.includes('resource not found')) {
    return 'No operator account found with this email.'
  }

  return message || null
}

export function useRequestPasswordResetOtpMutation() {
  return useMutation({
    mutationKey: ['admin-auth', 'forgot-password-request'],
    mutationFn: ({ email }) => requestPasswordResetOtp(email),
    onError: (error) => {
      notify.error(getResetOtpErrorMessage(error) || 'Could not send a reset code. Please try again.')
    },
  })
}

export function useResetPasswordWithOtpMutation() {
  return useMutation({
    mutationKey: ['admin-auth', 'reset-password'],
    mutationFn: resetPasswordWithOtp,
    onError: (error) => {
      notify.fromError(error, 'Could not reset password. Check the code and try again.')
    },
  })
}

export function useLogoutAdminMutation() {
  const dispatch = useDispatch()

  return useMutation({
    mutationKey: ['admin-auth', 'logout'],
    mutationFn: async () => {
      try {
        return await logoutAdmin()
      } catch {
        return true
      }
    },
    onSuccess: () => notify.success('Signed out successfully'),
    onSettled: async () => {
      dispatch(logout())
      queryClient.clear()
      persistor.persist()
    },
  })
}
