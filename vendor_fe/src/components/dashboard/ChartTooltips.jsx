export function LineTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">{label}</p>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
        <span className="size-2 rounded-full bg-cyan-700" />
        GH₵ {payload[0].value.toLocaleString()}
      </div>
    </div>
  )
}

export function FulfillmentTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.value} {p.name.toLowerCase()}
        </div>
      ))}
    </div>
  )
}

export function BarTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <span className="size-2 rounded-full" style={{ background: p.fill }} />
          {p.value} {p.name === 'New orders' ? 'new' : 'fulfilled'}
        </div>
      ))}
    </div>
  )
}

export function DonutTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3 py-2 font-sans shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
        <span className="size-2.5 rounded-full" style={{ background: d.payload.color }} />
        {d.name}
        <span className="ml-auto pl-4 text-sm font-extrabold">GH₵ {d.value.toLocaleString()}</span>
      </div>
    </div>
  )
}
