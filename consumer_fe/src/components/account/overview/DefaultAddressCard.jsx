import { Link } from 'react-router'
import { ChevronRight, ClipboardCheck, Loader2, MapPin } from 'lucide-react'
import { firstValue } from '../../../utils/accountProfile'

export default function DefaultAddressCard({ address, isLoading }) {
  const recipient = firstValue(
    address?.name,
    address?.full_name,
    [address?.first_name, address?.last_name].filter(Boolean).join(' '),
    'No recipient',
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Saved location</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Default address</h2>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-auth-primary">
          <MapPin className="size-5" />
        </span>
      </div>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-auth-primary" />
        </div>
      ) : address ? (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold capitalize text-auth-primary">
              {address.type || address.label || 'Home'}
            </span>
            <ClipboardCheck className="size-5 text-emerald-600" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-950">{recipient}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {firstValue(address.address_line_1, address.address, address.street_address, 'Street address not provided')}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Region</p>
              <p className="mt-1 font-semibold text-slate-800">{firstValue(address.region, '—')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">City</p>
              <p className="mt-1 font-semibold text-slate-800">
                {firstValue(address.city_or_town, address.city, address.town, '—')}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400">District</p>
              <p className="mt-1 font-semibold text-slate-800">{firstValue(address.district, '—')}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <MapPin className="size-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-700">No saved address yet</p>
          <p className="mt-1 text-xs text-slate-500">Add an address for faster checkout.</p>
        </div>
      )}

      <Link
        to="/account/addresses"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-auth-primary px-4 py-3 text-sm font-bold text-auth-primary transition-colors hover:bg-auth-primary hover:text-white"
      >
        Manage addresses
        <ChevronRight className="size-4" />
      </Link>
    </section>
  )
}
