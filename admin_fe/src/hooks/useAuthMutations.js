import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { queryClient } from '../lib/queryClient'

export function useLogoutAdminMutation() {
  const dispatch = useDispatch()

  return useMutation({
    mutationKey: ['admin-auth', 'logout'],
    mutationFn: async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 420))
      return true
    },
    onSettled: async () => {
      dispatch(logout())
      queryClient.clear()
    },
  })
}
