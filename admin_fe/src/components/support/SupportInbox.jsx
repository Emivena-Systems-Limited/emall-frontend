import { Link } from 'react-router'
import { CheckCircle2, ShoppingBag, Ticket } from 'lucide-react'
import { TICKET_STATUS } from '../../constants/supportTickets'
import { formatTicketDate, getInitials, isClosedTicket, isSupportSender } from '../../utils/supportTicketUtils'

const statusTone = {
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}

function TicketMeta({ ticket }) {
  return (
    <>
      {ticket.ticketNumber && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
          <Ticket className="size-3" />
          {ticket.ticketNumber}
        </span>
      )}
      {ticket.orderNumber && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
          <ShoppingBag className="size-3" />
          {ticket.orderNumber}
        </span>
      )}
    </>
  )
}

export default function TicketListItem({ ticket, active, onSelect }) {
  const status = TICKET_STATUS[ticket.status] ?? TICKET_STATUS.open
  const unread = ticket.unreadCount > 0

  return (
    <button
      type="button"
      onClick={() => onSelect(ticket)}
      className={`w-full cursor-pointer border-b border-slate-100 px-4 py-3.5 text-left transition-colors last:border-b-0 ${
        active ? 'bg-brand-light/60 ring-1 ring-brand/20 ring-inset' : 'bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            unread ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {getInitials(ticket.customerName)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`truncate text-sm ${unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
              {ticket.customerName}
            </p>
            <span className="shrink-0 text-[10px] font-medium text-slate-400 tabular-nums">
              {formatTicketDate(ticket.updatedAt)}
            </span>
          </div>

          <p className={`mt-0.5 truncate text-xs ${unread ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
            {ticket.subject}
          </p>
          <p className="mt-1 line-clamp-1 text-[11px] leading-snug text-slate-400">{ticket.preview}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusTone[status.tone]}`}>
              {status.label}
            </span>
            <TicketMeta ticket={ticket} />
            {unread && (
              <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                {ticket.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

export function TicketThread({ ticket, onSend, onClose, draft, onDraftChange }) {
  if (!ticket) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/50 p-8 text-center">
        <span className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-white text-slate-300 ring-1 ring-slate-200">
          <Ticket className="size-6" strokeWidth={1.5} />
        </span>
        <p className="text-sm font-semibold text-slate-600">Select a ticket</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">
          Open a request to read the customer’s message, reply, or close it.
        </p>
      </div>
    )
  }

  const closed = isClosedTicket(ticket)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-brand uppercase">
              {ticket.ticketNumber || 'Support request'}
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900">{ticket.topic || ticket.subject}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {ticket.customerName} · {ticket.customerEmail}
            </p>
            {ticket.orderNumber && (
              <div className="mt-2 flex flex-wrap gap-2">
                {ticket.orderId ? (
                  <Link
                    to={`/orders/${ticket.orderId}`}
                    className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                  >
                    <ShoppingBag className="size-3" />
                    {ticket.orderNumber}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 ring-1 ring-sky-100">
                    <ShoppingBag className="size-3" />
                    {ticket.orderNumber}
                  </span>
                )}
              </div>
            )}
          </div>

          {!closed && (
            <button
              type="button"
              onClick={() => onClose(ticket)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <CheckCircle2 className="size-3.5" />
              Close request
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {(ticket.messages || []).map((message) => {
          const fromSupport = isSupportSender(message.sender)

          if (message.sender === 'system') {
            return (
              <div key={message.id} className="flex justify-center">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500">
                  {message.text}
                </span>
              </div>
            )
          }

          return (
            <div key={message.id} className={`flex ${fromSupport ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  fromSupport
                    ? 'rounded-br-md bg-brand text-white'
                    : 'rounded-bl-md bg-slate-100 text-slate-800'
                }`}
              >
                <p className={`text-[10px] font-bold tracking-wide uppercase ${fromSupport ? 'text-white/70' : 'text-slate-400'}`}>
                  {fromSupport ? 'Support' : 'Customer'}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{message.text}</p>
                <p className={`mt-1 text-[10px] ${fromSupport ? 'text-white/70' : 'text-slate-400'}`}>
                  {formatTicketDate(message.sentAt)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {closed ? (
        <p className="border-t border-slate-100 px-5 py-4 text-center text-xs font-semibold text-slate-500">
          This request is closed.
        </p>
      ) : (
        <div className="border-t border-slate-100 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (draft.trim()) onSend(ticket, draft.trim())
            }}
            className="flex gap-2"
          >
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="Reply to this request..."
              rows={2}
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="shrink-0 cursor-pointer self-end rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send reply
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
