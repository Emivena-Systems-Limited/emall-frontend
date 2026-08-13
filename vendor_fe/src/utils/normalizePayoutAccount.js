import { maskAccountNumber } from './financeUtils'

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? ''
}

function normalizePayoutStatus(value, { hasAccount = false } = {}) {
  const raw = String(value ?? '').trim().toLowerCase()
  if (!raw) {
    return hasAccount ? 'verified' : 'not_added'
  }

  if (raw === 'verified' || raw === 'approved') return 'verified'
  if (raw === 'active' || raw === 'live') return 'verified'
  if (raw === 'not_added' || raw === 'none' || raw === 'removed') return 'not_added'
  if (raw === 'pending' || raw === 'pending_verification' || raw === 'unverified') {
    return 'pending_verification'
  }

  return raw.replace(/\s+/g, '_')
}

function resolveAccountNumber(record) {
  const masked = firstValue(
    record.account_number_masked,
    record.accountNumberMasked,
    record.masked_account_number,
    record.maskedAccountNumber,
  )

  const raw = firstValue(record.account_number, record.accountNumber)

  if (masked) {
    return { accountNumber: masked, accountNumberRaw: '' }
  }

  if (raw && /[*x]/i.test(raw)) {
    return { accountNumber: raw, accountNumberRaw: '' }
  }

  if (raw) {
    return {
      accountNumber: maskAccountNumber(raw),
      accountNumberRaw: '',
    }
  }

  return { accountNumber: '—', accountNumberRaw: '' }
}

const PAYOUT_ACCOUNT_KEYS = [
  'bank_name',
  'bankName',
  'account_holder_name',
  'accountHolderName',
  'account_name',
  'accountName',
  'account_number',
  'accountNumber',
]

function hasPayoutAccountFields(record) {
  if (!record || typeof record !== 'object') return false
  return PAYOUT_ACCOUNT_KEYS.some((key) => key in record)
}

function resolveIsActive(record) {
  if (typeof record.is_active === 'boolean') return record.is_active
  if (typeof record.isActive === 'boolean') return record.isActive
  if (typeof record.active === 'boolean') return record.active
  if (typeof record.is_live === 'boolean') return record.is_live
  if (typeof record.isLive === 'boolean') return record.isLive

  const status = String(record.status ?? record.account_status ?? '').trim().toLowerCase()
  return status === 'active' || status === 'live'
}

export function normalizePayoutAccount(record) {
  if (!record || typeof record !== 'object') {
    return null
  }

  const bankName = firstValue(record.bank_name, record.bankName)
  const accountHolderName = firstValue(
    record.account_holder_name,
    record.accountHolderName,
    record.account_name,
    record.accountName,
  )

  if (!bankName && !accountHolderName && !record.account_number && !record.accountNumber) {
    return null
  }

  const { accountNumber, accountNumberRaw } = resolveAccountNumber(record)
  const hasAccount = Boolean(bankName || accountHolderName || record.account_number || record.accountNumber)
  const status = normalizePayoutStatus(record.status ?? record.verification_status, { hasAccount })

  return {
    id: firstValue(record.id, record.payout_account_id, record.payoutAccountId),
    bankName,
    accountHolderName,
    accountNumber,
    accountNumberRaw,
    branch: firstValue(record.branch),
    status: status === 'not_added' ? 'not_added' : status,
    isActive: resolveIsActive(record),
    addedAt: firstValue(record.added_at, record.addedAt, record.created_at, record.createdAt),
  }
}

export function extractPayoutAccountPayload(body) {
  const accounts = extractPayoutAccountsPayload(body)
  return accounts[0] ?? null
}

export function extractPayoutAccountsPayload(body) {
  if (!body || typeof body !== 'object') return []

  const collectRecords = (items) => {
    if (!Array.isArray(items)) return []
    return items.filter((item) => hasPayoutAccountFields(item))
  }

  if (Array.isArray(body)) {
    return collectRecords(body)
  }

  if (hasPayoutAccountFields(body)) {
    return [body]
  }

  if (Array.isArray(body.data)) {
    return collectRecords(body.data)
  }

  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    if (hasPayoutAccountFields(body.data)) {
      return [body.data]
    }
  }

  if (body.payout_account && typeof body.payout_account === 'object') {
    if (Array.isArray(body.payout_account)) {
      return collectRecords(body.payout_account)
    }

    if (hasPayoutAccountFields(body.payout_account)) {
      return [body.payout_account]
    }
  }

  const fallback = body.data ?? body.payout_account
  if (Array.isArray(fallback)) return collectRecords(fallback)
  if (fallback && hasPayoutAccountFields(fallback)) return [fallback]

  return []
}

