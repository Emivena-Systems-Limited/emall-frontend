import { useMemo } from 'react'

const checks = [
  (p) => p.length >= 8,
  (p) => /[A-Z]/.test(p),
  (p) => /[a-z]/.test(p),
  (p) => /[0-9]/.test(p),
]

const LEVELS = [
  { label: 'Very weak', textColor: 'text-red-600',     barColor: 'bg-red-500' },
  { label: 'Weak',      textColor: 'text-orange-600',  barColor: 'bg-orange-500' },
  { label: 'Fair',      textColor: 'text-amber-600',   barColor: 'bg-amber-500' },
  { label: 'Good',      textColor: 'text-lime-700',    barColor: 'bg-lime-500' },
  { label: 'Strong',    textColor: 'text-emerald-700', barColor: 'bg-emerald-500' },
]

export default function PasswordStrengthBar({ password }) {
  const score = useMemo(() => checks.filter((fn) => fn(password)).length, [password])

  if (!password) return null

  const level = LEVELS[score] ?? LEVELS[4]

  return (
    <div className="mt-2 space-y-1.5 error-animate">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? level.barColor : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${level.textColor}`}>
        Password strength: <span>{level.label}</span>
      </p>
    </div>
  )
}
