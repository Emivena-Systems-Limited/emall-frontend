import { useId } from 'react'
import { Link } from 'react-router'
import { SITE_NAME } from '../../constants/siteNav'

const sizeStyles = {
  md: {
    icon: 'size-9 shrink-0 sm:size-10',
    text: 'text-lg font-semibold tracking-tight sm:text-xl lg:text-[1.35rem]',
  },
  lg: {
    icon: 'size-12 shrink-0 sm:size-14',
    text: 'text-xl font-semibold tracking-tight sm:text-2xl lg:text-[1.75rem]',
  },
}

export default function StoreLogo({
  variant = 'light',
  showText = true,
  size = 'md',
  className = '',
  linkTo = '/',
  linked = true,
}) {
  const gradientId = useId()
  const textClass = variant === 'light' ? 'text-white' : 'text-slate-900'
  const styles = sizeStyles[size] ?? sizeStyles.md

  const content = (
    <>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className={styles.icon}
      >
        <defs>
          <linearGradient id={gradientId} x1="8" y1="34" x2="32" y2="6" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E8C547" />
            <stop offset="0.45" stopColor="#C9A227" />
            <stop offset="1" stopColor="#9A7B1A" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="12" height="12" rx="2" fill={`url(#${gradientId})`} />
        <rect x="22" y="6" width="12" height="12" rx="2" fill={`url(#${gradientId})`} opacity="0.85" />
        <rect x="6" y="22" width="12" height="12" rx="2" fill={`url(#${gradientId})`} opacity="0.7" />
        <path
          d="M22 22h12v12H28V28h-6v6h-6V22h6v6h6v-6z"
          fill={`url(#${gradientId})`}
        />
      </svg>
      {showText && (
        <span className={`${styles.text} ${textClass}`}>
          {SITE_NAME}
        </span>
      )}
    </>
  )

  if (!linked) {
    return (
      <span className={`inline-flex shrink-0 items-center gap-2.5 sm:gap-3 ${className}`}>
        {content}
      </span>
    )
  }

  return (
    <Link
      to={linkTo}
      className={`group inline-flex shrink-0 items-center gap-2.5 sm:gap-3 ${className}`}
      aria-label={`${SITE_NAME} home`}
    >
      {content}
    </Link>
  )
}
