import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteUserAvatar,
  deleteUserProfile,
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
} from '../services/profileService'
import { updateUser } from '../store/slices/authSlice'
import { notify } from '../lib/notify'
import { getProfile } from '../utils/accountProfile'

export function useAccountProfile() {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [avatarPreview, setAvatarPreview] = useState('')

  const profileQuery = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
    staleTime: 60_000,
    retry: 1,
  })

  const liveUser = useMemo(
    () => (profileQuery.data && typeof profileQuery.data === 'object' ? { ...user, ...profileQuery.data } : user),
    [profileQuery.data, user],
  )

  const profile = useMemo(() => getProfile(liveUser), [liveUser])

  const displayedProfile = useMemo(
    () => (avatarPreview ? { ...profile, photo: avatarPreview } : profile),
    [avatarPreview, profile],
  )

  useEffect(() => {
    if (profileQuery.data && typeof profileQuery.data === 'object') {
      dispatch(updateUser(profileQuery.data))
    }
  }, [dispatch, profileQuery.data])

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    },
    [avatarPreview],
  )

  const refreshProfile = async (updatedProfile, message) => {
    if (updatedProfile && typeof updatedProfile === 'object') {
      dispatch(updateUser(updatedProfile))
    }
    await queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    notify.success(message)
  }

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: async (data) => refreshProfile(data, 'Profile updated successfully'),
    onError: (error) => notify.fromError(error, 'Unable to update profile'),
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadUserAvatar,
    onSuccess: (data) => refreshProfile(data, 'Profile picture updated'),
    onError: (error) => {
      setAvatarPreview('')
      notify.fromError(error, 'Unable to upload profile picture')
    },
  })

  const deleteAvatarMutation = useMutation({
    mutationFn: deleteUserAvatar,
    onSuccess: (data) => {
      setAvatarPreview('')
      return refreshProfile(data, 'Profile picture removed')
    },
    onError: (error) => notify.fromError(error, 'Unable to remove profile picture'),
  })

  const deleteProfileMutation = useMutation({
    mutationFn: deleteUserProfile,
    onError: (error) => notify.fromError(error, 'Unable to delete account'),
  })

  const uploadAvatar = (file) => {
    setAvatarPreview(URL.createObjectURL(file))
    uploadAvatarMutation.mutate(file)
  }

  return {
    liveUser,
    profile,
    displayedProfile,
    isProfileLoading: profileQuery.isLoading,
    updateProfileMutation,
    uploadAvatarMutation,
    deleteAvatarMutation,
    deleteProfileMutation,
    uploadAvatar,
    removeAvatar: () => deleteAvatarMutation.mutate(),
    saveProfile: (payload) => updateProfileMutation.mutateAsync(payload),
    deleteProfile: () => deleteProfileMutation.mutateAsync(),
  }
}
