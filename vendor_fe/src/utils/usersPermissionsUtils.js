import { SORT_DIRECTIONS, SORT_FIELDS, USER_ROLES } from '../constants/usersPermissions'

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

export function formatLastActive(iso) {
  if (!iso) return 'Never'
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function computeTeamSummary(members) {
  const total = members.length
  const active = members.filter((m) => m.status === 'active').length
  const pending = members.filter((m) => m.status === 'pending').length
  const suspended = members.filter((m) => m.status === 'suspended').length

  const roleCounts = Object.keys(USER_ROLES).reduce((acc, role) => {
    acc[role] = members.filter((m) => m.role === role).length
    return acc
  }, {})

  return { total, active, pending, suspended, roleCounts }
}

export function filterTeamMembers(members, { search, roleFilter, statusFilter }) {
  let result = [...members]

  if (roleFilter !== 'all') {
    result = result.filter((m) => m.role === roleFilter)
  }
  if (statusFilter !== 'all') {
    result = result.filter((m) => m.status === statusFilter)
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter(
      (m) =>
        m.name?.toLowerCase().includes(q)
        || m.email?.toLowerCase().includes(q),
    )
  }

  return result
}

export function sortTeamMembers(members, field, direction) {
  const dir = direction === SORT_DIRECTIONS.asc ? 1 : -1
  return [...members].sort((a, b) => {
    switch (field) {
      case SORT_FIELDS.role:
        return a.role.localeCompare(b.role) * dir
      case SORT_FIELDS.lastActive: {
        const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0
        const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0
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

export function createInviteMember({ name, email, role }) {
  return {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    role,
    status: 'pending',
    lastActive: null,
    invitedAt: new Date().toISOString(),
    avatar: null,
  }
}

export function updateMemberStatus(members, memberId, status) {
  return members.map((m) => (m.id === memberId ? { ...m, status } : m))
}

export function removeMember(members, memberId) {
  return members.filter((m) => m.id !== memberId)
}
