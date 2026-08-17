import { useEffect, useState } from 'react'
import {
  canEditVendorReply,
  formatReplyEditRemaining,
  formatReplyEditRemainingCompact,
  getReplyEditRemainingMs,
  getVendorReplyPostedAt,
} from '../utils/reviewUtils'

export function useReplyEditWindow(review) {
  const postedAt = getVendorReplyPostedAt(review)?.toISOString() ?? ''
  const [now, setNow] = useState(() => Date.now())
  const canEdit = canEditVendorReply(review, now)
  const remainingMs = getReplyEditRemainingMs(review, now)

  useEffect(() => {
    if (!review?.vendorReply || !postedAt) return undefined
    if (!canEditVendorReply(review, Date.now())) return undefined

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [postedAt, review])

  return {
    canEdit,
    remainingMs,
    remainingLabel: formatReplyEditRemaining(remainingMs),
    remainingCompact: formatReplyEditRemainingCompact(remainingMs),
  }
}
