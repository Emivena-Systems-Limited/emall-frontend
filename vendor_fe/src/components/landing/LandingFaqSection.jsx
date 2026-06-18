import { useEffect, useRef, useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { landingFaqItems } from '../../constants/landingPageData'
import { landingContainerClass } from '../../constants/landingLayout'

function FaqItem({ question, answer, isOpen, onToggle }) {
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  return (
    <div className={`overflow-hidden rounded-2xl border transition-colors duration-200 ${
      isOpen
        ? 'border-brand/25 bg-brand-light/40 shadow-sm shadow-brand/5'
        : 'border-slate-200/80 bg-white hover:border-brand/15 hover:bg-slate-50/60'
    }`}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-start justify-between gap-4 px-4 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className={`text-sm font-semibold leading-snug transition-colors sm:text-[0.95rem] ${
          isOpen ? 'text-brand' : 'text-slate-900'
        }`}>
          {question}
        </span>
        <ChevronDown
          className={`mt-0.5 size-5 shrink-0 text-slate-400 transition-all duration-300 ${
            isOpen ? 'rotate-180 text-brand' : ''
          }`}
          strokeWidth={2}
        />
      </button>

      <div
        ref={bodyRef}
        style={{ height }}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
      >
        <p className="px-4 pb-4 text-sm leading-6 text-slate-600 sm:px-6 sm:pb-6">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="relative overflow-hidden border-b border-slate-200/60 bg-slate-50 py-14 sm:py-20 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-1/3 size-80 rounded-full bg-brand/4 blur-3xl" />
        <div className="absolute -left-16 bottom-0 size-64 rounded-full bg-brand/3 blur-3xl" />
      </div>

      <div className={`${landingContainerClass} relative`}>
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-14">

          <div className="vendor-scroll-reveal md:sticky md:top-28">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="h-px w-6 rounded-full bg-brand" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                Questions & answers
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Everything vendors need to know about getting started and selling on E-Mall.
            </p>

            <div className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:mt-8 sm:inline-flex sm:w-auto sm:px-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand ring-1 ring-brand-muted/50">
                <MessageCircle className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Still have questions?</p>
                <p className="mt-0.5 text-xs text-slate-500">Visit the vendor help centre</p>
              </div>
            </div>
          </div>

          <ol className="vendor-scroll-reveal space-y-3">
            {landingFaqItems.map((item, index) => (
              <li key={item.question}>
                <FaqItem
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
