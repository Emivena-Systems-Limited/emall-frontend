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
  const sharedClass = `inline-flex items-center justify-center gap-1.5 rounded-full bg-white font-semibold text-auth-primary transition-colors hover:bg-white/90 ${
    fullWidth
      ? 'w-full px-3.5 py-2 text-sm'
      : 'shrink-0 min-w-[9.5rem] px-4 py-2 text-sm xl:min-w-[10.5rem]'
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
        <List className="size-3.5" strokeWidth={2.25} />
        Categories
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2.25}
        />
      </button>
    )
  }

  return (
    <Link to="/categories" onClick={onNavigate} className={sharedClass}>
      <List className="size-3.5" strokeWidth={2.25} />
      Categories
    </Link>
  )
}
