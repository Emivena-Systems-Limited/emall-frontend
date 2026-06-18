import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'
import { landingContainerClass } from '../../constants/landingLayout'
import LandingLogo from './LandingLogo'

const navLinks = [
  { href: '#benefits', label: 'Benefits' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
]

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/50 backdrop-blur-md">
      <div className={`${landingContainerClass} flex items-center justify-between gap-4 py-3.5`}>
        <LandingLogo variant="light" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-brand-light/70 hover:text-brand"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
          {/* <span className="mr-1 hidden text-xs text-slate-400 xl:inline">
            Secure · Verified · Ghana
          </span> */}
          <Link
            to="/login"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/30 hover:text-brand sm:px-5"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover sm:px-5"
          >
            Register
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="landing-mobile-nav"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:border-brand/30 hover:text-brand lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          id="landing-mobile-nav"
          className={`${landingContainerClass} border-t border-slate-200/80 bg-white py-4 lg:hidden`}
        >
          <nav className="space-y-1" aria-label="Mobile primary">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={closeMobile}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-brand-light/70 hover:text-brand"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
            <Link
              to="/login"
              onClick={closeMobile}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/30 hover:text-brand"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={closeMobile}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
