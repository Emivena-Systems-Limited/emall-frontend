import { formatCediPriceParts } from '../../utils/formatCurrency'

export default function LineItemPrice({ amount, compareAmount, align = 'center' }) {
  const priceParts = formatCediPriceParts(amount)
  const compareParts =
    compareAmount != null && Number(compareAmount) > Number(amount)
      ? formatCediPriceParts(compareAmount)
      : null
  const alignClass = align === 'right' ? 'items-end text-right' : 'items-center text-center'
  const rowAlignClass = align === 'right' ? 'justify-end' : 'justify-center'

  return (
    <div className={`flex flex-col gap-0.5 ${alignClass}`}>
      <span className={`inline-flex items-baseline leading-none text-slate-950 ${rowAlignClass}`}>
        <span className="mr-0.5 self-start text-[0.625rem] font-normal leading-none">{priceParts.currency}</span>
        <span className="text-base font-bold tabular-nums">{priceParts.whole}</span>
        <span className="relative -top-1 text-[0.625rem] font-bold tabular-nums leading-none">
          .{priceParts.fraction}
        </span>
      </span>
      {compareParts ? (
        <span
          className={`inline-flex items-baseline leading-none text-slate-400 line-through ${rowAlignClass}`}
          aria-label={`Regular price ${compareParts.currency}${compareParts.whole}.${compareParts.fraction}`}
        >
          <span className="mr-0.5 self-start text-[0.5625rem] font-normal leading-none">{compareParts.currency}</span>
          <span className="text-[0.6875rem] font-medium tabular-nums">{compareParts.whole}</span>
          <span className="relative -top-0.5 text-[0.5625rem] font-medium tabular-nums leading-none">
            .{compareParts.fraction}
          </span>
        </span>
      ) : null}
    </div>
  )
}
