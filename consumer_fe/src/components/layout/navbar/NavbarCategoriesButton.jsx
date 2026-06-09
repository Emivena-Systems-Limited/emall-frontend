import { ChevronDown, List } from 'lucide-react'
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
  const sharedClass = `inline-flex items-center justify-center gap-2 rounded-full bg-white font-semibold text-auth-primary transition-colors hover:bg-white/90 ${
    fullWidth
      ? 'w-full px-4 py-3 text-base'
      : 'shrink-0 min-w-[10.75rem] px-6 py-2.5 text-sm lg:min-w-[11.75rem] lg:px-7 lg:py-3 lg:text-[0.9375rem] xl:min-w-[12.5rem] xl:px-8'
  } ${className}`

  if (mode === 'dropdown') {
    return (
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={`${sharedClass} ${isOpen ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-auth-primary' : ''}`}
      >
        <List className="size-4 lg:size-4.5" strokeWidth={2.25} />
        Categories
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2.25}
        />
      </button>
    )
  }

  return (
    <Link to="/categories" onClick={onNavigate} className={sharedClass}>
      <List className="size-4 lg:size-4.5" strokeWidth={2.25} />
      Categories
    </Link>
  )
}
