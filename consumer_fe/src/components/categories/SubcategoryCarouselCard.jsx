import { ImageIcon } from 'lucide-react'
import { Link } from 'react-router'
import { formatProductCount } from '../../utils/categoryDisplay'

export default function SubcategoryCarouselCard({ subcategory }) {
  const productCountLabel = formatProductCount(subcategory.productCount)

  return (
    <Link
      to={subcategory.href}
      className="group block w-[12rem] shrink-0 sm:w-[13.5rem] lg:w-[15rem]"
    >
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-100 text-slate-300 transition-colors group-hover:bg-slate-200/80">
        <ImageIcon className="size-10 sm:size-11 lg:size-12" strokeWidth={1.5} aria-hidden />
      </div>

      <h3 className="mt-3.5 text-[0.9375rem] font-bold leading-snug text-slate-900 sm:text-base">
        {subcategory.label}
      </h3>
      {productCountLabel ? (
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          {productCountLabel} Products
        </p>
      ) : null}
    </Link>
  )
}
