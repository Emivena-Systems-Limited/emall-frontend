import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { ArrowLeft, ArrowRight, MapPin, PackageOpen, ShieldCheck, Store, Truck } from 'lucide-react'
import Container from '../components/layout/Container'
import SiteLayout from '../components/layout/SiteLayout'
import ProductCard from '../components/shared/ProductCard'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { getStore, getStoreDeliveryEligibility, getStoreProducts } from '../services/storeService'
import {
  buildStoreDirectory,
  normalizeStoreProducts,
  normalizeStoreRecord,
  resolveShoppingLocationDetails,
  resolveStoreEligibility,
} from '../utils/storefront'

export default function StoreLandingPage() {
  const { storeId } = useParams()
  const user = useSelector((state) => state.auth.user)
  const { data: landingData, isPending: isLandingPending } = useLandingPageData()
  const location = resolveShoppingLocationDetails(user)
  const fallbackStores = useMemo(() => buildStoreDirectory(landingData), [landingData])
  const fallbackStore = fallbackStores.find((entry) => String(entry.id) === String(storeId))

  const storeQuery = useQuery({
    queryKey: ['store', storeId, location.region, location.city],
    queryFn: () => getStore(storeId, location),
    enabled: Boolean(storeId),
    staleTime: 60 * 1000,
    retry: 0,
  })
  const productsQuery = useQuery({
    queryKey: ['store-products', storeId, location.region, location.city],
    queryFn: () => getStoreProducts(storeId, location),
    enabled: Boolean(storeId),
    staleTime: 60 * 1000,
    retry: 0,
  })
  const eligibilityQuery = useQuery({
    queryKey: ['store-delivery-eligibility', storeId, location.region, location.city],
    queryFn: () => getStoreDeliveryEligibility(storeId, location),
    enabled: Boolean(storeId),
    staleTime: 60 * 1000,
    retry: 0,
  })

  const liveStore = useMemo(() => normalizeStoreRecord(storeQuery.data), [storeQuery.data])
  const liveProducts = useMemo(() => normalizeStoreProducts(productsQuery.data), [productsQuery.data])
  const store = liveStore ?? (storeQuery.isError ? fallbackStore : null)
  const products = productsQuery.isError ? (fallbackStore?.products ?? []) : liveProducts
  const eligibility = eligibilityQuery.data?.delivery_eligible
  const eligible = typeof eligibility === 'boolean'
    ? eligibility
    : store ? resolveStoreEligibility(store, location.city) : false
  const deliveryMessage = eligibilityQuery.data?.delivery_message || store?.deliveryMessage
  const isPending = !store && (storeQuery.isPending || isLandingPending)

  useEffect(() => { window.scrollTo(0, 0) }, [storeId])

  if (!isPending && !store) return <Navigate to="/stores" replace />
  if (!store) return <SiteLayout><div className="min-h-[60vh] animate-pulse bg-slate-100" /></SiteLayout>

  return (
    <SiteLayout><main className="min-h-[70vh] bg-slate-50/60 pb-12">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-950 via-auth-primary to-red-800 sm:h-64">{store.image ? <img src={store.image} alt="" className="size-full object-cover opacity-55" /> : <div className="absolute inset-0"><div className="absolute -right-10 -top-20 size-72 rounded-full border-[42px] border-white/10" /><div className="absolute bottom-5 left-1/4 size-36 rounded-full bg-white/5 blur-2xl" /></div>}<div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-slate-950/10" /></div>
      <Container className="relative -mt-20"><section className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.12)] sm:p-7">
        <Link to="/stores" className="inline-flex items-center gap-1.5 text-xs font-bold text-auth-primary sm:absolute sm:-top-9 sm:text-white"><ArrowLeft className="size-4" /> All stores</Link>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50"><Store className="size-6 text-auth-primary" /></span><div><h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">{store.name}</h1><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-4" />{store.city}{store.region ? `, ${store.region}` : ''}</p></div></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${eligible ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-auth-primary'}`}><Truck className="size-4" />{eligible ? `Delivers to ${location.city}` : `Not available in ${location.city}`}</span></div>
        {!eligible ? <div className="mt-5 flex gap-3 rounded-xl border border-red-100 bg-red-50/70 p-4 text-sm text-slate-700"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-auth-primary" /><p>{deliveryMessage || `You can browse this store, but its products cannot be added to your cart because it does not currently deliver to ${location.city}.`}</p></div> : null}
        {(storeQuery.isError || productsQuery.isError) && fallbackStore ? <p className="mt-4 text-xs text-slate-500">Some live store information is temporarily unavailable. Showing the latest cached marketplace content.</p> : null}
      </section>
      <section className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.15em] text-auth-primary">Storefront</p><h2 className="mt-1 text-2xl font-extrabold text-slate-950">Products from {store.name}</h2>{productsQuery.isPending && !products.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />)}</div> : products.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{products.map((product) => <ProductCard key={product.id} product={product} disabledReason={eligible ? '' : 'This store does not currently deliver to your location'} />)}</div> : <div className="relative mt-5 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-white to-amber-50/70 px-6 py-14 text-center shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:py-16"><div className="relative mx-auto flex max-w-xl flex-col items-center"><span className="flex size-20 items-center justify-center rounded-3xl border border-amber-200 bg-white text-auth-primary shadow-sm"><PackageOpen className="size-9" /></span><p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-auth-primary">New stock coming</p><h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">This store has no products yet</h3><p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">There are currently no items available from {store.name}. Check back soon or continue exploring the marketplace.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/" className="inline-flex items-center gap-2 rounded-full bg-auth-primary px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-auth-primary/90">Explore products <ArrowRight className="size-4" /></Link><Link to="/stores" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-auth-primary/30 hover:text-auth-primary">Back to stores</Link></div></div></div>}</section>
      </Container>
    </main></SiteLayout>
  )
}
