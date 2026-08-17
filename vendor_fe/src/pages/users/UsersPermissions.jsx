import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import ConfirmModal from '../../components/common/ConfirmModal'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderPagination from '../../components/orders/OrderPagination'
import EditRoleModal from '../../components/users/EditRoleModal'
import UserDetailsDrawer from '../../components/users/UserDetailsDrawer'
import UserPermissionsDrawer from '../../components/users/UserPermissionsDrawer'
import UsersPageHeader from '../../components/users/UsersPageHeader'
import UsersSummaryCards from '../../components/users/UsersSummaryCards'
import UsersTable from '../../components/users/UsersTable'
import UserTabs from '../../components/users/UserTabs'
import {
  SORT_DIRECTIONS,
  SORT_FIELDS,
  USER_TABS,
  USERS_PAGE_SIZE,
} from '../../constants/usersPermissions'
import {
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useRemoveUserMutation,
  useResendInvitationMutation,
  useUpdateUserPermissionsMutation,
  useUpdateUserRoleMutation,
} from '../../hooks/useUsers'
import notify from '../../lib/notify'
import {
  computeTabCounts,
  computeUsersSummary,
  filterUsers,
  filterUsersByTab,
  mapAuthUserToTeamMember,
  paginateItems,
  sortUsers,
} from '../../utils/usersPermissionsUtils'

