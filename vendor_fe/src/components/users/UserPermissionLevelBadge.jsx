import { getPermissionLevelLabel } from '../../utils/usersPermissionsUtils'

export default function UserPermissionLevelBadge({ level, summary }) {
  const label = summary || getPermissionLevelLabel(level)
  const tone = label === 'Full Access'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
    : label === 'View Only'
      ? 'bg-sky-50 text-sky-700 ring-sky-100'
      : label === 'No Access'
        ? 'bg-slate-100 text-slate-600 ring-slate-200'
        : 'bg-violet-50 text-violet-700 ring-violet-100'

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${tone}`}>
      {label}
    </span>
  )
}
