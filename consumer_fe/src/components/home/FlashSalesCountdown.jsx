import { useEffect, useState } from 'react'

function getTimeLeft(endAt) {
  const diff = Math.max(0, new Date(endAt).getTime() - Date.now())
  const totalHours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { totalHours, minutes, seconds }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function TimeUnit({ value, label }) {
  return (
    <span className="flex flex-col items-center gap-1">
      <span className="flex h-12 min-w-14 items-center justify-center rounded-lg bg-white/20 px-2.5 text-2xl leading-none font-bold tabular-nums text-white backdrop-blur-sm">
        {value}
      </span>
      <span className="text-[10px] leading-none font-medium tracking-wider text-white/80">{label}</span>
    </span>
  )
}

export default function FlashSalesCountdown({ endAt }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endAt))

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(endAt))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [endAt])

  const { totalHours, minutes, seconds } = timeLeft

  return (
    <div
      className="flex items-start gap-1.5 text-white"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Ends in ${pad(totalHours)} hours, ${pad(minutes)} minutes, ${pad(seconds)} seconds`}
    >
      <span className="mr-1 flex h-12 items-center text-sm font-medium text-white/95">Ends in</span>
      <TimeUnit value={pad(totalHours)} label="HRS" />
      <span className="flex h-12 items-center px-0.5 text-xl leading-none font-semibold text-white/90" aria-hidden>:</span>
      <TimeUnit value={pad(minutes)} label="MIN" />
      <span className="flex h-12 items-center px-0.5 text-xl leading-none font-semibold text-white/90" aria-hidden>:</span>
      <TimeUnit value={pad(seconds)} label="SEC" />
    </div>
  )
}
