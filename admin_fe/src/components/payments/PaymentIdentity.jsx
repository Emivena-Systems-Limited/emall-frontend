import OverflowTooltip from '../common/OverflowTooltip'
import { formatOrderMoney } from '../../utils/formatters'

export function PaymentRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading payments"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-32 rounded-md" />
              <div className="skeleton-shimmer h-3 w-40 rounded-md" />
            </div>
            <div className="skeleton-shimmer hidden h-6 w-20 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function PaymentIdentity({ item, size = 'md' }) {
  const large = size === 'lg'
  const subtitle = large
    ? [item?.shopperName, item?.orderNumber].filter(Boolean).join(' · ')
    : (item?.reference || 'Checkout')

  return (
    <div className="min-w-0">
      <p className={`truncate tabular-nums ${large ? 'text-xl font-bold text-slate-950' : 'font-semibold text-slate-900'}`}>
        {formatOrderMoney(item?.amount)}
      </p>
      <OverflowTooltip text={subtitle || item?.reference}>
        <p className={`truncate ${large ? 'mt-0.5 text-sm text-slate-500' : 'text-xs text-slate-500'}`}>
          {subtitle || item?.reference || 'Checkout'}
        </p>
      </OverflowTooltip>
    </div>
  )
}
