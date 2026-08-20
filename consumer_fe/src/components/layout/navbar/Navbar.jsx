import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Container from '../Container'
import StoreLogo from '../StoreLogo'
import NavbarAuthLinks from './NavbarAuthLinks'
import NavbarCartButton from './NavbarCartButton'
import NavbarCategoriesButton from './NavbarCategoriesButton'
import NavbarSearch from './NavbarSearch'
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
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-auth-primary text-white shadow-sm shadow-black/5">
      <div className="relative z-[110] bg-auth-primary">
        <Container>
          {/* Mobile + tablet top row */}
          <div className="relative z-20 flex items-center gap-1.5 py-2 lg:hidden">
            <button
              type="button"
              data-categories-toggle
              aria-expanded={categoriesOpen}
              aria-controls="mobile-categories-panel"
              aria-label={categoriesOpen ? 'Close categories' : 'Open categories'}
              onClick={toggleCategories}
              className="relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-white transition-colors hover:bg-white/10"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={categoriesOpen ? 'close' : 'menu'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="flex"
                >
                  {categoriesOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </button>

            <StoreLogo variant="light" showText size="sm" className="min-w-0 flex-1" />

            <div className="flex shrink-0 items-center gap-2">
              <NavbarCartButton count={cartCount} />
              <NavbarAuthLinks compact />
            </div>
          </div>

          {/* Mobile + tablet search row */}
          <div className="pb-2 lg:hidden">
            <NavbarSearch compact onFocus={categoriesOpen ? closeCategories : undefined} />
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
    </header>
  )
}
