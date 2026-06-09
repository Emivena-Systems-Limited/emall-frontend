import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import StoreLogo from '../layout/StoreLogo'

const logoPanelClip = 'polygon(0 0, 100% 0, calc(100% - 1.75rem) 100%, 0 100%)'

export default function NationwideDeliveryBanner() {
  return (
    <Link
      to="/delivery"
      className="group flex w-full items-stretch bg-auth-primary transition-colors hover:bg-auth-primary-hover"
    >
      <div
        className="flex shrink-0 items-center bg-[#dc5748] py-4 pl-4 pr-11 transition-colors group-hover:bg-[#d14e44] sm:py-5 sm:pl-6 sm:pr-14 lg:pl-10 lg:pr-16"
        style={{ clipPath: logoPanelClip }}
      >
        <StoreLogo variant="light" linked={false} className="shrink-0" />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 py-4 pr-4 sm:gap-4 sm:py-5 sm:pr-6 lg:pr-10">
        <p className="min-w-0 text-sm font-semibold leading-snug text-white sm:text-base lg:text-lg">
          Nationwide Delivery For All Purchases
        </p>

        <span className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:bg-white/20 sm:size-10">
          <ChevronRight className="size-5 sm:size-6" strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  )
}
