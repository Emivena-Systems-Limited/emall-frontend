import { USER_STATUS } from '../../constants/usersPermissions'

export default function UserStatusBadge({ status }) {
  const config = USER_STATUS[status] ?? USER_STATUS.active

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  )
}
