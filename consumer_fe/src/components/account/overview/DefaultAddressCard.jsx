import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, CreditCard, Loader2, MapPin, Pencil, Plus, Truck } from 'lucide-react'
import { firstValue } from '../../../utils/accountProfile'
import { addressId } from '../../../utils/userAddressHelpers'

const PAGE_SIZE = 2

const tabPanelVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 20 : direction < 0 ? -20 : 0,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -20 : direction < 0 ? 20 : 0,
  }),
}

const tabPanelTransition = {
  duration: 0.24,
  ease: [0.4, 0, 0.2, 1],
}

const ADDRESS_TABS = [
  {
    key: 'shipping',
    label: 'Delivery',
    description: 'Where your orders are delivered',
    icon: Truck,
  },
  {
    key: 'billing',
    label: 'Billing',
    description: 'Used for receipts and payment records',
    icon: CreditCard,
  },
]

function formatAddressLocation(address) {
  return [
    firstValue(address?.city_or_town, address?.city, address?.town),
    firstValue(address?.region),
  ].filter(Boolean).join(', ')
}

function SavedAddressPreview({ address, onEdit }) {
  const recipient = firstValue(
    address?.name,
    address?.full_name,
    [address?.first_name, address?.last_name].filter(Boolean).join(' '),
    'Saved address',
  )
  const street = firstValue(address?.address_line_1, address?.address, address?.street_address)
  const location = formatAddressLocation(address)
  const phone = firstValue(address?.phone_number, address?.phone)
  const isDefault = Boolean(address?.is_default ?? address?.isDefault)
  const metaLine = [location, phone].filter(Boolean).join(' · ')

  return (
    <article className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex items-start justify-between gap-3 pr-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="truncate text-sm font-semibold text-slate-950">{recipient}</h4>
            {isDefault ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.625rem] font-bold uppercase text-emerald-700">
                <Check className="size-3" />
                Default
              </span>
            ) : null}
          </div>
          {street ? (
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-600">{street}</p>
          ) : null}
          {metaLine ? (
            <p className="mt-1 truncate text-xs text-slate-500">{metaLine}</p>
          ) : null}
        </div>
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={() => onEdit(address)}
          className="absolute right-2 top-2 rounded-md p-1.5 text-slate-500 transition hover:bg-white hover:text-auth-primary"
          aria-label={`Edit ${recipient}`}
        >
          <Pencil className="size-3.5" />
        </button>
      ) : null}
    </article>
  )
}

function AddressPagination({ page, pageCount, totalItems, onPageChange }) {
  if (totalItems <= PAGE_SIZE) return null

  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, totalItems)

  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p className="text-xs font-medium text-slate-500">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-auth-primary/30 hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous addresses"
        >
          <ChevronLeft className="size-3.5" />
          Prev
        </button>
        <span className="min-w-16 text-center text-xs font-semibold text-slate-600">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-auth-primary/30 hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next addresses"
        >
          Next
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

