import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
import { landingFaqItems } from '../../constants/landingPageData'
import { landingContainerClass } from '../../constants/landingLayout'

function FaqItem({ question, answer, isOpen, onToggle, isLast }) {
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0)
    }
  }, [isOpen, answer])

  return (
    <div className={isLast ? '' : 'border-b border-slate-200'}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-slate-50 sm:px-7 sm:py-6"
      >
        <span className="flex items-start gap-3">
          <HelpCircle
            className={`mt-0.5 size-5 shrink-0 ${isOpen ? 'text-brand' : 'text-slate-400'}`}
            strokeWidth={1.75}
          />
          <span className={`text-base font-semibold leading-snug sm:text-[1.05rem] ${
            isOpen ? 'text-brand' : 'text-slate-900'
          }`}>
            {question}
          </span>
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-slate-400 transition-transform duration-300 ${
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
        <p className="px-5 pb-5 text-sm leading-7 text-slate-600 sm:px-7 sm:pb-6 ml-8 sm:ml-9">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="border-b border-slate-200 bg-slate-50 py-14 sm:py-18 lg:py-20">
      <div className={landingContainerClass}>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Everything vendors need to know about getting started and selling on EZ-Mall.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-12">
          <ol>
            {landingFaqItems.map((item, index) => (
              <li key={item.question}>
                <FaqItem
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIndex === index}
                  isLast={index === landingFaqItems.length - 1}
                  onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:mt-10 sm:flex-row sm:px-7 sm:py-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <MessageCircle className="size-6" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Still have questions?</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Our vendor support team is here to help you get started.
              </p>
            </div>
          </div>
          <Link
            to="/signup"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand"
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  )
}
