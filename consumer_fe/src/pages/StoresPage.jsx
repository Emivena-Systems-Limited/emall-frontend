import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { ArrowRight, ChevronDown, MapPin, Search, StoreIcon, Truck } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import { GHANA_LOCATIONS, getCityOptionsByRegion } from '../constants/ghanaLocations'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { getSavedDeliveryLocation, getStore, getStores, saveDeliveryLocation } from '../services/storeService'
import {
  buildStoreDirectory,
  normalizeStoreDirectory,
  resolveShoppingLocationDetails,
  resolveStoreEligibility,
  saveShoppingLocation,
} from '../utils/storefront'

function StoreCard({ store, location }) {
  const eligible = resolveStoreEligibility(store, location.city)
  return (
    <Link to={`/stores/${store.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-auth-primary/25 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-red-50 via-white to-amber-50">{store.image ? <img src={store.image} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex size-full items-center justify-center"><span className="flex size-20 items-center justify-center rounded-3xl border border-red-100 bg-white/85 text-auth-primary shadow-sm"><StoreIcon className="size-9" /></span></div>}<div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" /></div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-base font-bold text-slate-950 group-hover:text-auth-primary">{store.name}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="size-3.5" />{store.city}{store.region ? `, ${store.region}` : ''}</p></div><span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-hover:border-auth-primary group-hover:bg-auth-primary group-hover:text-white"><ArrowRight className="size-4" /></span></div>
        <span className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.68rem] font-bold ${eligible ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-auth-primary'}`}><Truck className="size-3.5" />{eligible ? 'Delivers to your location' : 'Not available in your location'}</span>
      </div>
    </Link>
  )
}

function EmptyStoresState({ location }) {
  return (
    <section className="relative mt-8 min-h-[430px] overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-br from-white via-white to-red-50/70 px-6 py-16 text-center shadow-[0_14px_44px_rgba(15,23,42,0.05)] sm:flex sm:min-h-[500px] sm:items-center sm:justify-center sm:py-20">
      <div className="absolute -bottom-32 -left-24 size-72 rounded-full bg-amber-100/50 blur-3xl" />
      <div className="absolute -right-28 -top-28 size-72 rounded-full bg-red-100/60 blur-3xl" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <span className="relative flex size-28 items-center justify-center rounded-[2rem] border border-red-100 bg-white text-auth-primary shadow-[0_16px_36px_rgba(153,40,31,0.1)]">
          <StoreIcon className="size-12" />
          <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-full bg-auth-primary text-xl font-medium text-white">+</span>
        </span>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.22em] text-auth-primary">More stores on the way</p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">No stores deliver to {location.city} yet</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">We’re expanding the EZ-Stores marketplace to more neighbourhoods. Choose another delivery location to explore available sellers, or check back soon for new stores near you.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-auth-primary px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(153,40,31,0.2)] transition hover:-translate-y-0.5 hover:bg-auth-primary/90">Continue shopping <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  )
}

function normalizeSavedLocation(data) {
  const location = data?.location ?? data
  if (!location?.city) return null
  return { region: location.region || 'Greater Accra', city: location.city }
}

