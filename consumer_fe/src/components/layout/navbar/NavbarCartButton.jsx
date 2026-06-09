import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router'

export default function NavbarCartButton({ count = 0, className = '' }) {
  return (
    <Link
      to="/cart"
      aria-label={`Shopping cart, ${count} items`}
      className={`relative inline-flex shrink-0 items-center justify-center text-white transition-opacity hover:opacity-85 ${className}`}
    >
      <ShoppingCart className="size-6 sm:size-7" strokeWidth={1.75} />
      <span className="absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center rounded-full bg-white text-[0.625rem] font-bold text-auth-primary sm:size-5 sm:text-[0.6875rem]">
        {count}
      </span>
    </Link>
  )
}
