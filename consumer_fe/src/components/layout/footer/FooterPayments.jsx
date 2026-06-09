import { paymentMethods } from '../../../constants/siteNav'

const paymentStyles = {
  Visa: 'font-bold italic tracking-wide text-[#1A1F71]',
  Mastercard: 'font-bold text-[#EB001B]',
  PayPal: 'font-bold italic text-[#003087]',
  'Apple Pay': 'font-semibold text-black',
  'Google Pay': 'font-semibold text-[#5F6368]',
}

export default function FooterPayments() {
  return (
    <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
      {paymentMethods.map((method) => (
        <span
          key={method}
          className="inline-flex min-w-[3.25rem] items-center justify-center rounded-md bg-white px-2.5 py-1.5 text-[0.625rem] sm:text-[0.6875rem]"
        >
          <span className={paymentStyles[method]}>{method}</span>
        </span>
      ))}
    </div>
  )
}
