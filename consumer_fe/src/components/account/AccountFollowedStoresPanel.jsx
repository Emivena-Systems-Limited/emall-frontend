import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, ChevronLeft, ChevronRight, Grid2X2, List, MapPin, Search, Store, StoreIcon, UserMinus } from 'lucide-react'
import AccountSectionShell from './AccountSectionShell'
import { notify } from '../../lib/notify'
import { STORE_DIRECTORY_ENABLED } from '../../config/featureFlags'
import {
  getFollowedStores,
  unfollowStore,
} from '../../services/storeService'

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function normalizeStore(entry) {
  const record = asObject(entry) || {}
  const store = asObject(record.store) || asObject(record.vendor) || record
  const id = firstValue(store.id, store.store_id, store.vendor_id, record.store_id, record.vendor_id)
  if (!id) return null
  return {
    id: String(id),
    name: String(firstValue(store.name, store.store_name, store.business_name, record.store_name, 'Store')),
    image: firstValue(store.image, store.cover_image, store.store_image, store.store_logo, store.logo, record.image, ''),
    city: String(firstValue(store.city, store.city_or_town, record.city, '')),
    region: String(firstValue(store.region, record.region, '')),
    rating: Number(firstValue(store.rating, store.average_rating, record.rating, 0)) || 0,
    followedAt: firstValue(record.followed_at, record.created_at, record.pivot?.created_at, store.followed_at),
  }
}

function normalizeFollowedStores(payload) {
  const record = asObject(payload)
  const candidates = [
    payload,
    record?.items,
    record?.stores,
    record?.followed_stores,
    record?.data,
    asObject(record?.data)?.items,
    asObject(record?.data)?.stores,
    asObject(record?.data)?.data,
  ]
  const source = candidates.find(Array.isArray) || []
  const stores = source.map(normalizeStore).filter(Boolean)
  const meta = asObject(record?.meta) || asObject(record?.pagination) || asObject(record?.data) || record || {}
  return {
    stores,
    total: Number(firstValue(meta.total, meta.total_count, stores.length)) || stores.length,
    lastPage: Math.max(1, Number(firstValue(meta.last_page, meta.lastPage, meta.total_pages, 1)) || 1),
    currentPage: Math.max(1, Number(firstValue(meta.current_page, meta.currentPage, 1)) || 1),
  }
}

