import { useEffect } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Store } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'

const ease = [0.16, 1, 0.3, 1]

export default function StoresPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <SiteLayout>
      <section className="relative min-h-[min(70vh,36rem)] overflow-hidden bg-[#F3F6F7]">
        <div
          className="pointer-events-none absolute -right-20 -top-16 size-64 rounded-full bg-[#7FD4C5]/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-auth-primary/10 blur-3xl"
          aria-hidden
        />

        <Container className="relative flex min-h-[min(70vh,36rem)] flex-col items-center justify-center py-16 text-center sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
            className="flex max-w-md flex-col items-center"
          >
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-[1.75rem] bg-[#0B1C22]/5"
                aria-hidden
              />
              <div className="relative flex size-20 items-center justify-center rounded-2xl bg-white text-[#1B4D5C] shadow-sm shadow-slate-200/80 ring-1 ring-slate-200 sm:size-24">
                <Store className="size-9 sm:size-10" strokeWidth={1.5} aria-hidden />
              </div>
            </div>

            <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-[#1B4D5C] uppercase">
              Coming soon
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Stores are on the way
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
              We&apos;re building the store directory so you can browse sellers across Ghana.
              Check back soon, or keep shopping in the meantime.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full bg-auth-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-auth-primary/20 transition-colors hover:bg-auth-primary-hover"
              >
                Browse Categories
                <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
              </Link>
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-auth-primary"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
    </SiteLayout>
  )
}
