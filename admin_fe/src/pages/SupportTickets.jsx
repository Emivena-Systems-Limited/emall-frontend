import { useMemo, useState } from 'react'
import { Ticket } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import EmptyState from '../components/dashboard/EmptyState'
import OrderPagination from '../components/orders/OrderPagination'
import TicketListItem, { TicketThread } from '../components/support/SupportInbox'
import SupportPageHeader from '../components/support/SupportPageHeader'
import SupportSummaryCards from '../components/support/SupportSummaryCards'
import SupportToolbar from '../components/support/SupportToolbar'
import { toSupportTicketStatusParam } from '../constants/supportTickets'
import { useAdminSupportTickets, useCloseSupportTicket, useReplyToSupportTicket } from '../hooks/useAdminSupportTickets'
import notify from '../lib/notify'
import { parseApiError } from '../utils/parseApiError'
import {
  computeTicketSummary,
  markTicketRead,
} from '../utils/supportTicketUtils'

function ticketMatchesSearch(ticket, search) {
  const query = search.trim().toLowerCase()
  if (!query) return true
  return [
    ticket.customerName,
    ticket.subject,
    ticket.topic,
    ticket.preview,
    ticket.orderNumber,
    ticket.ticketNumber,
  ].some((value) => String(value ?? '').toLowerCase().includes(query))
}

function TicketListSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading customer tickets">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3.5">
          <div className="skeleton-shimmer size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton-shimmer h-3.5 w-32 rounded-md" />
            <div className="skeleton-shimmer h-3 w-48 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SupportTickets() {
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const status = toSupportTicketStatusParam(categoryFilter)
  const {
    tickets,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    patchTickets,
  } = useAdminSupportTickets({ status, page })
  const replyMutation = useReplyToSupportTicket()
  const closeMutation = useCloseSupportTicket()

  const visibleTickets = useMemo(() => {
    return tickets.filter((ticket) => ticketMatchesSearch(ticket, search))
  }, [tickets, search])

  const summary = useMemo(() => {
    const fromPage = computeTicketSummary(tickets)
    return {
      ...fromPage,
      totalConversations: pagination.total || fromPage.totalConversations,
    }
  }, [tickets, pagination.total])

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? null,
    [tickets, selectedId],
  )
  const hasActiveFilters = search.trim() !== '' || categoryFilter !== 'all'
  const hasTickets = pagination.total > 0 || tickets.length > 0

  const handleFilterChange = (nextFilter) => {
    setCategoryFilter(nextFilter)
    setPage(1)
    setSelectedId(null)
  }

  const handleSelect = (ticket) => {
    setSelectedId(ticket.id)
    setDraft('')
    if (ticket.unreadCount > 0) {
      patchTickets((current) => markTicketRead(current, ticket.id))
    }
  }

  const handleSend = async (ticket, text) => {
    try {
      await replyMutation.mutateAsync({ ticketId: ticket.id, message: text })
      setDraft('')
      notify.success('Reply sent.')
    } catch (replyError) {
      notify.error(parseApiError(replyError, 'Could not send this reply.').message)
    }
  }

  const handleClose = async (ticket) => {
    try {
      await closeMutation.mutateAsync({ ticketId: ticket.id })
      setDraft('')
      notify.success('Request closed.')
    } catch (closeError) {
      notify.error(parseApiError(closeError, 'Could not close this request.').message)
    }
  }

  return (
    <DashboardLayout pageTitle="Customer tickets">
      <div className="page-enter space-y-6">
        <SupportPageHeader summary={summary} />

        {hasTickets && <SupportSummaryCards summary={summary} />}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          {isLoading ? (
            <TicketListSkeleton />
          ) : isError ? (
            <EmptyState
              icon={Ticket}
              title="Could not load customer tickets"
              description={parseApiError(error, 'Support requests are unavailable right now.').message}
              action={(
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Try again
                </button>
              )}
            />
          ) : !hasTickets ? (
            <EmptyState
              icon={Ticket}
              title="No customer tickets yet"
              description="When a shopper submits a support request, it will show up here with their topic, order number, and message."
            />
          ) : (
            <>
              <div className="border-b border-slate-100 px-5 py-4">
                <SupportToolbar
                  search={search}
                  onSearchChange={setSearch}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={handleFilterChange}
                  onClearFilters={() => {
                    setSearch('')
                    handleFilterChange('all')
                  }}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>

              {visibleTickets.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="No tickets match this view"
                  description="Try another status, or search by customer, ticket reference, or order number."
                  compact
                />
              ) : (
                <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr]">
                  <div className="flex flex-col border-b border-slate-100 lg:border-r lg:border-b-0">
                    <div>
                      {visibleTickets.map((ticket) => (
                        <TicketListItem
                          key={ticket.id}
                          ticket={ticket}
                          active={selectedId === ticket.id}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                    <OrderPagination
                      page={pagination.page}
                      pageCount={pagination.lastPage}
                      totalItems={pagination.total}
                      startIndex={pagination.from}
                      endIndex={pagination.to}
                      onPageChange={setPage}
                      itemLabel="tickets"
                      compact
                    />
                  </div>

                  <TicketThread
                    ticket={selectedTicket}
                    onSend={handleSend}
                    onClose={handleClose}
                    isSending={replyMutation.isPending}
                    isClosing={closeMutation.isPending}
                    draft={draft}
                    onDraftChange={setDraft}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
