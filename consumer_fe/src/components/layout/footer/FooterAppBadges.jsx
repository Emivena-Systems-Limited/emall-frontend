export default function FooterAppBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="#"
        aria-label="Get it on Google Play"
        className="inline-flex min-w-[140px] items-center gap-2 rounded-lg bg-black px-3 py-2 text-white transition-opacity hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0" fill="currentColor">
          <path d="M3.6 1.8c-.3.2-.5.6-.5 1v18.4c0 .4.2.8.5 1l10.2-10.2L3.6 1.8zm11.4 9.4-2.5 2.5 2.5 2.5 5.8-3.3c.9-.5.9-1.9 0-2.4l-5.8-3.3zM12 12.7 3.6 21.1c.3.2.7.3 1.1.1l11.7-6.7L12 12.7zm0-1.4L16.4 4.5 4.7 1.8c-.4-.2-.8-.1-1.1.1L12 11.3z" />
        </svg>
        <span className="leading-tight">
          <span className="block text-[0.625rem] uppercase">Get it on</span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </a>

      <a
        href="#"
        aria-label="Download on the App Store"
        className="inline-flex min-w-[140px] items-center gap-2 rounded-lg bg-black px-3 py-2 text-white transition-opacity hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0" fill="currentColor">
          <path d="M16.8 12.7c-.03-3.2 2.6-4.7 2.7-4.8-1.5-2.2-3.8-2.5-4.6-2.5-2-.2-3.9 1.2-4.9 1.2-1 0-2.6-1.1-4.3-1.1-2.2 0-4.2 1.3-5.3 3.3-2.3 3.9-.6 9.6 1.6 12.8 1.1 1.6 2.4 3.4 4.1 3.3 1.6-.1 2.2-1 4.1-1s2.5 1 4.2.9c1.7-.1 2.8-1.6 3.9-3.2 1.2-1.8 1.7-3.5 1.7-3.6-.04-.02-3.3-1.3-3.3-5.3zM14.2 4.8c.9-1.1 1.5-2.6 1.3-4.1-1.3.1-2.8.9-3.7 2-.8 1-1.5 2.6-1.3 4.1 1.4.1 2.9-.8 3.7-2z" />
        </svg>
        <span className="leading-tight">
          <span className="block text-[0.625rem] uppercase">Download on the</span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </a>
    </div>
  )
}
