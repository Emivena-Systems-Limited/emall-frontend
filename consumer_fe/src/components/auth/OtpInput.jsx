import { useRef } from 'react'
import { motion } from 'framer-motion'
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
      <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
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
              borderColor: error ? '#f87171' : digit ? '#c73b2d' : '#e2e8f0',
            }}
            transition={{ duration: 0.2 }}
            className={`size-11 rounded-lg border-2 bg-white text-center text-lg font-semibold text-slate-900 outline-none sm:size-14 sm:rounded-xl sm:text-xl md:size-18 md:text-2xl lg:size-20 lg:rounded-2xl lg:text-3xl xl:size-24 xl:text-4xl ${
              error ? 'border-red-400' : 'border-slate-200 focus:border-auth-primary'
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
