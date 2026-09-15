import { Check, Layers3, Package } from 'lucide-react'
import { LISTING_TYPES } from '../../constants/productListing'

const OPTIONS = [
  {
    id: LISTING_TYPES.SIMPLE,
    icon: Package,
    title: 'Simple product',
    description: 'One version of this item. We create a single option behind the scenes from the product name, price, stock, and up to 3 photos.',
    points: [
      'No colors, sizes, or extra options to manage',
      'Price and quantity come from the Pricing step',
      'Photos: primary image plus up to 2 featured images',
    ],
  },
  {
    id: LISTING_TYPES.VARIANTS,
    icon: Layers3,
    title: 'Product with variants',
    description: 'Sell more than one version — colors, sizes, materials, or your own option types — each with its own stock and photos.',
    points: [
      'Add option types after pricing',
      'Each value can have its own price, stock, and photos',
      'A default option is still created from your product details',
    ],
  },
]

export default function ListingTypeStep({ value, onChange, error }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Start here</p>
        <h3 className="text-lg font-bold text-slate-900">How is this product sold?</h3>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Choose a simple listing if shoppers buy one version of this item. Choose variants if they pick a color, size, or another option first.
        </p>
        {error && (
          <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value === option.id
          const Icon = option.icon

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={selected}
              className={`flex h-full cursor-pointer flex-col rounded-2xl border p-5 text-left transition-colors ${
                selected
                  ? 'border-brand bg-brand-light/50 ring-1 ring-brand/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ring-1 ${
                    selected
                      ? 'bg-white text-brand ring-brand-muted'
                      : 'bg-slate-50 text-slate-600 ring-slate-200'
                  }`}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                {selected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                    <Check className="size-3" strokeWidth={2.5} />
                    Selected
                  </span>
                )}
              </span>
              <span className="mt-4 text-base font-bold text-slate-950">{option.title}</span>
              <span className="mt-1.5 text-sm leading-relaxed text-slate-600">{option.description}</span>
              <ul className="mt-4 space-y-1.5">
                {option.points.map((point) => (
                  <li key={point} className="flex gap-2 text-xs leading-relaxed text-slate-500">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>
    </div>
  )
}
