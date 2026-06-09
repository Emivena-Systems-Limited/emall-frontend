import { Link } from 'react-router'

export default function HeroBannerCard({ banner }) {
  return (
    <Link
      to={banner.href}
      aria-label={`View promotion ${banner.id}`}
      className="group block h-64 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-72 lg:h-80"
    >
      <img
        src={banner.image}
        alt=""
        className="size-full object-contain object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        loading="lazy"
      />
    </Link>
  )
}
