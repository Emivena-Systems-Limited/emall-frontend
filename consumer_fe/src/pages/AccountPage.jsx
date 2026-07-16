import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Camera,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  Gift,
  Heart,
  House,
  Loader2,
  LogOut,
  MapPin,
  MessageSquareText,
  Package,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  TicketPercent,
  UserRound,
  X,
} from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import { getUserAddresses } from '../services/addressService'
import {
  deleteUserAvatar,
  deleteUserProfile,
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
} from '../services/profileService'
import { useLogoutMutation } from '../hooks/useAuthMutations'
import { logout, updateUser } from '../store/slices/authSlice'
import { persistor } from '../store/store'
import { clearAuthOtpSession } from '../utils/authOtpSession'
import { notify } from '../lib/notify'

const navigationItems = [
  { label: 'Profile Overview', icon: House, href: '/account' },
  { label: 'Orders', icon: Package, href: '/account/orders' },
  { label: 'Wishlist', icon: Heart, href: '/account/wishlist' },
  { label: 'Coupons & Offers', icon: TicketPercent, href: '/account/coupons' },
  { label: 'Reviews', icon: MessageSquareText, href: '/account/reviews' },
  { label: 'Returns & Refunds', icon: RotateCcw, href: '/account/returns' },
  { label: 'Followed Stores', icon: Store, href: '/account/stores' },
  { label: 'Addresses', icon: MapPin, href: '/account/addresses' },
  { label: 'Payment Methods', icon: CreditCard, href: '/account/payments' },
  { label: 'Account Settings', icon: Settings, href: '/account/settings' },
  { label: 'Notifications', icon: Bell, href: '/account/notifications' },
  { label: 'Help & Support', icon: CircleHelp, href: '/account/support' },
]

const statistics = [
  { label: 'Total Orders', value: '0', link: 'View all orders', href: '/account/orders', icon: ShoppingBag, tone: 'bg-red-50 text-auth-primary' },
  { label: 'Pending Deliveries', value: '0', link: 'Track orders', href: '/account/orders', icon: Package, tone: 'bg-amber-50 text-amber-700' },
  { label: 'Wishlist Items', value: '0', link: 'View wishlist', href: '/account/wishlist', icon: Heart, tone: 'bg-pink-50 text-pink-600' },
  { label: 'Available Coupons', value: '0', link: 'View coupons', href: '/account/coupons', icon: Gift, tone: 'bg-emerald-50 text-emerald-700' },
]

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim()) ?? ''
}

function getProfile(user) {
  const firstName = firstValue(user?.first_name, user?.firstName)
  const lastName = firstValue(user?.last_name, user?.lastName)
  const fullName = firstValue(user?.full_name, user?.name, [firstName, lastName].filter(Boolean).join(' '), 'Customer')

  return {
    fullName,
    email: firstValue(user?.email, 'Not provided'),
    phone: firstValue(user?.phone_number, user?.phone, 'Not provided'),
    joined: firstValue(user?.date_joined, user?.joined_at, user?.created_at),
    photo: firstValue(user?.profile_photo_url, user?.profile_picture, user?.avatar),
  }
}

