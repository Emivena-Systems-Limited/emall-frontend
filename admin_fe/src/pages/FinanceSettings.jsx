import { useState } from 'react'
import { Settings } from 'lucide-react'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import FinanceConfirmModal from '../components/finance/FinanceConfirmModal'
import FinanceShell from '../components/finance/FinanceShell'
import { PAYOUT_FREQUENCIES } from '../constants/financeLedger'
import { useFinanceData } from '../hooks/useFinanceData'
import notify from '../lib/notify'
import { getProfileDisplayName } from '../utils/profileUtils'

const FIELD = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:bg-slate-50'

export default function FinanceSettings() {
  const { settings, setSettings, canConfigure, commissionConfig, setCommissionConfig, setCommissionHistory, user } = useFinanceData()
  const [pending, setPending] = useState(null)
  const formKey = [
    settings.frequency,
    settings.minimumThreshold,
    settings.processingRule,
    commissionConfig.defaultRate,
    settings.paymentMethods.map((method) => method.enabled).join(''),
    Object.values(settings.methods).join(''),
  ].join('|')

  const save = async () => {
    if (!pending) return
    await new Promise((resolve) => { window.setTimeout(resolve, 500) })
    setSettings(pending.settings)
    if (!Number.isNaN(pending.defaultRate) && pending.defaultRate !== commissionConfig.defaultRate) {
      setCommissionConfig((current) => ({ ...current, defaultRate: pending.defaultRate }))
      setCommissionHistory((current) => [{
        id: `CH-${Date.now()}`,
        previousRate: commissionConfig.defaultRate,
        newRate: pending.defaultRate,
        appliedTo: 'Marketplace default',
        changedBy: getProfileDisplayName(user),
        at: new Date().toISOString(),
      }, ...current])
    }
    setPending(null)
    notify.success('Finance settings saved.')
  }

  return (
    <FinanceShell>
      <DashboardReveal index={2}>
        <form
          key={formKey}
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canConfigure) return
            const data = new FormData(event.currentTarget)
            setPending({
              defaultRate: Number(data.get('defaultRate')),
              settings: {
                frequency: String(data.get('frequency')),
                minimumThreshold: Number(data.get('minimumThreshold')),
                processingRule: String(data.get('processingRule') ?? ''),
                methods: {
                  'Mobile Money': data.get('method-Mobile Money') === 'on',
                  'Bank transfer': data.get('method-Bank transfer') === 'on',
                },
                paymentMethods: settings.paymentMethods.map((method) => ({
                  ...method,
                  enabled: data.get(`pay-${method.key}`) === 'on',
                })),
              },
            })
          }}
        >
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <h3 className="text-sm font-bold text-slate-900">Payout configuration</h3>
            <p className="mt-1 text-xs text-slate-500">How vendor money leaves the marketplace.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-slate-500">Payout frequency
                <select name="frequency" disabled={!canConfigure} defaultValue={settings.frequency} className={`${FIELD} mt-1`}>
                  {PAYOUT_FREQUENCIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-500">Minimum payout threshold (GHS)
                <input name="minimumThreshold" disabled={!canConfigure} type="number" min="0" defaultValue={settings.minimumThreshold} className={`${FIELD} mt-1`} />
              </label>
              <label className="md:col-span-2 text-xs font-semibold text-slate-500">Processing rules
                <textarea name="processingRule" disabled={!canConfigure} rows={3} defaultValue={settings.processingRule} className={`${FIELD} mt-1`} />
              </label>
            </div>
            <fieldset className="mt-4" disabled={!canConfigure}>
              <legend className="text-xs font-semibold text-slate-500">Supported payout methods</legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {Object.entries(settings.methods).map(([method, enabled]) => (
                  <label key={method} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" name={`method-${method}`} defaultChecked={enabled} />
                    {method}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <h3 className="text-sm font-bold text-slate-900">Commission settings</h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
              Vendor and category overrides are edited on the Commissions tab. The default rate can also be saved here. The final commission model still needs a decision with Courage and Eugene.
            </p>
            <label className="mt-4 block max-w-xs text-xs font-semibold text-slate-500">Default marketplace commission (%)
              <input name="defaultRate" disabled={!canConfigure} type="number" min="0" max="100" step="0.1" defaultValue={commissionConfig.defaultRate} className={`${FIELD} mt-1`} />
            </label>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <h3 className="text-sm font-bold text-slate-900">Payment settings</h3>
            <p className="mt-1 text-xs text-slate-500">Provider credentials stay on the server. This page only shows whether a method is enabled.</p>
            <ul className="mt-4 divide-y divide-slate-100">
              {settings.paymentMethods.map((method) => (
                <li key={method.key} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                    <p className="text-xs text-slate-500">
                      {method.provider} · {method.configured ? 'Provider account connected' : 'Not connected'}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input type="checkbox" name={`pay-${method.key}`} disabled={!canConfigure} defaultChecked={method.enabled} />
                    Enabled
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex items-center justify-between gap-3">
            {!canConfigure ? <p className="text-xs font-semibold text-amber-800">Your role cannot change finance settings.</p> : <span />}
            <button type="submit" disabled={!canConfigure} className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
              Save finance settings
            </button>
          </div>
        </form>
      </DashboardReveal>

      <FinanceConfirmModal
        open={Boolean(pending)}
        title="Save finance settings?"
        body="Payout rules, the default commission, and enabled payment methods will change for the marketplace."
        confirmLabel="Save settings"
        icon={Settings}
        onClose={() => setPending(null)}
        onConfirm={save}
      />
    </FinanceShell>
  )
}
