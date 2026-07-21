import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderPagination from '../../components/orders/OrderPagination'
import InviteUserModal from '../../components/users/InviteUserModal'
import UsersPageHeader from '../../components/users/UsersPageHeader'
import UsersSummaryCards from '../../components/users/UsersSummaryCards'
import UsersTable, { RolePermissionsPanel } from '../../components/users/UsersTable'
import { SORT_DIRECTIONS, SORT_FIELDS, USERS_PAGE_SIZE } from '../../constants/usersPermissions'
import { DEV_TEAM_MEMBERS, MOCK_TEAM_MEMBERS } from '../../constants/usersPermissionsData'
import notify from '../../lib/notify'
import {
  computeTeamSummary,
  createInviteMember,
  filterTeamMembers,
  paginateItems,
  removeMember,
  sortTeamMembers,
  updateMemberStatus,
} from '../../utils/usersPermissionsUtils'

export default function UsersPermissions() {
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [members, setMembers] = useState(MOCK_TEAM_MEMBERS)
  const [inviteOpen, setInviteOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const summary = useMemo(() => computeTeamSummary(members), [members])
  const hasMembers = members.length > 0

  const filtered = useMemo(
    () => filterTeamMembers(members, { search, roleFilter, statusFilter }),
    [members, search, roleFilter, statusFilter],
  )

  const sorted = useMemo(
    () => sortTeamMembers(filtered, SORT_FIELDS.name, SORT_DIRECTIONS.asc),
    [filtered],
  )

  const pagination = useMemo(
    () => paginateItems(sorted, { page, pageSize: USERS_PAGE_SIZE }),
    [sorted, page],
  )

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter, statusFilter])

  const handleInvite = ({ name, email, role }) => {
    setMembers((current) => [...current, createInviteMember({ name, email, role })])
    notify.success(`Invite sent to ${email}.`)
  }

  const handleSuspend = (member, status = 'suspended') => {
    setMembers((current) => updateMemberStatus(current, member.id, status))
    notify.info(status === 'active' ? `${member.name} reactivated.` : `${member.name} suspended.`)
  }

  const handleRemove = (member) => {
    setMembers((current) => removeMember(current, member.id))
    notify.info(`${member.name} removed from team.`)
  }

  const handleResend = (member) => {
    notify.success(`Invite resent to ${member.email}.`)
  }

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    setMembers(enabled ? DEV_TEAM_MEMBERS : [])
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
    setPage(1)
    notify.info(enabled ? 'Loaded dummy team data.' : 'Cleared team data.')
  }

  return (
    <DashboardLayout pageTitle="Users & Permissions">
      <div className="page-enter space-y-6">
        <UsersPageHeader
          summary={summary}
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
          onInvite={() => setInviteOpen(true)}
        />

        {hasMembers && <UsersSummaryCards summary={summary} />}

        <UsersTable
          members={pagination.items}
          hasMembers={hasMembers}
          search={search}
          onSearchChange={setSearch}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onSuspend={handleSuspend}
          onRemove={handleRemove}
          onResend={handleResend}
        />

        {hasMembers && sorted.length > 0 && (
          <OrderPagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={pagination.totalItems}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPageChange={setPage}
            itemLabel="members"
          />
        )}

        <RolePermissionsPanel />
      </div>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />
    </DashboardLayout>
  )
}
