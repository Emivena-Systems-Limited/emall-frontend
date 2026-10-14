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

function CompactTimeUnit({ value, label }) {
  return (
    <span className="flex flex-col items-center gap-1">
      <span className="flex h-12 min-w-14 items-center justify-center rounded-lg bg-white/20 px-2.5 text-2xl leading-none font-bold tabular-nums text-white backdrop-blur-sm">
        {value}
      </span>
      <span className="text-[10px] leading-none font-medium tracking-wider text-white/80">{label}</span>
    </span>
  )
}

function HeroTimeUnit({ value, label }) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span className="flex h-14 min-w-[3.5rem] items-center justify-center rounded-xl bg-white px-3 text-[1.75rem] leading-none font-extrabold tabular-nums text-[#E11D2E] shadow-[0_8px_20px_-12px_rgba(15,23,42,0.45)] sm:h-16 sm:min-w-16 sm:text-[2rem]">
        {value}
      </span>
      <span className="text-[10px] leading-none font-semibold tracking-[0.14em] text-white/90 uppercase">
        {label}
      </span>
    </span>
  )
}

export default function FlashSalesCountdown({ endAt, variant = 'compact' }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endAt))
  const isHero = variant === 'hero'

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(endAt))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [endAt])

  const { totalHours, minutes, seconds } = timeLeft
  const TimeUnit = isHero ? HeroTimeUnit : CompactTimeUnit

  return (
    <div
      className={`flex items-start gap-1.5 text-white ${isHero ? 'gap-2 sm:gap-2.5' : ''}`}
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Ends in ${pad(totalHours)} hours, ${pad(minutes)} minutes, ${pad(seconds)} seconds`}
    >
      <span
        className={`mr-1 flex items-center font-medium text-white/95 ${
          isHero
            ? 'h-14 text-[11px] font-semibold tracking-[0.16em] uppercase sm:h-16 sm:text-xs'
            : 'h-12 text-sm'
        }`}
      >
        {isHero ? 'Deals end in' : 'Ends in'}
      </span>
      <TimeUnit value={pad(totalHours)} label="HRS" />
      <span
        className={`flex items-center px-0.5 leading-none font-semibold text-white/90 ${
          isHero ? 'h-14 text-2xl sm:h-16' : 'h-12 text-xl'
        }`}
        aria-hidden
      >
        :
      </span>
      <TimeUnit value={pad(minutes)} label="MIN" />
      <span
        className={`flex items-center px-0.5 leading-none font-semibold text-white/90 ${
          isHero ? 'h-14 text-2xl sm:h-16' : 'h-12 text-xl'
        }`}
        aria-hidden
      >
        :
      </span>
      <TimeUnit value={pad(seconds)} label="SEC" />
    </div>
  )
}
