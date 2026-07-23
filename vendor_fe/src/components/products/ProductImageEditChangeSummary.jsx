import { ImageIcon } from 'lucide-react'

function ChangeStat({ label, value, tone = 'slate' }) {
  if (!value) return null

  const toneClass = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-900 ring-amber-100',
    rose: 'bg-rose-50 text-rose-800 ring-rose-100',
  }[tone] ?? 'bg-slate-100 text-slate-700 ring-slate-200'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClass}`}>
      <span className="tabular-nums">{value}</span>
      <span>{label}</span>
    </span>
  )
}

export default function ProductImageEditChangeSummary({ summary }) {
  if (!summary?.hasChanges) return null

  const { product, descriptive } = summary

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200">
          <ImageIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Pending photo changes</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Kept photos are sent with their backend <code className="rounded bg-white px-1 text-[10px]">id</code>.
            New uploads are sent with <code className="rounded bg-white px-1 text-[10px]">upload_id</code> after S3 upload.
            Removed photos are simply omitted from the save payload.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ChangeStat label="product kept" value={product.kept} tone="slate" />
            <ChangeStat label="product removed" value={product.removedOnly} tone="rose" />
            <ChangeStat label="product added" value={product.added} tone="emerald" />
            <ChangeStat label="main replaced" value={product.replaced} tone="amber" />
            <ChangeStat label="detail kept" value={descriptive.kept} tone="slate" />
            <ChangeStat label="detail removed" value={descriptive.removed} tone="rose" />
            <ChangeStat label="detail added" value={descriptive.added} tone="emerald" />
          </div>
        </div>
      </div>
    </section>
  )
}
