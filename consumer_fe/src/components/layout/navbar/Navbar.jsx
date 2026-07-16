import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!categoriesOpen) return undefined

    const handlePointerDown = (event) => {
      if (event.target.closest('[data-categories-toggle]')) return
      if (event.target.closest('[data-categories-panel]')) return
      closeCategories()
    }

    const timer = window.setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown, true)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [categoriesOpen])

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-auth-primary text-white shadow-sm shadow-black/5">
      <div className="relative z-[110] bg-auth-primary">
        <Container>
          {/* Mobile + tablet top row */}
          <div className="flex items-center gap-2.5 py-2 lg:hidden">
            <StoreLogo variant="light" showText size="sm" className="min-w-0 flex-1" />

            <div className="flex items-center gap-2">
              <NavbarCartButton count={cartCount} />
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-panel"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={toggleMenu}
                className="inline-flex size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Mobile + tablet search + categories row */}
          <div className="flex flex-col gap-2 pb-2 lg:hidden">
            <NavbarSearch compact onFocus={categoriesOpen ? closeCategories : undefined} />
            <NavbarCategoriesButton
              mode="dropdown"
              fullWidth
              isOpen={categoriesOpen}
              onToggle={toggleCategories}
              panelId="mobile-categories-panel"
            />
          </div>

          {/* Desktop row */}
          <div className="hidden h-14 items-center gap-3 lg:flex xl:gap-4">
            <StoreLogo variant="light" showText size="sm" className="mr-0.5 shrink-0" />

            <NavbarCategoriesButton
              mode="dropdown"
              isOpen={categoriesOpen}
              onToggle={toggleCategories}
            />

            <div className="min-w-0 flex-1">
              <NavbarSearch onFocus={categoriesOpen ? closeCategories : undefined} />
            </div>

            <div className="ml-auto flex items-center gap-3 xl:gap-4">
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
