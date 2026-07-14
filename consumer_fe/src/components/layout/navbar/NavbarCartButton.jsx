import { Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'

export default function NavbarCartButton({ count = 0, className = '' }) {
  return (
    <Link
      to="/cart"
      aria-label={`Shopping cart, ${count} items`}
      className={`relative inline-flex shrink-0 items-center justify-center text-white transition-opacity hover:opacity-85 ${className}`}
    >
      <ShoppingCart className="size-5" strokeWidth={1.75} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white text-[0.625rem] font-bold text-auth-primary">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
