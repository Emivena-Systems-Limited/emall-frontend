import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import {
  cancelManagedNotification,
  createManagedNotification,
  deleteNotificationTemplate,
  fetchManagedNotification,
  fetchManagedNotifications,
  fetchManagedNotificationStats,
  fetchNotificationTemplates,
  resendManagedNotification,
  rescheduleManagedNotification,
  updateManagedNotification,
} from '../services/adminNotificationManagementService'

export const MANAGEMENT_KEY = ['admin-notification-management']

export function useManagedNotifications(filters) {
  return useQuery({
    queryKey: [...MANAGEMENT_KEY, 'list', filters],
    queryFn: () => fetchManagedNotifications(filters),
    placeholderData: keepPreviousData,
  })
}

export function useManagedNotificationStats() {
  return useQuery({ queryKey: [...MANAGEMENT_KEY, 'stats'], queryFn: fetchManagedNotificationStats })
}

export function useManagedNotification(id) {
  return useQuery({
    queryKey: [...MANAGEMENT_KEY, 'detail', id],
    queryFn: () => fetchManagedNotification(id),
    enabled: Boolean(id),
  })
}

export function useManagedNotificationTemplates() {
  return useQuery({
    queryKey: [...MANAGEMENT_KEY, 'templates'],
    queryFn: () => fetchNotificationTemplates(),
  })
}

function useAction(mutationFn, successMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MANAGEMENT_KEY })
      notify.success(successMessage)
    },
    onError: (error) => notify.error(parseApiError(error, 'The notification action failed.')),
  })
}

export function useCreateManagedNotification() {
  return useAction(createManagedNotification, 'Notification submitted successfully.')
}

export function useUpdateManagedNotification() {
  return useAction(updateManagedNotification, 'Scheduled notification updated.')
}

export function useRescheduleManagedNotification() {
  return useAction(rescheduleManagedNotification, 'Notification rescheduled.')
}

export function useCancelManagedNotification() {
  return useAction(cancelManagedNotification, 'Scheduled notification cancelled.')
}

export function useResendManagedNotification() {
  return useAction(resendManagedNotification, 'Failed notification queued again.')
}

export function useDeleteNotificationTemplate() {
  return useAction(deleteNotificationTemplate, 'Notification template removed.')
}
