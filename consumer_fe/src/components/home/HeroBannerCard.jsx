import { Link } from 'react-router'
import { HERO_BANNER_ASPECT_RATIO } from '../../constants/heroSection'

export default function HeroBannerCard({ banner }) {
  return (
    <Link
      to={banner.href}
      aria-label={`View promotion ${banner.id}`}
      style={{ aspectRatio: HERO_BANNER_ASPECT_RATIO }}
      className="group block w-full min-w-0 overflow-hidden rounded-xl bg-slate-100 sm:rounded-2xl"
    >
      <img
        src={banner.image}
        alt=""
        className="size-full min-h-0 min-w-0 object-contain object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
        loading="lazy"
      />
    </Link>
  )
}
