import { useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  changeAdminPassword,
  updateAdminNotificationPreferences,
  updateAdminProfile,
} from '../services/profileService'
import { logoutAdmin } from '../services/authService'
import { logout, updateUser, applyProfile } from '../store/slices/authSlice'
import { persistor } from '../store/store'
import { queryClient } from '../lib/queryClient'
import { hydrateAdminProfile } from '../utils/profileUtils'
import { markPasswordChanged } from '../utils/passwordChangeSession'

export function useAdminProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user: authUser } = useSelector((state) => state.auth)
  const user = useMemo(() => hydrateAdminProfile(authUser), [authUser])

  const applyUserPatch = (patch) => {
    if (patch && typeof patch === 'object') dispatch(updateUser(patch))
  }

  const updateProfileMutation = useMutation({
    mutationKey: ['admin-profile', 'update'],
    mutationFn: updateAdminProfile,
    onSuccess: (data) => {
      dispatch(applyProfile({
        user: data?.user,
        applicationToken: data?.applicationToken,
      }))
      persistor.persist()
    },
  })

  const changePasswordMutation = useMutation({
    mutationKey: ['admin-profile', 'password'],
    mutationFn: changeAdminPassword,
    onSuccess: async () => {
      markPasswordChanged()

      try {
        await logoutAdmin()
      } catch {
        /* local session is still cleared so the operator can sign in again */
      }

      dispatch(logout())
      queryClient.clear()
      await persistor.flush()
      navigate('/login', { replace: true, state: { passwordReset: true } })
    },
  })

  const updateNotificationsMutation = useMutation({
    mutationKey: ['admin-profile', 'notifications'],
    mutationFn: updateAdminNotificationPreferences,
    onSuccess: (data) => applyUserPatch(data?.user),
  })

  return {
    user,
    updateProfile: (payload) => updateProfileMutation.mutateAsync(payload),
    changePassword: (payload) => changePasswordMutation.mutateAsync(payload),
    updateNotifications: (payload) => updateNotificationsMutation.mutateAsync(payload),
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isUpdatingNotifications: updateNotificationsMutation.isPending,
  }
}
