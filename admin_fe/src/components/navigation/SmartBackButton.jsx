import { ArrowLeft } from 'lucide-react'
import useSmartBack from '../../hooks/useSmartBack'

const VARIANT_CLASSES = {
  text: 'inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand',
  primary: 'cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800',
  'button-primary': 'inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover',
}

export default function SmartBackButton({
  fallback,
  fallbackLabel,
  labelStyle = 'back',
  variant = 'primary',
  className = '',
  iconClassName = 'size-4',
  showIcon = true,
  children,
  onClick,
  type = 'button',
  ...props
}) {
  const { label, goBack } = useSmartBack(fallback, { fallbackLabel, labelStyle })
  const content = children ?? label
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary

  const handleClick = (event) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      goBack()
    }
  }

  return (
    <button
      type={type}
      className={className || variantClass}
      onClick={handleClick}
      {...props}
    >
      {showIcon ? <ArrowLeft className={iconClassName} aria-hidden="true" /> : null}
      {content}
    </button>
  )
}
