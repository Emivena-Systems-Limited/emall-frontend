export default function FieldLabel({ htmlFor, label, icon: Icon }) {
  return (
    <label htmlFor={htmlFor} className="auth-body mb-1 flex items-center gap-1.5 text-slate-800">
      {Icon && (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-auth-primary">
          <Icon className="size-3" strokeWidth={2.25} aria-hidden="true" />
        </span>
      )}
      <span>{label}</span>
    </label>
  )
}
