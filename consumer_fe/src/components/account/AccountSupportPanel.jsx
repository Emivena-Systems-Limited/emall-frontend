import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Package,
  RotateCcw,
  Search,
  Send,
  X,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import AccountSectionShell from './AccountSectionShell'
import {
  createSupportTicket,
  closeSupportTicket,
  getSupportFaqs,
  getSupportTicket,
  getSupportTickets,
  getSupportTopics,
  replyToSupportTicket,
} from '../../services/supportService'

const fallbackTopics = [
  { label: 'Orders & delivery', description: 'Track an order or resolve a delivery issue.', icon: Package },
  { label: 'Returns & refunds', description: 'Get help with a return or refund status.', icon: RotateCcw },
  { label: 'Payments', description: 'Payment, checkout, and transaction support.', icon: ShieldCheck },
  { label: 'Products & stores', description: 'Questions about products, sellers, or stock.', icon: ShoppingBag },
]

const fallbackFaqs = [
  {
    question: 'How can I track my order?',
    answer: 'Open Orders from your account, select the order, and choose Track order to view its latest delivery update.',
    keywords: 'orders delivery tracking package',
  },
  {
    question: 'How do I request a return or refund?',
    answer: 'Go to Returns & Refunds, choose an eligible order item, and follow the steps to submit your request.',
    keywords: 'returns refunds money item',
  },
  {
    question: 'What should I do if my payment fails?',
    answer: 'Confirm your payment details and available balance, then try again. If the charge appears but the order does not, contact support with the transaction reference.',
    keywords: 'payment checkout transaction failed charged',
  },
  {
    question: 'How do I update my delivery address?',
    answer: 'Open Addresses in your account to add, edit, or select a default delivery address.',
    keywords: 'address location delivery update',
  },
  {
    question: 'How can I contact a store?',
    answer: 'Open the store page and use the Contact option shown beside the store information.',
    keywords: 'seller vendor shop store contact',
  },
]

function TopicCard({ topic, onSelect }) {
  const Icon = topic.icon ?? CircleHelp
  return (
    <button
      type="button"
      onClick={() => onSelect(topic)}
      className="group flex min-h-32 flex-col items-start rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-auth-primary/25 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-auth-primary">
        <Icon className="size-4.5" />
      </span>
      <strong className="mt-4 text-sm text-slate-950">{topic.label}</strong>
      <span className="mt-1 text-xs leading-5 text-slate-500">{topic.description}</span>
    </button>
  )
}

function formatTicketDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function getTicketId(ticket) {
  return ticket?.id ?? ticket?.ticket_id ?? ticket?.uuid ?? ticket?.ticket_number ?? ticket?.reference
}

