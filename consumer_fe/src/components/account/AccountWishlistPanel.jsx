import { useEffect } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { accountSectionMeta } from './accountNavigation'
import Images from '../../utils/Images'

function WishlistTableHeader() {
  return (
    <div className="grid grid-cols-[minmax(0,1.45fr)_0.55fr_0.7fr_0.65fr] gap-4 bg-auth-primary px-5 py-4 text-xs font-bold text-white sm:px-6">
      <span>Product</span>
      <span>Price</span>
      <span>Quantity</span>
      <span className="text-right">Subtotal</span>
    </div>
  )
}

function EmptyWishlist() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <WishlistTableHeader />
      <div className="flex min-h-112 flex-col items-center justify-center px-6 py-14 text-center sm:py-16">
        <img
          src={Images.common.wishlist_empty}
          alt=""
          width={199}
          height={136}
          className="h-34 w-auto max-w-50 object-contain"
        />
        <h3 className="mt-8 text-xl font-bold text-slate-950">Your wishlist is empty</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Save items you love and find them here anytime.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-auth-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-auth-primary-hover"
        >
          Continue Shopping
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  )
}

export default function AccountWishlistPanel() {
  const meta = accountSectionMeta.wishlist
  const items = []

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <section>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-auth-primary">Saved products</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{meta.title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">{meta.description}</p>
      </div>

      <div className="mt-5">
        {items.length === 0 ? <EmptyWishlist /> : null}
      </div>
    </section>
  )
}