export default function StoresPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { data: landingData, isPending: isLandingPending } = useLandingPageData()
  const initialLocation = useMemo(() => resolveShoppingLocationDetails(user), [user])
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false)
  const [query, setQuery] = useState('')

  const savedLocationQuery = useQuery({
    queryKey: ['delivery-location', user?.id],
    queryFn: getSavedDeliveryLocation,
    enabled: Boolean(isAuthenticated),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  })
  const savedLocation = normalizeSavedLocation(savedLocationQuery.data)
  const location = !hasSelectedLocation && savedLocation ? savedLocation : selectedLocation
  const storesQuery = useQuery({
    queryKey: ['stores', location.region, location.city],
    queryFn: () => getStores(location),
    staleTime: 60 * 1000,
    retry: 0,
  })
  const saveLocationMutation = useMutation({ mutationFn: saveDeliveryLocation })
  const liveStores = useMemo(() => normalizeStoreDirectory(storesQuery.data), [storesQuery.data])
  const storeDetailQueries = useQueries({
    queries: liveStores.map((store) => ({
      queryKey: ['store', store.id, location.region, location.city],
      queryFn: () => getStore(store.id, location),
      staleTime: 60 * 1000,
      retry: 0,
    })),
  })
  const enrichedLiveStores = liveStores.map((store, index) => {
    const detailedStore = normalizeStoreDirectory(storeDetailQueries[index]?.data)[0]
    return detailedStore ? { ...store, ...detailedStore } : store
  })
  const fallbackStores = useMemo(() => buildStoreDirectory(landingData), [landingData])
  const stores = storesQuery.isError ? fallbackStores : enrichedLiveStores
  const filteredStores = stores.filter((store) => store.name.toLowerCase().includes(query.trim().toLowerCase()))
  const selectedRegion = GHANA_LOCATIONS.find((region) => region.name === location.region) ?? GHANA_LOCATIONS[0]
  const cityOptions = getCityOptionsByRegion(selectedRegion.id)
  const citySelectOptions = cityOptions.some((option) => option.city === location.city)
    ? cityOptions
    : [{ value: location.city, label: location.city, city: location.city }, ...cityOptions]
  const isPending = storesQuery.isPending || (storesQuery.isError && isLandingPending)

  useEffect(() => { window.scrollTo(0, 0) }, [])
  useEffect(() => {
    if (savedLocation && !hasSelectedLocation) saveShoppingLocation(savedLocation)
  }, [hasSelectedLocation, savedLocation])

  const updateLocation = (nextLocation) => {
    setSelectedLocation(nextLocation)
    setHasSelectedLocation(true)
    saveShoppingLocation(nextLocation)
    if (isAuthenticated) saveLocationMutation.mutate(nextLocation)
  }

  const updateRegion = (regionName) => {
    const region = GHANA_LOCATIONS.find((entry) => entry.name === regionName) ?? GHANA_LOCATIONS[0]
    const firstCity = getCityOptionsByRegion(region.id)[0]?.city || region.name
    updateLocation({ region: region.name, city: firstCity })
  }

  const updateCity = (cityValue) => {
    updateLocation({ region: selectedRegion.name, city: cityValue })
  }

  return (
    <SiteLayout><main className="min-h-[70vh] bg-slate-50/60 py-8 sm:py-10"><Container>
      <section className="relative overflow-hidden rounded-3xl bg-auth-primary px-5 py-8 text-white shadow-[0_18px_50px_rgba(153,40,31,0.2)] sm:px-8 sm:py-10 lg:px-12">
        <div className="absolute -right-12 -top-16 size-56 rounded-full border-[34px] border-white/10" /><div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Marketplace directory</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Find stores that deliver to you</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Browse every seller on EZ-Stores and instantly see which stores serve your selected location.</p></div>
        <div className="relative mt-7 grid gap-3 rounded-2xl bg-white p-3 shadow-lg sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_14rem]">
          <label className="relative sm:col-span-2 lg:col-span-1"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stores" className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-auth-primary/40" /></label>
          <label className="relative"><MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-auth-primary" /><select value={selectedRegion.name} onChange={(event) => updateRegion(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-auth-primary/40">{GHANA_LOCATIONS.map((region) => <option key={region.id} value={region.name}>{region.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /></label>
          <label className="relative"><MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-auth-primary" /><select value={location.city} onChange={(event) => updateCity(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-auth-primary/40">{citySelectOptions.map((option) => <option key={option.value} value={option.city}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /></label>
        </div>
      </section>
      {isPending ? <section className="mt-8"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />)}</div></section> : !stores.length ? <EmptyStoresState location={location} /> : <section className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-auth-primary">All stores</p><h2 className="mt-1 text-2xl font-extrabold text-slate-950">Shop by store</h2></div><p className="text-xs text-slate-500">{filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'}</p></div>
        {storesQuery.isError && fallbackStores.length ? <p className="mt-4 rounded-xl border border-red-100 bg-red-50/70 px-4 py-3 text-xs text-slate-600">Live store information is temporarily unavailable. Showing the latest marketplace stores.</p> : null}
        {filteredStores.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredStores.map((store) => <StoreCard key={store.id} store={store} location={location} />)}</div> : <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 text-center"><Search className="size-8 text-auth-primary" /><h3 className="mt-3 font-bold text-slate-950">No matching stores</h3><p className="mt-1 text-sm text-slate-500">Try another store name or clear your search.</p><button type="button" onClick={() => setQuery('')} className="mt-5 rounded-full bg-auth-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-auth-primary/90">Clear search</button></div>}
      </section>}
    </Container></main></SiteLayout>
  )
}
