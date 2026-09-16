import Images from '../../../utils/Images'
export default function FooterAppBadges() {
  return (
    <div className="flex flex-wrap items-start gap-3 lg:flex-col">
      <a
        href="#"
        aria-label="Get it on Google Play"
        className="inline-flex min-h-11 min-w-36 cursor-pointer items-center gap-2 rounded-lg bg-black px-3 py-2 text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <img src={Images.common.playstore} alt="" className="size-6 shrink-0" />
        <span className="leading-tight">
          <span className="block text-[0.625rem] uppercase">Get it on</span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </a>

      <a
        href="#"
        aria-label="Download on the App Store"
        className="inline-flex min-h-11 min-w-36 cursor-pointer items-center gap-2 rounded-lg bg-black px-3 py-2 text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <img src={Images.common.appstore} alt="" className="size-6 shrink-0" />
        <span className="leading-tight">
          <span className="block text-[0.625rem] uppercase">Download on the</span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </a>
    </div>
  )
}
