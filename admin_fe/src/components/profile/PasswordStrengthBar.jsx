import { useMemo } from 'react'
import { Check, Circle, X } from 'lucide-react'

const REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (password) => password.length >= 8 },
  { id: 'upper', label: 'An uppercase letter', test: (password) => /[A-Z]/.test(password) },
  { id: 'lower', label: 'A lowercase letter', test: (password) => /[a-z]/.test(password) },
  { id: 'number', label: 'A number', test: (password) => /[0-9]/.test(password) },
]

const LEVELS = [
  { label: 'Very weak', textColor: 'text-red-600', barColor: 'bg-red-500' },
  { label: 'Weak', textColor: 'text-orange-600', barColor: 'bg-orange-500' },
  { label: 'Fair', textColor: 'text-amber-600', barColor: 'bg-amber-500' },
  { label: 'Good', textColor: 'text-lime-700', barColor: 'bg-lime-500' },
  { label: 'Strong', textColor: 'text-emerald-700', barColor: 'bg-emerald-500' },
]

export default function PasswordStrengthBar({ password }) {
  const met = useMemo(
    () => REQUIREMENTS.map((requirement) => requirement.test(password)),
    [password],
  )
  const score = met.filter(Boolean).length

  if (!password) return null

  const level = LEVELS[score] ?? LEVELS[4]

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${index < score ? level.barColor : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${level.textColor}`}>
        Password strength: <span>{level.label}</span>
      </p>
      <ul className="space-y-1">
        {REQUIREMENTS.map((requirement, index) => {
          const passed = met[index]
          return (
            <li
              key={requirement.id}
              className={`flex items-center gap-1.5 text-[11px] font-medium ${
                passed ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {passed
                ? <Check className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
                : <Circle className="size-3.5" aria-hidden="true" strokeWidth={2} />}
              {requirement.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function PasswordMatchIndicator({ password, confirmation }) {
  if (!confirmation) return null

  const match = password === confirmation

  return (
    <p
      className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
        match ? 'text-emerald-600' : 'text-red-600'
      }`}
      role="status"
    >
      {match
        ? <Check className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
        : <X className="size-3.5" aria-hidden="true" strokeWidth={2.5} />}
      {match ? 'Passwords match' : 'Passwords do not match'}
    </p>
  )
}
