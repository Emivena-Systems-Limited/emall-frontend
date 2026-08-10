import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import ConfirmModal from '../../components/common/ConfirmModal'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import AddUserForm from '../../components/users/AddUserForm'
import AddUserFormActions from '../../components/users/AddUserFormActions'
import { USER_TABS } from '../../constants/usersPermissions'
import { useInviteUserMutation } from '../../hooks/useUsers'
import notify from '../../lib/notify'
import { canInviteUsers } from '../../utils/authorization'
import {
  createEmptyInviteForm,
  getDefaultPermissionsForRole,
  isInviteFormDirty,
  isPlainObjectEqual,
  validateInviteUserForm,
} from '../../utils/usersPermissionsUtils'

export default function AddUser() {
  const navigate = useNavigate()
  const initialForm = useMemo(() => createEmptyInviteForm(), [])
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [discardOpen, setDiscardOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState(null)

  const inviteMutation = useInviteUserMutation()
  const isSubmitting = inviteMutation.isPending

  const baselinePermissions = useMemo(
    () => getDefaultPermissionsForRole(form.role),
    [form.role],
  )
  const permissionsDirty = !isPlainObjectEqual(form.permissions, baselinePermissions)
  const isDirty = isInviteFormDirty(form, initialForm)

  if (!canInviteUsers()) {
    return <Navigate to="/users" replace />
  }

  const handleCancel = () => {
    if (isDirty) {
      setDiscardOpen(true)
      return
    }
    navigate('/users')
  }

  const handleRoleChange = (nextRole) => {
    if (permissionsDirty) {
      setPendingRole(nextRole)
      setResetConfirmOpen(true)
      return
    }

    setForm((current) => ({
      ...current,
      role: nextRole,
      permissions: getDefaultPermissionsForRole(nextRole),
    }))
    setErrors((current) => ({ ...current, role: undefined }))
  }

  const handleConfirmRoleReset = () => {
    if (pendingRole) {
      setForm((current) => ({
        ...current,
        role: pendingRole,
        permissions: getDefaultPermissionsForRole(pendingRole),
      }))
      setErrors((current) => ({ ...current, role: undefined }))
    }
    setPendingRole(null)
    setResetConfirmOpen(false)
  }

  const handleSubmit = async () => {
    const nextErrors = validateInviteUserForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      const trimmedPhone = form.phone?.trim()
      await inviteMutation.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: trimmedPhone || null,
        role: form.role,
        permissions: form.permissions,
      })
      notify.success('Invitation sent successfully.')
      navigate('/users', { state: { activeTab: USER_TABS.PENDING } })
    } catch {
      notify.error('Unable to send invitation. Please try again.')
    }
  }

  return (
    <DashboardLayout pageTitle="Add User">
      <div className="page-enter space-y-5">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to users
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-950">Add User</h1>
          <p className="mt-1 text-sm text-slate-500">
            Invite a team member with a role and custom permissions for your vendor dashboard.
          </p>
        </div>

        <AddUserForm
          form={form}
          errors={errors}
          onFieldChange={(field, value) => {
            setForm((current) => ({ ...current, [field]: value }))
            setErrors((current) => ({ ...current, [field]: undefined }))
          }}
          onRoleChange={handleRoleChange}
          onPermissionChange={(moduleKey, value) => {
            setForm((current) => ({
              ...current,
              permissions: { ...current.permissions, [moduleKey]: value },
            }))
          }}
          onResetPermissions={() => {
            setForm((current) => ({
              ...current,
              permissions: getDefaultPermissionsForRole(current.role),
            }))
          }}
        />

        <AddUserFormActions
          isSubmitting={isSubmitting}
          discardOpen={discardOpen}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          onDiscardClose={() => setDiscardOpen(false)}
          onDiscardConfirm={() => navigate('/users')}
        />
      </div>

      <ConfirmModal
        open={resetConfirmOpen}
        title="Reset permissions?"
        description="Changing the role will reset permissions to the default set for that role."
        confirmLabel="Reset Permissions"
        cancelLabel="Keep Current"
        tone="warning"
        onConfirm={handleConfirmRoleReset}
        onClose={() => {
          setResetConfirmOpen(false)
          setPendingRole(null)
        }}
      />
    </DashboardLayout>
  )
}
