import { useMemo, useState } from 'react'
import {
  ChevronDown,
  CircleCheck,
  CircleHelp,
  Clock3,
  Mail,
  MessageSquareText,
  Package,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import AccountSectionShell from './AccountSectionShell'

const supportTopics = [
  { label: 'Orders & delivery', description: 'Track an order or resolve a delivery issue.', icon: Package },
  { label: 'Returns & refunds', description: 'Get help with a return or refund status.', icon: RotateCcw },
  { label: 'Payments', description: 'Payment, checkout, and transaction support.', icon: ShieldCheck },
  { label: 'Products & stores', description: 'Questions about products, sellers, or stock.', icon: ShoppingBag },
]

const faqs = [
  {
    question: 'How can I track my order?',
    answer: 'Open Orders from your account, select the order, and choose Track order to view its latest delivery update.',
    keywords: 'orders delivery tracking package',
  },
  {
    question: 'How do I request a return or refund?',
    answer: 'Go to Returns & Refunds, choose an eligible order item, and follow the steps to submit your request.',
    keywords: 'returns refunds money item',
  },
  {
    question: 'What should I do if my payment fails?',
    answer: 'Confirm your payment details and available balance, then try again. If the charge appears but the order does not, contact support with the transaction reference.',
    keywords: 'payment checkout transaction failed charged',
  },
  {
    question: 'How do I update my delivery address?',
    answer: 'Open Addresses in your account to add, edit, or select a default delivery address.',
    keywords: 'address location delivery update',
  },
  {
    question: 'How can I contact a store?',
    answer: 'Open the store page and use the Contact option shown beside the store information.',
    keywords: 'seller vendor shop store contact',
  },
]

function TopicCard({ topic, onSelect }) {
  const Icon = topic.icon
  return (
    <button
      type="button"
      onClick={() => onSelect(topic.label)}
      className="group flex min-h-32 flex-col items-start rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-auth-primary/25 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-auth-primary">
        <Icon className="size-4.5" />
      </span>
      <strong className="mt-4 text-sm text-slate-950">{topic.label}</strong>
      <span className="mt-1 text-xs leading-5 text-slate-500">{topic.description}</span>
    </button>
  )
}

export default function AccountSupportPanel() {
  const [query, setQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const filteredFaqs = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return faqs
    return faqs.filter((faq) => `${faq.question} ${faq.answer} ${faq.keywords}`.toLowerCase().includes(needle))
  }, [query])

  return (
    <AccountSectionShell
      eyebrow="Customer care"
      title="Help & Support"
      description="Find quick answers or send a message to our support team."
      icon={CircleHelp}
    >
      <section className="relative overflow-hidden rounded-2xl bg-auth-primary px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[28px] border-white/10" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">How can we help?</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Get the answer you need</h3>
          <p className="mt-2 text-sm leading-6 text-white/75">Search common questions or choose a support topic below.</p>
          <label className="relative mt-5 block">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help articles and questions"
              className="h-12 w-full rounded-xl border-0 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none ring-1 ring-white/20 placeholder:text-slate-400 focus:ring-2 focus:ring-white/50"
            />
          </label>
        </div>
      </section>

      <section className="mt-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Browse help</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">What do you need help with?</h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {supportTopics.map((topic) => <TopicCard key={topic.label} topic={topic} onSelect={setQuery} />)}
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Quick answers</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">Frequently asked questions</h3>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-[0.68rem] font-bold text-auth-primary">{filteredFaqs.length} answers</span>
          </div>
          <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
            {filteredFaqs.length ? filteredFaqs.map((faq) => {
              const index = faqs.indexOf(faq)
              const open = openFaq === index
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold text-slate-900"
                  >
                    {faq.question}
                    <ChevronDown className={`size-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180 text-auth-primary' : ''}`} />
                  </button>
                  {open ? <p className="max-w-2xl pb-4 pr-8 text-sm leading-6 text-slate-500">{faq.answer}</p> : null}
                </div>
              )
            }) : (
              <div className="py-10 text-center">
                <Search className="mx-auto size-6 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-800">No matching answers</p>
                <p className="mt-1 text-xs text-slate-500">Try a different phrase or send us a message.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5 sm:p-6">
          {submitted ? (
            <div className="flex min-h-[23rem] flex-col items-center justify-center text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-auth-primary shadow-sm"><CircleCheck className="size-6" /></span>
              <h3 className="mt-4 text-lg font-bold text-slate-950">Your message is ready</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">The support request UI is complete. It will submit once the support API is connected.</p>
              <button type="button" onClick={() => setSubmitted(false)} className="mt-5 text-sm font-bold text-auth-primary hover:underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Contact support</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">Send us a message</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">Tell us what happened and we’ll help you find the next step.</p>
              <label className="mt-5 block text-xs font-bold text-slate-700">Topic
                <select required defaultValue="" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-auth-primary">
                  <option value="" disabled>Select a topic</option>
                  {supportTopics.map((topic) => <option key={topic.label}>{topic.label}</option>)}
                  <option>Account & security</option>
                  <option>Something else</option>
                </select>
              </label>
              <label className="mt-4 block text-xs font-bold text-slate-700">Order number <span className="font-normal text-slate-400">(optional)</span>
                <input placeholder="e.g. ORD-20483" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-auth-primary" />
              </label>
              <label className="mt-4 block text-xs font-bold text-slate-700">How can we help?
                <textarea required minLength={10} rows={4} placeholder="Describe your issue" className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-auth-primary" />
              </label>
              <button type="submit" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-auth-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-auth-primary-hover">
                <Send className="size-4" /> Submit request
              </button>
            </form>
          )}
        </section>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-auth-primary"><MessageSquareText className="size-4" /></span><div><p className="text-xs font-bold text-slate-900">Live chat</p><p className="mt-0.5 text-[0.68rem] text-slate-500">Coming with support integration</p></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-auth-primary"><Mail className="size-4" /></span><div><p className="text-xs font-bold text-slate-900">Email support</p><p className="mt-0.5 text-[0.68rem] text-slate-500">Replies within one business day</p></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-auth-primary"><Clock3 className="size-4" /></span><div><p className="text-xs font-bold text-slate-900">Support hours</p><p className="mt-0.5 text-[0.68rem] text-slate-500">Mon–Sat, 8:00 AM–6:00 PM</p></div></div>
      </section>
    </AccountSectionShell>
  )
}
