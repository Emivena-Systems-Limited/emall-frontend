// import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import StoreLogo from '../layout/StoreLogo'

const logoPanelClip = 'polygon(0 0, 100% 0, calc(100% - 1.75rem) 100%, 0 100%)'

export default function NationwideDeliveryBanner({ embedded = false }) {
  const banner = (
    <Link
      to="/delivery"
      className="group flex w-full items-stretch overflow-hidden bg-auth-primary transition-colors hover:bg-auth-primary-hover"
    >
      <div
        className="flex shrink-0 self-stretch bg-auth-primary p-[3px]"
        style={{ clipPath: logoPanelClip }}
      >
        <div
          className="flex items-center bg-white py-2.5 pr-8 pl-[clamp(0.6rem,2vw,1.85rem)] sm:py-3 sm:pr-11"
          style={{ clipPath: logoPanelClip }}
        >
          <StoreLogo variant="brand" size="nav" linked={false} className="shrink-0" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-[clamp(0.75rem,2vw,2rem)] sm:gap-4 sm:py-3.5">
        <p className="min-w-0 text-sm font-semibold leading-snug text-white sm:text-base lg:text-lg">
          Nationwide Delivery For All Purchases
        </p>

        {/* <span className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:bg-white/20 sm:size-10">
          <ChevronRight className="size-5 sm:size-6" strokeWidth={2.25} />
        </span> */}
      </div>
    </Link>
  )

  if (embedded) {
    return banner
  }

  return <section className="w-full bg-white">{banner}</section>
}
