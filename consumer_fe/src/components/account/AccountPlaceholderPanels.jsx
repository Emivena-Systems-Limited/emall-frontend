import { Link } from 'react-router'
import { Bell, CircleHelp, CreditCard, Settings, Store } from 'lucide-react'
import AccountSectionShell from './AccountSectionShell'
import { accountSectionMeta } from './accountNavigation'

const sectionIcons = {
  stores: Store,
  payments: CreditCard,
  settings: Settings,
  notifications: Bell,
  support: CircleHelp,
}

function AccountComingSoonPanel({ sectionId, actionLabel, actionHref }) {
  const meta = accountSectionMeta[sectionId]
  const Icon = sectionIcons[sectionId]

  return (
    <AccountSectionShell
      eyebrow="Coming soon"
      title={meta.title}
      description={meta.description}
      icon={Icon}
      actionLabel={actionLabel}
      actionHref={actionHref}
    >
      <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-auth-primary shadow-sm">
          <Icon className="size-6" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-slate-900">This section is being prepared</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          We are building {meta.title.toLowerCase()} into a dedicated workspace. For now, you can
          continue managing the rest of your account from the sidebar.
        </p>
        <Link
          to="/account"
          className="mt-5 inline-flex rounded-xl bg-auth-primary px-5 py-2.5 text-sm font-bold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </AccountSectionShell>
  )
}

export function AccountFollowedStoresPanel() {
  return <AccountComingSoonPanel sectionId="stores" />
}

export function AccountPaymentsPanel() {
  return <AccountComingSoonPanel sectionId="payments" actionLabel="Go to checkout" actionHref="/cart" />
}

export function AccountSettingsPanel() {
  return <AccountComingSoonPanel sectionId="settings" />
}

export function AccountNotificationsPanel() {
  return <AccountComingSoonPanel sectionId="notifications" />
}

export function AccountSupportPanel() {
  return <AccountComingSoonPanel sectionId="support" />
}
