import { ChevronDown, LayoutGrid } from 'lucide-react'
import { Link } from 'react-router'

export default function NavbarCategoriesButton({
  className = '',
  onNavigate,
  fullWidth = false,
  mode = 'link',
  isOpen = false,
  onToggle,
  panelId = 'categories-mega-menu',
}) {
  if (mode === 'dropdown') {
    return (
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        data-categories-toggle
        onClick={onToggle}
        className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-nav-red px-2.5 text-xs font-semibold text-white transition-colors hover:bg-nav-red-deep ${
          isOpen ? 'bg-nav-red-deep' : ''
        } ${fullWidth ? 'w-full justify-center' : ''} ${className}`}
      >
        <LayoutGrid className="size-3.5" strokeWidth={2.25} />
        All Categories
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2.25}
        />
      </button>
    )
  }

  return (
    <Link
      to="/categories"
      onClick={onNavigate}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md bg-nav-red px-2.5 text-xs font-semibold text-white transition-colors hover:bg-nav-red-deep ${
        fullWidth ? 'w-full justify-center' : ''
      } ${className}`}
    >
      <LayoutGrid className="size-3.5" strokeWidth={2.25} />
      All Categories
    </Link>
  )
}
