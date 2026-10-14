import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthHomeLink from '../../components/auth/AuthHomeLink'
import AuthTabs from '../../components/auth/AuthTabs'
import BuyNowAuthResume from '../../components/auth/BuyNowAuthResume'
import EmailInput from '../../components/auth/EmailInput'
import FormField from '../../components/auth/FormField'
import {
  formActionsMotion,
  formHeaderMotion,
  formStaggerContainer,
} from '../../components/auth/formMotion'
import PhoneInput from '../../components/auth/PhoneInput'
import notify from '../../lib/notify'
import { useRequestOtpMutation } from '../../hooks/useAuthMutations'
import { AUTH_METHODS, AUTH_FLOW } from '../../constants/auth'
import { saveAuthOtpSession } from '../../utils/authOtpSession'
import {
  BUY_NOW_CHECKOUT_PATH,
  getBuyNowAuthLocationState,
  readBuyNowItem,
  shouldResumeBuyNowAfterAuth,
} from '../../utils/buyNowItem'
import {
  formatGhanaPhoneDisplay,
  normalizeGhanaPhone,
  validateEmail,
  validateGhanaPhone,
} from '../../utils/validateGhanaPhone'
import { scrollToFirstError } from '../../utils/scrollToFirstError'
import Images from '../../utils/Images'

const tabContentVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
}

const LOGIN_FIELD_ORDER = {
  phone: ['phone'],
  email: ['email'],
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const buyNowItem = shouldResumeBuyNowAfterAuth(location.state, location.state?.from)
    ? readBuyNowItem()
    : null
  const redirectTo = location.state?.from
    || (buyNowItem ? BUY_NOW_CHECKOUT_PATH : undefined)
  const buyNowAuthState = buyNowItem ? getBuyNowAuthLocationState() : undefined
  const [activeTab, setActiveTab] = useState('email')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const requestOtpMutation = useRequestOtpMutation()
  const isSubmitting = requestOtpMutation.isPending

  const handleCancelBuyNow = () => {
    notify.info('Purchase cancelled. You can still sign in to shop.')
    navigate('/login', { replace: true, state: {} })
  }

  const handlePhoneChange = (value) => {
    const local = normalizeGhanaPhone(value)
    setPhone(formatGhanaPhoneDisplay(local))
    if (phoneError) {
      const result = validateGhanaPhone(formatGhanaPhoneDisplay(local))
      setPhoneError(result.valid || !local ? '' : result.message)
    }
  }

  const handlePhoneBlur = () => {
    if (!phone.trim()) return
    const result = validateGhanaPhone(phone)
    setPhoneError(result.valid ? '' : result.message)
  }

  const handleEmailChange = (value) => {
    setEmail(value)
    if (emailError || value.includes('@') || /\s/.test(value)) {
      if (!value.trim()) {
        setEmailError('')
        return
      }
      const result = validateEmail(value)
      setEmailError(result.valid ? '' : result.message)
    }
  }

  const handleEmailBlur = () => {
    if (!email.trim()) return
    const result = validateEmail(email)
    setEmailError(result.valid ? '' : result.message)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const fieldOrder = LOGIN_FIELD_ORDER[activeTab]
    const validationErrors = {}

    let phoneResult = null
    let emailResult = null

    if (activeTab === 'phone') {
      phoneResult = validateGhanaPhone(phone)
      if (!phoneResult.valid) {
        validationErrors.phone = phoneResult.message
        setPhoneError(phoneResult.message)
      } else {
        setPhoneError('')
      }
    } else {
      emailResult = validateEmail(email)
      if (!emailResult.valid) {
        validationErrors.email = emailResult.message
        setEmailError(emailResult.message)
      } else {
        setEmailError('')
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      scrollToFirstError(validationErrors, fieldOrder)
      return
    }

    let method
    let contact
    let displayContact

    if (activeTab === 'phone') {
      method = AUTH_METHODS.PHONE
      contact = phoneResult.e164
      displayContact = phoneResult.display
    } else {
      method = AUTH_METHODS.EMAIL
      contact = emailResult.email
      displayContact = emailResult.email
    }

    try {
      const otpResponse = await requestOtpMutation.mutateAsync({ method, contact })
      if (otpResponse?.otpAlreadyPending) {
        notify.info('Use the verification code already sent to continue login.')
      }

      const otpSession = {
        flow: AUTH_FLOW.LOGIN,
        method,
        contact,
        displayContact,
        ...(redirectTo ? { redirectTo } : {}),
        ...(buyNowItem ? { buyNow: true, redirectTo: BUY_NOW_CHECKOUT_PATH } : {}),
      }
      saveAuthOtpSession(otpSession)

      navigate('/login/verify', {
        state: otpSession,
      })
    } catch (error) {
      notify.fromError(error, 'Could not send verification code')
    }
  }

  const registerState = buyNowAuthState ?? (redirectTo ? { from: redirectTo } : undefined)

  return (
    <AuthLayout split panelImage={Images.auth.login_img}>
      <motion.div {...formHeaderMotion} className="text-left">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-[2rem]">
          {buyNowItem ? 'Sign in to buy now' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-base font-medium text-slate-600">
          {buyNowItem ? 'Almost yours' : 'Sign in to your eezmall account'}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {buyNowItem
            ? 'Verify with a code and we’ll take you straight to checkout for the item you’re holding.'
            : activeTab === 'phone'
              ? 'We’ll send a one-time code to your phone to sign you in.'
              : 'We’ll send a one-time code to your email to sign you in.'}
        </p>
      </motion.div>

      <motion.div
        variants={formStaggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-6 sm:mt-7"
      >
        {buyNowItem ? (
          <div className="-mt-1 mb-4">
            <BuyNowAuthResume item={buyNowItem} onCancel={handleCancelBuyNow} />
          </div>
        ) : null}
        <FormField name="tabs">
          <AuthTabs
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab)
              setPhoneError('')
              setEmailError('')
            }}
          />
        </FormField>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <AnimatePresence mode="wait">
            {activeTab === 'phone' ? (
              <motion.div
                key="phone"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <FormField name="phone">
                  <PhoneInput
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    error={phoneError}
                    disabled={isSubmitting}
                  />
                </FormField>
              </motion.div>
            ) : (
              <motion.div
                key="email"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <FormField name="email">
                  <EmailInput
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    error={emailError}
                    disabled={isSubmitting}
                  />
                </FormField>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={formActionsMotion}>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.985 }}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-auth-primary py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(199,59,45,0.65)] transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-70 sm:py-3.5"
            >
              {isSubmitting
                ? 'Sending code…'
                : buyNowItem
                  ? 'Send code & continue'
                  : (
                    <>
                      Send verification code
                      <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden="true" />
                    </>
                  )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div variants={formActionsMotion} className="mt-7 sm:mt-8">
          <div className="relative flex items-center">
            <div aria-hidden="true" className="h-px flex-1 bg-slate-200" />
            <span className="px-3 text-xs font-medium text-slate-400">New to eezmall?</span>
            <div aria-hidden="true" className="h-px flex-1 bg-slate-200" />
          </div>
          <Link
            to="/register"
            state={registerState}
            className="mt-4 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:py-3.5"
          >
            Create account
          </Link>
        </motion.div>

        <AuthHomeLink
          to={buyNowItem?.href || '/'}
          label={buyNowItem ? 'Back to product' : 'Back to home'}
        />
      </motion.div>
    </AuthLayout>
  )
}
