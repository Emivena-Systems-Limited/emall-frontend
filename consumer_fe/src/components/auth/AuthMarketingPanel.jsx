import { motion } from 'framer-motion'
import { RefreshCw, ShieldCheck, Truck } from 'lucide-react'
import StoreLogo from '../layout/StoreLogo'

const FEATURES = [
  { label: 'Secure Checkout', icon: ShieldCheck },
  { label: 'Fast Delivery', icon: Truck },
  { label: 'Easy Returns', icon: RefreshCw },
]

const panelMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
}

const contentStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
}

const itemMotion = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function AuthMarketingPanel({
  image,
  headline = 'Millions of products.',
  accentLine = 'One trusted place.',
  description = 'Shop from thousands of verified vendors with confidence — fast delivery, easy returns, and secure payments.',
}) {
  const year = new Date().getFullYear()

  return (
    <motion.aside
      {...panelMotion}
      className="relative hidden h-full min-h-0 w-full overflow-hidden lg:block"
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 size-full scale-105 object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,14,0.72)_0%,rgba(8,10,14,0.55)_38%,rgba(8,10,14,0.78)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.14),transparent_55%)]"
      />

      <div className="relative z-10 flex h-full flex-col px-8 py-10 xl:px-12 xl:py-12">
        <motion.div
          variants={contentStagger}
          initial="hidden"
          animate="visible"
          className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center"
        >
          <motion.div variants={itemMotion} className="flex flex-col items-center">
            <StoreLogo
              variant="brandLight"
              size="md"
              className="[&_img]:h-10 [&_img]:max-w-none xl:[&_img]:h-12"
            />
            <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/80">
              Your shopping destination
            </p>
          </motion.div>

          <motion.h2
            variants={itemMotion}
            className="mt-10 text-[1.85rem] font-bold leading-[1.15] tracking-tight text-white xl:mt-12 xl:text-[2.15rem]"
          >
            {headline}
            <span className="mt-1 block text-[#ffc933]">{accentLine}</span>
          </motion.h2>

          <motion.p
            variants={itemMotion}
            className="mt-4 max-w-sm text-sm leading-relaxed text-white/75 xl:text-[0.9375rem]"
          >
            {description}
          </motion.p>

          <motion.ul
            variants={itemMotion}
            className="mt-8 space-y-3.5 text-left xl:mt-10"
          >
            {FEATURES.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-3 text-sm font-medium text-white/90">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ffc933]/20 text-[#ffc933] ring-1 ring-[#ffc933]/40">
                  <Icon className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <p className="mt-auto text-center text-[0.6875rem] text-white/40">
          © {year} eezmall. All rights reserved.
        </p>
      </div>
    </motion.aside>
  )
}
