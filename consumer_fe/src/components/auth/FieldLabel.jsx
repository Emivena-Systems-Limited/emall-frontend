export default function FieldLabel({ htmlFor, label, icon: Icon }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-sm text-slate-800">
      {Icon && (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-auth-primary">
          <Icon className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
        </span>
      )}
      <span>{label}</span>
    </label>
  )
}
