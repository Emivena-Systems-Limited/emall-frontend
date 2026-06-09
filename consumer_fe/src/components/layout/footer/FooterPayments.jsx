import { paymentMethods } from '../../../constants/siteNav'
import Images from '../../../utils/Images'

const paymentImages = {
  Visa: Images.common.visa,
  Mastercard: Images.common.mastercard,
  PayPal: Images.common.paypal,
  'Apple Pay': Images.common.apple_pay,
  'Google Pay': Images.common.google_pay,
}

export default function FooterPayments() {
  return (
    <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
      {paymentMethods.map((method) => (
        <div
          key={method}
          className="inline-flex items-center justify-center rounded-md bg-white px-2 py-1"
        >
          <img
            src={paymentImages[method]}
            alt={method}
            className="h-5 w-auto object-contain sm:h-6"
          />
        </div>
      ))}
    </div>
  )
}
