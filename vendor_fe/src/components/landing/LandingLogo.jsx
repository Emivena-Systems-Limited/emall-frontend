import { Link } from 'react-router'
import Images from '../../utils/Images'

export default function LandingLogo({ variant = 'dark', className = '', imgClassName = '' }) {
  const isLight = variant === 'light'

  return (
    <Link
      to="/"
      className={`inline-flex shrink-0 items-center transition-opacity hover:opacity-90 ${className}`}
    >
      <img
        src={isLight ? Images.brand.logo : Images.brand.logoWhite}
        alt="EZ-Mall Vendor"
        className={imgClassName || 'h-12 w-auto max-w-none object-contain object-left sm:h-14'}
      />
    </Link>
  )
}
