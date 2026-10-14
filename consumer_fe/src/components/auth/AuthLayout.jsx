import { motion } from 'framer-motion'
import StoreLogo from '../layout/StoreLogo'
import AuthMarketingPanel from './AuthMarketingPanel'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const cardVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
}

function CardAuthLayout({ children, frameClass }) {
  return (
    <div className="auth-shell fixed inset-0 overflow-hidden bg-white font-sans text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 auth-bg-dots opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 auth-bg-grid" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 auth-bg-diagonal" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,59,45,0.08),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-10 size-64 rounded-full bg-auth-primary/5 blur-3xl sm:size-80 lg:size-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-6 size-72 rounded-full bg-auth-accent/6 blur-3xl sm:size-96 lg:size-112"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-[min(90%,48rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.12),transparent_70%)]"
      />

      <div className="relative z-10 flex h-full items-center justify-center overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`auth-layout-frame my-auto flex w-full flex-col items-center ${frameClass}`}
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 flex w-full justify-center sm:mb-4 min-[1536px]:mb-6 min-[1800px]:mb-8"
          >
            <StoreLogo
              variant="dark"
              size="sm"
              className="transition-transform duration-300 hover:scale-[1.02] min-[1536px]:[&_img]:h-10 min-[1800px]:[&_img]:h-14 min-[2100px]:[&_img]:h-16"
            />
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28),0_8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:rounded-3xl"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-auth-primary via-auth-accent to-auth-primary"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-auth-primary/5 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-12 size-44 rounded-full bg-auth-accent/6 blur-2xl"
            />

            <div className="relative px-4 py-4 sm:px-5 sm:py-5 min-[1536px]:px-8 min-[1536px]:py-8 min-[1800px]:px-14 min-[1800px]:py-14">
              {children}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function SplitAuthLayout({
  children,
  panelImage,
  panelHeadline,
  panelAccentLine,
  panelDescription,
  wide = false,
}) {
  const formMaxWidth = wide
    ? 'max-w-xl xl:max-w-2xl'
    : 'max-w-[22rem] sm:max-w-[24rem] xl:max-w-[26rem]'

  return (
    <div className="auth-shell fixed inset-0 overflow-hidden bg-white font-sans text-slate-900">
      <div className="relative z-10 grid h-full min-h-0 lg:grid-cols-2">
        <AuthMarketingPanel
          image={panelImage}
          headline={panelHeadline}
          accentLine={panelAccentLine}
          description={panelDescription}
        />

        <div className="relative flex min-h-0 flex-col overflow-y-auto overscroll-contain bg-white">
          <div className="flex items-center justify-center border-b border-slate-100 px-4 py-3 lg:hidden">
            <StoreLogo variant="brand" size="sm" className="[&_img]:h-8" />
          </div>

          <div className="flex flex-1 items-start justify-center px-4 py-6 sm:px-8 sm:py-10 lg:items-center lg:px-10 lg:py-12 xl:px-14">
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`my-auto w-full ${formMaxWidth}`}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthLayout({
  children,
  compact = false,
  wide = false,
  split = false,
  panelImage,
  panelHeadline,
  panelAccentLine,
  panelDescription,
}) {
  if (split && panelImage) {
    return (
      <SplitAuthLayout
        panelImage={panelImage}
        panelHeadline={panelHeadline}
        panelAccentLine={panelAccentLine}
        panelDescription={panelDescription}
        wide={wide}
      >
        {children}
      </SplitAuthLayout>
    )
  }

  const frameClass = wide
    ? 'auth-layout-frame--wide'
    : compact
      ? 'auth-layout-frame--compact'
      : 'auth-layout-frame--login'

  return <CardAuthLayout frameClass={frameClass}>{children}</CardAuthLayout>
}
