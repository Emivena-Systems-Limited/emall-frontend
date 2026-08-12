import {
  ASSIGNABLE_ROLES,
  PERMISSION_LEVELS,
  PERMISSION_MODULES,
  ROLE_DEFAULT_PERMISSIONS,
  SORT_DIRECTIONS,
  SORT_FIELDS,
  USER_ROLES,
  USER_STATUS,
  USER_TABS,
} from '../constants/usersPermissions'
import { isValidPhoneNumber } from 'libphonenumber-js'

const PERMISSION_RANK = {
  [PERMISSION_LEVELS.NO_ACCESS]: 0,
  [PERMISSION_LEVELS.VIEW_ONLY]: 1,
  [PERMISSION_LEVELS.FULL_ACCESS]: 2,
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

export function getDefaultPermissionsForRole(role) {
  return structuredClone(ROLE_DEFAULT_PERMISSIONS[role] ?? ROLE_DEFAULT_PERMISSIONS.store_manager)
}

export function createEmptyInviteForm() {
  const role = ASSIGNABLE_ROLES[0]
  return {
    name: '',
    email: '',
    phone: '',
    role,
    permissions: getDefaultPermissionsForRole(role),
  }
}

export function isInviteFormDirty(form, baseline = createEmptyInviteForm()) {
  return form.name.trim() !== baseline.name
    || form.email.trim() !== baseline.email
    || (form.phone ?? '').trim() !== (baseline.phone ?? '').trim()
    || form.role !== baseline.role
    || !isPlainObjectEqual(form.permissions, baseline.permissions)
}

export function summarizePermissionLevel(permissions = {}) {
  if (!permissions || Object.keys(permissions).length === 0) return 'No Access'

  const values = PERMISSION_MODULES.map((module) => permissions[module.key] ?? PERMISSION_LEVELS.NO_ACCESS)
  const fullCount = values.filter((value) => value === PERMISSION_LEVELS.FULL_ACCESS).length
  const noAccessCount = values.filter((value) => value === PERMISSION_LEVELS.NO_ACCESS).length

  if (fullCount === PERMISSION_MODULES.length) return 'Full Access'
  if (noAccessCount === PERMISSION_MODULES.length) return 'No Access'
  if (values.every((value) => value === PERMISSION_LEVELS.VIEW_ONLY || value === PERMISSION_LEVELS.NO_ACCESS)
    && values.some((value) => value === PERMISSION_LEVELS.VIEW_ONLY)) {
    return 'View Only'
  }

  const accessibleCount = values.filter((value) => value !== PERMISSION_LEVELS.NO_ACCESS).length
  return `${accessibleCount} of ${PERMISSION_MODULES.length} modules`
}

export function getPermissionLevelLabel(level) {
  if (level === PERMISSION_LEVELS.FULL_ACCESS) return 'Full Access'
  if (level === PERMISSION_LEVELS.VIEW_ONLY) return 'View Only'
  return 'No Access'
}

export function hasPermissionLevel(userLevel, requiredLevel) {
  return (PERMISSION_RANK[userLevel] ?? 0) >= (PERMISSION_RANK[requiredLevel] ?? 0)
}

export function formatLastActive(iso) {
  if (!iso) return 'Never'
  const date = new Date(iso)
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatInvitedAt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function computeUsersSummary(users) {
  return {
    total: users.length,
    admins: users.filter((user) => user.role === USER_ROLES.ADMIN).length,
    storeManagers: users.filter((user) => user.role === USER_ROLES.STORE_MANAGER).length,
    active: users.filter((user) => user.status === USER_STATUS.ACTIVE).length,
    invited: users.filter((user) => user.status === USER_STATUS.INVITED).length,
    deactivated: users.filter((user) => user.status === USER_STATUS.DEACTIVATED).length,
  }
}

export function computeTabCounts(users) {
  return {
    [USER_TABS.ALL]: users.filter((user) => user.status !== USER_STATUS.DEACTIVATED).length,
    [USER_TABS.PENDING]: users.filter((user) => user.status === USER_STATUS.INVITED).length,
    [USER_TABS.DEACTIVATED]: users.filter((user) => user.status === USER_STATUS.DEACTIVATED).length,
  }
}

export function filterUsersByTab(users, tab) {
  if (tab === USER_TABS.PENDING) {
    return users.filter((user) => user.status === USER_STATUS.INVITED)
  }
  if (tab === USER_TABS.DEACTIVATED) {
    return users.filter((user) => user.status === USER_STATUS.DEACTIVATED)
  }
  return users.filter((user) => user.status !== USER_STATUS.DEACTIVATED)
}

export function filterUsers(users, { search, roleFilter, statusFilter }) {
  let result = [...users]

  if (roleFilter !== 'all') {
    result = result.filter((user) => user.role === roleFilter)
  }

  if (statusFilter !== 'all') {
    result = result.filter((user) => user.status === statusFilter)
  }

  const query = search.trim().toLowerCase()
  if (query) {
    result = result.filter(
      (user) =>
        user.name?.toLowerCase().includes(query)
        || user.email?.toLowerCase().includes(query),
    )
  }

  return result
}

export function sortUsers(users, field, direction) {
  const dir = direction === SORT_DIRECTIONS.asc ? 1 : -1
  return [...users].sort((a, b) => {
    switch (field) {
      case SORT_FIELDS.role:
        return a.role.localeCompare(b.role) * dir
      case SORT_FIELDS.lastActive: {
        const aTime = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0
        const bTime = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0
        return (aTime - bTime) * dir
      }
      case SORT_FIELDS.name:
      default:
        return a.name.localeCompare(b.name) * dir
    }
  })
}

export function paginateItems(items, { page, pageSize }) {
  const totalItems = items.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  return {
    items: items.slice(startIndex, endIndex),
    page: safePage,
    pageCount,
    totalItems,
    startIndex: totalItems === 0 ? 0 : startIndex + 1,
    endIndex,
  }
}

export function validateInviteUserForm({ name, email, role, phone }) {
  const errors = {}
  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const trimmedPhone = String(phone ?? '').trim()

  if (trimmedName.length < 3) errors.name = 'Enter the user\'s full name.'
  if (!trimmedEmail) errors.email = 'Email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) errors.email = 'Enter a valid email address.'

  if (trimmedPhone && !isValidPhoneNumber(trimmedPhone)) {
    errors.phone = 'Enter a valid international phone number.'
  }

  if (!role) errors.role = 'Select a role.'
  if (role === USER_ROLES.STORE_OWNER) errors.role = 'Store Owner cannot be assigned when inviting users.'

  return errors
}

export function isStoreOwner(user) {
  return user?.role === USER_ROLES.STORE_OWNER
}

export function isPlainObjectEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function enrichUserRecord(user) {
  return {
    ...user,
    permissionLevel: summarizePermissionLevel(user.permissions),
  }
}
