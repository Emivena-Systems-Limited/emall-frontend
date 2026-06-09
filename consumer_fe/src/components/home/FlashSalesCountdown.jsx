import { useEffect, useState } from 'react'

function getTimeLeft(endAt) {
  const diff = Math.max(0, new Date(endAt).getTime() - Date.now())

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function FlashSalesCountdown({ endAt }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endAt))

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(endAt))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [endAt])

  const { days, hours, minutes, seconds } = timeLeft

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      <span className="text-sm text-slate-600 sm:text-[0.9375rem]">Deals ends in</span>
      <span
        className="inline-flex items-center rounded-md bg-auth-primary px-2.5 py-1.5 text-xs font-bold tabular-nums tracking-wide text-white sm:px-3 sm:py-2 sm:text-[0.8125rem]"
        aria-live="polite"
        aria-atomic="true"
      >
        {days}d&nbsp;:&nbsp;{pad(hours)}h&nbsp;:&nbsp;{pad(minutes)}m&nbsp;:&nbsp;{pad(seconds)}s
      </span>
    </div>
  )
}