function formatJoinedDate(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function getShippingAddresses(response) {
  if (Array.isArray(response?.shipping)) return response.shipping
  if (Array.isArray(response?.data?.shipping)) return response.data.shipping
  if (Array.isArray(response?.addresses)) return response.addresses.filter((item) => item?.type !== 'billing')
  if (Array.isArray(response)) return response.filter((item) => item?.type !== 'billing')
  return []
}

function Sidebar({ pathname, isLoggingOut, onLogout }) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-5 lg:self-start">
      <div className="border-b border-slate-100 px-5 py-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-auth-primary">Account centre</p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">Manage your account</h2>
      </div>
      <nav className="grid max-h-[34rem] gap-1 overflow-y-auto p-3 sm:grid-cols-2 lg:max-h-none lg:grid-cols-1" aria-label="Account navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = item.href === '/account' ? pathname === '/account' : pathname.startsWith(item.href)
          return (
            <Link key={item.label} to={item.href} className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${active ? 'bg-auth-primary text-white shadow-sm' : 'text-slate-600 hover:bg-red-50 hover:text-auth-primary'}`}>
              <Icon className="size-[1.1rem] shrink-0" strokeWidth={2} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <ChevronRight className={`size-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${active ? 'opacity-100' : 'opacity-35'}`} />
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <button type="button" onClick={onLogout} disabled={isLoggingOut} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
          {isLoggingOut ? <Loader2 className="size-[1.1rem] animate-spin" /> : <LogOut className="size-[1.1rem]" />}
          {isLoggingOut ? 'Logging out…' : 'Log Out'}
        </button>
      </div>
    </aside>
  )
}

function ProfileSummary({ profile, isUploading, onEdit, onUpload, onDeleteAvatar }) {
  const fileInputRef = useRef(null)
  const initials = profile.fullName.split(/\s+/).slice(0, 2).map((name) => name[0]).join('').toUpperCase()

  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    onUpload(file)
    event.target.value = ''
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#b92f23] via-auth-primary to-[#df5a43] p-5 text-white shadow-[0_18px_50px_rgba(199,59,45,0.2)] sm:p-7">
      <div className="absolute -right-16 -top-20 size-64 rounded-full border-[2rem] border-white/5" />
      <div className="absolute -bottom-24 right-24 size-52 rounded-full bg-white/5" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/25 bg-white/15 text-2xl font-bold shadow-lg sm:size-28">
              {profile.photo ? <img src={profile.photo} alt={profile.fullName} className="size-full object-cover" /> : initials}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Upload profile picture" className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full border-2 border-white bg-white text-auth-primary shadow-md transition-transform hover:scale-105">
              <Camera className="size-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/70">Welcome back</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{profile.fullName}</h1>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-white/80 sm:flex-row sm:gap-5">
              <span>{profile.email}</span>
              <span className="hidden sm:inline">•</span>
              <span>{profile.phone}</span>
            </div>
            <p className="mt-2 text-xs font-medium text-white/65">Customer since {formatJoinedDate(profile.joined)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-60">{isUploading ? 'Uploading…' : 'Upload photo'}</button>
          {profile.photo ? <button type="button" onClick={onDeleteAvatar} className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20">Remove photo</button> : null}
          <button type="button" onClick={onEdit} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-auth-primary shadow-sm transition-transform hover:-translate-y-0.5">Edit profile</button>
        </div>
      </div>
    </section>
  )
}

function StatisticCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statistics.map((item) => {
        const Icon = item.icon
        return (
          <article key={item.label} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-auth-primary/20 hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <span className={`flex size-11 items-center justify-center rounded-xl ${item.tone}`}><Icon className="size-5" /></span>
              <span className="text-3xl font-bold tracking-tight text-slate-950">{item.value}</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-600">{item.label}</h3>
            <Link to={item.href} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-auth-primary hover:underline">{item.link}<ChevronRight className="size-3.5" /></Link>
          </article>
        )
      })}
    </section>
  )
}

function VerificationBadge({ verified }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
      <ShieldCheck className="size-3.5" />{verified ? 'Verified' : 'Not verified'}
    </span>
  )
}

function AccountInformation({ profile, user, onDeleteProfile }) {
  const rows = [
    { label: 'Full name', value: profile.fullName },
    { label: 'Email address', value: profile.email, badge: <VerificationBadge verified={Boolean(user?.email_verified_at || user?.email_verified || user?.is_email_verified)} /> },
    { label: 'Phone number', value: profile.phone, badge: <VerificationBadge verified={Boolean(user?.phone_verified_at || user?.phone_verified || user?.is_phone_verified)} /> },
  ]
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Personal details</p><h2 className="mt-1 text-xl font-bold text-slate-950">Account information</h2></div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-auth-primary"><UserRound className="size-5" /></span>
      </div>
      <dl className="mt-2 divide-y divide-slate-100">
        {rows.map((row) => <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4"><dt className="text-sm font-medium text-slate-500">{row.label}</dt><dd className="min-w-0 break-words text-sm font-semibold text-slate-900">{row.value}</dd>{row.badge ? <dd>{row.badge}</dd> : <span />}</div>)}
      </dl>
      <p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">Email address and phone number are secured account identifiers and cannot be changed here.</p>
      <button type="button" onClick={onDeleteProfile} className="mt-4 text-xs font-bold text-red-600 underline-offset-4 hover:underline">Delete my account</button>
    </section>
  )
}

function EditProfileModal({ initialProfile, isSaving, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    first_name: firstValue(initialProfile?.first_name, initialProfile?.firstName),
    last_name: firstValue(initialProfile?.last_name, initialProfile?.lastName),
    email: firstValue(initialProfile?.email),
    phone_number: firstValue(initialProfile?.phone_number, initialProfile?.phone),
    region: firstValue(initialProfile?.region),
    district: firstValue(initialProfile?.district),
    city_or_town: firstValue(initialProfile?.city_or_town, initialProfile?.city, initialProfile?.town),
  }))

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(Object.fromEntries(Object.entries(form).map(([key, value]) => [key, String(value).trim()])))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Edit profile">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Account profile</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Edit profile</h2></div><button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><X className="size-4" /></button></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ['first_name', 'First name'], ['last_name', 'Last name'], ['email', 'Email address'], ['phone_number', 'Phone number'],
            ['region', 'Region'], ['district', 'District'], ['city_or_town', 'City or town'],
          ].map(([name, label]) => <label key={name} className={`grid gap-2 text-sm font-semibold text-slate-700 ${name === 'city_or_town' ? 'sm:col-span-2' : ''}`}><span>{label}</span><input value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="h-12 rounded-xl border border-slate-300 px-4 font-normal outline-none transition-colors focus:border-auth-primary focus:ring-2 focus:ring-red-100" /></label>)}
        </div>
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">Cancel</button><button type="submit" disabled={isSaving} className="rounded-xl bg-auth-primary px-6 py-3 text-sm font-bold text-white hover:bg-auth-primary-hover disabled:opacity-60">{isSaving ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </div>
  )
}

function DeleteProfileModal({ isDeleting, onClose, onConfirm }) {
  const [confirmation, setConfirmation] = useState('')
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Delete profile">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600"><LogOut className="size-5" /></div><h2 className="mt-4 text-xl font-bold text-slate-950">Delete your account?</h2><p className="mt-2 text-sm leading-6 text-slate-600">This action is permanent. Type <strong>DELETE</strong> to confirm.</p><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-4 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-red-500" placeholder="Type DELETE" /><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button><button type="button" onClick={onConfirm} disabled={confirmation !== 'DELETE' || isDeleting} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">{isDeleting ? 'Deleting…' : 'Delete account'}</button></div></div>
    </div>
  )
}

function DefaultAddress({ address, isLoading }) {
  const recipient = firstValue(address?.name, address?.full_name, [address?.first_name, address?.last_name].filter(Boolean).join(' '), 'No recipient')
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Saved location</p><h2 className="mt-1 text-xl font-bold text-slate-950">Default address</h2></div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-auth-primary"><MapPin className="size-5" /></span>
      </div>
      {isLoading ? <div className="flex min-h-48 items-center justify-center"><Loader2 className="size-6 animate-spin text-auth-primary" /></div> : address ? (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold capitalize text-auth-primary">{address.type || address.label || 'Home'}</span><ClipboardCheck className="size-5 text-emerald-600" /></div>
          <h3 className="mt-4 text-base font-bold text-slate-950">{recipient}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{firstValue(address.address_line_1, address.address, address.street_address, 'Street address not provided')}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm"><div><p className="text-xs text-slate-400">Region</p><p className="mt-1 font-semibold text-slate-800">{firstValue(address.region, '—')}</p></div><div><p className="text-xs text-slate-400">City</p><p className="mt-1 font-semibold text-slate-800">{firstValue(address.city_or_town, address.city, address.town, '—')}</p></div><div className="col-span-2"><p className="text-xs text-slate-400">District</p><p className="mt-1 font-semibold text-slate-800">{firstValue(address.district, '—')}</p></div></div>
        </div>
      ) : <div className="flex min-h-48 flex-col items-center justify-center text-center"><span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><MapPin className="size-5" /></span><p className="mt-3 text-sm font-semibold text-slate-700">No saved address yet</p><p className="mt-1 text-xs text-slate-500">Add an address for faster checkout.</p></div>}
      <Link to="/account/addresses" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-auth-primary px-4 py-3 text-sm font-bold text-auth-primary transition-colors hover:bg-auth-primary hover:text-white">Manage addresses<ChevronRight className="size-4" /></Link>
    </section>
  )
}

export default function AccountPage() {
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const logoutMutation = useLogoutMutation()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isDeletingProfile, setIsDeletingProfile] = useState(false)
  const profileQuery = useQuery({ queryKey: ['user-profile'], queryFn: getUserProfile, staleTime: 60_000, retry: 1 })
  const liveUser = useMemo(
    () => profileQuery.data && typeof profileQuery.data === 'object' ? { ...user, ...profileQuery.data } : user,
    [profileQuery.data, user],
  )
  const profile = useMemo(() => getProfile(liveUser), [liveUser])
  const addressesQuery = useQuery({ queryKey: ['user-addresses'], queryFn: getUserAddresses, staleTime: 60_000, retry: 1 })
  const shippingAddresses = useMemo(() => getShippingAddresses(addressesQuery.data), [addressesQuery.data])
  const defaultAddress = shippingAddresses.find((item) => item?.is_default || item?.isDefault) ?? shippingAddresses[0]

  useEffect(() => {
    if (profileQuery.data && typeof profileQuery.data === 'object') dispatch(updateUser(profileQuery.data))
  }, [dispatch, profileQuery.data])

  const refreshProfile = async (updatedProfile, message) => {
    if (updatedProfile && typeof updatedProfile === 'object') dispatch(updateUser(updatedProfile))
    await queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    notify.success(message)
  }

  const updateProfileMutation = useMutation({ mutationFn: updateUserProfile, onSuccess: async (data) => { await refreshProfile(data, 'Profile updated successfully'); setIsEditingProfile(false) }, onError: (error) => notify.fromError(error, 'Unable to update profile') })
  const uploadAvatarMutation = useMutation({ mutationFn: uploadUserAvatar, onSuccess: (data) => refreshProfile(data, 'Profile picture updated'), onError: (error) => notify.fromError(error, 'Unable to upload profile picture') })
  const deleteAvatarMutation = useMutation({ mutationFn: deleteUserAvatar, onSuccess: (data) => refreshProfile(data, 'Profile picture removed'), onError: (error) => notify.fromError(error, 'Unable to remove profile picture') })
  const deleteProfileMutation = useMutation({ mutationFn: deleteUserProfile, onSuccess: async () => { dispatch(logout()); clearAuthOtpSession(); await persistor.persist(); notify.success('Account deleted successfully'); navigate('/') }, onError: (error) => notify.fromError(error, 'Unable to delete account') })

  const handleLogout = async () => {
    try { await logoutMutation.mutateAsync({ email: user?.email }) } catch { /* Always clear the local session. */ } finally {
      dispatch(logout()); clearAuthOtpSession(); persistor.persist(); navigate('/'); notify.success('Logged out successfully')
    }
  }

  return (
    <SiteLayout>
      <section className="min-h-[70vh] bg-[#f7f8fa] py-6 sm:py-8 lg:py-10">
        <Container>
          <div className="mb-6"><p className="text-sm font-semibold text-auth-primary">My Account</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Account dashboard</h1><p className="mt-2 text-sm text-slate-500">Manage your profile, activity, addresses and preferences from one place.</p></div>
          <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
            <Sidebar pathname={location.pathname} isLoggingOut={logoutMutation.isPending} onLogout={handleLogout} />
            <div className="min-w-0 space-y-5">
              <ProfileSummary profile={profile} isUploading={uploadAvatarMutation.isPending} onEdit={() => setIsEditingProfile(true)} onUpload={(file) => uploadAvatarMutation.mutate(file)} onDeleteAvatar={() => deleteAvatarMutation.mutate()} />
              <StatisticCards />
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                <AccountInformation profile={profile} user={liveUser} onDeleteProfile={() => setIsDeletingProfile(true)} />
                <DefaultAddress address={defaultAddress} isLoading={addressesQuery.isLoading} />
              </div>
            </div>
          </div>
        </Container>
      </section>
      {isEditingProfile ? <EditProfileModal initialProfile={liveUser} isSaving={updateProfileMutation.isPending} onClose={() => setIsEditingProfile(false)} onSave={(payload) => updateProfileMutation.mutate(payload)} /> : null}
      {isDeletingProfile ? <DeleteProfileModal isDeleting={deleteProfileMutation.isPending} onClose={() => setIsDeletingProfile(false)} onConfirm={() => deleteProfileMutation.mutate()} /> : null}
    </SiteLayout>
  )
}
