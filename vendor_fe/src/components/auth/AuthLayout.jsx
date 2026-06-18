import { Link } from 'react-router'
import { Store } from 'lucide-react'

export default function AuthLayout({
  children,
  title,
  subtitle,
  wideForm = false,
  compactLayout = false,
}) {
  const formWidthClass = wideForm ? 'max-w-5xl' : 'max-w-xl'
  const mainClass = compactLayout
    ? 'relative flex flex-1 items-start justify-center px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4 lg:px-8'
    : 'relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8'
  const headerClass = compactLayout
    ? 'relative shrink-0 px-4 py-4 sm:px-6 lg:px-8'
    : 'relative shrink-0 px-4 py-5 sm:px-6 lg:px-8'

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-112 rounded-full bg-brand/4 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-80 rounded-full bg-brand/3 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, #c73b2d0a 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      <header className={headerClass}>
        <div className="mx-auto w-full max-w-8xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
              <Store className="size-4" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">E-Mall Vendor</span>
          </Link>
        </div>
      </header>

      <main
        data-auth-scroll-panel
        className={mainClass}
      >
        <div className={`w-full ${formWidthClass}`}>
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-8 shadow-xl shadow-slate-200/70 sm:px-8 sm:py-10">
            {(title || subtitle) && (
              <div className={compactLayout ? 'mb-5' : 'mb-7'}>
                <div className="mb-3.5 flex items-center gap-2.5">
                  <span className="h-px w-6 rounded-full bg-brand" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">
                    Vendor Portal
                  </span>
                </div>
                {title && (
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
