import { ImageIcon } from 'lucide-react'
import { Link } from 'react-router'

export default function CategoryHeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#fbe4e1] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xs sm:max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 sm:text-sm">
            JBL Headset
          </p>
          <h2 className="mt-1.5 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-[2rem]">
            Feel the Bass, Feel the Beat
          </h2>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center rounded-full bg-auth-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-auth-primary-hover"
          >
            Explore Collection
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex aspect-[4/5] w-28 shrink-0 items-center justify-center rounded-xl bg-white/70 text-slate-300 sm:w-36 lg:w-40">
            <ImageIcon className="size-9 sm:size-10" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="flex aspect-square w-24 shrink-0 items-center justify-center rounded-xl bg-white/70 text-slate-300 sm:w-28 lg:w-32">
            <ImageIcon className="size-8 sm:size-9" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}
