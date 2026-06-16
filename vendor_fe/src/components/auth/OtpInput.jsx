import { useRef } from 'react'
import { OTP_LENGTH } from '../../constants/auth'

export default function OtpInput({ value, onChange, error = false, disabled = false }) {
  const inputsRef = useRef([])

  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '')

  const focusInput = (index) => {
    inputsRef.current[index]?.focus()
  }

  const updateDigit = (index, digit) => {
    const sanitized = digit.replace(/\D/g, '').slice(-1)
    const next = value.split('')
    next[index] = sanitized
    onChange(next.join('').slice(0, OTP_LENGTH))

    if (sanitized && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1)
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    onChange(pasted)
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1))
  }

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1}`}
            autoFocus={index === 0}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            className={`size-11 rounded-xl border-2 bg-white text-center text-lg font-semibold text-slate-900 outline-none transition-colors sm:size-14 sm:text-xl ${
              error ? 'border-red-400' : digit ? 'border-sky-600' : 'border-slate-200 focus:border-sky-600'
            } ${disabled ? 'opacity-60' : ''}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-center text-xs text-red-600" role="alert">
          Please check and re-enter the 6-digit verification code
        </p>
      )}
    </div>
  )
}
