import apiClient from '../lib/apiClient'
import { PAYMENT_ADMIN_ENDPOINTS } from '../constants/payments'
import { assertAuthEnvelope } from '../utils/parseApiError'
import { normalizePayoutSettings, toPayoutSettingsPayload } from '../utils/normalizePayoutSettings'

function savedRecord(envelope, payload) {
  const record = envelope?.data ?? envelope
  if (record && typeof record === 'object' && (record.payout_frequency || record.payout || record.frequency || record.payment_methods || record.paymentMethods || record.default_commission_rate || record.commission)) {
    return normalizePayoutSettings(record)
  }
  return normalizePayoutSettings(payload)
}

export async function fetchPayoutSettings() {
  try {
    const { data } = await apiClient.get(PAYMENT_ADMIN_ENDPOINTS.PAYOUT_SETTINGS)
    const envelope = assertAuthEnvelope(data, 'Could not load finance settings.')
    return normalizePayoutSettings(envelope?.data ?? envelope)
  } catch (error) {
    if (error?.response?.status === 404) return null
    throw error
  }
}

export async function savePayoutSettings({ settings, defaultRate }) {
  const payload = toPayoutSettingsPayload({ settings, defaultRate })
  const { data } = await apiClient.put(PAYMENT_ADMIN_ENDPOINTS.SAVE_PAYOUT_SETTINGS, payload)
  const envelope = assertAuthEnvelope(data, 'Could not save finance settings.')
  return {
    ...savedRecord(envelope, payload),
    message: envelope?.reason || envelope?.message || 'Finance settings saved.',
  }
}
