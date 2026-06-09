import { useEffect } from 'react'
import NavbarAuthLinks from './NavbarAuthLinks'
import NavbarCategoriesButton from './NavbarCategoriesButton'

export default function MobileNavPanel({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
        onClick={onClose}
      />

      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="absolute inset-x-0 top-full z-50 max-h-[min(24rem,calc(100dvh-100%))] overflow-y-auto border-t border-white/10 bg-auth-primary px-4 py-5 shadow-xl lg:hidden"
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
          <NavbarCategoriesButton fullWidth onNavigate={onClose} />
          <NavbarAuthLinks stacked onNavigate={onClose} />
        </div>
      </div>
    </>
  )
}
