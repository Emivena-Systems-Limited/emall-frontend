import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { OTP_LENGTH } from '../../constants/auth'

export default function OtpInput({
  value,
  onChange,
  error = false,
  disabled = false,
  autoFocus = false,
}) {
  const inputsRef = useRef([])

  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '')

  const focusInput = (index) => {
    inputsRef.current[index]?.focus()
  }

  useEffect(() => {
    if (!autoFocus || disabled) return

    const timer = window.setTimeout(() => {
      inputsRef.current[0]?.focus()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [autoFocus, disabled])

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
      <div className="flex justify-center gap-1.5 sm:gap-2 min-[1536px]:gap-2.5 min-[1800px]:gap-3">
        {digits.map((digit, index) => (
          <motion.input
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
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            animate={{
              scale: digit ? 1.02 : 1,
              borderColor: error ? '#f87171' : digit ? '#c73b2d' : '#94a3b8',
            }}
            transition={{ duration: 0.2 }}
            className={`size-10 rounded-lg border-2 bg-white text-center text-base font-semibold text-slate-900 shadow-sm outline-none sm:size-11 sm:rounded-xl sm:text-lg min-[1536px]:size-12 min-[1536px]:text-xl min-[1800px]:size-14 min-[1800px]:text-xl min-[2100px]:size-16 min-[2100px]:text-2xl min-[2560px]:size-20 min-[2560px]:text-3xl ${
              error ? 'border-red-400' : 'border-slate-400 focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/15'
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
