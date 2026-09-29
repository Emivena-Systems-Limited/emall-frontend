import OverflowTooltip from '../common/OverflowTooltip'

export default function TruncatedCell({ text, className = 'text-sm font-medium text-slate-700' }) {
  const value = text == null || text === '' ? '—' : String(text)

  return (
    <div className="w-40 max-w-40 min-w-0">
      <OverflowTooltip text={value}>
        <span className={`block truncate whitespace-nowrap ${className}`}>{value}</span>
      </OverflowTooltip>
    </div>
  )
}
