import { Crown, Shield, UserCog } from 'lucide-react'
import { USER_ROLE_CONFIG } from '../../constants/usersPermissions'

const ROLE_ICONS = {
  store_owner: Crown,
  admin: Shield,
  store_manager: UserCog,
}

export default function UserRoleBadge({ role }) {
  const config = USER_ROLE_CONFIG[role] ?? USER_ROLE_CONFIG.store_manager
  const Icon = ROLE_ICONS[role] ?? UserCog

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {config.label}
    </span>
  )
}
