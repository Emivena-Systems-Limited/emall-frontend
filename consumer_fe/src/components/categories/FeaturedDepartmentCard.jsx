import { Link } from 'react-router'

export default function FeaturedDepartmentCard({
  spotlight,
  featured = false,
  imageOnly = false,
  fillHeight = false,
  className = '',
}) {
  const sizeClass = imageOnly
    ? fillHeight
      ? 'h-full w-full min-h-[13rem] sm:min-h-[17rem] lg:min-h-0'
      : 'aspect-[1881/836] w-full min-h-[13rem] sm:min-h-[17rem] lg:min-h-[22rem] xl:min-h-[24rem]'
    : 'min-h-[13rem] sm:min-h-[17rem] lg:h-full lg:min-h-[22rem] xl:min-h-[24rem]'

  return (
    <Link
      to={spotlight.href}
      className={`group relative block overflow-hidden rounded-2xl ${sizeClass} ${className}`}
    >
      <img
        src={spotlight.image}
        alt={imageOnly ? spotlight.title : ''}
        className="absolute inset-0 size-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        loading="lazy"
      />
      {!imageOnly ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-7">
            {featured && spotlight.badge ? (
              <span className="mb-3 inline-block rounded-sm bg-[#c62828] px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-white sm:text-[0.6875rem]">
                {spotlight.badge}
              </span>
            ) : null}

            <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-[1.75rem]">
              {spotlight.title}
            </h2>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/85 sm:text-[0.9375rem]">
              {spotlight.subtitle}
            </p>
          </div>
        </>
      ) : null}
    </Link>
  )
}
