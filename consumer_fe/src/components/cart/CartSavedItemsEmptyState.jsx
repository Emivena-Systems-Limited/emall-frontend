import { Bookmark } from 'lucide-react'
import CartSectionEmptyState from './CartSectionEmptyState'

export default function CartSavedItemsEmptyState() {
  return (
    <section aria-labelledby="saved-items-heading" className="min-w-0">
      <div className="mb-4">
        <h2 id="saved-items-heading" className="text-lg font-bold text-slate-950 sm:text-xl">
          Saved items
        </h2>
        <p className="mt-2 text-xs text-slate-500 sm:text-sm">
          View your shopping cart online and checkout
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white">
        <div className="hidden bg-auth-primary px-4 py-3 text-sm font-bold text-white lg:grid lg:grid-cols-[minmax(0,1fr)_120px_140px_110px] lg:gap-4 lg:px-5">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Subtotal</span>
        </div>

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
