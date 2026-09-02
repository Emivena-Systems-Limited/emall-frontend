import { formatOrderMoney } from '../../utils/formatters'

export default function OrderItemPrice({ amount, compareAmount, align = 'right' }) {
  const alignClass = align === 'right' ? 'items-end text-right' : 'items-start text-left'
  const normalizedAmount = Number(amount)
  const normalizedCompare = Number(compareAmount)
  const showCompare = Number.isFinite(normalizedCompare)
    && normalizedCompare > 0
    && Number.isFinite(normalizedAmount)
    && normalizedCompare > normalizedAmount

  return (
    <div className={`flex flex-col gap-0.5 ${alignClass}`}>
      <span className="text-sm font-bold tabular-nums text-slate-900">
        {formatOrderMoney(amount)}
      </span>
      {showCompare ? (
        <span className="text-xs tabular-nums text-slate-400 line-through">{formatOrderMoney(compareAmount)}</span>
      ) : null}
    </div>
  )
}
