import { Link } from 'react-router'
import { Archive, CheckCircle2, Package, ShoppingBag } from 'lucide-react'
import { MESSAGE_STATUS } from '../../constants/messages'
import { formatMessageDate, getInitials } from '../../utils/messageUtils'

const statusTone = {
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}

function ConversationMeta({ conversation }) {
  if (conversation.orderNumber) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
        <ShoppingBag className="size-3" />
        {conversation.orderNumber}
      </span>
    )
  }
  if (conversation.productName) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
        <Package className="size-3" />
        {conversation.productName}
      </span>
    )
  }
  return null
}

export default function ConversationListItem({ conversation, active, onSelect }) {
  const status = MESSAGE_STATUS[conversation.status] ?? MESSAGE_STATUS.open
  const unread = conversation.unreadCount > 0

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={`w-full cursor-pointer border-b border-slate-100 px-4 py-3.5 text-left transition-colors last:border-b-0 ${
        active
          ? 'bg-brand-light/60 ring-1 ring-inset ring-brand/20'
          : unread
            ? 'bg-white hover:bg-slate-50'
            : 'bg-white hover:bg-slate-50/80'
      }`}
    >
      <div className="flex gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            unread ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {getInitials(conversation.customerName)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`truncate text-sm ${unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
              {conversation.customerName}
            </p>
            <span className="shrink-0 text-[10px] font-medium tabular-nums text-slate-400">
              {formatMessageDate(conversation.updatedAt)}
            </span>
          </div>

          <p className={`mt-0.5 truncate text-xs ${unread ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
            {conversation.subject}
          </p>

          <p className="mt-1 line-clamp-1 text-[11px] leading-snug text-slate-400">
            {conversation.preview}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusTone[status.tone]}`}>
              {status.label}
            </span>
            <ConversationMeta conversation={conversation} />
            {unread && (
              <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

export function ConversationThread({
  conversation,
  onSend,
  onResolve,
  onArchive,
  draft,
  onDraftChange,
}) {
  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/50 p-8 text-center">
        <span className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-white text-slate-300 ring-1 ring-slate-200">
          <Archive className="size-6" strokeWidth={1.5} />
        </span>
        <p className="text-sm font-semibold text-slate-600">Select a conversation</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">
          Choose a thread from the list to read messages and reply to your customer.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">{conversation.subject}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {conversation.customerName} · {conversation.customerEmail}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {conversation.orderNumber && (
                <Link
                  to={`/orders/${conversation.orderId}`}
                  className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                >
                  <ShoppingBag className="size-3" />
                  {conversation.orderNumber}
                </Link>
              )}
              {conversation.productName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700 ring-1 ring-violet-100">
                  <Package className="size-3" />
                  {conversation.productName}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {conversation.status !== 'resolved' && (
              <button
                type="button"
                onClick={() => onResolve(conversation)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <CheckCircle2 className="size-3.5" />
                Resolve
              </button>
            )}
            {conversation.status !== 'archived' && (
              <button
                type="button"
                onClick={() => onArchive(conversation)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Archive className="size-3.5" />
                Archive
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {(conversation.messages || []).map((msg) => {
          const isVendor = msg.sender === 'vendor'
          const isSystem = msg.sender === 'system'

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500">
                  {msg.text}
                </span>
              </div>
            )
          }

          return (
            <div key={msg.id} className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  isVendor
                    ? 'rounded-br-md bg-brand text-white'
                    : 'rounded-bl-md bg-slate-100 text-slate-800'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`mt-1 text-[10px] ${isVendor ? 'text-white/70' : 'text-slate-400'}`}>
                  {formatMessageDate(msg.sentAt)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-slate-100 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.trim()) onSend(conversation, draft.trim())
          }}
          className="flex gap-2"
        >
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Type your reply..."
            rows={2}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="shrink-0 cursor-pointer self-end rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
