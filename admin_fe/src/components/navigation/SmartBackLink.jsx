import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import useSmartBack from '../../hooks/useSmartBack'

const VARIANT_CLASSES = {
  text: 'inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand',
  'text-subtle': 'inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand',
  'button-primary': 'inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover',
  'button-outline': 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50',
}

export default function SmartBackLink({
  fallback,
  fallbackLabel,
  labelStyle = 'back',
  variant = 'text',
  className = '',
  iconClassName = 'size-4',
  showIcon = true,
  children,
  onClick,
  ...props
}) {
  const { to, label } = useSmartBack(fallback, { fallbackLabel, labelStyle })
  const content = children ?? label
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.text

  return (
    <Link
      to={to}
      className={className || variantClass}
      onClick={onClick}
      {...props}
    >
      {showIcon ? <ArrowLeft className={iconClassName} aria-hidden="true" /> : null}
      {content}
    </Link>
  )
}
