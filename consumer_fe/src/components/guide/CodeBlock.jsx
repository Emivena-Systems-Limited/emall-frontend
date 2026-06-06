export default function CodeBlock({ title, code }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
      {title && (
        <div className="border-b border-slate-800 px-4 py-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-100">
        <code>{code.trim()}</code>
      </pre>
    </div>
  )
}