function TicketConversation({ ticketId, onDismiss }) {
  const queryClient = useQueryClient()
  const [replyError, setReplyError] = useState('')
  const detailQuery = useQuery({
    queryKey: ['support', 'ticket', ticketId],
    queryFn: () => getSupportTicket(ticketId),
    enabled: Boolean(ticketId),
    retry: false,
  })
  const ticket = detailQuery.data?.ticket ?? detailQuery.data ?? {}
  const replies = ticket.replies ?? ticket.messages ?? []
  const originalMessage = ticket.message ?? ticket.description ?? 'Support request submitted.'
  const visibleReplies = replies.filter((reply, index) => index !== 0 || (reply.message ?? reply.body ?? reply.content) !== originalMessage)
  const isClosed = String(ticket.status ?? '').toLowerCase() === 'closed'
  const replyMutation = useMutation({
    mutationFn: (message) => replyToSupportTicket(ticketId, message),
    onSuccess: () => {
      setReplyError('')
      queryClient.invalidateQueries({ queryKey: ['support', 'ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] })
    },
    onError: (error) => setReplyError(error.response?.data?.reason || error.response?.data?.message || error.message || 'Unable to send your reply.'),
  })
  const closeMutation = useMutation({
    mutationFn: () => closeSupportTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] })
    },
  })

  function submitReply(event) {
    event.preventDefault()
    const form = event.currentTarget
    const message = new FormData(form).get('reply')?.trim()
    if (!message) return
    replyMutation.mutate(message, { onSuccess: () => form.reset() })
  }

  return (
    <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/30 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-auth-primary">Ticket conversation</p>
          <h4 className="mt-1 text-base font-bold text-slate-950">{ticket.topic?.name ?? ticket.subject ?? 'Support request'}</h4>
          <p className="mt-1 text-xs text-slate-500">{ticket.ticket_number ?? ticket.reference ?? ticketId}{formatTicketDate(ticket.created_at) ? ` · ${formatTicketDate(ticket.created_at)}` : ''}</p>
        </div>
        <button type="button" onClick={onDismiss} aria-label="Close ticket details" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900"><X className="size-4" /></button>
      </div>

      {detailQuery.isPending ? <p className="mt-5 text-sm text-slate-500">Loading conversation…</p> : detailQuery.isError ? <p className="mt-5 rounded-xl bg-white p-4 text-sm text-red-700">We couldn’t load this ticket. Please try again.</p> : (
        <>
          <div className="mt-5 space-y-3">
            <article className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-auth-primary px-4 py-3 text-white">
              <p className="text-[0.68rem] font-bold uppercase tracking-wide text-white/65">You</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{originalMessage}</p>
            </article>
            {visibleReplies.map((reply, index) => {
              const senderType = String(reply.sender_type ?? reply.author_type ?? reply.role ?? '').toLowerCase()
              const fromCustomer = reply.is_customer === true || ['customer', 'user'].includes(senderType)
              return <article key={reply.id ?? index} className={`max-w-[90%] rounded-2xl px-4 py-3 ${fromCustomer ? 'ml-auto rounded-br-md bg-auth-primary text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}><p className={`text-[0.68rem] font-bold uppercase tracking-wide ${fromCustomer ? 'text-white/65' : 'text-auth-primary'}`}>{fromCustomer ? 'You' : 'Support team'}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{reply.message ?? reply.body ?? reply.content}</p>{formatTicketDate(reply.created_at) ? <p className={`mt-2 text-[0.65rem] ${fromCustomer ? 'text-white/60' : 'text-slate-400'}`}>{formatTicketDate(reply.created_at)}</p> : null}</article>
            })}
            {!visibleReplies.length ? <p className="py-3 text-center text-xs text-slate-500">No reply from the support team yet. We’ll show it here when they respond.</p> : null}
          </div>

          {isClosed ? <p className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-center text-xs font-semibold text-slate-600">This request is closed.</p> : (
            <form onSubmit={submitReply} className="mt-5 border-t border-red-100 pt-4">
              <label className="text-xs font-bold text-slate-700">Add a reply
                <textarea name="reply" required minLength={2} rows={3} placeholder="Write a message to the support team" className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-auth-primary" />
              </label>
              {replyError ? <p role="alert" className="mt-2 text-xs font-medium text-red-700">{replyError}</p> : null}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending} className="text-xs font-bold text-slate-500 hover:text-auth-primary disabled:opacity-50">{closeMutation.isPending ? 'Closing…' : 'Close request'}</button>
                <button type="submit" disabled={replyMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-auth-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"><Send className="size-3.5" />{replyMutation.isPending ? 'Sending…' : 'Send reply'}</button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}

export default function AccountSupportPanel() {
  const [query, setQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(0)
  const [submittedTicket, setSubmittedTicket] = useState(null)
  const [formError, setFormError] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const queryClient = useQueryClient()
  const topicsQuery = useQuery({ queryKey: ['support', 'topics'], queryFn: getSupportTopics, staleTime: 300000 })
  const faqsQuery = useQuery({
    queryKey: ['support', 'faqs', query],
    queryFn: () => getSupportFaqs({ search: query.trim() || undefined }),
    staleTime: 60000,
  })
  const ticketsQuery = useQuery({ queryKey: ['support', 'tickets'], queryFn: () => getSupportTickets(), retry: false })
  const apiTopics = topicsQuery.data ?? []
  const supportTopics = apiTopics.length
    ? apiTopics.map((topic) => ({ ...topic, label: topic.name ?? topic.label ?? topic.title, description: topic.description ?? 'Get help from our support team.' }))
    : fallbackTopics
  const apiFaqs = faqsQuery.data?.faqs ?? []
  const sourceFaqs = apiFaqs.length
    ? apiFaqs.map((faq) => ({ ...faq, question: faq.question ?? faq.title, answer: faq.answer ?? faq.content, keywords: faq.keywords ?? '' }))
    : fallbackFaqs
  const filteredFaqs = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle || apiFaqs.length) return sourceFaqs
    return sourceFaqs.filter((faq) => `${faq.question} ${faq.answer} ${faq.keywords}`.toLowerCase().includes(needle))
  }, [apiFaqs.length, query, sourceFaqs])
  const createTicketMutation = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: (ticket) => {
      setSubmittedTicket(ticket)
      setFormError('')
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] })
    },
    onError: (error) => setFormError(error.response?.data?.reason || error.response?.data?.message || error.message || 'Unable to submit your request.'),
  })
  const tickets = ticketsQuery.data?.tickets ?? []

  function selectTopic(topic) {
    setQuery(topic.label)
    document.getElementById('support-topic')?.focus()
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const form = new FormData(event.currentTarget)
    const topicId = form.get('topic_id')
    if (!topicId) {
      setFormError('Support topics have not been configured yet. Please contact support by email.')
      return
    }
    createTicketMutation.mutate({
      topic_id: topicId,
      order_number: form.get('order_number')?.trim() || undefined,
      message: form.get('message')?.trim(),
    })
  }

  return (
    <AccountSectionShell
      eyebrow="Customer care"
      title="Help & Support"
      description="Find quick answers or send a message to our support team."
      icon={CircleHelp}
    >
      <section className="relative overflow-hidden rounded-2xl bg-auth-primary px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[28px] border-white/10" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">How can we help?</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Get the answer you need</h3>
          <p className="mt-2 text-sm leading-6 text-white/75">Search common questions or choose a support topic below.</p>
          <label className="relative mt-5 block">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help articles and questions"
              className="h-12 w-full rounded-xl border-0 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none ring-1 ring-white/20 placeholder:text-slate-400 focus:ring-2 focus:ring-white/50"
            />
          </label>
        </div>
      </section>

      <section className="mt-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Browse help</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">What do you need help with?</h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {supportTopics.slice(0, 4).map((topic) => <TopicCard key={topic.id ?? topic.label} topic={topic} onSelect={selectTopic} />)}
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Quick answers</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">Frequently asked questions</h3>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-[0.68rem] font-bold text-auth-primary">{filteredFaqs.length} answers</span>
          </div>
          <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
            {filteredFaqs.length ? filteredFaqs.map((faq) => {
              const index = sourceFaqs.indexOf(faq)
              const open = openFaq === index
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold text-slate-900"
                  >
                    {faq.question}
                    <ChevronDown className={`size-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180 text-auth-primary' : ''}`} />
                  </button>
                  {open ? <p className="max-w-2xl pb-4 pr-8 text-sm leading-6 text-slate-500">{faq.answer}</p> : null}
                </div>
              )
            }) : (
              <div className="py-10 text-center">
                <Search className="mx-auto size-6 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-800">No matching answers</p>
                <p className="mt-1 text-xs text-slate-500">Try a different phrase or send us a message.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5 sm:p-6">
          {submittedTicket ? (
            <div className="flex min-h-[23rem] flex-col items-center justify-center text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-auth-primary shadow-sm"><CircleCheck className="size-6" /></span>
              <h3 className="mt-4 text-lg font-bold text-slate-950">Request submitted</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Our support team has received your message{(submittedTicket.ticket_number || submittedTicket.reference) ? ` (${submittedTicket.ticket_number ?? submittedTicket.reference})` : ''}.</p>
              <button type="button" onClick={() => setSubmittedTicket(null)} className="mt-5 text-sm font-bold text-auth-primary hover:underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Contact support</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">Send us a message</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">Tell us what happened and we’ll help you find the next step.</p>
              <label className="mt-5 block text-xs font-bold text-slate-700">Topic
                <select id="support-topic" name="topic_id" required defaultValue="" disabled={!apiTopics.length} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-auth-primary disabled:bg-slate-100">
                  <option value="" disabled>{topicsQuery.isPending ? 'Loading topics…' : apiTopics.length ? 'Select a topic' : 'Topics are not available yet'}</option>
                  {apiTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name ?? topic.label ?? topic.title}</option>)}
                </select>
              </label>
              <label className="mt-4 block text-xs font-bold text-slate-700">Order number <span className="font-normal text-slate-400">(optional)</span>
                <input name="order_number" placeholder="e.g. ORD-20483" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-auth-primary" />
              </label>
              <label className="mt-4 block text-xs font-bold text-slate-700">How can we help?
                <textarea name="message" required minLength={10} rows={4} placeholder="Describe your issue" className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-auth-primary" />
              </label>
              {formError ? <p role="alert" className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-medium text-red-700">{formError}</p> : null}
              <button type="submit" disabled={createTicketMutation.isPending || !apiTopics.length} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-auth-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
                <Send className="size-4" /> {createTicketMutation.isPending ? 'Submitting…' : 'Submit request'}
              </button>
            </form>
          )}
        </section>
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Your requests</p>
        <h3 className="mt-1 text-lg font-bold text-slate-950">Support history</h3>
        {ticketsQuery.isPending ? <p className="mt-4 text-sm text-slate-500">Loading your requests…</p> : ticketsQuery.isError ? <p className="mt-4 text-sm text-slate-500">We couldn’t load your support history right now.</p> : tickets.length ? (
          <div className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
            {tickets.map((ticket) => {
              const ticketId = getTicketId(ticket)
              return <button type="button" key={ticketId} onClick={() => setSelectedTicketId(ticketId)} disabled={!ticketId} className="group flex w-full items-center justify-between gap-4 py-4 text-left disabled:cursor-not-allowed"><div><p className="text-sm font-bold text-slate-900 group-hover:text-auth-primary">{ticket.subject ?? ticket.topic?.name ?? 'Support request'}</p><p className="mt-1 text-xs text-slate-500">{ticket.ticket_number ?? ticket.reference ?? ticketId}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-[0.68rem] font-bold capitalize text-slate-600">{ticket.status ?? 'open'}</span><ChevronRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-auth-primary" /></div></button>
            })}
          </div>
        ) : <p className="mt-4 text-sm text-slate-500">You haven’t submitted any support requests yet.</p>}
        {selectedTicketId ? <TicketConversation ticketId={selectedTicketId} onDismiss={() => setSelectedTicketId(null)} /> : null}
      </section>
    </AccountSectionShell>
  )
}
