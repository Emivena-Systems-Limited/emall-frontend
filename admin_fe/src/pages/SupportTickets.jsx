import { useMemo, useState } from 'react'
import { Ticket } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import EmptyState from '../components/dashboard/EmptyState'
import OrderPagination from '../components/orders/OrderPagination'
import TicketListItem, { TicketThread } from '../components/support/SupportInbox'
import SupportPageHeader from '../components/support/SupportPageHeader'
import SupportSummaryCards from '../components/support/SupportSummaryCards'
import SupportToolbar from '../components/support/SupportToolbar'
import { TICKETS_PAGE_SIZE } from '../constants/supportTickets'
import { SAMPLE_TICKETS } from '../constants/supportTicketsData'
import notify from '../lib/notify'
import {
  appendTicketReply,
  closeTicket,
  computeTicketSummary,
  filterTickets,
  markTicketRead,
  paginateTickets,
  sortTicketsByUpdated,
} from '../utils/supportTicketUtils'

export default function SupportTickets() {
  const [sampleEnabled, setSampleEnabled] = useState(false)
  const [tickets, setTickets] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [pageState, setPageState] = useState({ key: '', page: 1 })
  const filterKey = `${search}\0${categoryFilter}`
  const page = pageState.key === filterKey ? pageState.page : 1

  const setPage = (nextPage) => {
    setPageState({ key: filterKey, page: nextPage })
  }

  const summary = useMemo(() => computeTicketSummary(tickets), [tickets])
  const hasTickets = tickets.length > 0
  const filtered = useMemo(
    () => filterTickets(tickets, { search, categoryFilter }),
    [tickets, search, categoryFilter],
  )
  const sorted = useMemo(() => sortTicketsByUpdated(filtered), [filtered])
  const pagination = useMemo(
    () => paginateTickets(sorted, { page, pageSize: TICKETS_PAGE_SIZE }),
    [sorted, page],
  )
  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? null,
    [tickets, selectedId],
  )
  const hasActiveFilters = search.trim() !== '' || categoryFilter !== 'all'

  const handleSelect = (ticket) => {
    setSelectedId(ticket.id)
    setDraft('')
    if (ticket.unreadCount > 0) {
      setTickets((current) => markTicketRead(current, ticket.id))
    }
  }

  const handleSend = (ticket, text) => {
    setTickets((current) => appendTicketReply(current, ticket.id, text))
    setDraft('')
    notify.success('Reply sent.')
  }

  const handleClose = (ticket) => {
    setTickets((current) => closeTicket(current, ticket.id))
    setDraft('')
    notify.success('Request closed.')
  }

  const handleSampleChange = (enabled) => {
    setSampleEnabled(enabled)
    setTickets(enabled ? SAMPLE_TICKETS : [])
    setSelectedId(null)
    setDraft('')
    setSearch('')
    setCategoryFilter('all')
    setPageState({ key: '\0all', page: 1 })
    notify.info(enabled ? 'Loaded sample customer tickets.' : 'Cleared customer tickets.')
  }

  return (
    <DashboardLayout pageTitle="Customer tickets">
      <div className="page-enter space-y-6">
        <SupportPageHeader
          summary={summary}
          sampleEnabled={sampleEnabled}
          onSampleChange={handleSampleChange}
        />

        {hasTickets && <SupportSummaryCards summary={summary} />}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          {!hasTickets ? (
            <EmptyState
              icon={Ticket}
              title="No customer tickets yet"
              description="When a shopper submits a support request, it will show up here with their topic, order number, and message."
              action={(
                <button
                  type="button"
                  onClick={() => handleSampleChange(true)}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Preview sample tickets
                </button>
              )}
            />
          ) : (
            <>
              <div className="border-b border-slate-100 px-5 py-4">
                <SupportToolbar
                  search={search}
                  onSearchChange={setSearch}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={setCategoryFilter}
                  onClearFilters={() => {
                    setSearch('')
                    setCategoryFilter('all')
                  }}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>

              {sorted.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="No tickets match this view"
                  description="Try another status, or search by customer, ticket reference, or order number."
                  compact
                />
              ) : (
                <div className="grid min-h-[520px] lg:grid-cols-[minmax(280px,340px)_1fr]">
                  <div className="flex max-h-[600px] flex-col border-b border-slate-100 lg:border-r lg:border-b-0">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      {pagination.items.map((ticket) => (
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
                      pageCount={pagination.pageCount}
                      totalItems={pagination.totalItems}
                      startIndex={pagination.startIndex}
                      endIndex={pagination.endIndex}
                      onPageChange={setPage}
                      itemLabel="tickets"
                      compact
                    />
                  </div>

                  <TicketThread
                    ticket={selectedTicket}
                    onSend={handleSend}
                    onClose={handleClose}
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
