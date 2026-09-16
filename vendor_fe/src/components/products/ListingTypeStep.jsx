import { Check, Layers3, Package } from 'lucide-react'
import { LISTING_TYPES } from '../../constants/productListing'

const OPTIONS = [
  {
    id: LISTING_TYPES.SIMPLE,
    icon: Package,
    title: 'Simple product',
    description: 'Shoppers buy it as-is — one price and one stock count.',
    examples: ['Books', 'Chargers', 'Kitchen tools'],
  },
  {
    id: LISTING_TYPES.VARIANTS,
    icon: Layers3,
    title: 'Variation product',
    description: 'Shoppers pick a color, size, or similar option first.',
    examples: ['T-shirts', 'Phones', 'Shoes'],
  },
]

export default function ListingTypeStep({ value, onChange, error }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Start here</p>
        <h3 className="text-lg font-bold text-slate-900">How do shoppers buy this?</h3>
        <p className="max-w-xl text-sm leading-relaxed text-slate-500">
          Choose one. You can add extra options later if this product comes in more than one version.
        </p>
        {error && (
          <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="How shoppers buy this product">
        {OPTIONS.map((option) => {
          const selected = value === option.id
          const Icon = option.icon

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={`group flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                selected
                  ? 'border-brand bg-brand-light/60 shadow-[0_10px_24px_rgba(199,59,45,0.08)]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <span
                className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ${
                  selected
                    ? 'bg-white text-brand ring-brand-muted'
                    : 'bg-slate-50 text-slate-500 ring-slate-200'
                }`}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-950">{option.title}</span>
                  {selected ? (
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                      <Check className="size-3" strokeWidth={2.75} />
                    </span>
                  ) : (
                    <span
                      className="size-5 shrink-0 rounded-full border border-slate-300 bg-white"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                  {option.description}
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {option.examples.map((example) => (
                    <span
                      key={example}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        selected
                          ? 'bg-white text-slate-700 ring-1 ring-brand/15'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {example}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
