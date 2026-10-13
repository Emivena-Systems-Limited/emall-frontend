import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router'
import Images from '../../utils/Images'

function StoreBadge({ href, label, src }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (href === '#') event.preventDefault()
      }}
      aria-label={label}
      className="inline-flex cursor-pointer transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <img src={src} alt="" className="h-11 w-auto sm:h-12" />
    </a>
  )
}

function NewsletterCard() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setSubscribed(true)
  }

  return (
    <article className="relative flex min-h-[15.5rem] flex-col overflow-hidden rounded-[1.4rem] bg-[linear-gradient(155deg,#ff3b42_0%,#e21b24_46%,#c4161e_100%)] p-6 text-white shadow-[0_18px_40px_-28px_rgba(196,22,30,0.85)] sm:p-7">
      <span className="pointer-events-none absolute -top-20 -left-12 size-48 rounded-full bg-white/10" aria-hidden />
      <span className="pointer-events-none absolute -right-10 -bottom-16 size-56 rounded-full bg-white/10" aria-hidden />
      <div className="relative">
        <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-white/75">NEWSLETTER</p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight">Get 15% Off Your First Order</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">
          Subscribe for exclusive deals, new arrivals and flash sale alerts.
        </p>
        {subscribed ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-3 text-sm font-semibold ring-1 ring-white/25">
            <Check className="size-4" strokeWidth={2.5} />
            You&apos;re on the list. Watch your inbox for the welcome offer.
          </p>
        ) : (
          <form className="mt-6 space-y-2.5" onSubmit={handleSubmit} noValidate>
            <label htmlFor="essentials-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="essentials-newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError('')
              }}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'essentials-newsletter-error' : undefined}
              className="h-11 w-full rounded-lg border border-white/30 bg-white/10 px-3.5 text-sm text-white outline-none placeholder:text-white/65 focus:border-white focus:bg-white/15"
            />
            {error ? (
              <p id="essentials-newsletter-error" className="text-xs font-semibold text-white">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-white text-sm font-semibold text-nav-red transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </article>
  )
}

export default function EssentialsCloseout() {
  return (
    <div className="mt-8 sm:mt-10">
      <div className="flex justify-center">
        <Link
          to="/products/explore"
          className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-red"
        >
          View All Products
          <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="relative flex min-h-[15.5rem] flex-col overflow-hidden rounded-[1.4rem] bg-[linear-gradient(155deg,#1ea854_0%,#149143_48%,#0c7334_100%)] p-6 text-white shadow-[0_18px_40px_-28px_rgba(12,115,52,0.8)] sm:p-7">
          <span className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-white/10" aria-hidden />
          <span className="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-black/10" aria-hidden />
          <div className="relative">
            <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-white/75">MOBILE APP</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">Shop on the Go</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">
              Get exclusive app-only deals and track orders in real time.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <StoreBadge href="#" label="Download on the App Store" src={Images.common.app_store} />
              <StoreBadge href="#" label="Get it on Google Play" src={Images.common.play_store} />
            </div>
          </div>
        </article>

        <NewsletterCard />
      </div>
    </div>
  )
}
