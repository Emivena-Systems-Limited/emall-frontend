import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import {
  GettingStartedGuide,
  HelpFaqSection,
  HelpPageHeader,
  HelpSummaryCards,
  NewTicketModal,
  PlatformContactCard,
  QuickHelpGrid,
  SupportTicketsPanel,
} from '../../components/help/HelpSupportSections'
import { DEV_SUPPORT_TICKETS, MOCK_SUPPORT_TICKETS } from '../../constants/helpSupportData'
import notify from '../../lib/notify'
import {
  appendTicketReply,
  computeTicketsSummary,
  createSupportTicket,
  filterTickets,
} from '../../utils/helpSupportUtils'

export default function HelpSupport() {
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [tickets, setTickets] = useState(MOCK_SUPPORT_TICKETS)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [statusFilter] = useState('all')
  const [search] = useState('')

  const summary = useMemo(() => computeTicketsSummary(tickets), [tickets])
  const hasTickets = tickets.length > 0

  const filteredTickets = useMemo(
    () => filterTickets(tickets, { search, statusFilter }),
    [tickets, search, statusFilter],
  )

  const selected = useMemo(
    () => tickets.find((t) => t.id === selectedTicket?.id) ?? selectedTicket,
    [tickets, selectedTicket],
  )

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    setTickets(enabled ? DEV_SUPPORT_TICKETS : [])
    setSelectedTicket(null)
    notify.info(enabled ? 'Loaded dummy support tickets.' : 'Cleared support tickets.')
  }

  const handleNewTicket = (data) => {
    const ticket = createSupportTicket(data)
    setTickets((current) => [ticket, ...current])
    setSelectedTicket(ticket)
    notify.success('Support ticket submitted. We\'ll respond within 24 business hours.')
  }

  const handleReply = (ticket, text) => {
    setTickets((current) => appendTicketReply(current, ticket.id, text))
    notify.success('Reply sent to platform support.')
  }

  useEffect(() => {
    if (selectedTicket && !tickets.find((t) => t.id === selectedTicket.id)) {
      setSelectedTicket(null)
    }
  }, [tickets, selectedTicket])

  return (
    <DashboardLayout pageTitle="Help & Support">
      <div className="page-enter space-y-6">
        <HelpPageHeader
          summary={summary}
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
          onNewTicket={() => setNewTicketOpen(true)}
        />

        <QuickHelpGrid onOpenGuide={() => setGuideOpen(true)} />

        {hasTickets && <HelpSummaryCards summary={summary} />}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <SupportTicketsPanel
            tickets={filteredTickets}
            hasTickets={hasTickets}
            selectedTicket={selected}
            onSelect={setSelectedTicket}
            onReply={handleReply}
          />

          <aside className="space-y-4 lg:sticky lg:top-6">
            <PlatformContactCard onNewTicket={() => setNewTicketOpen(true)} />
          </aside>
        </div>

        <HelpFaqSection />
      </div>

      <GettingStartedGuide open={guideOpen} onClose={() => setGuideOpen(false)} />

      <NewTicketModal
        open={newTicketOpen}
        onClose={() => setNewTicketOpen(false)}
        onSubmit={handleNewTicket}
      />
    </DashboardLayout>
  )
}
