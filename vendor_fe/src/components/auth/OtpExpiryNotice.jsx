import { Clock } from 'lucide-react'
import { OTP_EXPIRY_MINUTES } from '../../constants/auth'

export default function OtpExpiryNotice({ className = '' }) {
  return (
    <p className={`flex items-center justify-center gap-1.5 text-xs leading-relaxed text-slate-500 ${className}`}>
      <Clock className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span>This code expires in {OTP_EXPIRY_MINUTES} minutes.</span>
    </p>
  )
}
