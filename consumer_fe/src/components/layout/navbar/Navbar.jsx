import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Container from '../Container'
import StoreLogo from '../StoreLogo'
import NavbarAuthLinks from './NavbarAuthLinks'
import NavbarCartButton from './NavbarCartButton'
import NavbarCategoriesButton from './NavbarCategoriesButton'
import NavbarSearch from './NavbarSearch'
import MobileNavPanel from './MobileNavPanel'
import MobileCategoriesPanel from './MobileCategoriesPanel'
import CategoriesMegaMenu from './CategoriesMegaMenu'

export default function Navbar({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)
  const closeCategories = () => setCategoriesOpen(false)

  const toggleMenu = () => {
    setCategoriesOpen(false)
    setMenuOpen((prev) => !prev)
  }

  const toggleCategories = () => {
    setMenuOpen(false)
    setCategoriesOpen((prev) => !prev)
  }

  const openCategories = () => {
    setMenuOpen(false)
    setCategoriesOpen(true)
  }

  return (
    <header className="sticky top-0 z-50 bg-auth-primary text-white shadow-sm shadow-black/10">
      <div className="relative z-60 bg-auth-primary">
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
              onClick={toggleMenu}
              className="inline-flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile + tablet search + categories row */}
        <div className="flex flex-col gap-2.5 pb-3 lg:hidden">
          <NavbarSearch compact />
          <NavbarCategoriesButton
            mode="dropdown"
            fullWidth
            isOpen={categoriesOpen}
            onToggle={toggleCategories}
            panelId="mobile-categories-panel"
          />
        </div>

        {/* Desktop row */}
        <div className="hidden items-center gap-4 py-3.5 lg:flex xl:gap-5 xl:py-4">
          <StoreLogo variant="light" showText className="mr-1 shrink-0" />

          <NavbarCategoriesButton
            mode="dropdown"
            isOpen={categoriesOpen}
            onToggle={toggleCategories}
          />

          <div className="mx-2 min-w-[18rem] flex-1 max-w-lg xl:mx-3 xl:max-w-xl">
            <NavbarSearch />
          </div>

          <div className="ml-auto flex items-center gap-4 xl:gap-5">
            <NavbarAuthLinks />
            <NavbarCartButton count={cartCount} />
          </div>
        </div>
      </Container>
      </div>

      <CategoriesMegaMenu open={categoriesOpen} onClose={closeCategories} />
      <MobileCategoriesPanel open={categoriesOpen} onClose={closeCategories} />
      <MobileNavPanel
        open={menuOpen}
        onClose={closeMenu}
        onOpenCategories={openCategories}
        cartCount={cartCount}
      />
    </header>
  )
}
