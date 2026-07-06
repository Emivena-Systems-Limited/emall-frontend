import { isLightProductColor, resolveProductColor } from '../../utils/colorSwatches'

const SIZE_CLASSES = {
  sm: 'size-9',
  md: 'size-11',
}

export default function ColorFilterOption({
  label,
  selected = false,
  onClick,
  size = 'sm',
}) {
  const color = resolveProductColor(label)
  const circleSize = SIZE_CLASSES[size] ?? SIZE_CLASSES.sm
  const isLight = isLightProductColor(label) || color === '#ffffff'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Color: ${label}`}
      className="group inline-flex w-14 shrink-0 cursor-pointer flex-col items-center gap-1.5 py-0.5 outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-auth-primary/40 sm:w-16"
    >
      <span
        className={[
          'relative flex items-center justify-center rounded-full transition-all duration-200',
          circleSize,
          selected
            ? 'ring-2 ring-slate-900 ring-offset-2 ring-offset-white'
            : 'ring-1 ring-slate-200 group-hover:ring-slate-300',
        ].join(' ')}
      >
        {color === 'multicolor' ? (
          <span
            className={[
              'rounded-full bg-linear-to-br from-rose-400 via-amber-300 to-sky-500',
              circleSize,
            ].join(' ')}
          />
        ) : (
          <span
            className={[
              'rounded-full',
              circleSize,
              isLight ? 'border border-slate-200' : '',
            ].join(' ')}
            style={{ backgroundColor: color }}
          />
        )}
      </span>
      <span
        className={[
          'line-clamp-2 w-full text-center text-[0.625rem] leading-tight sm:text-[0.6875rem]',
          selected ? 'font-medium text-slate-900' : 'font-normal text-slate-600',
        ].join(' ')}
      >
        {label}
      </span>
    </button>
  )
}

export function ColorFilterRow({ options, selectedValues, onToggle, size = 'sm' }) {
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-3 sm:gap-x-2">
      {options.map((option) => (
        <ColorFilterOption
          key={option.id}
          label={option.label}
          size={size}
          selected={selectedValues.includes(option.value)}
          onClick={() => onToggle(option.value)}
        />
      ))}
    </div>
  )
}
