import { ImageIcon } from 'lucide-react'
import { Link } from 'react-router'

export default function SubcategoryCarouselCard({ subcategory, fluid = false }) {
  const productCount = subcategory.productCount ?? 0
  const image = subcategory.image

  return (
    <Link
      to={subcategory.href}
      className={`group block ${
        fluid ? 'w-full' : 'w-[12rem] shrink-0 sm:w-[13.5rem] lg:w-[15rem]'
      }`}
    >
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-300 transition-colors group-hover:bg-slate-200/80">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <ImageIcon className="size-10 sm:size-11 lg:size-12" strokeWidth={1.5} aria-hidden />
        )}
      </div>

      <h3 className="mt-3.5 text-[0.9375rem] font-bold leading-snug text-slate-900 sm:text-base">
        {subcategory.label}
      </h3>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
        {productCount.toLocaleString('en-US')} Products
      </p>
    </Link>
  )
}
