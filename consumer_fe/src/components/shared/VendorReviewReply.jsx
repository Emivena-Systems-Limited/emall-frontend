import { Store } from 'lucide-react'

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export function normalizeVendorReviewReply(record) {
  if (!record || typeof record !== 'object') return null

  const raw = record.vendor_reply ?? record.vendorReply ?? record.seller_reply
  let text = ''
  let repliedAt = firstText(
    record.vendor_replied_at,
    record.vendorRepliedAt,
    record.replied_at,
  )

  if (typeof raw === 'string') {
    text = raw.trim()
  } else if (raw && typeof raw === 'object') {
    text = firstText(raw.text, raw.body, raw.message, raw.reply, raw.vendor_reply)
    repliedAt = firstText(raw.replied_at, raw.vendor_replied_at, raw.date, repliedAt)
  }

  if (!text) return null

  const vendorName = firstText(
    record.vendor_name,
    record.vendorName,
    record.store_name,
    record.vendor?.store_name,
    record.vendor?.trading_name,
    record.vendor?.business_name,
    record.product?.vendor?.store_name,
    record.product?.vendor?.trading_name,
    record.product?.store_name,
  )

  let date = ''
  if (repliedAt && !Number.isNaN(Date.parse(repliedAt))) {
    date = new Date(repliedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return { text, date, vendorName }
}

export default function VendorReviewReply({
  reply,
  compact = false,
  vendorName = '',
}) {
  if (!reply?.text) return null

  const name = reply.vendorName || vendorName || 'Seller'

  return (
    <div className={`relative ${compact ? 'mt-2.5 pl-3' : 'mt-3 pl-4'}`}>
      <span
        className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-linear-to-b from-auth-primary/70 via-auth-primary/25 to-auth-primary/10"
        aria-hidden
      />
      <div className={`overflow-hidden rounded-xl border border-auth-primary/15 bg-linear-to-br from-red-50/80 via-white to-white ${compact ? 'px-2.5 py-2' : 'px-3.5 py-3'}`}>
        <div className="flex items-start gap-2.5">
          <span className={`mt-0.5 flex shrink-0 items-center justify-center rounded-lg bg-auth-primary text-white ${compact ? 'size-6' : 'size-8'}`}>
            <Store className={compact ? 'size-3' : 'size-3.5'} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-auth-primary">
              {name}
            </p>
            <p className={`mt-1 wrap-break-word text-slate-800 ${compact ? 'text-[0.6875rem] leading-4' : 'text-sm leading-relaxed'}`}>
              {reply.text}
            </p>
            {reply.date ? (
              <p className="mt-1.5 text-[0.65rem] text-slate-400">Replied {reply.date}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
