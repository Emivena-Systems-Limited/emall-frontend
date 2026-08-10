import { KeyRound, Shield, UserRound } from 'lucide-react'
import {
  ASSIGNABLE_ROLES,
  USER_ROLE_CONFIG,
} from '../../constants/usersPermissions'
import { getDefaultPermissionsForRole } from '../../utils/usersPermissionsUtils'
import InternationalPhoneInput from '../common/InternationalPhoneInput'
import ProfileSectionCard, {
  ProfileFieldLabel,
  ProfileTextInput,
} from '../profile/ProfileSectionCard'
import PermissionMatrix from './PermissionMatrix'

export default function AddUserForm({
  form,
  errors = {},
  onFieldChange,
  onRoleChange,
  onPermissionChange,
  onResetPermissions,
}) {
  const roleDefaults = getDefaultPermissionsForRole(form.role)

  return (
    <div className="space-y-5">
      <ProfileSectionCard
        icon={UserRound}
        title="User Information"
        subtitle="Enter the team member's contact details. They will receive an invitation to join your vendor dashboard."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ProfileFieldLabel htmlFor="invite-name">Full Name</ProfileFieldLabel>
            <ProfileTextInput
              id="invite-name"
              value={form.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              placeholder="Enter full name"
              error={errors.name}
            />
          </div>

          <div>
            <ProfileFieldLabel htmlFor="invite-email">Email Address</ProfileFieldLabel>
            <ProfileTextInput
              id="invite-email"
              type="email"
              value={form.email}
              onChange={(event) => onFieldChange('email', event.target.value)}
              placeholder="Enter email address"
              error={errors.email}
            />
          </div>

          <div>
            <InternationalPhoneInput
              id="invite-phone"
              optional
              value={form.phone}
              onChange={(value) => onFieldChange('phone', value)}
              error={errors.phone}
            />
          </div>
        </div>
      </ProfileSectionCard>

      <ProfileSectionCard
        icon={Shield}
        title="Role"
        subtitle="Choose the role that best matches this team member's responsibilities."
      >
        <fieldset>
          <legend className="sr-only">Role</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ASSIGNABLE_ROLES.map((roleKey) => {
              const roleInfo = USER_ROLE_CONFIG[roleKey]
              const isSelected = form.role === roleKey

              return (
                <label
                  key={roleKey}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 transition-colors ${
                    isSelected
                      ? 'border-brand bg-brand-light/30 ring-1 ring-brand/20'
                      : 'border-slate-300 bg-white ring-1 ring-slate-200/60 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={roleKey}
                    checked={isSelected}
                    onChange={() => onRoleChange(roleKey)}
                    className="mt-1 accent-brand"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{roleInfo.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{roleInfo.description}</p>
                  </div>
                </label>
              )
            })}
          </div>
          {errors.role && <p className="mt-2 text-xs font-medium text-red-600">{errors.role}</p>}
        </fieldset>
      </ProfileSectionCard>

      <ProfileSectionCard
        icon={KeyRound}
        title="Permissions"
        subtitle="Fine-tune module access for this user. Defaults are applied based on the selected role."
      >
        <PermissionMatrix
          permissions={form.permissions}
          onChange={onPermissionChange}
          roleDefaults={roleDefaults}
          onResetToDefaults={onResetPermissions}
        />
      </ProfileSectionCard>
    </div>
  )
}