export function normalizePayoutAccounts(payload) {
  const records = Array.isArray(payload)
    ? payload
    : extractPayoutAccountsPayload(payload)

  const accounts = records
    .map((record) => normalizePayoutAccount(record))
    .filter(Boolean)

  const activeAccounts = accounts.filter((account) => account.isActive)
  if (activeAccounts.length <= 1) return accounts

  // Only one live account is allowed — keep the most recently added active mark.
  const keepId = [...activeAccounts].sort((a, b) => {
    const aTime = a.addedAt ? new Date(a.addedAt).getTime() : 0
    const bTime = b.addedAt ? new Date(b.addedAt).getTime() : 0
    if (bTime !== aTime) return bTime - aTime
    return String(b.id ?? '').localeCompare(String(a.id ?? ''))
  })[0]?.id

  return accounts.map((account) => ({
    ...account,
    isActive: account.id === keepId,
  }))
}

export function markPayoutAccountActive(accounts = [], accountId) {
  const id = String(accountId ?? '').trim()
  if (!id) return accounts

  return accounts.map((account) => ({
    ...account,
    isActive: account.id === id,
  }))
}

export function buildPayoutAccountStoreBody({
  bankName,
  accountHolderName,
  accountNumber,
  branch,
  id,
} = {}) {
  const body = {
    bank_name: String(bankName ?? '').trim(),
    account_holder_name: String(accountHolderName ?? '').trim(),
  }

  const branchValue = String(branch ?? '').trim()
  if (branchValue) {
    body.branch = branchValue
  }

  const digits = String(accountNumber ?? '').replace(/\D/g, '')
  if (digits) {
    body.account_number = digits
  }

  const accountId = String(id ?? '').trim()
  if (accountId && accountId !== 'pa_new') {
    body.id = accountId
  }

  return body
}

const ACCOUNT_HOLDER_PATTERN = /^[A-Za-z][A-Za-z\s'.-]{1,79}$/
const ACCOUNT_NUMBER_PATTERN = /^\d{10,16}$/
const BRANCH_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s,.'/-]{1,79}$/

/**
 * Validates payout account add/edit form values.
 * @param {{ bankName?: string, accountHolderName?: string, accountNumber?: string, branch?: string }} form
 * @param {{ mode?: 'add' | 'edit' }} [options]
 */
export function validatePayoutAccountForm(form = {}, { mode = 'add' } = {}) {
  const errors = {}
  const bankName = String(form.bankName ?? '').trim()
  const accountHolderName = String(form.accountHolderName ?? '').trim()
  const accountDigits = String(form.accountNumber ?? '').replace(/\D/g, '')
  const branch = String(form.branch ?? '').trim()

  if (!bankName) {
    errors.bankName = 'Select a bank.'
  }

  if (!accountHolderName) {
    errors.accountHolderName = 'Enter the account holder name.'
  } else if (accountHolderName.length < 2) {
    errors.accountHolderName = 'Account holder name is too short.'
  } else if (accountHolderName.length > 80) {
    errors.accountHolderName = 'Account holder name must be 80 characters or fewer.'
  } else if (!ACCOUNT_HOLDER_PATTERN.test(accountHolderName)) {
    errors.accountHolderName = 'Use letters, spaces, and basic punctuation only.'
  }

  if (mode === 'add' && !accountDigits) {
    errors.accountNumber = 'Enter the account number.'
  } else if (accountDigits && !ACCOUNT_NUMBER_PATTERN.test(accountDigits)) {
    errors.accountNumber = 'Enter a valid account number (10–16 digits).'
  }

  if (branch) {
    if (branch.length < 2) {
      errors.branch = 'Branch name is too short.'
    } else if (branch.length > 80) {
      errors.branch = 'Branch must be 80 characters or fewer.'
    } else if (!BRANCH_PATTERN.test(branch)) {
      errors.branch = 'Enter a valid branch name.'
    }
  }

  return errors
}
