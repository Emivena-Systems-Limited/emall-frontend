import { Link } from 'react-router'

export default function SubcategoryItem({ subcategory, isActive = false }) {
  return (
    <Link
      to={subcategory.href}
      aria-current={isActive ? 'page' : undefined}
      className="group inline-flex w-12 flex-col items-center gap-1 py-0.5 outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-auth-primary/40 sm:w-14"
    >
      <span
        className={[
          'relative flex size-12 items-center justify-center overflow-hidden rounded-full bg-slate-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:size-14',
          isActive
            ? 'ring-2 ring-auth-primary ring-offset-1 shadow-[0_6px_18px_-8px_rgba(199,59,45,0.35)]'
            : 'ring-1 ring-slate-100 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_20px_-10px_rgba(15,23,42,0.18)]',
        ].join(' ')}
      >
        <img
          src={subcategory.image}
          alt=""
          className="size-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          loading="lazy"
        />
      </span>

      <span
        className={[
          'line-clamp-2 w-full text-center text-[0.625rem] leading-tight sm:text-[0.6875rem]',
          isActive ? 'font-semibold text-auth-primary' : 'font-medium text-slate-700 group-hover:text-slate-900',
        ].join(' ')}
      >
        {subcategory.label}
      </span>
    </Link>
  )
}
