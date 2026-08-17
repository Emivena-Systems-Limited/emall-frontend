const PASSWORD_CHANGED_KEY = 'vendor_password_changed'

export function markPasswordChanged() {
  sessionStorage.setItem(PASSWORD_CHANGED_KEY, '1')
}

export function hasPasswordChangedFlag() {
  return sessionStorage.getItem(PASSWORD_CHANGED_KEY) === '1'
}

export function clearPasswordChangedFlag() {
  sessionStorage.removeItem(PASSWORD_CHANGED_KEY)
}
