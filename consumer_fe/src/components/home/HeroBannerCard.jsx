import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

export default function HeroBannerCard({ banner }) {
  const alignRight = banner.copySide === 'right'

  return (
    <article className="relative aspect-[5/3] overflow-hidden bg-slate-900 sm:aspect-[2/1] lg:aspect-[3/1] lg:min-h-[22rem]">
      <img
        src={banner.image}
        alt=""
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/45 sm:hidden" />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 hidden w-[min(48rem,82%)] sm:block ${
          alignRight
            ? 'right-0 bg-linear-to-l from-black/80 via-black/50 via-55% to-transparent'
            : 'left-0 bg-linear-to-r from-black/80 via-black/50 via-55% to-transparent'
        }`}
      />

      <div
        className={`absolute inset-0 flex items-center justify-start px-11 py-4 sm:items-end sm:px-16 sm:py-0 sm:pb-8 lg:px-20 lg:pb-10 ${
          alignRight ? 'sm:justify-end' : 'sm:justify-start'
        }`}
      >
        <div
          className={`relative flex w-full min-w-0 max-w-full flex-col items-start text-left ${
            alignRight ? 'sm:items-end sm:text-right' : ''
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-[2rem] bg-black/45 blur-xl sm:-inset-x-8 sm:-inset-y-5 sm:blur-2xl"
          />
          <div className="relative w-full min-w-0">
            <h2
              className={`font-bold tracking-tight text-white ${
                banner.singleLine
                  ? 'text-[1.65rem] leading-none sm:whitespace-nowrap sm:text-4xl sm:leading-tight lg:text-5xl'
                  : 'text-[1.65rem] leading-none sm:text-4xl sm:leading-tight lg:text-5xl'
              }`}
            >
              {banner.lead ? (
                <span className={banner.singleLine ? undefined : 'block'}>
                  {banner.lead}
                  {banner.singleLine ? ' ' : ''}
                </span>
              ) : null}
              <span className={banner.singleLine ? 'text-[#ffe14d]' : 'block text-[#ffe14d]'}>
                {banner.accent}.
              </span>
            </h2>
            <p className="mt-2 line-clamp-2 text-xs leading-snug text-white/90 sm:mt-3 sm:line-clamp-none sm:whitespace-nowrap sm:text-sm lg:text-base">
              {banner.subtitle}
            </p>
            <div
              className={`mt-3 flex w-full min-w-0 flex-nowrap items-center gap-2 text-xs sm:mt-5 sm:gap-3 sm:text-sm ${
                alignRight ? 'sm:justify-end' : ''
              }`}
            >
              <Link
                to={banner.href}
                className="inline-flex shrink-0 items-center gap-[0.35em] rounded-lg bg-nav-red px-[0.9em] py-[0.55em] text-left text-[1em] font-semibold whitespace-nowrap text-white transition-colors hover:bg-nav-red-deep sm:rounded-md"
              >
                {banner.shopLabel}
                <ArrowRight className="size-[1.15em]" strokeWidth={2.25} aria-hidden />
              </Link>
              <Link
                to={banner.arrivalsHref}
                className="inline-flex shrink-0 items-center rounded-full bg-slate-200/90 px-[0.9em] py-[0.55em] text-[1em] font-semibold whitespace-nowrap text-slate-800 transition-colors hover:bg-white"
              >
                {banner.arrivalsLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
