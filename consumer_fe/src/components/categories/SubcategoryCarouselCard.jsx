import { ImageIcon } from 'lucide-react'
import { Link } from 'react-router'

export default function SubcategoryCarouselCard({
  subcategory,
  fluid = false,
  containImage = false,
}) {
  const productCount = subcategory.productCount ?? 0
  const image = subcategory.image

  return (
    <Link
      to={subcategory.href}
      className={`group block ${
        fluid ? 'w-full' : 'w-[14rem] shrink-0 sm:w-[16rem] lg:w-[18rem]'
      }`}
    >
      <div
        className={`flex items-center justify-center overflow-hidden rounded-2xl text-slate-300 transition-colors ${
          containImage
            ? 'aspect-[4/5] bg-slate-50 p-3 sm:p-4 lg:p-5 group-hover:bg-slate-100'
            : 'aspect-[4/3] bg-slate-100 group-hover:bg-slate-200/80'
        }`}
      >
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className={
              containImage
                ? 'max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]'
                : 'size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]'
            }
          />
        ) : (
          <ImageIcon className="size-10 sm:size-11 lg:size-12" strokeWidth={1.5} aria-hidden />
        )}
      </div>

      <h3 className="mt-3.5 text-[0.9375rem] font-bold leading-snug text-slate-900 sm:text-base">
        {subcategory.label}
      </h3>
      {productCount > 0 ? (
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          {productCount.toLocaleString('en-US')} Products
        </p>
      ) : null}
    </Link>
  )
}
