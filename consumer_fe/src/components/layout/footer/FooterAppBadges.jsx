import Images from '../../../utils/Images'
export default function FooterAppBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
          href="#"
          aria-label="Get it on Google Play"
        className="inline-flex min-w-[140px] items-center gap-2 rounded-lg bg-black px-3 py-2 text-white transition-opacity hover:opacity-90"
      >
      <img src={Images.common.playstore} alt="Google Play" className="size-6 shrink-0" />
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
        <img src={Images.common.appstore} alt="App Store" className="size-6 shrink-0" />
        <span className="leading-tight">
          <span className="block text-[0.625rem] uppercase">Download on the</span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </a>
    </div>
  )
}
