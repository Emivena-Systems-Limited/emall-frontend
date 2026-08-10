import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deactivateUser,
  getUsers,
  inviteUser,
  reactivateUser,
  removeUser,
  resendInvitation,
  updateUser,
  updateUserPermissions,
  updateUserRole,
} from '../services/userService'

const STALE_TIME = 60 * 1000

export const userQueryKeys = {
  all: ['vendor-users'],
  list: () => [...userQueryKeys.all, 'list'],
  detail: (userId) => [...userQueryKeys.all, 'detail', userId],
}

export function useUsers() {
  return useQuery({
    queryKey: userQueryKeys.list(),
    queryFn: getUsers,
    staleTime: STALE_TIME,
  })
}

function useInvalidateUsers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
}

export function useInviteUserMutation() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: inviteUser, onSuccess: invalidate })
}

export function useUpdateUserMutation() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ userId, data }) => updateUser(userId, data),
    onSuccess: invalidate,
  })
}

export function useUpdateUserRoleMutation() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: invalidate,
  })
}

export function useUpdateUserPermissionsMutation() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ userId, permissions }) => updateUserPermissions(userId, permissions),
    onSuccess: invalidate,
  })
}

export function useDeactivateUserMutation() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: deactivateUser, onSuccess: invalidate })
}

export function useReactivateUserMutation() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: reactivateUser, onSuccess: invalidate })
}

export function useRemoveUserMutation() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: removeUser, onSuccess: invalidate })
}

export function useResendInvitationMutation() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: resendInvitation, onSuccess: invalidate })
}
