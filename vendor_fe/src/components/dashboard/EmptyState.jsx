export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'px-5 py-8' : 'px-5 py-12'}`}>
      <span className={`mb-4 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200 ${compact ? 'size-12' : 'size-14'}`}>
        <Icon className={compact ? 'size-5' : 'size-6'} strokeWidth={1.75} />
      </span>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
