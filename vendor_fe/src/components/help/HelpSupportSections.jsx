import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, CheckCircle2, ChevronDown, Clock, Headphones, Mail, Package, Phone, Rocket, Star, Wallet, X } from 'lucide-react'
import DevDataToggle from '../dev/DevDataToggle'
import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import {
  PLATFORM_CONTACT,
  PLATFORM_FAQ,
  GETTING_STARTED_STEPS,
  QUICK_HELP_LINKS,
  TICKET_CATEGORIES,
} from '../../constants/helpSupport'
import {
  formatRelativeDate,
  formatTicketDate,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from '../../utils/helpSupportUtils'
const quickIcons = { rocket: Rocket, package: Package, wallet: Wallet, star: Star }

const statusTone = {
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const priorityTone = {
  slate: 'text-slate-500',
  sky: 'text-sky-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
}

export function HelpPageHeader({ summary, devDataEnabled, onDevDataChange, onNewTicket }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Help & Support</h1>
        <p className="mt-1 text-sm text-slate-500">
          Get help from the e-mall platform team, browse FAQs, and track your support tickets.
        </p>
        {summary.open > 0 && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-amber-100">
            {summary.open} open ticket{summary.open === 1 ? '' : 's'}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DevDataToggle
          enabled={devDataEnabled}
          onChange={onDevDataChange}
          count={summary.total}
          ariaLabel="Toggle dummy support tickets"
        />
        <button
          type="button"
          onClick={onNewTicket}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800"
        >
          <Headphones className="size-4" />
          Contact support
        </button>
      </div>
    </div>
  )
}

export function HelpSummaryCards({ summary }) {
  const cards = [
    { key: 'total', label: 'Total tickets', helper: 'All time', icon: Headphones, accent: 'text-sky-700', bg: 'bg-sky-50', ring: 'ring-sky-100' },
    { key: 'open', label: 'Open', helper: 'Needs attention', icon: Clock, accent: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-100' },
    { key: 'awaitingReply', label: 'Awaiting reply', helper: 'Platform responded', icon: Mail, accent: 'text-violet-700', bg: 'bg-violet-50', ring: 'ring-violet-100' },
    { key: 'resolved', label: 'Resolved', helper: 'Closed tickets', icon: CheckCircle2, accent: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map(({ key, label, helper, icon: Icon, accent, bg, ring }) => (
        <article key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">{summary[key] ?? 0}</p>
            </div>
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${bg} ${accent} ring-1 ${ring}`}>
              <Icon className="size-4" strokeWidth={2} />
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{helper}</p>
        </article>
      ))}
    </div>
  )
}

export function PlatformContactCard({ onNewTicket }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-[0_16px_45px_rgba(15,23,42,0.12)]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <Headphones className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-bold">Platform support</h2>
          <p className="mt-0.5 text-xs text-white/70">Our vendor success team is here to help</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2.5">
        <li className="flex items-start gap-2.5 text-sm">
          <Mail className="mt-0.5 size-4 shrink-0 text-white/60" />
          <a href={`mailto:${PLATFORM_CONTACT.email}`} className="break-all font-medium hover:underline">{PLATFORM_CONTACT.email}</a>
        </li>
        <li className="flex items-center gap-2.5 text-sm">
          <Phone className="size-4 shrink-0 text-white/60" />
          <span>{PLATFORM_CONTACT.phone}</span>
        </li>
        <li className="flex items-start gap-2.5 text-sm">
          <Clock className="mt-0.5 size-4 shrink-0 text-white/60" />
          <span>{PLATFORM_CONTACT.hours}</span>
        </li>
      </ul>
      <p className="mt-3 text-[11px] text-white/50">Typical response: {PLATFORM_CONTACT.responseTime}</p>
      {onNewTicket && (
        <button
          type="button"
          onClick={onNewTicket}
          className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-white/90"
        >
          <Headphones className="size-4" />
          Open a ticket
        </button>
      )}
    </section>
  )
}

export function QuickHelpGrid({ onOpenGuide }) {
  const navigate = useNavigate()

  const handleClick = (link) => {
    if (link.action === 'guide') {
      onOpenGuide?.()
      return
    }
    if (link.action === 'route' && link.to) {
      navigate(link.to)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Quick help</h2>
        <p className="mt-0.5 text-sm text-slate-500">Common topics to get you unstuck fast</p>
      </div>
      <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_HELP_LINKS.map((link) => {
          const Icon = quickIcons[link.icon] ?? Rocket
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => handleClick(link)}
              className="group cursor-pointer bg-white p-5 text-left transition-colors hover:bg-brand-light/20"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-light text-brand ring-1 ring-brand-muted transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="size-4" />
              </span>
              <p className="mt-3 text-sm font-bold text-slate-900">{link.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{link.description}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                {link.action === 'guide' ? 'Open guide' : 'Go to page'}
                <ArrowRight className="size-3" />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function GettingStartedGuide({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex justify-end">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-pointer bg-slate-900/40 backdrop-blur-[2px]" />
      <div className="slide-in-right relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Getting started</h2>
            <p className="mt-0.5 text-xs text-slate-500">Set up your store in 5 steps</p>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>
        <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {GETTING_STARTED_STEPS.map((item) => (
            <li key={item.step} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {item.step}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
                  <Link
                    to={item.link}
                    onClick={onClose}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    {item.linkLabel}
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <CheckCircle2 className="size-4" />
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function HelpFaqSection() {
  const [openId, setOpenId] = useState(null)
  const midpoint = Math.ceil(PLATFORM_FAQ.length / 2)
  const columns = [PLATFORM_FAQ.slice(0, midpoint), PLATFORM_FAQ.slice(midpoint)]

  const renderFaqItem = (faq) => {
    const open = openId === faq.id
    return (
      <li key={faq.id} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/40">
        <button
          type="button"
          onClick={() => setOpenId(open ? null : faq.id)}
          className="flex w-full cursor-pointer items-start justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
        >
          <span className="text-sm font-semibold text-slate-800">{faq.question}</span>
          <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="border-t border-slate-100 bg-white px-4 py-3">
            <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
          </div>
        )}
      </li>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Frequently asked questions</h2>
        <p className="mt-0.5 text-sm text-slate-500">Quick answers from the e-mall vendor team</p>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-2">
        {columns.map((column, index) => (
          <ul key={index} className="space-y-3">
            {column.map(renderFaqItem)}
          </ul>
        ))}
      </div>
    </section>
  )
}

function TicketRow({ ticket, active, onSelect }) {
  const status = TICKET_STATUS[ticket.status] ?? TICKET_STATUS.open
  const priority = TICKET_PRIORITY[ticket.priority] ?? TICKET_PRIORITY.normal

  return (
    <button
      type="button"
      onClick={() => onSelect(ticket)}
      className={`w-full cursor-pointer border-b border-slate-100 px-5 py-4 text-left transition-colors last:border-b-0 ${
        active ? 'bg-brand-light/40' : 'hover:bg-slate-50/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{ticket.subject}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{ticket.preview}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusTone[status.tone]}`}>
              {status.label}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {TICKET_CATEGORIES[ticket.category]}
            </span>
            <span className={`text-[10px] font-bold ${priorityTone[priority.tone]}`}>
              {priority.label}
            </span>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-medium text-slate-400">
          {formatRelativeDate(ticket.updatedAt)}
        </span>
      </div>
    </button>
  )
}

export function SupportTicketsPanel({ tickets, hasTickets, selectedTicket, onSelect, onReply }) {
  const [draft, setDraft] = useState('')

  if (!hasTickets) {
    const preset = EMPTY_STATE_PRESETS.supportTickets
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Your support tickets</h2>
          <p className="mt-0.5 text-sm text-slate-500">Track conversations with the platform team</p>
        </div>
        <EmptyState icon={preset.icon} title={preset.title} description={preset.description} />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your support tickets</h2>
            <p className="mt-0.5 text-sm text-slate-500">Select a ticket to view the conversation</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            {tickets.length} ticket{tickets.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="grid min-h-[480px] lg:grid-cols-[minmax(280px,340px)_1fr]">
        <div className="flex max-h-[520px] flex-col border-b border-slate-100 lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tickets.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                active={selectedTicket?.id === ticket.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>

        {!selectedTicket ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center bg-slate-50/40 p-8 text-center lg:min-h-0">
            <span className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-white text-slate-300 ring-1 ring-slate-200">
              <Headphones className="size-6" strokeWidth={1.5} />
            </span>
            <p className="text-sm font-semibold text-slate-600">Select a ticket</p>
            <p className="mt-1 max-w-xs text-xs text-slate-400">
              View the conversation and reply to platform support
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-col lg:min-h-[280px]">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm font-bold text-slate-900">{selectedTicket.subject}</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Opened {formatTicketDate(selectedTicket.createdAt)} · {TICKET_CATEGORIES[selectedTicket.category]}
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {(selectedTicket.messages || []).map((msg) => {
                const isVendor = msg.sender === 'vendor'
                return (
                  <div key={msg.id} className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isVendor ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md bg-slate-100 text-slate-800'}`}>
                      {!isVendor && (
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Platform support</p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {selectedTicket.status !== 'closed' && (
              <div className="border-t border-slate-100 p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (draft.trim()) {
                      onReply(selectedTicket, draft.trim())
                      setDraft('')
                    }
                  }}
                  className="flex gap-2"
                >
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Reply to platform support..."
                    rows={2}
                    className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="shrink-0 cursor-pointer self-end rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export function NewTicketModal({ open, onClose, onSubmit }) {
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('other')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')

  useEffect(() => {
    if (!open) {
      setSubject('')
      setCategory('other')
      setMessage('')
      setPriority('normal')
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-pointer bg-slate-900/40 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Contact platform support</h2>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!subject.trim() || !message.trim()) return
            onSubmit({ subject, category, message, priority })
            onClose()
          }}
          className="space-y-4 p-5"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
              >
                {Object.entries(TICKET_CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
              >
                {Object.entries(TICKET_PRIORITY).map(([key, p]) => (
                  <option key={key} value={key}>{p.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={4}
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
              required
            />
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 cursor-pointer rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
              Submit ticket
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
