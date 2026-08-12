import { Link } from 'react-router'
import { UserPlus } from 'lucide-react'
import { canInviteUsers } from '../../utils/authorization'

export default function UsersPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Users & Permissions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your vendor team members, roles and access permissions.
        </p>
      </div>

      {canInviteUsers() && (
        <Link
          to="/users/new"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800"
        >
          <UserPlus className="size-4" />
          Add User
        </Link>
      )}
    </div>
  )
}
