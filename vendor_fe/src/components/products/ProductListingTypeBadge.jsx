import { Layers3, Package } from 'lucide-react'

const LISTING_CONFIG = {
  simple: {
    label: 'Simple',
    icon: Package,
    className: 'bg-slate-100 text-slate-700 ring-slate-200/80',
  },
  variants: {
    label: 'Variants',
    icon: Layers3,
    className: 'bg-cyan-50 text-cyan-800 ring-cyan-200/80',
  },
}

export default function ProductListingTypeBadge({ isSimpleListing = false, size = 'md' }) {
  const config = isSimpleListing ? LISTING_CONFIG.simple : LISTING_CONFIG.variants
  const Icon = config.icon
  const isCompact = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ring-1 ${config.className} ${
        isCompact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={isCompact ? 'size-2.5 shrink-0' : 'size-3 shrink-0'} aria-hidden />
      {config.label}
    </span>
  )
}
