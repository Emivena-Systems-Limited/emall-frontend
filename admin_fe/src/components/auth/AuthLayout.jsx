import { Link } from 'react-router'
import Images from '../../utils/Images'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-[28rem] rounded-full bg-brand/4 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-80 rounded-full bg-ink/6 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, #c73b2d0a 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      <header className="relative shrink-0 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-8xl items-center justify-between">
          <Link to="/login" className="inline-flex items-center transition-opacity hover:opacity-90">
            <img src={Images.brand.logo} alt="EZ-Mall Admin" className="h-12 w-auto object-contain object-left sm:h-14" />
          </Link>
          <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-white uppercase">
            Admin
          </span>
        </div>
      </header>

      <main className="relative flex flex-1 items-start justify-center px-4 pb-10 pt-3 sm:px-6 sm:pb-12 sm:pt-4 lg:px-8 lg:pt-6">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-8 shadow-xl shadow-slate-200/70 sm:px-8 sm:py-10">
            <div className="mb-7">
              <div className="mb-3.5 flex items-center gap-2.5">
                <span className="h-px w-6 rounded-full bg-brand" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">
                  Admin portal
                </span>
              </div>
              {title && <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>}
              {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
