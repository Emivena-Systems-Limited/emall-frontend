import { AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { formEase } from './formMotion'

export default function FieldError({ message }) {
  return (
    <AnimatePresence mode="wait">
      {message ? (
        <motion.p
          key={message}
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.22, ease: formEase }}
          className="mt-2 flex items-start gap-1.5 text-xs text-red-600"
          role="alert"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}