export default function UsersPermissions() {
  const location = useLocation()
  const authUser = useSelector((state) => state.auth.user)
  const users = useMemo(() => {
    const owner = mapAuthUserToTeamMember(authUser)
    return owner ? [owner] : []
  }, [authUser])

  const [activeTab, setActiveTab] = useState(USER_TABS.ALL)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [selectedUser, setSelectedUser] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [roleModalUser, setRoleModalUser] = useState(null)
  const [permissionsUser, setPermissionsUser] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  const roleMutation = useUpdateUserRoleMutation()
  const permissionsMutation = useUpdateUserPermissionsMutation()
  const deactivateMutation = useDeactivateUserMutation()
  const reactivateMutation = useReactivateUserMutation()
  const removeMutation = useRemoveUserMutation()
  const resendMutation = useResendInvitationMutation()

  const summary = useMemo(() => computeUsersSummary(users), [users])
  const tabCounts = useMemo(() => computeTabCounts(users), [users])

  const hasActiveFilters = search.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all'

  const filteredUsers = useMemo(() => {
    const tabUsers = filterUsersByTab(users, activeTab)
    return filterUsers(tabUsers, { search, roleFilter, statusFilter })
  }, [users, activeTab, search, roleFilter, statusFilter])

  const sortedUsers = useMemo(
    () => sortUsers(filteredUsers, SORT_FIELDS.name, SORT_DIRECTIONS.asc),
    [filteredUsers],
  )

  const pagination = useMemo(
    () => paginateItems(sortedUsers, { page, pageSize: USERS_PAGE_SIZE }),
    [sortedUsers, page],
  )

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location.state?.activeTab])

  useEffect(() => {
    setPage(1)
  }, [activeTab, search, roleFilter, statusFilter])

  const closeDetails = () => {
    setDetailsOpen(false)
    setSelectedUser(null)
  }

  const openDetails = (user) => {
    setSelectedUser(user)
    setDetailsOpen(true)
  }

  const handleRoleSave = async (user, role) => {
    try {
      await roleMutation.mutateAsync({ userId: user.id, role })
      notify.success('User role updated successfully.')
      setRoleModalUser(null)
      closeDetails()
    } catch {
      notify.error('Unable to update user role. Please try again.')
    }
  }

  const handlePermissionsSave = async (user, permissions) => {
    try {
      await permissionsMutation.mutateAsync({ userId: user.id, permissions })
      notify.success('Permissions updated successfully.')
      setPermissionsUser(null)
      closeDetails()
    } catch {
      notify.error('Unable to update permissions. Your changes were not saved. Please try again.')
    }
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    const { type, user } = confirmAction

    try {
      if (type === 'deactivate') {
        await deactivateMutation.mutateAsync(user.id)
        notify.success('User deactivated successfully.')
        setActiveTab(USER_TABS.DEACTIVATED)
      } else if (type === 'reactivate') {
        await reactivateMutation.mutateAsync(user.id)
        notify.success('User reactivated successfully.')
        setActiveTab(USER_TABS.ALL)
      } else if (type === 'remove') {
        await removeMutation.mutateAsync(user.id)
        notify.success('User removed successfully.')
      }
      closeDetails()
    } catch {
      notify.error('Unable to complete this action. Please try again.')
    } finally {
      setConfirmAction(null)
    }
  }

  const handleResend = async (user) => {
    try {
      await resendMutation.mutateAsync(user.id)
      notify.success('Invitation resent successfully.')
    } catch {
      notify.error('Unable to resend invitation. Please try again.')
    }
  }

  const actionHandlers = {
    onView: openDetails,
    onEditRole: (user) => setRoleModalUser(user),
    onManagePermissions: (user) => setPermissionsUser(user),
    onDeactivate: (user) => setConfirmAction({ type: 'deactivate', user }),
    onReactivate: (user) => setConfirmAction({ type: 'reactivate', user }),
    onRemove: (user) => setConfirmAction({ type: 'remove', user }),
    onResend: handleResend,
  }

  const confirmCopy = confirmAction?.type === 'deactivate'
    ? {
      title: 'Deactivate User?',
      description: `${confirmAction.user.name} will no longer be able to access the Vendor Dashboard.`,
      confirmLabel: 'Deactivate User',
      tone: 'warning',
    }
    : confirmAction?.type === 'reactivate'
      ? {
        title: 'Reactivate User?',
        description: `${confirmAction.user.name} will regain access to the Vendor Dashboard.`,
        confirmLabel: 'Reactivate User',
        tone: 'success',
      }
      : confirmAction?.type === 'remove'
        ? {
          title: 'Remove User?',
          description: `This will permanently remove ${confirmAction.user.name} from your vendor team. This action cannot be undone.`,
          confirmLabel: 'Remove User',
          tone: 'danger',
        }
        : null

  return (
    <DashboardLayout pageTitle="Users & Permissions">
      <div className="page-enter space-y-6">
        <UsersPageHeader />

        <UsersSummaryCards summary={summary} />
        <UserTabs activeTab={activeTab} counts={tabCounts} onChange={setActiveTab} />

        <UsersTable
          users={pagination.items}
          tab={activeTab}
          search={search}
          onSearchChange={setSearch}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={() => {
            setSearch('')
            setRoleFilter('all')
            setStatusFilter('all')
          }}
          hasActiveFilters={hasActiveFilters}
          {...actionHandlers}
        />

        {sortedUsers.length > 0 && (
          <OrderPagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={pagination.totalItems}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPageChange={setPage}
            itemLabel="users"
          />
        )}
      </div>

      <UserDetailsDrawer
        open={detailsOpen}
        user={selectedUser}
        onClose={closeDetails}
        onEditRole={(user) => setRoleModalUser(user)}
        onManagePermissions={(user) => setPermissionsUser(user)}
        onDeactivate={(user) => setConfirmAction({ type: 'deactivate', user })}
        onReactivate={(user) => setConfirmAction({ type: 'reactivate', user })}
        onRemove={(user) => setConfirmAction({ type: 'remove', user })}
        onResend={handleResend}
      />

      <EditRoleModal
        open={Boolean(roleModalUser)}
        user={roleModalUser}
        onClose={() => setRoleModalUser(null)}
        onSubmit={handleRoleSave}
        isSubmitting={roleMutation.isPending}
      />

      <UserPermissionsDrawer
        open={Boolean(permissionsUser)}
        user={permissionsUser}
        onClose={() => setPermissionsUser(null)}
        onSubmit={handlePermissionsSave}
        isSubmitting={permissionsMutation.isPending}
      />

      <ConfirmModal
        open={Boolean(confirmCopy)}
        title={confirmCopy?.title}
        description={confirmCopy?.description}
        confirmLabel={confirmCopy?.confirmLabel}
        tone={confirmCopy?.tone}
        isLoading={deactivateMutation.isPending || reactivateMutation.isPending || removeMutation.isPending}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmAction(null)}
      />
    </DashboardLayout>
  )
}
