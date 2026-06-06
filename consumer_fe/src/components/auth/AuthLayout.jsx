import { motion } from 'framer-motion'
import BrandLogo from './BrandLogo'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

export default function AuthLayout({ children, compact = false, wide = false }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f1f5f9_100%)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 auth-bg-dots opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 auth-bg-grid" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 auth-bg-diagonal" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,59,45,0.07),transparent_40%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-16 size-56 rounded-full bg-auth-primary/4 blur-3xl sm:size-72"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-10 size-64 rounded-full bg-auth-accent/5 blur-3xl sm:size-80"
      />

      <div className="relative z-10 flex h-full items-center justify-center overflow-y-auto overscroll-contain px-3 py-4 sm:px-4 sm:py-6">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`my-auto flex w-full flex-col items-center ${
            wide ? 'max-w-[640px]' : compact ? 'max-w-[420px]' : 'max-w-[460px]'
          }`}
        >
          <BrandLogo className="mb-4 shrink-0 max-[740px]:mb-3 sm:mb-6" />
          <div className="w-full">{children}</div>
        </motion.div>
      </div>
    </div>
  )
}
