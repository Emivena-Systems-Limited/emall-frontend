import { Link } from 'react-router'

export default function HeroBannerCard({ banner }) {
  return (
    <Link
      to={banner.href}
      aria-label={`View promotion ${banner.id}`}
      className="group block h-[clamp(18rem,22vw,30rem)] w-full overflow-hidden rounded-2xl bg-slate-100"
    >
      <img
        src={banner.image}
        alt=""
        className="size-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        loading="lazy"
      />
    </Link>
  )
}
