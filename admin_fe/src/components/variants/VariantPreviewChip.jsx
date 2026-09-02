import AttributeIcon from './AttributeIcon'

export default function VariantPreviewChip({ attribute, value, isEdit }) {
  const hasContent = Boolean(attribute || value)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
        <AttributeIcon attribute={attribute} className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {isEdit ? 'Editing variant' : 'New variant'}
        </p>
        <p className="truncate text-sm font-bold text-slate-900">
          {hasContent
            ? `${attribute || 'Type'} · ${value || 'Value'}`
            : 'Choose a type and value below'}
        </p>
      </div>
    </div>
  )
}
