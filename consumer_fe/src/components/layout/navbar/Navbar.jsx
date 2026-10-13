import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import Container from '../Container'
import StoreLogo from '../StoreLogo'
import NavbarAuthLinks from './NavbarAuthLinks'
import NavbarCartButton from './NavbarCartButton'
import NavbarNotificationButton from './NavbarNotificationButton'
import NavbarSearch from './NavbarSearch'
import NavbarCategoryBar from './NavbarCategoryBar'
import MobileCategoriesPanel from './MobileCategoriesPanel'
import CategoriesMegaMenu from './CategoriesMegaMenu'

export default function Navbar({ cartCount = 0 }) {
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const closeCategories = () => setCategoriesOpen(false)

  const toggleCategories = () => {
    setCategoriesOpen((prev) => !prev)
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
    <header
      data-site-header
      className="sticky top-0 z-[100] bg-white text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.06),0_8px_18px_-14px_rgba(15,23,42,0.45)]"
    >
      <div className="relative z-[110] bg-white">
        <Container>
          <div className="flex items-center gap-2 py-2.5 lg:hidden">
            <button
              type="button"
              aria-label="Open categories"
              aria-expanded={categoriesOpen}
              aria-controls="mobile-categories-panel"
              data-categories-toggle
              onClick={toggleCategories}
              className="inline-flex size-9 shrink-0 items-center justify-center text-slate-800"
            >
              <Menu className="size-6" strokeWidth={1.75} />
            </button>

            <StoreLogo variant="brand" size="nav" className="min-w-0" />

            <div
              className={`ml-auto flex shrink-0 items-center gap-0.5 ${
                categoriesOpen ? 'relative z-[130]' : ''
              }`}
            >
              <NavbarNotificationButton />
              <NavbarCartButton count={cartCount} iconOnly />
              <NavbarAuthLinks iconOnly />
            </div>
          </div>

          <div className="pb-2.5 lg:hidden">
            <NavbarSearch compact onFocus={categoriesOpen ? closeCategories : undefined} />
          </div>

          <div className="hidden h-[4.5rem] items-center gap-5 lg:flex xl:gap-8">
            <StoreLogo variant="brand" size="nav" className="shrink-0" />

            <div className="min-w-0 flex-1">
              <NavbarSearch onFocus={categoriesOpen ? closeCategories : undefined} />
            </div>

            <div className="flex shrink-0 items-start gap-5">
              <NavbarNotificationButton className="mt-px" />
              <NavbarCartButton count={cartCount} />
              <NavbarAuthLinks />
            </div>
          </div>
        </Container>
      </div>

      <NavbarCategoryBar
        isOpen={categoriesOpen}
        onToggle={toggleCategories}
        onNavigate={closeCategories}
      />

      <CategoriesMegaMenu open={categoriesOpen} onClose={closeCategories} />
      <MobileCategoriesPanel open={categoriesOpen} onClose={closeCategories} />
    </header>
  )
}
