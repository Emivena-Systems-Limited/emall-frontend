import { useEffect, useState } from 'react'
import { OTP_RESEND_SECONDS } from '../../constants/auth'

export default function ResendTimer({ onResend, disabled = false }) {
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0) return undefined

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft])

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending || disabled) return

    setIsResending(true)
    try {
      await onResend()
      setSecondsLeft(OTP_RESEND_SECONDS)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <p className="text-center text-sm text-slate-600">
      Didn&apos;t receive the code?{' '}
      {secondsLeft > 0 ? (
        <>
          Resend in{' '}
          <span className="font-semibold text-sky-700">{secondsLeft}s</span>
        </>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || disabled}
          className="cursor-pointer font-semibold text-sky-700 underline-offset-2 transition-colors hover:text-sky-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? 'Sending…' : 'Resend code'}
        </button>
      )}
    </p>
  )
}
