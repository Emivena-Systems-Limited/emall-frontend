import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Container from '../Container'
import StoreLogo from '../StoreLogo'
import NavbarAuthLinks from './NavbarAuthLinks'
import NavbarCartButton from './NavbarCartButton'
import NavbarCategoriesButton from './NavbarCategoriesButton'
import NavbarSearch from './NavbarSearch'
import MobileNavPanel from './MobileNavPanel'

export default function Navbar({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-auth-primary text-white shadow-sm shadow-black/10">
      <Container>
        {/* Mobile + tablet top row */}
        <div className="flex items-center gap-3 py-3 sm:py-3.5 lg:hidden">
          <StoreLogo variant="light" showText className="min-w-0 flex-1" />

          <div className="flex items-center gap-3 sm:gap-4">
            <NavbarCartButton count={cartCount} />
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile + tablet search row */}
        <div className="pb-3 lg:hidden">
          <NavbarSearch compact />
        </div>

        {/* Desktop row */}
        <div className="hidden items-center gap-4 py-3.5 lg:flex xl:gap-5 xl:py-4">
          <StoreLogo variant="light" showText className="mr-1 shrink-0" />

          <NavbarCategoriesButton />

          <div className="mx-2 min-w-0 flex-1 xl:mx-4">
            <NavbarSearch className="max-w-none" />
          </div>

          <NavbarAuthLinks />

          <NavbarCartButton count={cartCount} className="ml-1" />
        </div>
      </Container>

      <MobileNavPanel open={menuOpen} onClose={closeMenu} />
    </header>
  )
}
