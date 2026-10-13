import { Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'

export default function NavbarCartButton({ count = 0, className = '', iconOnly = false }) {
  return (
    <Link
      to="/cart"
      aria-label={`Shopping cart, ${count} items`}
      className={`inline-flex shrink-0 items-center text-slate-900 transition-colors hover:text-nav-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-red ${
        iconOnly ? 'size-9 justify-center' : 'min-w-10 flex-col gap-1'
      } ${className}`}
    >
      <span className="relative">
        <ShoppingCart className="size-5" strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-2.5 flex min-w-4 items-center justify-center rounded-full bg-nav-red px-1 text-[0.625rem] leading-4 font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
      {iconOnly ? null : <span className="text-[0.6875rem] leading-none font-medium">Cart</span>}
    </Link>
  )
}
