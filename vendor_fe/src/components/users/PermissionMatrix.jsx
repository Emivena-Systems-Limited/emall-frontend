import { RotateCcw } from 'lucide-react'
import {
  PERMISSION_LEVELS,
  PERMISSION_LEVEL_CONFIG,
  PERMISSION_LEVEL_OPTIONS,
  PERMISSION_MODULES,
} from '../../constants/usersPermissions'
import { canAssignPermissionLevel } from '../../utils/authorization'
import PermissionLevelSelector, { PERMISSION_MODULE_ICONS } from './PermissionLevelSelector'

function countPermissionLevels(permissions) {
  const counts = {
    [PERMISSION_LEVELS.FULL_ACCESS]: 0,
    [PERMISSION_LEVELS.VIEW_ONLY]: 0,
    [PERMISSION_LEVELS.NO_ACCESS]: 0,
  }

  PERMISSION_MODULES.forEach((module) => {
    const level = permissions[module.key] ?? PERMISSION_LEVELS.NO_ACCESS
    counts[level] = (counts[level] ?? 0) + 1
  })

  return counts
}

export default function PermissionMatrix({
  permissions,
  onChange,
  disabled = false,
  roleDefaults = null,
  onResetToDefaults = null,
}) {
  const counts = countPermissionLevels(permissions)
  const hasCustomPermissions = roleDefaults
    && PERMISSION_MODULES.some((module) => permissions[module.key] !== roleDefaults[module.key])
  const showReset = Boolean(onResetToDefaults && hasCustomPermissions)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 ring-1 ring-slate-200/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Access summary</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[PERMISSION_LEVELS.FULL_ACCESS, PERMISSION_LEVELS.VIEW_ONLY, PERMISSION_LEVELS.NO_ACCESS].map((level) => {
                const config = PERMISSION_LEVEL_CONFIG[level]
                return (
                  <span
                    key={level}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${config.summaryClass}`}
                  >
                    <span className={`size-1.5 rounded-full ${config.dotClass}`} />
                    {counts[level]} {config.label}
                  </span>
                )
              })}
            </div>
          </div>

          {showReset && (
            <button
              type="button"
              onClick={onResetToDefaults}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="size-3.5" />
              Reset to role defaults
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {PERMISSION_LEVEL_OPTIONS.map((option) => {
          const config = PERMISSION_LEVEL_CONFIG[option.value]
          return (
            <div
              key={option.value}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 ring-1 ring-slate-200/50"
            >
              <div className="flex items-center gap-2">
                <span className={`size-2 shrink-0 rounded-full ${config.dotClass}`} />
                <p className="text-xs font-bold text-slate-800">{config.label}</p>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{config.description}</p>
            </div>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 ring-1 ring-slate-200/60">
        <div className="hidden border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-4">
          <span>Module</span>
          <span className="text-center">Access level</span>
        </div>

        <div className="divide-y divide-slate-100">
          {PERMISSION_MODULES.map((module) => {
            const value = permissions[module.key] ?? PERMISSION_LEVELS.NO_ACCESS
            const canEdit = !disabled && canAssignPermissionLevel(module.key, value)
            const Icon = PERMISSION_MODULE_ICONS[module.key]
            const isCustom = roleDefaults && roleDefaults[module.key] !== value
            const levelConfig = PERMISSION_LEVEL_CONFIG[value]

            return (
              <div
                key={module.key}
                className="grid gap-3 px-4 py-4 transition-colors hover:bg-slate-50/50 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:gap-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
                    {Icon && <Icon className="size-4" strokeWidth={2} />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{module.label}</p>
                      {isCustom && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{module.description}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 lg:hidden">
                      <span className={`size-1.5 rounded-full ${levelConfig.dotClass}`} />
                      Current: {levelConfig.label}
                    </p>
                  </div>
                </div>

                <PermissionLevelSelector
                  value={value}
                  onChange={(next) => onChange(module.key, next)}
                  disabled={disabled || !canEdit}
                  moduleKey={module.key}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
