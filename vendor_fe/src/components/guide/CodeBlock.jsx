import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export default function CodeBlock({ title, code }) {
  const [copied, setCopied] = useState(false)
  const source = String(code ?? '').trim()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2">
        <p className="min-w-0 truncate text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
          {title || 'Code'}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-100">
        <code>{source}</code>
      </pre>
    </div>
  )
}
