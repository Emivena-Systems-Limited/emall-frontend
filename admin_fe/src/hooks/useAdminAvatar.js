import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { removeAdminAvatar, uploadAdminAvatar } from '../services/avatarService'
import { updateUser } from '../store/slices/authSlice'

export function useAdminAvatar() {
  const dispatch = useDispatch()

  const uploadMutation = useMutation({
    mutationKey: ['admin-avatar', 'upload'],
    mutationFn: uploadAdminAvatar,
    onSuccess: (data) => {
      dispatch(updateUser({ avatar_url: data?.avatar_url ?? null }))
    },
  })

  const removeMutation = useMutation({
    mutationKey: ['admin-avatar', 'remove'],
    mutationFn: removeAdminAvatar,
    onSuccess: () => {
      dispatch(updateUser({ avatar_url: null }))
    },
  })

  return {
    uploadAvatar: (file) => uploadMutation.mutateAsync(file),
    removeAvatar: () => removeMutation.mutateAsync(),
    isUploadingAvatar: uploadMutation.isPending,
    isRemovingAvatar: removeMutation.isPending,
  }
}
