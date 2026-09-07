import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, CheckCircle2, ChevronDown, Package, Rocket, Star, Wallet, X } from 'lucide-react'
import {
  PLATFORM_FAQ,
  GETTING_STARTED_STEPS,
  QUICK_HELP_LINKS,
} from '../../constants/helpSupport'
const quickIcons = { rocket: Rocket, package: Package, wallet: Wallet, star: Star }

export function HelpPageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-950">Help & Support</h1>
      <p className="mt-1 text-sm text-slate-500">
        Browse quick help topics and frequently asked questions.
      </p>
    </div>
  )
}

export function QuickHelpGrid({ onOpenGuide }) {
  const navigate = useNavigate()

  const handleClick = (link) => {
    if (link.action === 'guide') {
      onOpenGuide?.()
      return
    }
    if (link.action === 'route' && link.to) {
      navigate(link.to)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Quick help</h2>
        <p className="mt-0.5 text-sm text-slate-500">Common topics to get you unstuck fast</p>
      </div>
      <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_HELP_LINKS.map((link) => {
          const Icon = quickIcons[link.icon] ?? Rocket
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => handleClick(link)}
              className="group cursor-pointer bg-white p-5 text-left transition-colors hover:bg-brand-light/20"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-light text-brand ring-1 ring-brand-muted transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="size-4" />
              </span>
              <p className="mt-3 text-sm font-bold text-slate-900">{link.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{link.description}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                {link.action === 'guide' ? 'Open guide' : 'Go to page'}
                <ArrowRight className="size-3" />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function GettingStartedGuide({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex justify-end">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-pointer bg-slate-900/40 backdrop-blur-[2px]" />
      <div className="slide-in-right relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Getting started</h2>
            <p className="mt-0.5 text-xs text-slate-500">Set up your store in 5 steps</p>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>
        <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {GETTING_STARTED_STEPS.map((item) => (
            <li key={item.step} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {item.step}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
                  <Link
                    to={item.link}
                    onClick={onClose}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    {item.linkLabel}
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <CheckCircle2 className="size-4" />
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function HelpFaqSection() {
  const [openId, setOpenId] = useState(null)
  const midpoint = Math.ceil(PLATFORM_FAQ.length / 2)
  const columns = [PLATFORM_FAQ.slice(0, midpoint), PLATFORM_FAQ.slice(midpoint)]

  const renderFaqItem = (faq) => {
    const open = openId === faq.id
    return (
      <li key={faq.id} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/40">
        <button
          type="button"
          onClick={() => setOpenId(open ? null : faq.id)}
          className="flex w-full cursor-pointer items-start justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
        >
          <span className="text-sm font-semibold text-slate-800">{faq.question}</span>
          <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="border-t border-slate-100 bg-white px-4 py-3">
            <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
          </div>
        )}
      </li>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Frequently asked questions</h2>
        <p className="mt-0.5 text-sm text-slate-500">Quick answers from the e-mall vendor team</p>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-2">
        {columns.map((column, index) => (
          <ul key={index} className="space-y-3">
            {column.map(renderFaqItem)}
          </ul>
        ))}
      </div>
    </section>
  )
}
