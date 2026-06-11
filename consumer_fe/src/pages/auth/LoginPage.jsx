import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthTabs from '../../components/auth/AuthTabs'
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
import {
  formatGhanaPhoneDisplay,
  normalizeGhanaPhone,
  validateEmail,
  validateGhanaPhone,
} from '../../utils/validateGhanaPhone'
import { scrollToFirstError } from '../../utils/scrollToFirstError'

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
  const [activeTab, setActiveTab] = useState('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const requestOtpMutation = useRequestOtpMutation()
  const isSubmitting = requestOtpMutation.isPending

  const handlePhoneChange = (value) => {
    const local = normalizeGhanaPhone(value)
    setPhone(formatGhanaPhoneDisplay(local))
    if (phoneError) setPhoneError('')
  }

  const handlePhoneBlur = () => {
    if (!phone.trim()) return
    const result = validateGhanaPhone(phone)
    setPhoneError(result.valid ? '' : result.message)
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

      navigate('/login/verify', {
        state: {
          flow: AUTH_FLOW.LOGIN,
          method,
          contact,
          displayContact,
        },
      })
    } catch (error) {
      notify.fromError(error, 'Could not send verification code')
    }
  }

  return (
    <AuthLayout>
      <motion.div {...formHeaderMotion} className="text-center">
        <p className="text-xs text-auth-muted sm:text-sm">Welcome back,</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Login to your account
        </h1>
      </motion.div>

      <motion.div
        variants={formStaggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-4 sm:mt-6"
      >
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

          <form onSubmit={handleSubmit} className="space-y-4 max-[740px]:space-y-3.5 sm:space-y-5">
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
                    onChange={(value) => {
                      setEmail(value)
                      if (emailError) setEmailError('')
                    }}
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
              className="mt-4 w-full rounded-xl bg-auth-primary py-3.5 text-base font-semibold text-white transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {isSubmitting ? 'Sending code…' : 'Login'}
            </motion.button>
          </motion.div>
        </form>

          <motion.p
            variants={formActionsMotion}
            className="mt-4 text-center text-sm text-auth-muted max-[740px]:mt-3 sm:mt-5"
          >
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-auth-accent underline-offset-2 hover:underline">
              Register
            </Link>
          </motion.p>
      </motion.div>
    </AuthLayout>
  )
}
