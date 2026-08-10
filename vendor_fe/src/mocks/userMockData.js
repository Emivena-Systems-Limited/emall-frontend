import {
  PERMISSION_LEVELS,
  USER_ROLES,
  USER_STATUS,
} from '../constants/usersPermissions'
import { getDefaultPermissionsForRole } from '../utils/usersPermissionsUtils'

function createUser(overrides) {
  const role = overrides.role ?? USER_ROLES.ADMIN
  const permissions = overrides.permissions ?? getDefaultPermissionsForRole(role)

  return {
    profilePicture: null,
    invitedAt: null,
    lastActiveAt: null,
    ...overrides,
    permissions,
  }
}

export const MOCK_CURRENT_VENDOR_USER = {
  id: 'user-001',
  name: 'Akua Mensah',
  email: 'akua@accrahome.com',
  role: USER_ROLES.STORE_OWNER,
  status: USER_STATUS.ACTIVE,
  permissions: getDefaultPermissionsForRole(USER_ROLES.STORE_OWNER),
}

export const MOCK_VENDOR_USERS = [
  createUser({
    id: 'user-001',
    name: 'Akua Mensah',
    email: 'akua@accrahome.com',
    role: USER_ROLES.STORE_OWNER,
    status: USER_STATUS.ACTIVE,
    lastActiveAt: '2026-08-10T08:42:00.000Z',
    invitedAt: '2025-03-15T10:00:00.000Z',
  }),
  createUser({
    id: 'user-002',
    name: 'Daniel Ofori',
    email: 'daniel@accrahome.com',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    lastActiveAt: '2026-08-10T07:15:00.000Z',
    invitedAt: '2025-06-01T14:00:00.000Z',
  }),
  createUser({
    id: 'user-003',
    name: 'Grace Adom',
    email: 'grace@accrahome.com',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    lastActiveAt: '2026-08-09T16:45:00.000Z',
    invitedAt: '2025-09-10T09:00:00.000Z',
    permissions: {
      dashboard: PERMISSION_LEVELS.FULL_ACCESS,
      orders: PERMISSION_LEVELS.FULL_ACCESS,
      products: PERMISSION_LEVELS.FULL_ACCESS,
      customers: PERMISSION_LEVELS.VIEW_ONLY,
      promotions: PERMISSION_LEVELS.NO_ACCESS,
      analytics: PERMISSION_LEVELS.VIEW_ONLY,
      finance: PERMISSION_LEVELS.NO_ACCESS,
      reviews: PERMISSION_LEVELS.FULL_ACCESS,
      profile: PERMISSION_LEVELS.VIEW_ONLY,
      users: PERMISSION_LEVELS.NO_ACCESS,
    },
  }),
  createUser({
    id: 'user-004',
    name: 'Samuel Tetteh',
    email: 'samuel@accrahome.com',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    lastActiveAt: '2026-08-08T14:20:00.000Z',
    invitedAt: '2026-01-20T11:00:00.000Z',
  }),
  createUser({
    id: 'user-005',
    name: 'Patricia Nyarko',
    email: 'patricia.n@gmail.com',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.INVITED,
    lastActiveAt: null,
    invitedAt: '2026-08-08T08:00:00.000Z',
  }),
  createUser({
    id: 'user-006',
    name: 'Michael Asare',
    email: 'm.asare@outlook.com',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.DEACTIVATED,
    lastActiveAt: '2026-06-01T10:00:00.000Z',
    invitedAt: '2025-04-05T12:00:00.000Z',
  }),
  createUser({
    id: 'user-007',
    name: 'Kwame Boateng',
    email: 'kwame.b@accrahome.com',
    role: USER_ROLES.STORE_MANAGER,
    status: USER_STATUS.ACTIVE,
    lastActiveAt: '2026-08-10T06:30:00.000Z',
    invitedAt: '2025-05-12T09:30:00.000Z',
  }),
  createUser({
    id: 'user-008',
    name: 'Ama Serwaa',
    email: 'ama.s@accrahome.com',
    role: USER_ROLES.STORE_MANAGER,
    status: USER_STATUS.ACTIVE,
    lastActiveAt: '2026-08-09T11:10:00.000Z',
    invitedAt: '2025-07-18T15:00:00.000Z',
  }),
  createUser({
    id: 'user-009',
    name: 'Joseph Kumi',
    email: 'j.kumi@accrahome.com',
    role: USER_ROLES.STORE_MANAGER,
    status: USER_STATUS.ACTIVE,
    lastActiveAt: '2026-08-07T09:00:00.000Z',
    invitedAt: '2025-11-02T10:00:00.000Z',
  }),
  createUser({
    id: 'user-010',
    name: 'Efua Owusu',
    email: 'efua.o@accrahome.com',
    role: USER_ROLES.STORE_MANAGER,
    status: USER_STATUS.ACTIVE,
    lastActiveAt: '2026-08-06T13:25:00.000Z',
    invitedAt: '2026-02-14T08:00:00.000Z',
  }),
  createUser({
    id: 'user-011',
    name: 'Kofi Annan',
    email: 'kofi.a@gmail.com',
    role: USER_ROLES.STORE_MANAGER,
    status: USER_STATUS.INVITED,
    lastActiveAt: null,
    invitedAt: '2026-08-09T12:00:00.000Z',
  }),
  createUser({
    id: 'user-012',
    name: 'Abena Darko',
    email: 'abena.d@gmail.com',
    role: USER_ROLES.STORE_MANAGER,
    status: USER_STATUS.INVITED,
    lastActiveAt: null,
    invitedAt: '2026-08-07T16:45:00.000Z',
  }),
  createUser({
    id: 'user-013',
    name: 'Yaw Mensah',
    email: 'yaw.m@accrahome.com',
    role: USER_ROLES.STORE_MANAGER,
    status: USER_STATUS.DEACTIVATED,
    lastActiveAt: '2026-05-20T08:00:00.000Z',
    invitedAt: '2025-08-01T09:00:00.000Z',
  }),
  createUser({
    id: 'user-014',
    name: 'Linda Osei',
    email: 'linda.o@accrahome.com',
    role: USER_ROLES.STORE_MANAGER,
    status: USER_STATUS.ACTIVE,
    profilePicture: null,
    lastActiveAt: '2026-08-10T05:50:00.000Z',
    invitedAt: '2026-03-10T11:00:00.000Z',
  }),
]

let usersStore = structuredClone(MOCK_VENDOR_USERS)

export function resetUserMockStore() {
  usersStore = structuredClone(MOCK_VENDOR_USERS)
}

export function getMockUsers() {
  return structuredClone(usersStore)
}

export function getMockUserById(userId) {
  const user = usersStore.find((item) => item.id === userId)
  return user ? structuredClone(user) : null
}

export function saveMockUser(user) {
  const index = usersStore.findIndex((item) => item.id === user.id)
  if (index === -1) {
    usersStore = [...usersStore, user]
  } else {
    usersStore = usersStore.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...user } : item
    ))
  }
  return getMockUserById(user.id)
}

export function deleteMockUser(userId) {
  usersStore = usersStore.filter((item) => item.id !== userId)
}

export function addMockUser(user) {
  usersStore = [...usersStore, user]
  return structuredClone(user)
}

export function getMockCurrentUser() {
  return structuredClone(MOCK_CURRENT_VENDOR_USER)
}
