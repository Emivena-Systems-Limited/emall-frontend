import { formatOrderProductsDisplay } from '../../utils/customerUtils'

export default function CustomerOrderProducts({
  products,
  maxVisible = 1,
  className = '',
}) {
  const display = formatOrderProductsDisplay(products, maxVisible)

  if (display.all.length === 0) {
    return <span className={className}>—</span>
  }

  if (display.extra === 0) {
    return <span className={className}>{display.primary}</span>
  }

  return (
    <span className={className} title={display.all.join(', ')}>
      {display.primary}
      {' '}
      <span className="font-semibold text-slate-500">+ {display.extra} more</span>
    </span>
  )
}
