import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { OTP_RESEND_SECONDS } from '../../constants/auth'
import {
  getAuthOtpResendSecondsLeft,
  markAuthOtpResendCooldown,
} from '../../utils/authOtpSession'

function formatTimer(seconds) {
  return `${seconds}s`
}

const dotVariants = {
  animate: (index) => ({
    y: [0, -4, 0],
    opacity: [0.35, 1, 0.35],
    transition: {
      duration: 0.75,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: index * 0.12,
    },
  }),
}

function ResendLoadingIndicator() {
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="inline-flex items-center justify-center gap-2 font-medium text-auth-primary"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="inline-flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            custom={index}
            variants={dotVariants}
            animate="animate"
            className="size-1.5 rounded-full bg-auth-primary"
          />
        ))}
      </span>
      Sending new code…
    </motion.span>
  )
}

export default function ResendTimer({ onResend, disabled = false }) {
  const [secondsLeft, setSecondsLeft] = useState(() => getAuthOtpResendSecondsLeft(OTP_RESEND_SECONDS))
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0) return undefined

    const timer = setInterval(() => {
      setSecondsLeft(getAuthOtpResendSecondsLeft(OTP_RESEND_SECONDS))
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft])

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending || disabled) return

    setIsResending(true)
    try {
      await onResend()
      markAuthOtpResendCooldown(OTP_RESEND_SECONDS)
      setSecondsLeft(OTP_RESEND_SECONDS)
    } finally {
      setIsResending(false)
    }
  }

  const isBusy = isResending || disabled

  return (
    <p className="px-1 text-center text-xs leading-relaxed text-auth-muted sm:text-sm">
      Didn&apos;t receive the verification code?{' '}
      <AnimatePresence mode="wait" initial={false}>
        {isBusy ? (
          <ResendLoadingIndicator key="loading" />
        ) : secondsLeft > 0 ? (
          <motion.span
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Request new code in{' '}
            <span className="font-medium text-auth-primary">{formatTimer(secondsLeft)}</span>
          </motion.span>
        ) : (
          <motion.button
            key="resend"
            type="button"
            onClick={handleResend}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            whileTap={{ scale: 0.98 }}
            className="font-medium text-auth-accent underline-offset-2 hover:underline"
          >
            Request new code
          </motion.button>
        )}
      </AnimatePresence>
    </p>
  )
}
