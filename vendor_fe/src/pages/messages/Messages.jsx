import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import OrderPagination from '../../components/orders/OrderPagination'
import ConversationListItem, { ConversationThread } from '../../components/messages/MessagesInbox'
import MessagesPageHeader from '../../components/messages/MessagesPageHeader'
import MessagesSummaryCards from '../../components/messages/MessagesSummaryCards'
import MessagesToolbar from '../../components/messages/MessagesToolbar'
import { MESSAGES_PAGE_SIZE, SORT_DIRECTIONS, SORT_FIELDS } from '../../constants/messages'
import {
  DEV_CONVERSATIONS,
  MOCK_CONVERSATIONS,
} from '../../constants/messagesData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import notify from '../../lib/notify'
import {
  appendMessage,
  computeMessagesSummary,
  filterConversations,
  markConversationRead,
  paginateItems,
  sortConversations,
  updateConversationStatus,
} from '../../utils/messageUtils'

export default function Messages() {
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState('')

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)

  const summary = useMemo(() => computeMessagesSummary(conversations), [conversations])
  const hasConversations = conversations.length > 0

  const filtered = useMemo(
    () => filterConversations(conversations, { search, categoryFilter }),
    [conversations, search, categoryFilter],
  )

  const sorted = useMemo(
    () => sortConversations(filtered, SORT_FIELDS.updated, SORT_DIRECTIONS.desc),
    [filtered],
  )

  const pagination = useMemo(
    () => paginateItems(sorted, { page, pageSize: MESSAGES_PAGE_SIZE }),
    [sorted, page],
  )

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  const hasActiveFilters = search.trim() !== '' || categoryFilter !== 'all'

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter])

  const handleSelect = (conversation) => {
    setSelectedId(conversation.id)
    setDraft('')
    if (conversation.unreadCount > 0) {
      setConversations((current) => markConversationRead(current, conversation.id))
    }
  }

  const handleSend = (conversation, text) => {
    setConversations((current) => appendMessage(current, conversation.id, text))
    setDraft('')
    notify.success('Reply sent.')
  }

  const handleResolve = (conversation) => {
    setConversations((current) => updateConversationStatus(current, conversation.id, 'resolved'))
    notify.success('Conversation marked as resolved.')
  }

  const handleArchive = (conversation) => {
    setConversations((current) => updateConversationStatus(current, conversation.id, 'archived'))
    if (selectedId === conversation.id) setSelectedId(null)
    notify.info('Conversation archived.')
  }

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    setConversations(enabled ? DEV_CONVERSATIONS : [])
    setSelectedId(null)
    setDraft('')
    setSearch('')
    setCategoryFilter('all')
    setPage(1)
    notify.info(enabled ? 'Loaded dummy message data.' : 'Cleared message data.')
  }

  const emptyPreset = hasActiveFilters && hasConversations
    ? EMPTY_STATE_PRESETS.messagesFiltered
    : EMPTY_STATE_PRESETS.messages

  return (
    <DashboardLayout pageTitle="Messages">
      <div className="page-enter space-y-6">
        <MessagesPageHeader
          summary={summary}
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
        />

        {hasConversations && <MessagesSummaryCards summary={summary} />}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          {!hasConversations ? (
            <EmptyState
              icon={emptyPreset.icon}
              title={emptyPreset.title}
              description={emptyPreset.description}
            />
          ) : (
            <>
              <div className="border-b border-slate-100 px-5 py-4">
                <MessagesToolbar
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
                  icon={EMPTY_STATE_PRESETS.messagesFiltered.icon}
                  title={EMPTY_STATE_PRESETS.messagesFiltered.title}
                  description={EMPTY_STATE_PRESETS.messagesFiltered.description}
                  compact
                />
              ) : (
                <div className="grid min-h-[520px] lg:grid-cols-[minmax(280px,340px)_1fr]">
                  <div className="flex max-h-[600px] flex-col border-b border-slate-100 lg:border-b-0 lg:border-r">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      {pagination.items.map((conversation) => (
                        <ConversationListItem
                          key={conversation.id}
                          conversation={conversation}
                          active={selectedId === conversation.id}
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
                      itemLabel="conversations"
                      compact
                    />
                  </div>

                  <ConversationThread
                    conversation={selectedConversation}
                    onSend={handleSend}
                    onResolve={handleResolve}
                    onArchive={handleArchive}
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
