import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TICKETS_PAGE_SIZE } from '../constants/supportTickets'
import { closeAdminSupportTicket, fetchAdminSupportTickets, replyToAdminSupportTicket } from '../services/adminSupportService'
import { emptySupportTicketPagination } from '../utils/normalizeAdminSupportTickets'
import { appendTicketMessage, closeTicket } from '../utils/supportTicketUtils'

export const ADMIN_SUPPORT_TICKETS_QUERY_KEY = ['admin-support-tickets']

const STALE_TIME = 60 * 1000

export function supportTicketsQueryKey({ status = '', page = 1 } = {}) {
  return [...ADMIN_SUPPORT_TICKETS_QUERY_KEY, status ?? '', page, TICKETS_PAGE_SIZE]
}

export function useAdminSupportTickets({ status = '', page = 1 } = {}) {
  const queryClient = useQueryClient()
  const queryKey = supportTicketsQueryKey({ status, page })
  const query = useQuery({
    queryKey,
    queryFn: () => fetchAdminSupportTickets({ status, page, perPage: TICKETS_PAGE_SIZE }),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  })

  const patchTickets = (updater) => {
    queryClient.setQueryData(queryKey, (current) => {
      if (!current?.tickets) return current
      return { ...current, tickets: updater(current.tickets) }
    })
  }

  return {
    tickets: query.data?.tickets ?? [],
    pagination: query.data?.pagination ?? emptySupportTicketPagination(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    patchTickets,
  }
}

export function useReplyToSupportTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: replyToAdminSupportTicket,
    onSuccess: (reply, { ticketId, message }) => {
      const nextMessage = reply?.message ?? {
        id: '',
        sender: 'support',
        text: message,
        sentAt: new Date().toISOString(),
      }
      const nextTicketId = reply?.ticketId || ticketId

      queryClient.setQueriesData({ queryKey: ADMIN_SUPPORT_TICKETS_QUERY_KEY }, (current) => {
        if (!current?.tickets) return current
        return {
          ...current,
          tickets: appendTicketMessage(current.tickets, nextTicketId, nextMessage),
        }
      })
    },
  })
}

export function useCloseSupportTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: closeAdminSupportTicket,
    onSuccess: (_result, { ticketId }) => {
      queryClient.setQueriesData({ queryKey: ADMIN_SUPPORT_TICKETS_QUERY_KEY }, (current) => {
        if (!current?.tickets) return current
        return {
          ...current,
          tickets: closeTicket(current.tickets, ticketId),
        }
      })
    },
  })
}
