import { Star } from 'lucide-react'

const STAR_EMPTY_FILL = '#E2E8F0'

const DEFAULT_PRODUCT_PROMPTS = [
  { label: 'Quality', hint: 'Feel, finish, and how it lasts' },
  { label: 'Delivery', hint: 'Speed, packing, and condition' },
  { label: 'Value', hint: 'Whether it earned the price' },
]

const DEFAULT_VENDOR_PROMPTS = [
  { label: 'Service', hint: 'How helpful and responsive they were' },
  { label: 'Delivery', hint: 'Speed, packing, and condition' },
  { label: 'Quality', hint: 'Whether products matched expectations' },
]

function ReviewGhostCard({ opacity = 1 }) {
  return (
    <div
      className="flex gap-2.5 rounded-lg border border-slate-100 bg-white/90 px-3 py-2.5"
      style={{ opacity }}
      aria-hidden="true"
    >
      <span className="size-7 shrink-0 rounded-full bg-linear-to-br from-slate-200 to-slate-100" />
      <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-20 rounded-full bg-slate-200" />
          <span className="h-1.5 w-10 rounded-full bg-slate-100" />
        </div>
        <span className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, star) => (
            <Star key={star} className="size-2.5" fill={STAR_EMPTY_FILL} strokeWidth={0} />
          ))}
        </span>
        <span className="block h-1.5 w-full rounded-full bg-slate-100" />
        <span className="block h-1.5 w-2/3 rounded-full bg-slate-100" />
      </div>
    </div>
  )
}

function ReviewGhostList({ count = 3, className = '', fade = false }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <ReviewGhostCard
          key={index}
          opacity={fade ? Math.max(0.12, 0.5 - index * 0.16) : 1}
        />
      ))}
    </div>
  )
}

/**
 * Empty reviews panel used on product details and store landing pages.
 * @param {'product' | 'vendor'} [variant='product']
 */
export default function ReviewsEmptyState({
  subjectName,
  onWriteReview,
  variant = 'product',
  prompts,
}) {
  const isVendor = variant === 'vendor'
  const promptItems = prompts ?? (isVendor ? DEFAULT_VENDOR_PROMPTS : DEFAULT_PRODUCT_PROMPTS)

  return (
    <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-slate-50 via-white to-slate-50" />
      <div className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-amber-100/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-red-50 blur-3xl" />

      <div className="relative z-10 grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-center lg:gap-8">
        <div className="min-w-0 text-center lg:text-left">
          <span className="inline-flex items-stretch overflow-hidden border border-slate-300 text-[0.625rem] leading-none">
            <span className="bg-slate-950 px-2 py-1.5 font-bold tabular-nums text-white">0</span>
            <span className="bg-white px-2 py-1.5 font-semibold text-slate-600">reviews so far</span>
          </span>

          <p className="mt-3 text-4xl font-black tracking-tight text-slate-200 sm:text-5xl">0.0</p>
          <p className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Awaiting its first rating
          </p>

          <div className="mt-3 flex items-center justify-center gap-1 lg:justify-start" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className="size-6 drop-shadow-sm sm:size-7"
                fill={STAR_EMPTY_FILL}
                strokeWidth={0}
              />
            ))}
          </div>

          <h3 className="mt-3 text-sm font-extrabold tracking-tight text-slate-950">
            {isVendor ? 'Be the first voice on this vendor' : 'Be the first voice on this product'}
          </h3>
          {subjectName ? (
            <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">
              {subjectName}
            </p>
          ) : null}
          <p className="mt-2 text-[0.6875rem] leading-5 text-slate-500">
            {isVendor
              ? 'Shoppers are waiting to hear how this seller performs. A clear review goes a long way.'
              : 'Shoppers are waiting to hear how it holds up in real life. A clear explanation goes a long way.'}
          </p>

          {typeof onWriteReview === 'function' ? (
            <button
              type="button"
              onClick={onWriteReview}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-auth-primary px-5 py-2.5 text-xs font-bold text-white shadow-[0_10px_20px_-12px_rgba(199,59,45,0.7)] transition hover:bg-auth-primary-hover"
            >
              Write the first review
            </button>
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {promptItems.map((prompt) => (
              <div
                key={prompt.label}
                className="rounded-xl border border-slate-200/80 bg-white/90 px-3 py-3 shadow-[0_1px_0_rgba(15,23,42,0.03)]"
              >
                <p className="text-xs font-bold text-slate-800">{prompt.label}</p>
                <p className="mt-1 text-[0.625rem] leading-4 text-slate-500">{prompt.hint}</p>
              </div>
            ))}
          </div>
          <ReviewGhostList fade count={2} className="mt-3 hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
