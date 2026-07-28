import { Crown, Eye, Shield, UserCog } from 'lucide-react'
import { USER_ROLES } from '../../constants/usersPermissions'

const ROLE_ICONS = {
  owner: Crown,
  manager: Shield,
  staff: UserCog,
  viewer: Eye,
}

export default function UserRoleBadge({ role }) {
  const config = USER_ROLES[role] ?? USER_ROLES.viewer
  const Icon = ROLE_ICONS[role] ?? Eye

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {config.label}
    </span>
  )
}
