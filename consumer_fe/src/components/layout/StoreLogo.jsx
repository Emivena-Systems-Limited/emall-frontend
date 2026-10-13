import { Link } from 'react-router'
import { SITE_NAME } from '../../constants/siteNav'
import Images from '../../utils/Images'

const sizeStyles = {
  sm: 'h-8 w-auto max-w-36 sm:h-9 sm:max-w-40',
  nav: 'h-8 w-auto max-w-[7.75rem] sm:h-9 sm:max-w-[8.75rem] lg:h-11 lg:max-w-none',
  md: 'h-10 w-auto max-w-44 sm:h-11 sm:max-w-48',
  lg: 'h-12 w-auto max-w-52 sm:h-14 sm:max-w-60',
}

export default function StoreLogo({
  variant = 'light',
  size = 'md',
  className = '',
  linkTo = '/',
  linked = true,
}) {
  const sources = {
    light: Images.common.logo_white,
    dark: Images.common.logo,
    brand: Images.common.ez_mall_logo,
    brandLight: Images.common.ez_mall_logo_white,
  }
  const src = sources[variant] ?? sources.dark

  const image = (
    <img
      src={src}
      alt={linked ? '' : SITE_NAME}
      width={2172}
      height={724}
      className={`${sizeStyles[size] ?? sizeStyles.md} object-contain object-left`}
    />
  )

  if (!linked) {
    return (
      <span className={`inline-flex shrink-0 items-center ${className}`}>
        {image}
      </span>
    )
  }

  return (
    <Link
      to={linkTo}
      className={`group inline-flex shrink-0 items-center ${className}`}
      aria-label={`${SITE_NAME} home`}
    >
      {image}
    </Link>
  )
}