function FollowedStoreCard({ store, onUnfollow, viewMode }) {
  const listView = viewMode === 'list'
  const storeImage = <div className={`relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-amber-50 ${listView ? 'h-24 rounded-xl border border-slate-100' : 'aspect-[16/9]'}`}>
    {store.image ? <img src={store.image} alt="" className={`size-full transition duration-500 group-hover:scale-105 ${listView ? 'object-contain p-1' : 'object-cover'}`} /> : <div className="flex size-full items-center justify-center"><span className={`flex items-center justify-center border border-red-100 bg-white text-auth-primary shadow-sm ${listView ? 'size-14 rounded-2xl' : 'size-20 rounded-3xl'}`}><StoreIcon className={listView ? 'size-6' : 'size-9'} /></span></div>}
    <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-auth-primary shadow-sm backdrop-blur">Following</span>
  </div>
  return (
    <article className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-auth-primary/20 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)] ${listView ? 'sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center' : ''}`}>
      {STORE_DIRECTORY_ENABLED ? <Link to={`/stores/${store.id}`} className={listView ? 'block p-3 pr-0' : 'block'}>{storeImage}</Link> : <div className={listView ? 'p-3 pr-0' : ''}>{storeImage}</div>}
      <div className={`p-4 sm:p-5 ${listView ? 'flex min-w-0 flex-col justify-between sm:py-3 sm:pl-3 sm:pr-4' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">{STORE_DIRECTORY_ENABLED ? <Link to={`/stores/${store.id}`} className="block truncate text-base font-extrabold text-slate-950 hover:text-auth-primary">{store.name}</Link> : <p className="truncate text-base font-extrabold text-slate-950">{store.name}</p>}<p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="size-3.5" />{store.city || 'Location not provided'}{store.region ? `, ${store.region}` : ''}</p></div>
          {STORE_DIRECTORY_ENABLED ? <Link to={`/stores/${store.id}`} aria-label={`Visit ${store.name}`} className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-auth-primary hover:bg-auth-primary hover:text-white"><ArrowRight className="size-4" /></Link> : null}
        </div>
        <div className={`flex items-center justify-between border-t border-slate-100 ${listView ? 'mt-3 pt-3' : 'mt-5 pt-4'}`}><p className="text-xs text-slate-400">Followed {store.followedAt ? new Date(store.followedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}</p><button type="button" onClick={() => onUnfollow(store)} className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-auth-primary transition hover:border-auth-primary/30 hover:bg-red-100"><UserMinus className="size-3.5" />Unfollow</button></div>
      </div>
    </article>
  )
}

export default function AccountFollowedStoresPanel() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [page, setPage] = useState(1)
  const pageSize = 6
  const deferredQuery = useDeferredValue(query.trim())
  const [city = '', region = ''] = locationFilter === 'all'
    ? []
    : locationFilter.split(',').map((value) => value.trim())
  const followedStoresQuery = useQuery({
    queryKey: ['followed-stores', page, pageSize, deferredQuery, region, city],
    queryFn: () => getFollowedStores({ page, perPage: pageSize, search: deferredQuery, region, city }),
    placeholderData: (previousData) => previousData,
  })
  const normalized = useMemo(() => normalizeFollowedStores(followedStoresQuery.data), [followedStoresQuery.data])
  const stores = normalized.stores

  const locationOptions = useMemo(() => [...new Set(stores.map((store) => `${store.city}, ${store.region}`).filter((location) => location !== ', '))].sort(), [stores])
  const pageCount = normalized.lastPage
  const safePage = Math.min(normalized.currentPage || page, pageCount)
  const unfollowMutation = useMutation({
    mutationFn: (store) => unfollowStore(store.id),
    onSuccess: async (_data, store) => {
      await queryClient.invalidateQueries({ queryKey: ['followed-stores'] })
      await queryClient.invalidateQueries({ queryKey: ['store-follow-status', String(store.id)] })
      notify.success(`You unfollowed ${store.name}`)
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || error?.message || 'Unable to unfollow this store. Please try again.')
    },
  })

  const handleUnfollow = (store) => {
    if (!unfollowMutation.isPending) unfollowMutation.mutate(store)
  }

  return (
    <AccountSectionShell eyebrow="Your marketplace" title="Followed Stores" description="Keep up with the stores you love and return to their latest products anytime." icon={Store}>
      {followedStoresQuery.isPending ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-100" />)}</div> : followedStoresQuery.isError ? <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/40 px-6 text-center"><StoreIcon className="size-9 text-auth-primary" /><h3 className="mt-4 text-lg font-extrabold text-slate-950">We couldn’t load your followed stores</h3><p className="mt-2 text-sm text-slate-500">Please check your connection and try again.</p><button type="button" onClick={() => followedStoresQuery.refetch()} className="mt-5 rounded-full bg-auth-primary px-5 py-2.5 text-sm font-bold text-white">Try again</button></div> : stores.length ? <><div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50/80 to-white p-4"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-sm font-extrabold text-slate-950">{normalized.total} {normalized.total === 1 ? 'store' : 'stores'} followed</p><p className="mt-1 text-xs text-slate-500">Your favourite sellers, all in one place.</p></div><div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"><label className="relative min-w-0 sm:w-72"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search followed stores" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-auth-primary/40" /></label><select value={locationFilter} onChange={(event) => { setLocationFilter(event.target.value); setPage(1) }} aria-label="Filter by location" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-auth-primary/40"><option value="all">All locations</option>{locationOptions.map((location) => <option key={location} value={location}>{location}</option>)}</select><div className="inline-flex h-11 rounded-xl border border-slate-200 bg-white p-1" aria-label="Choose store view"><button type="button" onClick={() => setViewMode('grid')} aria-label="Grid view" aria-pressed={viewMode === 'grid'} className={`flex size-8 items-center justify-center rounded-lg transition ${viewMode === 'grid' ? 'bg-auth-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}><Grid2X2 className="size-4" /></button><button type="button" onClick={() => setViewMode('list')} aria-label="List view" aria-pressed={viewMode === 'list'} className={`flex size-8 items-center justify-center rounded-lg transition ${viewMode === 'list' ? 'bg-auth-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}><List className="size-4" /></button></div></div></div></div><div className={`mt-5 grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>{stores.map((store) => <FollowedStoreCard key={store.id} store={store} onUnfollow={handleUnfollow} viewMode={viewMode} />)}</div>{pageCount > 1 ? <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5"><p className="text-xs text-slate-500">Page {safePage} of {pageCount}</p><div className="flex gap-2"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1 || followedStoresQuery.isFetching} aria-label="Previous page" className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-auth-primary hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-4" /></button><button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={safePage === pageCount || followedStoresQuery.isFetching} aria-label="Next page" className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-auth-primary hover:text-auth-primary disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="size-4" /></button></div></div> : null}</> : deferredQuery || locationFilter !== 'all' ? <div className="mt-5 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center"><Search className="size-7 text-auth-primary" /><h3 className="mt-3 font-bold text-slate-950">No matching stores</h3><p className="mt-1 text-sm text-slate-500">Try another store name or location.</p><button type="button" onClick={() => { setQuery(''); setLocationFilter('all'); setPage(1) }} className="mt-4 text-sm font-bold text-auth-primary hover:underline">Clear filters</button></div> : <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-br from-white via-white to-red-50/70 px-6 py-14 text-center sm:flex sm:items-center sm:justify-center"><div className="absolute -bottom-24 -left-20 size-56 rounded-full bg-amber-100/40 blur-3xl" /><div className="relative mx-auto flex max-w-xl flex-col items-center"><span className="flex size-24 items-center justify-center rounded-3xl border border-red-100 bg-white text-auth-primary shadow-[0_14px_32px_rgba(153,40,31,0.1)]"><StoreIcon className="size-10" /></span><p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-auth-primary">Discover stores you love</p><h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">You aren’t following any stores yet</h3><p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">Follow a seller from any product page and it will appear here for quick access to its latest products.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-auth-primary px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-auth-primary/90">Continue shopping <ArrowRight className="size-4" /></Link></div></div>}
    </AccountSectionShell>
  )
}
