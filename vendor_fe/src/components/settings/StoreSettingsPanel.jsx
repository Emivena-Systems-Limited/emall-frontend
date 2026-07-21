import { useState } from 'react'
import { Building2, Palette, Save, Truck, FileText, Bell } from 'lucide-react'
import DevDataToggle from '../dev/DevDataToggle'
import { SETTINGS_TABS, GHANA_REGIONS } from '../../constants/storeSettings'
import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'

const TAB_ICONS = {
  general: Building2,
  branding: Palette,
  shipping: Truck,
  policies: FileText,
  notifications: Bell,
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-600">
      {children}
    </label>
  )
}

function TextInput({ id, value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
    />
  )
}

function TextArea({ id, value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
    />
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? 'bg-brand' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}

function GeneralSection({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FieldLabel htmlFor="storeName">Store name</FieldLabel>
        <TextInput id="storeName" value={data.storeName} onChange={(v) => set('storeName', v)} placeholder="Your store name" />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
        <TextInput id="tagline" value={data.tagline} onChange={(v) => set('tagline', v)} placeholder="A short description of your store" />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel htmlFor="description">About your store</FieldLabel>
        <TextArea id="description" value={data.description} onChange={(v) => set('description', v)} placeholder="Tell customers about your brand and products..." rows={4} />
      </div>
      <div>
        <FieldLabel htmlFor="email">Contact email</FieldLabel>
        <TextInput id="email" type="email" value={data.email} onChange={(v) => set('email', v)} placeholder="hello@yourstore.com" />
      </div>
      <div>
        <FieldLabel htmlFor="phone">Phone number</FieldLabel>
        <TextInput id="phone" value={data.phone} onChange={(v) => set('phone', v)} placeholder="+233 XX XXX XXXX" />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel htmlFor="address">Street address</FieldLabel>
        <TextInput id="address" value={data.address} onChange={(v) => set('address', v)} placeholder="Building, street, area" />
      </div>
      <div>
        <FieldLabel htmlFor="city">City</FieldLabel>
        <TextInput id="city" value={data.city} onChange={(v) => set('city', v)} placeholder="Accra" />
      </div>
      <div>
        <FieldLabel htmlFor="region">Region</FieldLabel>
        <select
          id="region"
          value={data.region}
          onChange={(e) => set('region', e.target.value)}
          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
        >
          <option value="">Select region</option>
          {GHANA_REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel htmlFor="businessHours">Business hours</FieldLabel>
        <TextInput id="businessHours" value={data.businessHours} onChange={(v) => set('businessHours', v)} placeholder="Mon–Sat 9:00 AM – 6:00 PM" />
      </div>
      <div>
        <FieldLabel htmlFor="website">Website (optional)</FieldLabel>
        <TextInput id="website" value={data.website} onChange={(v) => set('website', v)} placeholder="https://yourstore.com" />
      </div>
    </div>
  )
}

function BrandingSection({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="primaryColor">Primary colour</FieldLabel>
          <div className="flex gap-2">
            <input
              id="primaryColor"
              type="color"
              value={data.primaryColor}
              onChange={(e) => set('primaryColor', e.target.value)}
              className="size-11 cursor-pointer rounded-xl border border-slate-200"
            />
            <TextInput id="primaryColorHex" value={data.primaryColor} onChange={(v) => set('primaryColor', v)} placeholder="#c73b2d" />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="accentColor">Accent colour</FieldLabel>
          <div className="flex gap-2">
            <input
              id="accentColor"
              type="color"
              value={data.accentColor}
              onChange={(e) => set('accentColor', e.target.value)}
              className="size-11 cursor-pointer rounded-xl border border-slate-200"
            />
            <TextInput id="accentColorHex" value={data.accentColor} onChange={(v) => set('accentColor', v)} placeholder="#f97316" />
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-slate-200"
        style={{ background: `linear-gradient(135deg, ${data.primaryColor} 0%, ${data.accentColor} 100%)` }}
      >
        <div className="p-6 text-white">
          <p className="text-lg font-bold">Storefront preview</p>
          <p className="mt-1 text-sm text-white/80">Your brand colours applied to customer-facing elements</p>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Logo and banner uploads will be available when media storage is connected to your account.
      </p>
    </div>
  )
}

function ShippingSection({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })

  const toggleRegion = (region) => {
    const regions = data.deliveryRegions || []
    const next = regions.includes(region)
      ? regions.filter((r) => r !== region)
      : [...regions, region]
    set('deliveryRegions', next)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="standardFee">Standard delivery fee (GHS)</FieldLabel>
          <TextInput id="standardFee" value={data.standardFee} onChange={(v) => set('standardFee', v)} placeholder="25" />
        </div>
        <div>
          <FieldLabel htmlFor="expressFee">Express delivery fee (GHS)</FieldLabel>
          <TextInput id="expressFee" value={data.expressFee} onChange={(v) => set('expressFee', v)} placeholder="45" />
        </div>
        <div>
          <FieldLabel htmlFor="freeShippingThreshold">Free shipping above (GHS)</FieldLabel>
          <TextInput id="freeShippingThreshold" value={data.freeShippingThreshold} onChange={(v) => set('freeShippingThreshold', v)} placeholder="500" />
        </div>
        <div>
          <FieldLabel htmlFor="processingDays">Processing time (days)</FieldLabel>
          <TextInput id="processingDays" value={data.processingDays} onChange={(v) => set('processingDays', v)} placeholder="2" />
        </div>
      </div>

      <ToggleRow
        label="Store pickup available"
        description="Allow customers to collect orders from your location"
        checked={data.pickupAvailable}
        onChange={(v) => set('pickupAvailable', v)}
      />

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-600">Delivery regions</p>
        <div className="flex flex-wrap gap-2">
          {GHANA_REGIONS.map((region) => {
            const active = (data.deliveryRegions || []).includes(region)
            return (
              <button
                key={region}
                type="button"
                onClick={() => toggleRegion(region)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {region}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PoliciesSection({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })

  return (
    <div className="space-y-4">
      {[
        { key: 'returnPolicy', label: 'Return policy' },
        { key: 'shippingPolicy', label: 'Shipping policy' },
        { key: 'privacyPolicy', label: 'Privacy policy' },
        { key: 'termsOfService', label: 'Terms of service' },
      ].map(({ key, label }) => (
        <div key={key}>
          <FieldLabel htmlFor={key}>{label}</FieldLabel>
          <TextArea
            id={key}
            value={data[key]}
            onChange={(v) => set(key, v)}
            placeholder={`Enter your ${label.toLowerCase()}...`}
            rows={3}
          />
        </div>
      ))}
    </div>
  )
}

function NotificationsSection({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })

  return (
    <div className="space-y-2">
      <ToggleRow label="New order alerts" description="Email when a customer places an order" checked={data.newOrderEmail} onChange={(v) => set('newOrderEmail', v)} />
      <ToggleRow label="Low stock alerts" description="Email when products fall below threshold" checked={data.lowStockEmail} onChange={(v) => set('lowStockEmail', v)} />
      <ToggleRow label="New review alerts" description="Email when customers leave reviews" checked={data.newReviewEmail} onChange={(v) => set('newReviewEmail', v)} />
      <ToggleRow label="New message alerts" description="Email when customers send messages" checked={data.newMessageEmail} onChange={(v) => set('newMessageEmail', v)} />
      <ToggleRow label="Weekly performance report" description="Summary of sales, orders, and reviews" checked={data.weeklyReportEmail} onChange={(v) => set('weeklyReportEmail', v)} />
      <ToggleRow label="Platform updates" description="News and tips from the e-mall team" checked={data.marketingUpdates} onChange={(v) => set('marketingUpdates', v)} />
    </div>
  )
}

const SECTION_RENDERERS = {
  general: GeneralSection,
  branding: BrandingSection,
  shipping: ShippingSection,
  policies: PoliciesSection,
  notifications: NotificationsSection,
}

export default function StoreSettingsPageHeader({ configured, devDataEnabled, onDevDataChange }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Store Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure your storefront, shipping, policies, and notification preferences for customers.
        </p>
        {configured && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            Store configured
          </p>
        )}
      </div>
      <DevDataToggle
        enabled={devDataEnabled}
        onChange={onDevDataChange}
        ariaLabel="Toggle dummy store settings"
      />
    </div>
  )
}

export function StoreSettingsPanel({ settings, onChange, onSave, configured }) {
  const [activeTab, setActiveTab] = useState('general')
  const Section = SECTION_RENDERERS[activeTab]
  const tabMeta = SETTINGS_TABS[activeTab]
  const TabIcon = TAB_ICONS[activeTab]

  const updateSection = (section, data) => {
    onChange({ ...settings, [section]: data })
  }

  if (!configured) {
    const preset = EMPTY_STATE_PRESETS.storeSettings
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState icon={preset.icon} title={preset.title} description={preset.description} />
        <div className="border-t border-slate-100 px-5 py-4 text-center">
          <p className="text-xs text-slate-500">
            Enable dummy data to preview a configured store, or start filling in the General tab below once you add your store name.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col lg:flex-row">
        <nav className="border-b border-slate-100 lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
          {Object.entries(SETTINGS_TABS).map(([key, tab]) => {
            const Icon = TAB_ICONS[key]
            const active = activeTab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                  active ? 'bg-brand-light/50 text-brand' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="size-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
                <div>
                  <p className="text-sm font-semibold">{tab.label}</p>
                  <p className="text-[10px] text-slate-400">{tab.description}</p>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="min-w-0 flex-1 p-5 lg:p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <TabIcon className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">{tabMeta.label}</h2>
              <p className="text-xs text-slate-500">{tabMeta.description}</p>
            </div>
          </div>

          <Section
            data={settings[activeTab]}
            onChange={(data) => updateSection(activeTab, data)}
          />

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => onSave(activeTab)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800"
            >
              <Save className="size-4" />
              Save {tabMeta.label.toLowerCase()}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function StoreSettingsSetupForm({ settings, onChange, onSave }) {
  const [activeTab, setActiveTab] = useState('general')
  const Section = SECTION_RENDERERS[activeTab]
  const preset = EMPTY_STATE_PRESETS.storeSettings

  const updateSection = (section, data) => {
    onChange({ ...settings, [section]: data })
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-brand-light/30 px-5 py-6">
        <EmptyState
          icon={preset.icon}
          title={preset.title}
          description={preset.description}
          compact
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
        {Object.entries(SETTINGS_TABS).map(([key, tab]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 lg:p-6">
        <Section
          data={settings[activeTab]}
          onChange={(data) => updateSection(activeTab, data)}
        />
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => onSave(activeTab)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            <Save className="size-4" />
            Save changes
          </button>
        </div>
      </div>
    </section>
  )
}
