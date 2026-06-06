import { motion } from 'framer-motion'

const ringVariants = {
  animate: (index) => ({
    scale: [1, 1.08 + index * 0.04, 1],
    opacity: [0.35, 0.12, 0.35],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: index * 0.25,
    },
  }),
}

const dotVariants = {
  animate: (index) => ({
    y: [0, -6, 0],
    opacity: [0.45, 1, 0.45],
    transition: {
      duration: 0.9,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: index * 0.15,
    },
  }),
}

export default function OtpVerifyingLoader({
  title = 'Verifying OTP',
  subtitle = 'Verifying your OTP, this will just take a moment',
}) {
  return (
    <div className="flex flex-col items-center py-4 text-center max-[740px]:py-2 sm:py-6">
      <div className="relative mb-6 flex size-24 items-center justify-center max-[740px]:mb-4 max-[740px]:size-20 sm:mb-8 sm:size-28">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            custom={index}
            variants={ringVariants}
            animate="animate"
            className="absolute inset-0 rounded-full border-2 border-auth-primary/30"
            style={{ inset: `${index * 10}px` }}
          />
        ))}
        <motion.span
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 size-3 rounded-full bg-auth-primary"
        />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.35 }}
        className="mt-1.5 text-xs text-auth-muted sm:mt-2 sm:text-sm"
      >
        {subtitle}
      </motion.p>

      <div className="mt-5 flex items-center gap-2 max-[740px]:mt-4 sm:mt-6">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            custom={index}
            variants={dotVariants}
            animate="animate"
            className="size-2 rounded-full bg-auth-primary"
          />
        ))}
      </div>
    </div>
  )
}
