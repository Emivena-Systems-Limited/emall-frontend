import { List } from 'lucide-react'
import { Link } from 'react-router'

export default function NavbarCategoriesButton({ className = '', onNavigate, fullWidth = false }) {
  return (
    <Link
      to="/categories"
      onClick={onNavigate}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-white font-semibold text-auth-primary transition-colors hover:bg-white/90 ${
        fullWidth ? 'w-full px-4 py-3 text-base' : 'shrink-0 px-4 py-2.5 text-sm lg:px-5 lg:py-3 lg:text-[0.9375rem]'
      } ${className}`}
    >
      <List className="size-4 lg:size-4.5" strokeWidth={2.25} />
      Categories
    </Link>
  )
}
