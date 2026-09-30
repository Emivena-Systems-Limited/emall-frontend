import { EMPTY_FINANCE_SETTINGS } from '../constants/financeLedger'

const PAYMENT_METHOD_KEYS = ['card', 'momo', 'bank']

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function pick(record, keys) {
  if (!isRecord(record)) return undefined
  for (const key of keys) {
    if (record[key] != null && record[key] !== '') return record[key]
  }
  return undefined
}

function asBoolean(value, fallback) {
  if (value == null || value === '') return fallback
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1' || value === 'true') return true
  if (value === 0 || value === '0' || value === 'false') return false
  return fallback
}

function asNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function methodFlag(source, methods, names, fallback) {
  const topLevel = pick(source, names)
  if (topLevel != null && topLevel !== '') return asBoolean(topLevel, fallback)
  if (!isRecord(methods)) return fallback
  return asBoolean(pick(methods, names), fallback)
}

export function toPayoutSettingsPayload({ settings, defaultRate }) {
  return {
    payout: {
      frequency: String(settings.frequency || 'weekly'),
      minimumThreshold: asNumber(settings.minimumThreshold, 0),
      processingRule: String(settings.processingRule ?? ''),
      methods: {
        mobileMoney: Boolean(settings.methods?.['Mobile Money']),
        bankTransfer: Boolean(settings.methods?.['Bank transfer']),
      },
    },
    commission: {
      defaultRate: asNumber(defaultRate, 0),
    },
    paymentMethods: (settings.paymentMethods ?? []).map((method) => ({
      key: method.key,
      enabled: Boolean(method.enabled),
    })),
  }
}

export function normalizePayoutSettings(record) {
  const source = isRecord(record?.data) && !Array.isArray(record.data) ? record.data : record
  const payout = isRecord(source?.payout) ? source.payout : source
  const commission = isRecord(source?.commission) ? source.commission : source
  const methods = isRecord(payout?.methods) ? payout.methods : source?.methods
  const fallback = EMPTY_FINANCE_SETTINGS
  const incomingMethods = source?.paymentMethods ?? source?.payment_methods
  const methodList = Array.isArray(incomingMethods) ? incomingMethods : []

  const paymentMethods = fallback.paymentMethods.map((method) => {
    const match = methodList.find((item) => String(item?.key ?? '') === method.key)
    if (!match) return { ...method }
    return {
      ...method,
      label: match.label || method.label,
      provider: match.provider || method.provider,
      enabled: asBoolean(match.enabled, method.enabled),
      configured: asBoolean(match.configured, method.configured),
    }
  })

  const knownKeys = new Set(PAYMENT_METHOD_KEYS)
  methodList.forEach((item) => {
    const key = String(item?.key ?? '')
    if (!key || knownKeys.has(key) || paymentMethods.some((method) => method.key === key)) return
    paymentMethods.push({
      key,
      label: item.label || key,
      provider: item.provider || 'Paystack',
      enabled: asBoolean(item.enabled, false),
      configured: asBoolean(item.configured, false),
    })
  })

  return {
    settings: {
      frequency: String(pick(payout, ['payout_frequency', 'frequency']) ?? fallback.frequency),
      minimumThreshold: asNumber(
        pick(payout, ['minimum_threshold', 'minimumThreshold']),
        fallback.minimumThreshold,
      ),
      processingRule: String(
        pick(payout, ['processing_rule', 'processingRule']) ?? fallback.processingRule,
      ),
      methods: {
        'Mobile Money': methodFlag(
          source,
          methods,
          ['mobile_money_enabled', 'mobileMoney', 'mobile_money', 'Mobile Money'],
          fallback.methods['Mobile Money'],
        ),
        'Bank transfer': methodFlag(
          source,
          methods,
          ['bank_transfer_enabled', 'bankTransfer', 'bank_transfer', 'Bank transfer'],
          fallback.methods['Bank transfer'],
        ),
      },
      paymentMethods,
    },
    defaultRate: asNumber(
      pick(source, ['default_commission_rate'])
        ?? pick(commission, ['defaultRate', 'default_rate']),
      10,
    ),
  }
}
