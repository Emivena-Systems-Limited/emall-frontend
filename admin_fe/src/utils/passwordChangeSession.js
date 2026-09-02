const PASSWORD_CHANGED_KEY = 'admin_password_changed'

export function markPasswordChanged() {
  try {
    sessionStorage.setItem(PASSWORD_CHANGED_KEY, '1')
  } catch {
    /* private mode / blocked storage */
  }
}

export function hasPasswordChangedFlag() {
  try {
    return sessionStorage.getItem(PASSWORD_CHANGED_KEY) === '1'
  } catch {
    return false
  }
}

export function clearPasswordChangedFlag() {
  try {
    sessionStorage.removeItem(PASSWORD_CHANGED_KEY)
  } catch {
    /* private mode / blocked storage */
  }
}
