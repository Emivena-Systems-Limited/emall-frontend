import {
  BarChart3,
  LayoutDashboard,
  Package,
  Shield,
  ShoppingBag,
  Star,
  Tag,
  UserCircle,
  Users,
  Wallet,
} from 'lucide-react'
import {
  PERMISSION_LEVELS,
  PERMISSION_LEVEL_CONFIG,
  PERMISSION_LEVEL_OPTIONS,
} from '../../constants/usersPermissions'

export const PERMISSION_MODULE_ICONS = {
  dashboard: LayoutDashboard,
  orders: ShoppingBag,
  products: Package,
  customers: Users,
  promotions: Tag,
  analytics: BarChart3,
  finance: Wallet,
  reviews: Star,
  profile: UserCircle,
  users: Shield,
}

export default function PermissionLevelSelector({
  value,
  onChange,
  disabled = false,
  moduleKey,
}) {
  return (
    <div
      role="radiogroup"
      aria-label={`Access level for ${moduleKey}`}
      className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1 sm:min-w-[280px]"
    >
      {PERMISSION_LEVEL_OPTIONS.map((option) => {
        const config = PERMISSION_LEVEL_CONFIG[option.value]
        const isSelected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            title={config.description}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 ${
              isSelected
                ? config.selectedClass
                : 'border border-transparent text-slate-500 hover:bg-white hover:text-slate-700'
            }`}
          >
            <span className={`size-1.5 shrink-0 rounded-full ${isSelected ? config.dotClass : 'bg-transparent'}`} />
            <span className="hidden sm:inline">{config.shortLabel}</span>
            <span className="sm:hidden">
              {option.value === PERMISSION_LEVELS.FULL_ACCESS ? 'Full' : option.value === PERMISSION_LEVELS.VIEW_ONLY ? 'View' : 'Off'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
