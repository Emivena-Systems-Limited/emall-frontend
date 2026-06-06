import { useEffect, useState } from 'react'
import { OTP_RESEND_SECONDS } from '../../constants/auth'

function formatTimer(seconds) {
  return `${seconds}s`
}

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
    <p className="px-1 text-center text-xs leading-relaxed text-auth-muted sm:text-sm">
      Didn&apos;t receive the verification code?{' '}
      {secondsLeft > 0 ? (
        <>
          Request new code in{' '}
          <span className="font-medium text-auth-primary">{formatTimer(secondsLeft)}</span>
        </>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || disabled}
          className="font-medium text-auth-accent underline-offset-2 hover:underline disabled:opacity-50"
        >
          {isResending ? 'Sending…' : 'Request new code'}
        </button>
      )}
    </p>
  )
}
