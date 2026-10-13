import { Link, useLocation } from 'react-router'
import Container from '../Container'
import { useNavbarCategoryMenu } from '../../../hooks/useNavbarCategoryMenu'
import { buildNavbarCategoryLinks, navbarPinnedLinks } from '../../../constants/navbarLinks'
import NavbarCategoriesButton from './NavbarCategoriesButton'

const toneClass = {
  deals: 'text-nav-red',
  promotions: 'text-violet-700',
  default: 'text-slate-700',
}

function isQuickLinkActive(href, pathname, search) {
  const [path, query = ''] = href.split('?')
  const current = new URLSearchParams(search)

  if (path.startsWith('/categories/')) {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  if (query) {
    const expected = new URLSearchParams(query)
    const matchesQuery = [...expected.entries()].every(([key, value]) => current.get(key) === value)
    return pathname === path && matchesQuery
  }

  if (path === '/promotions') {
    return pathname === '/promotions' && !current.get('filter')
  }

  if (path === '/stores') {
    return pathname === '/stores' || pathname.startsWith('/stores/')
  }

  return pathname === path || pathname.startsWith(`${path}/`)
}

export default function NavbarCategoryBar({ isOpen = false, onToggle, onNavigate }) {
  const { pathname, search } = useLocation()
  const { menuItems, isLoading } = useNavbarCategoryMenu()
  const categoryLinks = buildNavbarCategoryLinks(menuItems)
  const links = [...categoryLinks, ...navbarPinnedLinks]
  const showSkeletons = isLoading && categoryLinks.length === 0

  return (
    <nav aria-label="Shop departments" className="relative z-50 hidden border-t border-slate-100 bg-white text-slate-800 lg:block">
      <Container className="flex h-10 items-center gap-2 sm:gap-3">
        <NavbarCategoriesButton mode="dropdown" isOpen={isOpen} onToggle={onToggle} />

        <div className="flex min-w-0 flex-1 items-center gap-x-0.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {showSkeletons
            ? Array.from({ length: 7 }, (_, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="h-6 w-16 shrink-0 animate-pulse rounded-md bg-slate-200"
                />
              ))
            : null}
          {links.map((link) => {
            const active = isQuickLinkActive(link.href, pathname, search)
            const tone = toneClass[link.tone] ?? toneClass.default

            return (
              <Link
                key={link.id}
                to={link.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 rounded-md px-1.5 py-1 text-xs font-medium whitespace-nowrap transition-colors hover:bg-slate-100 hover:text-slate-900 ${
                  active ? 'bg-slate-100 text-slate-900' : tone
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </Container>
    </nav>
  )
}