function AddressTabPanel({
  tab,
  addresses,
  page,
  onPageChange,
  onAddAddress,
  onEditAddress,
}) {
  const pageCount = Math.max(1, Math.ceil(addresses.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visibleAddresses = addresses.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const Icon = tab.icon

  return (
    <div
      role="tabpanel"
      id={`address-tab-panel-${tab.key}`}
      aria-labelledby={`address-tab-${tab.key}`}
      className="rounded-xl border border-slate-100 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-auth-primary">
            <Icon className="size-4" strokeWidth={1.9} aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-950">{tab.label} addresses</h3>
            <p className="mt-0.5 text-xs text-slate-500">{tab.description}</p>
          </div>
        </div>
        {onAddAddress ? (
          <button
            type="button"
            onClick={() => onAddAddress(tab.key)}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-auth-primary"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        ) : null}
      </div>

      <div className="mt-3">
        {addresses.length ? (
          <>
            <div className="space-y-2.5">
              {visibleAddresses.map((address) => (
                <SavedAddressPreview
                  key={addressId(address) ?? `${tab.key}-${address?.address_line_1 ?? address?.address ?? 'address'}`}
                  address={address}
                  onEdit={onEditAddress ? (item) => onEditAddress(item, tab.key) : undefined}
                />
              ))}
            </div>
            {addresses.length > PAGE_SIZE ? (
              <AddressPagination
                page={safePage}
                pageCount={pageCount}
                totalItems={addresses.length}
                onPageChange={onPageChange}
              />
            ) : null}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
            <div>
              <p className="text-xs font-semibold text-slate-700">No {tab.label.toLowerCase()} address saved</p>
              {onAddAddress ? (
                <button
                  type="button"
                  onClick={() => onAddAddress(tab.key)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-auth-primary px-3.5 py-2 text-xs font-bold text-white transition hover:bg-auth-primary-hover"
                >
                  <Plus className="size-3.5" />
                  Add {tab.label.toLowerCase()} address
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DefaultAddressCard({
  shippingAddresses = [],
  billingAddresses = [],
  isLoading,
  onAddAddress,
  onEditAddress,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('shipping')
  const [pages, setPages] = useState({ shipping: 1, billing: 1 })
  const [tabDirection, setTabDirection] = useState(0)

  const addressMap = useMemo(
    () => ({
      shipping: shippingAddresses,
      billing: billingAddresses,
    }),
    [shippingAddresses, billingAddresses],
  )

  const activeAddresses = addressMap[activeTab] ?? []
  const activeTabMeta = ADDRESS_TABS.find((tab) => tab.key === activeTab) ?? ADDRESS_TABS[0]
  const activePage = pages[activeTab] ?? 1
  const activePageCount = Math.max(1, Math.ceil(activeAddresses.length / PAGE_SIZE))

  useEffect(() => {
    setPages((current) => ({
      ...current,
      [activeTab]: Math.min(current[activeTab] ?? 1, activePageCount),
    }))
  }, [activeTab, activePageCount])

  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return

    const currentIndex = ADDRESS_TABS.findIndex((tab) => tab.key === activeTab)
    const nextIndex = ADDRESS_TABS.findIndex((tab) => tab.key === tabKey)
    setTabDirection(nextIndex > currentIndex ? 1 : -1)
    setActiveTab(tabKey)
  }

  const handlePageChange = (nextPage) => {
    setPages((current) => ({
      ...current,
      [activeTab]: Math.min(Math.max(nextPage, 1), activePageCount),
    }))
  }

  return (
    <section className={`flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6 ${className}`}>
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Saved locations</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Your addresses</h2>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-auth-primary">
          <MapPin className="size-5" />
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-auth-primary" />
        </div>
      ) : (
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <div
            className="relative flex gap-2 rounded-xl bg-slate-100 p-1"
            role="tablist"
            aria-label="Address type"
          >
            {ADDRESS_TABS.map((tab) => {
              const count = addressMap[tab.key]?.length ?? 0
              const isActive = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  id={`address-tab-${tab.key}`}
                  aria-selected={isActive}
                  aria-controls={`address-tab-panel-${tab.key}`}
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors duration-200 ${
                    isActive ? 'text-auth-primary' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="address-type-tab-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm ring-1 ring-slate-200/70"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <tab.icon className="size-3.5" aria-hidden />
                  {tab.label}
                  <motion.span
                    layout
                    className={`rounded-full px-1.5 py-px text-[0.625rem] ${
                      isActive ? 'bg-red-50 text-auth-primary' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </motion.span>
                </button>
              )
            })}
          </div>

          <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={tabDirection} initial={false}>
              <motion.div
                key={activeTab}
                custom={tabDirection}
                variants={tabPanelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={tabPanelTransition}
                className="h-full"
              >
                <AddressTabPanel
                  tab={activeTabMeta}
                  addresses={activeAddresses}
                  page={activePage}
                  onPageChange={handlePageChange}
                  onAddAddress={onAddAddress}
                  onEditAddress={onEditAddress}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      <Link
        to="/account/addresses"
        className="mt-auto flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-auth-primary px-4 py-3 pt-5 text-sm font-bold text-auth-primary transition-colors hover:bg-auth-primary hover:text-white"
      >
        Manage all addresses
        <ChevronRight className="size-4" />
      </Link>
    </section>
  )
}
