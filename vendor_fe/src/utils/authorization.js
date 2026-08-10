import {
  PERMISSION_LEVELS,
  USER_ROLES,
} from '../constants/usersPermissions'
import { getMockCurrentUser } from '../mocks/userMockData'
import { hasPermissionLevel } from './usersPermissionsUtils'

// TODO: Replace mock permission context with backend-authorized permissions.
// TODO: Ensure backend independently validates every protected action.

let currentUser = getMockCurrentUser()

export function setMockCurrentUser(user) {
  currentUser = user
}

export function getCurrentUserPermissions() {
  return currentUser
}

export function getModulePermission(moduleKey) {
  if (currentUser.role === USER_ROLES.STORE_OWNER) {
    return PERMISSION_LEVELS.FULL_ACCESS
  }
  return currentUser.permissions?.[moduleKey] ?? PERMISSION_LEVELS.NO_ACCESS
}

export function hasModulePermission(moduleKey, requiredLevel = PERMISSION_LEVELS.VIEW_ONLY) {
  return hasPermissionLevel(getModulePermission(moduleKey), requiredLevel)
}

export function canManageUsers() {
  return hasModulePermission('users', PERMISSION_LEVELS.FULL_ACCESS)
}

export function canInviteUsers() {
  return canManageUsers()
}

export function canEditUser(targetUser) {
  if (!canManageUsers()) return false
  if (targetUser?.role === USER_ROLES.STORE_OWNER) return false
  return true
}

export function canEditUserRole(targetUser) {
  if (!canManageUsers()) return false
  return targetUser?.role !== USER_ROLES.STORE_OWNER
}

export function canManageUserPermissions(targetUser) {
  if (!canManageUsers()) return false
  return targetUser?.role !== USER_ROLES.STORE_OWNER
}

export function canDeactivateUser(targetUser) {
  if (!canManageUsers()) return false
  return targetUser?.role !== USER_ROLES.STORE_OWNER && targetUser?.status === 'active'
}

export function canReactivateUser(targetUser) {
  if (!canManageUsers()) return false
  return targetUser?.status === 'deactivated'
}

export function canRemoveUser(targetUser) {
  if (!canManageUsers()) return false
  return targetUser?.role !== USER_ROLES.STORE_OWNER
}

export function canResendInvitation(targetUser) {
  if (!canManageUsers()) return false
  return targetUser?.status === 'invited'
}

export function canAssignPermissionLevel(moduleKey, level) {
  if (currentUser.role === USER_ROLES.STORE_OWNER) return true
  const actorLevel = getModulePermission(moduleKey)
  if (level === PERMISSION_LEVELS.FULL_ACCESS) {
    return actorLevel === PERMISSION_LEVELS.FULL_ACCESS
  }
  if (level === PERMISSION_LEVELS.VIEW_ONLY) {
    return hasPermissionLevel(actorLevel, PERMISSION_LEVELS.VIEW_ONLY)
  }
  return hasPermissionLevel(actorLevel, PERMISSION_LEVELS.VIEW_ONLY)
}

export function shouldShowNavModule(moduleKey) {
  return hasModulePermission(moduleKey, PERMISSION_LEVELS.VIEW_ONLY)
}
