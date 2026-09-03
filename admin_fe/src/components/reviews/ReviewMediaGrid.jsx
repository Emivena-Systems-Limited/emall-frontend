import { FileText, Film, Image as ImageIcon, Trash2 } from 'lucide-react'

function canRemoveMedia(item) {
  const id = String(item?.id ?? '')
  return Boolean(id) && !id.startsWith('media-')
}

function MediaTile({ item, onRemove }) {
  const removable = typeof onRemove === 'function' && canRemoveMedia(item)

  return (
    <figure className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      {item.kind === 'image' && item.url ? (
        <a href={item.url} target="_blank" rel="noreferrer" className="block">
          <img src={item.url} alt="" className="aspect-square w-full object-cover" />
        </a>
      ) : item.kind === 'video' && item.url ? (
        <video src={item.url} className="aspect-square w-full object-cover bg-slate-950" controls preload="metadata" />
      ) : (
        <a
          href={item.url || undefined}
          target="_blank"
          rel="noreferrer"
          className="flex aspect-square w-full flex-col items-center justify-center gap-2 px-3 text-center"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
            {item.kind === 'video' ? <Film className="size-4" /> : item.kind === 'image' ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
          </span>
          <span className="line-clamp-2 text-[11px] font-medium text-slate-600">{item.name || 'Attachment'}</span>
        </a>
      )}
      {removable ? (
        <button
          type="button"
          onClick={() => onRemove(item)}
          aria-label={`Remove ${item.name || 'attachment'}`}
          className="absolute top-2 right-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-slate-500 opacity-100 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Trash2 className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
      <figcaption className="sr-only">{item.name}</figcaption>
    </figure>
  )
}

export default function ReviewMediaGrid({ media = [], onRemove }) {
  if (!media.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
        This review has no photos or other attachments.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {media.map((item) => (
        <li key={item.id}>
          <MediaTile item={item} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  )
}
