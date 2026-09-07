import { Bookmark } from 'lucide-react'
import CartSectionEmptyState from './CartSectionEmptyState'

export default function CartSavedItemsEmptyState() {
  return (
    <section aria-labelledby="saved-items-heading" className="min-w-0">
      <div className="mb-4">
        <h2 id="saved-items-heading" className="text-lg font-bold text-slate-950 sm:text-xl">
          Saved For Later
        </h2>
        <p className="mt-2 text-xs text-slate-500 sm:text-sm">
          Items you saved for later
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <CartSectionEmptyState
          icon={Bookmark}
          eyebrow="Nothing saved"
          title="No saved items yet"
          description="Save cart items for later and they will appear here when you're ready to buy."
          ctaLabel="Continue Shopping"
          ctaHref="/"
          compact
        />
      </div>
    </section>
  )
}
