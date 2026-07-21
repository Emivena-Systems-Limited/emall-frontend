import { TRANSACTION_TYPES } from '../../constants/finance'

export default function TransactionTypeBadge({ type }) {
  const config = TRANSACTION_TYPES[type] ?? {
    label: type,
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  )
}
