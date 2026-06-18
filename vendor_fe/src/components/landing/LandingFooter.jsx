import { Link } from 'react-router'
import { Store } from 'lucide-react'
import { landingFooterGroups } from '../../constants/landingPageData'
import { landingContainerClass } from '../../constants/landingLayout'

function FooterLink({ href, label }) {
  const isHash = href.startsWith('#')
  const isExternal = href.startsWith('http')

  if (isHash) {
    return (
      <a href={href} className="transition-colors hover:text-white">
        {label}
      </a>
    )
  }

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
        {label}
      </a>
    )
  }

  return (
    <Link to={href} className="transition-colors hover:text-white">
      {label}
    </Link>
  )
}

export default function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-24 -right-16 size-72 rounded-full bg-brand/12 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className={`${landingContainerClass} relative pt-12 pb-8 lg:pt-14`}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_2fr] lg:gap-14">

          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
                <Store className="size-5" strokeWidth={1.75} />
              </span>
              <span className="text-lg font-semibold tracking-tight">E-Mall Vendor</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">
              A trusted marketplace for vendors across Ghana — list products, manage orders, and grow your business online.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span className="rounded-full bg-brand/20 px-3 py-1 text-[11px] font-semibold text-brand ring-1 ring-brand/25">
                Ghana · 2026
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:col-span-1 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-3">
            {landingFooterGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                  {group.title}
                </h3>
                <ul className="space-y-3 text-sm text-white/65">
                  {group.links.map(({ label, href }) => (
                    <li key={label}>
                      <FooterLink href={href} label={label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} E-Mall. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <a href="#benefits" className="transition-colors hover:text-white/80">Conditions of Use</a>
            <a href="#benefits" className="transition-colors hover:text-white/80">Privacy Notice</a>
            <Link to="/signup" className="transition-colors hover:text-white/80">Seller Agreement</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
