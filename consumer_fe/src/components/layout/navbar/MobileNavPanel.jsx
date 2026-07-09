import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronRight,
  HelpCircle,
  LayoutGrid,
  ShoppingCart,
  X,
} from 'lucide-react'
import { Link } from 'react-router'
import Container from '../Container'
import NavbarAuthLinks from './NavbarAuthLinks'
import { footerColumns } from '../../../constants/siteNav'

const panelEase = [0.16, 1, 0.3, 1]

const quickLinks = footerColumns.flatMap((column) => column.links)

function MobileNavSection({ title, children }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="px-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/55">
        {title}
      </h2>
      {children}
    </section>
  )
}

function MobileNavRow({ to, icon: Icon, label, onClick, endLabel, asButton = false, buttonType = 'button' }) {
  const className =
    'group flex w-full items-center gap-3 rounded-2xl bg-white/8 px-4 py-3.5 text-left text-white transition-colors hover:bg-white/14 active:bg-white/18'

  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors group-hover:bg-white/15">
        <Icon className="size-4.5" strokeWidth={2.1} />
      </span>
      <span className="min-w-0 flex-1 text-[0.9375rem] font-medium">{label}</span>
      {endLabel ? (
        <span className="rounded-full bg-white px-2 py-0.5 text-[0.6875rem] font-bold text-auth-primary">
          {endLabel}
        </span>
      ) : (
        <ChevronRight className="size-4 shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/55" />
      )}
    </>
  )

  if (asButton) {
    return (
      <button type={buttonType} onClick={onClick} className={className}>
        {content}
      </button>
    )
  }

  return (
    <Link to={to} onClick={onClick} className={className}>
      {content}
    </Link>
  )
}

function MobileQuickLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-xl px-3 py-2.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
    >
      {label}
    </Link>
  )
}

export default function MobileNavPanel({ open, onClose, onOpenCategories, cartCount = 0 }) {
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

  const openCategories = () => {
    onClose()
    onOpenCategories?.()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: panelEase }}
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            onClick={onClose}
          />

          <motion.div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: panelEase }}
            className="absolute inset-x-0 top-full z-50 flex max-h-[calc(100dvh-9rem)] flex-col overflow-hidden border-t border-white/15 bg-linear-to-b from-[#b83225] to-auth-primary shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)] lg:hidden"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
              <div>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/55">
                  Navigation
                </p>
                <h2 className="text-base font-semibold text-white">Menu</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="size-5" strokeWidth={2.25} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <Container className="py-5 sm:py-6">
                <div className="flex flex-col gap-6 pb-2">
                  <MobileNavSection title="Shop">
                    <MobileNavRow
                      asButton
                      icon={LayoutGrid}
                      label="Browse Categories"
                      onClick={openCategories}
                    />

                    <MobileNavRow
                      to="/cart"
                      icon={ShoppingCart}
                      label="Shopping Cart"
                      endLabel={cartCount > 99 ? '99+' : String(cartCount)}
                      onClick={onClose}
                    />
                  </MobileNavSection>

                  <MobileNavSection title="Account">
                    <NavbarAuthLinks stacked onNavigate={onClose} />
                  </MobileNavSection>

                  <MobileNavSection title="Help & Info">
                    <div className="rounded-2xl bg-white/6 p-2">
                      <div className="mb-1 flex items-center gap-2 px-2 pt-1 pb-2 text-white/70">
                        <HelpCircle className="size-4 shrink-0" strokeWidth={2} />
                        <span className="text-xs font-medium">Quick links</span>
                      </div>
                      <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-3">
                        {quickLinks.map((link) => (
                          <MobileQuickLink
                            key={`${link.href}-${link.label}`}
                            to={link.href}
                            label={link.label}
                            onClick={onClose}
                          />
                        ))}
                      </div>
                    </div>
                  </MobileNavSection>
                </div>
              </Container>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
