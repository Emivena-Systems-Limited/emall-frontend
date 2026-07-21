import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import StoreSettingsPageHeader, {
  StoreSettingsPanel,
  StoreSettingsSetupForm,
} from '../../components/settings/StoreSettingsPanel'
import {
  DEV_STORE_SETTINGS,
  getEmptyStoreSettings,
  isStoreConfigured,
} from '../../constants/storeSettingsData'
import notify from '../../lib/notify'

export default function StoreSettings() {
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [settings, setSettings] = useState(getEmptyStoreSettings())

  const configured = useMemo(() => isStoreConfigured(settings), [settings])

  const handleSave = (section) => {
    notify.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved.`)
  }

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    setSettings(enabled ? structuredClone(DEV_STORE_SETTINGS) : getEmptyStoreSettings())
    notify.info(enabled ? 'Loaded dummy store settings.' : 'Cleared store settings.')
  }

  return (
    <DashboardLayout pageTitle="Store Settings">
      <div className="page-enter space-y-6">
        <StoreSettingsPageHeader
          configured={configured}
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
        />

        {configured ? (
          <StoreSettingsPanel
            settings={settings}
            onChange={setSettings}
            onSave={handleSave}
            configured
          />
        ) : (
          <StoreSettingsSetupForm
            settings={settings}
            onChange={setSettings}
            onSave={handleSave}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
